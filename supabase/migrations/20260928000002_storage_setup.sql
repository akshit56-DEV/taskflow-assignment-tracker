-- ====================================================================
-- TaskFlow Storage Bucket & Policy Setup
-- Migration: 20260928000002_storage_setup.sql
-- ====================================================================

-- 1. Create the 'assignment-files' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assignment-files',
    'assignment-files',
    false, -- Private bucket: access secured via RLS
    52428800, -- 50 MB limit per file
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/zip',
        'application/x-zip-compressed',
        'text/plain'
    ]
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 52428800;

-- 2. Storage RLS Policies for user-scoped isolation
-- Folder structure: <user_id>/<assignment_id>/<filename>

-- Allow users to upload files only into their own user folder: auth.uid()
CREATE POLICY "Users can upload their own assignment files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view/download only their own assignment files
CREATE POLICY "Users can view their own assignment files"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own assignment files"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own assignment files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'assignment-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
