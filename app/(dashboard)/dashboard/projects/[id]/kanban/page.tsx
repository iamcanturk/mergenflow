import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KanbanPageProps {
  params: Promise<{ id: string }>
}

export default async function KanbanPage({ params }: KanbanPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">Proje ID: {id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kanban Board</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Faz 6&apos;da Kanban board ve drag &amp; drop işlevselliği eklenecek.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
