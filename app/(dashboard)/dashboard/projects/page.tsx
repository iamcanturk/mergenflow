import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projeler</h1>
          <p className="text-muted-foreground">
            Projelerinizi yönetin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proje Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 5&apos;te proje listesi ve yönetimi eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
