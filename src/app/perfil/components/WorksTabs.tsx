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
{(['obras', 'likes', 'guardados'] as const).map(t => (
<button 
key={t} 
className={`tab-btn ${tab === t ? 'active' : ''}`} 
onClick={() => setTab(t)} 
style={{
background: tab === t ? '#0d2040' : 'transparent',
color:      tab === t ? '#00cfff' : '#3a6688',
border: 'none',
padding: '8px 12px',
borderRadius: 10,
cursor: 'pointer',
transition: 'all 0.2s'
}}
>
{t === 'obras' && `🎨 Mis obras (${obrasCount})`}
{t === 'likes' && `♥ Me gustaron (${likesCount})`}
{t === 'guardados' && `📁 Guardados`}
</button>
))}
</div>
)
}