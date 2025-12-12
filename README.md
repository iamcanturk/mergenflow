# 🚀 MergenFlow Pro

> **The Ultimate Freelancer OS** - An open-source SaaS platform offering comprehensive Financial Projection, Recurring Budget Management, and integrated Kanban Workflow Tracking for freelance professionals.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## ✨ Features

### 📊 Financial Management
- **Income & Expense Tracking** - Record all your transactions with project association
- **Asset Management** - Track cash, bank accounts, gold, stocks, and crypto
- **36-Month Financial Projection** - Forecast your finances with inflation and salary increase calculations
- **Recurring Items** - Manage monthly/yearly income and expenses
- **Debt Payoff Analysis** - Calculate when your debts will be paid off

### 📋 Project Management
- **Client CRM** - Manage your clients with contact information and detailed profiles
- **Project Tracking** - Track projects from proposal to completion
- **Kanban Board** - Drag & drop task management with priorities and due dates
- **Project-Client Linking** - Associate projects with specific clients

### 🔔 Notifications
- **Real-time Notifications** - Get notified about important events
- **Custom Rules** - Set up reminders for payment due dates, task deadlines
- **Admin Broadcasts** - Admins can send notifications to all users

### 🛡️ Admin Panel
- **User Management** - View and manage all users
- **Activity Logs** - Track user sessions, devices, and locations
- **System Statistics** - Dashboard with key metrics
- **Notification Center** - Send bulk notifications to users

### 🎨 User Experience
- **Dark/Light Mode** - Automatic theme based on system preference
- **Multi-language Support** - English and Turkish (extensible)
- **Mobile Responsive** - Works on all devices
- **PWA Ready** - Install as a native app

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Kanban | @hello-pangea/dnd |
| i18n | next-intl |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/iamcanturk/mergenflow.git
cd mergenflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `database/schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 4. Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
mergenflow/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── admin/         # Admin panel
│   │   └── dashboard/     # User dashboard
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── clients/           # Client management
│   ├── projects/          # Project management
│   ├── kanban/            # Kanban board
│   ├── transactions/      # Financial transactions
│   ├── assets/            # Asset management
│   ├── projections/       # Financial projections
│   └── notifications/     # Notification system
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── locales/               # Translation files
│   ├── en.json           # English
│   └── tr.json           # Turkish
├── database/              # Database schemas
│   └── schema.sql        # Supabase SQL schema
└── public/               # Static assets
```

---

## 🌍 Adding a New Language

1. Create a new JSON file in `locales/` (e.g., `de.json` for German)
2. Copy the structure from `en.json`
3. Translate all values
4. Add the locale to `lib/i18n.ts`

Example:
```json
// locales/de.json
{
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen"
  }
}
```

---

## 🔐 Setting Up Admin User

After creating your first user:

1. Go to Supabase Dashboard > Table Editor > profiles
2. Find your user and change `role` from `user` to `admin`
3. Refresh the app to see the Admin Panel link

---

## 📊 Database Schema

The database includes the following tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with roles |
| `clients` | Client/Customer data |
| `projects` | Project information |
| `project_tasks` | Kanban tasks |
| `transactions` | Income/Expense records |
| `assets` | Financial assets |
| `recurring_items` | Recurring income/expenses |
| `user_settings` | User preferences |
| `notifications` | User notifications |
| `notification_rules` | Automated notification rules |
| `user_activity_logs` | User activity tracking |

All tables have Row Level Security (RLS) enabled for multi-tenant isolation.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yusuf Can TÜRK**

- Website: [iamcanturk.dev](https://iamcanturk.dev)
- GitHub: [@iamcanturk](https://github.com/iamcanturk)

---

## 💖 Support

If you find this project useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation

---

<p align="center">
  Made with ❤️ by <a href="https://iamcanturk.dev">Yusuf Can TÜRK</a>
</p>
