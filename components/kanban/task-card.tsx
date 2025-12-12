'use client'

import { ProjectTask } from '@/types'
import { TASK_STATUSES } from '@/lib/constants'
import { Draggable } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

const PRIORITIES: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-gray-500' },
  medium: { label: 'Orta', color: 'bg-yellow-500' },
  high: { label: 'Yüksek', color: 'bg-orange-500' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
}

interface TaskCardProps {
  task: ProjectTask
  index: number
  onEdit: (task: ProjectTask) => void
  onDelete: (task: ProjectTask) => void
}

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const priority = PRIORITIES[task.priority || 'medium']
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div
                {...provided.dragHandleProps}
                className="mt-1 text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">
                    {task.title}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(task)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={`text-xs text-white ${priority.color}`}
                  >
                    {priority.label}
                  </Badge>

                  {task.due_date && (
                    <Badge
                      variant={isOverdue ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(task.due_date), 'd MMM', { locale: tr })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}
