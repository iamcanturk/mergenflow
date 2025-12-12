'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients'
import { Client } from '@/types'

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

const clientSchema = z.object({
  company_name: z.string().min(2, 'Şirket adı en az 2 karakter olmalı'),
  contact_person: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta girin').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const isEditing = !!client

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: client?.company_name || '',
      contact_person: client?.contact_person || '',
      email: client?.email || '',
      phone: client?.phone || '',
    },
  })

  // Form değerlerini client değiştiğinde güncelle
  if (client && form.getValues('company_name') !== client.company_name) {
    form.reset({
      company_name: client.company_name,
      contact_person: client.contact_person || '',
      email: client.email || '',
      phone: client.phone || '',
    })
  }

  async function onSubmit(data: ClientFormData) {
    setLoading(true)
    try {
      const payload = {
        company_name: data.company_name,
        contact_person: data.contact_person || null,
        email: data.email || null,
        phone: data.phone || null,
      }
      
      if (isEditing && client) {
        await updateClient.mutateAsync({ id: client.id, ...payload })
      } else {
        await createClient.mutateAsync(payload)
      }
      form.reset()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Müşteri bilgilerini güncelleyin.'
              : 'Yeni müşteri bilgilerini girin.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şirket Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Şirketi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İletişim Kişisi</FormLabel>
                  <FormControl>
                    <Input placeholder="Ahmet Yılmaz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@sirket.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+90 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
