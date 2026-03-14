"use client"

import type { Obra, Tab } from '../utils/types'

interface WorksGridProps {
  obras: Obra[]
  tab: Tab
  onObraClick: (obra: Obra) => void
  onDeleteObra: (obra: Obra, e: React.MouseEvent) => void
}

export default function WorksGrid({ obras, tab, onObraClick, onDeleteObra }: WorksGridProps) {
  return (
    <div style={{ columns:'3 220px', gap:14 }}>
      {obras.map((obra: Obra) => (
        <div
          key={obra.id}
          className="obra-card"
          style={{
            breakInside:'avoid', marginBottom:14,
            borderRadius:12, overflow:'hidden',
            border:'1px solid #0d2040', background:'#0a1628',
            position:'relative',
          }}
          onClick={() => onObraClick(obra)}
        >
          <img src={obra.imagen_url} style={{ width:'100%', display:'block' }} alt={obra.titulo} />
          <div className="obra-overlay" style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to top,#050d1af0 0%,#050d1a44 50%,transparent 100%)',
            opacity:0, transition:'opacity .25s',
            display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:12,
          }}>
            <p style={{ color:'#e8f4ff', fontWeight:700, fontSize:13, marginBottom:4 }}>{obra.titulo}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#ff6b9d', fontSize:12 }}>♥ {obra.likes_count || 0}</span>
              {tab === 'obras' && (
                <button className="delete-btn" onClick={e => onDeleteObra(obra, e)}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}