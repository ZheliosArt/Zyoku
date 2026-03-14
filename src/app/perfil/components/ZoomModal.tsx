"use client"
import { useState, useEffect } from 'react'
import type { Obra } from '../utils/types'

interface ZoomModalProps {
  obra: Obra | null; obras: Obra[]; colecciones: any[]
  onClose: () => void; onNext: () => void; onPrev: () => void
  onSave: (obraId: any, colId: string) => Promise<void>
  onDelete: (obra: Obra, e: React.MouseEvent) => void
}

export default function ZoomModal({ obra, obras, colecciones, onClose, onNext, onPrev, onSave, onDelete }: ZoomModalProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  if (!obra) return null

  const ejecutarGuardado = async (colId: string) => {
    setIsSaving(true)
    await onSave(obra.id, colId)
    setTimeout(() => { setIsSaving(false); setShowMenu(false) }, 800)
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(5,13,26,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }} onClick={onClose}>
      
      {/* Botón Anterior */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: 20, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer', zIndex: 10 }}>‹</button>

      {/* CONTENEDOR PRINCIPAL (Vertical) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Contenedor de Imagen + Pulsar */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <img src={obra.imagen_url} alt={obra.titulo} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, boxShadow: '0 0 50px rgba(0,0,0,0.8)' }} />
          
          {/* Pulsar Centrado con Translate */}
          {isSaving && (
            <div className="pulsar-effect" style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' 
            }} />
          )}
        </div>

        {/* BARRA DE INFORMACIÓN (Debajo de la imagen) */}
        <div style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e8f4ff', fontSize: 20 }}>{obra.titulo}</h3>
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {!showMenu ? (
              <>
                <button onClick={() => setShowMenu(true)} className="btn-primary" style={{ padding: '10px 24px' }}>📥 Guardar en colección</button>
                <button onClick={(e) => onDelete(obra, e)} className="delete-btn" style={{ padding: '10px 24px' }}>Eliminar</button>
              </>
            ) : (
              <div className="card scale-in" style={{ padding: 15, minWidth: 280 }}>
                <p style={{ fontSize: 12, color: '#3a6688', marginBottom: 10 }}>¿Dónde quieres guardarla?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {colecciones.map(col => (
                    <button key={col.id} onClick={() => ejecutarGuardado(col.id)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', padding: '10px', textAlign: 'left', cursor: 'pointer', borderRadius: 8 }}>📁 {col.nombre}</button>
                  ))}
                </div>
                <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', color: '#ff6b9d', marginTop: 10, cursor: 'pointer' }}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón Siguiente */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer', zIndex: 10 }}>›</button>
    </div>
  )
}