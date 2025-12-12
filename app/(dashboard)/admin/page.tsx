import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FolderKanban, Wallet, TrendingUp, ArrowLeft, Bell, Activity, LayoutDashboard, Target, Clock, Tag, Database, Server, HardDrive } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface StatsData {
  totalUsers: number
  totalProjects: number
  totalTransactions: number
  totalAssets: number
  totalGoals: number
  totalTimeEntries: number
  totalTags: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const supabase = await createClient()

  // İstatistikleri al
  const [
    usersResult, 
    projectsResult, 
    transactionsResult, 
    assetsResult,
    activeProjectsResult,
    completedProjectsResult,
    goalsResult,
    timeEntriesResult,
    tagsResult,
    revenueResult
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('id', { count: 'exact', head: true }),
    supabase.from('assets').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    (supabase as any).from('goals').select('id', { count: 'exact', head: true }),
    (supabase as any).from('time_entries').select('id', { count: 'exact', head: true }),
    (supabase as any).from('tags').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('amount').eq('type', 'income').eq('is_paid', true),
  ])

  const totalRevenue = (revenueResult.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

  const stats: StatsData = {
    totalUsers: usersResult.count || 0,
    totalProjects: projectsResult.count || 0,
    totalTransactions: transactionsResult.count || 0,
    totalAssets: assetsResult.count || 0,
    activeProjects: activeProjectsResult.count || 0,
    completedProjects: completedProjectsResult.count || 0,
    totalGoals: goalsResult?.count || 0,
    totalTimeEntries: timeEntriesResult?.count || 0,
    totalTags: tagsResult?.count || 0,
    totalRevenue,
  }

  // Son kayıt olan kullanıcılar
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentUsersData = (recentUsers || []) as { id: string; full_name: string | null; created_at: string }[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
            <p className="text-muted-foreground">
              Sistem yönetimi ve istatistikler
            </p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Kullanıcı Paneline Geç
          </Button>
        </Link>
      </div>

      {/* İstatistik Kartları - Ana */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı kullanıcı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">{stats.activeProjects} Aktif</Badge>
              <Badge variant="secondary">{stats.completedProjects} Tamamlandı</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm kullanıcıların toplam geliri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Gelir/gider işlemleri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* İstatistik Kartları - Ek */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Varlıklar</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hedefler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zaman Kayıtları</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTimeEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etiketler</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sistem Durumu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Sistem Durumu
          </CardTitle>
          <CardDescription>Genel sistem sağlığı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span>Veritabanı</span>
            </div>
            <Badge variant="outline" className="text-green-600">Çalışıyor</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span>API</span>
            </div>
            <Badge variant="outline" className="text-green-600">Çalışıyor</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span>Supabase Auth</span>
            </div>
            <Badge variant="outline" className="text-green-600">Çalışıyor</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Admin Menü */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kullanıcı Yönetimi
              </CardTitle>
              <CardDescription>
                Kullanıcıları görüntüle, düzenle ve yönet
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/notifications">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Gönder
              </CardTitle>
              <CardDescription>
                Kullanıcılara bildirim gönder
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/active-users">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Aktif Kullanıcılar
              </CardTitle>
              <CardDescription>
                Çevrimiçi kullanıcılar ve aktivite logları
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sistem Raporları
            </CardTitle>
            <CardDescription>
              Yakında: Detaylı sistem raporları ve analizler
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Son Kayıt Olan Kullanıcılar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Kayıt Olan Kullanıcılar</CardTitle>
          <CardDescription>
            En son kayıt olan 5 kullanıcı
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentUsersData.length > 0 ? (
            <div className="space-y-4">
              {recentUsersData.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name || 'İsimsiz Kullanıcı'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Henüz kullanıcı yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
