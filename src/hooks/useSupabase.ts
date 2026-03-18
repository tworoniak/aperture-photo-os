import { useSession } from '@clerk/react';
import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSupabase() {
  const { session } = useSession();

  const client = useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        accessToken: async () => {
          return session?.getToken() ?? null;
        },
      }),
    [session],
  );

  return client;
}
