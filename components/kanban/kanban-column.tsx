'use client'

import { ProjectTask } from '@/types'
import { TASK_STATUSES } from '@/lib/constants'
import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  columnId: string
  tasks: ProjectTask[]
  onAddTask: (status: string) => void
  onEditTask: (task: ProjectTask) => void
  onDeleteTask: (task: ProjectTask) => void
}

export function KanbanColumn({
  columnId,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const columnInfo = TASK_STATUSES[columnId as keyof typeof TASK_STATUSES]

  return (
    <div className="flex flex-col bg-muted/50 rounded-lg min-w-[280px] max-w-[320px] h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${columnInfo.color}`} />
          <h3 className="font-semibold text-sm">{columnInfo.label}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddTask(columnId)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">Görev yok</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => onAddTask(columnId)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Görev ekle
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
