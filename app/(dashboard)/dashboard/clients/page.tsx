import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteriler</h1>
          <p className="text-muted-foreground">
            Müşterilerinizi yönetin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 4&apos;te müşteri listesi ve CRUD işlemleri eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
