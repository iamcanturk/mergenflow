'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Client, ClientInsert, ClientUpdate } from '@/types'
import { toast } from 'sonner'

export function useClients() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Client[]
    },
  })
}

export function useClient(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Client
    },
    enabled: !!id,
  })
}

interface CreateClientInput {
  company_name: string
  contact_person: string | null
  email: string | null
  phone: string | null
}

export function useCreateClient() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (client: CreateClientInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { data, error } = await supabase
        .from('clients')
        .insert({
          company_name: client.company_name,
          contact_person: client.contact_person,
          email: client.email,
          phone: client.phone,
          user_id: user.id,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data as Client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Müşteri başarıyla eklendi')
    },
    onError: (error) => {
      toast.error('Müşteri eklenemedi', { description: error.message })
    },
  })
}

interface UpdateClientInput {
  id: string
  company_name?: string
  contact_person?: string | null
  email?: string | null
  phone?: string | null
}

export function useUpdateClient() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateClientInput) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Müşteri başarıyla güncellendi')
    },
    onError: (error) => {
      toast.error('Müşteri güncellenemedi', { description: error.message })
    },
  })
}

export function useDeleteClient() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Müşteri başarıyla silindi')
    },
    onError: (error) => {
      toast.error('Müşteri silinemedi', { description: error.message })
    },
  })
}
