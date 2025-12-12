'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ProjectionSettings {
  inflationRate: number
  salaryIncreaseRate: number
  defaultCurrency?: 'TRY' | 'USD' | 'EUR'
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
  default_currency?: 'TRY' | 'USD' | 'EUR'
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

      // Default values
      return {
        inflationRate: settingsData?.inflation_rate || 25,
        salaryIncreaseRate: settingsData?.salary_increase_rate || 15,
        defaultCurrency: settingsData?.default_currency || 'TRY',
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

interface DebtAnalysis {
  totalDebt: number
  monthlyPayment: number
  debtFreeDate: Date | null
  monthsToPayoff: number | null
  debts: {
    name: string
    amount: number
    monthlyPayment: number
    endDate: Date | null
    monthsRemaining: number | null
  }[]
}

export function useDebtAnalysis() {
  const { data: recurringItems } = useRecurringItems()

  return useQuery({
    queryKey: ['debt-analysis', recurringItems],
    queryFn: async (): Promise<DebtAnalysis> => {
      const now = new Date()
      const debts: DebtAnalysis['debts'] = []
      let totalMonthlyPayment = 0
      let totalDebt = 0
      let latestEndDate: Date | null = null

      // Find all expenses with an end_date (these are debts/loans)
      recurringItems?.forEach((item) => {
        if (item.type === 'expense' && item.end_date) {
          const endDate = new Date(item.end_date)
          const startDate = new Date(item.start_date)
          
          // Only include active debts
          if (endDate > now) {
            const monthlyPayment = item.frequency === 'monthly' 
              ? Number(item.amount) 
              : Number(item.amount) / 12

            // Calculate months remaining
            const monthsRemaining = Math.ceil(
              (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
            )

            // Calculate remaining total debt (monthly payment * months remaining)
            const remainingDebt = monthlyPayment * monthsRemaining

            totalDebt += remainingDebt
            totalMonthlyPayment += monthlyPayment

            if (!latestEndDate || endDate > latestEndDate) {
              latestEndDate = endDate
            }

            debts.push({
              name: item.name,
              amount: Math.round(remainingDebt),
              monthlyPayment: Math.round(monthlyPayment),
              endDate,
              monthsRemaining,
            })
          }
        }
      })

      // Calculate months to payoff
      let monthsToPayoff: number | null = null
      if (latestEndDate !== null && totalMonthlyPayment > 0) {
        const endDateMs = (latestEndDate as Date).getTime()
        monthsToPayoff = Math.ceil(
          (endDateMs - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      }

      // Sort debts by end date
      debts.sort((a, b) => {
        if (!a.endDate) return 1
        if (!b.endDate) return -1
        return a.endDate.getTime() - b.endDate.getTime()
      })

      return {
        totalDebt: Math.round(totalDebt),
        monthlyPayment: Math.round(totalMonthlyPayment),
        debtFreeDate: latestEndDate,
        monthsToPayoff,
        debts,
      }
    },
    enabled: !!recurringItems,
  })
}
