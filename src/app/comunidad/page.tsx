"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const canales = [
  { id:"general",   emoji:"🌊", nombre:"General",          color:"#00cfff" },
  { id:"debate",    emoji:"⚡", nombre:"Debate",            color:"#a78bfa" },
  { id:"ayuda",     emoji:"💡", nombre:"Ayuda & Tips",      color:"#00ffcc" },
  { id:"noticias",  emoji:"📡", nombre:"Noticias Anime",    color:"#06b6d4" },
  { id:"showcase",  emoji:"🎨", nombre:"Showcase",          color:"#ff6b9d" },
  { id:"off-topic", emoji:"☕", nombre:"Off-Topic",         color:"#3a6688" },
]

export default function Comunidad() {
  const [hilos, setHilos]           = useState<any[]>([])
  const [user, setUser]             = useState<any>(null)
  const [canal, setCanal]           = useState("all")
  const [showModal, setShowModal]   = useState(false)
  const [titulo, setTitulo]         = useState("")
  const [contenido, setContenido]   = useState("")
  const [canalNuevo, setCanalNuevo] = useState("general")
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    cargarHilos()
  }, [canal])

  const cargarHilos = async () => {
    setLoading(true)
    let query = supabase
      .from('hilos')
      .select(`*, Usuarios(username, avatar_url)`)
      .order('created_at', { ascending: false })

    if (canal !== 'all') query = query.eq('canal', canal)

    const { data, error } = await query
    if (!error) setHilos(data || [])
    setLoading(false)
  }

  const publicarHilo = async () => {
    if (!titulo.trim() || !user) return
    const { error } = await supabase.from('hilos').insert({
      usuario_id: user.id,
      canal: canalNuevo,
      titulo,
      contenido,
      votos: 0,
      comments_count: 0,
    })
    if (!error) {
      setTitulo(""); setContenido(""); setShowModal(false)
      cargarHilos()
    }
  }

  const votar = async (hilo: any) => {
    if (!user) return
    await supabase.from('hilos').update({ votos: hilo.votos + 1 }).eq('id', hilo.id)
    setHilos(prev => prev.map(h => h.id === hilo.id ? { ...h, votos: h.votos + 1 } : h))
  }

  const fmt = (n: number) => n >= 1000 ? (n/1000).toFixed(1)+'k' : n

  return (
    <div style={{ fontFamily:'sans-serif', background:'#050d1a', minHeight:'100vh', color:'#c8e0f4' }}>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#00cfff22}`}</style>

      

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 3%', display:'grid', gridTemplateColumns:'200px 1fr', gap:32 }}>

        {/* Canales */}
        <div>
          <p style={{ color:'#1a4060', fontSize:10, fontWeight:800, letterSpacing:2, marginBottom:12 }}>CANALES</p>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <button onClick={() => setCanal('all')} style={{
              textAlign:'left', padding:'8px 12px', borderRadius:10, border:`1px solid ${canal==='all'?'#00cfff33':'transparent'}`,
              background: canal==='all'?'#00cfff12':'transparent', color: canal==='all'?'#00cfff':'#3a6688',
              cursor:'pointer', fontSize:13, fontWeight:600
            }}>🌐 Todo</button>
            {canales.map(ch => (
              <button key={ch.id} onClick={() => setCanal(ch.id)} style={{
                textAlign:'left', padding:'8px 12px', borderRadius:10,
                border:`1px solid ${canal===ch.id?ch.color+'33':'transparent'}`,
                background: canal===ch.id?ch.color+'12':'transparent',
                color: canal===ch.id?ch.color:'#3a6688',
                cursor:'pointer', fontSize:13, fontWeight:600
              }}>{ch.emoji} {ch.nombre}</button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#e8f4ff' }}>Comunidad</h1>
            {user && <button onClick={() => setShowModal(true)} style={{
              background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55',
              color:'#00cfff', padding:'9px 22px', borderRadius:30, fontSize:13, fontWeight:700, cursor:'pointer'
            }}>+ Nuevo hilo</button>}
          </div>

          {loading ? (
            <p style={{ color:'#1a4060', textAlign:'center', marginTop:60 }}>Cargando hilos...</p>
          ) : hilos.length === 0 ? (
            <div style={{ textAlign:'center', marginTop:60 }}>
              <p style={{ color:'#1a4060', fontSize:14 }}>No hay hilos aún.</p>
              {user && <p style={{ color:'#3a6688', fontSize:13, marginTop:8 }}>¡Sé el primero en crear uno! 🌊</p>}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {hilos.map(h => {
                const ch = canales.find(c => c.id === h.canal)
                return (
                  <div key={h.id} style={{ padding:'16px 18px', borderRadius:14, border:'1px solid #0d204066', background:'transparent', transition:'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0a162866')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display:'flex', gap:12 }}>
                      {/* Votos */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
                        <button onClick={() => votar(h)} style={{ background:'transparent', border:'1px solid #0d2040', color:'#3a6688', width:30, height:30, borderRadius:8, cursor:'pointer', fontSize:12 }}>▲</button>
                        <span style={{ fontSize:13, fontWeight:800, color:'#c8e0f4' }}>{fmt(h.votos)}</span>
                      </div>
                      {/* Contenido */}
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                          {ch && <span style={{ fontSize:10, fontWeight:800, color:ch.color, background:ch.color+'15', border:`1px solid ${ch.color}33`, padding:'2px 10px', borderRadius:20 }}>{ch.emoji} {ch.nombre.toUpperCase()}</span>}
                          <span style={{ color:'#3a6688', fontSize:11 }}>@{h.Usuarios?.username}</span>
                          <span style={{ color:'#1a4060', fontSize:11 }}>· {new Date(h.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                        <h3 style={{ color:'#e8f4ff', fontSize:14, fontWeight:700, marginBottom:6 }}>{h.titulo}</h3>
                        {h.contenido && <p style={{ color:'#3a6688', fontSize:13, lineHeight:1.6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{h.contenido}</p>}
                        <div style={{ marginTop:8 }}>
                          <span style={{ color:'#1a4060', fontSize:12 }}>💬 {h.comments_count} comentarios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo hilo */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={() => setShowModal(false)} style={{ position:'absolute', inset:0, background:'#000000bb', backdropFilter:'blur(8px)' }}/>
          <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:520, background:'#0a1628', border:'1px solid #0d2040', borderRadius:20, padding:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:'#e8f4ff', fontWeight:800 }}>Nuevo hilo</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#3a6688', fontSize:22, cursor:'pointer' }}>×</button>
            </div>
            {/* Canal selector */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              {canales.map(ch => (
                <button key={ch.id} onClick={() => setCanalNuevo(ch.id)} style={{
                  padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                  background: canalNuevo===ch.id?ch.color+'22':'transparent',
                  border:`1px solid ${canalNuevo===ch.id?ch.color+'55':'#0d2040'}`,
                  color: canalNuevo===ch.id?ch.color:'#3a6688'
                }}>{ch.emoji} {ch.nombre}</button>
              ))}
            </div>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del hilo"
              style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'10px 14px', color:'#c8e0f4', fontSize:14, marginBottom:10, outline:'none' }}
            />
            <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="¿De qué quieres hablar?" rows={4}
              style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'10px 14px', color:'#c8e0f4', fontSize:13, resize:'none', outline:'none', fontFamily:'sans-serif', marginBottom:16 }}
            />
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'1px solid #0d2040', color:'#3a6688', padding:'9px 20px', borderRadius:24, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={publicarHilo} style={{ background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55', color:'#00cfff', padding:'9px 24px', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer' }}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
