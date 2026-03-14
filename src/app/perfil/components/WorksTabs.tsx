"use client"

import type { Tab, Stats } from '../utils/types'

interface WorksTabsProps {
  tab: Tab
  setTab: (tab: Tab) => void
  obrasCount: number
  likesCount: number
}

export default function WorksTabs({ tab, setTab, obrasCount, likesCount }: WorksTabsProps) {
  return (
    <div style={{
      display:'flex', gap:4, marginBottom:18,
      background:'#0a1628', border:'1px solid #0d2040', borderRadius:14,
      padding:4, width:'fit-content',
    }}>
      {(['obras', 'likes'] as const).map(t => (
        <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
          background: tab === t ? '#0d2040' : 'transparent',
          color:      tab === t ? '#00cfff' : '#3a6688',
        }}>
          {t === 'obras'
            ? `🎨 Mis obras (${obrasCount})`
            : `♥ Me gustaron (${likesCount})`}
        </button>
      ))}
    </div>
  )
}