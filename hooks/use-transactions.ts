'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'

interface CreateTransactionInput {
  project_id?: string | null
  type: 'income' | 'expense'
  amount: number
  transaction_date: string
  is_paid?: boolean
  description?: string
}

interface UpdateTransactionInput {
  id: string
  project_id?: string | null
  type?: 'income' | 'expense'
  amount?: number
  transaction_date?: string
  is_paid?: boolean
  description?: string
}

export function useTransactions() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          project:projects(id, name)
        `)
        .order('transaction_date', { ascending: false })

      if (error) throw error
      return data as (Transaction & { project: { id: string; name: string } | null })[]
    },
  })
}

export function useProjectTransactions(projectId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions', 'project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('project_id', projectId)
        .order('transaction_date', { ascending: false })

      if (error) throw error
      return data as Transaction[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...input,
          is_paid: input.is_paid ?? false,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(input as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useToggleTransactionPaid() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_paid }: { id: string; is_paid: boolean }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({ is_paid } as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

// Aylık gelir/gider özeti
export function useMonthlyTransactionsSummary() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions', 'monthly-summary'],
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, is_paid')
        .gte('transaction_date', startOfMonth)
        .lte('transaction_date', endOfMonth)

      if (error) throw error

      const transactions = data as { type: string; amount: number; is_paid: boolean }[]

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const paidIncome = transactions
        .filter(t => t.type === 'income' && t.is_paid)
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const paidExpense = transactions
        .filter(t => t.type === 'expense' && t.is_paid)
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        totalIncome: income,
        paidIncome,
        unpaidIncome: income - paidIncome,
        totalExpense: expense,
        paidExpense,
        unpaidExpense: expense - paidExpense,
        netIncome: income - expense,
        netPaid: paidIncome - paidExpense,
      }
    },
  })
}
