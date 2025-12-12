'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectsTable, ProjectFormDialog } from '@/components/projects'

export default function ProjectsPage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projeler</h1>
          <p className="text-muted-foreground">
            Projelerinizi yönetin
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Proje
        </Button>
      </div>

      <ProjectsTable />

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={null}
      />
    </div>
  )
}
