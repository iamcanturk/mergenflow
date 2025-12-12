import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Varlıklar</h1>
          <p className="text-muted-foreground">
            Varlıklarınızı takip edin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Varlık Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 8&apos;de varlık yönetimi eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
