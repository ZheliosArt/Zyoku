"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#050d1a', gap: 20
    }}>
      <h1 style={{ fontFamily: 'sans-serif', color: '#00cfff', fontSize: 48 }}>Zyoku</h1>

      {user ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <img src={user.user_metadata.avatar_url} style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #00cfff' }} />
          <p style={{ color: '#c8e0f4', fontFamily: 'sans-serif' }}>¡Hola, {user.user_metadata.full_name}! 👋</p>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid #ff6b9d55',
            color: '#ff6b9d', padding: '10px 28px', borderRadius: 30, fontSize: 14, cursor: 'pointer'
          }}>Cerrar sesión</button>
        </div>
      ) : (
        <button onClick={handleLogin} style={{
          background: 'linear-gradient(135deg, #006688, #00cfff33)',
          border: '1px solid #00cfff55', color: '#00cfff',
          padding: '12px 32px', borderRadius: 30, fontSize: 16, cursor: 'pointer'
        }}>Iniciar sesión con Google</button>
      )}
    </main>
  )
}