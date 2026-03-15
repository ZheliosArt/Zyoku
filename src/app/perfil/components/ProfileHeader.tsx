//Ruta: src/app/perfil/components/ProfileHeader.tsx
"use client"

import { RefObject } from 'react'
import type { Usuario } from '../utils/types'
import { BANNER_PRESETS } from '../utils/constants'
import ShareProfile from './ShareProfile' // <--- IMPORTACIÓN NECESARIA

interface ProfileHeaderProps {
editando: boolean
guardando: boolean
subiendoAvatar: boolean
subiendoBanner: boolean
bannerUrl: string | null
bannerIdx: number
avatarUrl: string
perfil: Usuario | null
avatarRef: RefObject<HTMLInputElement | null>
bannerRef: RefObject<HTMLInputElement | null>
setBannerIdx: (idx: number) => void
eliminarBanner: () => void
subirBanner: (file: File) => void
subirAvatar: (file: File) => void
guardarPerfil: () => void
cancelarEdicion: () => void
setEditando: (editando: boolean) => void
cerrarSesion: () => void
}

export default function ProfileHeader({
editando,
guardando,
subiendoAvatar,
subiendoBanner,
bannerUrl,
bannerIdx,
avatarUrl,
perfil,
avatarRef,
bannerRef,
setBannerIdx,
eliminarBanner,
subirBanner,
subirAvatar,
guardarPerfil,
cancelarEdicion,
setEditando,
cerrarSesion
}: ProfileHeaderProps) {
const banner = BANNER_PRESETS[bannerIdx] ?? BANNER_PRESETS[0]

return (
<>
{/* Banner */}
<div style={{
height: 320, 
position: 'relative', 
overflow: 'hidden',
background: bannerUrl 
? `url(${bannerUrl}) center/cover`
: banner.bg,
borderRadius: '20px 20px 0 0',
}}>
{!bannerUrl && (
<>
<div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,#00cfff09,transparent)', top:-140, left:'15%', pointerEvents:'none' }}/>
<div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,#ff6b9d07,transparent)', top:-60, right:'10%', pointerEvents:'none' }}/>
</>
)}

{editando && (
<div style={{ position:'absolute', bottom:10, right:14, display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
<button className="banner-upload-btn" onClick={() => bannerRef.current?.click()} disabled={subiendoBanner}>
{subiendoBanner ? '...' : '📷 Subir foto'}
</button>
{bannerUrl && (
<button className="banner-upload-btn" onClick={eliminarBanner} style={{ background:'#ff6b9d33', borderColor:'#ff6b9d44' }}>
🗑️ Quitar foto
</button>
)}
{!bannerUrl && <span style={{ color:'#ffffff33', fontSize:10, fontWeight:700, letterSpacing:.5 }}>COLORES</span>}
{!bannerUrl && BANNER_PRESETS.map((preset, i) => (
<button key={i} onClick={() => setBannerIdx(i)} style={{
width: bannerIdx === i ? 22 : 18,
height: bannerIdx === i ? 22 : 18,
borderRadius: '50%',
background: preset.bg,
border: bannerIdx === i ? '2px solid #00cfff' : '2px solid #ffffff22',
cursor: 'pointer',
transition: 'all .15s',
}}/>
))}
</div>
)}
<input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && subirBanner(e.target.files[0])} />
</div>

{/* Fila del Avatar y Botones */}
<div style={{
display:'flex', justifyContent:'space-between', alignItems:'flex-end',
flexWrap:'wrap', gap:12, marginTop:-50, marginBottom:18, padding: '0 16px'
}}>
<div style={{ position:'relative', cursor: editando ? 'pointer' : 'default' }} onClick={() => editando && avatarRef.current?.click()}>
<img src={avatarUrl} style={{ width:170, height:170, borderRadius:'50%', border:'4px solid #0a1628', boxShadow:'0 0 0 2px #00cfff33', objectFit:'cover', display:'block' }} />
<div style={{ position:'absolute', bottom:6, right:6, width:14, height:14, borderRadius:'50%', background:'#00cfff', border:'2px solid #0a1628' }}/>
{editando && (
<div style={{
position:'absolute', inset:0, borderRadius:'50%',
background: subiendoAvatar ? '#000000bb' : '#000000aa',
display:'flex', alignItems:'center', justifyContent:'center',
opacity: subiendoAvatar ? 1 : 0, transition: 'opacity .2s',
fontSize:11, fontWeight:700, color:'#00cfff', border:'4px solid #0a1628',
}}
onMouseEnter={e => { if(!subiendoAvatar)(e.currentTarget.style.opacity = '1') }}
onMouseLeave={e => { if(!subiendoAvatar)(e.currentTarget.style.opacity = '0') }}
>
{subiendoAvatar ? '...' : '📷'}
</div>
)}
<input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && subirAvatar(e.target.files[0])} />
</div>

<div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 5, alignItems: 'center' }}>
{editando ? (
<>
<button className="btn-primary" onClick={guardarPerfil} disabled={guardando} style={{ padding:'8px 22px', fontSize:13 }}>
{guardando ? 'Guardando…' : 'Guardar cambios'}
</button>
<button className="btn-ghost" onClick={cancelarEdicion} style={{ padding:'8px 16px', fontSize:13 }}>
Cancelar
</button>
</>
) : (
<>
<button className="btn-primary" onClick={() => setEditando(true)} style={{ padding:'8px 20px', fontSize:13 }}>
✏️ Editar perfil
</button>
<ShareProfile username={perfil?.username || 'Usuario'} />
<button className="btn-ghost" onClick={cerrarSesion} style={{ padding:'8px 16px', fontSize:13, color:'#ff6b9dcc', borderColor:'#2a1020' }}>
Salir
</button>
</>
)}
</div>
</div>
</>
)
}