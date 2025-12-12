'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from '@/hooks/use-notifications'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
  reminder: Clock,
}

const typeColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
  error: 'text-red-500',
  reminder: 'text-purple-500',
}

export function NotificationDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const clearAll = useClearAllNotifications()

  const handleNotificationClick = (notification: {
    id: string
    is_read: boolean
    link: string | null
  }) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
      setOpen(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p className="text-sm">Bildirim yok</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'group flex cursor-pointer gap-3 rounded-lg p-3 transition-colors hover:bg-muted',
                      !notification.is_read && 'bg-muted/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn('mt-0.5 shrink-0', typeColors[notification.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead.mutate(notification.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification.mutate(notification.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-destructive focus:text-destructive"
              onClick={() => clearAll.mutate()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Tüm Bildirimleri Temizle
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
