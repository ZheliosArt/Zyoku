"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const links = [
    { href: '/',          label: 'Inicio'     },
    { href: '/galeria',   label: 'Galería'    },
    { href: '/comunidad', label: 'Comunidad'  },
    { href: '/perfil',    label: 'Perfil'     },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5,13,26,0.96)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #0d2040',
      padding: '0 5%', height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#e8f4ff', textDecoration: 'none' }}>
        Z<span style={{ color: '#00cfff' }}>y</span>oku
      </a>

      <div style={{ display: 'flex', gap: 24 }}>
        {links.map(link => (
          <a key={link.href} href={link.href} style={{
            color: pathname === link.href ? '#00cfff' : '#3a6688',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            borderBottom: pathname === link.href ? '1px solid #00cfff44' : 'none',
            paddingBottom: 2, transition: 'color 0.2s',
          }}>{link.label}</a>
        ))}
      </div>

      <div style={{ width: 34 }}>
        {user && (
          <img src={user.user_metadata.avatar_url}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #00cfff44', cursor: 'pointer' }}
            onClick={() => window.location.href = '/perfil'}
          />
        )}
      </div>
    </nav>
  )
}
