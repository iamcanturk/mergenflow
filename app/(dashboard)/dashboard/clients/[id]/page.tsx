import { Metadata } from 'next'
import { ClientDetailContent } from '@/components/clients/client-detail-content'

export const metadata: Metadata = {
  title: 'Müşteri Detayı',
}

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  
  return <ClientDetailContent clientId={id} />
}
