'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Goal, GoalInsert, GoalUpdate } from '@/types'
import { toast } from 'sonner'

export function useGoals() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('goals' as any)
        .select('*')
        .order('end_date', { ascending: true })

      if (error) throw error
      return data as Goal[]
    },
  })
}

export function useActiveGoals() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals', 'active'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await (supabase as any)
        .from('goals' as any)
        .select('*')
        .gte('end_date', today)
        .eq('is_completed', false)
        .order('end_date', { ascending: true })

      if (error) throw error
      return data as Goal[]
    },
  })
}

export function useGoal(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('goals' as any)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Goal
    },
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goal: Omit<GoalInsert, 'user_id'>) => {
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { data, error } = await (supabase as any)
        .from('goals' as any)
        .insert({ ...goal, user_id: user.id } as any)
        .select()
        .single()

      if (error) throw error
      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Hedef oluşturuldu')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: GoalUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Hedef güncellendi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('goals' as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Hedef silindi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCompleteGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase as any)
        .from('goals' as any)
        .update({ is_completed: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Hedef tamamlandı! 🎉')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook to calculate goal progress from real data
export function useGoalProgress(goal: Goal) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goal-progress', goal.id, goal.type],
    queryFn: async () => {
      const startDate = goal.start_date
      const endDate = goal.end_date

      switch (goal.type) {
        case 'income': {
          const { data } = await (supabase as any)
            .from('transactions')
            .select('amount')
            .eq('type', 'income')
            .eq('is_paid', true)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
          
          const total = (data || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0)
          return { current: total, percentage: Math.min((total / goal.target_value) * 100, 100) }
        }
        case 'projects': {
          const { count } = await (supabase as any)
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lte('created_at', endDate)
          
          const current = count || 0
          return { current, percentage: Math.min((current / goal.target_value) * 100, 100) }
        }
        case 'clients': {
          const { count } = await (supabase as any)
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lte('created_at', endDate)
          
          const current = count || 0
          return { current, percentage: Math.min((current / goal.target_value) * 100, 100) }
        }
        case 'hours': {
          const { data } = await (supabase as any)
            .from('time_entries')
            .select('duration_minutes')
            .gte('start_time', startDate)
            .lte('start_time', endDate)
            .not('duration_minutes', 'is', null)
          
          const totalHours = ((data || []).reduce((acc: number, t: any) => acc + (t.duration_minutes || 0), 0)) / 60
          return { current: totalHours, percentage: Math.min((totalHours / goal.target_value) * 100, 100) }
        }
        case 'savings': {
          const { data } = await (supabase as any)
            .from('assets')
            .select('amount')
          
          const total = (data || []).reduce((acc: number, a: any) => acc + (a.amount || 0), 0)
          return { current: total, percentage: Math.min((total / goal.target_value) * 100, 100) }
        }
        default:
          return { current: goal.current_value, percentage: (goal.current_value / goal.target_value) * 100 }
      }
    },
    enabled: !!goal,
  })
}
