import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projeksiyon</h1>
          <p className="text-muted-foreground">
            Finansal geleceğinizi planlayın
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finansal Projeksiyon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 9&apos;da projeksiyon grafiği ve hesaplamaları eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
