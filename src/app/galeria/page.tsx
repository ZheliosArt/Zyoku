"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Galeria() {
  const [obras, setObras]         = useState<any[]>([])
  const [user, setUser]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo]       = useState("")
  const [descripcion, setDesc]    = useState("")
  const [tipo, setTipo]           = useState("Fanart")
  const [archivo, setArchivo]     = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [subiendo, setSubiendo]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    cargarObras()
  }, [])

  const cargarObras = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('obras')
      .select(`*, Usuarios(username, avatar_url)`)
      .order('created_at', { ascending: false })
    setObras(data || [])
    setLoading(false)
  }

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
  }

  const publicar = async () => {
    if (!archivo || !titulo || !user) return
    setSubiendo(true)

    const ext = archivo.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('Obras')
      .upload(path, archivo)

    if (uploadError) { setSubiendo(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('Obras')
      .getPublicUrl(path)

    await supabase.from('obras').insert({
      usuario_id: user.id,
      titulo,
      descripcion,
      imagen_url: publicUrl,
      tipo,
    })

    setSubiendo(false)
    setShowModal(false)
    setTitulo(""); setDesc(""); setArchivo(null); setPreview(null)
    cargarObras()
  }

  const darLike = async (obra: any) => {
    if (!user) return
    await supabase.from('obras').update({ likes_count: obra.likes_count + 1 }).eq('id', obra.id)
    setObras(prev => prev.map(o => o.id === obra.id ? { ...o, likes_count: o.likes_count + 1 } : o))
  }

  const tipos = ["Fanart", "Original", "Manga", "Personaje", "Paisaje", "Fantasía", "Sci-Fi"]

  return (
    <div style={{ fontFamily:'sans-serif', background:'#050d1a', minHeight:'100vh', color:'#c8e0f4' }}>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#00cfff22}`}</style>



      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 3%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff', marginBottom:4 }}>Galería</h1>
            <p style={{ color:'#1a4060', fontSize:13 }}>{obras.length} obras publicadas</p>
          </div>
          {user && (
            <button onClick={() => setShowModal(true)} style={{
              background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55',
              color:'#00cfff', padding:'10px 24px', borderRadius:30, fontSize:13, fontWeight:700, cursor:'pointer'
            }}>+ Subir obra</button>
          )}
        </div>

        {loading ? (
          <p style={{ color:'#1a4060', textAlign:'center', marginTop:80 }}>Cargando obras...</p>
        ) : obras.length === 0 ? (
          <div style={{ textAlign:'center', marginTop:80 }}>
            <p style={{ color:'#1a4060', fontSize:32, marginBottom:16 }}>🎨</p>
            <p style={{ color:'#1a4060', fontSize:14 }}>No hay obras aún.</p>
            {user && <p style={{ color:'#3a6688', fontSize:13, marginTop:8 }}>¡Sé el primero en publicar! 🌊</p>}
          </div>
        ) : (
          <div style={{ columns:'3 280px', gap:16 }}>
            {obras.map(obra => (
              <div key={obra.id} style={{ breakInside:'avoid', marginBottom:16, borderRadius:14, overflow:'hidden', border:'1px solid #0d2040', background:'#0a1628', position:'relative' }}
                onMouseEnter={e => e.currentTarget.querySelector('.overlay')?.setAttribute('style','opacity:1')}
                onMouseLeave={e => e.currentTarget.querySelector('.overlay')?.setAttribute('style','opacity:0')}
              >
                <img src={obra.imagen_url} style={{ width:'100%', display:'block' }} />
                <div className="overlay" style={{ position:'absolute', inset:0, background:'linear-gradient(to top, #050d1acc, transparent)', opacity:0, transition:'opacity 0.3s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:14 }}>
                  <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:14, marginBottom:4 }}>{obra.titulo}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#3a6688', fontSize:12 }}>@{obra.Usuarios?.username}</span>
                    <button onClick={() => darLike(obra)} style={{ background:'none', border:'none', color:'#ff6b9d', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      ♥ {obra.likes_count}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal subir obra */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={() => setShowModal(false)} style={{ position:'absolute', inset:0, background:'#000000bb', backdropFilter:'blur(8px)' }}/>
          <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:500, background:'#0a1628', border:'1px solid #0d2040', borderRadius:20, padding:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:'#e8f4ff', fontWeight:800 }}>Subir obra</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#3a6688', fontSize:22, cursor:'pointer' }}>×</button>
            </div>

            {/* Drop zone */}
            <label style={{ display:'block', border:'2px dashed #0d2040', borderRadius:12, padding:24, textAlign:'center', cursor:'pointer', marginBottom:14, background: preview?'transparent':'#07111f' }}>
              {preview
                ? <img src={preview} style={{ maxHeight:200, maxWidth:'100%', borderRadius:8, margin:'0 auto', display:'block' }} />
                : <div><p style={{ color:'#1a4060', fontSize:14 }}>🖼 Haz clic para seleccionar imagen</p><p style={{ color:'#0d2040', fontSize:11, marginTop:4 }}>JPG, PNG, WEBP</p></div>
              }
              <input type="file" accept="image/*" onChange={onArchivo} style={{ display:'none' }} />
            </label>

            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la obra"
              style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'10px 14px', color:'#c8e0f4', fontSize:14, marginBottom:10, outline:'none' }}
            />
            <textarea value={descripcion} onChange={e => setDesc(e.target.value)} placeholder="Descripción (opcional)" rows={3}
              style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'10px 14px', color:'#c8e0f4', fontSize:13, resize:'none', outline:'none', fontFamily:'sans-serif', marginBottom:12 }}
            />

            {/* Tipo */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
              {tipos.map(t => (
                <button key={t} onClick={() => setTipo(t)} style={{
                  padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                  background: tipo===t?'#00cfff22':'transparent',
                  border:`1px solid ${tipo===t?'#00cfff55':'#0d2040'}`,
                  color: tipo===t?'#00cfff':'#3a6688'
                }}>{t}</button>
              ))}
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'1px solid #0d2040', color:'#3a6688', padding:'9px 20px', borderRadius:24, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={publicar} disabled={subiendo} style={{ background:'linear-gradient(135deg,#006688,#00cfff33)', border:'1px solid #00cfff55', color:'#00cfff', padding:'9px 24px', borderRadius:24, fontSize:13, fontWeight:700, cursor:'pointer', opacity: subiendo?0.6:1 }}>
                {subiendo ? 'Subiendo...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
