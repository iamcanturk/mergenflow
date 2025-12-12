import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { PROJECT_STATUSES, CURRENCIES } from '@/lib/constants'
import { ArrowLeft, Kanban, Calendar, Building2, Wallet } from 'lucide-react'
import { Project, Client } from '@/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

interface ProjectWithClient extends Project {
  client: Pick<Client, 'id' | 'company_name'> | null
}

interface TransactionData {
  id: string
  type: string
  amount: number
  is_paid: boolean
  description: string | null
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, company_name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const project = data as unknown as ProjectWithClient
  const status = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]
  const currency = CURRENCIES[project.currency as keyof typeof CURRENCIES]

  // Proje işlemlerini al
  const { data: transactionsData } = await supabase
    .from('transactions')
    .select('*')
    .eq('project_id', id)

  const transactions = (transactionsData || []) as TransactionData[]

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const paidIncome = transactions
    .filter(t => t.type === 'income' && t.is_paid)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="secondary" className={status?.color}>
                {status?.label || project.status}
              </Badge>
            </div>
            {project.client && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.client.company_name}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${id}/kanban`}>
            <Kanban className="mr-2 h-4 w-4" />
            Kanban Board
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bütçe</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currency?.symbol}{project.total_budget.toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tahsil Edilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currency?.symbol}{paidIncome.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              / {currency?.symbol}{totalIncome.toLocaleString('tr-TR')} toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giderler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currency?.symbol}{totalExpense.toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarihler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {project.start_date ? (
                <span>
                  {format(new Date(project.start_date), 'd MMM', { locale: tr })}
                </span>
              ) : '-'} 
              {' → '}
              {project.deadline ? (
                <span className="font-medium">
                  {format(new Date(project.deadline), 'd MMM yyyy', { locale: tr })}
                </span>
              ) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span>{t.description || (t.type === 'income' ? 'Gelir' : 'Gider')}</span>
                    <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {t.type === 'income' ? '+' : '-'}{currency?.symbol}{Number(t.amount).toLocaleString('tr-TR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz işlem bulunmuyor.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proje Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oluşturulma</span>
              <span>{format(new Date(project.created_at), 'd MMMM yyyy', { locale: tr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Para Birimi</span>
              <span>{currency?.label}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
