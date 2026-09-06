import { createClient } from '@supabase/supabase-js'

// These come from your Supabase project settings (Project Settings > API).
// Vite exposes env vars prefixed with VITE_ to client code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (in .env.local locally, and in Vercel project settings for the deployed site).',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Momentodo uses username + password, but Supabase Auth is email-shaped
// under the hood. We map usernames to a fake, never-contacted email domain
// so we get Supabase's hashing / session / rate-limiting for free without
// requiring a real email address from the user.
const FAKE_EMAIL_DOMAIN = 'momentodo.local'

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${FAKE_EMAIL_DOMAIN}`
}

export async function signUp(username: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: { data: { username } },
  })
  if (error) throw error
  return data
}

export async function signIn(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
