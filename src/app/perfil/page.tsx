"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Importar tipos
import type { Usuario, Obra, Stats, ToastItem, Tab } from './utils/types'

// Importar constantes
import { BANNER_PRESETS, TIPO_LABELS } from './utils/constants'

// Importar estilos
import { CSS } from './utils/styles'

import LoadingSkeleton from './components/LoadingSkeleton'



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
    setBannerIdx(perfil?.banner_color_idx ?? 0)
    setBannerUrl(perfil?.banner_url || null)
    setEditando(false)
  }

  const subirAvatar = async (file: File) => {
    if (!user) return
    setSubiendoAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('Avatars')
      .upload(path, file, { upsert: true })

    if (upErr) {
      toast('Error al subir el avatar', 'err')
      setSubiendoAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('Avatars')
      .getPublicUrl(path)
      
    await supabase.from('Usuarios').update({ avatar_url: publicUrl }).eq('id', user.id)
    setPerfil(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
    toast('✓ Avatar actualizado')
    setSubiendoAvatar(false)
  }

  const subirBanner = async (file: File) => {
    if (!user) return
    setSubiendoBanner(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('Banners')
      .upload(path, file, { upsert: true })

    if (upErr) {
      console.error('Error detallado:', upErr)
      toast(`Error al subir el banner: ${upErr.message}`, 'err')
      setSubiendoBanner(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('Banners')
      .getPublicUrl(path)
      
    setBannerUrl(publicUrl)
    toast('✓ Banner actualizado')
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

      {/* ── Toasts ── */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:1000, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            animation: 'toastIn .3s ease both',
            background: t.tipo === 'ok' ? '#0a1628' : '#180a16',
            border: `1px solid ${t.tipo === 'ok' ? '#00cfff44' : '#ff6b9d44'}`,
            color:  t.tipo === 'ok' ? '#00cfff' : '#ff6b9d',
            padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            boxShadow: '0 6px 24px #00000077',
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 4%' }}>

        {/* ── Profile Card ── */}
        <div className="fade-up card" style={{ marginBottom:20, overflow:'hidden' }}>

          {/* Banner */}
          <div style={{
            height: 120, 
            position: 'relative', 
            overflow: 'hidden',
            background: bannerUrl 
              ? `url(${bannerUrl}) center/cover`
              : banner.bg,
            borderRadius: '20px 20px 0 0',
          }}>
            {/* Decorative orbs (solo si NO hay imagen) */}
            {!bannerUrl && (
              <>
                <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,#00cfff09,transparent)', top:-140, left:'15%', pointerEvents:'none' }}/>
                <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,#ff6b9d07,transparent)', top:-60, right:'10%', pointerEvents:'none' }}/>
              </>
            )}

            {/* Banner controls (edit mode) */}
            {editando && (
              <div style={{ position:'absolute', bottom:10, right:14, display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
                <button 
                  className="banner-upload-btn" 
                  onClick={() => bannerRef.current?.click()}
                  disabled={subiendoBanner}
                >
                  {subiendoBanner ? '...' : '📷 Subir foto'}
                </button>
                
                {bannerUrl && (
                  <button 
                    className="banner-upload-btn" 
                    onClick={eliminarBanner}
                    style={{ background:'#ff6b9d33', borderColor:'#ff6b9d44' }}
                  >
                    🗑️ Quitar foto
                  </button>
                )}

                {!bannerUrl && <span style={{ color:'#ffffff33', fontSize:10, fontWeight:700, letterSpacing:.5 }}>COLORES</span>}
                
                {!bannerUrl && BANNER_PRESETS.map((preset, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)} style={{
                    width: bannerIdx === i ? 22 : 18,
                    height: bannerIdx === i ? 22 : 18,
                    borderRadius: '50%',
                    background: preset.bg,
                    border: bannerIdx === i ? '2px solid #00cfff' : '2px solid #ffffff22',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}/>
                ))}
              </div>
            )}

            <input 
              ref={bannerRef} 
              type="file" 
              accept="image/*"
              onChange={e => e.target.files?.[0] && subirBanner(e.target.files[0])} 
            />
          </div>

          {/* Profile body */}
          <div style={{ padding:'0 28px 28px' }}>

            {/* Avatar + action buttons row */}
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              flexWrap:'wrap', gap:12, marginTop:-40, marginBottom:18,
            }}>
              {/* Avatar */}
              <div
                style={{ position:'relative', cursor: editando ? 'pointer' : 'default' }}
                onClick={() => editando && avatarRef.current?.click()}
              >
                <img
                  src={avatarUrl}
                  style={{ width:82, height:82, borderRadius:'50%', border:'4px solid #0a1628', boxShadow:'0 0 0 2px #00cfff33', objectFit:'cover', display:'block' }}
                />
                <div style={{ position:'absolute', bottom:4, right:4, width:13, height:13, borderRadius:'50%', background:'#00cfff', border:'2px solid #0a1628' }}/>
                {editando && (
                  <div style={{
                    position:'absolute', inset:0, borderRadius:'50%',
                    background: subiendoAvatar ? '#000000bb' : '#000000aa',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    opacity: subiendoAvatar ? 1 : 0,
                    transition: 'opacity .2s',
                    fontSize:11, fontWeight:700, color:'#00cfff', border:'4px solid #0a1628',
                  }}
                    onMouseEnter={e => { if(!subiendoAvatar)(e.currentTarget.style.opacity = '1') }}
                    onMouseLeave={e => { if(!subiendoAvatar)(e.currentTarget.style.opacity = '0') }}
                  >
                    {subiendoAvatar ? '...' : '📷'}
                  </div>
                )}
                <input ref={avatarRef} type="file" accept="image/*"
                  onChange={e => e.target.files?.[0] && subirAvatar(e.target.files[0])} />
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {editando ? (
                  <>
                    <button className="btn-primary" onClick={guardarPerfil} disabled={guardando}
                      style={{ padding:'8px 22px', fontSize:13 }}>
                      {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button className="btn-ghost" onClick={cancelarEdicion}
                      style={{ padding:'8px 16px', fontSize:13 }}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => setEditando(true)}
                      style={{ padding:'8px 20px', fontSize:13 }}>
                      ✏️ Editar perfil
                    </button>
                    <button className="btn-ghost" onClick={cerrarSesion}
                      style={{ padding:'8px 16px', fontSize:13, color:'#ff6b9d44', borderColor:'#2a1020' }}>
                      Salir
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name + email + tipo */}
            <div style={{ marginBottom:12 }}>
              {editando
                ? <input value={username} onChange={e => setUsername(e.target.value)} className="field"
                    style={{ fontSize:18, fontWeight:800, maxWidth:280, marginBottom:8 }} />
                : <h1 style={{ fontSize:22, fontWeight:800, color:'#e8f4ff', marginBottom:6 }}>{nombreMostrado}</h1>
              }
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ color:'#1a4060', fontSize:12 }}>{user.email}</span>
                <span className="tipo-pill">{TIPO_LABELS[perfil?.tipo || 'fan'] || (perfil?.tipo?.toUpperCase()) || 'FAN'}</span>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom:14 }}>
              {editando
                ? <textarea value={bio} onChange={e => setBio(e.target.value)} className="field"
                    placeholder="Cuéntanos sobre ti…" rows={3} style={{ resize:'none' }} />
                : <p style={{
                    color: bio ? '#8ab4cc' : '#1a4060', fontSize:14, lineHeight:1.75,
                    fontStyle: bio ? 'normal' : 'italic',
                  }}>
                    {bio || 'Sin bio aún — haz clic en Editar perfil para agregar una.'}
                  </p>
              }
            </div>

            {/* Social links */}
            {editando ? (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
                  background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
                  <span style={{ color:'#1a4060', fontSize:13, fontWeight:700 }}>𝕏</span>
                  <input value={socialTwitter} onChange={e => setSocialTwitter(e.target.value)}
                    placeholder="usuario_twitter" style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
                  background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
                  <span style={{ color:'#1a4060', fontSize:13 }}>📸</span>
                  <input value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)}
                    placeholder="usuario_instagram" style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} />
                </div>
              </div>
            ) : (
              (perfil?.social_twitter || perfil?.social_instagram) && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {perfil?.social_twitter && (
                    <a className="social-chip" href={`https://twitter.com/${perfil.social_twitter}`} target="_blank" rel="noopener noreferrer">
                      𝕏 @{perfil.social_twitter}
                    </a>
                  )}
                  {perfil?.social_instagram && (
                    <a className="social-chip" href={`https://instagram.com/${perfil.social_instagram}`} target="_blank" rel="noopener noreferrer">
                      📸 @{perfil.social_instagram}
                    </a>
                  )}
                </div>
              )
            )}
          </div>

          {/* Stats bar */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #0d2040' }}>
            {([
              { n: stats.obras,      label:'Obras',         icon:'🎨' },
              { n: stats.likes,      label:'Likes totales', icon:'♥'  },
              { n: stats.seguidores, label:'Seguidores',    icon:'👥' },
              { n: stats.siguiendo,  label:'Siguiendo',     icon:'→'  },
            ] as const).map((s, i) => (
              <div key={i} className="stat-block" style={{
                textAlign:'center', padding:'16px 8px',
                borderRight: i < 3 ? '1px solid #0d2040' : 'none',
                animationDelay: `${i * 80}ms`,
              }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#00cfff', lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:11, color:'#1a4060', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display:'flex', gap:4, marginBottom:18,
          background:'#0a1628', border:'1px solid #0d2040', borderRadius:14,
          padding:4, width:'fit-content',
        }}>
          {(['obras', 'likes'] as const).map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
              background: tab === t ? '#0d2040' : 'transparent',
              color:      tab === t ? '#00cfff' : '#3a6688',
            }}>
              {t === 'obras'
                ? `🎨 Mis obras (${stats.obras})`
                : `♥ Me gustaron (${obrasLikeadas.length})`}
            </button>
          ))}
        </div>

        {/* ── Works grid ── */}
        {obrasActivas.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div style={{ columns:'3 220px', gap:14 }}>
            {obrasActivas.map((obra: Obra) => (
              <div
                key={obra.id}
                className="obra-card"
                style={{
                  breakInside:'avoid', marginBottom:14,
                  borderRadius:12, overflow:'hidden',
                  border:'1px solid #0d2040', background:'#0a1628',
                  position:'relative',
                }}
                onClick={() => setObraZoom(obra)}
              >
                <img src={obra.imagen_url} style={{ width:'100%', display:'block' }} alt={obra.titulo} />
                <div className="obra-overlay" style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(to top,#050d1af0 0%,#050d1a44 50%,transparent 100%)',
                  opacity:0, transition:'opacity .25s',
                  display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:12,
                }}>
                  <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:13, marginBottom:4 }}>{obra.titulo}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#ff6b9d', fontSize:12 }}>♥ {obra.likes_count || 0}</span>
                    {tab === 'obras' && (
                      <button className="delete-btn" onClick={e => eliminarObra(obra, e)}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Zoom modal ── */}
      {obraZoom && (
        <div
          onClick={() => setObraZoom(null)}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background:'#000000ee', backdropFilter:'blur(16px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:20, cursor:'zoom-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card scale-in"
            style={{ maxWidth:900, width:'100%', overflow:'hidden', cursor:'default' }}
          >
            <img
              src={obraZoom.imagen_url}
              style={{ width:'100%', maxHeight:'70vh', objectFit:'contain', display:'block' }}
              alt={obraZoom.titulo}
            />
            <div style={{ padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div>
                <p style={{ color:'#e8f4ff', fontWeight:800, fontSize:16 }}>{obraZoom.titulo}</p>
                {obraZoom.descripcion && (
                  <p style={{ color:'#3a6688', fontSize:13, marginTop:5, lineHeight:1.6 }}>{obraZoom.descripcion}</p>
                )}
                <p style={{ color:'#1a4060', fontSize:11, marginTop:6 }}>
                  {new Date(obraZoom.created_at).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })}
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ color:'#ff6b9d', fontSize:16, fontWeight:700 }}>♥ {obraZoom.likes_count || 0}</span>
                {obraZoom.tipo && (
                  <span className="tipo-pill">{obraZoom.tipo.toUpperCase()}</span>
                )}
                {tab === 'obras' && (
                  <button className="delete-btn" onClick={e => eliminarObra(obraZoom, e)}>
                    Eliminar
                  </button>
                )}
                <button
                  onClick={() => setObraZoom(null)}
                  className="btn-ghost"
                  style={{ width:34, height:34, borderRadius:'50%', fontSize:18, padding:0,
                    display:'flex', alignItems:'center', justifyContent:'center' }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 0' }}>
      <p style={{ fontSize:44, marginBottom:16 }}>{tab === 'obras' ? '🎨' : '♥'}</p>
      <p style={{ color:'#1a4060', fontSize:14, marginBottom:22 }}>
        {tab === 'obras' ? 'No has publicado obras aún.' : 'No has dado like a ninguna obra aún.'}
      </p>
      {tab === 'obras' && (
        <button
          className="btn-primary"
          onClick={() => window.location.href = '/galeria'}
          style={{ padding:'10px 26px', fontSize:13 }}
        >
          Ir a la galería →
        </button>
      )}
    </div>
  )
}
