'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useProjects } from '@/hooks/use-projects'
import { useAllTasks } from '@/hooks/use-tasks'
import { 
  useTimeEntries, 
  useActiveTimeEntry, 
  useStartTimeEntry, 
  useStopTimeEntry,
  useDeleteTimeEntry
} from '@/hooks/use-time-entries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Play, 
  Square, 
  Clock, 
  Timer,
  Calendar,
  Trash2,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInSeconds, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export default function TimeTrackingPage() {
  const { t, locale } = useTranslation()
  const dateLocale = locale === 'tr' ? tr : enUS
  
  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [isBillable, setIsBillable] = useState(true)
  const [hourlyRate, setHourlyRate] = useState<string>('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  
  const { data: projects } = useProjects()
  const { data: allTasks } = useAllTasks()
  const { data: timeEntries, isLoading } = useTimeEntries()
  const { data: activeEntry } = useActiveTimeEntry()
  const startTimer = useStartTimeEntry()
  const stopTimer = useStopTimeEntry()
  const deleteEntry = useDeleteTimeEntry()
  
  // Filter tasks by selected project
  const projectTasks = allTasks?.filter(task => task.project_id === selectedProjectId) || []

  // Live timer effect
  useEffect(() => {
    if (!activeEntry) {
      setElapsedSeconds(0)
      return
    }
    
    const calculateElapsed = () => {
      const start = new Date(activeEntry.start_time)
      return differenceInSeconds(new Date(), start)
    }
    
    setElapsedSeconds(calculateElapsed())
    
    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [activeEntry])

  // Calculate stats
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  const stats = {
    today: timeEntries?.filter(e => 
      format(new Date(e.start_time), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    ).reduce((acc, e) => acc + (e.duration_minutes || 0), 0) || 0,
    
    thisWeek: timeEntries?.filter(e => 
      isWithinInterval(new Date(e.start_time), { start: weekStart, end: weekEnd })
    ).reduce((acc, e) => acc + (e.duration_minutes || 0), 0) || 0,
    
    thisMonth: timeEntries?.filter(e => 
      isWithinInterval(new Date(e.start_time), { start: monthStart, end: monthEnd })
    ).reduce((acc, e) => acc + (e.duration_minutes || 0), 0) || 0,
    
    billableThisMonth: timeEntries?.filter(e => 
      e.is_billable && isWithinInterval(new Date(e.start_time), { start: monthStart, end: monthEnd })
    ).reduce((acc, e) => acc + (e.duration_minutes || 0), 0) || 0,
  }

  const handleStartTimer = () => {
    startTimer.mutate({
      project_id: selectedProjectId || null,
      task_id: selectedTaskId || null,
      description: description || null,
      is_billable: isBillable,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
    })
  }

  const handleStopTimer = () => {
    if (activeEntry) {
      stopTimer.mutate(activeEntry.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('timeTracking.title')}</h1>
        <p className="text-muted-foreground">{t('timeTracking.description') || 'Track time spent on projects and tasks'}</p>
      </div>

      {/* Timer Card */}
      <Card className={cn(activeEntry && "border-primary")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {activeEntry ? t('timeTracking.activeTimer') : t('timeTracking.startTimer')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Timer Display */}
          <AnimatePresence mode="wait">
            {activeEntry ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <motion.div 
                  className="text-5xl font-mono font-bold text-primary mb-4"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {formatDuration(elapsedSeconds)}
                </motion.div>
                {activeEntry.projects && (
                  <p className="text-muted-foreground">{activeEntry.projects.name}</p>
                )}
                {activeEntry.project_tasks && (
                  <Badge variant="outline" className="mt-2">{activeEntry.project_tasks.title}</Badge>
                )}
                <Button 
                  onClick={handleStopTimer} 
                  size="lg" 
                  variant="destructive"
                  className="mt-6"
                  disabled={stopTimer.isPending}
                >
                  <Square className="h-5 w-5 mr-2" />
                  {t('timeTracking.stopTimer')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('timeTracking.selectProject')}</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('timeTracking.selectProject')} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('timeTracking.selectTask')}</Label>
                    <Select 
                      value={selectedTaskId} 
                      onValueChange={setSelectedTaskId}
                      disabled={!selectedProjectId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('timeTracking.selectTask')} />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('timeTracking.description')}</Label>
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('timeTracking.description')}
                  />
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={isBillable} onCheckedChange={setIsBillable} />
                    <Label>{t('timeTracking.billable')}</Label>
                  </div>
                  
                  {isBillable && (
                    <div className="flex items-center gap-2">
                      <Label>{t('timeTracking.hourlyRate')}</Label>
                      <Input
                        type="number"
                        value={hourlyRate}
                        onChange={e => setHourlyRate(e.target.value)}
                        className="w-24"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleStartTimer} 
                  size="lg" 
                  className="w-full"
                  disabled={startTimer.isPending}
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t('timeTracking.startTimer')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('timeTracking.totalToday')}</CardDescription>
            <CardTitle className="text-2xl">{formatMinutesToHours(stats.today)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('timeTracking.thisWeek')}</CardDescription>
            <CardTitle className="text-2xl">{formatMinutesToHours(stats.thisWeek)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('timeTracking.thisMonth')}</CardDescription>
            <CardTitle className="text-2xl">{formatMinutesToHours(stats.thisMonth)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('timeTracking.billable')}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {formatMinutesToHours(stats.billableThisMonth)}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeTracking.entries')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : timeEntries && timeEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('timeTracking.description')}</TableHead>
                  <TableHead>{t('nav.projects')}</TableHead>
                  <TableHead>{t('timeTracking.duration')}</TableHead>
                  <TableHead>{t('timeTracking.billable')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.slice(0, 20).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.description || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.start_time), 'dd MMM yyyy HH:mm', { locale: dateLocale })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.projects?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {entry.duration_minutes 
                        ? formatMinutesToHours(entry.duration_minutes)
                        : <Badge variant="outline" className="animate-pulse">Active</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_billable ? 'default' : 'secondary'}>
                        {entry.is_billable ? t('timeTracking.billable') : t('timeTracking.nonBillable')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry.mutate(entry.id)}
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>{t('timeTracking.noEntries')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
