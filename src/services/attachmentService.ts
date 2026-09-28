import { supabase } from '@/lib/supabase';
import { AssignmentAttachment } from '@/types';
import { logActivity } from './activityService';

const BUCKET_NAME = 'assignment-files';

export async function uploadAttachment(
  assignmentId: string,
  file: File
): Promise<AssignmentAttachment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Sanitize filename and create unique path: <userId>/<assignmentId>/<timestamp>-<sanitizedFileName>
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniquePrefix = Date.now();
  const storagePath = `${user.id}/${assignmentId}/${uniquePrefix}_${sanitizedName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
  }

  // 2. Insert metadata record in assignment_attachments
  const { data: attachmentRecord, error: dbError } = await supabase
    .from('assignment_attachments')
    .insert([
      {
        user_id: user.id,
        assignment_id: assignmentId,
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
      },
    ])
    .select()
    .single();

  if (dbError) {
    // Cleanup orphaned storage file if db insertion failed
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Failed to save attachment metadata: ${dbError.message}`);
  }

  await logActivity('attachment_uploaded', assignmentId, {
    fileName: file.name,
    fileSize: file.size,
  });

  return attachmentRecord;
}

export async function getAttachmentDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60); // 1 hour signed URL

  if (error) throw error;
  return data.signedUrl;
}

export async function downloadAttachment(filePath: string, fileName: string): Promise<void> {
  const signedUrl = await getAttachmentDownloadUrl(filePath);
  const response = await fetch(signedUrl);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export async function deleteAttachment(
  attachmentId: string,
  filePath: string,
  assignmentId?: string
): Promise<void> {
  // 1. Delete from database
  const { error: dbError } = await supabase
    .from('assignment_attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) throw dbError;

  // 2. Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (storageError) {
    console.warn('Storage file cleanup warning:', storageError);
  }

  await logActivity('attachment_deleted', assignmentId || null, { filePath });
}
