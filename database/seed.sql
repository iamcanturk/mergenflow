-- ========================================================
-- MergenFlow Pro - Test Data Seed File
-- ========================================================
-- 
-- This file creates a test user with realistic dummy data
-- Run this AFTER running the schema.sql file
--
-- Test User: Alex Morgan (UI/UX Designer)
-- Email: alex@designstudio.com
-- Password: Test123! (set this in Supabase Auth)
--
-- Author: Yusuf Can TÜRK (https://iamcanturk.dev)
-- ========================================================

-- --------------------------------------------------------
-- IMPORTANT: First create a user in Supabase Auth Dashboard
-- with email: alex@designstudio.com and password: Test123!
-- Then copy the user's UUID and replace the placeholder below
-- --------------------------------------------------------

-- Replace this with the actual UUID from Supabase Auth
-- You can find it in Authentication > Users after creating the user
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE WITH ACTUAL UUID
    client_techstart UUID;
    client_greenleaf UUID;
    client_urbanfit UUID;
    client_artisancafe UUID;
    client_mindfulapp UUID;
    project_techstart_web UUID;
    project_greenleaf_brand UUID;
    project_urbanfit_app UUID;
    project_artisan_menu UUID;
    project_mindful_ui UUID;
BEGIN

-- --------------------------------------------------------
-- 1. UPDATE PROFILE (if trigger already created it)
-- --------------------------------------------------------
UPDATE profiles SET
    full_name = 'Alex Morgan',
    email = 'alex@designstudio.com',
    role = 'user'
WHERE id = test_user_id;

-- If profile doesn't exist, insert it
INSERT INTO profiles (id, full_name, email, role)
VALUES (test_user_id, 'Alex Morgan', 'alex@designstudio.com', 'user')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 2. USER SETTINGS
-- --------------------------------------------------------
INSERT INTO user_settings (user_id, inflation_rate, salary_increase_rate)
VALUES (test_user_id, 20, 25)
ON CONFLICT (user_id) DO UPDATE SET
    inflation_rate = 20,
    salary_increase_rate = 25;

-- --------------------------------------------------------
-- 3. CLIENTS
-- --------------------------------------------------------

-- Client 1: TechStart Solutions
INSERT INTO clients (id, user_id, company_name, contact_person, email, phone)
VALUES (gen_random_uuid(), test_user_id, 'TechStart Solutions', 'Sarah Chen', 'sarah@techstart.io', '+1 (415) 555-0123')
RETURNING id INTO client_techstart;

-- Client 2: GreenLeaf Organics
INSERT INTO clients (id, user_id, company_name, contact_person, email, phone)
VALUES (gen_random_uuid(), test_user_id, 'GreenLeaf Organics', 'Michael Torres', 'michael@greenleaf.co', '+1 (503) 555-0456')
RETURNING id INTO client_greenleaf;

-- Client 3: UrbanFit Athletics
INSERT INTO clients (id, user_id, company_name, contact_person, email, phone)
VALUES (gen_random_uuid(), test_user_id, 'UrbanFit Athletics', 'Emma Watson', 'emma@urbanfit.com', '+1 (212) 555-0789')
RETURNING id INTO client_urbanfit;

-- Client 4: Artisan Café
INSERT INTO clients (id, user_id, company_name, contact_person, email, phone)
VALUES (gen_random_uuid(), test_user_id, 'Artisan Café', 'James Miller', 'james@artisancafe.nyc', '+1 (718) 555-0321')
RETURNING id INTO client_artisancafe;

-- Client 5: Mindful App Co.
INSERT INTO clients (id, user_id, company_name, contact_person, email, phone)
VALUES (gen_random_uuid(), test_user_id, 'Mindful App Co.', 'Lisa Park', 'lisa@mindfulapp.io', '+1 (650) 555-0654')
RETURNING id INTO client_mindfulapp;

-- --------------------------------------------------------
-- 4. PROJECTS
-- --------------------------------------------------------

-- Project 1: TechStart Website Redesign (Active)
INSERT INTO projects (id, user_id, client_id, name, status, start_date, deadline, total_budget, currency)
VALUES (gen_random_uuid(), test_user_id, client_techstart, 'Website Redesign & UI Kit', 'aktif', '2025-11-01', '2026-01-15', 12500, 'USD')
RETURNING id INTO project_techstart_web;

-- Project 2: GreenLeaf Brand Identity (Active)
INSERT INTO projects (id, user_id, client_id, name, status, start_date, deadline, total_budget, currency)
VALUES (gen_random_uuid(), test_user_id, client_greenleaf, 'Complete Brand Identity Package', 'aktif', '2025-12-01', '2026-02-28', 8500, 'USD')
RETURNING id INTO project_greenleaf_brand;

-- Project 3: UrbanFit Mobile App UI (Proposal)
INSERT INTO projects (id, user_id, client_id, name, status, start_date, deadline, total_budget, currency)
VALUES (gen_random_uuid(), test_user_id, client_urbanfit, 'Fitness App UI/UX Design', 'teklif', '2026-01-15', '2026-04-30', 18000, 'USD')
RETURNING id INTO project_urbanfit_app;

-- Project 4: Artisan Café Menu Design (Completed)
INSERT INTO projects (id, user_id, client_id, name, status, start_date, deadline, total_budget, currency)
VALUES (gen_random_uuid(), test_user_id, client_artisancafe, 'Menu & Packaging Design', 'tamamlandi', '2025-09-01', '2025-10-31', 4500, 'USD')
RETURNING id INTO project_artisan_menu;

-- Project 5: Mindful App Dashboard (Active)
INSERT INTO projects (id, user_id, client_id, name, status, start_date, deadline, total_budget, currency)
VALUES (gen_random_uuid(), test_user_id, client_mindfulapp, 'Analytics Dashboard UI', 'aktif', '2025-11-15', '2026-01-31', 9500, 'USD')
RETURNING id INTO project_mindful_ui;

-- --------------------------------------------------------
-- 5. PROJECT TASKS (Kanban Board)
-- --------------------------------------------------------

-- TechStart Website Redesign Tasks
INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
(test_user_id, project_techstart_web, 'Competitive Analysis', 'Research competitor websites and identify design trends', 'done', 'high', '2025-11-10', 0),
(test_user_id, project_techstart_web, 'User Persona Development', 'Create 3 detailed user personas based on client data', 'done', 'high', '2025-11-15', 1),
(test_user_id, project_techstart_web, 'Wireframes - Homepage', 'Low-fidelity wireframes for the main landing page', 'done', 'high', '2025-11-20', 2),
(test_user_id, project_techstart_web, 'Wireframes - Product Pages', 'Wireframes for product listing and detail pages', 'done', 'medium', '2025-11-25', 3),
(test_user_id, project_techstart_web, 'Design System Setup', 'Create Figma component library with colors, typography, and spacing', 'in_progress', 'high', '2025-12-15', 4),
(test_user_id, project_techstart_web, 'High-Fidelity Mockups - Homepage', 'Polished designs for desktop and mobile homepage', 'in_progress', 'high', '2025-12-20', 5),
(test_user_id, project_techstart_web, 'High-Fidelity Mockups - Inner Pages', 'Designs for About, Contact, and Blog pages', 'todo', 'medium', '2025-12-28', 6),
(test_user_id, project_techstart_web, 'Interactive Prototype', 'Clickable prototype in Figma for client review', 'todo', 'high', '2026-01-05', 7),
(test_user_id, project_techstart_web, 'Design Handoff Documentation', 'Prepare specs and assets for development team', 'backlog', 'medium', '2026-01-10', 8);

-- GreenLeaf Brand Identity Tasks
INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
(test_user_id, project_greenleaf_brand, 'Brand Discovery Workshop', 'Virtual session with client to understand brand values', 'done', 'high', '2025-12-05', 0),
(test_user_id, project_greenleaf_brand, 'Mood Board Creation', 'Visual direction exploration with color palettes and imagery', 'done', 'medium', '2025-12-10', 1),
(test_user_id, project_greenleaf_brand, 'Logo Concepts - Round 1', 'Present 5 initial logo concepts', 'in_progress', 'high', '2025-12-18', 2),
(test_user_id, project_greenleaf_brand, 'Logo Refinement', 'Refine selected concept with client feedback', 'todo', 'high', '2025-12-28', 3),
(test_user_id, project_greenleaf_brand, 'Brand Guidelines Document', '20+ page brand book with usage rules', 'backlog', 'medium', '2026-01-15', 4),
(test_user_id, project_greenleaf_brand, 'Business Card Design', 'Design for standard and premium business cards', 'backlog', 'low', '2026-01-20', 5),
(test_user_id, project_greenleaf_brand, 'Social Media Templates', 'Instagram, LinkedIn, and Facebook templates', 'backlog', 'medium', '2026-02-01', 6);

-- Mindful App Dashboard Tasks
INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
(test_user_id, project_mindful_ui, 'Dashboard Requirements Gathering', 'Document all metrics and KPIs to display', 'done', 'high', '2025-11-20', 0),
(test_user_id, project_mindful_ui, 'Information Architecture', 'Create sitemap and navigation structure', 'done', 'high', '2025-11-25', 1),
(test_user_id, project_mindful_ui, 'Dashboard Wireframes', 'Layout options for main analytics view', 'review', 'high', '2025-12-05', 2),
(test_user_id, project_mindful_ui, 'Chart Component Design', 'Design library for graphs and data visualizations', 'in_progress', 'high', '2025-12-15', 3),
(test_user_id, project_mindful_ui, 'Dark Mode Variants', 'Create dark theme versions of all components', 'todo', 'medium', '2025-12-22', 4),
(test_user_id, project_mindful_ui, 'Settings & Profile Pages', 'User settings and account management screens', 'backlog', 'low', '2026-01-10', 5);

-- --------------------------------------------------------
-- 6. TRANSACTIONS (Income & Expenses)
-- --------------------------------------------------------

-- Income from completed project
INSERT INTO transactions (user_id, project_id, type, amount, transaction_date, is_paid, description) VALUES
(test_user_id, project_artisan_menu, 'income', 2250, '2025-09-15', true, 'Artisan Café - 50% upfront payment'),
(test_user_id, project_artisan_menu, 'income', 2250, '2025-11-05', true, 'Artisan Café - Final payment on delivery');

-- Income from active projects
INSERT INTO transactions (user_id, project_id, type, amount, transaction_date, is_paid, description) VALUES
(test_user_id, project_techstart_web, 'income', 5000, '2025-11-05', true, 'TechStart - Initial deposit (40%)'),
(test_user_id, project_techstart_web, 'income', 3750, '2025-12-15', false, 'TechStart - Milestone 1 payment (30%)'),
(test_user_id, project_greenleaf_brand, 'income', 4250, '2025-12-05', true, 'GreenLeaf - 50% upfront payment'),
(test_user_id, project_mindful_ui, 'income', 3800, '2025-11-20', true, 'Mindful App - Initial deposit (40%)'),
(test_user_id, project_mindful_ui, 'income', 2850, '2025-12-20', false, 'Mindful App - Phase 1 completion (30%)');

-- Business Expenses
INSERT INTO transactions (user_id, type, amount, transaction_date, is_paid, description) VALUES
(test_user_id, 'expense', 14.99, '2025-11-01', true, 'Figma Professional subscription'),
(test_user_id, 'expense', 12.99, '2025-11-01', true, 'Adobe Creative Cloud - Photography plan'),
(test_user_id, 'expense', 29.99, '2025-11-01', true, 'Webflow subscription'),
(test_user_id, 'expense', 9.99, '2025-11-05', true, 'Envato Elements subscription'),
(test_user_id, 'expense', 49.00, '2025-11-10', true, 'UI8 Premium icons pack'),
(test_user_id, 'expense', 199.00, '2025-11-15', true, 'New Wacom tablet stylus'),
(test_user_id, 'expense', 14.99, '2025-12-01', true, 'Figma Professional subscription'),
(test_user_id, 'expense', 12.99, '2025-12-01', true, 'Adobe Creative Cloud - Photography plan'),
(test_user_id, 'expense', 29.99, '2025-12-01', true, 'Webflow subscription'),
(test_user_id, 'expense', 9.99, '2025-12-05', true, 'Envato Elements subscription'),
(test_user_id, 'expense', 85.00, '2025-12-10', true, 'Design conference ticket - virtual');

-- --------------------------------------------------------
-- 7. ASSETS
-- --------------------------------------------------------
INSERT INTO assets (user_id, type, name, amount, currency) VALUES
(test_user_id, 'bank', 'Chase Business Checking', 12450.00, 'USD'),
(test_user_id, 'bank', 'Wise Multi-currency Account', 3200.00, 'USD'),
(test_user_id, 'cash', 'Petty Cash', 350.00, 'USD'),
(test_user_id, 'stock', 'Apple Inc. (AAPL)', 2500.00, 'USD'),
(test_user_id, 'stock', 'Invesco QQQ Trust', 1800.00, 'USD'),
(test_user_id, 'crypto', 'Bitcoin (BTC)', 1250.00, 'USD'),
(test_user_id, 'crypto', 'Ethereum (ETH)', 750.00, 'USD');

-- --------------------------------------------------------
-- 8. RECURRING ITEMS (for Financial Projections)
-- --------------------------------------------------------

-- Recurring Income
INSERT INTO recurring_items (user_id, name, type, amount, frequency, start_date, end_date) VALUES
(test_user_id, 'Retainer - TechStart Support', 'income', 1500, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Passive Income - UI Kit Sales', 'income', 400, 'monthly', '2025-06-01', NULL),
(test_user_id, 'Dribbble Pro Revenue Share', 'income', 150, 'monthly', '2025-03-01', NULL);

-- Recurring Expenses
INSERT INTO recurring_items (user_id, name, type, amount, frequency, start_date, end_date) VALUES
(test_user_id, 'Figma Professional', 'expense', 15, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Adobe Creative Cloud', 'expense', 55, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Webflow Hosting', 'expense', 30, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Envato Elements', 'expense', 10, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Notion Pro', 'expense', 8, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Co-working Space Membership', 'expense', 250, 'monthly', '2025-01-01', NULL),
(test_user_id, 'Health Insurance', 'expense', 450, 'monthly', '2025-01-01', NULL),
(test_user_id, 'MacBook Pro Financing', 'expense', 180, 'monthly', '2024-06-01', '2026-06-01'),
(test_user_id, 'Professional Liability Insurance', 'expense', 600, 'yearly', '2025-01-01', NULL);

-- --------------------------------------------------------
-- 9. NOTIFICATIONS (Welcome messages)
-- --------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
(test_user_id, 'Welcome to MergenFlow! 🎉', 'Your account is set up and ready to go. Start by exploring your dashboard.', 'success', false, '/dashboard'),
(test_user_id, 'Upcoming Deadline', 'TechStart Website Redesign milestone is due in 5 days.', 'warning', false, '/dashboard/projects'),
(test_user_id, 'Payment Reminder', 'GreenLeaf Brand Identity second payment ($4,250) is scheduled for Jan 15.', 'info', false, '/dashboard/transactions'),
(test_user_id, 'New Feature: Debt Analysis', 'Check out the new debt payoff analysis in your Projections page!', 'info', true, '/dashboard/projections');

END $$;

-- ========================================================
-- VERIFICATION QUERIES (Run these to check data)
-- ========================================================
/*
-- Check all data for test user
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles WHERE email = 'alex@designstudio.com'
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com')
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com')
UNION ALL
SELECT 'Tasks', COUNT(*) FROM project_tasks WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com')
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com')
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com')
UNION ALL
SELECT 'Recurring Items', COUNT(*) FROM recurring_items WHERE user_id IN (SELECT id FROM profiles WHERE email = 'alex@designstudio.com');
*/

-- ========================================================
-- CLEANUP (Run this to remove all test data)
-- ========================================================
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM profiles WHERE email = 'alex@designstudio.com';
    
    IF test_user_id IS NOT NULL THEN
        DELETE FROM notifications WHERE user_id = test_user_id;
        DELETE FROM notification_rules WHERE user_id = test_user_id;
        DELETE FROM user_activity_logs WHERE user_id = test_user_id;
        DELETE FROM recurring_items WHERE user_id = test_user_id;
        DELETE FROM assets WHERE user_id = test_user_id;
        DELETE FROM transactions WHERE user_id = test_user_id;
        DELETE FROM project_tasks WHERE user_id = test_user_id;
        DELETE FROM projects WHERE user_id = test_user_id;
        DELETE FROM clients WHERE user_id = test_user_id;
        DELETE FROM user_settings WHERE user_id = test_user_id;
        DELETE FROM profiles WHERE id = test_user_id;
        -- Note: You also need to delete the user from auth.users in Supabase Dashboard
    END IF;
END $$;
*/
