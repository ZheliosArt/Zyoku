"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser]   = useState<any>(null)
  const [stats, setStats] = useState({ obras: 0, usuarios: 0, hilos: 0 })
  const [obras, setObras] = useState<any[]>([])
  const [hilos, setHilos] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))

    const cargar = async () => {
      const [{ count: obras }, { count: usuarios }, { count: hilos }] = await Promise.all([
        supabase.from('obras').select('*', { count:'exact', head:true }),
        supabase.from('Usuarios').select('*', { count:'exact', head:true }),
        supabase.from('hilos').select('*', { count:'exact', head:true }),
      ])
      setStats({ obras: obras||0, usuarios: usuarios||0, hilos: hilos||0 })

      const { data: obrasData } = await supabase
        .from('obras').select('*, Usuarios(username)')
        .order('likes_count', { ascending: false }).limit(4)
      setObras(obrasData || [])

      const { data: hilosData } = await supabase
        .from('hilos').select('*, Usuarios(username)')
        .order('created_at', { ascending: false }).limit(3)
      setHilos(hilosData || [])
    }
    cargar()
    return () => subscription.unsubscribe()
  }, [])

  const canales: Record<string, string> = {
    general:'🌊', debate:'⚡', ayuda:'💡', noticias:'📡', showcase:'🎨', 'off-topic':'☕'
  }

  return (
    <main style={{ background:'#050d1a', minHeight:'100vh', color:'#c8e0f4', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* HERO */}
      <section style={{ minHeight:'90vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 5%', position:'relative', overflow:'hidden' }}>
        {/* Orbs */}
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,#00cfff08,transparent)', top:'10%', left:'20%', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,#a78bfa08,transparent)', bottom:'10%', right:'20%', pointerEvents:'none' }}/>

        <div className="fade-up">
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:3, color:'#00cfff', marginBottom:16, opacity:0.7 }}>BIENVENIDO A</div>
          <h1 style={{ fontSize:'clamp(56px,10vw,96px)', fontWeight:800, color:'#e8f4ff', lineHeight:1, marginBottom:16, letterSpacing:-3 }}>
            Z<span style={{ color:'#00cfff' }}>y</span>oku
          </h1>
          <p style={{ fontSize:'clamp(16px,2vw,22px)', color:'#3a6688', maxWidth:560, margin:'0 auto 40px', lineHeight:1.6 }}>
            La comunidad de arte anime y manga donde los artistas brillan y los fans descubren.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            {!user ? (
              <button onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }})
              }} style={{ background:'linear-gradient(135deg,#006688,#00cfff44)', border:'1px solid #00cfff55', color:'#00cfff', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 0 30px #00cfff15' }}>
                Únete gratis 🌊
              </button>
            ) : (
              <button onClick={() => window.location.href='/galeria'} style={{ background:'linear-gradient(135deg,#006688,#00cfff44)', border:'1px solid #00cfff55', color:'#00cfff', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:700, cursor:'pointer' }}>
                Ver galería 🎨
              </button>
            )}
            <button onClick={() => window.location.href='/comunidad'} style={{ background:'transparent', border:'1px solid #0d2040', color:'#3a6688', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              Explorar comunidad
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:48, marginTop:64, flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { n: stats.obras,    label:'Obras publicadas' },
            { n: stats.usuarios, label:'Artistas y fans'  },
            { n: stats.hilos,    label:'Hilos activos'    },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:36, fontWeight:800, color:'#00cfff' }}>{s.n}</div>
              <div style={{ fontSize:12, color:'#1a4060', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OBRAS DESTACADAS */}
      {obras.length > 0 && (
        <section style={{ padding:'64px 5%', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff' }}>Obras destacadas</h2>
            <a href="/galeria" style={{ color:'#00cfff', fontSize:13, textDecoration:'none' }}>Ver todas →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {obras.map(obra => (
              <div key={obra.id} style={{ borderRadius:14, overflow:'hidden', border:'1px solid #0d2040', background:'#0a1628', cursor:'pointer' }}
                onClick={() => window.location.href='/galeria'}>
                <img src={obra.imagen_url} style={{ width:'100%', height:180, objectFit:'cover', display:'block' }}/>
                <div style={{ padding:'12px 14px' }}>
                  <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:14, marginBottom:4 }}>{obra.titulo}</p>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'#3a6688', fontSize:12 }}>@{obra.Usuarios?.username}</span>
                    <span style={{ color:'#ff6b9d', fontSize:12 }}>♥ {obra.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HILOS RECIENTES */}
      {hilos.length > 0 && (
        <section style={{ padding:'0 5% 64px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff' }}>Comunidad activa</h2>
            <a href="/comunidad" style={{ color:'#00cfff', fontSize:13, textDecoration:'none' }}>Ver todo →</a>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {hilos.map(h => (
              <div key={h.id} style={{ padding:'16px 20px', borderRadius:14, border:'1px solid #0d2040', background:'#0a1628', cursor:'pointer', display:'flex', gap:14, alignItems:'center' }}
                onClick={() => window.location.href='/comunidad'}>
                <span style={{ fontSize:22 }}>{canales[h.canal] || '💬'}</span>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:14, marginBottom:2 }}>{h.titulo}</p>
                  <span style={{ color:'#3a6688', fontSize:12 }}>@{h.Usuarios?.username}</span>
                </div>
                <span style={{ color:'#1a4060', fontSize:12 }}>▲ {h.votos}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section style={{ textAlign:'center', padding:'64px 5%', borderTop:'1px solid #0d2040' }}>
        <h2 style={{ fontSize:32, fontWeight:800, color:'#e8f4ff', marginBottom:12 }}>¿Listo para unirte? 🌊</h2>
        <p style={{ color:'#3a6688', fontSize:15, marginBottom:32 }}>Es gratis. Siempre.</p>
        {!user && (
          <button onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }})
          }} style={{ background:'linear-gradient(135deg,#006688,#00cfff44)', border:'1px solid #00cfff55', color:'#00cfff', padding:'14px 40px', borderRadius:40, fontSize:15, fontWeight:700, cursor:'pointer' }}>
            Crear cuenta con Google
          </button>
        )}
      </section>
    </main>
  )
}
