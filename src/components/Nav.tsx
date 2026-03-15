"use client"
//Ruta: src/components/Nav.tsx

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SupernovaIcon } from '../components/SupernovaIcon'
import NotificationsDrawer from './NotificationsDrawer'
import { useNotifications } from '../app/hooks/useNotifications'

export default function Nav() {
const [user, setUser] = useState<any>(null)
const [isNotifOpen, setIsNotifOpen] = useState(false)
const pathname = usePathname()

// Traducciones locales para el Nav
const T = {
es: { title: "Notificaciones", markAll: "Marcar todo como leído", empty: "Todo en calma por aquí." },
en: { title: "Notifications", markAll: "Mark all as read", empty: "All quiet here." }
}
const 
t = T["es"] // Puedes cambiarlo a dinámico luego

// Autenticación
useEffect(() => {
supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
setUser(session?.user ?? null)
})
return () => subscription.unsubscribe()
}, [])

// Notificaciones (Solo se activan si hay un usuario logueado)
const { notifications, unreadCount, markAllAsRead } = useNotifications(user?.id)

console.log("Nav state - userId:", user?.id, "unreadCount:", unreadCount, "notifs length:", notifications.length); // <-- LOG 9

const links = [
{ href: '/',         label: 'Inicio'     },
{ href: '/galeria',   label: 'Galería'    },
{ href: '/comunidad', label: 'Comunidad'  },
{ href: '/perfil',    label: 'Perfil'     },
]

return (
<nav style={{
position: 'sticky', top: 0, zIndex: 100,
background: 'rgba(5,13,26,0.96)', backdropFilter: 'blur(20px)',
borderBottom: '1px solid #0d2040',
padding: '0 5%', height: 58,
display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}}>
{/* LOGO */}
<a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#e8f4ff', textDecoration: 'none' }}>
Z<span style={{ color: '#00cfff' }}>y</span>oku
</a>

{/* LINKS DE NAVEGACIÓN */}
<div style={{ display: 'flex', gap: 24 }}>
{links.map(link => (
<a key={link.href} href={link.href} style={{
color: pathname === link.href ? '#00cfff' : '#3a6688',
fontSize: 13, fontWeight: 600, textDecoration: 'none',
borderBottom: pathname === link.href ? '1px solid #00cfff44' : 'none',
paddingBottom: 2, transition: 'color 0.2s',
}}>{link.label}</a>
))}
</div>

{/* ACCIONES (NOTIFICACIONES + PERFIL) */}
<div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
{user && (
<>
{/* ICONO SUPERNOVA */}
<div 
onClick={() => setIsNotifOpen(true)} 
style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
>
<SupernovaIcon hasUnread={unreadCount > 0} size={28}/>
{unreadCount > 0 && (
<div style={{
position: 'absolute', top: -5, right: -5,
minWidth: 16, height: 16, borderRadius: 20,
background: 'linear-gradient(135deg,#ff6b9d,#a78bfa)',
display: 'flex', alignItems: 'center', justifyContent: 'space-center',
fontSize: 8, fontWeight: 800, color: '#fff',
padding: '0 4px', border: '2px solid #050d1a',
boxShadow: '0 0 10px rgba(255, 107, 157, 0.4)'
}}>
{unreadCount}
</div>
)}
</div>

{/* AVATAR */}
<img 
src={user.user_metadata.avatar_url || '/default-avatar.png'}
style={{ 
width: 34, height: 34, borderRadius: '50%', 
border: '2px solid #00cfff44', cursor: 'pointer' 
}}
onClick={() => window.location.href = '/perfil'}
alt="Perfil"
/>
</>
)}
</div>

{/* DRAWER DE NOTIFICACIONES */}
<NotificationsDrawer 
isOpen={isNotifOpen} 
onClose={() => setIsNotifOpen(false)} 
notifications={notifications}
t={t}
markAllRead={markAllAsRead}
/>
</nav>
)
}