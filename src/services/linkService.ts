import { supabase } from '@/lib/supabase';
import { AssignmentLink } from '@/types';

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatUrlWithProtocol(urlString: string): string {
  const trimmed = urlString.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function getLinksForAssignment(assignmentId: string): Promise<AssignmentLink[]> {
  const { data, error } = await supabase
    .from('assignment_links')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addAssignmentLink(
  assignmentId: string,
  title: string,
  url: string
): Promise<AssignmentLink> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const formattedUrl = formatUrlWithProtocol(url);
  if (!isValidUrl(formattedUrl)) {
    throw new Error('Please enter a valid website URL (e.g. https://classroom.google.com)');
  }

  const { data, error } = await supabase
    .from('assignment_links')
    .insert([
      {
        user_id: user.id,
        assignment_id: assignmentId,
        title: title.trim() || 'Reference Link',
        url: formattedUrl,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssignmentLink(
  linkId: string,
  title: string,
  url: string
): Promise<AssignmentLink> {
  const formattedUrl = formatUrlWithProtocol(url);
  if (!isValidUrl(formattedUrl)) {
    throw new Error('Please enter a valid website URL');
  }

  const { data, error } = await supabase
    .from('assignment_links')
    .update({
      title: title.trim() || 'Reference Link',
      url: formattedUrl,
    })
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssignmentLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('assignment_links')
    .delete()
    .eq('id', linkId);

  if (error) throw error;
}
