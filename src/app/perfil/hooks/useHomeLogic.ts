"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useHomeLogic() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ obras: 0, usuarios: 0, hilos: 0 })
  const [obras, setObras] = useState<any[]>([])
  const [hilos, setHilos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Manejo de Sesión
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))

    const cargar = async () => {
      try {
        const [{ count: oC }, { count: uC }, { count: hC }] = await Promise.all([
          supabase.from('obras').select('*', { count: 'exact', head: true }),
          supabase.from('Usuarios').select('*', { count: 'exact', head: true }),
          supabase.from('hilos').select('*', { count: 'exact', head: true }),
        ])
        setStats({ obras: oC || 0, usuarios: uC || 0, hilos: hC || 0 })

        // Traer obras populares
        const { data: oData } = await supabase
          .from('obras').select('*, Usuarios(username)')
          .order('likes_count', { ascending: false }).limit(4)
        setObras(oData || [])

        // Traer hilos recientes
        const { data: hData } = await supabase
          .from('hilos').select('*, Usuarios(username)')
          .order('created_at', { ascending: false }).limit(3)
        setHilos(hData || [])
      } finally {
        setLoading(false)
      }
    }
    
    cargar()
    return () => subscription.unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    })
  }

  return { user, stats, obras, hilos, loading, loginWithGoogle }
}