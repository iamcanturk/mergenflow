import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">
            Hesap ve uygulama ayarlarınız
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ayarlar sayfası yakında eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
