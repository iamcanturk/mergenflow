'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Project, Client } from '@/types'
import { toast } from 'sonner'

export function useProjects() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(id, company_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Project & { client: Pick<Client, 'id' | 'company_name'> | null })[]
    },
  })
}

export function useProject(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(id, company_name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Project & { client: Pick<Client, 'id' | 'company_name'> | null }
    },
    enabled: !!id,
  })
}

interface CreateProjectInput {
  name: string
  client_id: string | null
  status: string
  start_date: string | null
  deadline: string | null
  total_budget: number
  currency: string
}

export function useCreateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project: CreateProjectInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Proje başarıyla oluşturuldu')
    },
    onError: (error) => {
      toast.error('Proje oluşturulamadı', { description: error.message })
    },
  })
}

interface UpdateProjectInput {
  id: string
  name?: string
  client_id?: string | null
  status?: string
  start_date?: string | null
  deadline?: string | null
  total_budget?: number
  currency?: string
}

export function useUpdateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateProjectInput) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Proje başarıyla güncellendi')
    },
    onError: (error) => {
      toast.error('Proje güncellenemedi', { description: error.message })
    },
  })
}

export function useDeleteProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Proje başarıyla silindi')
    },
    onError: (error) => {
      toast.error('Proje silinemedi', { description: error.message })
    },
  })
}
