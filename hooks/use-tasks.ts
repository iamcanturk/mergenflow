'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProjectTask } from '@/types'

interface CreateTaskInput {
  project_id: string
  title: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  order_index?: number
}

interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  order_index?: number
}

interface UpdateTaskPositionInput {
  id: string
  status: string
  order_index: number
}

export function useTasks(projectId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as ProjectTask[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      // Mevcut en yüksek pozisyonu bul
      const { data: existingTasks } = await supabase
        .from('project_tasks')
        .select('order_index')
        .eq('project_id', input.project_id)
        .eq('status', input.status || 'backlog')
        .order('order_index', { ascending: false })
        .limit(1)

      const existingData = existingTasks as { order_index: number }[] | null
      const nextPosition = existingData && existingData.length > 0 
        ? (existingData[0].order_index || 0) + 1 
        : 0

      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          ...input,
          status: input.status || 'backlog',
          order_index: input.order_index ?? nextPosition,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
    },
  })
}

export function useUpdateTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .update(input as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
    },
  })
}

export function useUpdateTaskPosition() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, order_index }: UpdateTaskPositionInput) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .update({ status, order_index } as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
    },
  })
}

export function useDeleteTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.projectId] })
    },
  })
}

export function useBulkUpdateTaskPositions() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: { id: string; status: string; order_index: number; projectId: string }[]) => {
      const promises = updates.map(({ id, status, order_index }) =>
        supabase
          .from('project_tasks')
          .update({ status, order_index } as never)
          .eq('id', id)
      )

      await Promise.all(promises)
      return updates[0]?.projectId
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      }
    },
  })
}
