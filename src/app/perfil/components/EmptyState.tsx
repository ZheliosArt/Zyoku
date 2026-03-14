"use client"

import type { Tab } from '../utils/types'

interface EmptyStateProps {
  tab: Tab
}

export default function EmptyState({ tab }: EmptyStateProps) {
  return (
    <div style={{ textAlign:'center', padding:'80px 0' }}>
      <p style={{ fontSize:44, marginBottom:16 }}>{tab === 'obras' ? '🎨' : '♥'}</p>
      <p style={{ color:'#1a4060', fontSize:14, marginBottom:22 }}>
        {tab === 'obras' ? 'No has publicado obras aún.' : 'No has dado like a ninguna obra aún.'}
      </p>
      {tab === 'obras' && (
        <button
          className="btn-primary"
          onClick={() => window.location.href = '/galeria'}
          style={{ padding:'10px 26px', fontSize:13 }}
        >
          Ir a la galería →
        </button>
      )}
    </div>
  )
}