'use client'

import { useState, useEffect } from 'react'
import { ProjectTask } from '@/types'
import { TASK_STATUSES } from '@/lib/constants'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useTasks, useUpdateTaskPosition, useDeleteTask, useBulkUpdateTaskPositions } from '@/hooks/use-tasks'

import { KanbanColumn } from './kanban-column'
import { TaskFormDialog } from './task-form-dialog'
import { DeleteTaskDialog } from './delete-task-dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface KanbanBoardProps {
  projectId: string
}

// Sütun sırası
const COLUMN_ORDER = ['backlog', 'todo', 'in_progress', 'review', 'done']

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: tasks, isLoading } = useTasks(projectId)
  const updateTaskPosition = useUpdateTaskPosition()
  const bulkUpdatePositions = useBulkUpdateTaskPositions()
  const deleteTaskMutation = useDeleteTask()

  // Local state for optimistic updates
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [deletingTask, setDeletingTask] = useState<ProjectTask | null>(null)
  const [initialStatus, setInitialStatus] = useState('backlog')

  // Sync local state with server data
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks)
    }
  }, [tasks])

  // Group tasks by status
  const tasksByStatus = COLUMN_ORDER.reduce((acc, status) => {
    acc[status] = localTasks
      .filter((task) => task.status === status)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    return acc
  }, {} as Record<string, ProjectTask[]>)

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside a droppable area
    if (!destination) return

    // No movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const task = localTasks.find((t) => t.id === draggableId)
    if (!task) return

    // Optimistic update
    const newTasks = [...localTasks]
    const taskIndex = newTasks.findIndex((t) => t.id === draggableId)
    
    // Update task status and order_index
    newTasks[taskIndex] = {
      ...task,
      status: destination.droppableId as ProjectTask['status'],
      order_index: destination.index,
    }

    // Reorder tasks in destination column
    const destTasks = newTasks
      .filter((t) => t.status === destination.droppableId && t.id !== draggableId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

    // Insert at new position
    destTasks.splice(destination.index, 0, newTasks[taskIndex])

    // Update positions
    const updates = destTasks.map((t, idx) => ({
      id: t.id,
      status: destination.droppableId,
      order_index: idx,
      projectId,
    }))

    // If source and destination are different, also update source column
    if (source.droppableId !== destination.droppableId) {
      const sourceTasks = newTasks
        .filter((t) => t.status === source.droppableId)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      sourceTasks.forEach((t, idx) => {
        updates.push({
          id: t.id,
          status: source.droppableId,
          order_index: idx,
          projectId,
        })
      })
    }

    // Apply optimistic update
    const finalTasks = newTasks.map((t) => {
      const update = updates.find((u) => u.id === t.id)
      if (update) {
        return { ...t, status: update.status as ProjectTask['status'], order_index: update.order_index }
      }
      return t
    })

    setLocalTasks(finalTasks)

    // Persist to server
    try {
      await bulkUpdatePositions.mutateAsync(updates)
    } catch (error) {
      // Revert on error
      if (tasks) {
        setLocalTasks(tasks)
      }
      console.error('Failed to update task positions:', error)
    }
  }

  const handleAddTask = (status: string) => {
    setEditingTask(null)
    setInitialStatus(status)
    setFormOpen(true)
  }

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleDeleteTask = (task: ProjectTask) => {
    setDeletingTask(task)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingTask) return
    
    try {
      await deleteTaskMutation.mutateAsync({
        id: deletingTask.id,
        projectId,
      })
      setDeleteOpen(false)
      setDeletingTask(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_ORDER.map((column) => (
          <div
            key={column}
            className="flex flex-col bg-muted/50 rounded-lg min-w-[280px] h-[500px]"
          >
            <div className="p-3 border-b">
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="p-2 space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[500px]">
          {COLUMN_ORDER.map((columnId) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              tasks={tasksByStatus[columnId] || []}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        task={editingTask}
        initialStatus={initialStatus}
      />

      <DeleteTaskDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        task={deletingTask}
        onConfirm={confirmDelete}
        loading={deleteTaskMutation.isPending}
      />
    </>
  )
}
