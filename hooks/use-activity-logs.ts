'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface ActivityLog {
  id: string
  user_id: string
  action: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  page_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

interface ActiveUser {
  user_id: string
  ip_address: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  last_activity: string
}

// Parse user agent to get device info
function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  let deviceType = 'desktop'
  let browser = 'Unknown'
  let os = 'Unknown'

  // Device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile'
  }

  // Browser
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  // OS
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { deviceType, browser, os }
}

export function useLogActivity() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      action: string
      page_url?: string
      metadata?: Record<string, unknown>
    }) => {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      const { deviceType, browser, os } = parseUserAgent(userAgent)

      // IP ve lokasyon için external API çağrısı yapabiliriz ama basit tutuyoruz
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          action: input.action,
          user_agent: userAgent,
          device_type: deviceType,
          browser,
          os,
          page_url: input.page_url || (typeof window !== 'undefined' ? window.location.pathname : null),
          metadata: input.metadata,
        } as never)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
    },
  })
}

// Admin: Get all activity logs
export function useActivityLogs(userId?: string, limit: number = 100) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['activity-logs', userId, limit],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as ActivityLog[]
    },
  })
}

// Admin: Get active users (last 30 minutes)
export function useActiveUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['active-users'],
    queryFn: async () => {
      // Son 30 dakika içinde aktif olan kullanıcıları al
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('user_id, ip_address, device_type, browser, os, country, city, created_at')
        .gte('created_at', thirtyMinutesAgo)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Her kullanıcı için son aktiviteyi al
      const userMap = new Map<string, ActiveUser>()
      for (const log of data as ActivityLog[]) {
        if (!userMap.has(log.user_id)) {
          userMap.set(log.user_id, {
            user_id: log.user_id,
            ip_address: log.ip_address,
            device_type: log.device_type,
            browser: log.browser,
            os: log.os,
            country: log.country,
            city: log.city,
            last_activity: log.created_at,
          })
        }
      }

      return Array.from(userMap.values())
    },
    refetchInterval: 60000, // Her dakika güncelle
  })
}

// Auto-log page views
export function usePageViewLogger() {
  const logActivity = useLogActivity()

  useEffect(() => {
    // Sayfa yüklendiğinde log
    logActivity.mutate({ action: 'page_view' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// Get user's own activity logs
export function useMyActivityLogs(limit: number = 50) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['my-activity-logs', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as ActivityLog[]
    },
  })
}
