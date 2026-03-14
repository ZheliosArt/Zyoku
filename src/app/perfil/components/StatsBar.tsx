import type { Stats } from '../utils/types'

interface StatsBarProps {
  stats: Stats
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #0d2040' }}>
      {([
        { n: stats.obras,      label:'Obras',         icon:'🎨' },
        { n: stats.likes,      label:'Likes totales', icon:'♥'  },
        { n: stats.seguidores, label:'Seguidores',    icon:'👥' },
        { n: stats.siguiendo,  label:'Siguiendo',     icon:'→'  },
      ] as const).map((s, i) => (
        <div key={i} className="stat-block" style={{
          textAlign:'center', padding:'16px 8px',
          borderRight: i < 3 ? '1px solid #0d2040' : 'none',
          animationDelay: `${i * 80}ms`,
        }}>
          <div style={{ fontSize:22, fontWeight:800, color:'#00cfff', lineHeight:1 }}>{s.n}</div>
          <div style={{ fontSize:11, color:'#1a4060', marginTop:4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}