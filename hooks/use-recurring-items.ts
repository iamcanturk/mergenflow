'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface RecurringItemInput {
  name: string
  type: 'income' | 'expense'
  amount: number
  frequency: 'monthly' | 'yearly'
  start_date: string
  end_date?: string | null
}

interface UpdateRecurringItemInput extends RecurringItemInput {
  id: string
}

export function useCreateRecurringItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RecurringItemInput) => {
      const { data, error } = await supabase
        .from('recurring_items')
        .insert(input as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-items'] })
      queryClient.invalidateQueries({ queryKey: ['financial-projection'] })
    },
  })
}

export function useUpdateRecurringItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateRecurringItemInput) => {
      const { data, error } = await supabase
        .from('recurring_items')
        .update(input as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-items'] })
      queryClient.invalidateQueries({ queryKey: ['financial-projection'] })
    },
  })
}

export function useDeleteRecurringItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-items'] })
      queryClient.invalidateQueries({ queryKey: ['financial-projection'] })
    },
  })
}

export function useUpdateUserSettings() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { 
      inflationRate: number
      salaryIncreaseRate: number
      defaultCurrency?: 'TRY' | 'USD' | 'EUR'
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData: Record<string, any> = {
        inflation_rate: input.inflationRate,
        salary_increase_rate: input.salaryIncreaseRate,
      }
      
      if (input.defaultCurrency) {
        updateData.default_currency = input.defaultCurrency
      }

      const { error } = await (supabase as any)
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id)

      if (error) throw error
      return input
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      queryClient.invalidateQueries({ queryKey: ['financial-projection'] })
    },
  })
}
