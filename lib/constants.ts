// Proje durumları
export const PROJECT_STATUSES = {
  teklif: { label: 'Teklif', color: 'bg-yellow-500' },
  aktif: { label: 'Aktif', color: 'bg-blue-500' },
  tamamlandi: { label: 'Tamamlandı', color: 'bg-green-500' },
  iptal: { label: 'İptal', color: 'bg-red-500' },
} as const

// Görev durumları (Kanban sütunları)
export const TASK_STATUSES = {
  backlog: { label: 'Backlog', color: 'bg-slate-500' },
  todo: { label: 'Yapılacak', color: 'bg-yellow-500' },
  in_progress: { label: 'İşlemde', color: 'bg-blue-500' },
  review: { label: 'Kontrol', color: 'bg-purple-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500' },
} as const

// Görev öncelikleri
export const TASK_PRIORITIES = {
  low: { label: 'Düşük', color: 'bg-slate-400' },
  medium: { label: 'Orta', color: 'bg-yellow-400' },
  high: { label: 'Yüksek', color: 'bg-red-400' },
} as const

// Para birimleri
export const CURRENCIES = {
  TRY: { label: 'Türk Lirası', symbol: '₺' },
  USD: { label: 'Amerikan Doları', symbol: '$' },
  EUR: { label: 'Euro', symbol: '€' },
} as const

// Varlık tipleri
export const ASSET_TYPES = {
  cash: { label: 'Nakit', icon: 'Banknote' },
  bank: { label: 'Banka Hesabı', icon: 'Building2' },
  gold: { label: 'Altın', icon: 'Gem' },
  stock: { label: 'Hisse Senedi', icon: 'TrendingUp' },
  crypto: { label: 'Kripto Para', icon: 'Bitcoin' },
} as const

// İşlem tipleri
export const TRANSACTION_TYPES = {
  income: { label: 'Gelir', color: 'text-green-500' },
  expense: { label: 'Gider', color: 'text-red-500' },
} as const

// Tekrarlama sıklıkları
export const FREQUENCIES = {
  monthly: { label: 'Aylık', months: 1 },
  yearly: { label: 'Yıllık', months: 12 },
} as const

// Sidebar navigasyon
export const SIDEBAR_NAV = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Müşteriler',
    href: '/dashboard/clients',
    icon: 'Users',
  },
  {
    title: 'Projeler',
    href: '/dashboard/projects',
    icon: 'FolderKanban',
  },
  {
    title: 'İşlemler',
    href: '/dashboard/transactions',
    icon: 'Receipt',
  },
  {
    title: 'Varlıklar',
    href: '/dashboard/assets',
    icon: 'Wallet',
  },
  {
    title: 'Projeksiyon',
    href: '/dashboard/projections',
    icon: 'LineChart',
  },
  {
    title: 'Ayarlar',
    href: '/dashboard/settings',
    icon: 'Settings',
  },
] as const
