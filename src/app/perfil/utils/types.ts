// Tipo de usuario
export interface Usuario {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  tipo: string | null
  banner_color_idx: number | null
  social_twitter: string | null
  social_instagram: string | null
  social_patreon: string | null      // ← NUEVO
  social_tiktok: string | null       // ← NUEVO
  social_youtube: string | null      // ← NUEVO
  location: string | null            // ← NUEVO
  pronoun: string | null             // ← NUEVO
}

// Tipo de obra
export interface Obra {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string
  likes_count: number
  tipo: string | null
  created_at: string
  usuario_id: string
  Usuarios?: { username: string }
}

// Estadísticas del perfil
export interface Stats {
  obras: number
  likes: number
  seguidores: number
  siguiendo: number
}

// Toast de notificación
export interface ToastItem {
  id: number
  msg: string
  tipo: 'ok' | 'err'
}

// Tipo de tab activo
export type Tab = 'obras' | 'likes'
