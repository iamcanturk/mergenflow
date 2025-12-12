import { requireAdmin } from '@/lib/admin'
import { AdminNotificationForm } from '@/components/admin/admin-notification-form'

export default async function AdminNotificationsPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirim Gönder</h1>
          <p className="text-muted-foreground">
            Kullanıcılara bildirim gönderin
          </p>
        </div>
      </div>

      <AdminNotificationForm />
    </div>
  )
}
