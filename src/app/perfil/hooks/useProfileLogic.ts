import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Usuario, Obra, Stats, ToastItem, Tab } from '../utils/types'

export function useProfileLogic() {
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  const [obrasLikeadas, setObrasLikeadas] = useState<Obra[]>([])
  const [colecciones, setColecciones] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({ obras: 0, likes: 0, seguidores: 0, siguiendo: 0 })
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // UI States
  const [tab, setTab] = useState<Tab>('obras')
  const [obraZoom, setObraZoom] = useState<Obra | null>(null)
  const [colSeleccionada, setColSeleccionada] = useState<any | null>(null)
  const [obrasDeColeccion, setObrasDeColeccion] = useState<Obra[]>([])
  const [modoGestion, setModoGestion] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState<any[]>([])
  const [editando, setEditando] = useState(false)
  const [showModalCol, setShowModalCol] = useState(false)
  const [nombreNuevaCol, setNombreNuevaCol] = useState('')
  const [creandoCol, setCreandoCol] = useState(false)

  const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
    const id = Date.now(); setToasts(prev => [...prev, { id, msg, tipo }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  const cargarDatos = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { window.location.href = '/'; return }
    setUser(u)

    const [pRes, oRes, lRes, cRes, segRes, sigRes] = await Promise.all([
      supabase.from('Usuarios').select('*').eq('id', u.id).single(),
      supabase.from('obras').select('*').eq('usuario_id', u.id).order('created_at', { ascending: false }),
      supabase.from('likes').select('obras(*, Usuarios(username))').eq('usuario_id', u.id),
      supabase.from('colecciones').select('*, obras_guardadas(count)').eq('usuario_id', u.id),
      supabase.from('seguidores').select('*', { count: 'exact', head: true }).eq('seguido_id', u.id),
      supabase.from('seguidores').select('*', { count: 'exact', head: true }).eq('seguidor_id', u.id)
    ])

    if (pRes.data) setPerfil(pRes.data)
    setObras(oRes.data || [])
    setObrasLikeadas(lRes.data?.map((l: any) => l.obras).filter(Boolean) || [])
    setColecciones(cRes.data || [])
    
    const totalLikes = (oRes.data || []).reduce((s, o) => s + (o.likes_count || 0), 0)
    setStats({ 
      obras: oRes.data?.length || 0, 
      likes: totalLikes, 
      seguidores: segRes.count || 0, 
      siguiendo: sigRes.count || 0 
    })
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [])

  // ── Acciones empaquetadas ──
  const actions = {
    cerrarSesion: async () => { await supabase.auth.signOut(); window.location.href = '/' },
    
    guardarPerfil: async (data: any) => {
      const { error } = await supabase.from('Usuarios').update(data).eq('id', user.id)
      if (!error) { setPerfil(prev => ({ ...prev, ...data })); toast('✓ Guardado') }
      else toast('Error', 'err')
    },

    subirAvatar: async (file: File) => {
      const path = `${user.id}.${file.name.split('.').pop()}`
      await supabase.storage.from('Avatars').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(path)
      const url = `${publicUrl}?v=${Date.now()}`
      await supabase.from('Usuarios').update({ avatar_url: url }).eq('id', user.id)
      setPerfil(prev => prev ? { ...prev, avatar_url: url } : prev)
      toast('Avatar actualizado')
    },

    abrirColeccion: async (col: any) => {
      const { data } = await supabase.from('obras_guardadas').select('obras(*)').eq('coleccion_id', col.id)
      setObrasDeColeccion(data?.map((d: any) => d.obras).filter(Boolean) || [])
      setColSeleccionada(col)
    },

    crearColeccion: async () => {
      if (!nombreNuevaCol.trim()) return
      setCreandoCol(true)
      const { data, error } = await supabase.from('colecciones').insert([{ nombre: nombreNuevaCol, usuario_id: user.id }]).select().single()
      if (!error) {
        setColecciones(prev => [...prev, { ...data, obras_guardadas: [{ count: 0 }] }])
        toast('✓ Creada')
        setShowModalCol(false); setNombreNuevaCol('')
      }
      setCreandoCol(false)
    },

    eliminarColeccion: async (col: any, e: React.MouseEvent) => {
      e.stopPropagation()
      if (confirm(`¿Eliminar "${col.nombre}"?`)) {
        const { error } = await supabase.from('colecciones').delete().eq('id', col.id)
        if (!error) setColecciones(p => p.filter(c => c.id !== col.id))
      }
    },

    guardarEnColeccion: async (obraId: any, colId: string) => {
      const { error } = await supabase.from('obras_guardadas').insert([{ usuario_id: user.id, obra_id: obraId, coleccion_id: colId }])
      if (!error) toast('✨ Guardado')
      else toast('Ya está guardada', 'err')
    },

    eliminarObra: async (obra: Obra, e: React.MouseEvent) => {
      e.stopPropagation()
      if (confirm('¿Eliminar obra?')) {
        await supabase.from('obras').delete().eq('id', obra.id)
        setObras(p => p.filter(o => o.id !== obra.id))
        if (obraZoom?.id === obra.id) setObraZoom(null)
      }
    },

    toggleGestion: () => { setModoGestion(!modoGestion); setSeleccionadas([]) },

    toggleSeleccion: (id: any) => {
      setSeleccionadas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    },

    navigate: (direction: number) => {
      const lista = tab === 'obras' ? obras : tab === 'likes' ? obrasLikeadas : obrasDeColeccion
      const idx = lista.findIndex(o => o.id === obraZoom?.id)
      const nextIdx = (idx + direction + lista.length) % lista.length
      setObraZoom(lista[nextIdx])
    }
  }

  return {
    user, perfil, obras, obrasLikeadas, colecciones, stats, loading, toasts,
    tab, setTab, obraZoom, setObraZoom, colSeleccionada, setColSeleccionada,
    obrasDeColeccion, modoGestion, seleccionadas, editando, setEditando,
    showModalCol, setShowModalCol, nombreNuevaCol, setNombreNuevaCol, creandoCol,
    actions
  }
}