"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useGalleryLogic() {
const [obras, setObras] = useState<any[]>([])
const [user, setUser] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [likesData, setLikesData] = useState<Record<number, boolean>>({})

const cargarObras = async () => {
const { data: { user: userData } } = await supabase.auth.getUser()
setUser(userData)

const { data: obrasData } = await supabase
.from('obras')
.select(`*, Usuarios(id, username, avatar_url)`)
.order('created_at', { ascending: false })
setObras(obrasData || [])

if (userData && obrasData) {
const { data: likes } = await supabase.from('likes').select('obra_id').eq('usuario_id', userData.id)
const likeMap: Record<number, boolean> = {}
likes?.forEach(l => likeMap[l.obra_id] = true)
setLikesData(likeMap)
}
setLoading(false)
}

useEffect(() => { cargarObras() }, [])

const darLike = async (obra: any) => {
if (!user) return
const yaLiked = likesData[obra.id]
const nuevoConteo = yaLiked ? Math.max(0, (obra.likes_count || 0) - 1) : (obra.likes_count || 0) + 1

// 1. Actualización optimista (UI rápida)
setLikesData(prev => ({ ...prev, [obra.id]: !yaLiked }))
setObras(prev => prev.map(o => o.id === obra.id ? { ...o, likes_count: nuevoConteo } : o))

// 2. Persistencia en Base de Datos
if (yaLiked) {
await supabase.from('likes').delete().eq('usuario_id', user.id).eq('obra_id', obra.id)
} else {
await supabase.from('likes').insert({ usuario_id: user.id, obra_id: obra.id })
}
await supabase.from('obras').update({ likes_count: nuevoConteo }).eq('id', obra.id)

// 3. Devolvemos la obra actualizada para sincronizar el Modal
return { ...obra, likes_count: nuevoConteo }
}

// --- ESTE ES EL BLOQUE QUE FALTABA ---
return { 
obras, 
user, 
loading, 
likesData, 
darLike, 
refrescar: cargarObras 
}
}