"use client"
import { useState } from 'react'
import FollowButton from './FollowButton'

export default function ZoomModal({ 
obra, 
onClose, 
onNext, 
onPrev, 
onLike, 
isLiked, 
colecciones, 
savedCollections = [], // NUEVA PROP
onSave,
onCreateCollection,
currentUserId 
}: any) {
const [showMenu, setShowMenu] = useState(false)
const [isCreating, setIsCreating] = useState(false)
const [newColName, setNewColName] = useState("")

if (!obra) return null

// Extraemos el ID del autor de la obra
const targetUserId = obra.usuario_id || obra.Usuarios?.id

return (
<div style={{ 
position:'fixed', inset:0, zIndex:2000, display:'flex', alignItems:'center', 
justifyContent:'center', background:'rgba(5,13,26,0.98)', backdropFilter:'blur(15px)' 
}} onClick={onClose}>

{/* Botón Cerrar (X) - Esquina superior */}
<button onClick={onClose} style={{ 
position:'absolute', top:30, right:30, background:'rgba(255,255,255,0.05)', 
border:'1px solid rgba(255,255,255,0.1)', color:'#fff', width:40, height:40, 
borderRadius:'50%', fontSize:20, cursor:'pointer', zIndex:2100, transition:'0.2s'
}} onMouseEnter={e => e.currentTarget.style.background='rgba(255,107,157,0.2)'}
onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
>×</button>

{/* Navegación Lateral */}
<button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position:'absolute', left:30, background:'none', border:'none', color:'#3a6688', fontSize:60, cursor:'pointer', opacity:0.5 }}>‹</button>
<button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position:'absolute', right:30, background:'none', border:'none', color:'#3a6688', fontSize:60, cursor:'pointer', opacity:0.5 }}>›</button>

{/* Contenedor Principal */}
<div style={{ display:'flex', flexDirection:'column', alignItems:'center', maxWidth:'85vw', gap: 15 }} onClick={e => e.stopPropagation()}>
<img 
src={obra.imagen_url} 
style={{ maxHeight:'70vh', maxWidth:'100%', borderRadius:16, boxShadow:'0 25px 50px rgba(0,0,0,0.6)', border: '1px solid #0d2040' }} 
/>

{/* Barra de Info */}
<div className="card scale-in" style={{ 
padding:'20px 28px', background:'#0a1628f2', borderRadius:20, 
border:'1px solid #0d2040', width:420, textAlign:'center',
boxShadow: '0 10px 40px rgba(0,0,0,0.6)', position: 'relative'
}}>
{!showMenu ? (
<>
<h3 style={{ color:'#e8f4ff', margin:0, fontSize:18, fontWeight:800 }}>{obra.titulo}</h3>
<p style={{ color:'#00cfff', fontSize:13, marginTop:4 }}>@{obra.Usuarios?.username}</p>

<div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, marginTop:20 }}>
<button onClick={() => onLike(obra)} style={{ 
background: isLiked ? '#ff6b9d15' : '#0d2040', 
border: `1px solid ${isLiked ? '#ff6b9d' : '#1e2f4d'}`, 
color: isLiked ? '#ff6b9d' : '#c8e0f4', 
padding:'10px 18px', borderRadius:25, cursor:'pointer', display:'flex', alignItems:'center', gap:8
}}>
{isLiked ? '♥' : '♡'} {obra.likes_count}
</button>

<button onClick={() => setShowMenu(true)} style={{ 
background:'#00cfff', color:'#050d1a', padding:'10px 24px', 
borderRadius:25, border:'none', fontWeight:700, cursor:'pointer'
}}>
📥 Guardar
</button>
</div>
</>
) : (
<div style={{ animation: 'fadeIn 0.2s' }}>
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15 }}>
<button onClick={() => setShowMenu(false)} style={{ background:'none', border:'none', color:'#3a6688', cursor:'pointer' }}>← Volver</button>
<span style={{ fontSize:14, fontWeight:700, color:'#e8f4ff' }}>Guardar en...</span>
<div style={{ width:40 }} /> 
</div>

{/* Lista de Colecciones con Scroll */}
<div style={{ 
maxHeight: 180, overflowY: 'auto', paddingRight: 5, 
display: 'flex', flexDirection: 'column', gap: 6 
}}>
{colecciones.map((col: any) => {
// VERIFICAMOS SI ESTÁ GUARDADA EN ESTA COLECCIÓN
const yaGuardada = savedCollections.includes(col.id);
const count = col.obras_guardadas?.[0]?.count || 0;

return (
<button 
key={col.id} 
disabled={yaGuardada}
// Pasamos el nombre al handleSave para el toast
onClick={() => onSave(obra.id, col.id, col.nombre)}
style={{
width: '100%', padding: '10px 14px', background: yaGuardada ? '#1e2f4d':'#0d2040', 
border: yaGuardada ? '1px solid #2a3b5a' : '1px solid #1e2f4d', borderRadius: 10, color: '#c8e0f4',
textAlign: 'left', cursor: yaGuardada ? 'default' : 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', transition: '0.2s',
opacity: yaGuardada ? 0.6 : 1
}}
>
<span>{yaGuardada ? `✓ ${col.nombre}` : col.nombre}</span>
<span style={{ opacity: 0.4 }}>{count}</span>
</button>
);
})}
</div>

<div style={{ marginTop: 15, borderTop: '1px solid #0d2040', paddingTop: 15 }}>
{!isCreating ? (
<button 
onClick={() => setIsCreating(true)}
style={{ background:'none', border:'none', color:'#00cfff', fontSize:12, fontWeight:700, cursor:'pointer' }}
>
+ Crear nueva colección
</button>
) : (
<div style={{ display: 'flex', gap: 8, animation: 'fadeIn 0.2s' }}>
<input 
autoFocus
value={newColName}
onChange={(e) => setNewColName(e.target.value)}
placeholder="Nombre de carpeta..."
style={{ 
flex: 1, background: '#050d1a', border: '1px solid #00cfff44', 
borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none' 
}}
/>
<button 
onClick={async () => {
if(!newColName.trim()) return;
await onCreateCollection(newColName);
setNewColName("");
setIsCreating(false);
}}
style={{ background: '#00cfff', color: '#050d1a', border: 'none', borderRadius: 8, padding: '0 12px', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}
>
OK
</button>
<button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: '#ff6b9d', cursor: 'pointer' }}>×</button>
</div>
)}
</div>
</div>
)}
</div>
</div>
</div>
)
}