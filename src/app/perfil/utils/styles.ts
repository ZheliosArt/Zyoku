export const CSS = `
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
::-webkit-scrollbar { width:4px }
::-webkit-scrollbar-thumb { background:#00cfff22; border-radius:2px }

@keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
@keyframes shimmer { 0%,100%{opacity:.35} 50%{opacity:.7} }
@keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
@keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulsarImplosion {
0% { transform: scale(2); opacity: 0; filter: blur(10px); }
30% { transform: scale(1); opacity: 1; filter: blur(0px); border: 4px solid #fff; }
100% { transform: scale(0); opacity: 0; filter: brightness(3); }
}

.fade-up { animation: fadeUp 0.45s ease both; }
.scale-in { animation: scaleIn 0.3s ease both; }
.sk { animation: shimmer 1.6s ease infinite; background:#0d2040; border-radius:8px; }

.card { background:#0a1628; border:1px solid #0d2040; border-radius:20px; }

.btn-primary {
background: linear-gradient(135deg,#005577,#00cfff22);
border: 1px solid #00cfff44;
color: #00cfff;
border-radius: 24px;
font-weight: 700;
cursor: pointer;
transition: all .2s;
font-family: sans-serif;
}
.btn-primary:hover:not(:disabled) {
background: linear-gradient(135deg,#006688,#00cfff44);
box-shadow: 0 0 20px #00cfff18;
transform: translateY(-1px);
}
.btn-primary:disabled { opacity:.5; cursor:not-allowed; }

.btn-ghost {
background: none;
border: 1px solid #0d2040;
color: #3a6688;
border-radius: 24px;
cursor: pointer;
transition: all .2s;
font-family: sans-serif;
}
.btn-ghost:hover { border-color:#1a3060; color:#5a8aaa; }

.field {
width: 100%;
background: #07111f;
border: 1px solid #0d2040;
border-radius: 10px;
padding: 10px 14px;
color: #c8e0f4;
font-size: 14px;
font-family: sans-serif;
transition: border-color .2s, box-shadow .2s;
outline: none;
}
.field:focus { border-color:#00cfff44; box-shadow:0 0 0 3px #00cfff0a; }

.obra-card { transition: transform .2s; cursor: zoom-in; }
.obra-card:hover { transform: scale(1.025); }
.obra-card:hover .obra-overlay { opacity: 1 !important; }

.stat-block { animation: countUp .5s ease both; }

.social-chip {
display: inline-flex;
align-items: center;
gap: 5px;
color: #3a6688;
font-size: 12px;
text-decoration: none;
background: #07111f;
border: 1px solid #0d2040;
border-radius: 20px;
padding: 4px 12px;
transition: all .2s;
}
.social-chip:hover { border-color:#1a3060; color:#5a8aaa; }

.tab-btn {
padding: 9px 24px;
border-radius: 10px;
font-size: 13px;
font-weight: 700;
cursor: pointer;
border: none;
font-family: sans-serif;
transition: all .2s;
}

.tipo-pill {
font-size: 10px;
font-weight: 700;
letter-spacing: .8px;
padding: 2px 10px;
border-radius: 20px;
border: 1px solid #00cfff33;
background: #00cfff0d;
color: #00cfff;
}

input[type="file"] { display:none; }

.delete-btn {
background: #ff6b9d18;
border: 1px solid #ff6b9d44;
color: #ff6b9d;
font-size: 10px;
font-weight: 700;
padding: 3px 9px;
border-radius: 20px;
cursor: pointer;
font-family: sans-serif;
transition: all .15s;
}
.delete-btn:hover { background:#ff6b9d33; }

.banner-upload-btn {
background: #00000066;
backdrop-filter: blur(8px);
border: 1px solid #ffffff22;
color: #ffffff;
font-size: 11px;
font-weight: 700;
padding: 6px 14px;
border-radius: 20px;
cursor: pointer;
font-family: sans-serif;
transition: all .2s;
display: flex;
align-items: center;
gap: 5px;
}
.banner-upload-btn:hover { background:#00000088; border-color:#ffffff44; }

/* Reemplaza la clase .pulsar-effect por esta versión "estrella" */
.pulsar-effect {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%) scale(0);
width: 180px;
height: 180px;
background: white;
/* Forma de estrella de 4 puntas */
clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
pointer-events: none;
z-index: 999;
animation: pulsarImplosion 0.8s cubic-bezier(0.13, 0.9, 0.4, 1) forwards;
box-shadow: 0 0 40px #fff, 0 0 100px #00cfff;
}

/* Añadimos un brillo extra con un pseudo-elemento */
.pulsar-effect::after {
content: '';
position: absolute;
inset: 0;
background: white;
filter: blur(15px);
opacity: 0.5;
}
`