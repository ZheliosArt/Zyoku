"use client"
import React from 'react';

interface SupernovaIconProps {
hasUnread: boolean;
size?: number;
}

export const SupernovaIcon = ({ hasUnread, size = 26 }: SupernovaIconProps) => {
return (
<div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center" }}>
<style>{`
@keyframes nova-pulse { 
0%, 100% { transform: scale(1); opacity: 0.8; filter: brightness(1); } 
50% { transform: scale(1.15); opacity: 1; filter: brightness(1.4); } 
}
@keyframes white-glow {
0%, 100% { box-shadow: 0 0 15px #00cfff88, 0 0 30px #00cfff33; }
50% { box-shadow: 0 0 25px #ffffff, 0 0 50px #00cfff; }
}
@keyframes nova-ring {
0% { transform: scale(0.8); opacity: 0.8; }
100% { transform: scale(1.5); opacity: 0; }
}
@keyframes nova-ray {
0%, 100% { transform: translate(-50%, -100%) rotate(var(--rotation)) scaleY(1); opacity: 0.5; }
50% { transform: translate(-50%, -100%) rotate(var(--rotation)) scaleY(1.2); opacity: 1; }
}
`}</style>

{/* Anillo de expansión lateral */}
<div style={{
position:"absolute", 
inset:-4,
borderRadius:"50%",
border:`1.5px solid ${hasUnread ? "#00cfff66" : "#00cfff22"}`,
animation: hasUnread ? "nova-ring 2s ease-out infinite" : "none",
pointerEvents:"none",
}}/>

{/* Rayos de la Supernova */}
{[0,45,90,135,180,225,270,315].map((deg, i) => (
<div key={i} style={{
position:"absolute",
left:"50%", 
top:"50%",
width:1.5,
height: i % 2 === 0 ? size * 0.45 : size * 0.3,
background:`linear-gradient(to top, transparent, ${hasUnread?"#00cfff":"#00cfff55"})`,
transformOrigin:"bottom center",
// @ts-ignore - Usamos variable CSS para la rotación en la animación
"--rotation": `${deg}deg`,
transform:`translate(-50%, -100%) rotate(${deg}deg)`,
animation: hasUnread ? `nova-ray ${1.4 + i*0.1}s ease-in-out ${i*0.15}s infinite` : "none",
borderRadius:2,
opacity: hasUnread ? 0.8 : 0.3,
} as React.CSSProperties}/>
))}

{/* Núcleo */}
<div style={{
width: size * 0.38,
height: size * 0.38,
borderRadius: "50%",
background: hasUnread
? "radial-gradient(circle, #ffffff 10%, #e8f4ff 30%, #00cfff 70%, #006688 100%)"
: "radial-gradient(circle, #1a4060 20%, #0a1e30 100%)",
animation: hasUnread ? "nova-pulse 2s ease-in-out infinite, white-glow 1.5s ease-in-out infinite" : "nova-pulse 4s ease-in-out infinite",
zIndex: 1,
}}/>
</div>
);
};