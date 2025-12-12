'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProjects } from '@/hooks/use-projects'
import { Project, Client } from '@/types'
import { PROJECT_STATUSES, CURRENCIES } from '@/lib/constants'
import { MoreHorizontal, Pencil, Trash2, Kanban, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectFormDialog } from './project-form-dialog'
import { DeleteProjectDialog } from './delete-project-dialog'

type ProjectWithClient = Project & { client: Pick<Client, 'id' | 'company_name'> | null }

export function ProjectsTable() {
  const { data: projects, isLoading } = useProjects()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleEdit(project: ProjectWithClient) {
    setEditingProject(project)
    setFormOpen(true)
  }

  function handleDelete(project: ProjectWithClient) {
    setDeletingProject(project)
    setDeleteOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingProject(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Henüz proje bulunmuyor. İlk projenizi oluşturun!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proje Adı</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Bütçe</TableHead>
              <TableHead>Bitiş Tarihi</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const status = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]
              const currency = CURRENCIES[project.currency as keyof typeof CURRENCIES]

              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {project.client?.company_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={status?.color}>
                      {status?.label || project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {currency?.symbol}{project.total_budget.toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    {project.deadline ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(project.deadline), 'd MMM yyyy', { locale: tr })}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/kanban`}>
                            <Kanban className="mr-2 h-4 w-4" />
                            Kanban Board
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(project)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        project={editingProject}
      />

      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={deletingProject}
      />
    </>
  )
}
