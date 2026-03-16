//Ruta: src/components/UploadModal.tsx

"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadModal({ isOpen, onClose, user, onSuccess }: any) {
const [titulo, setTitulo] = useState("")
const [descripcion, setDesc] = useState("")
const [tipo, setTipo] = useState("Fanart")
const [archivo, setArchivo] = useState<File | null>(null)
const [preview, setPreview] = useState<string | null>(null)
const [subiendo, setSubiendo] = useState(false)

if (!isOpen) return null

const tipos = ["Fanart", "Original", "Manga", "Personaje", "Paisaje", "Fantasía", "Sci-Fi"]

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

const { error: uploadError } = await supabase.storage.from('Obras').upload(path, archivo)
if (uploadError) { setSubiendo(false); return }

const { data: { publicUrl } } = supabase.storage.from('Obras').getPublicUrl(path)

await supabase.from('obras').insert({
usuario_id: user.id,
titulo,
descripcion,
imagen_url: publicUrl,
tipo,
})

setSubiendo(false)
onSuccess()
onClose()
}

return (
<div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
<div onClick={onClose} style={{ position:'absolute', inset:0, background:'#000000bb', backdropFilter:'blur(8px)' }}/>
<div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:500, background:'#0a1628', border:'1px solid #0d2040', borderRadius:20, padding:32 }}>
<div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
<h2 style={{ color:'#e8f4ff', fontWeight:800 }}>Subir obra</h2>
<button onClick={onClose} style={{ background:'none', border:'none', color:'#3a6688', fontSize:22, cursor:'pointer' }}>×</button>
</div>

<label style={{ display:'block', border:'2px dashed #0d2040', borderRadius:12, padding:24, textAlign:'center', cursor:'pointer', marginBottom:14, background: preview?'transparent':'#07111f' }}>
{preview ? <img src={preview} style={{ maxHeight:200, maxWidth:'100%', borderRadius:8 }} /> : <p style={{ color:'#3a6688' }}>🖼 Seleccionar imagen</p>}
<input type="file" accept="image/*" onChange={onArchivo} style={{ display:'none' }} />
</label>

<input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:12, color:'#fff', marginBottom:10 }} />
<textarea value={descripcion} onChange={e => setDesc(e.target.value)} placeholder="Descripción" style={{ width:'100%', background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:12, color:'#fff', marginBottom:12, resize:'none' }} />

<div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
{tipos.map(t => (
<button key={t} onClick={() => setTipo(t)} style={{ padding:'5px 12px', borderRadius:20, fontSize:11, background: tipo===t?'#00cfff22':'transparent', border:`1px solid ${tipo===t?'#00cfff':'#0d2040'}`, color: tipo===t?'#00cfff':'#3a6688', cursor:'pointer' }}>{t}</button>
))}
</div>

<button onClick={publicar} disabled={subiendo} style={{ width:'100%', background:'#00cfff', color:'#050d1a', padding:12, borderRadius:25, fontWeight:700, cursor:'pointer', border:'none' }}>
{subiendo ? 'Subiendo...' : 'Publicar Obra'}
</button>
</div>
</div>
)
}