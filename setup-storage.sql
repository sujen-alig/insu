-- Complete Supabase Storage Setup - Remove Demo Data, Enable Real Storage
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Create buckets for file storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('apk-files', 'apk-files', true, 104857600, ARRAY['application/vnd.android.package-archive', 'application/octet-stream']),
('screenshots', 'screenshots', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('icons', 'icons', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - ENABLE PUBLIC ACCESS
-- ============================================================================

-- APK files - public read, authenticated upload
CREATE POLICY "Public read APK files" ON storage.objects
FOR SELECT USING (bucket_id = 'apk-files');

CREATE POLICY "Authenticated upload APK files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'apk-files');

CREATE POLICY "Admin manage APK files" ON storage.objects
FOR ALL USING (
    bucket_id = 'apk-files' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Screenshots - public read, authenticated upload
CREATE POLICY "Public read screenshots" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Authenticated upload screenshots" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Admin manage screenshots" ON storage.objects
FOR ALL USING (
    bucket_id = 'screenshots' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Icons - public read, authenticated upload
CREATE POLICY "Public read icons" ON storage.objects
FOR SELECT USING (bucket_id = 'icons');

CREATE POLICY "Authenticated upload icons" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'icons');

CREATE POLICY "Admin manage icons" ON storage.objects
FOR ALL USING (
    bucket_id = 'icons' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- User avatars - authenticated read/upload
CREATE POLICY "Users read avatars" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'user-avatars');

CREATE POLICY "Users upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- CLEAR ALL DEMO DATA (OPTIONAL - UNCOMMENT TO REMOVE SAMPLE DATA)
-- ============================================================================

-- Uncomment these lines if you want to remove all sample APKs and start fresh
-- DELETE FROM public.reviews WHERE apk_id IN (SELECT id FROM public.apks);
-- DELETE FROM public.downloads WHERE apk_id IN (SELECT id FROM public.apks);
-- DELETE FROM public.apks;
-- DELETE FROM public.categories;

-- ============================================================================
-- ENSURE REQUIRED CATEGORIES EXIST
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
-- ENABLE REALTIME FOR LIVE UPDATES
-- ============================================================================

-- Enable realtime subscriptions for live data sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.apks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get storage file URL
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT 'https://jpzexvamlwxfyhgeuzpc.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
$$;

-- Function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(original_name text, file_extension text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 8) || '.' || file_extension;
$$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Storage buckets and policies created successfully!' as message;
SELECT 'Realtime enabled for all tables' as realtime_status;
SELECT 'Ready for 100% real data - no demo fallbacks!' as final_status;