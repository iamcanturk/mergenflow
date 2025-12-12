'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useTransactions } from '@/hooks/use-transactions'
import { useProjects } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'
import { useTimeEntries } from '@/hooks/use-time-entries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfQuarter, 
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO
} from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'

type DateRangeKey = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function ReportsPage() {
  const { t, locale } = useTranslation()
  const dateLocale = locale === 'tr' ? tr : enUS
  
  const [dateRange, setDateRange] = useState<DateRangeKey>('thisMonth')
  
  const { data: transactions } = useTransactions()
  const { data: projects } = useProjects()
  const { data: clients } = useClients()
  const { data: timeEntries } = useTimeEntries()

  // Calculate date range
  const getDateRange = (key: DateRangeKey) => {
    const today = new Date()
    switch (key) {
      case 'thisMonth':
        return { start: startOfMonth(today), end: endOfMonth(today) }
      case 'lastMonth':
        return { start: startOfMonth(subMonths(today, 1)), end: endOfMonth(subMonths(today, 1)) }
      case 'thisQuarter':
        return { start: startOfQuarter(today), end: endOfQuarter(today) }
      case 'thisYear':
        return { start: startOfYear(today), end: endOfYear(today) }
    }
  }

  const range = getDateRange(dateRange)

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions?.filter(t => {
      const date = parseISO(t.transaction_date)
      return isWithinInterval(date, { start: range.start, end: range.end })
    }) || []
  }, [transactions, range])

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
    
    return {
      income,
      expense,
      netProfit: income - expense,
      profitMargin: income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0,
    }
  }, [filteredTransactions])

  // Group by category for pie chart
  const categoryData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    
    filteredTransactions.forEach(t => {
      const category = t.description || (t.type === 'income' ? 'Gelir' : 'Gider')
      byCategory[category] = (byCategory[category] || 0) + t.amount
    })
    
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [filteredTransactions])

  // Monthly trend data
  const trendData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {}
    
    transactions?.forEach(t => {
      const month = format(parseISO(t.transaction_date), 'MMM yy', { locale: dateLocale })
      if (!months[month]) {
        months[month] = { month, income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        months[month].income += t.amount
      } else {
        months[month].expense += t.amount
      }
    })
    
    return Object.values(months).slice(-6)
  }, [transactions, dateLocale])

  // Project earnings
  const projectEarnings = useMemo(() => {
    const earnings: Record<string, { name: string; total: number }> = {}
    
    filteredTransactions
      .filter(t => t.type === 'income' && t.project_id)
      .forEach(t => {
        const project = projects?.find(p => p.id === t.project_id)
        if (project) {
          if (!earnings[project.id]) {
            earnings[project.id] = { name: project.name, total: 0 }
          }
          earnings[project.id].total += t.amount
        }
      })
    
    return Object.values(earnings)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [filteredTransactions, projects])

  // Time tracking stats
  const timeStats = useMemo(() => {
    const filtered = timeEntries?.filter(e => {
      const date = parseISO(e.start_time)
      return isWithinInterval(date, { start: range.start, end: range.end })
    }) || []
    
    const totalMinutes = filtered.reduce((acc, e) => acc + (e.duration_minutes || 0), 0)
    const billableMinutes = filtered.filter(e => e.is_billable).reduce((acc, e) => acc + (e.duration_minutes || 0), 0)
    
    return {
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(billableMinutes / 60 * 10) / 10,
      entries: filtered.length,
    }
  }, [timeEntries, range])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {format(range.start, 'dd MMM', { locale: dateLocale })} - {format(range.end, 'dd MMM yyyy', { locale: dateLocale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="lastMonth">{t('reports.lastMonth')}</SelectItem>
              <SelectItem value="thisQuarter">{t('reports.thisQuarter')}</SelectItem>
              <SelectItem value="thisYear">{t('reports.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t('reports.totalIncome')}
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{formatCurrency(totals.income)}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                {t('reports.totalExpense')}
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">{formatCurrency(totals.expense)}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('reports.netProfit')}
              </CardDescription>
              <CardTitle className={cn(
                "text-2xl",
                totals.netProfit >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(totals.netProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={totals.netProfit >= 0 ? "default" : "destructive"}>
                {totals.profitMargin}% margin
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('timeTracking.billable')}
              </CardDescription>
              <CardTitle className="text-2xl">{timeStats.billableHours}h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {timeStats.totalHours}h {t('reports.total') || 'total'} • {timeStats.entries} {t('timeTracking.entries')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('reports.trend')}
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {t('reports.byCategory')}
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('reports.byProject')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.trend')}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Son 6 aylık gelir-gider trendi' : 'Income vs expense trend for the last 6 months'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar dataKey="income" name={t('reports.totalIncome')} fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name={t('reports.totalExpense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.byCategory')}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Kategorilere göre dağılım' : 'Distribution by category'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.byProject')}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Projelere göre gelir' : 'Income by project'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectEarnings.length > 0 ? (
                <div className="space-y-4">
                  {projectEarnings.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(project.total)}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
