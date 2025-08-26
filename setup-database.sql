-- ModAPK Platform - Complete Database Setup Script
-- This script creates all necessary tables, policies, and sample data
-- Run this script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (uncomment if you want to recreate tables)
-- ============================================================================
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.downloads CASCADE;
-- DROP TABLE IF EXISTS public.submissions CASCADE;
-- DROP TABLE IF EXISTS public.apks CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT,
    count INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APKs table
CREATE TABLE IF NOT EXISTS public.apks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    package_name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES public.categories(name) ON UPDATE CASCADE,
    description TEXT,
    download_url TEXT NOT NULL,
    icon_url TEXT,
    screenshot_urls TEXT[],
    file_size TEXT,
    android_version TEXT,
    download_count INTEGER DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    features TEXT[],
    tags TEXT[],
    permissions TEXT[],
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    profile_avatar TEXT,
    favorites UUID[],
    download_history UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apk_id UUID NOT NULL REFERENCES public.apks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(apk_id, user_id) -- One review per user per APK
);

-- Downloads table (for analytics)
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apk_id UUID NOT NULL REFERENCES public.apks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    country_code TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table (for user uploads)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apk_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- APKs indexes
CREATE INDEX IF NOT EXISTS idx_apks_category ON public.apks(category);
CREATE INDEX IF NOT EXISTS idx_apks_featured ON public.apks(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_apks_trending ON public.apks(trending) WHERE trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_apks_verified ON public.apks(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_apks_download_count ON public.apks(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_apks_rating ON public.apks(rating DESC);
CREATE INDEX IF NOT EXISTS idx_apks_created_at ON public.apks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apks_search ON public.apks USING gin(to_tsvector('english', name || ' ' || description));

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_apk_id ON public.reviews(apk_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Downloads indexes
CREATE INDEX IF NOT EXISTS idx_downloads_apk_id ON public.downloads(apk_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON public.downloads(downloaded_at DESC);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Categories policies
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- APKs policies
DROP POLICY IF EXISTS "Public read access for apks" ON public.apks;
CREATE POLICY "Public read access for apks" ON public.apks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage apks" ON public.apks;
CREATE POLICY "Admin manage apks" ON public.apks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users policies
DROP POLICY IF EXISTS "Users read own profile" ON public.users;
CREATE POLICY "Users read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin read all users" ON public.users;
CREATE POLICY "Admin read all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Reviews policies
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert reviews" ON public.reviews;
CREATE POLICY "Users insert reviews" ON public.reviews
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;
CREATE POLICY "Users update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own reviews" ON public.reviews;
CREATE POLICY "Users delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Downloads policies
DROP POLICY IF EXISTS "Users insert downloads" ON public.downloads;
CREATE POLICY "Users insert downloads" ON public.downloads
    FOR INSERT TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read downloads" ON public.downloads;
CREATE POLICY "Admin read downloads" ON public.downloads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Submissions policies
DROP POLICY IF EXISTS "Users insert submissions" ON public.submissions;
CREATE POLICY "Users insert submissions" ON public.submissions
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users read own submissions" ON public.submissions;
CREATE POLICY "Users read own submissions" ON public.submissions
    FOR SELECT USING (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admin manage submissions" ON public.submissions;
CREATE POLICY "Admin manage submissions" ON public.submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update category count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count for the category
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories 
        SET count = count + 1 
        WHERE name = NEW.category;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.categories 
        SET count = count - 1 
        WHERE name = OLD.category;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If category changed
        IF OLD.category != NEW.category THEN
            UPDATE public.categories 
            SET count = count - 1 
            WHERE name = OLD.category;
            UPDATE public.categories 
            SET count = count + 1 
            WHERE name = NEW.category;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for category count
DROP TRIGGER IF EXISTS category_count_trigger ON public.apks;
CREATE TRIGGER category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.apks
    FOR EACH ROW EXECUTE FUNCTION update_category_count();

-- Function to update APK rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_apk_rating()
RETURNS TRIGGER AS $$
DECLARE
    apk_uuid UUID;
    avg_rating NUMERIC;
    review_cnt INTEGER;
BEGIN
    -- Get the APK ID
    apk_uuid := COALESCE(NEW.apk_id, OLD.apk_id);
    
    -- Calculate new average rating and review count
    SELECT 
        ROUND(AVG(rating), 1),
        COUNT(*)
    INTO avg_rating, review_cnt
    FROM public.reviews 
    WHERE apk_id = apk_uuid;
    
    -- Update the APK
    UPDATE public.apks 
    SET 
        rating = COALESCE(avg_rating, 0),
        review_count = review_cnt
    WHERE id = apk_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for APK rating update
DROP TRIGGER IF EXISTS apk_rating_trigger ON public.reviews;
CREATE TRIGGER apk_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_apk_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.apks 
    SET download_count = download_count + 1 
    WHERE id = NEW.apk_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for download count
DROP TRIGGER IF EXISTS download_count_trigger ON public.downloads;
CREATE TRIGGER download_count_trigger
    AFTER INSERT ON public.downloads
    FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.created_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- INSERT SAMPLE CATEGORIES
-- ============================================================================

INSERT INTO public.categories (name, icon, color, description) VALUES
('Social', 'fas fa-users', '#4267B2', 'Social networking and messaging apps'),
('Music', 'fas fa-music', '#1DB954', 'Music streaming and audio apps'),
('Entertainment', 'fas fa-film', '#FF0000', 'Video streaming and entertainment apps'),
('Games', 'fas fa-gamepad', '#FF6B6B', 'Gaming apps and modified games'),
('Photography', 'fas fa-camera', '#E1306C', 'Photo editing and camera apps'),
('Productivity', 'fas fa-briefcase', '#4285F4', 'Office and productivity tools'),
('Tools', 'fas fa-wrench', '#FF9500', 'Utility and system tools'),
('Communication', 'fas fa-comments', '#25D366', 'Messaging and communication apps'),
('Shopping', 'fas fa-shopping-cart', '#FF9900', 'Shopping and e-commerce apps'),
('Travel', 'fas fa-map', '#1976D2', 'Travel and navigation apps')
ON CONFLICT (name) DO UPDATE SET
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description;

-- ============================================================================
-- INSERT SAMPLE APKS
-- ============================================================================

INSERT INTO public.apks (
    name, version, package_name, category, description, download_url, icon_url, 
    screenshot_urls, file_size, android_version, features, tags, permissions,
    verified, featured, trending, rating, review_count, download_count
) VALUES 
(
    'WhatsApp Plus',
    '17.60.2',
    'com.whatsapp.plus',
    'Social',
    'Enhanced WhatsApp with advanced privacy features, custom themes, extended media sharing, message scheduling, and anti-ban protection. This modified version includes all premium features unlocked.',
    'https://download.apkpure.com/b/XAPK/Y29tLndoYXRzYXBwLnBsdXM',
    'https://images.sftcdn.net/images/t_app-icon-m/p/f4fbbd96-9b15-11e6-91f5-00163ed833e7/1919082909/whatsapp-messenger-icon.png',
    ARRAY[
        'https://images.apkpure.com/whatsapp/screenshot-1.jpg',
        'https://images.apkpure.com/whatsapp/screenshot-2.jpg',
        'https://images.apkpure.com/whatsapp/screenshot-3.jpg'
    ],
    '58.7 MB',
    '4.4+',
    ARRAY['Custom Themes', 'Privacy Options', 'Anti-Ban Protection', 'Message Scheduling', 'Extended Media Sharing'],
    ARRAY['messaging', 'social', 'themes', 'privacy'],
    ARRAY['Camera', 'Contacts', 'Microphone', 'Storage', 'Phone'],
    true, true, true, 4.8, 12047, 2847362
),
(
    'Spotify Premium',
    '8.7.88.475',
    'com.spotify.music.premium',
    'Music',
    'Unlock premium features including ad-free listening, unlimited skips, offline downloads, and high-quality streaming. Enjoy millions of songs without interruptions.',
    'https://download.apkpure.com/b/APK/Y29tLnNwb3RpZnkubXVzaWM',
    'https://images.sftcdn.net/images/t_app-icon-m/p/b49eeea8-9b1a-11e6-96f3-00163ed833e7/1919082943/spotify-music-icon.png',
    ARRAY[
        'https://images.apkpure.com/spotify/screenshot-1.jpg',
        'https://images.apkpure.com/spotify/screenshot-2.jpg'
    ],
    '31.4 MB',
    '5.0+',
    ARRAY['Ad-Free', 'Offline Downloads', 'Unlimited Skips', 'High Quality Audio'],
    ARRAY['music', 'streaming', 'premium', 'offline'],
    ARRAY['Storage', 'Network', 'Audio', 'Phone State'],
    true, true, true, 4.9, 18392, 3421876
),
(
    'Instagram Pro',
    '286.0.0.21.123',
    'com.instagram.android.pro',
    'Social',
    'Enhanced Instagram with download capabilities, story viewing without seen status, zoom profile pictures, and advanced privacy controls. Download photos and videos easily.',
    'https://download.apkpure.com/b/APK/Y29tLmluc3RhZ3JhbS5hbmRyb2lk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/f1a5e266-9b0e-11e6-8b90-00163ed833e7/1919082933/instagram-icon.png',
    ARRAY[
        'https://images.apkpure.com/instagram/screenshot-1.jpg',
        'https://images.apkpure.com/instagram/screenshot-2.jpg'
    ],
    '43.2 MB',
    '6.0+',
    ARRAY['Download Photos/Videos', 'Anonymous Story View', 'Zoom Profile Pics', 'No Ads'],
    ARRAY['social', 'photography', 'download', 'privacy'],
    ARRAY['Camera', 'Storage', 'Contacts', 'Location', 'Microphone'],
    true, true, false, 4.7, 8429, 1967543
),
(
    'YouTube Vanced',
    '18.23.35',
    'com.vanced.android.youtube',
    'Entertainment',
    'Advanced YouTube client with ad-blocking, background playback, dark theme, and additional customization options. The ultimate YouTube experience.',
    'https://download.apkpure.com/b/APK/Y29tLnZhbmNlZC5hbmRyb2lk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/f8a50dc0-9b1a-11e6-9f3a-00163ed833e7/1919082957/youtube-icon.png',
    ARRAY[
        'https://images.apkpure.com/youtube/screenshot-1.jpg',
        'https://images.apkpure.com/youtube/screenshot-2.jpg'
    ],
    '67.8 MB',
    '6.0+',
    ARRAY['Ad-Free', 'Background Play', 'Picture-in-Picture', 'Dark Theme'],
    ARRAY['video', 'entertainment', 'ad-free', 'background'],
    ARRAY['Storage', 'Network', 'Audio'],
    true, true, true, 4.9, 23847, 5234891
),
(
    'TikTok Pro',
    '29.8.4',
    'com.tiktok.pro',
    'Social',
    'Enhanced TikTok with video download capabilities, ad removal features, and advanced sharing options. Save any TikTok video without watermarks.',
    'https://download.apkpure.com/b/APK/Y29tLnRpa3Rvay5wcm8',
    'https://images.sftcdn.net/images/t_app-icon-m/p/8c1d6476-d6c7-11e9-b446-0242ac110002/3856510325/tiktok-icon.png',
    ARRAY[
        'https://images.apkpure.com/tiktok/screenshot-1.jpg',
        'https://images.apkpure.com/tiktok/screenshot-2.jpg'
    ],
    '89.3 MB',
    '5.0+',
    ARRAY['Video Download', 'No Watermark', 'Ad-Free', 'Enhanced Sharing'],
    ARRAY['social', 'video', 'download', 'entertainment'],
    ARRAY['Camera', 'Microphone', 'Storage', 'Location'],
    true, false, true, 4.6, 9876, 4123789
),
(
    'Netflix Mod',
    '8.45.0',
    'com.netflix.mod',
    'Entertainment',
    'Modified Netflix with premium features unlocked, ad-free streaming, and HD quality access. Enjoy unlimited content without subscription.',
    'https://download.apkpure.com/b/APK/Y29tLm5ldGZsaXgubW9k',
    'https://images.sftcdn.net/images/t_app-icon-m/p/f63ab7fc-9b14-11e6-a5e0-00163ed833e7/1919082935/netflix-icon.png',
    ARRAY[
        'https://images.apkpure.com/netflix/screenshot-1.jpg',
        'https://images.apkpure.com/netflix/screenshot-2.jpg'
    ],
    '45.7 MB',
    '7.0+',
    ARRAY['Premium Unlocked', 'HD Quality', 'Ad-Free', 'Offline Downloads'],
    ARRAY['streaming', 'entertainment', 'premium', 'movies'],
    ARRAY['Storage', 'Network'],
    true, true, false, 4.5, 15432, 2876543
);

-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================

-- Note: This will only work if you have an auth user with this email
-- You need to register this user first through your application
-- Then run this to make them admin:

-- UPDATE public.users 
-- SET role = 'super_admin' 
-- WHERE email = 'admin@modapk.com';

-- Alternatively, you can create a user manually if needed:
-- First register through your app, then update their role

-- ============================================================================
-- INSERT SAMPLE REVIEWS
-- ============================================================================

-- Note: These will only work if you have actual user IDs
-- Replace with real user IDs from your auth.users table

/*
INSERT INTO public.reviews (apk_id, user_id, rating, comment) VALUES
(
    (SELECT id FROM public.apks WHERE name = 'WhatsApp Plus' LIMIT 1),
    (SELECT id FROM public.users WHERE username = 'testuser' LIMIT 1),
    5,
    'Amazing mod! All features work perfectly. The themes are beautiful and privacy options are excellent.'
),
(
    (SELECT id FROM public.apks WHERE name = 'Spotify Premium' LIMIT 1),
    (SELECT id FROM public.users WHERE username = 'testuser' LIMIT 1),
    5,
    'Perfect! No ads and unlimited skips. High quality audio is fantastic.'
);
*/

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for popular APKs
CREATE OR REPLACE VIEW popular_apks AS
SELECT 
    id, name, version, category, icon_url, rating, 
    review_count, download_count, created_at
FROM public.apks 
WHERE verified = true 
ORDER BY download_count DESC, rating DESC;

-- View for featured APKs
CREATE OR REPLACE VIEW featured_apks AS
SELECT 
    id, name, version, category, icon_url, rating, 
    review_count, download_count, created_at
FROM public.apks 
WHERE featured = true AND verified = true
ORDER BY created_at DESC;

-- View for trending APKs
CREATE OR REPLACE VIEW trending_apks AS
SELECT 
    id, name, version, category, icon_url, rating, 
    review_count, download_count, created_at
FROM public.apks 
WHERE trending = true AND verified = true
ORDER BY download_count DESC, created_at DESC;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'ModAPK Platform database setup completed successfully!' as message;
SELECT 'Total categories created: ' || COUNT(*) as categories FROM public.categories;
SELECT 'Total APKs created: ' || COUNT(*) as apks FROM public.apks;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
NEXT STEPS TO COMPLETE SETUP:

1. Register your first user through the application
2. Update their role to 'super_admin':
   UPDATE public.users SET role = 'super_admin' WHERE email = 'your-email@example.com';

3. Configure Supabase Storage:
   - Create buckets: 'apk-files', 'screenshots', 'icons', 'user-avatars'
   - Set appropriate policies for public/private access

4. Enable realtime for tables you want live updates:
   ALTER PUBLICATION supabase_realtime ADD TABLE apks;
   ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
   ALTER PUBLICATION supabase_realtime ADD TABLE downloads;

5. Test your application with the sample data

6. Customize categories and add your own APKs through the admin panel
*/