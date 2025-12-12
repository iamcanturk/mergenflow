'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useTranslation } from '@/lib/i18n'
import { useClients } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import { 
  Search, 
  Users, 
  FolderKanban, 
  Wallet, 
  TrendingUp, 
  Settings, 
  Plus,
  Home,
  PiggyBank,
  X
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: clients } = useClients()
  const { data: projects } = useProjects()
  const [search, setSearch] = React.useState('')

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const navigationItems = [
    { icon: Home, label: t('nav.dashboard'), href: '/dashboard', keywords: ['home', 'ana', 'panel'] },
    { icon: Users, label: t('nav.clients'), href: '/dashboard/clients', keywords: ['müşteri', 'customer'] },
    { icon: FolderKanban, label: t('nav.projects'), href: '/dashboard/projects', keywords: ['proje', 'iş'] },
    { icon: Wallet, label: t('nav.transactions'), href: '/dashboard/transactions', keywords: ['işlem', 'gelir', 'gider', 'income', 'expense'] },
    { icon: PiggyBank, label: t('nav.assets'), href: '/dashboard/assets', keywords: ['varlık', 'asset', 'para'] },
    { icon: TrendingUp, label: t('nav.projections'), href: '/dashboard/projections', keywords: ['projeksiyon', 'tahmin', 'forecast'] },
    { icon: Home, label: t('nav.calendar'), href: '/dashboard/calendar', keywords: ['takvim', 'calendar', 'tarih', 'date'] },
    { icon: Home, label: t('nav.timeTracking'), href: '/dashboard/time-tracking', keywords: ['zaman', 'time', 'saat', 'timer'] },
    { icon: Home, label: t('nav.reports'), href: '/dashboard/reports', keywords: ['rapor', 'report', 'analiz'] },
    { icon: Home, label: t('nav.goals'), href: '/dashboard/goals', keywords: ['hedef', 'goal', 'target'] },
    { icon: Home, label: t('pricing.calculator'), href: '/dashboard/pricing', keywords: ['fiyat', 'price', 'hesap', 'calculate'] },
    { icon: Settings, label: t('nav.settings'), href: '/dashboard/settings', keywords: ['ayar', 'setting', 'profil'] },
  ]

  const quickActions = [
    { icon: Plus, label: t('clients.addClient'), action: () => router.push('/dashboard/clients?action=new'), keywords: ['yeni', 'ekle', 'add'] },
    { icon: Plus, label: t('projects.addProject'), action: () => router.push('/dashboard/projects?action=new'), keywords: ['yeni', 'ekle', 'add'] },
    { icon: Plus, label: t('transactions.addTransaction'), action: () => router.push('/dashboard/transactions?action=new'), keywords: ['yeni', 'ekle', 'add'] },
    { icon: Plus, label: t('assets.addAsset'), action: () => router.push('/dashboard/assets?action=new'), keywords: ['yeni', 'ekle', 'add'] },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-[640px]">
        <VisuallyHidden>
          <DialogTitle>Command Palette</DialogTitle>
        </VisuallyHidden>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t('common.search') + '...'}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-4 w-4 opacity-50" />
              </button>
            )}
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {t('common.noData')}
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading={t('dashboard.quickActions')}>
              {quickActions.map((item) => (
                <Command.Item
                  key={item.label}
                  value={item.label + ' ' + item.keywords.join(' ')}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading={t('nav.home')}>
              {navigationItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label + ' ' + item.keywords.join(' ')}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                >
                  <item.icon className="h-4 w-4 opacity-60" />
                  <span>{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Recent Clients */}
            {clients && clients.length > 0 && (
              <Command.Group heading={t('nav.clients')}>
                {clients.slice(0, 5).map((client) => (
                  <Command.Item
                    key={client.id}
                    value={`client ${client.company_name} ${client.contact_person || ''}`}
                    onSelect={() => runCommand(() => router.push(`/dashboard/clients/${client.id}`))}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                  >
                    <Users className="h-4 w-4 opacity-60" />
                    <span>{client.company_name}</span>
                    {client.contact_person && (
                      <span className="text-muted-foreground text-sm">({client.contact_person})</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Recent Projects */}
            {projects && projects.length > 0 && (
              <Command.Group heading={t('nav.projects')}>
                {projects.slice(0, 5).map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`project ${project.name} ${project.status}`}
                    onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project.id}`))}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                  >
                    <FolderKanban className="h-4 w-4 opacity-60" />
                    <span>{project.name}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      project.status === 'aktif' && "bg-green-100 text-green-700",
                      project.status === 'tamamlandi' && "bg-blue-100 text-blue-700",
                      project.status === 'teklif' && "bg-yellow-100 text-yellow-700",
                      project.status === 'iptal' && "bg-red-100 text-red-700"
                    )}>
                      {t(`projects.statuses.${project.status}`)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
              <span>{t('common.select') || 'Navigate'}</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd>
              <span>{t('common.confirm') || 'Open'}</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd>
              <span>{t('common.close')}</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
