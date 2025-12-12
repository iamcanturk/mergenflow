'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks'
import { ProjectTask } from '@/types'
import { TASK_STATUSES } from '@/lib/constants'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PRIORITIES = {
  low: { label: 'Düşük', color: 'bg-gray-500' },
  medium: { label: 'Orta', color: 'bg-yellow-500' },
  high: { label: 'Yüksek', color: 'bg-orange-500' },
  urgent: { label: 'Acil', color: 'bg-red-500' },
}

const taskSchema = z.object({
  title: z.string().min(2, 'Görev başlığı en az 2 karakter olmalı'),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  due_date: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  task?: ProjectTask | null
  initialStatus?: string
}

export function TaskFormDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  task, 
  initialStatus = 'backlog' 
}: TaskFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const isEditing = !!task

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || initialStatus,
      priority: task?.priority || 'medium',
      due_date: task?.due_date || '',
    },
  })

  // Form değerlerini task değiştiğinde güncelle
  if (task && form.getValues('title') !== task.title) {
    form.reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
    })
  }

  if (!task && !isEditing && form.getValues('status') !== initialStatus) {
    form.setValue('status', initialStatus)
  }

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true)
    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          ...data,
          description: data.description || undefined,
          due_date: data.due_date || undefined,
        })
      } else {
        await createTask.mutateAsync({
          project_id: projectId,
          ...data,
          description: data.description || undefined,
          due_date: data.due_date || undefined,
        })
      }
      onOpenChange(false)
      form.reset({
        title: '',
        description: '',
        status: initialStatus,
        priority: 'medium',
        due_date: '',
      })
    } catch (error) {
      console.error('Task operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Görevi Düzenle' : 'Yeni Görev'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Görev bilgilerini güncelleyin.'
              : 'Yeni bir görev ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık *</FormLabel>
                  <FormControl>
                    <Input placeholder="Görev başlığı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Görev detayları..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TASK_STATUSES).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Öncelik</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORITIES).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bitiş Tarihi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
