"use client"
import { useEffect } from 'react'
import type { Obra } from '../utils/types'

interface ZoomModalProps {
obra: Obra | null
obras: Obra[] // Añadimos la lista completa
onClose: () => void
onNext: () => void // Función para ir a la siguiente
onPrev: () => void // Función para ir a la anterior
onDelete: (obra: Obra, e: React.MouseEvent) => void
}

export default function ZoomModal({ obra, obras, onClose, onNext, onPrev, onDelete }: ZoomModalProps) {
useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if (e.key === 'Escape') onClose()
if (e.key === 'ArrowRight') onNext()
if (e.key === 'ArrowLeft') onPrev()
}
window.addEventListener('keydown', handleKeyDown)
return () => window.removeEventListener('keydown', handleKeyDown)
}, [onClose, onNext, onPrev])

if (!obra) return null

return (
<div 
className="modal-overlay" 
style={{
position: 'fixed', inset: 0, background: 'rgba(5, 13, 26, 0.95)',
display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
backdropFilter: 'blur(8px)'
}}
onClick={onClose}
>
{/* Botón Anterior */}
<button 
onClick={(e) => { e.stopPropagation(); onPrev(); }}
style={{ position: 'absolute', left: 20, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer', zIndex: 10 }}
>
‹
</button>

<div 
style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
onClick={(e) => e.stopPropagation()}
>
<img 
src={obra.imagen_url} 
alt={obra.titulo}
style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} 
/>
<div style={{ marginTop: 15, textAlign: 'center' }}>
<h3 style={{ color: '#e8f4ff', margin: 0 }}>{obra.titulo}</h3>
<p style={{ color: '#ff6b9d' }}>♥ {obra.likes_count || 0} likes</p>
</div>
</div>

{/* Botón Siguiente */}
<button 
onClick={(e) => { e.stopPropagation(); onNext(); }}
style={{ position: 'absolute', right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer', zIndex: 10 }}
>
›
</button>

{/* Botón Cerrar */}
<button 
onClick={onClose}
style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
>
✕
</button>
</div>
)
}