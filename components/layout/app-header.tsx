'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserNav } from './user-nav'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { ThemeToggle } from '@/components/theme-toggle'

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Müşteriler',
  projects: 'Projeler',
  transactions: 'İşlemler',
  assets: 'Varlıklar',
  projections: 'Projeksiyon',
  settings: 'Ayarlar',
  admin: 'Admin',
  users: 'Kullanıcılar',
  notifications: 'Bildirimler',
  kanban: 'Kanban',
  'active-users': 'Aktif Kullanıcılar',
}

export function AppHeader() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`
              const isLast = index === segments.length - 1
              const label = breadcrumbLabels[segment] || segment

              return (
                <BreadcrumbItem key={href}>
                  {!isLast ? (
                    <>
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationDropdown />
        <UserNav />
      </div>
    </header>
  )
}
