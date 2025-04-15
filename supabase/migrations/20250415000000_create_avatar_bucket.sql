
-- Create storage bucket for user avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
SELECT 'avatars', 'avatars', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Create policy to allow anyone to view avatars (public bucket)
CREATE POLICY IF NOT EXISTS "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Create policy to allow authenticated users to upload avatars
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (CASE
        WHEN name ~ '^avatars/[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$' THEN true
        ELSE false
    END)
);

-- Create policy to allow users to update their own avatars
CREATE POLICY IF NOT EXISTS "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Create policy to allow users to delete their own avatars
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
