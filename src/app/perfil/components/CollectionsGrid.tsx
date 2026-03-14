// src/app/perfil/components/CollectionsGrid.tsx
export default function CollectionsGrid({ colecciones, onSelect }) {
return (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
{colecciones.map(col => (
<div 
key={col.id} 
onClick={() => onSelect(col)}
style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', background: '#0a1628', border: '1px solid #0d2040' }}
>
{/* Vista previa tipo carpeta */}
<div style={{ height: 140, background: col.portada_url ? `url(${col.portada_url})` : '#1a2a4a', backgroundSize: 'cover' }} />
<div style={{ padding: 12 }}>
<h4 style={{ margin: 0, color: '#e8f4ff', fontSize: 14 }}>{col.nombre}</h4>
<p style={{ margin: 0, color: '#5a78a6', fontSize: 12 }}>{col.obras_guardadas[0].count} elementos</p>
</div>
</div>
))}
{/* Botón de crear nueva colección */}
<div style={{ border: '2px dashed #0d2040', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 190, color: '#5a78a6', cursor: 'pointer' }}>
+ Nueva Colección
</div>
</div>
)
}