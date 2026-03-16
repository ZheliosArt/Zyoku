//Ruta: src/app/galeria/components/GalleryCard.tsx
"use client"
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'

export default function GalleryCard({ obra, isLiked, onLike, onClick, currentUserId }: any) {
// LOG para depurar: Descomenta si sigue fallando para ver qué llega
// console.log("Datos de la obra:", obra);

return (
<div 
className="gallery-card"
style={{ 
breakInside:'avoid', marginBottom:16, borderRadius:14, overflow:'hidden', 
border:'1px solid #0d2040', background:'#0a1628', position:'relative', cursor:'zoom-in' 
}}
onClick={onClick}
>
<img src={obra.imagen_url} style={{ width:'100%', display:'block' }} alt={obra.titulo} />

{/* Overlay - Aseguramos que la clase CSS 'overlay' esté en tu global.css o la definimos aquí */}
<div className="overlay" style={{ 
position:'absolute', inset:0, background:'linear-gradient(to top, rgba(5,13,26,0.9), transparent)', 
opacity:0, transition:'opacity 0.3s', display:'flex', flexDirection:'column', 
justifyContent:'flex-end', padding:14 
}}>
<p style={{ color:'#e8f4ff', fontWeight:700, fontSize:14, marginBottom:4 }}>{obra.titulo}</p>

<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 8 }}>
{/* Nombre del artista con link */}
<Link 
href={`/perfil/${obra.usuario_id}`} 
onClick={(e) => e.stopPropagation()}
style={{ color:'#00cfff', fontSize:12, textDecoration:'none', fontWeight:600 }}
>
@{obra.Usuarios?.username || 'artista'}
</Link>

<div style={{ display:'flex', alignItems:'center', gap:10 }} onClick={e => e.stopPropagation()}>
{/* Botón Seguir (Solo si no es mi obra) */}
{currentUserId !== obra.usuario_id && (
<FollowButton currentUserId={currentUserId} targetUserId={obra.usuario_id} />
)}

<button onClick={() => onLike(obra)} style={{
background:'none', border:'none', color: isLiked ? '#ff6b9d' : '#c8e0f4',
fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4
}}>
{isLiked ? '♥' : '♡'} {obra.likes_count}
</button>
</div>
</div>
</div>
</div>
)
}