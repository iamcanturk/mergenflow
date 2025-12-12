// Tüm tipleri tek yerden export et
export * from './database'

// Ek uygulama tipleri
export interface NavItem {
  title: string
  href: string
  icon?: string
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface SidebarNavItem extends NavItem {
  items?: NavItem[]
}

// Kanban board tipleri
export interface KanbanColumn {
  id: string
  title: string
  taskIds: string[]
}

export interface KanbanBoard {
  columns: Record<string, KanbanColumn>
  columnOrder: string[]
}

// API response tipleri
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Form tipleri
export interface SelectOption {
  value: string
  label: string
}
