/// <reference lib="webworker" />

// Service Worker for MergenFlow Push Notifications

// Cache name
const CACHE_NAME = 'mergenflow-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received', event)

  if (!event.data) {
    console.log('Push event but no data')
    return
  }

  const data = event.data.json()

  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'default',
    data: {
      url: data.url || '/dashboard',
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MergenFlow', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event)

  event.notification.close()

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NOTIFICATION_CLICK', url })
          return
        }
      }
      // If no window is open, open a new one
      return self.clients.openWindow(url)
    })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event)
})

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message', event.data)
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
