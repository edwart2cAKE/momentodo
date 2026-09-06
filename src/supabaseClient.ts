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

// Momentodo accepts both email and username. Usernames are mapped to a
// fake, never-contacted email domain so we get Supabase's hashing /
// session / rate-limiting for free. Real emails are used directly.
const FAKE_EMAIL_DOMAIN = 'momentodo.local'

export function isEmail(input: string): boolean {
  return input.includes('@')
}

function toSupabaseEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase()
  return isEmail(trimmed) ? trimmed : `${trimmed}@${FAKE_EMAIL_DOMAIN}`
}

export async function signUp(identifier: string, password: string) {
  const email = toSupabaseEmail(identifier)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: identifier } },
  })
  if (error) throw error
  return data
}

export async function signIn(identifier: string, password: string) {
  const email = toSupabaseEmail(identifier)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
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
