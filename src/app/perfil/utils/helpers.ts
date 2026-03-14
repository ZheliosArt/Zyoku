/**
 * Limpia y extrae el username de URLs de redes sociales
 * Soporta URLs completas, usernames con @, y usernames simples
 */
export const limpiarUsername = (
  input: string, 
  plataforma: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'patreon'
): string => {
  if (!input) return ''
  
  let cleaned = input.trim()
  
  // Si ya es solo un username (sin puntos ni barras), devolver directo
  if (!/[.\/]/.test(cleaned) && !cleaned.startsWith('@')) {
    return cleaned
  }
  
  // Remover protocolo y www
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?/, '')
  
  // Extraer username según plataforma
  const patterns: Record<typeof plataforma, RegExp> = {
    twitter: /^(?:twitter\.com\/|x\.com\/)?@?([^\/\?&#]+)/,
    instagram: /^(?:instagram\.com\/)?@?([^\/\?&#]+)/,
    youtube: /^(?:youtube\.com\/)?@?([^\/\?&#]+)/,
    tiktok: /^(?:tiktok\.com\/)?@?([^\/\?&#]+)/,
    patreon: /^(?:patreon\.com\/)?([^\/\?&#]+)/
  }
  
  const match = cleaned.match(patterns[plataforma])
  return match ? match[1] : cleaned.split(/[\/\?&#]/)[0].replace(/^@/, '')
}