"use client"

import { useState, useEffect, useRef } from 'react'
import { TIPO_LABELS } from '../utils/constants'

// Definimos la interfaz para las props del componente
interface ShareProfileProps {
username: string // Nombre de usuario para mostrar en el mensaje de compartir
}

export default function ShareProfile({ username }: ShareProfileProps) {
const [isOpen, setIsOpen] = useState(false) // Estado para controlar si el menú está abierto
const [url, setUrl] = useState('') // Estado para guardar la URL actual
const [copiado, setCopiado] = useState(false) // Estado para feedback de copia exitosa
const menuRef = useRef<HTMLDivElement>(null) // Referencia para cerrar al hacer clic fuera

// Obtenemos la URL actual cuando el componente se monta
useEffect(() => {
setUrl(window.location.href)

// Función para cerrar el menú si se hace clic fuera de él
const handleClickOutside = (e: MouseEvent) => {
if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
setIsOpen(false)
}
}
// Añadimos el event listener
document.addEventListener('mousedown', handleClickOutside)
// Limpiamos el event listener al desmontar
return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

// Texto predeterminado para compartir
const text = `¡Mira el perfil de ${username} en Zyoku! 🎨`

// Función para copiar la URL al portapapeles
const handleCopy = async () => {
try {
await navigator.clipboard.writeText(url)
setCopiado(true)
// Reseteamos el mensaje de copia después de 2 segundos
setTimeout(() => setCopiado(false), 2000)
} catch (err) {
console.error("Error al copiar: ", err)
}
}

// Configuración de los enlaces de compartir para cada red social
const shareLinks = [
{
name: 'X (Twitter)',
icon: '𝕏', // Reemplazar con el logo SVG de X/Twitter si lo prefieres
href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
color: '#000000',
bg: '#e8f4ff'
},
{
name: 'Facebook',
icon: 'f', // Reemplazar con el logo SVG de Facebook si lo prefieres
href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
color: '#fff',
bg: '#1877F2'
},
{
name: 'WhatsApp',
icon: '📱', // Reemplazar con el logo SVG de WhatsApp si lo prefieres
href: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
color: '#fff',
bg: '#25D366'
}
]

return (
<div style={{ position: 'relative', display: 'inline-block' }}>
{/* BOTÓN PARA ABRIR/CERRAR EL MENÚ */}
<button 
onClick={() => setIsOpen(!isOpen)}
className="btn-ghost"
style={{ 
padding: '8px 16px', 
display: 'flex', 
alignItems: 'center', 
gap: 6,
borderRadius: 8,
border: '1px solid #1e2f4d',
background: isOpen ? '#0d2040' : 'transparent',
color: '#c8e0f4',
cursor: 'pointer',
transition: 'all 0.2s'
}}
>
📤 Compartir
</button>

{/* MENÚ DESPLEGABLE */}
{isOpen && (
<div 
ref={menuRef} // Asignamos la referencia
style={{
position: 'absolute',
top: '110%',
right: 0,
background: '#0a1628',
border: '1px solid #1e2f4d',
borderRadius: 12,
padding: 16,
width: 280, // Ancho suficiente para que no se corte el texto
zIndex: 100,
boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
display: 'flex',
flexDirection: 'column',
gap: 12
}}
>
{/* Título y URL de vista previa */}
<h4 style={{ margin: 0, color: '#e8f4ff', fontSize: 14 }}>Compartir perfil</h4>
<div style={{
background: '#050d1a',
padding: '8px 12px',
borderRadius: 8,
border: '1px solid #1e2f4d',
color: '#8ab4cc',
fontSize: 12,
wordBreak: 'break-all' // Para que la URL no se corte
}}>
{url}
</div>

{/* Botón de copiar dedicado */}
<button 
onClick={handleCopy}
style={{
background: copiado ? '#10b981' : '#3b82f6',
color: '#fff',
border: 'none',
padding: '10px',
borderRadius: 8,
cursor: 'pointer',
fontWeight: 600,
transition: 'background 0.2s',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
gap: 8,
width: '100%'
}}
>
{copiado ? '¡Copiado! ✓' : '🔗 Copiar enlace'}
</button>

<hr style={{ border: 'none', borderTop: '1px solid #1e2f4d', margin: '4px 0' }} />

{/* Botones de redes sociales */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
{shareLinks.map(link => (
<a 
key={link.name}
href={link.href}
target="_blank"
rel="noopener noreferrer"
title={`Compartir en ${link.name}`} // Tooltip al pasar el ratón
style={{
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: '12px',
borderRadius: 8,
textDecoration: 'none',
background: '#050d1a',
color: '#c8e0f4',
fontSize: 14,
transition: 'background 0.2s'
}}
onMouseOver={(e) => e.currentTarget.style.background = '#0d2040'}
onMouseOut={(e) => e.currentTarget.style.background = '#050d1a'}
>
<span style={{ 
background: link.bg, 
color: link.color, 
width: 32, 
height: 32, 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center', 
borderRadius: '50%',
fontWeight: 'bold',
fontSize: 16 // Un poco más grande para los logos
}}>
{link.icon}
</span>
</a>
))}
</div>
</div>
)}
</div>
)
}