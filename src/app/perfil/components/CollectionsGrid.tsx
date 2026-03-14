"use client"

interface Coleccion {
id: string;
nombre: string;
portada_url?: string;
obras_guardadas: { count: number }[];
}

interface CollectionsGridProps {
colecciones: Coleccion[];
onSelect: (col: Coleccion) => void;
onCreateClick: () => void;
onDeleteClick: (col: Coleccion, e: React.MouseEvent) => void; // <-- Nueva prop
}

export default function CollectionsGrid({ colecciones, onSelect, onCreateClick, onDeleteClick }: CollectionsGridProps) {
return (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
{colecciones.map(col => (
<div 
key={col.id} 
onClick={() => onSelect(col)}
style={{ position: 'relative', cursor: 'pointer', borderRadius: 12, overflow: 'hidden', background: '#0a1628', border: '1px solid #0d2040' }}
>
{/* Botón de eliminar carpeta */}
<button 
onClick={(e) => onDeleteClick(col, e)}
style={{ 
position: 'absolute', top: 8, right: 8, background: 'rgba(255, 0, 0, 0.7)', 
color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, 
cursor: 'pointer', zIndex: 10, fontSize: 12, fontWeight: 'bold' 
}}
>
✕
</button>

<div style={{ 
height: 140, 
background: col.portada_url ? `url("${col.portada_url}")` : '#1a2a4a', 
backgroundSize: 'cover', backgroundPosition: 'center' 
}} />

<div style={{ padding: 12 }}>
<h4 style={{ margin: 0, color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>{col.nombre}</h4>
<p style={{ margin: 0, color: '#5a78a6', fontSize: 12 }}>
{col.obras_guardadas?.[0]?.count || 0} elementos
</p>
</div>
</div>
))}

<div onClick={onCreateClick} style={{ border: '2px dashed #0d2040', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 190, color: '#5a78a6', cursor: 'pointer' }}>    
<span style={{ fontSize: 24 }}>+</span>
<span style={{ fontSize: 13, fontWeight: 600 }}>Nueva Colección</span>
</div>
</div>
)
}