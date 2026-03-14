import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Usuario, Obra, Stats, ToastItem } from '../utils/types'

export function useProfileLogic() {
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  const [obrasLikeadas, setObrasLikeadas] = useState<Obra[]>([])
  const [colecciones, setColecciones] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({ obras: 0, likes: 0, seguidores: 0, siguiendo: 0 })
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
    const id = Date.now(); setToasts(p => [...p, { id, msg, tipo }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }, [])

  const cargarDatos = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { window.location.href = '/'; return }
    setUser(u)

    const [pRes, oRes, lRes, cRes] = await Promise.all([
      supabase.from('Usuarios').select('*').eq('id', u.id).single(),
      supabase.from('obras').select('*').eq('usuario_id', u.id).order('created_at', { ascending: false }),
      supabase.from('likes').select('obras(*, Usuarios(username))').eq('usuario_id', u.id),
      supabase.from('colecciones').select('*, obras_guardadas(count)').eq('usuario_id', u.id)
    ])

    if (pRes.data) setPerfil(pRes.data)
    setObras(oRes.data || [])
    setObrasLikeadas(lRes.data?.map((l: any) => l.obras).filter(Boolean) || [])
    setColecciones(cRes.data || [])
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [])

  return { user, perfil, obras, obrasLikeadas, colecciones, stats, loading, toasts, toast, setPerfil, setObras, setColecciones, setStats }
}