'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
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
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslation } from '@/lib/i18n'
import { useCommandPalette } from '@/components/command-palette-provider'

const breadcrumbKeys: Record<string, string> = {
  dashboard: 'nav.dashboard',
  clients: 'nav.clients',
  projects: 'nav.projects',
  transactions: 'nav.transactions',
  assets: 'nav.assets',
  projections: 'nav.projections',
  settings: 'nav.settings',
  admin: 'nav.admin',
  users: 'settings.users',
  notifications: 'nav.notifications',
  kanban: 'projects.kanban',
  'active-users': 'admin.activeUsers',
}

export function AppHeader() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { setOpen } = useCommandPalette()
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
              const key = breadcrumbKeys[segment]
              const label = key ? t(key) : segment

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {!isLast ? (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>{t('common.search')}...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <LanguageToggle />
        <ThemeToggle />
        <NotificationDropdown />
        <UserNav />
      </div>
    </header>
  )
}
