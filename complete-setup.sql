-- ModAPK Platform - Complete Database Schema with Sample Data
-- Run this script to set up your database with all required tables and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create advertisements table (if not exists)
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('top', 'middle', 'bottom', 'sidebar')),
    content TEXT NOT NULL,
    target_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for advertisements
DROP POLICY IF EXISTS "Public read active ads" ON public.advertisements;
CREATE POLICY "Public read active ads" ON public.advertisements
FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admin manage ads" ON public.advertisements;
CREATE POLICY "Admin manage ads" ON public.advertisements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Insert sample categories (with proper data)
INSERT INTO public.categories (name, icon, color, description)
VALUES
('Social', 'fas fa-users', '#4267B2', 'Social networking and messaging apps'),
('Music', 'fas fa-music', '#1DB954', 'Music streaming and audio players'),
('Entertainment', 'fas fa-film', '#FF0000', 'Video streaming and entertainment apps'),
('Games', 'fas fa-gamepad', '#FF6B6B', 'Gaming apps and modified games'),
('Tools', 'fas fa-wrench', '#FFC107', 'Utility and productivity apps'),
('Photography', 'fas fa-camera', '#E91E63', 'Photo editing and camera apps'),
('Communication', 'fas fa-comments', '#00BCD4', 'Messaging and communication apps'),
('Finance', 'fas fa-dollar-sign', '#4CAF50', 'Banking and financial apps')
ON CONFLICT (name) DO NOTHING;

-- Insert sample APKs with realistic data
INSERT INTO public.apks (
    name, version, package_name, category, description, download_url, icon_url,
    file_size, android_version, features, tags, permissions,
    verified, featured, trending, download_count, rating, review_count
)
VALUES 
(
    'WhatsApp Plus',
    '17.60.2',
    'com.whatsapp.plus',
    'Social',
    'Enhanced WhatsApp with advanced privacy features, custom themes, extended media sharing capabilities, message scheduling, and anti-ban protection.',
    'https://example.com/whatsapp-plus.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/f4fbbd96-9b15-11e6-91f5-00163ed833e7/1919082909/whatsapp-messenger-icon.png',
    '58.7 MB',
    '4.4+',
    ARRAY['Custom Themes', 'Privacy Options', 'Anti-Ban Protection', 'Message Scheduling'],
    ARRAY['messaging', 'social', 'themes', 'privacy'],
    ARRAY['Camera', 'Contacts', 'Microphone', 'Storage', 'Phone'],
    TRUE, TRUE, TRUE, 2847592, 4.8, 15420
),
(
    'Spotify Premium',
    '8.7.88.475',
    'com.spotify.music.premium',
    'Music',
    'Unlock Spotify premium features including ad-free listening, unlimited skips, and offline downloads.',
    'https://example.com/spotify-premium.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/b49eeea8-9b1a-11e6-96f3-00163ed833e7/1919082943/spotify-music-icon.png',
    '31.4 MB',
    '5.0+',
    ARRAY['Ad-Free', 'Offline Downloads', 'Unlimited Skips', 'High Quality Audio'],
    ARRAY['music', 'streaming', 'premium'],
    TRUE, TRUE, FALSE, 3456789, 4.9, 28543
),
(
    'Instagram Pro',
    '286.0.0.21.123',
    'com.instagram.android.pro',
    'Social',
    'Instagram with additional features like photo/video downloading, zoom profile pictures, and no ads.',
    'https://example.com/instagram-pro.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/556d4eea-9b11-11e6-8a5b-00163ed833e7/1919082887/instagram-icon.png',
    '45.2 MB',
    '5.0+',
    ARRAY['Download Media', 'Zoom Profile Pictures', 'No Ads', 'Story Saver'],
    ARRAY['social', 'photography', 'downloader'],
    TRUE, FALSE, TRUE, 2045863, 4.7, 12890
),
(
    'YouTube Vanced',
    '18.23.35',
    'com.vanced.android.youtube',
    'Entertainment',
    'YouTube with background play, ad blocking, and additional customization options.',
    'https://example.com/youtube-vanced.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/c8d6f6f0-9b11-11e6-8bb1-00163ed833e7/1919082977/youtube-icon.png',
    '67.8 MB',
    '6.0+',
    ARRAY['Background Play', 'Ad Blocking', 'Picture-in-Picture', 'Custom Themes'],
    ARRAY['video', 'entertainment', 'adblock'],
    TRUE, TRUE, TRUE, 5234567, 4.9, 45678
),
(
    'TikTok Pro',
    '28.5.4',
    'com.tiktok.pro',
    'Social',
    'TikTok with video downloading capabilities and without watermarks.',
    'https://example.com/tiktok-pro.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/d7e8f9a0-9b12-11e6-8cc2-00163ed833e7/1919083088/tiktok-icon.png',
    '89.3 MB',
    '5.1+',
    ARRAY['Download Videos', 'No Watermark', 'Enhanced Features'],
    ARRAY['social', 'video', 'downloader'],
    TRUE, FALSE, TRUE, 1234567, 4.6, 8765
),
(
    'Netflix Mod',
    '8.45.1',
    'com.netflix.mediaclient.mod',
    'Entertainment',
    'Netflix with premium features unlocked and ad-free streaming.',
    'https://example.com/netflix-mod.apk',
    'https://images.sftcdn.net/images/t_app-icon-m/p/e9f0a1b2-9b13-11e6-8dd3-00163ed833e7/1919083199/netflix-icon.png',
    '42.1 MB',
    '5.0+',
    ARRAY['Premium Unlocked', 'Ad-Free', 'HD Streaming', 'Offline Downloads'],
    ARRAY['entertainment', 'streaming', 'premium'],
    TRUE, TRUE, FALSE, 987654, 4.5, 5432
)
ON CONFLICT (package_name) DO NOTHING;

-- Insert sample advertisements
INSERT INTO public.advertisements (title, position, content, target_url, active)
VALUES
(
    'Premium VPN Service',
    'top',
    '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">🔐 Secure Your Privacy</h3>
        <p style="margin: 0 0 15px 0;">Get unlimited VPN access with military-grade encryption</p>
        <button style="background: #1FB8CD; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Try Free</button>
    </div>',
    'https://example.com/vpn-service',
    TRUE
),
(
    'Game Booster App',
    'middle',
    '<div style="background: #f8f9fa; border: 2px solid #1FB8CD; padding: 20px; text-align: center; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">🚀 Boost Your Gaming Performance</h3>
        <p style="margin: 0 0 15px 0; color: #666;">Optimize your device for the ultimate gaming experience</p>
        <button style="background: #1FB8CD; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Download Now</button>
    </div>',
    'https://example.com/game-booster',
    TRUE
),
(
    'Cloud Storage Deal',
    'bottom',
    '<div style="background: #4CAF50; padding: 15px; text-align: center; color: white; border-radius: 8px;">
        <h4 style="margin: 0 0 8px 0;">☁️ 1TB Cloud Storage - 50% Off!</h4>
        <p style="margin: 0; font-size: 14px;">Limited time offer - Secure your files in the cloud</p>
    </div>',
    'https://example.com/cloud-storage',
    TRUE
)
ON CONFLICT DO NOTHING;

-- Update realtime publication to include advertisements
ALTER PUBLICATION supabase_realtime ADD TABLE public.advertisements;

-- Create analytics views (optional)
CREATE OR REPLACE VIEW public.analytics_overview AS
SELECT 
    (SELECT COUNT(*) FROM public.apks) as total_apks,
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COALESCE(SUM(download_count), 0) FROM public.apks) as total_downloads,
    (SELECT COALESCE(AVG(rating), 0) FROM public.apks WHERE rating > 0) as average_rating,
    (SELECT COUNT(*) FROM public.categories) as total_categories,
    (SELECT COUNT(*) FROM public.advertisements WHERE active = true) as active_ads;

-- Create function to update advertisement stats
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.advertisements 
    SET impressions = impressions + 1, updated_at = NOW()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.advertisements 
    SET clicks = clicks + 1, updated_at = NOW()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_ad_impressions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO authenticated;

-- Sample admin user creation (run this manually with your email)
-- Replace 'your-email@example.com' with your actual email
/*
INSERT INTO public.users (id, email, username, role, created_at)
VALUES (
    'your-auth-user-id-here',  -- Replace with actual auth user ID
    'your-email@example.com',   -- Replace with your email
    'admin',                    -- Username
    'super_admin',              -- Role
    NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apks_category ON public.apks(category);
CREATE INDEX IF NOT EXISTS idx_apks_featured ON public.apks(featured);
CREATE INDEX IF NOT EXISTS idx_apks_trending ON public.apks(trending);
CREATE INDEX IF NOT EXISTS idx_apks_verified ON public.apks(verified);
CREATE INDEX IF NOT EXISTS idx_apks_created_at ON public.apks(created_at);
CREATE INDEX IF NOT EXISTS idx_downloads_apk_id ON public.downloads(apk_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON public.downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_reviews_apk_id ON public.reviews(apk_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON public.advertisements(active);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON public.advertisements(position);

COMMIT;