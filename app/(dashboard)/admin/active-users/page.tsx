import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ActivityLog {
  user_id: string
  ip_address: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  created_at: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

export default async function AdminActiveUsersPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Son 30 dakika içinde aktif kullanıcılar
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: logs } = await supabase
    .from('user_activity_logs')
    .select(`
      user_id,
      ip_address,
      device_type,
      browser,
      os,
      country,
      city,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .gte('created_at', thirtyMinutesAgo)
    .order('created_at', { ascending: false })

  // Her kullanıcı için son aktiviteyi al
  const userMap = new Map<string, ActivityLog>()
  for (const log of (logs || []) as ActivityLog[]) {
    if (!userMap.has(log.user_id)) {
      userMap.set(log.user_id, log)
    }
  }
  const activeUsers = Array.from(userMap.values())

  // Son 24 saat aktivite özeti
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: dailyActiveCount } = await supabase
    .from('user_activity_logs')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', oneDayAgo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Aktif Kullanıcılar</h1>
            <p className="text-muted-foreground">
              Son 30 dakika içinde aktif olan kullanıcılar
            </p>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şu An Aktif</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
            <p className="text-xs text-muted-foreground">Son 30 dakika</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Aktif</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyActiveCount || 0}</div>
            <p className="text-xs text-muted-foreground">Son 24 saat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cihaz Dağılımı</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary">
                Desktop: {activeUsers.filter((u) => u.device_type === 'desktop').length}
              </Badge>
              <Badge variant="secondary">
                Mobile: {activeUsers.filter((u) => u.device_type === 'mobile').length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktif Kullanıcılar Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Oturumlar</CardTitle>
          <CardDescription>Şu anda çevrimiçi olan kullanıcılar</CardDescription>
        </CardHeader>
        <CardContent>
          {activeUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Globe className="mb-2 h-8 w-8" />
              <p>Şu anda aktif kullanıcı yok</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Cihaz</TableHead>
                  <TableHead>Tarayıcı / İS</TableHead>
                  <TableHead>IP Adresi</TableHead>
                  <TableHead>Lokasyon</TableHead>
                  <TableHead>Son Aktivite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => {
                  const DeviceIcon = deviceIcons[user.device_type || 'desktop'] || Monitor
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.profiles?.full_name || 'İsimsiz'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-4 w-4" />
                          <span className="capitalize">{user.device_type || 'Bilinmiyor'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{user.browser || 'Bilinmiyor'}</p>
                          <p className="text-xs text-muted-foreground">{user.os || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{user.ip_address || '-'}</code>
                      </TableCell>
                      <TableCell>
                        {user.city && user.country
                          ? `${user.city}, ${user.country}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          {formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
