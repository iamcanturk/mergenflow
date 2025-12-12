'use client'

import { useState } from 'react'
import { useClients } from '@/hooks/use-clients'
import { Client } from '@/types'
import { MoreHorizontal, Pencil, Trash2, Mail, Phone } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientFormDialog } from './client-form-dialog'
import { DeleteClientDialog } from './delete-client-dialog'

export function ClientsTable() {
  const { data: clients, isLoading } = useClients()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleEdit(client: Client) {
    setEditingClient(client)
    setFormOpen(true)
  }

  function handleDelete(client: Client) {
    setDeletingClient(client)
    setDeleteOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingClient(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Henüz müşteri bulunmuyor. İlk müşterinizi ekleyin!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Şirket Adı</TableHead>
              <TableHead>İletişim Kişisi</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.company_name}</TableCell>
                <TableCell>{client.contact_person || '-'}</TableCell>
                <TableCell>
                  {client.email ? (
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {client.phone ? (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(client)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        client={editingClient}
      />

      <DeleteClientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        client={deletingClient}
      />
    </>
  )
}
