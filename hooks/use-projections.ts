'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ProjectionSettings {
  inflationRate: number
  salaryIncreaseRate: number
}

interface RecurringItem {
  id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  frequency: 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
}

interface ProjectionData {
  month: string
  monthLabel: string
  income: number
  expense: number
  net: number
  cumulative: number
}

interface UserSettingsData {
  inflation_rate: number
  salary_increase_rate: number
}

export function useUserSettings() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      const settingsData = data as UserSettingsData | null

      // Varsayılan değerler
      return {
        inflationRate: settingsData?.inflation_rate || 25, // %25 enflasyon
        salaryIncreaseRate: settingsData?.salary_increase_rate || 15, // %15 maaş artışı
      } as ProjectionSettings
    },
  })
}

export function useRecurringItems() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recurring-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_items')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data as RecurringItem[]
    },
  })
}

export function useFinancialProjection(months: number = 12) {
  const { data: settings } = useUserSettings()
  const { data: recurringItems } = useRecurringItems()
  const supabase = createClient()

  return useQuery({
    queryKey: ['financial-projection', months, settings, recurringItems],
    queryFn: async () => {
      // Mevcut varlıkları al
      const { data: assets } = await supabase
        .from('assets')
        .select('amount, currency')
        .eq('currency', 'TRY')

      const assetsData = assets as { amount: number; currency: string }[] | null
      const currentAssets = (assetsData || []).reduce(
        (sum, asset) => sum + Number(asset.amount),
        0
      )

      const projections: ProjectionData[] = []
      let cumulative = currentAssets
      const now = new Date()

      for (let i = 0; i < months; i++) {
        const projectionDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
        const monthStr = projectionDate.toISOString().slice(0, 7)
        const monthLabel = projectionDate.toLocaleDateString('tr-TR', {
          month: 'short',
          year: '2-digit',
        })

        // Yıllık enflasyon/artış oranını aylığa çevir
        const yearsPassed = i / 12
        const inflationMultiplier = Math.pow(
          1 + (settings?.inflationRate || 25) / 100,
          yearsPassed
        )
        const incomeMultiplier = Math.pow(
          1 + (settings?.salaryIncreaseRate || 15) / 100,
          yearsPassed
        )

        let monthlyIncome = 0
        let monthlyExpense = 0

        // Tekrarlayan gelirleri hesapla
        recurringItems?.forEach((item) => {
          const startDate = new Date(item.start_date)
          const endDate = item.end_date ? new Date(item.end_date) : null

          // Tarih kontrolü
          if (projectionDate < startDate) return
          if (endDate && projectionDate > endDate) return

          let amount = Number(item.amount)

          // Yıllık ise 12'ye böl
          if (item.frequency === 'yearly') {
            // Sadece başlangıç ayında ekle
            if (projectionDate.getMonth() !== startDate.getMonth()) return
            amount = amount
          }

          if (item.type === 'income') {
            // Gelire maaş artışı uygula
            monthlyIncome += amount * incomeMultiplier
          } else {
            // Gidere enflasyon uygula
            monthlyExpense += amount * inflationMultiplier
          }
        })

        const net = monthlyIncome - monthlyExpense
        cumulative += net

        projections.push({
          month: monthStr,
          monthLabel,
          income: Math.round(monthlyIncome),
          expense: Math.round(monthlyExpense),
          net: Math.round(net),
          cumulative: Math.round(cumulative),
        })
      }

      return {
        projections,
        currentAssets: Math.round(currentAssets),
        settings: settings || { inflationRate: 25, salaryIncreaseRate: 15 },
      }
    },
    enabled: !!settings,
  })
}
