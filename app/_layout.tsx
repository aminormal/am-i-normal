import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ensureAnonymousSession } from '../lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}