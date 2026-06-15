// Ruta: src/app/perfil/[id]/page.tsx
// Perfil público (de otros usuarios). Solo lectura + seguir + dar like.

"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase, PERFIL_COLS } from '@/lib/supabase'
import { CSS } from '../utils/styles'
import { BANNER_PRESETS, TIPO_LABELS } from '../utils/constants'
import { limpiarUsername } from '../utils/helpers'
import type { Usuario, Obra } from '../utils/types'
import FollowButton from '@/components/FollowButton'
import ZoomModal from '@/components/ZoomModal'

interface ToastItem { id: number; msg: string; tipo: 'ok' | 'info' | 'err' }

export default function PerfilPublico() {
  const params = useParams()
  const id = (params?.id as string) || ''

  const [viewer, setViewer] = useState<any>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  const [stats, setStats] = useState({ obras: 0, likes: 0, seguidores: 0, siguiendo: 0 })
  const [likesData, setLikesData] = useState<Record<string, boolean>>({})
  const [colecciones, setColecciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noExiste, setNoExiste] = useState(false)
  const [obraZoom, setObraZoom] = useState<Obra | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
    const tid = Date.now()
    setToasts(prev => [...prev, { id: tid, msg, tipo }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 3200)
  }, [])

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // Si es mi propio perfil, voy a la versión editable
      if (user && user.id === id) { window.location.href = '/perfil'; return }
      setViewer(user)

      const { data: p } = await supabase.from('Usuarios').select(PERFIL_COLS).eq('id', id).maybeSingle()
      if (!p) { setNoExiste(true); setLoading(false); return }
      setPerfil(p)

      const { data: obrasData } = await supabase
        .from('obras')
        .select('*, Usuarios(id, username, avatar_url)')
        .eq('usuario_id', id)
        .order('created_at', { ascending: false })
      setObras(obrasData || [])

      const totalLikes = (obrasData || []).reduce((s, o) => s + (o.likes_count || 0), 0)
      const [{ count: seg }, { count: sig }] = await Promise.all([
        supabase.from('seguidores').select('*', { count: 'exact', head: true }).eq('seguido_id', id),
        supabase.from('seguidores').select('*', { count: 'exact', head: true }).eq('seguidor_id', id),
      ])
      setStats({ obras: obrasData?.length || 0, likes: totalLikes, seguidores: seg || 0, siguiendo: sig || 0 })

      // Estado de likes y colecciones del visitante
      if (user) {
        const [{ data: likes }, { data: cols }] = await Promise.all([
          supabase.from('likes').select('obra_id').eq('usuario_id', user.id),
          supabase.from('colecciones').select('*, obras_guardadas(count)').eq('usuario_id', user.id),
        ])
        const likeMap: Record<string, boolean> = {}
        likes?.forEach((l: any) => { likeMap[l.obra_id] = true })
        setLikesData(likeMap)
        setColecciones(cols || [])
      }

      setLoading(false)
    }
    cargar()
  }, [id])

  const darLike = async (obra: any) => {
    if (!viewer) { toast('Inicia sesión para dar like', 'info'); return obra }
    const yaLiked = likesData[obra.id]
    const nuevoConteo = yaLiked ? Math.max(0, (obra.likes_count || 0) - 1) : (obra.likes_count || 0) + 1

    setLikesData(prev => ({ ...prev, [obra.id]: !yaLiked }))
    setObras(prev => prev.map(o => o.id === obra.id ? { ...o, likes_count: nuevoConteo } : o))

    // El contador likes_count lo mantiene un trigger en la tabla `likes`.
    if (yaLiked) {
      await supabase.from('likes').delete().eq('usuario_id', viewer.id).eq('obra_id', obra.id)
    } else {
      await supabase.from('likes').insert({ usuario_id: viewer.id, obra_id: obra.id })
    }

    const actualizada = { ...obra, likes_count: nuevoConteo }
    if (obraZoom?.id === obra.id) setObraZoom(actualizada)
    return actualizada
  }

  const handleSave = async (obraId: string, colId: string, nombreColeccion: string) => {
    if (!viewer) return
    const { error } = await supabase
      .from('obras_guardadas')
      .insert([{ usuario_id: viewer.id, obra_id: obraId, coleccion_id: colId }])
    if (error) {
      if (error.code === '23505') toast(`Ya está guardada en "${nombreColeccion}"`, 'info')
      else toast('Error al guardar', 'err')
    } else {
      toast(`✓ Guardada en "${nombreColeccion}"`)
      setColecciones(prev => prev.map((c: any) =>
        c.id === colId ? { ...c, obras_guardadas: [{ count: (c.obras_guardadas?.[0]?.count || 0) + 1 }] } : c
      ))
    }
  }

  const handleCrearYGuardar = async (nombre: string) => {
    if (!viewer || !obraZoom || !nombre.trim()) return
    const { data: nuevaCol, error } = await supabase
      .from('colecciones')
      .insert([{ nombre: nombre.trim(), usuario_id: viewer.id }])
      .select().single()
    if (error || !nuevaCol) { toast('Error al crear colección', 'err'); return }
    await supabase.from('obras_guardadas').insert([{ usuario_id: viewer.id, obra_id: obraZoom.id, coleccion_id: nuevaCol.id }])
    setColecciones(prev => [...prev, { ...nuevaCol, obras_guardadas: [{ count: 1 }] }])
    toast(`✓ Colección "${nombre}" creada`)
  }

  const goToNext = () => {
    if (!obraZoom || !obras.length) return
    const idx = obras.findIndex(o => o.id === obraZoom.id)
    if (idx === -1) return
    setObraZoom(obras[(idx + 1) % obras.length])
  }
  const goToPrev = () => {
    if (!obraZoom || !obras.length) return
    const idx = obras.findIndex(o => o.id === obraZoom.id)
    if (idx === -1) return
    setObraZoom(obras[idx <= 0 ? obras.length - 1 : idx - 1])
  }

  if (loading) {
    return (
      <div style={{ background: '#050d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a4060' }}>
        Cargando perfil...
      </div>
    )
  }

  if (noExiste) {
    return (
      <div style={{ background: '#050d1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3a6688', gap: 16 }}>
        <h2 style={{ color: '#e8f4ff' }}>Perfil no encontrado</h2>
        <a href="/galeria" style={{ color: '#00cfff', textDecoration: 'none' }}>← Volver a la galería</a>
      </div>
    )
  }

  const banner = perfil?.banner_url
    ? { backgroundImage: `url(${perfil.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: BANNER_PRESETS[perfil?.banner_color_idx ?? 0]?.bg }

  const socials = [
    { url: perfil?.social_twitter, label: '𝕏', dominio: 'twitter.com' },
    { url: perfil?.social_instagram, label: 'Instagram', dominio: 'instagram.com' },
    { url: perfil?.social_patreon, label: 'Patreon', dominio: 'patreon.com' },
    { url: perfil?.social_tiktok, label: 'TikTok', dominio: 'tiktok.com' },
    { url: perfil?.social_youtube, label: 'YouTube', dominio: 'youtube.com' },
  ].filter(s => s.url)

  return (
    <div style={{ background: '#050d1a', minHeight: '100vh', color: '#c8e0f4', fontFamily: 'sans-serif' }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 4%' }}>
        <div className="card fade-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
          {/* Banner */}
          <div style={{ height: 160, ...banner }} />

          <div style={{ padding: '0 28px 28px' }}>
            {/* Avatar + acciones */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -44, marginBottom: 16 }}>
              <img
                src={perfil?.avatar_url || '/default-avatar.png'}
                alt={perfil?.username || 'avatar'}
                style={{ width: 96, height: 96, borderRadius: '50%', border: '4px solid #0a1628', objectFit: 'cover', background: '#0d2040' }}
              />
              {viewer && perfil && (
                <FollowButton currentUserId={viewer.id} targetUserId={perfil.id} />
              )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e8f4ff' }}>{perfil?.username || 'Usuario'}</h1>
              {perfil?.tipo && <span className="tipo-pill">{TIPO_LABELS[perfil.tipo] || perfil.tipo.toUpperCase()}</span>}
              {perfil?.commissions_open && (
                <span className="tipo-pill" style={{ borderColor: '#00ffcc33', background: '#00ffcc0d', color: '#00ffcc' }}>COMISIONES ABIERTAS</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
              {perfil?.location && <span style={{ color: '#3a6688', fontSize: 13 }}>📍 {perfil.location}</span>}
              {perfil?.pronoun && <span style={{ color: '#3a6688', fontSize: 13 }}>· {perfil.pronoun}</span>}
            </div>

            {perfil?.bio && <p style={{ color: '#c8e0f4', fontSize: 14, lineHeight: 1.6, marginTop: 14, whiteSpace: 'pre-wrap' }}>{perfil.bio}</p>}

            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {socials.map((s, i) => (
                  <a key={i} className="social-chip" href={`https://${s.dominio}/${limpiarUsername(s.url!)}`} target="_blank" rel="noopener noreferrer">
                    {s.label} <b>@{limpiarUsername(s.url!)}</b>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', borderTop: '1px solid #0d2040' }}>
            {[
              { n: stats.obras, label: 'Obras' },
              { n: stats.likes, label: 'Likes' },
              { n: stats.seguidores, label: 'Seguidores' },
              { n: stats.siguiendo, label: 'Siguiendo' },
            ].map((s, i) => (
              <div key={i} className="stat-block" style={{ flex: 1, textAlign: 'center', padding: '16px 0', borderLeft: i ? '1px solid #0d2040' : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#e8f4ff' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: '#3a6688', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Obras */}
        {obras.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#1a4060', marginTop: 40 }}>Este artista aún no tiene obras publicadas.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxWidth: 935, margin: '0 auto' }}>
            {obras.map(obra => (
              <div key={obra.id} className="obra-card" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#0a1628' }} onClick={() => setObraZoom(obra)}>
                <img src={obra.imagen_url} alt={obra.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="obra-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>❤️ {obra.likes_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {obraZoom && (
        <ZoomModal
          obra={obraZoom}
          currentUserId={viewer?.id}
          isLiked={likesData[obraZoom.id]}
          onLike={darLike}
          colecciones={colecciones}
          onSave={handleSave}
          onCreateCollection={viewer ? handleCrearYGuardar : undefined}
          onNext={goToNext}
          onPrev={goToPrev}
          onClose={() => setObraZoom(null)}
        />
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px', borderRadius: 25, fontSize: 13, fontWeight: 600,
            background: t.tipo === 'err' ? '#ff6b9dcc' : t.tipo === 'info' ? '#1e2f4dcc' : '#00cfffcc',
            color: t.tipo === 'ok' ? '#050d1a' : '#fff', backdropFilter: 'blur(5px)',
            animation: 'toastIn 0.3s ease-out', boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
          }}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}
