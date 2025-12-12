'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PushSubscription } from '@/types'
import { toast } from 'sonner'

// Check if push notifications are supported
export function usePushSupport() {
  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window &&
    'Notification' in window

  return { isSupported }
}

// Get current push permission status
export function usePushPermission() {
  const permission = typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'default'

  return { permission }
}

// Subscribe to push notifications
export function useSubscribePush() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Bildirim izni reddedildi')
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID key not configured')
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      const subscriptionJson = subscription.toJSON()
      
      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await (supabase as any)
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
        }, {
          onConflict: 'user_id,endpoint'
        })

      if (error) throw error

      return subscription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-subscription'] })
      toast.success('Bildirimler etkinleştirildi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Unsubscribe from push notifications
export function useUnsubscribePush() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Remove from database
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-subscription'] })
      toast.success('Bildirimler devre dışı bırakıldı')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Check if user is subscribed
export function usePushSubscription() {
  return useQuery({
    queryKey: ['push-subscription'],
    queryFn: async () => {
      if (!('serviceWorker' in navigator)) return null
      
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      return subscription
    },
  })
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Send a test notification (for development)
export function useSendTestNotification() {
  return useMutation({
    mutationFn: async () => {
      if (Notification.permission !== 'granted') {
        throw new Error('Bildirim izni yok')
      }

      // Show a local notification for testing
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('MergenFlow Test', {
        body: 'Bildirimler düzgün çalışıyor! 🎉',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false,
      })
    },
    onSuccess: () => {
      toast.success('Test bildirimi gönderildi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
