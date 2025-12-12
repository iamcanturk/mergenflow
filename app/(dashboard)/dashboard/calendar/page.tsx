'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useProjects } from '@/hooks/use-projects'
import { useAllTasks } from '@/hooks/use-tasks'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  FolderKanban,
  CheckSquare,
  Banknote,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'project-deadline' | 'task-due' | 'payment-due'
  color: string
  link?: string
}

export default function CalendarPage() {
  const { t, locale } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { data: projects } = useProjects()
  const { data: tasks } = useAllTasks()
  const { data: transactions } = useTransactions()
  
  const dateLocale = locale === 'tr' ? tr : enUS

  // Generate calendar events from data
  const events = useMemo<CalendarEvent[]>(() => {
    const eventList: CalendarEvent[] = []
    
    // Project deadlines
    projects?.forEach(project => {
      if (project.deadline) {
        eventList.push({
          id: `project-${project.id}`,
          title: project.name,
          date: parseISO(project.deadline),
          type: 'project-deadline',
          color: 'bg-blue-500',
          link: `/dashboard/projects/${project.id}`,
        })
      }
    })
    
    // Task due dates
    tasks?.forEach(task => {
      if (task.due_date) {
        eventList.push({
          id: `task-${task.id}`,
          title: task.title,
          date: parseISO(task.due_date),
          type: 'task-due',
          color: task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500',
        })
      }
    })
    
    // Unpaid transactions (payment reminders)
    transactions?.forEach(transaction => {
      if (!transaction.is_paid && transaction.type === 'income') {
        eventList.push({
          id: `payment-${transaction.id}`,
          title: transaction.description || t('calendar.paymentDue'),
          date: parseISO(transaction.transaction_date),
          type: 'payment-due',
          color: 'bg-green-500',
        })
      }
    })
    
    return eventList
  }, [projects, tasks, transactions, t])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add padding days for proper grid alignment
    const startDay = monthStart.getDay()
    const paddingBefore = Array(startDay).fill(null)
    
    return [...paddingBefore, ...days]
  }, [currentDate])

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day))
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : []

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const weekDays = locale === 'tr' 
    ? ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">
            {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t('calendar.today')}
          </Button>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }
                
                const dayEvents = getEventsForDay(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                
                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 rounded-lg relative transition-colors",
                      "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                      isTodayDate && !isSelected && "bg-muted font-bold",
                      !isCurrentMonth && "opacity-40"
                    )}
                  >
                    <span className="text-sm">{format(day, 'd')}</span>
                    
                    {/* Event indicators */}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn("w-1.5 h-1.5 rounded-full", event.color)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate 
                ? format(selectedDate, 'dd MMMM yyyy', { locale: dateLocale })
                : t('calendar.today')
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {selectedDayEvents.length > 0 ? (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {selectedDayEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        "hover:bg-muted transition-colors cursor-pointer"
                      )}
                    >
                      <div className={cn("p-2 rounded-md text-white", event.color)}>
                        {event.type === 'project-deadline' && <FolderKanban className="h-4 w-4" />}
                        {event.type === 'task-due' && <CheckSquare className="h-4 w-4" />}
                        {event.type === 'payment-due' && <Banknote className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {event.type === 'project-deadline' && t('calendar.projectDeadline')}
                          {event.type === 'task-due' && t('calendar.taskDue')}
                          {event.type === 'payment-due' && t('calendar.paymentDue')}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>{t('calendar.noEvents')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">{t('calendar.projectDeadline')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">{t('calendar.taskDue')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">{t('calendar.paymentDue')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
