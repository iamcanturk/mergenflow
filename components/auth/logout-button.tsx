'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Çıkış yapılamadı')
      return
    }

    toast.success('Çıkış yapıldı')
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Çıkış Yap
    </Button>
  )
}
