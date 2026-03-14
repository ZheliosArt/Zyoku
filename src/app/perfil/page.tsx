//Ruta: src/app/perfil/page.tsx

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
import CollectionsGrid from './components/CollectionsGrid'

export default function Perfil() {
// ── Estados ──────────────────────────────────────────────────────────────
const [user, setUser] = useState<any>(null)
const [perfil, setPerfil] = useState<Usuario | null>(null)
const [obras, setObras] = useState<Obra[]>([])
const [obrasLikeadas, setObrasLikeadas] = useState<Obra[]>([])
const [colecciones, setColecciones] = useState<any[]>([])
const [guardadosCount, setGuardadosCount] = useState(0)
const [stats, setStats] = useState<Stats>({ obras:0, likes:0, seguidores:0, siguiendo:0 })
const [commissionsOpen, setCommissionsOpen] = useState(false)

const [loading, setLoading] = useState(true)
const [editando, setEditando] = useState(false)
const [guardando, setGuardando] = useState(false)
const [subiendoAvatar, setSubiendoAvatar] = useState(false)
const [subiendoBanner, setSubiendoBanner] = useState(false)
const [obraZoom, setObraZoom] = useState<Obra | null>(null)
const [tab, setTab] = useState<Tab>('obras')
const [toasts, setToasts] = useState<ToastItem[]>([])

// Colecciones
const [showModalCol, setShowModalCol] = useState(false)
const [nombreNuevaCol, setNombreNuevaCol] = useState('')
const [creandoCol, setCreandoCol] = useState(false)
const [colSeleccionada, setColSeleccionada] = useState<any | null>(null)
const [obrasDeColeccion, setObrasDeColeccion] = useState<Obra[]>([])
const [modoGestion, setModoGestion] = useState(false)
const [seleccionadas, setSeleccionadas] = useState<any[]>([]) // Cambiado a any[] para evitar errores de ID

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

// ── Data Derivada ────────────────────────────────────────────────────────
const obrasActivas = tab === 'obras' 
? obras 
: tab === 'likes' 
? obrasLikeadas 
: colSeleccionada ? obrasDeColeccion : []

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


const { data: p } = await supabase.from('Usuarios').select('*').eq('id', userData.id).single()
if (p) {
setPerfil(p); setBio(p.bio || ''); setUsername(p.username || '')
setSocialTwitter(p.social_twitter || ''); setSocialInstagram(p.social_instagram || '')
setSocialPatreon(p.social_patreon || ''); setSocialTiktok(p.social_tiktok || '')
setSocialYoutube(p.social_youtube || ''); setLocationText(p.location || '')
setPronounText(p.pronoun || ''); setBannerIdx(p.banner_color_idx ?? 0)
setBannerUrl(p.banner_url || null)
setCommissionsOpen(p.commissions_open || false) // <--- NUEVA LÍNEA

}

const { data: obrasData } = await supabase.from('obras').select('*').eq('usuario_id', userData.id).order('created_at', { ascending: false })
setObras(obrasData || [])

const { data: likesData } = await supabase.from('likes').select('obra_id, obras(*, Usuarios(username))').eq('usuario_id', userData.id)
setObrasLikeadas(likesData?.map((l: any) => l.obras).filter(Boolean) || [])

const totalLikes = (obrasData || []).reduce((s, o) => s + (o.likes_count || 0), 0)
const { count: seg } = await supabase.from('seguidores').select('*', { count:'exact', head:true }).eq('seguido_id', userData.id)
const { count: sig } = await supabase.from('seguidores').select('*', { count:'exact', head:true }).eq('seguidor_id', userData.id)
setStats({ obras: obrasData?.length || 0, likes: totalLikes, seguidores: seg || 0, siguiendo: sig || 0 })

const { data: cols, count: cGuardados } = await supabase
.from('colecciones')
.select('*, obras_guardadas(count), portadas:obras_guardadas(obras(imagen_url))', { count: 'exact' })
.eq('usuario_id', userData.id)

const coleccionesFormateadas = (cols || []).map((col: any) => ({
...col,
portada_url: col.portadas?.[0]?.obras?.imagen_url || null
}))

setColecciones(coleccionesFormateadas)
setGuardadosCount(cGuardados || 0)
setLoading(false)
}
cargar()
}, [])

// ── Acciones de Perfil ────────────────────────────────────────────────────

const guardarPerfil = async () => {
if (!user) return
setGuardando(true)
const { error } = await supabase.from('Usuarios').update({
bio, username, social_twitter: socialTwitter, social_instagram: socialInstagram,
social_patreon: socialPatreon, social_tiktok: socialTiktok, social_youtube: socialYoutube,
location: locationText, pronoun: pronounText, banner_color_idx: bannerIdx, banner_url: bannerUrl,
commissions_open: commissionsOpen // <--- NUEVA LÍNEA
}).eq('id', user.id)

if (error) toast('Error al guardar cambios', 'err')
else {
setPerfil(prev => prev ? { ...prev, bio, username, location: locationText, pronoun: pronounText, commissions_open: commissionsOpen } : prev) // <--- ACTUALIZADO
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
const urlFinal = `${publicUrl}?v=${Date.now()}`
setBannerUrl(urlFinal)
toast('Banner actualizado'); setSubiendoBanner(false)
}

const cerrarSesion = async () => {
await supabase.auth.signOut()
window.location.href = '/'
}

// ── Acciones de Obras y Colecciones ────────────────────────────────────────

const handleGuardarEnColeccion = async (obraId: any, coleccionId: string) => {
if (!user) return
const { error } = await supabase.from('obras_guardadas').insert([{ usuario_id: user.id, obra_id: obraId, coleccion_id: coleccionId }])
if (error) {
if (error.code === '23505') toast('Ya guardaste esta obra aquí', 'err')
else toast('Error al guardar', 'err')
} else {
toast('✨ Guardado en colección')
setColecciones(prev => prev.map(c => c.id === coleccionId ? { ...c, obras_guardadas: [{ count: (c.obras_guardadas[0]?.count || 0) + 1 }] } : c))
}
}

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

const abrirColeccion = async (col: any) => {
setLoading(true)
const { data, error } = await supabase.from('obras_guardadas').select('obras(*)').eq('coleccion_id', col.id)
if (error) toast('Error al cargar', 'err')
else {
setObrasDeColeccion(data.map((d: any) => d.obras).filter(Boolean))
setColSeleccionada(col)
}
setLoading(false)
}

const eliminarObraSmart = async (obra: Obra, e: React.MouseEvent) => {
e.stopPropagation()
if (tab === 'guardados' && colSeleccionada) {
if (!confirm(`¿Quitar "${obra.titulo}" de esta carpeta?`)) return
const { error } = await supabase.from('obras_guardadas').delete().eq('obra_id', obra.id).eq('coleccion_id', colSeleccionada.id)
if (error) toast('Error al quitar', 'err')
else {
setObrasDeColeccion(prev => prev.filter(o => o.id !== obra.id))
toast('Obra quitada de la carpeta')
}
} else {
if (!confirm(`¿Eliminar permanentemente "${obra.titulo}"?`)) return
const { error } = await supabase.from('obras').delete().eq('id', obra.id)
if (error) toast('Error al eliminar', 'err')
else {
setObras(prev => prev.filter(o => o.id !== obra.id))
setStats(prev => ({ ...prev, obras: prev.obras - 1 }))
toast('Obra eliminada')
}
}
if (obraZoom?.id === obra.id) setObraZoom(null)
}

const eliminarMultiples = async () => {
if (seleccionadas.length === 0 || !colSeleccionada) return
if (!confirm(`¿Quitar ${seleccionadas.length} obras?`)) return
const { error } = await supabase.from('obras_guardadas').delete().in('obra_id', seleccionadas).eq('coleccion_id', colSeleccionada.id)
if (error) toast('Error', 'err')
else {
setObrasDeColeccion(prev => prev.filter(o => !seleccionadas.includes(o.id)))
setSeleccionadas([]); setModoGestion(false)
toast('Obras quitadas')
}
}

const goToNext = () => {
if (!obrasActivas.length) return
const idx = obrasActivas.findIndex(o => o.id === obraZoom?.id)
setObraZoom(obrasActivas[(idx + 1) % obrasActivas.length])
}

const goToPrev = () => {
if (!obrasActivas.length) return
const idx = obrasActivas.findIndex(o => o.id === obraZoom?.id)
setObraZoom(obrasActivas[idx <= 0 ? obrasActivas.length - 1 : idx - 1])
}

// ── Render Logic ──────────────────────────────────────────────────────────

const renderContent = () => {
if (tab === 'obras') return <WorksGrid obras={obras} tab={tab} onObraClick={setObraZoom} onDeleteObra={eliminarObraSmart} />
if (tab === 'likes') return <WorksGrid obras={obrasLikeadas} tab={tab} onObraClick={setObraZoom} onDeleteObra={eliminarObraSmart} />

if (tab === 'guardados') {
if (colSeleccionada) {
return (
<div className="scale-in">
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
<div style={{ display:'flex', alignItems:'center', gap:12 }}>
<button onClick={() => { setColSeleccionada(null); setModoGestion(false); }} className="btn-ghost" style={{ padding:'6px 14px' }}>← Volver</button>
<h2 style={{ margin:0, fontSize:18 }}>{colSeleccionada.nombre}</h2>
</div>
<div style={{ display:'flex', gap:10 }}>
{modoGestion ? (
<>
<button onClick={eliminarMultiples} className="delete-btn" style={{ padding:'8px 16px' }}>Eliminar ({seleccionadas.length})</button>
<button onClick={() => { setModoGestion(false); setSeleccionadas([]); }} className="btn-ghost" style={{ padding:'8px 16px' }}>Cancelar</button>
</>
) : (
<button onClick={() => setModoGestion(true)} className="btn-ghost" style={{ padding:'8px 16px' }}>Gestionar</button>
)}
</div>
</div>
{obrasDeColeccion.length === 0 ? <EmptyState tab="guardados" /> : (
<div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:4 }}>
{obrasDeColeccion.map(obra => (
<div key={obra.id} style={{ position:'relative', aspectRatio:'1/1', cursor:'pointer', border: seleccionadas.includes(obra.id) ? '4px solid #00cfff' : 'none' }} onClick={() => {
if (modoGestion) setSeleccionadas(prev => prev.includes(obra.id) ? prev.filter(id => id !== obra.id) : [...prev, obra.id])
else setObraZoom(obra)
}}>
<img src={obra.imagen_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
{modoGestion && <div style={{ position:'absolute', top:8, right:8, background: seleccionadas.includes(obra.id) ? '#00cfff' : 'rgba(0,0,0,0.5)', borderRadius:'50%', width:18, height:18 }} />}
</div>
))}
</div>
)}
</div>
)
}
return <CollectionsGrid colecciones={colecciones} onSelect={abrirColeccion} onCreateClick={() => setShowModalCol(true)} onDeleteClick={async (col, e) => {
e.stopPropagation(); if(confirm(`¿Eliminar "${col.nombre}"?`)) {
const { error } = await supabase.from('colecciones').delete().eq('id', col.id)
if(!error) setColecciones(prev => prev.filter(c => c.id !== col.id))
}
}} />
}
}

if (loading) return <LoadingSkeleton />
if (!user) return null

return (
<div style={{ background:'#050d1a', minHeight:'100vh', color:'#c8e0f4', fontFamily:'sans-serif' }}>
<style>{CSS}</style>
<ToastContainer toasts={toasts} />
<div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 4%' }}>
<div className="card fade-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
<ProfileHeader editando={editando} guardando={guardando} subiendoAvatar={subiendoAvatar} subiendoBanner={subiendoBanner} bannerUrl={bannerUrl} bannerIdx={bannerIdx} avatarUrl={perfil?.avatar_url || user.user_metadata?.avatar_url} perfil={perfil} avatarRef={avatarRef} bannerRef={bannerRef} setBannerIdx={setBannerIdx} eliminarBanner={() => setBannerUrl(null)} subirBanner={subirBanner} subirAvatar={subirAvatar} guardarPerfil={guardarPerfil} cancelarEdicion={() => setEditando(false)} setEditando={setEditando} cerrarSesion={cerrarSesion} />

<div style={{ padding: '0 28px 28px' }}>
<ProfileInfo 
editando={editando} 
perfil={perfil} 
userEmail={user.email} 
nombreMostrado={perfil?.username || 'Usuario'} 
username={username} 
locationText={locationText} 
pronounText={pronounText} 
commissionsOpen={commissionsOpen} // <--- NUEVA LÍNEA
setUsername={setUsername} 
setLocationText={setLocationText} 
setPronounText={setPronounText} 
setCommissionsOpen={setCommissionsOpen} // <--- NUEVA LÍNEA
/><ProfileBio editando={editando} bio={bio} setBio={setBio} />
<SocialLinks editando={editando} perfil={perfil} socialTwitter={socialTwitter} socialInstagram={socialInstagram} socialPatreon={socialPatreon} socialTiktok={socialTiktok} socialYoutube={socialYoutube} setSocialTwitter={setSocialTwitter} setSocialInstagram={setSocialInstagram} setSocialPatreon={setSocialPatreon} setSocialTiktok={setSocialTiktok} setSocialYoutube={setSocialYoutube} limpiarUsername={limpiarUsername} />
</div>


<StatsBar stats={stats} />
</div>

<WorksTabs tab={tab} setTab={setTab} obrasCount={stats.obras} likesCount={obrasLikeadas.length} guardadosCount={guardadosCount} />
{renderContent()}

{showModalCol && (
<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
<div className="card scale-in" style={{ width:'100%', maxWidth:400, padding:24 }}>
<h3 style={{ marginTop:0, color:'#fff' }}>Nueva Colección</h3>
<input autoFocus type="text" value={nombreNuevaCol} onChange={(e) => setNombreNuevaCol(e.target.value)} placeholder="Ej: Referencias, Favoritos..." style={{ width:'100%', padding:'12px', borderRadius:8, background:'#050d1a', border:'1px solid #1e2f4d', color:'#fff', marginBottom:20 }} onKeyDown={(e) => e.key === 'Enter' && handleCrearColeccion()} />
<div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
<button onClick={() => setShowModalCol(false)} style={{ background:'transparent', color:'#88a0b5', border:'none', cursor:'pointer' }}>Cancelar</button>
<button disabled={creandoCol || !nombreNuevaCol.trim()} onClick={handleCrearColeccion} style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'8px 20px', borderRadius:6, cursor:'pointer' }}>{creandoCol ? 'Creando...' : 'Crear'}</button>
</div>
</div>
</div>
)}

<ZoomModal obra={obraZoom} obras={obrasActivas} colecciones={colecciones} onSave={handleGuardarEnColeccion} onClose={() => setObraZoom(null)} onNext={goToNext} onPrev={goToPrev} onDelete={eliminarObraSmart} />
</div>
</div>
)
}