import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Ensure profile row exists if database trigger didn't execute
  if (data.user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          full_name: fullName,
          email: data.user.email,
          onboarding_completed: false,
        },
      ]);
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile from database:', error);
      return null;
    }

    // If profile row doesn't exist yet, attempt self-healing creation from auth user
    if (!data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        const derivedName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'Student');

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              full_name: derivedName,
              email: user.email,
              onboarding_completed: false,
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (!insertError && newProfile) {
          return newProfile;
        }
      }
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getProfile:', err);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile in Supabase:', error);
      throw new Error('Unable to save profile changes. Please try again.');
    }

    // Sync auth user metadata in background if full_name is updated
    if (updates.full_name) {
      supabase.auth.updateUser({
        data: { full_name: updates.full_name },
      }).catch((authErr) => {
        console.warn('Could not sync auth user metadata:', authErr);
      });
    }

    return data;
  } catch (err: unknown) {
    if ((err as Error).message?.includes('permission denied')) {
      throw new Error('Database permission error. Please verify the fix migration has been applied in Supabase.');
    }
    throw err;
  }
}

export async function ensureDefaultSubjects(userId: string): Promise<void> {
  try {
    // 1. Check if user profile already has onboarding_completed = true
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.onboarding_completed) {
      // User has already completed onboarding; respect their subject configuration
      return;
    }

    const { data: existingSubjects, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking default subjects:', checkError);
      return;
    }

    if (!existingSubjects || existingSubjects.length === 0) {
      const defaultSubjects = [
        { user_id: userId, name: 'CPLT', code: 'CS101', color: '#3b82f6', icon: 'Code' },
        { user_id: userId, name: 'FOA', code: 'CS102', color: '#8b5cf6', icon: 'Layers' },
        { user_id: userId, name: 'Physics', code: 'PHY101', color: '#ec4899', icon: 'Atom' },
        { user_id: userId, name: 'Communication Skills', code: 'HUM101', color: '#10b981', icon: 'MessageSquare' },
        { user_id: userId, name: 'Maths', code: 'MTH101', color: '#f59e0b', icon: 'Calculator' },
        { user_id: userId, name: 'DDAL', code: 'CS103', color: '#6366f1', icon: 'Cpu' },
      ];

      const { error: insertError } = await supabase
        .from('subjects')
        .upsert(defaultSubjects, { onConflict: 'user_id,name', ignoreDuplicates: true });

      if (insertError) {
        console.error('Error inserting default subjects:', insertError);
      }
    }
  } catch (err) {
    console.error('Unexpected error in ensureDefaultSubjects:', err);
  }
}
