'use client'

import { useClient } from '@/hooks/use-clients'
import { useProjectsByClient } from '@/hooks/use-projects'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Briefcase,
  DollarSign,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ClientDetailContentProps {
  clientId: string
}

const statusLabels: Record<string, string> = {
  teklif: 'Teklif',
  aktif: 'Aktif',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

const statusColors: Record<string, string> = {
  teklif: 'bg-yellow-500/10 text-yellow-500',
  aktif: 'bg-blue-500/10 text-blue-500',
  tamamlandi: 'bg-green-500/10 text-green-500',
  iptal: 'bg-red-500/10 text-red-500',
}

export function ClientDetailContent({ clientId }: ClientDetailContentProps) {
  const { data: client, isLoading: clientLoading, error: clientError } = useClient(clientId)
  const { data: projects, isLoading: projectsLoading } = useProjectsByClient(clientId)

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (clientError || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-lg font-semibold">Müşteri bulunamadı</h2>
        <p className="text-muted-foreground">Bu müşteri mevcut değil veya erişim izniniz yok.</p>
        <Link href="/dashboard/clients">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Müşterilere Dön
          </Button>
        </Link>
      </div>
    )
  }

  const totalBudget = projects?.reduce((acc, p) => acc + (p.total_budget || 0), 0) || 0
  const activeProjects = projects?.filter(p => p.status === 'aktif').length || 0
  const completedProjects = projects?.filter(p => p.status === 'tamamlandi').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{client.company_name}</h1>
            <p className="text-muted-foreground">
              Eklendi: {format(new Date(client.created_at), 'd MMMM yyyy', { locale: tr })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif Proje</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bütçe</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalBudget)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              İletişim Bilgileri
            </CardTitle>
            <CardDescription>Müşteri iletişim detayları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.contact_person && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">İlgili Kişi</p>
                  <p className="font-medium">{client.contact_person}</p>
                </div>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <a 
                    href={`mailto:${client.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <a 
                    href={`tel:${client.phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            )}
            {!client.contact_person && !client.email && !client.phone && (
              <p className="text-sm text-muted-foreground">İletişim bilgisi eklenmemiş</p>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Projeler
            </CardTitle>
            <CardDescription>Bu müşteriye ait projeler</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {project.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(project.deadline), 'd MMM yyyy', { locale: tr })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[project.status] || ''}>
                        {statusLabels[project.status] || project.status}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Henüz proje eklenmemiş
                </p>
                <Link href="/dashboard/projects">
                  <Button variant="outline" size="sm" className="mt-4">
                    Proje Ekle
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
