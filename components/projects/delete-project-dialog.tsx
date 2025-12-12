'use client'

import { useDeleteProject } from '@/hooks/use-projects'
import { Project } from '@/types'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function DeleteProjectDialog({ open, onOpenChange, project }: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject()

  async function handleDelete() {
    if (!project) return
    await deleteProject.mutateAsync(project.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{project?.name}</strong> projesini silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz ve projeye bağlı tüm görevler de silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
