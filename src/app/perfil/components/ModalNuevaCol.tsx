function ModalNuevaCol({ nombre, setNombre, onCreate, onCancel, cargando }: any) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div className="card scale-in" style={{ width:'100%', maxWidth:400, padding:24 }}>
        <h3 style={{ marginTop:0, color:'#fff' }}>Nueva Colección</h3>
        <input 
          autoFocus 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Ej: Favoritos, Referencias..." 
          style={{ width:'100%', padding:'12px', borderRadius:8, background:'#050d1a', border:'1px solid #1e2f4d', color:'#fff', marginBottom:20, outline:'none' }}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
        />
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ background:'transparent', color:'#88a0b5', border:'none', cursor:'pointer' }}>Cancelar</button>
          <button 
            disabled={cargando || !nombre.trim()} 
            onClick={onCreate} 
            className="btn-primary" 
            style={{ padding:'8px 20px', borderRadius:8 }}
          >
            {cargando ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}