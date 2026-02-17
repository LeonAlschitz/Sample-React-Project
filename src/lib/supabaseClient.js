import { createClient } from '@supabase/supabase-js'

const localUrl = import.meta.env.VITE_SUPABASE_URL
const localKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const remoteUrl = import.meta.env.VITE_SUPABASE_REMOTE_URL
const remoteKey = import.meta.env.VITE_SUPABASE_REMOTE_ANON_KEY

export const supabaseLocal = localUrl && localKey ? createClient(localUrl, localKey) : null
export const supabaseRemote = remoteUrl && remoteKey ? createClient(remoteUrl, remoteKey) : null

export const supabase = supabaseLocal ?? supabaseRemote
