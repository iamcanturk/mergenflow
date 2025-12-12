'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useActiveGoals, useGoals, useCreateGoal, useDeleteGoal, useCompleteGoal, useGoalProgress } from '@/hooks/use-goals'
import { Goal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Target, 
  Plus, 
  Trash2, 
  Trophy,
  TrendingUp,
  Users,
  FolderKanban,
  Clock,
  Wallet,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays, parseISO, addMonths, addWeeks, addQuarters, addYears } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'

const goalTypeIcons: Record<string, React.ReactNode> = {
  income: <TrendingUp className="h-5 w-5" />,
  projects: <FolderKanban className="h-5 w-5" />,
  clients: <Users className="h-5 w-5" />,
  hours: <Clock className="h-5 w-5" />,
  savings: <Wallet className="h-5 w-5" />,
}

const goalTypeColors: Record<string, string> = {
  income: 'bg-green-500',
  projects: 'bg-blue-500',
  clients: 'bg-purple-500',
  hours: 'bg-orange-500',
  savings: 'bg-yellow-500',
}

function GoalCard({ goal }: { goal: Goal }) {
  const { t, locale } = useTranslation()
  const dateLocale = locale === 'tr' ? tr : enUS
  const deleteGoal = useDeleteGoal()
  const completeGoal = useCompleteGoal()
  const { data: progress } = useGoalProgress(goal)
  
  const daysLeft = differenceInDays(parseISO(goal.end_date), new Date())
  const percentage = progress?.percentage || 0
  const currentValue = progress?.current || goal.current_value

  const formatValue = (value: number, type: string) => {
    if (type === 'income' || type === 'savings') {
      return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
      }).format(value)
    }
    if (type === 'hours') {
      return `${value}h`
    }
    return value.toString()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={cn(
        "relative overflow-hidden",
        goal.is_completed && "opacity-60"
      )}>
        {percentage >= 100 && !goal.is_completed && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" />
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg text-white",
                goalTypeColors[goal.type]
              )}>
                {goalTypeIcons[goal.type]}
              </div>
              <div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription>
                  {t(`goals.types.${goal.type}`)} • {t(`goals.periods.${goal.period}`)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {percentage >= 100 && !goal.is_completed && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-green-600"
                  onClick={() => completeGoal.mutate(goal.id)}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => deleteGoal.mutate(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('goals.current')}: {formatValue(currentValue, goal.type)}</span>
              <span>{t('goals.target')}: {formatValue(goal.target_value, goal.type)}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(0)}%</span>
              {goal.is_completed ? (
                <Badge variant="default" className="bg-green-500">
                  <Trophy className="h-3 w-3 mr-1" />
                  {t('goals.completed')}
                </Badge>
              ) : daysLeft > 0 ? (
                <span>{daysLeft} {t('goals.daysLeft')}</span>
              ) : (
                <Badge variant="destructive">
                  {locale === 'tr' ? 'Süre doldu' : 'Expired'}
                </Badge>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(parseISO(goal.start_date), 'dd MMM', { locale: dateLocale })} - {format(parseISO(goal.end_date), 'dd MMM yyyy', { locale: dateLocale })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function GoalsPage() {
  const { t, locale } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  
  const { data: activeGoals, isLoading: loadingActive } = useActiveGoals()
  const { data: allGoals, isLoading: loadingAll } = useGoals()
  const createGoal = useCreateGoal()

  // Form state
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Goal['type']>('income')
  const [targetValue, setTargetValue] = useState('')
  const [period, setPeriod] = useState<Goal['period']>('monthly')

  const completedGoals = allGoals?.filter(g => g.is_completed) || []
  const displayGoals = showCompleted ? completedGoals : activeGoals

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const today = new Date()
    let endDate: Date
    
    switch (period) {
      case 'weekly':
        endDate = addWeeks(today, 1)
        break
      case 'monthly':
        endDate = addMonths(today, 1)
        break
      case 'quarterly':
        endDate = addQuarters(today, 1)
        break
      case 'yearly':
        endDate = addYears(today, 1)
        break
    }

    createGoal.mutate({
      title,
      type,
      target_value: parseFloat(targetValue),
      current_value: 0,
      period,
      start_date: format(today, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      is_completed: false,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false)
        setTitle('')
        setTargetValue('')
      }
    })
  }

  const isLoading = loadingActive || loadingAll

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            {t('goals.title')}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'tr' ? 'Hedeflerinizi belirleyin ve takip edin' : 'Set and track your goals'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showCompleted ? "default" : "outline"}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            {t('goals.completedGoals')} ({completedGoals.length})
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('goals.createGoal')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('goals.createGoal')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{locale === 'tr' ? 'Hedef Başlığı' : 'Goal Title'}</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={locale === 'tr' ? 'Örn: Aylık 50.000₺ gelir' : 'E.g: Monthly $5,000 income'}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{locale === 'tr' ? 'Hedef Türü' : 'Goal Type'}</Label>
                    <Select value={type} onValueChange={(v) => setType(v as Goal['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">{t('goals.types.income')}</SelectItem>
                        <SelectItem value="projects">{t('goals.types.projects')}</SelectItem>
                        <SelectItem value="clients">{t('goals.types.clients')}</SelectItem>
                        <SelectItem value="hours">{t('goals.types.hours')}</SelectItem>
                        <SelectItem value="savings">{t('goals.types.savings')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{locale === 'tr' ? 'Dönem' : 'Period'}</Label>
                    <Select value={period} onValueChange={(v) => setPeriod(v as Goal['period'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">{t('goals.periods.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('goals.periods.monthly')}</SelectItem>
                        <SelectItem value="quarterly">{t('goals.periods.quarterly')}</SelectItem>
                        <SelectItem value="yearly">{t('goals.periods.yearly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('goals.target')}</Label>
                  <Input
                    type="number"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    placeholder={type === 'income' || type === 'savings' ? '50000' : '10'}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {type === 'income' && (locale === 'tr' ? 'TL cinsinden hedef gelir' : 'Target income in currency')}
                    {type === 'projects' && (locale === 'tr' ? 'Tamamlanacak proje sayısı' : 'Number of projects to complete')}
                    {type === 'clients' && (locale === 'tr' ? 'Kazanılacak müşteri sayısı' : 'Number of clients to acquire')}
                    {type === 'hours' && (locale === 'tr' ? 'Çalışılacak saat sayısı' : 'Hours to work')}
                    {type === 'savings' && (locale === 'tr' ? 'Biriktirilecek toplam miktar' : 'Total amount to save')}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={createGoal.isPending}>
                  {createGoal.isPending ? t('common.loading') : t('goals.createGoal')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-[200px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : displayGoals && displayGoals.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">
              {showCompleted ? (locale === 'tr' ? 'Henüz tamamlanan hedef yok' : 'No completed goals yet') : t('goals.noGoals')}
            </p>
            {!showCompleted && (
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('goals.createGoal')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motivation Card */}
      {activeGoals && activeGoals.some(g => {
        const progress = (g.current_value / g.target_value) * 100
        return progress >= 100
      }) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="py-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold">{t('goals.congratulations')}</h3>
              <p className="opacity-90 mt-1">
                {locale === 'tr' ? 'Hedeflerinizden birini veya daha fazlasını tamamladınız!' : 'You\'ve completed one or more of your goals!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
