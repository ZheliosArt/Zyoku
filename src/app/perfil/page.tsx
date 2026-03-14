"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Tipos, Constantes y Estilos
import type { Usuario, Obra, Stats, ToastItem, Tab } from './utils/types'
import { BANNER_PRESETS, TIPO_LABELS } from './utils/constants'
import { CSS } from './utils/styles'
import { limpiarUsername } from './utils/helpers'

// Componentes
import LoadingSkeleton from './components/LoadingSkeleton'
import ToastContainer from './components/ToastContainer'
import EmptyState from './components/EmptyState'
import StatsBar from './components/StatsBar'
import SocialLinks from './components/SocialLinks'
import ProfileBio from './components/ProfileBio'
import ProfileInfo from './components/ProfileInfo'
import WorksTabs from './components/WorksTabs'
import WorksGrid from './components/WorksGrid'
import ZoomModal from './components/ZoomModal'
import ProfileHeader from './components/ProfileHeader'
import CollectionsGrid from './components/CollectionsGrid' // Verifica que el archivo tenga la 's'

export default function Perfil() {
// ── Estados ──────────────────────────────────────────────────────────────
const [user, setUser] = useState<any>(null)
const [perfil, setPerfil] = useState<Usuario | null>(null)
const [obras, setObras] = useState<Obra[]>([])
const [obrasLikeadas, setObrasLikeadas] = useState<Obra[]>([])
const [colecciones, setColecciones] = useState<any[]>([])
const [guardadosCount, setGuardadosCount] = useState(0)
const [stats, setStats] = useState<Stats>({ obras:0, likes:0, seguidores:0, siguiendo:0 })

const [loading, setLoading] = useState(true)
const [editando, setEditando] = useState(false)
const [guardando, setGuardando] = useState(false)
const [subiendoAvatar, setSubiendoAvatar] = useState(false)
const [subiendoBanner, setSubiendoBanner] = useState(false)
const [obraZoom, setObraZoom] = useState<Obra | null>(null)
const [tab, setTab] = useState<Tab>('obras')
const [toasts, setToasts] = useState<ToastItem[]>([])

// Colecciones Modal
const [showModalCol, setShowModalCol] = useState(false)
const [nombreNuevaCol, setNombreNuevaCol] = useState('')
const [creandoCol, setCreandoCol] = useState(false)

// Campos de edición
const [bio, setBio] = useState("")
const [username, setUsername] = useState("")
const [socialTwitter, setSocialTwitter] = useState("")
const [socialInstagram, setSocialInstagram] = useState("")
const [socialPatreon, setSocialPatreon] = useState('')
const [socialTiktok, setSocialTiktok] = useState('')
const [socialYoutube, setSocialYoutube] = useState('')
const [locationText, setLocationText] = useState('')
const [pronounText, setPronounText] = useState('')
const [bannerIdx, setBannerIdx] = useState(0)
const [bannerUrl, setBannerUrl] = useState<string | null>(null)

const avatarRef = useRef<HTMLInputElement>(null)
const bannerRef = useRef<HTMLInputElement>(null)

// ── Derived Data ──────────────────────────────────────────────────────────
const obrasActivas = tab === 'obras' ? obras : tab === 'likes' ? obrasLikeadas : []

// ── Toast helper ──────────────────────────────────────────────────────────
const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
const id = Date.now()
setToasts(prev => [...prev, { id, msg, tipo }])
setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
}, [])

// ── Data loading ──────────────────────────────────────────────────────────
useEffect(() => {
const cargar = async () => {
const { data: { user: userData } } = await supabase.auth.getUser()
if (!userData) { window.location.href = '/'; return }
setUser(userData)

// Perfil
const { data: p } = await supabase.from('Usuarios').select('*').eq('id', userData.id).single()
if (p) {
setPerfil(p); setBio(p.bio || ''); setUsername(p.username || '')
setSocialTwitter(p.social_twitter || ''); setSocialInstagram(p.social_instagram || '')
setSocialPatreon(p.social_patreon || ''); setSocialTiktok(p.social_tiktok || '')
setSocialYoutube(p.social_youtube || ''); setLocationText(p.location || '')
setPronounText(p.pronoun || ''); setBannerIdx(p.banner_color_idx ?? 0)
setBannerUrl(p.banner_url || null)
}

// Obras y Likes
const { data: obrasData } = await supabase.from('obras').select('*').eq('usuario_id', userData.id).order('created_at', { ascending: false })
setObras(obrasData || [])
const { data: likesData } = await supabase.from('likes').select('obra_id, obras(*, Usuarios(username))').eq('usuario_id', userData.id)
setObrasLikeadas(likesData?.map((l: any) => l.obras).filter(Boolean) || [])

// Stats
const totalLikes = (obrasData || []).reduce((s, o) => s + (o.likes_count || 0), 0)
const { count: seg } = await supabase.from('seguidores').select('*', { count:'exact', head:true }).eq('seguido_id', userData.id)
const { count: sig } = await supabase.from('seguidores').select('*', { count:'exact', head:true }).eq('seguidor_id', userData.id)
setStats({ obras: obrasData?.length || 0, likes: totalLikes, seguidores: seg || 0, siguiendo: sig || 0 })

// Colecciones
const { data: cols, count: cGuardados } = await supabase.from('colecciones').select('*, obras_guardadas(count)', { count: 'exact' }).eq('usuario_id', userData.id)
setColecciones(cols || [])
setGuardadosCount(cGuardados || 0)

setLoading(false)
}
cargar()
}, [])

// ── Acciones del Perfil (RESTAURADAS) ──────────────────────────────────────

const guardarPerfil = async () => {
if (!user) return
setGuardando(true)
const { error } = await supabase.from('Usuarios').update({
bio, username, social_twitter: socialTwitter, social_instagram: socialInstagram,
social_patreon: socialPatreon, social_tiktok: socialTiktok, social_youtube: socialYoutube,
location: locationText, pronoun: pronounText, banner_color_idx: bannerIdx, banner_url: bannerUrl,
}).eq('id', user.id)

if (error) toast('Error al guardar cambios', 'err')
else {
setPerfil(prev => prev ? { ...prev, bio, username, location: locationText, pronoun: pronounText } : prev)
toast('✓ Perfil actualizado'); setEditando(false)
}
setGuardando(false)
}

const subirAvatar = async (file: File) => {
if (!user) return
setSubiendoAvatar(true)
const path = `${user.id}.${file.name.split('.').pop()}`
const { error: upErr } = await supabase.storage.from('Avatars').upload(path, file, { upsert: true })
if (upErr) { toast('Error al subir avatar', 'err'); setSubiendoAvatar(false); return }
const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(path)
const urlFinal = `${publicUrl}?v=${Date.now()}`
await supabase.from('Usuarios').update({ avatar_url: urlFinal }).eq('id', user.id)
setPerfil(prev => prev ? { ...prev, avatar_url: urlFinal } : prev)
toast('Avatar actualizado'); setSubiendoAvatar(false)
}

const subirBanner = async (file: File) => {
if (!user) return
setSubiendoBanner(true)
const path = `${user.id}.${file.name.split('.').pop()}`
const { error: upErr } = await supabase.storage.from('Banners').upload(path, file, { upsert: true })
if (upErr) { toast('Error al subir banner', 'err'); setSubiendoBanner(false); return }
const { data: { publicUrl } } = supabase.storage.from('Banners').getPublicUrl(path)
setBannerUrl(`${publicUrl}?v=${Date.now()}`)
toast('Banner actualizado'); setSubiendoBanner(false)
}

const cerrarSesion = async () => {
await supabase.auth.signOut()
window.location.href = '/'
}

// ── Acciones de Obras y Colecciones ────────────────────────────────────────

const handleCrearColeccion = async () => {
if (!nombreNuevaCol.trim() || !user) return
setCreandoCol(true)
const { data, error } = await supabase.from('colecciones').insert([{ nombre: nombreNuevaCol.trim(), usuario_id: user.id }]).select().single()

if (error) toast('Error al crear colección', 'err')
else {
setColecciones(prev => [...prev, { ...data, obras_guardadas: [{ count: 0 }] }])
setGuardadosCount(prev => prev + 1)
toast('✓ Colección creada'); setNombreNuevaCol(''); setShowModalCol(false)
}
setCreandoCol(false)
}

const eliminarObra = async (obra: Obra, e: React.MouseEvent) => {
e.stopPropagation()
if (!confirm(`¿Eliminar "${obra.titulo}"?`)) return
const { error } = await supabase.from('obras').delete().eq('id', obra.id)
if (error) { toast('Error al eliminar', 'err'); return }
setObras(prev => prev.filter(o => o.id !== obra.id))
setStats(prev => ({ ...prev, obras: prev.obras - 1 }))
toast('Obra eliminada')
}

// Navegación (Solo una vez definida)
const goToNext = () => {
if (!obrasActivas.length) return
const idx = obrasActivas.findIndex(o => o.id === obraZoom?.id)
setObraZoom(obrasActivas[(idx + 1) % obrasActivas.length])
}

const goToPrev = () => {
if (!obrasActivas.length) return
const idx = obrasActivas.findIndex(o => o.id === obraZoom?.id)
setObraZoom(obrasActivas[idx === 0 ? obrasActivas.length - 1 : idx - 1])
}

// ── Render ──────────────────────────────────────────────────────────

const renderContent = () => {
if (tab === 'obras') return obras.length === 0 ? <EmptyState tab={tab} /> : <WorksGrid obras={obras} tab={tab} onObraClick={setObraZoom} onDeleteObra={eliminarObra} />
if (tab === 'likes') return obrasLikeadas.length === 0 ? <EmptyState tab={tab} /> : <WorksGrid obras={obrasLikeadas} tab={tab} onObraClick={setObraZoom} onDeleteObra={eliminarObra} />
if (tab === 'guardados') return <CollectionsGrid colecciones={colecciones} onSelect={(col) => console.log(col.nombre)} onCreateClick={() => setShowModalCol(true)} />
}

if (loading) return <LoadingSkeleton />
if (!user) return null

return (
<div style={{ background:'#050d1a', minHeight:'100vh', color:'#c8e0f4', fontFamily:'sans-serif' }}>
<style>{CSS}</style>
<ToastContainer toasts={toasts} />
<div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 4%' }}>
<div className="card fade-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
<ProfileHeader
editando={editando} guardando={guardando} subiendoAvatar={subiendoAvatar}
subiendoBanner={subiendoBanner} bannerUrl={bannerUrl} bannerIdx={bannerIdx}
avatarUrl={perfil?.avatar_url || user.user_metadata?.avatar_url} perfil={perfil} 
avatarRef={avatarRef} bannerRef={bannerRef}
setBannerIdx={setBannerIdx} eliminarBanner={() => setBannerUrl(null)}
subirBanner={subirBanner} subirAvatar={subirAvatar}
guardarPerfil={guardarPerfil} cancelarEdicion={() => setEditando(false)}
setEditando={setEditando} cerrarSesion={cerrarSesion}
/>
<div style={{ padding: '0 28px 28px' }}>
<ProfileInfo editando={editando} perfil={perfil} userEmail={user.email} nombreMostrado={perfil?.username || 'Usuario'} username={username} locationText={locationText} pronounText={pronounText} setUsername={setUsername} setLocationText={setLocationText} setPronounText={setPronounText} />
<ProfileBio editando={editando} bio={bio} setBio={setBio} />
<SocialLinks editando={editando} perfil={perfil} socialTwitter={socialTwitter} socialInstagram={socialInstagram} socialPatreon={socialPatreon} socialTiktok={socialTiktok} socialYoutube={socialYoutube} setSocialTwitter={setSocialTwitter} setSocialInstagram={setSocialInstagram} setSocialPatreon={setSocialPatreon} setSocialTiktok={setSocialTiktok} setSocialYoutube={setSocialYoutube} limpiarUsername={limpiarUsername} />
</div>
<StatsBar stats={stats} />
</div>

<WorksTabs tab={tab} setTab={setTab} obrasCount={stats.obras} likesCount={obrasLikeadas.length} guardadosCount={guardadosCount} />

{renderContent()}

{showModalCol && (
<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
<div className="card" style={{ width:'100%', maxWidth:400, padding:24, background:'#0a1628', border:'1px solid #1e2f4d' }}>
<h3 style={{ marginTop:0, color:'#fff' }}>Nueva Colección</h3>
<input autoFocus type="text" value={nombreNuevaCol} onChange={(e) => setNombreNuevaCol(e.target.value)} placeholder="Ej: Referencias, Favoritos..." style={{ width:'100%', padding:'12px', borderRadius:8, background:'#050d1a', border:'1px solid #1e2f4d', color:'#fff', marginBottom:20 }} onKeyDown={(e) => e.key === 'Enter' && handleCrearColeccion()} />
<div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
<button onClick={() => setShowModalCol(false)} style={{ background:'transparent', color:'#88a0b5', border:'none', cursor:'pointer' }}>Cancelar</button>
<button disabled={creandoCol || !nombreNuevaCol.trim()} onClick={handleCrearColeccion} style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'8px 20px', borderRadius:6, cursor:'pointer' }}>{creandoCol ? 'Creando...' : 'Crear'}</button>
</div>
</div>
</div>
)}

<ZoomModal obra={obraZoom} obras={obrasActivas} onClose={() => setObraZoom(null)} onNext={goToNext} onPrev={goToPrev} onDelete={eliminarObra} />
</div>
</div>
)
}