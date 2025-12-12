'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Asset } from '@/types'

interface CreateAssetInput {
  type: 'cash' | 'bank' | 'gold' | 'stock' | 'crypto'
  name: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
}

interface UpdateAssetInput {
  id: string
  type?: 'cash' | 'bank' | 'gold' | 'stock' | 'crypto'
  name?: string
  amount?: number
  currency?: 'TRY' | 'USD' | 'EUR'
}

export function useAssets() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data as Asset[]
    },
  })
}

export function useCreateAsset() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAssetInput) => {
      const { data, error } = await supabase
        .from('assets')
        .insert(input as never)
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useUpdateAsset() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAssetInput) => {
      const { data, error } = await supabase
        .from('assets')
        .update(input as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useDeleteAsset() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

// Varlık özeti - tür ve para birimi bazında grupla
export function useAssetsSummary() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['assets', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('type, amount, currency')

      if (error) throw error

      const assets = data as { type: string; amount: number; currency: string }[]

      // Para birimi bazında toplam
      const byCurrency: Record<string, number> = {}
      assets.forEach(asset => {
        const curr = asset.currency
        byCurrency[curr] = (byCurrency[curr] || 0) + Number(asset.amount)
      })

      // Tür bazında toplam (TRY olarak)
      const byType: Record<string, number> = {}
      assets.forEach(asset => {
        const type = asset.type
        // Şimdilik sadece TRY cinsinden topla
        if (asset.currency === 'TRY') {
          byType[type] = (byType[type] || 0) + Number(asset.amount)
        }
      })

      // Toplam varlık sayısı
      const totalCount = assets.length

      return {
        byCurrency,
        byType,
        totalCount,
        totalTRY: byCurrency['TRY'] || 0,
        totalUSD: byCurrency['USD'] || 0,
        totalEUR: byCurrency['EUR'] || 0,
      }
    },
  })
}
