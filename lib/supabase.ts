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

let ensureSessionInFlight: Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null> | null =
  null;

export async function ensureAnonymousSession() {
  if (ensureSessionInFlight) return ensureSessionInFlight;

  ensureSessionInFlight = (async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('Get session error:', sessionError.message);
      }

      if (session?.user) return session;

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.log('Anonymous sign-in error:', error.message);
        return null;
      }

      // Re-read from storage to avoid edge cases where the first returned session
      // isn't the one the client ends up persisting.
      const {
        data: { session: persistedSession },
      } = await supabase.auth.getSession();

      return persistedSession ?? data.session ?? null;
    } finally {
      ensureSessionInFlight = null;
    }
  })();

  return ensureSessionInFlight;
}
