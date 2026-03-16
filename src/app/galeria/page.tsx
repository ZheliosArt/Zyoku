//Ruta: src/app/galeria/page.tsx  
"use client"
import { useState, useEffect } from 'react'
import { useGalleryLogic } from './hooks/useGalleryLogic'
import { supabase } from '@/lib/supabase'
import GalleryCard from './components/GalleryCard'
import UploadModal from '@/components/UploadModal'
import ZoomModal from '@/components/ZoomModal'

export default function Galeria() {
  // Ahora useGalleryLogic() debería devolver el objeto correctamente
  const { obras, user, loading, likesData, darLike, refrescar } = useGalleryLogic()
  
  const [showUpload, setShowUpload] = useState(false)
  const [obraSeleccionada, setObraSeleccionada] = useState<any>(null)
  const [colecciones, setColecciones] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      const fetchCols = async () => {
        const { data } = await supabase
          .from('colecciones')
          .select('*, obras_guardadas(count)')
          .eq('usuario_id', user.id)
        setColecciones(data || [])
      }
      fetchCols()
    }
  }, [user])

  const handleLike = async (obra: any) => {
    const obraActualizada = await darLike(obra);
    if (obraSeleccionada && obraSeleccionada.id === obra.id) {
      setObraSeleccionada(obraActualizada);
    }
  };

  const handleSave = async (obraId: string, colId: string) => {
    if (!user) return
    const { error } = await supabase
      .from('obras_guardadas')
      .insert([{ usuario_id: user.id, obra_id: obraId, coleccion_id: colId }])

    if (error) {
      alert("Ya guardaste esta obra en esta colección")
    } else {
      setColecciones(prev => prev.map((c: any) => 
        c.id === colId ? { ...c, obras_guardadas: [{ count: (c.obras_guardadas[0]?.count || 0) + 1 }] } : c
      ))
    }
  }

  const handleCrearYGuardar = async (nombre: string) => {
  if (!user || !obraSeleccionada) return;

  // 1. Creamos la colección en Supabase
  const { data: nuevaCol, error: colError } = await supabase
    .from('colecciones')
    .insert([{ nombre, usuario_id: user.id }])
    .select()
    .single();

  if (colError) return;

  // 2. Guardamos la obra actual en esa nueva colección automáticamente
  const { error: saveError } = await supabase
    .from('obras_guardadas')
    .insert([{ 
      usuario_id: user.id, 
      obra_id: obraSeleccionada.id, 
      coleccion_id: nuevaCol.id 
    }]);

  if (!saveError) {
    // 3. Actualizamos el estado local para que aparezca en la lista
    const colFormateada = { ...nuevaCol, obras_guardadas: [{ count: 1 }] };
    setColecciones(prev => [...prev, colFormateada]);
    // Opcional: puedes cerrar el menú de guardado aquí o mostrar un mensaje de éxito
  }
};

  // Corregimos el error "implicitly has any type" añadiendo (o: any)
  const goToNext = () => {
    const idx = obras.findIndex((o: any) => o.id === obraSeleccionada?.id)
    if (idx !== -1) setObraSeleccionada(obras[(idx + 1) % obras.length])
  }

  const goToPrev = () => {
    const idx = obras.findIndex((o: any) => o.id === obraSeleccionada?.id)
    if (idx !== -1) setObraSeleccionada(obras[idx <= 0 ? obras.length - 1 : idx - 1])
  }

  return (
    <div style={{ background:'#050d1a', minHeight:'100vh', color:'#c8e0f4' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 3%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff' }}>Explorar Galería</h1>
            <p style={{ color:'#1a4060', fontSize:13 }}>Descubre el arte de la comunidad</p>
          </div>
          {user && (
            <button className="btn-primary" onClick={() => setShowUpload(true)}>+ Subir obra</button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign:'center', marginTop: 50, color: '#1a4060' }}>Invocando obras...</p>
        ) : (
          <div style={{ columns:'3 280px', gap:16 }}>
            {/* Corregimos el error "implicitly has any type" añadiendo (obra: any) */}
            {obras.map((obra: any) => (
              <GalleryCard 
                key={obra.id} 
                obra={obra} 
                currentUserId={user?.id}
                isLiked={likesData[obra.id]} 
                onLike={handleLike} 
                onClick={() => setObraSeleccionada(obra)} 
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)} 
        user={user} 
        onSuccess={refrescar} 
      />

      {obraSeleccionada && (
        <ZoomModal 
          obra={obraSeleccionada} 
          currentUserId={user?.id}
          isLiked={likesData[obraSeleccionada.id]} 
          onLike={handleLike}
          colecciones={colecciones}
          onSave={handleSave}
          onNext={goToNext}
          onPrev={goToPrev}
          onClose={() => setObraSeleccionada(null)} 
          onCreateCollection={handleCrearYGuardar}
        />
      )}
    </div>
  )
}