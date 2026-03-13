export default function LoadingSkeleton() {
  return (
    <div style={{ fontFamily:'sans-serif', background:'#050d1a', minHeight:'100vh' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.3} 50%{opacity:.65} }
        .sk { animation:shimmer 1.6s ease infinite; background:#0d2040; border-radius:8px; }
      `}</style>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 4%' }}>
        <div style={{ background:'#0a1628', border:'1px solid #0d2040', borderRadius:20, overflow:'hidden', marginBottom:20 }}>
          <div className="sk" style={{ height:120, borderRadius:0 }}/>
          <div style={{ padding:'0 28px 28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:-40, marginBottom:20 }}>
              <div className="sk" style={{ width:82, height:82, borderRadius:'50%' }}/>
              <div style={{ display:'flex', gap:8 }}>
                <div className="sk" style={{ width:140, height:36, borderRadius:24 }}/>
                <div className="sk" style={{ width:72,  height:36, borderRadius:24 }}/>
              </div>
            </div>
            <div className="sk" style={{ width:180, height:22, marginBottom:12 }}/>
            <div className="sk" style={{ width:'100%', height:64, marginBottom:12 }}/>
            <div style={{ display:'flex', gap:8 }}>
              <div className="sk" style={{ width:120, height:28, borderRadius:20 }}/>
              <div className="sk" style={{ width:130, height:28, borderRadius:20 }}/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #0d2040' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ padding:'16px 8px', textAlign:'center', borderRight: i < 3 ? '1px solid #0d2040' : 'none' }}>
                <div className="sk" style={{ width:36, height:22, margin:'0 auto 6px' }}/>
                <div className="sk" style={{ width:60, height:11, margin:'0 auto' }}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[160,220,190,200,170,210].map((h,i) => (
            <div key={i} className="sk" style={{ height:h, borderRadius:12 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
