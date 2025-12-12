import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* TODO: Faz 3'te Sidebar ve Header eklenecek */}
      <main className="p-8">
        {children}
      </main>
    </div>
  )
}
