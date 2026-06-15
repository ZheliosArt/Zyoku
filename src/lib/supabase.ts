import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Columnas públicas de un perfil (excluye `email`, que es privado y no se expone vía anon key).
export const PERFIL_COLS =
  'id, username, avatar_url, bio, tipo, created_at, social_twitter, social_instagram, social_patreon, social_tiktok, social_youtube, banner_color_idx, banner_url, location, pronoun, commissions_open'
