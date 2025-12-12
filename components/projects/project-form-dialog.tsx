'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'
import { Project } from '@/types'
import { PROJECT_STATUSES, CURRENCIES } from '@/lib/constants'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const projectSchema = z.object({
  name: z.string().min(2, 'Proje adı en az 2 karakter olmalı'),
  client_id: z.string().optional(),
  status: z.string(),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
  total_budget: z.number().min(0, 'Bütçe negatif olamaz'),
  currency: z.string(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const { data: clients } = useClients()
  const isEditing = !!project

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      client_id: project?.client_id || '',
      status: project?.status || 'teklif',
      start_date: project?.start_date || '',
      deadline: project?.deadline || '',
      total_budget: project?.total_budget || 0,
      currency: project?.currency || 'TRY',
    },
  })

  // Form değerlerini project değiştiğinde güncelle
  if (project && form.getValues('name') !== project.name) {
    form.reset({
      name: project.name,
      client_id: project.client_id || '',
      status: project.status,
      start_date: project.start_date || '',
      deadline: project.deadline || '',
      total_budget: project.total_budget,
      currency: project.currency,
    })
  }

  async function onSubmit(data: ProjectFormData) {
    setLoading(true)
    try {
      const payload = {
        name: data.name,
        client_id: data.client_id || null,
        status: data.status,
        start_date: data.start_date || null,
        deadline: data.deadline || null,
        total_budget: data.total_budget,
        currency: data.currency,
      }
      
      if (isEditing && project) {
        await updateProject.mutateAsync({ id: project.id, ...payload })
      } else {
        await createProject.mutateAsync(payload)
      }
      form.reset()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Proje Düzenle' : 'Yeni Proje'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Proje bilgilerini güncelleyin.'
              : 'Yeni proje bilgilerini girin.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proje Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="E-Ticaret Sitesi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
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
                      {Object.entries(PROJECT_STATUSES).map(([value, { label }]) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bütçe</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CURRENCIES).map(([value, { label, symbol }]) => (
                          <SelectItem key={value} value={value}>
                            {symbol} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
