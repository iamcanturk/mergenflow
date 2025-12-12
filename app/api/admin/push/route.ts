import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
// You need to set these environment variables:
// NEXT_PUBLIC_VAPID_PUBLIC_KEY
// VAPID_PRIVATE_KEY
// VAPID_SUBJECT (e.g., mailto:your@email.com)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@mergenflow.com'

// Only configure VAPID if keys are provided and valid
let vapidConfigured = false
if (vapidPublicKey && vapidPrivateKey && vapidPrivateKey.length >= 32) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
    vapidConfigured = true
  } catch {
    console.warn('Failed to configure VAPID keys. Push notifications disabled.')
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get request body
    const { userIds, title, message, link } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No users specified' }, { status: 400 })
    }

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Get push subscriptions for selected users
    const { data: subscriptions, error: subError } = await (supabase as any)
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0, 
        message: 'No push subscriptions found for selected users' 
      })
    }

    // Check if VAPID keys are configured
    if (!vapidConfigured) {
      return NextResponse.json({ 
        success: false, 
        error: 'Push notifications not configured. Please set VAPID keys.' 
      }, { status: 500 })
    }

    // Send push notifications
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: link || '/dashboard/notifications',
      },
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        try {
          await webpush.sendNotification(pushSubscription, payload)
          return { success: true, userId: sub.user_id }
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            await (supabase as any)
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id)
          }
          return { success: false, userId: sub.user_id, error: error.message }
        }
      })
    )

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).success
    ).length

    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send push notifications' },
      { status: 500 }
    )
  }
}
