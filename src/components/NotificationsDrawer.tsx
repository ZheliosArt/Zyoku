"use client"

import React from 'react';
import { SupernovaIcon } from './SupernovaIcon';

// Definimos la estructura de una sola notificación
interface Notification {
id: string | number;
leido: boolean;
tipe?: string; 
emisor?: {
username: string;
};
}

// Definimos las propiedades que recibe el componente (Aquí estaba el error 2304)
interface NotificationsDrawerProps {
isOpen: boolean;
onClose: () => void;
notifications: Notification[];
t: {
title: string;
empty: string;
markAll: string;
};
markAllRead: () => void;
}

export default function NotificationsDrawer({ 
isOpen, 
onClose, 
notifications, 
t, 
markAllRead 
}: NotificationsDrawerProps) {

if (!isOpen) return null;

// Invertimos el orden para que la más reciente esté arriba
const sortedNotifications = [...notifications].reverse();

return (
<>
{/* Fondo oscuro detrás del panel */}
<div 
onClick={onClose} 
style={{ position: 'fixed', inset: 0, background: 'rgba(5, 13, 26, 0.8)', backdropFilter: 'blur(4px)', zIndex: 1000 }} 
/>

<div style={{
position: 'fixed', top: 0, right: 0, bottom: 0,
width: '100%', maxWidth: '420px',
background: '#050d1a', borderLeft: '1px solid #0d2040',
boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
zIndex: 1001, display: 'flex', flexDirection: 'column',
animation: 'slideIn 0.3s ease-out'
}}>
<style>{`
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
`}</style>

{/* Cabecera del Panel */}
<div style={{
padding: '20px', borderBottom: '1px solid #0d2040',
display: 'flex', alignItems: 'center', justifyContent: 'space-between',
background: '#050d1a', zIndex: 10
}}>
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
<div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<SupernovaIcon hasUnread={notifications.some((n: Notification) => !n.leido)} size={28} />
</div>
<h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#e8f4ff', margin: 0 }}>
{t.title}
</h2>
</div>
<button onClick={onClose} style={{ background: 'none', border: 'none', color: '#3a6688', fontSize: '28px', cursor: 'pointer' }}>×</button>
</div>

{/* Lista de Notificaciones */}
<div style={{ 
flex: 1, 
overflowY: 'auto', 
padding: '70px 30px ', 
display: 'flex', 
flexDirection: 'column', 
gap: '10px' 
}}>
{sortedNotifications.length === 0 ? (
<div style={{ textAlign: 'center', padding: '60px 20px' }}>
<SupernovaIcon hasUnread={false} size={50} />
<p style={{ color: '#3a6688', marginTop: 15 }}>{t.empty}</p>
</div>
) : (
sortedNotifications.map((n: Notification) => (
<div key={n.id} style={{
padding: '16px',
minHeight: '80px',
background: !n.leido 
? 'linear-gradient(135deg, rgba(0, 207, 255, 0.1), rgba(5, 13, 26, 0.95))' 
: 'rgba(13, 32, 64, 0.4)',
border: `1px solid ${!n.leido ? '#00cfff44' : '#0d2040'}`,
borderRadius: 14,
display: 'flex',
alignItems: 'flex-start',
gap: 14,
position: 'relative',
overflow: 'hidden'
}}>
{/* Avatar con inicial */}
<div style={{
width: 40, height: 40, borderRadius: '50%',
flexShrink: 0,
background: 'linear-gradient(135deg, #00cfff44, #00cfff11)',
border: '1px solid #00cfff',
display: 'flex', alignItems: 'center', justifyContent: 'center',
color: '#e8f4ff', fontWeight: 800, fontSize: 14,
zIndex: 2
}}>
{n.emisor?.username?.charAt(0).toUpperCase() || 'Z'}
</div>

{/* Contenido de texto legible sobre banners */}
<div style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
<p style={{ 
color: '#e8f4ff', 
fontSize: 13, 
margin: 0,
lineHeight: '1.4',
textShadow: '0 2px 4px rgba(0,0,0,0.8)',
whiteSpace: 'normal',
wordBreak: 'break-word'
}}>
<b style={{ color: '#00cfff' }}>@{n.emisor?.username || 'usuario'}</b> 
<br />
{n.tipe === 'follow' ? 'comenzó a seguirte' : 'interactuó con tu contenido'}
</p>
<span style={{ color: '#5a86a8', fontSize: 11, display: 'block', marginTop: 6 }}>hace un momento</span>
</div>

{!n.leido && (
<div style={{ 
width: 10, height: 10, borderRadius: '50%', 
background: '#00cfff', boxShadow: '0 0 10px #00cfff',
flexShrink: 0, marginTop: 15, zIndex: 2
}} />
)}
</div>
))
)}
</div>

{/* Botón para marcar todo como leído */}
{notifications.some((n: Notification) => !n.leido) && (
<div style={{ padding: '16px', borderTop: '1px solid #0d2040', background: '#050d1a' }}>
<button onClick={markAllRead} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0a1628', border: '1px solid #0d2040', color: '#00cfff', fontWeight: 'bold', cursor: 'pointer' }}>
{t.markAll}
</button>
</div>
)}
</div>
</>
);
}