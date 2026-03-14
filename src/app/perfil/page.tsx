"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Importar tipos
import type { Usuario, Obra, Stats, ToastItem, Tab } from './utils/types'

// Importar constantes
import { BANNER_PRESETS, TIPO_LABELS } from './utils/constants'

// Importar estilos
import { CSS } from './utils/styles'

// Importar Skeleton
import LoadingSkeleton from './components/LoadingSkeleton'

// Importar Contenedor de Toasts
import ToastContainer from './components/ToastContainer'

// Importar Empty State
import EmptyState from './components/EmptyState'

// Importar StatsBar
import StatsBar from './components/StatsBar'

// Importar SocialLinks
import SocialLinks from './components/SocialLinks'

// Importar ProfileBio
import ProfileBio from './components/ProfileBio'

// Importar ProfileInfo
import ProfileInfo from './components/ProfileInfo'

// Importar WorksTabs
import WorksTabs from './components/WorksTabs'

// Importar WorksGrid
import WorksGrid from './components/WorksGrid'

// Importar ZoomModal
import ZoomModal from './components/ZoomModal'

// Importar ProfileHeader
import ProfileHeader from './components/ProfileHeader'

// ─── Component ────────────────────────────────────────────────────────────────

export default function Perfil() {
  const [user, setUser]                 = useState<any>(null)
  const [perfil, setPerfil]             = useState<Usuario | null>(null)
  const [obras, setObras]               = useState<Obra[]>([])
  const [obrasLikeadas, setObrasLikeadas] = useState<Obra[]>([])
  const [stats, setStats]               = useState<Stats>({ obras:0, likes:0, seguidores:0, siguiendo:0 })
  const [loading, setLoading]           = useState(true)
  const [editando, setEditando]         = useState(false)
  const [guardando, setGuardando]       = useState(false)
  const [subiendoAvatar, setSubiendoAvatar] = useState(false)
  const [subiendoBanner, setSubiendoBanner] = useState(false)
  const [obraZoom, setObraZoom]         = useState<Obra | null>(null)
  const [tab, setTab]                   = useState<Tab>('obras')
  const [toasts, setToasts]             = useState<ToastItem[]>([])

  // Edit fields
  const [bio, setBio]                   = useState("")
  const [username, setUsername]         = useState("")
  const [socialTwitter, setSocialTwitter]   = useState("")
  const [socialInstagram, setSocialInstagram] = useState("")
  const [socialPatreon, setSocialPatreon] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [locationText, setLocationText] = useState('')
  const [pronounText, setPronounText] = useState('')
  const [bannerIdx, setBannerIdx]       = useState(0)
  const [bannerUrl, setBannerUrl]       = useState<string | null>(null)

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  // ── Toast helper ──────────────────────────────────────────────────────────

  const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, tipo }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // ── Social input cleaner ──────────────────────────────────────────────────

  const limpiarUsername = (input: string, plataforma: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'patreon'): string => {
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

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    const cargar = async () => {
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) { window.location.href = '/'; return }
      setUser(userData)

      const { data: p } = await supabase
        .from('Usuarios').select('*').eq('id', userData.id).single()

      if (p) {
        setPerfil(p)
        setBio(p.bio || '')
        setUsername(p.username || '')
        setSocialTwitter(p.social_twitter || '')
        setSocialInstagram(p.social_instagram || '')
        setSocialPatreon(p.social_patreon || '')
        setSocialTiktok(p.social_tiktok || '')
        setSocialYoutube(p.social_youtube || '')
        setLocationText(p.location || '')
        setPronounText(p.pronoun || '')
        setBannerIdx(p.banner_color_idx ?? 0)
        setBannerUrl(p.banner_url || null)
     }

      const { data: obrasData } = await supabase
        .from('obras').select('*').eq('usuario_id', userData.id)
        .order('created_at', { ascending: false })
      setObras(obrasData || [])

      const { data: likesData } = await supabase
        .from('likes').select('obra_id, obras(*, Usuarios(username))')
        .eq('usuario_id', userData.id)
      setObrasLikeadas(likesData?.map((l: any) => l.obras).filter(Boolean) || [])

      const totalLikes = (obrasData || []).reduce((s, o) => s + (o.likes_count || 0), 0)
      const { count: seg } = await supabase
        .from('seguidores').select('*', { count:'exact', head:true }).eq('seguido_id', userData.id)
      const { count: sig } = await supabase
        .from('seguidores').select('*', { count:'exact', head:true }).eq('seguidor_id', userData.id)

      setStats({ obras: obrasData?.length || 0, likes: totalLikes, seguidores: seg || 0, siguiendo: sig || 0 })
      setLoading(false)
    }
    cargar()
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const guardarPerfil = async () => {
if (!user) return
setGuardando(true)
const { error } = await supabase.from('Usuarios').update({
bio, username,
social_twitter: socialTwitter,
social_instagram: socialInstagram,
social_patreon: socialPatreon,
social_tiktok: socialTiktok,
social_youtube: socialYoutube,
location: locationText,
pronoun: pronounText,
banner_color_idx: bannerIdx,
banner_url: bannerUrl,
}).eq('id', user.id)

if (error) {
toast('Error al guardar los cambios', 'err')
} else {
setPerfil(prev => prev ? { 
...prev, bio, username, 
social_twitter: socialTwitter, 
social_instagram: socialInstagram, 
social_patreon: socialPatreon,
social_tiktok: socialTiktok,
social_youtube: socialYoutube,
location: locationText,
pronoun: pronounText,
banner_color_idx: bannerIdx,
banner_url: bannerUrl
} : prev)
toast('✓ Perfil guardado')
setEditando(false)
}
setGuardando(false)
}

 const cancelarEdicion = () => {
    setBio(perfil?.bio || '')
    setUsername(perfil?.username || '')
    setSocialTwitter(perfil?.social_twitter || '')
    setSocialInstagram(perfil?.social_instagram || '')
    setSocialPatreon(perfil?.social_patreon || '')
    setSocialTiktok(perfil?.social_tiktok || '')
    setSocialYoutube(perfil?.social_youtube || '')
    setLocationText(perfil?.location || '')
    setPronounText(perfil?.pronoun || '')
    setBannerIdx(perfil?.banner_color_idx ?? 0)
    setBannerUrl(perfil?.banner_url || null)
    setEditando(false)
}

const subirAvatar = async (file: File) => {
if (!user) return
setSubiendoAvatar(true)
const ext = file.name.split('.').pop()
const path = `${user.id}.${ext}`
const { error: upErr} = await supabase.storage.from('Avatars').upload(path, file, { upsert: true })
if (upErr) {
toast('Error al subir el avatar', 'err')
setSubiendoAvatar(false)
return
}
const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(path)
const timestamp = new Date().getTime()
const urlConCacheBuster = `${publicUrl}?v=${timestamp}`
await supabase.from('Usuarios').update({ avatar_url: urlConCacheBuster }).eq('id', user.id)
setPerfil(prev => prev ? { ...prev, avatar_url: urlConCacheBuster } : prev)
toast('Avatar actualizado')
setSubiendoAvatar(false)
}

const subirBanner = async (file: File) => {
if (!user) return
setSubiendoBanner(true)
const ext = file.name.split('.').pop()
const path = `${user.id}.${ext}`
const { error: upErr } = await supabase.storage.from('Banners').upload(path, file, {upsert: true})
if (upErr) {
console.error('Error detallado:', upErr)
toast(`Error al subir el banner: ${upErr.message}`, 'err')
setSubiendoBanner(false)
return
}
const { data: { publicUrl } } = supabase.storage.from('Banners').getPublicUrl(path)
const timestamp = new Date().getTime()
const urlConCacheBuster = `${publicUrl}?v=${timestamp}`
setBannerUrl(urlConCacheBuster)
toast('Banner actualizado')
setSubiendoBanner(false)
}

  const eliminarBanner = () => {
    setBannerUrl(null)
    toast('Banner eliminado (recuerda guardar cambios)')
  }

  const eliminarObra = async (obra: Obra, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${obra.titulo}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('obras').delete().eq('id', obra.id)
    if (error) { toast('Error al eliminar la obra', 'err'); return }
    setObras(prev => prev.filter(o => o.id !== obra.id))
    setStats(prev => ({ ...prev, obras: prev.obras - 1, likes: prev.likes - (obra.likes_count || 0) }))
    if (obraZoom?.id === obra.id) setObraZoom(null)
    toast('Obra eliminada')
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />
  if (!user)   return null

  const avatarUrl      = perfil?.avatar_url || user.user_metadata?.avatar_url
  const nombreMostrado = perfil?.username   || user.user_metadata?.full_name || 'Usuario'
  const obrasActivas   = tab === 'obras'    ? obras : obrasLikeadas
  const banner         = BANNER_PRESETS[bannerIdx] ?? BANNER_PRESETS[0]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily:'sans-serif', background:'#050d1a', minHeight:'100vh', color:'#c8e0f4' }}>
      <style>{CSS}</style>

     <ToastContainer toasts={toasts} />

    <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 4%' }}>

        {/* ── Profile Card ── */}
        <div className="fade-up card" style={{ marginBottom:20, overflow:'hidden' }}>

        <ProfileHeader
            editando={editando}
            guardando={guardando}
            subiendoAvatar={subiendoAvatar}
            subiendoBanner={subiendoBanner}
            bannerUrl={bannerUrl}
            bannerIdx={bannerIdx}
            avatarUrl={avatarUrl}
            perfil={perfil}
            avatarRef={avatarRef}
            bannerRef={bannerRef}
            setBannerIdx={setBannerIdx}
            eliminarBanner={eliminarBanner}
            subirBanner={subirBanner}
            subirAvatar={subirAvatar}
            guardarPerfil={guardarPerfil}
            cancelarEdicion={cancelarEdicion}
            setEditando={setEditando}
            cerrarSesion={cerrarSesion}
        />

    {/* Profile body */}
    <div style={{ padding:'0 28px 28px' }}>
           <ProfileInfo
            editando={editando}
            perfil={perfil}
            userEmail={user.email}
            nombreMostrado={nombreMostrado}
            username={username}
            locationText={locationText}
            pronounText={pronounText}
            setUsername={setUsername}
            setLocationText={setLocationText}
            setPronounText={setPronounText}
            />

           <ProfileBio
            editando={editando}
            bio={bio}
            setBio={setBio}
            />

            <SocialLinks
            editando={editando}
            perfil={perfil}
            socialTwitter={socialTwitter}
            socialInstagram={socialInstagram}
            socialPatreon={socialPatreon}
            socialTiktok={socialTiktok}
            socialYoutube={socialYoutube}
            setSocialTwitter={setSocialTwitter}
            setSocialInstagram={setSocialInstagram}
            setSocialPatreon={setSocialPatreon}
            setSocialTiktok={setSocialTiktok}
            setSocialYoutube={setSocialYoutube}
            limpiarUsername={limpiarUsername}
            />
            </div>

             <StatsBar stats={stats} />
        </div> {/* ← Cierre del card */}


        <WorksTabs
            tab={tab}
            setTab={setTab}
            obrasCount={stats.obras}
            likesCount={obrasLikeadas.length}
        />

       {/* ── Works grid ── */}
        {obrasActivas.length === 0 ? (
            <EmptyState tab={tab} />
        ) : (
            <WorksGrid
            obras={obrasActivas}
            tab={tab}
            onObraClick={setObraZoom}
            onDeleteObra={eliminarObra}
            />
        )}

     <ZoomModal
     obra={obraZoom}
     tab={tab}
     onClose={() => setObraZoom(null)}
     onDelete={eliminarObra}
   />
   </div>
    </div>
  )
}
