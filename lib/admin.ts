import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Kullanıcının admin olup olmadığını kontrol et
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as { role: string } | null

  if (!profileData || profileData.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const profileData = profile as { role: string } | null
  return profileData?.role === 'admin'
}
