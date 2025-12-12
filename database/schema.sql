-- ========================================================
-- MergenFlow Pro - Database Schema for Supabase
-- ========================================================
-- 
-- INSTALLATION GUIDE:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase Dashboard
-- 3. Copy and paste this entire file content
-- 4. Click "Run" to execute
-- 
-- IMPORTANT: This will create all necessary tables, policies,
-- triggers, and indexes for MergenFlow to work properly.
--
-- Author: Yusuf Can TÜRK (https://iamcanturk.dev)
-- ========================================================

-- --------------------------------------------------------
-- 0. Drop Existing Tables (OPTIONAL - Use with caution!)
-- --------------------------------------------------------
-- Uncomment the following section ONLY if you want to reset
-- your database completely. THIS WILL DELETE ALL DATA!
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP VIEW IF EXISTS active_users;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS notification_rules CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS recurring_items CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
*/

-- --------------------------------------------------------
-- 1. TABLES
-- --------------------------------------------------------

-- User Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients / Customers
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'proposal', -- 'proposal', 'active', 'completed', 'cancelled'
    start_date DATE,
    deadline DATE,
    total_budget NUMERIC DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'TRY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kanban Task Cards
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- 'backlog', 'todo', 'in_progress', 'review', 'done'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    due_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Transactions (Income/Expense)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'income', 'expense'
    amount NUMERIC NOT NULL,
    transaction_date DATE NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    category TEXT, -- 'salary', 'freelance', 'rent', 'utilities', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets (Cash, Bank, Gold, Stocks, Crypto)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'cash', 'bank', 'gold', 'stock', 'crypto'
    name TEXT NOT NULL, 
    amount NUMERIC NOT NULL, -- Total value (or calculated from quantity × unit_price)
    quantity NUMERIC, -- Number of units (grams, shares, coins, etc.)
    unit_price NUMERIC, -- Current price per unit
    currency TEXT NOT NULL DEFAULT 'TRY',
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Items (for Financial Projections)
CREATE TABLE IF NOT EXISTS recurring_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    type TEXT NOT NULL, -- 'income', 'expense'
    amount NUMERIC NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE, -- For loans/debts with an end date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings (including projection settings)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    inflation_rate NUMERIC DEFAULT 0, -- Annual estimated inflation %
    salary_increase_rate NUMERIC DEFAULT 0, -- Annual estimated salary increase %
    default_currency TEXT DEFAULT 'TRY', -- 'TRY', 'USD', 'EUR'
    theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    language TEXT DEFAULT 'tr', -- 'tr', 'en'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'reminder'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT, -- Optional redirect link when clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Rules (automated notifications)
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'payment_due', 'task_due', 'project_deadline'
    days_before INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Logs (for admin monitoring)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'login', 'logout', 'page_view', 'action'
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    page_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Admins can view all profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Clients RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own clients" ON clients;
CREATE POLICY "Users can CRUD their own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own projects" ON projects;
CREATE POLICY "Users can CRUD their own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Project Tasks RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON project_tasks;
CREATE POLICY "Users can CRUD their own tasks" ON project_tasks FOR ALL USING (auth.uid() = user_id);

-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own transactions" ON transactions;
CREATE POLICY "Users can CRUD their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own assets" ON assets;
CREATE POLICY "Users can CRUD their own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- Recurring Items RLS
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own recurring items" ON recurring_items;
CREATE POLICY "Users can CRUD their own recurring items" ON recurring_items FOR ALL USING (auth.uid() = user_id);

-- User Settings RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own settings" ON user_settings;
CREATE POLICY "Users can CRUD their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.uid() = user_id
);

-- Notification Rules RLS
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own rules" ON notification_rules;
CREATE POLICY "Users can CRUD their own rules" ON notification_rules FOR ALL USING (auth.uid() = user_id);

-- User Activity Logs RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON user_activity_logs;
CREATE POLICY "Users can view their own logs" ON user_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON user_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON user_activity_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- --------------------------------------------------------
-- 3. TRIGGERS
-- --------------------------------------------------------

-- Auto-create profile and settings when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 4. INDEXES (Performance Optimization)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_items_user_id ON recurring_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_rules_user_id ON notification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- --------------------------------------------------------
-- 5. VIEWS
-- --------------------------------------------------------

-- Active users view (users active in the last 30 minutes)
CREATE OR REPLACE VIEW active_users AS
SELECT DISTINCT ON (user_id)
    user_id,
    ip_address,
    device_type,
    browser,
    os,
    country,
    city,
    created_at as last_activity
FROM user_activity_logs
WHERE created_at > NOW() - INTERVAL '30 minutes'
ORDER BY user_id, created_at DESC;

-- --------------------------------------------------------
-- 6. NEW FEATURES - Tags, Time Tracking, Goals, Push Notifications
-- --------------------------------------------------------

-- Tags (for categorizing projects, clients, transactions)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6', -- Blue default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Tags (many-to-many)
CREATE TABLE IF NOT EXISTS project_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(project_id, tag_id)
);

-- Client Tags (many-to-many)
CREATE TABLE IF NOT EXISTS client_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(client_id, tag_id)
);

-- Transaction Tags (many-to-many)
CREATE TABLE IF NOT EXISTS transaction_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(transaction_id, tag_id)
);

-- Time Entries (for time tracking)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Calculated when end_time is set
    is_billable BOOLEAN DEFAULT TRUE,
    hourly_rate NUMERIC, -- Override for this entry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals (financial and productivity goals)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'income', 'projects', 'clients', 'hours', 'savings'
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    period TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions (for browser push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Add pricing fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'fixed'; -- 'fixed', 'hourly'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC;

-- Add default hourly rate to user settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT FALSE;

-- --------------------------------------------------------
-- 7. RLS POLICIES FOR NEW TABLES
-- --------------------------------------------------------

-- Tags RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own tags" ON tags;
CREATE POLICY "Users can CRUD their own tags" ON tags FOR ALL USING (auth.uid() = user_id);

-- Project Tags RLS
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own project tags" ON project_tags;
CREATE POLICY "Users can CRUD their own project tags" ON project_tags FOR ALL 
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tags.project_id AND projects.user_id = auth.uid()));

-- Client Tags RLS
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own client tags" ON client_tags;
CREATE POLICY "Users can CRUD their own client tags" ON client_tags FOR ALL 
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_tags.client_id AND clients.user_id = auth.uid()));

-- Transaction Tags RLS
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own transaction tags" ON transaction_tags;
CREATE POLICY "Users can CRUD their own transaction tags" ON transaction_tags FOR ALL 
    USING (EXISTS (SELECT 1 FROM transactions WHERE transactions.id = transaction_tags.transaction_id AND transactions.user_id = auth.uid()));

-- Time Entries RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own time entries" ON time_entries;
CREATE POLICY "Users can CRUD their own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);

-- Goals RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own goals" ON goals;
CREATE POLICY "Users can CRUD their own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can CRUD their own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
-- Admins can read all push subscriptions (for sending notifications)
CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- --------------------------------------------------------
-- 8. INDEXES FOR NEW TABLES
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_client_id ON client_tags(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_tag_id ON client_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tags_transaction_id ON transaction_tags(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag_id ON transaction_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON goals(end_date);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- --------------------------------------------------------
-- SETUP COMPLETE!
-- --------------------------------------------------------
-- Your database is now ready. Next steps:
-- 1. Create a user account in your app
-- 2. Go to Table Editor > profiles
-- 3. Change your user's 'role' from 'user' to 'admin'
-- 4. Refresh the app to access Admin Panel
-- --------------------------------------------------------
