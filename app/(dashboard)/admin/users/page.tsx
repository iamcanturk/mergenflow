import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ArrowLeft, Shield, User } from 'lucide-react'

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

interface UserData {
  id: string
  full_name: string | null
  role: string
  created_at: string
}

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Tüm kullanıcıları al
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  const usersData = (users || []) as UserData[]

  // Her kullanıcı için proje sayısını al
  const userStats = await Promise.all(
    usersData.map(async (user) => {
      const [projectsResult, clientsResult, transactionsResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      return {
        ...user,
        projectCount: projectsResult.count || 0,
        clientCount: clientsResult.count || 0,
        transactionCount: transactionsResult.count || 0,
      }
    })
  )

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
            <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
            <p className="text-muted-foreground">
              Tüm kullanıcıları görüntüle ve yönet
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>
            Sistemde kayıtlı {usersData.length} kullanıcı bulunuyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-center">Projeler</TableHead>
                    <TableHead className="text-center">Müşteriler</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'İsimsiz'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{user.projectCount}</TableCell>
                      <TableCell className="text-center">{user.clientCount}</TableCell>
                      <TableCell className="text-center">{user.transactionCount}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'd MMM yyyy', { locale: tr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Henüz kullanıcı yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
