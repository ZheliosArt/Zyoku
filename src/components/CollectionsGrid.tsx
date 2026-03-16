//Ruta: src/app/perfil/components/CollectionsGrid.tsx

"use client"
// Ruta: src/components/CollectionsGrid.tsx

interface Coleccion {
  id: string;
  nombre: string;
  portada_url?: string;
  obras_guardadas?: { count: number }[] | any; // Más flexible
  conteo_real?: number; // Por si usamos la Vista SQL
}

interface CollectionsGridProps {
  colecciones: Coleccion[];
  onSelect: (col: Coleccion) => void;
  onCreateClick: () => void;
  onDeleteClick: (col: Coleccion, e: React.MouseEvent) => void;
}

export default function CollectionsGrid({ colecciones, onSelect, onCreateClick, onDeleteClick }: CollectionsGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {colecciones.map(col => {
        // Lógica para obtener el número real de elementos
        const numElementos = col.conteo_real ?? (Array.isArray(col.obras_guardadas) ? col.obras_guardadas[0]?.count : 0);

        return (
          <div 
            key={col.id} 
            onClick={() => onSelect(col)}
            className="card-hover" // Asumiendo que tienes esta clase en tu CSS
            style={{ 
              position: 'relative', cursor: 'pointer', borderRadius: 16, 
              overflow: 'hidden', background: '#0a1628', border: '1px solid #0d2040',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Botón de eliminar carpeta */}
            <button 
              onClick={(e) => onDeleteClick(col, e)}
              style={{ 
                position: 'absolute', top: 10, right: 10, background: 'rgba(255, 107, 157, 0.1)', 
                color: '#ff6b9d', border: '1px solid #ff6b9d33', borderRadius: '50%', width: 28, height: 28, 
                cursor: 'pointer', zIndex: 10, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{ 
              height: 150, 
              background: col.portada_url ? `url("${col.portada_url}") center/cover` : 'linear-gradient(135deg, #1a2a4a, #050d1a)', 
              borderBottom: '1px solid #0d2040'
            }} />

            <div style={{ padding: 14 }}>
              <h4 style={{ margin: 0, color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>{col.nombre}</h4>
              <p style={{ margin: '4px 0 0', color: '#3a6688', fontSize: 12, fontWeight: 600 }}>
                {numElementos} {numElementos === 1 ? 'elemento' : 'elementos'}
              </p>
            </div>
          </div>
        );
      })}

      {/* Botón Nueva Colección */}
      <div 
        onClick={onCreateClick} 
        style={{ 
          border: '2px dashed #0d2040', borderRadius: 16, display: 'flex', 
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          minHeight: 215, color: '#3a6688', cursor: 'pointer', gap: 8,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#00cfff'; e.currentTarget.style.color = '#00cfff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#0d2040'; e.currentTarget.style.color = '#3a6688'; }}
      >    
        <span style={{ fontSize: 32 }}>+</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Nueva Colección</span>
      </div>
    </div>
  )
}