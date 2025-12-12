'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Bell, Users, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useSendNotification } from '@/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuery } from '@tanstack/react-query'

const notificationSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalı'),
  message: z.string().min(5, 'Mesaj en az 5 karakter olmalı'),
  type: z.enum(['info', 'warning', 'success', 'error', 'reminder']),
  link: z.string().optional(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface UserData {
  id: string
  full_name: string | null
  email: string | null
}

export function AdminNotificationForm() {
  const supabase = createClient()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const sendNotification = useSendNotification()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-for-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as UserData[]
    },
  })

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'info',
      link: '',
    },
  })

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  const onSubmit = async (data: NotificationFormData) => {
    if (selectedUsers.length === 0) {
      toast.error('En az bir kullanıcı seçmelisiniz')
      return
    }

    try {
      // Her seçili kullanıcıya bildirim gönder
      await Promise.all(
        selectedUsers.map((userId) =>
          sendNotification.mutateAsync({
            user_id: userId,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link || undefined,
          })
        )
      )

      toast.success(`${selectedUsers.length} kullanıcıya bildirim gönderildi`)
      form.reset()
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to send notifications:', error)
      toast.error('Bildirimler gönderilemedi')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bildirim Formu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim İçeriği
          </CardTitle>
          <CardDescription>
            Göndermek istediğiniz bildirimin detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input placeholder="Bildirim başlığı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mesaj</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bildirim mesajı..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bildirim Tipi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tip seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="success">Başarılı</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="error">Hata</SelectItem>
                        <SelectItem value="reminder">Hatırlatma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yönlendirme Linki (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="/dashboard/projects" {...field} />
                    </FormControl>
                    <FormDescription>
                      Bildirime tıklandığında yönlendirilecek sayfa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={sendNotification.isPending || selectedUsers.length === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                {sendNotification.isPending
                  ? 'Gönderiliyor...'
                  : `${selectedUsers.length} Kullanıcıya Gönder`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Kullanıcı Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcı Seçimi
          </CardTitle>
          <CardDescription>
            Bildirim gönderilecek kullanıcıları seçin ({selectedUsers.length} seçili)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-96 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredUsers.length > 0 &&
                        selectedUsers.length === filteredUsers.length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>E-posta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Kullanıcı bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => toggleUser(user.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.full_name || 'İsimsiz'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
