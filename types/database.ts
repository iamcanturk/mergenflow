// Veritabanı şemasından oluşturulan TypeScript tipleri

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tablo satır tipleri
export interface Client {
  id: string
  user_id: string
  company_name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string | null
  name: string
  status: 'teklif' | 'aktif' | 'tamamlandi' | 'iptal'
  start_date: string | null
  deadline: string | null
  total_budget: number
  currency: 'TRY' | 'USD' | 'EUR'
  created_at: string
}

export interface ProjectTask {
  id: string
  user_id: string
  project_id: string
  title: string
  description: string | null
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  order_index: number
  position?: number // Alias for order_index used in Kanban
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  project_id: string | null
  type: 'income' | 'expense'
  amount: number
  transaction_date: string
  is_paid: boolean
  description: string | null
  created_at: string
}

export interface Asset {
  id: string
  user_id: string
  type: 'cash' | 'bank' | 'gold' | 'stock' | 'crypto'
  name: string
  amount: number // For simple assets OR total calculated value
  quantity: number | null // Number of units (grams for gold, shares for stocks, etc.)
  unit_price: number | null // Current price per unit
  currency: 'TRY' | 'USD' | 'EUR'
  purchase_date: string | null
  notes: string | null
  created_at: string
}

export interface RecurringItem {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  frequency: 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  created_at: string
}

export interface UserSettings {
  user_id: string
  inflation_rate: number
  salary_increase_rate: number
  default_currency: 'TRY' | 'USD' | 'EUR'
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email?: string
  avatar_url?: string | null
  role?: 'user' | 'admin'
  created_at?: string
}

// Tag system
export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

// Time tracking
export interface TimeEntry {
  id: string
  user_id: string
  project_id: string | null
  task_id: string | null
  description: string | null
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  is_billable: boolean
  hourly_rate: number | null
  created_at: string
}

// Goals
export interface Goal {
  id: string
  user_id: string
  title: string
  type: 'income' | 'projects' | 'clients' | 'hours' | 'savings'
  target_value: number
  current_value: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  is_completed: boolean
  created_at: string
}

// Push subscription
export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

// Extended Project with pricing
export interface ProjectWithPricing extends Project {
  pricing_type?: 'fixed' | 'hourly' | 'milestone'
  hourly_rate?: number | null
  estimated_hours?: number | null
}

// Extended UserSettings
export interface UserSettingsExtended extends UserSettings {
  default_hourly_rate?: number
}

// Insert tipleri (id ve created_at otomatik oluşturulur)
export type ClientInsert = Omit<Client, 'id' | 'created_at'>
export type ProjectInsert = Omit<Project, 'id' | 'created_at'>
export type ProjectTaskInsert = Omit<ProjectTask, 'id' | 'created_at'>
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>
export type AssetInsert = Omit<Asset, 'id' | 'created_at'>
export type RecurringItemInsert = Omit<RecurringItem, 'id' | 'created_at'>
export type TagInsert = Omit<Tag, 'id' | 'created_at'>
export type TimeEntryInsert = Omit<TimeEntry, 'id' | 'created_at'>
export type GoalInsert = Omit<Goal, 'id' | 'created_at'>

// Update tipleri (partial)
export type ClientUpdate = Partial<Omit<Client, 'id' | 'user_id' | 'created_at'>>
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>
export type ProjectTaskUpdate = Partial<Omit<ProjectTask, 'id' | 'user_id' | 'created_at'>>
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
export type AssetUpdate = Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>
export type RecurringItemUpdate = Partial<Omit<RecurringItem, 'id' | 'user_id' | 'created_at'>>
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'user_id' | 'created_at'>>
export type TagUpdate = Partial<Omit<Tag, 'id' | 'user_id' | 'created_at'>>
export type TimeEntryUpdate = Partial<Omit<TimeEntry, 'id' | 'user_id' | 'created_at'>>
export type GoalUpdate = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>

// Supabase Database tiplemesi
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: ClientInsert
        Update: ClientUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      project_tasks: {
        Row: ProjectTask
        Insert: ProjectTaskInsert
        Update: ProjectTaskUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      assets: {
        Row: Asset
        Insert: AssetInsert
        Update: AssetUpdate
      }
      recurring_items: {
        Row: RecurringItem
        Insert: RecurringItemInsert
        Update: RecurringItemUpdate
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'created_at'>
        Update: UserSettingsUpdate
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
    }
  }
}
