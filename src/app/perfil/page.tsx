"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Perfil() {
  const [user, setUser]           = useState<any>(null)
  const [perfil, setPerfil]       = useState<any>(null)
  const [obras, setObras]         = useState<any[]>([])
  const [stats, setStats]         = useState({ obras: 0, likes: 0, seguidores: 0, siguiendo: 0 })
  const [loading, setLoading]     = useState(true)
  const [editando, setEditando]   = useState(false)
  const [bio, setBio]             = useState("")
  const [username, setUsername]   = useState("")
  const [guardando, setGuardando] = useState(false)
  const [obraZoom, setObraZoom]   = useState<any>(null)
  const [tab, setTab]             = useState<'obras' | 'likes'>('obras')
  const [obrasLikeadas, setObrasLikeadas] = useState<any[]>([])

  useEffect(() => {
    const cargar = async () => {
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) { window.location.href = '/'; return }
      setUser(userData)

      // Perfil
      const { data: perfilData } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('id', userData.id)
        .single()
      setPerfil(perfilData)
      setBio(perfilData?.bio || "")
      setUsername(perfilData?.username || "")

      // Obras propias
      const { data: obrasData } = await supabase
        .from('obras')
        .select('*')
        .eq('usuario_id', userData.id)
        .order('created_at', { ascending: false })
      setObras(obrasData || [])

      // Obras likeadas
      const { data: likesData } = await supabase
        .from('likes')
        .select('obra_id, obras(*, Usuarios(username))')
        .eq('usuario_id', userData.id)
      setObrasLikeadas(likesData?.map((l: any) => l.obras).filter(Boolean) || [])

      // Stats
      const totalLikes = obrasData?.reduce((sum: number, o: any) => sum + (o.likes_count || 0), 0) || 0
      const { count: seguidores } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguido_id', userData.id)
      const { count: siguiendo } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguidor_id', userData.id)

      setStats({
        obras: obrasData?.length || 0,
        likes: totalLikes,
        seguidores: seguidores || 0,
        siguiendo: siguiendo || 0,
      })

      setLoading(false)
    }
    cargar()
  }, [])

  const guardarPerfil = async () => {
    if (!user) return
    setGuardando(true)
    await supabase
      .from('Usuarios')
      .update({ bio, username })
      .eq('id', user.id)
    setPerfil((prev: any) => ({ ...prev, bio, username }))
    setGuardando(false)
    setEditando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ background:'#050d1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#1a4060', fontFamily:'sans-serif' }}>Cargando perfil...</p>
    </div>
  )

  if (!user) return null

  const avatar = user.user_metadata?.avatar_url || perfil?.avatar_url
  const nombreMostrado = perfil?.username || user.user_metadata?.full_name || 'Usuario'
  const obrasActivas = tab === 'obras' ? obras : obrasLikeadas

  return (
    <div style={{ fontFamily:'sans-serif', background:'#050d1a', minHeight:'100vh', color:'#c8e0f4' }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-thumb { background:#00cfff22 }
        input:focus, textarea:focus { outline:none; border-color:#00cfff55 !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 4%' }}>

        {/* CARD PERFIL */}
        <div className="fade-up" style={{ background:'#0a1628', border:'1px solid #0d2040', borderRadius:20, padding:32, marginBottom:24, position:'relative' }}>

          {/* Banner decorativo */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:100, borderRadius:'20px 20px 0 0', background:'linear-gradient(135deg, #050d1a, #0d2040, #050d1a)', overflow:'hidden' }}>
            <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,#00cfff08,transparent)', top:-100, left:'30%' }}/>
          </div>

          <div style={{ position:'relative', display:'flex', gap:24, alignItems:'flex-end', marginTop:60, flexWrap:'wrap' }}>
            {/* Avatar */}
            <div style={{ position:'relative' }}>
              <img src={avatar} style={{ width:88, height:88, borderRadius:'50%', border:'3px solid #0a1628', boxShadow:'0 0 0 2px #00cfff44', display:'block' }} />
              <div style={{ position:'absolute', bottom:2, right:2, width:16, height:16, borderRadius:'50%', background:'#00cfff', border:'2px solid #0a1628' }}/>
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              {editando ? (
                <input value={username} onChange={e => setUsername(e.target.value)}
                  style={{ background:'#07111f', border:'1px solid #0d2040', borderRadius:8, padding:'6px 12px', color:'#e8f4ff', fontSize:20, fontWeight:800, width:'100%', maxWidth:280 }}
                />
              ) : (
                <h1 style={{ fontSize:22, fontWeight:800, color:'#e8f4ff', marginBottom:4 }}>{nombreMostrado}</h1>
              )}
              <p style={{ color:'#1a4060', fontSize:12, marginBottom:6 }}>{user.email}</p>
              <span style={{ background:'#00cfff11', border:'1px solid #00cfff33', color:'#00cfff', fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:20, letterSpacing:1 }}>
                {perfil?.tipo?.toUpperCase() || 'FAN'}
              </span>
            </div>

            {/* Botones */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {editando ? (
                <>
                  <button onClick={guardarPerfil} disabled={guardando} style={{ background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55', color:'#00cfff', padding:'8px 20px', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(false)} style={{ background:'none', border:'1px solid #0d2040', color:'#3a6688', padding:'8px 16px', borderRadius:24, fontSize:13, cursor:'pointer' }}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditando(true)} style={{ background:'none', border:'1px solid #0d2040', color:'#3a6688', padding:'8px 18px', borderRadius:24, fontSize:13, cursor:'pointer' }}>
                    ✏️ Editar perfil
                  </button>
                  <button onClick={cerrarSesion} style={{ background:'none', border:'1px solid #2a1020', color:'#ff6b9d44', padding:'8px 16px', borderRadius:24, fontSize:13, cursor:'pointer' }}>
                    Salir
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop:20 }}>
            {editando ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..."
                rows={3} style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'10px 14px', color:'#c8e0f4', fontSize:14, resize:'none', fontFamily:'sans-serif' }}
              />
            ) : (
              <p style={{ color: bio ? '#8ab4cc' : '#1a4060', fontSize:14, lineHeight:1.6, fontStyle: bio ? 'normal' : 'italic' }}>
                {bio || 'Sin bio aún — haz clic en Editar perfil para agregar una.'}
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:0, marginTop:24, borderTop:'1px solid #0d2040', paddingTop:20, flexWrap:'wrap' }}>
            {[
              { n: stats.obras,      label: 'Obras'      },
              { n: stats.likes,      label: 'Likes totales' },
              { n: stats.seguidores, label: 'Seguidores' },
              { n: stats.siguiendo,  label: 'Siguiendo'  },
            ].map((s, i) => (
              <div key={i} style={{ flex:1, textAlign:'center', padding:'8px 0', borderRight: i < 3 ? '1px solid #0d2040' : 'none', minWidth:80 }}>
                <div style={{ fontSize:24, fontWeight:800, color:'#00cfff' }}>{s.n}</div>
                <div style={{ fontSize:11, color:'#1a4060', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'#0a1628', border:'1px solid #0d2040', borderRadius:14, padding:4, width:'fit-content' }}>
          {(['obras', 'likes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'8px 24px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
              background: tab === t ? '#0d2040' : 'transparent',
              color: tab === t ? '#00cfff' : '#3a6688',
              transition:'all 0.2s'
            }}>
              {t === 'obras' ? `🎨 Mis obras (${stats.obras})` : `♥ Me gustaron (${obrasLikeadas.length})`}
            </button>
          ))}
        </div>

        {/* GRID OBRAS */}
        {obrasActivas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ fontSize:36, marginBottom:12 }}>{tab === 'obras' ? '🎨' : '♥'}</p>
            <p style={{ color:'#1a4060', fontSize:14 }}>
              {tab === 'obras' ? 'No has publicado obras aún.' : 'No has dado like a ninguna obra aún.'}
            </p>
            {tab === 'obras' && (
              <button onClick={() => window.location.href='/galeria'} style={{ marginTop:16, background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55', color:'#00cfff', padding:'10px 24px', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Ir a la galería →
              </button>
            )}
          </div>
        ) : (
          <div style={{ columns:'3 220px', gap:14 }}>
            {obrasActivas.map((obra: any) => (
              <div key={obra.id}
                style={{ breakInside:'avoid', marginBottom:14, borderRadius:12, overflow:'hidden', border:'1px solid #0d2040', background:'#0a1628', cursor:'zoom-in', position:'relative' }}
                onClick={() => setObraZoom(obra)}
                onMouseEnter={e => (e.currentTarget.querySelector('.ov') as HTMLElement)?.style.setProperty('opacity','1')}
                onMouseLeave={e => (e.currentTarget.querySelector('.ov') as HTMLElement)?.style.setProperty('opacity','0')}
              >
                <img src={obra.imagen_url} style={{ width:'100%', display:'block' }} />
                <div className="ov" style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#050d1add,transparent)', opacity:0, transition:'opacity 0.25s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:12 }}>
                  <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:13 }}>{obra.titulo}</p>
                  <p style={{ color:'#ff6b9d', fontSize:12, marginTop:2 }}>♥ {obra.likes_count || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ZOOM */}
      {obraZoom && (
        <div onClick={() => setObraZoom(null)} style={{ position:'fixed', inset:0, zIndex:300, background:'#000000ee', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out' }}>
          <div onClick={e => e.stopPropagation()} style={{ position:'relative', maxWidth:860, width:'100%', background:'#0a1628', borderRadius:20, border:'1px solid #0d2040', overflow:'hidden', cursor:'default' }}>
            <img src={obraZoom.imagen_url} style={{ width:'100%', maxHeight:'78vh', objectFit:'contain', display:'block' }}/>
            <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:15 }}>{obraZoom.titulo}</p>
                {obraZoom.descripcion && <p style={{ color:'#3a6688', fontSize:12, marginTop:4 }}>{obraZoom.descripcion}</p>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ color:'#ff6b9d', fontSize:14 }}>♥ {obraZoom.likes_count || 0}</span>
                <button onClick={() => setObraZoom(null)} style={{ background:'none', border:'1px solid #0d2040', color:'#3a6688', width:30, height:30, borderRadius:'50%', fontSize:18, cursor:'pointer' }}>×</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}