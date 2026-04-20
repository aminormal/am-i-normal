import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://tfrocqsvrgxhxwiclnco.supabase.co';
const supabaseAnonKey = 'sb_publishable__6eKQYi18zPE2fwmlI1WPA_k0EABPyW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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

  return data.session;
}