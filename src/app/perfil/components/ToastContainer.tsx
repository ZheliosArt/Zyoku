import type { ToastItem } from '../utils/types'

interface ToastContainerProps {
  toasts: ToastItem[]
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:1000, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          animation: 'toastIn .3s ease both',
          background: t.tipo === 'ok' ? '#0a1628' : '#180a16',
          border: `1px solid ${t.tipo === 'ok' ? '#00cfff44' : '#ff6b9d44'}`,
          color:  t.tipo === 'ok' ? '#00cfff' : '#ff6b9d',
          padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: '0 6px 24px #00000077',
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
