'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Tag, TagInsert, TagUpdate } from '@/types'
import { toast } from 'sonner'

export function useTags() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Tag[]
    },
  })
}

export function useCreateTag() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tag: Omit<TagInsert, 'user_id'>) => {
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { data, error } = await (supabase as any)
        .from('tags')
        .insert({ ...tag, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data as Tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Etiket oluşturuldu')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTag() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TagUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Etiket güncellendi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTag() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Etiket silindi')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Project tags
export function useProjectTags(projectId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['project-tags', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('project_tags')
        .select('tag_id, tags(*)')
        .eq('project_id', projectId)

      if (error) throw error
      return (data || []).map((pt: any) => pt.tags) as Tag[]
    },
    enabled: !!projectId,
  })
}

export function useAddProjectTag() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, tagId }: { projectId: string; tagId: string }) => {
      const { error } = await (supabase as any)
        .from('project_tags')
        .insert({ project_id: projectId, tag_id: tagId })

      if (error) throw error
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-tags', projectId] })
    },
  })
}

export function useRemoveProjectTag() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, tagId }: { projectId: string; tagId: string }) => {
      const { error } = await (supabase as any)
        .from('project_tags')
        .delete()
        .eq('project_id', projectId)
        .eq('tag_id', tagId)

      if (error) throw error
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-tags', projectId] })
    },
  })
}
