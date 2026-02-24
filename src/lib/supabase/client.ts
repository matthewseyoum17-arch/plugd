import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build-time SSR prerendering, env vars may not exist.
  // Provide safe placeholders so the build doesn't crash —
  // the client is never actually called at build time.
  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-anon-key'
  )
}
