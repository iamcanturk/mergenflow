'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TimeEntry, TimeEntryInsert, TimeEntryUpdate } from '@/types'
import { toast } from 'sonner'

export function useTimeEntries(projectId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['time-entries', projectId],
    queryFn: async () => {
      let query = supabase
        .from('time_entries')
        .select('*, projects(name), project_tasks(title)')
        .order('start_time', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (TimeEntry & { projects: { name: string } | null; project_tasks: { title: string } | null })[]
    },
  })
}

export function useActiveTimeEntry() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['active-time-entry'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('time_entries')
        .select('*, projects(name), project_tasks(title)')
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data as (TimeEntry & { projects: { name: string } | null; project_tasks: { title: string } | null }) | null
    },
    refetchInterval: 1000, // Update every second for live timer
  })
}

export function useStartTimeEntry() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: Omit<TimeEntryInsert, 'user_id' | 'start_time' | 'end_time' | 'duration_minutes'>) => {
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      // Stop any active timer first
      await (supabase as any)
        .from('time_entries')
        .update({ 
          end_time: new Date().toISOString(),
        })
        .is('end_time', null)
        .eq('user_id', user.id)

      const { data, error } = await (supabase as any)
        .from('time_entries')
        .insert({ 
          ...entry, 
          user_id: user.id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data as TimeEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] })
      toast.success('Zamanlayıcı başlatıldı')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useStopTimeEntry() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const endTime = new Date()
      
      // Get the start time first
      const { data: entry } = await (supabase as any)
        .from('time_entries')
        .select('start_time')
        .eq('id', id)
        .single()

      if (!entry) throw new Error('Kayıt bulunamadı')

      const startTime = new Date(entry.start_time)
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

      const { data, error } = await (supabase as any)
        .from('time_entries')
        .update({ 
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TimeEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] })
      toast.success('Zamanlayıcı durduruldu')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateTimeEntry() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: Omit<TimeEntryInsert, 'user_id'>) => {
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      // Calculate duration if both times are provided
      let durationMinutes = entry.duration_minutes
      if (entry.start_time && entry.end_time && !durationMinutes) {
        const start = new Date(entry.start_time)
        const end = new Date(entry.end_time)
        durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
      }

      const { data, error } = await (supabase as any)
        .from('time_entries')
        .insert({ ...entry, user_id: user.id, duration_minutes: durationMinutes })
        .select()
        .single()

      if (error) throw error
      return data as TimeEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Zaman kaydı oluşturuldu')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTimeEntry() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TimeEntryUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TimeEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Zaman kaydı güncellendi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTimeEntry() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('time_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Zaman kaydı silindi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Helper to calculate total hours for a project
export function useProjectTimeStats(projectId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['project-time-stats', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('time_entries')
        .select('duration_minutes, is_billable, hourly_rate')
        .eq('project_id', projectId)
        .not('duration_minutes', 'is', null)

      if (error) throw error

      const entries = data || []
      const totalMinutes = entries.reduce((acc: number, entry: any) => acc + (entry.duration_minutes || 0), 0)
      const billableMinutes = entries.filter((e: any) => e.is_billable).reduce((acc: number, entry: any) => acc + (entry.duration_minutes || 0), 0)
      const totalEarnings = entries
        .filter((e: any) => e.is_billable && e.hourly_rate)
        .reduce((acc: number, entry: any) => acc + ((entry.duration_minutes || 0) / 60 * (entry.hourly_rate || 0)), 0)

      return {
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        billableHours: Math.round(billableMinutes / 60 * 10) / 10,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        entriesCount: entries.length,
      }
    },
    enabled: !!projectId,
  })
}
