"use client"
import type { Obra, Tab } from '../utils/types'

interface WorksGridProps {
obras: Obra[]
tab: Tab
onObraClick: (obra: Obra) => void
onDeleteObra: (obra: Obra, e: React.MouseEvent) => void
}

export default function WorksGrid({ obras, tab, onObraClick, onDeleteObra }: WorksGridProps) {
return (
<div style={{ 
display: 'grid', 
gridTemplateColumns: 'repeat(3, 1fr)', // 3 columnas fijas
gap: '4px', // Espaciado pequeño estilo IG
maxWidth: '935px', 
margin: '0 auto' 
}}>
{obras.map((obra: Obra) => (
<div
key={obra.id}
className="obra-container"
style={{
position: 'relative',
aspectRatio: '1/1', // Cuadrado perfecto
overflow: 'hidden',
cursor: 'pointer',
backgroundColor: '#0a1628'
}}
onClick={() => onObraClick(obra)}
>
<img 
src={obra.imagen_url} 
style={{ 
width: '100%', 
height: '100%', 
objectFit: 'cover' // Recorta la imagen para llenar el cuadrado
}} 
alt={obra.titulo} 
/>

{/* Overlay que aparece al pasar el mouse (hover) */}
<div className="obra-overlay" style={{
position: 'absolute',
inset: 0,
background: 'rgba(0, 0, 0, 0.4)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
opacity: 0,
transition: 'opacity 0.2s ease',
gap: '15px'
}}>
<span style={{ color: '#fff', fontWeight: 'bold' }}>❤️ {obra.likes_count || 0}</span>
{tab === 'obras' && (
<button 
style={{
position: 'absolute',
top: '5px',
right: '5px',
background: '#ff4d4d',
border: 'none',
color: 'white',
borderRadius: '4px',
padding: '2px 8px',
fontSize: '10px',
cursor: 'pointer'
}}
onClick={e => onDeleteObra(obra, e)}
>
Eliminar
</button>
)}
</div>
</div>
))}
<style jsx>{`
.obra-container:hover .obra-overlay {
opacity: 1 !important;
}
`}</style>
</div>
)
}