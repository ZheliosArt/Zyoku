"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Perfil() {
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      setPerfil(data)
      setLoading(false)
    }
    cargarPerfil()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#050d1a' }}>
      <p style={{ color:'#00cfff', fontFamily:'sans-serif' }}>Cargando...</p>
    </div>
  )

  if (!perfil) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#050d1a' }}>
      <p style={{ color:'#ff6b9d', fontFamily:'sans-serif' }}>No hay sesión activa</p>
    </div>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#050d1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        background:'#0a1628', border:'1px solid #0d2040', borderRadius:20,
        padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:16,
        maxWidth:400, width:'100%'
      }}>
        <img src={perfil.avatar_url} style={{ width:80, height:80, borderRadius:'50%', border:'2px solid #00cfff' }} />
        <h1 style={{ fontFamily:'sans-serif', color:'#e8f4ff', fontSize:24, fontWeight:800 }}>{perfil.username}</h1>
        <p style={{ color:'#3a6688', fontSize:14 }}>{perfil.email}</p>
        <span style={{
          background:'#00cfff15', border:'1px solid #00cfff33',
          color:'#00cfff', padding:'4px 16px', borderRadius:20, fontSize:12, fontWeight:700
        }}>{perfil.tipo === 'fan' ? '🌊 Explorador' : '🎨 Artista'}</span>

        {perfil.bio && <p style={{ color:'#4a7a9a', fontSize:13, textAlign:'center' }}>{perfil.bio}</p>}

        <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
          style={{ background:'none', border:'1px solid #ff6b9d44', color:'#ff6b9d', padding:'8px 24px', borderRadius:20, fontSize:13, cursor:'pointer', marginTop:8 }}>
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
