'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder'
  is_read: boolean
  link: string | null
  created_at: string
}

interface NotificationRule {
  id: string
  user_id: string
  name: string
  rule_type: 'payment_due' | 'task_due' | 'project_deadline'
  days_before: number
  is_active: boolean
  created_at: string
}

export function useNotifications() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as Notification[]
    },
  })
}

export function useUnreadNotificationCount() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    },
    refetchInterval: 30000, // 30 saniyede bir kontrol
  })
}

export function useMarkNotificationAsRead() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as never)
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as never)
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteNotification() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useClearAllNotifications() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Notification Rules
export function useNotificationRules() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notification-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as NotificationRule[]
    },
  })
}

interface CreateRuleInput {
  name: string
  rule_type: 'payment_due' | 'task_due' | 'project_deadline'
  days_before: number
  is_active?: boolean
}

export function useCreateNotificationRule() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRuleInput) => {
      const { data, error } = await supabase
        .from('notification_rules')
        .insert(input as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
    },
  })
}

export function useUpdateNotificationRule() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateRuleInput & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_rules')
        .update(input as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
    },
  })
}

export function useDeleteNotificationRule() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_rules')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
    },
  })
}

export function useToggleNotificationRule() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('notification_rules')
        .update({ is_active } as never)
        .eq('id', id)

      if (error) throw error
      return { id, is_active }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
    },
  })
}

// Admin: Send notification to user
export function useSendNotification() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      user_id: string
      title: string
      message: string
      type?: 'info' | 'warning' | 'success' | 'error' | 'reminder'
      link?: string
    }) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: input.user_id,
          title: input.title,
          message: input.message,
          type: input.type || 'info',
          link: input.link,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
