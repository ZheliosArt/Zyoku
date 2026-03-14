
//Ruta: src/app/page.tsx
"use client"
import { useHomeLogic } from './hooks/useHomeLogic'
export default function Home() {
  const { user, stats, obras, hilos, loading, loginWithGoogle } = useHomeLogic()
  const canales: Record<string, string> = {
    general:'🌊', debate:'⚡', ayuda:'💡', noticias:'📡', showcase:'🎨', 'off-topic':'☕'
  }
  return (
    <main style={{ background:'#050d1a', minHeight:'100vh', color:'#c8e0f4', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .hero-orb { position:absolute; border-radius:50%; pointer-events:none; }
      `}</style>
      {/* HERO SECTION */}
      <section style={{ minHeight:'90vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 5%', position:'relative', overflow:'hidden' }}>
        <div className="hero-orb" style={{ width:500, height:500, background:'radial-gradient(circle,#00cfff08,transparent)', top:'10%', left:'20%' }}/>
        <div className="hero-orb" style={{ width:400, height:400, background:'radial-gradient(circle,#a78bfa08,transparent)', bottom:'10%', right:'20%' }}/>
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
              <button onClick={loginWithGoogle} style={{ background:'linear-gradient(135deg,#006688,#00cfff44)', border:'1px solid #00cfff55', color:'#00cfff', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 0 30px #00cfff15' }}>
                Únete gratis 🌊
              </button>
            ) : (
              <button onClick={() => window.location.href='/perfil'} style={{ background:'linear-gradient(135deg,#006688,#00cfff44)', border:'1px solid #00cfff55', color:'#00cfff', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:700, cursor:'pointer' }}>
                Mi Perfil 🎨
              </button>
            )}
            <button onClick={() => window.location.href='/comunidad'} style={{ background:'transparent', border:'1px solid #0d2040', color:'#3a6688', padding:'14px 36px', borderRadius:40, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              Explorar comunidad
            </button>
          </div>
        </div>
        {/* Stats Grid */}
        <div style={{ display:'flex', gap:48, marginTop:64, flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { n: stats.obras, label:'Obras' },
            { n: stats.usuarios, label:'Artistas' },
            { n: stats.hilos, label:'Hilos' },
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
              <div key={obra.id} style={{ borderRadius:14, overflow:'hidden', border:'1px solid #0d2040', background:'#0a1628', cursor:'pointer' }} onClick={() => window.location.href='/galeria'}>
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
      {/* COMUNIDAD */}
      {hilos.length > 0 && (
        <section style={{ padding:'0 5% 64px', maxWidth:1200, margin:'0 auto' }}>
          <h2 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff', marginBottom:32 }}>Comunidad activa</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {hilos.map(h => (
              <div key={h.id} style={{ padding:'16px 20px', borderRadius:14, border:'1px solid #0d2040', background:'#0a1628', cursor:'pointer', display:'flex', gap:14, alignItems:'center' }} onClick={() => window.location.href='/comunidad'}>
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
    </main>
  )
}
