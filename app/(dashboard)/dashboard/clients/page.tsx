'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientsTable, ClientFormDialog } from '@/components/clients'

export default function ClientsPage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteriler</h1>
          <p className="text-muted-foreground">
            Müşterilerinizi yönetin
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      <ClientsTable />

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={null}
      />
    </div>
  )
}
