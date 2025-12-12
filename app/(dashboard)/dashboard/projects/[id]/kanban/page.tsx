import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Project } from '@/types'

import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/kanban'

interface KanbanPageProps {
  params: Promise<{ id: string }>
}

export default async function KanbanPage({ params }: KanbanPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const project = data as Pick<Project, 'id' | 'name'>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Kanban Board</p>
          </div>
        </div>
      </div>

      <KanbanBoard projectId={id} />
    </div>
  )
}

