-- ========================================================
-- MergenFlow Pro - Seed Data (Demo Data)
-- ========================================================
-- 
-- Run this AFTER the main supabase.sql schema
-- This creates demo data for a test user
--
-- NOTE: Replace 'YOUR_USER_ID' with your actual user UUID
-- You can find it in Supabase Dashboard > Authentication > Users
--
-- ========================================================

-- --------------------------------------------------------
-- DEMO FUNCTION (Creates data for a specific user)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_demo_data(demo_user_id UUID)
RETURNS void AS $$
DECLARE
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
    project1_id UUID;
    project2_id UUID;
    project3_id UUID;
    project4_id UUID;
    tag1_id UUID;
    tag2_id UUID;
    tag3_id UUID;
    tag4_id UUID;
    tag5_id UUID;
BEGIN
    -- --------------------------------------------------------
    -- CLIENTS
    -- --------------------------------------------------------
    INSERT INTO clients (id, user_id, company_name, contact_person, email, phone, notes)
    VALUES 
        (gen_random_uuid(), demo_user_id, 'TechStart Yazılım', 'Ahmet Yılmaz', 'ahmet@techstart.com', '+90 532 111 2233', 'E-ticaret projesi için iletişime geçti')
    RETURNING id INTO client1_id;

    INSERT INTO clients (id, user_id, company_name, contact_person, email, phone, notes)
    VALUES 
        (gen_random_uuid(), demo_user_id, 'Dijital Ajans Co.', 'Zeynep Kaya', 'zeynep@dijitalajans.com', '+90 533 222 3344', 'Düzenli müşteri, aylık bakım sözleşmesi var')
    RETURNING id INTO client2_id;

    INSERT INTO clients (id, user_id, company_name, contact_person, email, phone, notes)
    VALUES 
        (gen_random_uuid(), demo_user_id, 'Startup Hub', 'Mehmet Demir', 'mehmet@startuphub.io', '+90 534 333 4455', 'Yeni kurulan startup, mobil uygulama projesi')
    RETURNING id INTO client3_id;

    -- --------------------------------------------------------
    -- PROJECTS
    -- --------------------------------------------------------
    INSERT INTO projects (id, user_id, client_id, name, description, status, start_date, deadline, total_budget, currency, pricing_type, hourly_rate, estimated_hours)
    VALUES 
        (gen_random_uuid(), demo_user_id, client1_id, 'E-Ticaret Web Sitesi', 'Next.js ve Supabase ile modern e-ticaret sitesi geliştirme', 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 45000, 'TRY', 'fixed', NULL, NULL)
    RETURNING id INTO project1_id;

    INSERT INTO projects (id, user_id, client_id, name, description, status, start_date, deadline, total_budget, currency, pricing_type, hourly_rate, estimated_hours)
    VALUES 
        (gen_random_uuid(), demo_user_id, client2_id, 'Kurumsal Web Sitesi Yenileme', 'Mevcut sitenin modern tasarımla yenilenmesi', 'completed', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '10 days', 25000, 'TRY', 'fixed', NULL, NULL)
    RETURNING id INTO project2_id;

    INSERT INTO projects (id, user_id, client_id, name, description, status, start_date, deadline, total_budget, currency, pricing_type, hourly_rate, estimated_hours)
    VALUES 
        (gen_random_uuid(), demo_user_id, client3_id, 'Mobil Uygulama MVP', 'React Native ile iOS ve Android uygulama', 'proposal', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '90 days', 80000, 'TRY', 'hourly', 500, 160)
    RETURNING id INTO project3_id;

    INSERT INTO projects (id, user_id, client_id, name, description, status, start_date, deadline, total_budget, currency, pricing_type, hourly_rate, estimated_hours)
    VALUES 
        (gen_random_uuid(), demo_user_id, client2_id, 'Aylık SEO ve Bakım', 'Düzenli site bakımı ve SEO optimizasyonu', 'active', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '270 days', 36000, 'TRY', 'hourly', 400, 10)
    RETURNING id INTO project4_id;

    -- --------------------------------------------------------
    -- PROJECT TASKS
    -- --------------------------------------------------------
    -- E-Ticaret Projesi Görevleri
    INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
        (demo_user_id, project1_id, 'Veritabanı tasarımı', 'Ürün, sipariş ve kullanıcı tablolarının tasarımı', 'done', 'high', CURRENT_DATE - INTERVAL '20 days', 1),
        (demo_user_id, project1_id, 'API geliştirme', 'REST API endpoint''lerinin oluşturulması', 'done', 'high', CURRENT_DATE - INTERVAL '10 days', 2),
        (demo_user_id, project1_id, 'Ödeme entegrasyonu', 'İyzico/Stripe entegrasyonu', 'in_progress', 'high', CURRENT_DATE + INTERVAL '5 days', 3),
        (demo_user_id, project1_id, 'Admin paneli', 'Ürün ve sipariş yönetimi', 'todo', 'medium', CURRENT_DATE + INTERVAL '15 days', 4),
        (demo_user_id, project1_id, 'Mobil responsive', 'Tüm sayfaların mobil uyumluluğu', 'todo', 'medium', CURRENT_DATE + INTERVAL '20 days', 5),
        (demo_user_id, project1_id, 'Test ve QA', 'Kapsamlı test süreci', 'backlog', 'low', CURRENT_DATE + INTERVAL '25 days', 6);

    -- Kurumsal Site Görevleri (tamamlanmış)
    INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
        (demo_user_id, project2_id, 'Tasarım mockup', 'Figma ile UI/UX tasarımı', 'done', 'high', CURRENT_DATE - INTERVAL '50 days', 1),
        (demo_user_id, project2_id, 'Frontend geliştirme', 'React ile sayfa geliştirme', 'done', 'high', CURRENT_DATE - INTERVAL '30 days', 2),
        (demo_user_id, project2_id, 'İçerik aktarımı', 'Mevcut içeriklerin taşınması', 'done', 'medium', CURRENT_DATE - INTERVAL '15 days', 3);

    -- Bakım Projesi Görevleri
    INSERT INTO project_tasks (user_id, project_id, title, description, status, priority, due_date, order_index) VALUES
        (demo_user_id, project4_id, 'Aralık SEO raporu', 'Aylık performans analizi', 'in_progress', 'medium', CURRENT_DATE + INTERVAL '7 days', 1),
        (demo_user_id, project4_id, 'Güvenlik güncellemesi', 'WordPress ve eklenti güncellemeleri', 'todo', 'high', CURRENT_DATE + INTERVAL '3 days', 2);

    -- --------------------------------------------------------
    -- TRANSACTIONS
    -- --------------------------------------------------------
    -- Gelirler
    INSERT INTO transactions (user_id, project_id, type, amount, transaction_date, is_paid, description, category) VALUES
        (demo_user_id, project2_id, 'income', 25000, CURRENT_DATE - INTERVAL '10 days', TRUE, 'Kurumsal site projesi - Son ödeme', 'freelance'),
        (demo_user_id, project1_id, 'income', 15000, CURRENT_DATE - INTERVAL '25 days', TRUE, 'E-ticaret projesi - Ön ödeme', 'freelance'),
        (demo_user_id, project1_id, 'income', 15000, CURRENT_DATE + INTERVAL '5 days', FALSE, 'E-ticaret projesi - Ara ödeme', 'freelance'),
        (demo_user_id, project1_id, 'income', 15000, CURRENT_DATE + INTERVAL '30 days', FALSE, 'E-ticaret projesi - Son ödeme', 'freelance'),
        (demo_user_id, project4_id, 'income', 3000, CURRENT_DATE - INTERVAL '5 days', TRUE, 'Kasım ayı bakım ücreti', 'freelance'),
        (demo_user_id, project4_id, 'income', 3000, CURRENT_DATE + INTERVAL '25 days', FALSE, 'Aralık ayı bakım ücreti', 'freelance'),
        (demo_user_id, NULL, 'income', 8500, CURRENT_DATE - INTERVAL '15 days', TRUE, 'Logo tasarım işi', 'freelance');

    -- Giderler
    INSERT INTO transactions (user_id, project_id, type, amount, transaction_date, is_paid, description, category) VALUES
        (demo_user_id, NULL, 'expense', 2500, CURRENT_DATE - INTERVAL '20 days', TRUE, 'Ofis kirası', 'rent'),
        (demo_user_id, NULL, 'expense', 350, CURRENT_DATE - INTERVAL '18 days', TRUE, 'İnternet + Telefon', 'utilities'),
        (demo_user_id, NULL, 'expense', 99, CURRENT_DATE - INTERVAL '10 days', TRUE, 'GitHub Pro abonelik', 'software'),
        (demo_user_id, NULL, 'expense', 49, CURRENT_DATE - INTERVAL '10 days', TRUE, 'Figma abonelik', 'software'),
        (demo_user_id, NULL, 'expense', 199, CURRENT_DATE - INTERVAL '5 days', TRUE, 'Vercel Pro', 'hosting'),
        (demo_user_id, NULL, 'expense', 2500, CURRENT_DATE + INTERVAL '10 days', FALSE, 'Ofis kirası - Aralık', 'rent'),
        (demo_user_id, project1_id, 'expense', 500, CURRENT_DATE - INTERVAL '8 days', TRUE, 'Stock fotoğraflar', 'project'),
        (demo_user_id, NULL, 'expense', 750, CURRENT_DATE - INTERVAL '3 days', TRUE, 'Freelancer sigorta', 'insurance');

    -- --------------------------------------------------------
    -- ASSETS
    -- --------------------------------------------------------
    INSERT INTO assets (user_id, type, name, amount, quantity, unit_price, currency, purchase_date, notes) VALUES
        (demo_user_id, 'bank', 'Akbank Vadesiz', 45000, NULL, NULL, 'TRY', NULL, 'Ana çalışma hesabı'),
        (demo_user_id, 'bank', 'Wise USD', 2500, NULL, NULL, 'USD', NULL, 'Yurtdışı müşteriler için'),
        (demo_user_id, 'cash', 'Nakit', 3500, NULL, NULL, 'TRY', NULL, 'Cüzdan + kasa'),
        (demo_user_id, 'gold', 'Gram Altın', 85000, 25, 3400, 'TRY', CURRENT_DATE - INTERVAL '180 days', 'Uzun vadeli birikim'),
        (demo_user_id, 'crypto', 'Bitcoin', 15000, 0.08, 187500, 'TRY', CURRENT_DATE - INTERVAL '90 days', 'BTC yatırımı'),
        (demo_user_id, 'crypto', 'Ethereum', 8000, 1.2, 6666, 'TRY', CURRENT_DATE - INTERVAL '60 days', 'ETH yatırımı');

    -- --------------------------------------------------------
    -- RECURRING ITEMS
    -- --------------------------------------------------------
    INSERT INTO recurring_items (user_id, name, type, amount, frequency, start_date, end_date) VALUES
        (demo_user_id, 'Ofis Kirası', 'expense', 2500, 'monthly', CURRENT_DATE - INTERVAL '365 days', NULL),
        (demo_user_id, 'İnternet + Telefon', 'expense', 350, 'monthly', CURRENT_DATE - INTERVAL '365 days', NULL),
        (demo_user_id, 'Yazılım Abonelikleri', 'expense', 350, 'monthly', CURRENT_DATE - INTERVAL '180 days', NULL),
        (demo_user_id, 'Hosting (Yıllık)', 'expense', 1200, 'yearly', CURRENT_DATE - INTERVAL '60 days', NULL),
        (demo_user_id, 'Dijital Ajans Bakım', 'income', 3000, 'monthly', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '270 days');

    -- --------------------------------------------------------
    -- TAGS
    -- --------------------------------------------------------
    INSERT INTO tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), demo_user_id, 'Öncelikli', '#ef4444')
    RETURNING id INTO tag1_id;

    INSERT INTO tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), demo_user_id, 'Web Geliştirme', '#3b82f6')
    RETURNING id INTO tag2_id;

    INSERT INTO tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), demo_user_id, 'Mobil', '#8b5cf6')
    RETURNING id INTO tag3_id;

    INSERT INTO tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), demo_user_id, 'Tasarım', '#ec4899')
    RETURNING id INTO tag4_id;

    INSERT INTO tags (id, user_id, name, color)
    VALUES (gen_random_uuid(), demo_user_id, 'Bakım', '#22c55e')
    RETURNING id INTO tag5_id;

    -- Project Tags
    INSERT INTO project_tags (project_id, tag_id) VALUES
        (project1_id, tag1_id),
        (project1_id, tag2_id),
        (project2_id, tag2_id),
        (project2_id, tag4_id),
        (project3_id, tag3_id),
        (project4_id, tag5_id);

    -- --------------------------------------------------------
    -- GOALS
    -- --------------------------------------------------------
    INSERT INTO goals (user_id, title, description, type, target_value, current_value, period, start_date, end_date, is_completed) VALUES
        (demo_user_id, 'Aylık Gelir Hedefi', 'Bu ay 50.000 TL gelir elde etmek', 'income', 50000, 28500, 'monthly', DATE_TRUNC('month', CURRENT_DATE)::DATE, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE, FALSE),
        (demo_user_id, 'Yıllık Proje Sayısı', '2024 yılında 12 proje tamamlamak', 'projects', 12, 8, 'yearly', '2024-01-01', '2024-12-31', FALSE),
        (demo_user_id, 'Haftalık Çalışma', 'Bu hafta 40 saat çalışmak', 'hours', 40, 32, 'weekly', DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE, FALSE),
        (demo_user_id, 'Altın Biriktirme', 'Yıl sonuna kadar 50 gram altın biriktirmek', 'savings', 50, 25, 'yearly', '2024-01-01', '2024-12-31', FALSE);

    -- --------------------------------------------------------
    -- TIME ENTRIES
    -- --------------------------------------------------------
    INSERT INTO time_entries (user_id, project_id, task_id, description, start_time, end_time, duration_minutes, is_billable, hourly_rate) VALUES
        (demo_user_id, project1_id, NULL, 'API geliştirme çalışması', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days', 240, TRUE, 450),
        (demo_user_id, project1_id, NULL, 'Veritabanı optimizasyonu', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 3 hours', 180, TRUE, 450),
        (demo_user_id, project4_id, NULL, 'SEO analizi', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 120, TRUE, 400),
        (demo_user_id, project1_id, NULL, 'Code review ve bug fix', NOW() - INTERVAL '5 days 5 hours', NOW() - INTERVAL '5 days 2 hours', 180, TRUE, 450);

    -- --------------------------------------------------------
    -- NOTIFICATIONS
    -- --------------------------------------------------------
    INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
        (demo_user_id, 'Hoş Geldiniz! 🎉', 'MergenFlow Pro''ya hoş geldiniz. Demo verileriyle uygulamayı keşfedebilirsiniz.', 'success', FALSE, '/dashboard'),
        (demo_user_id, 'Ödeme Hatırlatması', 'E-Ticaret projesi ara ödemesi 5 gün içinde bekleniyor.', 'reminder', FALSE, '/dashboard/transactions'),
        (demo_user_id, 'Görev Tarihi Yaklaşıyor', 'Güvenlik güncellemesi görevi 3 gün içinde tamamlanmalı.', 'warning', FALSE, '/dashboard/projects');

    -- --------------------------------------------------------
    -- USER SETTINGS
    -- --------------------------------------------------------
    UPDATE user_settings 
    SET 
        default_currency = 'TRY',
        theme = 'system',
        language = 'tr',
        default_hourly_rate = 450,
        inflation_rate = 50,
        salary_increase_rate = 30
    WHERE user_id = demo_user_id;

END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- HOW TO USE:
-- ========================================================
-- 1. First, create an account in the app
-- 2. Go to Supabase Dashboard > Authentication > Users
-- 3. Copy your user's UUID
-- 4. Run this command (replace with your UUID):
--
--    SELECT seed_demo_data('YOUR-USER-UUID-HERE');
--
-- Example:
--    SELECT seed_demo_data('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
--
-- ========================================================

-- To clean demo data and start fresh:
-- DELETE FROM clients WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM projects WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM transactions WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM assets WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM recurring_items WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM tags WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM goals WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM time_entries WHERE user_id = 'YOUR-USER-UUID-HERE';
-- DELETE FROM notifications WHERE user_id = 'YOUR-USER-UUID-HERE';
