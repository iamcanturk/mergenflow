'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LucideIcon, Plus, FolderKanban, Users, Wallet, PiggyBank, FileText, Bell, Search } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="mb-4 p-4 rounded-full bg-muted"
        >
          <Icon className="h-10 w-10 text-muted-foreground" />
        </motion.div>
      )}
      
      <motion.h3 
        className="text-lg font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          className="text-muted-foreground text-sm max-w-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}

// Pre-configured empty states for common use cases
export function EmptyClients({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Users}
      title={t('clients.noClients')}
      description={t('clients.noClients')}
      action={onAdd ? { label: t('clients.addClient'), onClick: onAdd } : undefined}
    />
  )
}

export function EmptyProjects({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={FolderKanban}
      title={t('projects.noProjects')}
      description={t('projects.noProjects')}
      action={onAdd ? { label: t('projects.addProject'), onClick: onAdd } : undefined}
    />
  )
}

export function EmptyTransactions({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Wallet}
      title={t('transactions.noTransactions')}
      action={onAdd ? { label: t('transactions.addTransaction'), onClick: onAdd } : undefined}
    />
  )
}

export function EmptyAssets({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={PiggyBank}
      title={t('assets.noAssets')}
      action={onAdd ? { label: t('assets.addAsset'), onClick: onAdd } : undefined}
    />
  )
}

export function EmptyNotifications() {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={Bell}
      title={t('notifications.noNotifications')}
    />
  )
}

export function EmptySearch({ query }: { query: string }) {
  const { t, locale } = useTranslation()
  return (
    <EmptyState
      icon={Search}
      title={locale === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
      description={locale === 'tr' ? `"${query}" için sonuç bulunamadı.` : `No results found for "${query}".`}
    />
  )
}

// Illustrated empty state with custom SVG
export function IllustratedEmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Simple illustration */}
      <motion.svg
        width="200"
        height="150"
        viewBox="0 0 200 150"
        fill="none"
        className="mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <motion.rect
          x="40"
          y="30"
          width="120"
          height="90"
          rx="8"
          className="fill-muted stroke-border"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />
        <motion.line
          x1="60"
          y1="60"
          x2="140"
          y2="60"
          className="stroke-muted-foreground/30"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
        <motion.line
          x1="60"
          y1="80"
          x2="120"
          y2="80"
          className="stroke-muted-foreground/20"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.line
          x1="60"
          y1="100"
          x2="100"
          y2="100"
          className="stroke-muted-foreground/10"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        <motion.circle
          cx="165"
          cy="25"
          r="20"
          className="fill-primary/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
        />
        <motion.path
          d="M158 25 L165 32 L175 18"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        />
      </motion.svg>

      <motion.h3 
        className="text-xl font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          className="text-muted-foreground max-w-md mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button size="lg" onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
