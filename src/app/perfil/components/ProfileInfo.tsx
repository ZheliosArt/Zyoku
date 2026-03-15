"use client"

import type { Usuario } from '../utils/types'
import { TIPO_LABELS } from '../utils/constants'

interface ProfileInfoProps {
editando: boolean
perfil: Usuario | null
userEmail: string
nombreMostrado: string
username: string
locationText: string
pronounText: string
commissionsOpen: boolean
tipoText: string // <--- NUEVA PROP
setUsername: (value: string) => void
setLocationText: (value: string) => void
setPronounText: (value: string) => void
setCommissionsOpen: (value: boolean) => void
setTipoText: (value: string) => void // <--- NUEVA PROP

}

export default function ProfileInfo({
editando,
perfil,
userEmail,
nombreMostrado,
username,
locationText,
pronounText,
commissionsOpen,
tipoText,
setUsername,
setLocationText,
setPronounText,
setCommissionsOpen,
setTipoText
}: ProfileInfoProps) {
return (
<div style={{ marginBottom:12 }}>
{editando ? (
<div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
<input 
value={username} 
onChange={e => setUsername(e.target.value)} 
className="field"
style={{ fontSize:18, fontWeight:800, maxWidth:280 }} 
placeholder="Nombre de usuario" 
/>
<div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
<input 
value={locationText} 
onChange={e => setLocationText(e.target.value)} 
className="field"
style={{ fontSize:13, maxWidth:135 }} 
placeholder="📍 Ubicación" 
/>
<input 
  // Usamos un template literal para agregar el @ visualmente
  value={`@${pronounText || ''}`} 
  onChange={e => {
    const val = e.target.value;
    // Si el valor empieza con @, lo quitamos antes de guardarlo en el estado
    const cleanVal = val.startsWith('@') ? val.slice(1) : val;
    setPronounText(cleanVal);
  }} 
  className="field"
  style={{ fontSize:13, maxWidth:135 }} 
  placeholder="🗣️ Nickname" 
/>
{/* NUEVO DESPLEGABLE DE TIPO */}
<select
value={tipoText}
onChange={e => setTipoText(e.target.value)}
className="field"
style={{ fontSize:13, maxWidth:135, cursor:'pointer' }}
>
{Object.entries(TIPO_LABELS).map(([key, label]) => (
<option key={key} value={key}>
{label}
</option>
))}
</select>
</div>
<label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#8ab4cc', marginTop:4 }}>
<input 
type="checkbox" 
checked={commissionsOpen} 
onChange={e => setCommissionsOpen(e.target.checked)} 
style={{ cursor:'pointer' }}
/>
Abrir comisiones (mostrar correo públicamente)
</label>
</div>
) : (
<h1 style={{ fontSize:22, fontWeight:800, color:'#e8f4ff', marginBottom:6 }}>
{nombreMostrado} {perfil?.pronoun && <span style={{ fontSize:14, color:'#8ab4cc', fontWeight:400 }}>({perfil.pronoun})</span>}
</h1>
)}

<div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginTop: 10 }}>
{/* CONDICIÓN PARA MOSTRAR CORREO Y BADGE */}
{commissionsOpen && (
<>
<span style={{ color:'#1a4060', fontSize:12 }}>{userEmail}</span>
<span style={{ background:'#10b981', color:'#fff', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:12, textTransform: 'uppercase' }}>
✨ COMISIONES ABIERTAS
</span>
</>
)}

<span className="tipo-pill">{TIPO_LABELS[perfil?.tipo || 'fan'] || (perfil?.tipo?.toUpperCase()) || 'FAN'}</span>
{!editando && perfil?.location && (
<span style={{ color:'#8ab4cc', fontSize:12 }}>📍 {perfil.location}</span>
)}
</div>
</div>
)
}