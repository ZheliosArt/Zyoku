//Ruta: src/app/perfil/components/ShareProfile.tsx

"use client"

import { useState, useEffect, useRef } from 'react'

interface ShareProfileProps {
username: string
}

export default function ShareProfile({ username }: ShareProfileProps) {
const [isOpen, setIsOpen] = useState(false)
const [url, setUrl] = useState('')
const [copiado, setCopiado] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
setUrl(window.location.href)
// Cerrar al hacer clic fuera
const handleClickOutside = (e: MouseEvent) => {
if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false)
}
document.addEventListener('mousedown', handleClickOutside)
return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

const text = `¡Mira el perfil de ${username} en Zyoku! 🎨`

const handleCopy = async () => {
try {
await navigator.clipboard.writeText(url)
setCopiado(true)
setTimeout(() => setCopiado(false), 2000)
} catch (err) { console.error(err) }
}

const shareLinks = [
{ name: 'X (Twitter)', icon: '𝕏', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, bg: '#000' },
{ name: 'Facebook', icon: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, bg: '#1877F2' },
{ name: 'WhatsApp', icon: '📱', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, bg: '#25D366' },
]

return (
<div style={{ position: 'relative' }} ref={menuRef}>
<button 
onClick={() => setIsOpen(!isOpen)}
className="btn-ghost"
style={{ 
padding: '6px 12px', 
borderRadius: 20, 
border: '1px solid #1e2f4d',
fontSize: 13,
display: 'flex',
alignItems: 'center',
gap: 6
}}
>
📤 Compartir
</button>

{isOpen && (
<div style={{
position: 'absolute',
top: '120%',
right: 0,
background: 'rgba(10, 22, 40, 0.95)',
backdropFilter: 'blur(10px)',
border: '1px solid #1e2f4d',
borderRadius: 14,
padding: 12,
width: 260, // Más ancho para que no se corte
zIndex: 2000,
boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
display: 'flex',
flexDirection: 'column',
gap: 6
}}>
<p style={{ margin: '0 0 8px 8px', fontSize: 12, color: '#8ab4cc', fontWeight: 600 }}>COMPARTIR PERFIL</p>

{shareLinks.map(link => (
<a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#e8f4ff', fontSize: 14, transition: '0.2s', background: 'rgba(255,255,255,0.03)' }}
onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
>
<span style={{ background: link.bg, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: 12 }}>{link.icon}</span>
{link.name}
</a>
))}

<div 
onClick={handleCopy}
style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, color: '#00cfff', fontSize: 14, cursor: 'pointer', background: 'rgba(0, 207, 255, 0.05)', marginTop: 4, transition: '0.2s' }}
onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 207, 255, 0.1)'}
onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 207, 255, 0.05)'}
>
<span style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔗</span>
{copiado ? '¡Copiado con éxito!' : 'Copiar enlace directo'}
</div>
</div>
)}
</div>
)
}