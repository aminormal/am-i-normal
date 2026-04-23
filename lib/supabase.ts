import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfrocqsvrgxhxwiclnco.supabase.co';
const supabaseAnonKey = 'sb_publishable__6eKQYi18zPE2fwmlI1WPA_k0EABPyW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function ensureAnonymousSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) return session;

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.log('Anonymous sign-in error:', error.message);
    return null;
  }

  console.log('Anonymous session created:', data.session?.user?.id);
  return data.session;
}