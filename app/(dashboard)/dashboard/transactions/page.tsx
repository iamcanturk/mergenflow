import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İşlemler</h1>
          <p className="text-muted-foreground">
            Gelir ve giderlerinizi takip edin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 7&apos;de işlem listesi ve yönetimi eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
