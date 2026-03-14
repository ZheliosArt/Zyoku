"use client"

import type { Obra, Tab } from '../utils/types'

interface ZoomModalProps {
  obra: Obra | null
  tab: Tab
  onClose: () => void
  onDelete: (obra: Obra, e: React.MouseEvent) => void
}

export default function ZoomModal({ obra, tab, onClose, onDelete }: ZoomModalProps) {
  if (!obra) return null

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:300,
        background:'#000000ee', backdropFilter:'blur(16px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, cursor:'zoom-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card scale-in"
        style={{ maxWidth:900, width:'100%', overflow:'hidden', cursor:'default' }}
      >
        <img
          src={obra.imagen_url}
          style={{ width:'100%', maxHeight:'70vh', objectFit:'contain', display:'block' }}
          alt={obra.titulo}
        />
        <div style={{ padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div>
            <p style={{ color:'#e8f4ff', fontWeight:800, fontSize:16 }}>{obra.titulo}</p>
            {obra.descripcion && (
              <p style={{ color:'#3a6688', fontSize:13, marginTop:5, lineHeight:1.6 }}>{obra.descripcion}</p>
            )}
            <p style={{ color:'#1a4060', fontSize:11, marginTop:6 }}>
              {new Date(obra.created_at).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ color:'#ff6b9d', fontSize:16, fontWeight:700 }}>♥ {obra.likes_count || 0}</span>
            {obra.tipo && (
              <span className="tipo-pill">{obra.tipo.toUpperCase()}</span>
            )}
            {tab === 'obras' && (
              <button className="delete-btn" onClick={e => onDelete(obra, e)}>
                Eliminar
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ width:34, height:34, borderRadius:'50%', fontSize:18, padding:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}