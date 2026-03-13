// Presets de colores para el banner
export const BANNER_PRESETS = [
  { bg: 'linear-gradient(135deg,#050d1a 0%,#0d2040 50%,#050d1a 100%)', dot: '#0d2040' },
  { bg: 'linear-gradient(135deg,#0d0a1e 0%,#1a0d3a 50%,#0d0a1e 100%)', dot: '#1a0d3a' },
  { bg: 'linear-gradient(135deg,#0a1a0d 0%,#0d3a1a 50%,#0a1a0d 100%)', dot: '#0d3a1a' },
  { bg: 'linear-gradient(135deg,#1a0d0a 0%,#3a1a0d 50%,#1a0d0a 100%)', dot: '#3a1a0d' },
  { bg: 'linear-gradient(135deg,#0a0d1a 0%,#1a1a3a 40%,#0d1a2a 100%)', dot: '#1a1a3a' },
]

// Etiquetas de tipo de usuario
export const TIPO_LABELS: Record<string, string> = {
  fan: 'FAN',
  artista: 'ARTISTA',
  escritor: 'ESCRITOR',
  cosplayer: 'COSPLAYER',
  musico: 'MÚSICO',
}
