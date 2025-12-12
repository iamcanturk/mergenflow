'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  FolderKanban, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  Receipt,
  PiggyBank,
  LineChart,
  Sparkles,
  Sun,
  Moon,
  Coffee
} from 'lucide-react'
import { 
  StaggerContainer, 
  StaggerItem, 
  SlideUp,
  staggerItem 
} from '@/components/animations'

// Quick action dialogs
import { ClientFormDialog } from '@/components/clients/client-form-dialog'
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'
import { TransactionFormDialog } from '@/components/transactions/transaction-form-dialog'
import { AssetFormDialog } from '@/components/assets/asset-form-dialog'

interface TransactionData {
  amount: number
  type: string
  is_paid: boolean
}

interface ProjectData {
  id: string
  name: string
  status: string
  deadline: string | null
  clients?: { company_name: string } | null
}

interface RecentTransaction {
  id: string
  type: string
  amount: number
  description: string | null
  transaction_date: string
  is_paid: boolean
}

function getGreeting(locale: string): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours()
  
  if (locale === 'tr') {
    if (hour >= 5 && hour < 12) return { text: 'Günaydın', icon: Coffee }
    if (hour >= 12 && hour < 18) return { text: 'İyi günler', icon: Sun }
    if (hour >= 18 && hour < 22) return { text: 'İyi akşamlar', icon: Moon }
    return { text: 'İyi geceler', icon: Moon }
  }
  
  if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: Coffee }
  if (hour >= 12 && hour < 18) return { text: 'Good afternoon', icon: Sun }
  if (hour >= 18 && hour < 22) return { text: 'Good evening', icon: Moon }
  return { text: 'Good night', icon: Moon }
}

export default function DashboardPage() {
  const supabase = createClient()
  const { t, locale } = useTranslation()
  const greeting = getGreeting(locale)
  const GreetingIcon = greeting.icon
  
  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [clientsResult, projectsResult, transactionsResult, recentProjects, recentTransactions] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount, type, is_paid'),
        supabase.from('projects').select('id, name, status, deadline, clients(company_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('id, type, amount, description, transaction_date, is_paid').order('transaction_date', { ascending: false }).limit(5),
      ])

      const transactions = (transactionsResult.data || []) as TransactionData[]
      const totalIncome = transactions
        .filter(t => t.type === 'income' && t.is_paid)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const pendingPayments = transactions
        .filter(t => t.type === 'income' && !t.is_paid)
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        userName: user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0],
        clientCount: clientsResult.count || 0,
        projectCount: projectsResult.count || 0,
        totalIncome,
        pendingPayments,
        recentProjects: (recentProjects.data || []) as ProjectData[],
        recentTransactions: (recentTransactions.data || []) as RecentTransaction[],
      }
    },
  })

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const quickActions = [
    { icon: Users, label: t('clients.addClient'), color: 'text-blue-500', onClick: () => setClientDialogOpen(true) },
    { icon: FolderKanban, label: t('projects.addProject'), color: 'text-purple-500', onClick: () => setProjectDialogOpen(true) },
    { icon: Receipt, label: t('transactions.addTransaction'), color: 'text-green-500', onClick: () => setTransactionDialogOpen(true) },
    { icon: PiggyBank, label: t('assets.addAsset'), color: 'text-amber-500', onClick: () => setAssetDialogOpen(true) },
  ]

  const stats = [
    { title: t('nav.clients'), value: dashboardData?.clientCount || 0, subtitle: t('dashboard.stats.totalClients'), icon: Users },
    { title: t('nav.projects'), value: dashboardData?.projectCount || 0, subtitle: t('dashboard.stats.activeProjects'), icon: FolderKanban },
    { title: t('dashboard.stats.totalIncome'), value: `₺${formatCurrency(dashboardData?.totalIncome || 0)}`, subtitle: t('dashboard.collected'), icon: TrendingUp, valueColor: 'text-green-600' },
    { title: t('dashboard.pendingPayments'), value: `₺${formatCurrency(dashboardData?.pendingPayments || 0)}`, subtitle: t('dashboard.pending'), icon: Clock, valueColor: 'text-amber-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header with Greeting */}
      <SlideUp>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          >
            <GreetingIcon className="h-8 w-8 text-amber-500" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold">
              {greeting.text}, {dashboardData?.userName}!
            </h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              {locale === 'tr' ? 'Bugün harika bir gün olacak' : 'Today is going to be a great day'}
            </p>
          </div>
        </div>
      </SlideUp>

      {/* Quick Actions */}
      <SlideUp delay={0.1}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <StaggerItem key={index}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-all"
                      onClick={action.onClick}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </CardContent>
        </Card>
      </SlideUp>

      {/* Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={index} variants={staggerItem}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className={`text-2xl font-bold ${stat.valueColor || ''}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </StaggerContainer>

      {/* Recent Items */}
      <div className="grid gap-4 md:grid-cols-2">
        <SlideUp delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('dashboard.recentProjects')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/projects">
                  {t('common.all')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentProjects && dashboardData.recentProjects.length > 0 ? (
                <StaggerContainer className="space-y-3">
                  {dashboardData.recentProjects.map((project, index) => (
                    <StaggerItem key={project.id}>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link 
                          href={`/dashboard/projects/${project.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/30 transition-all"
                        >
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.clients?.company_name || t('projects.noClient')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                              project.status === 'proposal' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {t(`projects.statuses.${project.status}`)}
                            </span>
                            {project.deadline && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(project.deadline)}
                              </p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FolderKanban className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('projects.noProjects')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setProjectDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('projects.addProject')}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </SlideUp>

        <SlideUp delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/transactions">
                  {t('common.all')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                <StaggerContainer className="space-y-3">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <StaggerItem key={transaction.id}>
                      <motion.div 
                        className="flex items-center justify-between p-3 rounded-lg border"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`p-2 rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : 'bg-red-100 dark:bg-red-900'
                            }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </motion.div>
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description || t(`transactions.${transaction.type}`)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.transaction_date)}
                              {!transaction.is_paid && (
                                <span className="ml-2 text-amber-600">• {t('dashboard.unpaid')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <motion.span 
                          className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}₺{formatCurrency(transaction.amount)}
                        </motion.span>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('transactions.noTransactions')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setTransactionDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('transactions.addTransaction')}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </SlideUp>
      </div>

      {/* Quick Link to Projections */}
      <SlideUp delay={0.4}>
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"
              animate={{ x: ['0%', '100%', '0%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <CardContent className="flex items-center justify-between py-6 relative">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 rounded-full bg-purple-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div>
                  <h3 className="font-semibold">{t('nav.projections')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.projectionsDescription')}</p>
                </div>
              </div>
              <Button asChild>
                <Link href="/dashboard/projections">
                  {t('dashboard.viewProjections')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </SlideUp>

      {/* Dialogs */}
      <ClientFormDialog 
        open={clientDialogOpen} 
        onOpenChange={setClientDialogOpen} 
      />
      <ProjectFormDialog 
        open={projectDialogOpen} 
        onOpenChange={setProjectDialogOpen} 
      />
      <TransactionFormDialog 
        open={transactionDialogOpen} 
        onOpenChange={setTransactionDialogOpen} 
      />
      <AssetFormDialog 
        open={assetDialogOpen} 
        onOpenChange={setAssetDialogOpen} 
      />
    </div>
  )
}
