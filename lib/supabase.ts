'use client'

import { createBrowserClient } from '@supabase/ssr'

// ─── CLIENT COMPONENT (gebruik in 'use client' bestanden) ────────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
