// Ruta: src/app/galeria/page.tsx

"use client"
import { useState, useEffect, useCallback } from 'react'
import { useGalleryLogic } from './hooks/useGalleryLogic'
import { supabase } from '@/lib/supabase'
import GalleryCard from './components/GalleryCard'
import UploadModal from '@/components/UploadModal'
import ZoomModal from '@/components/ZoomModal'

// Interface para el Toast
interface ToastItem {
  id: number;
  msg: string;
  tipo: 'ok' | 'info' | 'err';
}

export default function Galeria() {
  const { obras, user, loading, likesData, darLike, refrescar } = useGalleryLogic()
  const [showUpload, setShowUpload] = useState(false)
  const [obraSeleccionada, setObraSeleccionada] = useState<any>(null)
  const [colecciones, setColecciones] = useState<any[]>([])
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Estado para saber en qué colecciones está la obra actual
  const [savedCollections, setSavedCollections] = useState<string[]>([])

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = useCallback((msg: string, tipo: ToastItem['tipo'] = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, tipo }])
    // Se auto-elimina tras 3.2 segundos
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // Cargamos las colecciones del usuario
  useEffect(() => {
    if (user) {
      const fetchCols = async () => {
        const { data } = await supabase
          .from('colecciones')
          .select('*, obras_guardadas(count)')
          .eq('usuario_id', user.id);
        setColecciones(data || [])
      }
      fetchCols()
    }
  }, [user])



  // ── NUEVO EFECTO: Verificar qué colecciones tienen esta obra ────────────
  useEffect(() => {
    if (user && obraSeleccionada) {
      const checkSaved = async () => {
        const { data } = await supabase
          .from('obras_guardadas')
          .select('coleccion_id')
          .eq('usuario_id', user.id)
          .eq('obra_id', obraSeleccionada.id);
        const savedInCols = data?.map((s: any) => s.coleccion_id) || [];
        setSavedCollections(savedInCols);
      };
      checkSaved();
    } else {
      setSavedCollections([]);
    }
  }, [user, obraSeleccionada]);

  const handleLike = async (obra: any) => {
    const obraActualizada = await darLike(obra);
    if (obraSeleccionada && obraSeleccionada.id === obra.id) {
      setObraSeleccionada(obraActualizada);
    }
  };

  // ── NUEVA FUNCIÓN OPTIMISTA PARA EL GALLERY CARD ────────────────────────
  const handleSaveOnCard = async (obra: any, colId: string, nombreColeccion: string) => {
    if (!user) return;

    // 1. ACTUALIZACIÓN OPTIMISTA (UI RÁPIDA)
    // Suponemos que se guardará con éxito en la colección
    setColecciones(prev => prev.map((c: any) => 
      c.id === colId ? { ...c, obras_guardadas: [{ count: (c.obras_guardadas?.[0]?.count || 0) + 1 }] } : c
    ));
    setSavedCollections(prev => [...prev, colId]);

    // 2. PERSISTENCIA EN DB
    const { error } = await supabase
      .from('obras_guardadas')
      .insert([{ usuario_id: user.id, obra_id: obra.id, coleccion_id: colId }])

    if (error) {
      // 3. ROLLBACK SI FALLA
      setColecciones(prev => prev.map((c: any) => 
        c.id === colId ? { ...c, obras_guardadas: [{ count: Math.max(0, (c.obras_guardadas?.[0]?.count || 0) - 1) }] } : c
      ));
      setSavedCollections(prev => prev.filter(id => id !== colId));

      if (error.code === '23505') {
        toast(`ℹ Esta obra ya está guardada en "${nombreColeccion}"`, 'info')
      } else {
        toast('Error al guardar en colección', 'err')
      }
    } else {
      toast(`✓ Obra guardada en "${nombreColeccion}"`)
    }
  };

  const handleSave = async (obraId: string, colId: string, nombreColeccion: string) => {
    if (!user) return
    const { error } = await supabase
      .from('obras_guardadas')
      .insert([{ usuario_id: user.id, obra_id: obraId, coleccion_id: colId }])

    if (error) {
      if (error.code === '23505') { // Código de Supabase para registro duplicado
        toast(`ℹ Esta obra ya está guardada en "${nombreColeccion}"`, 'info')
      } else {
        toast('Error al guardar en colección', 'err')
      }
    } else {
      // SUCESO EXITOSO
      toast(`✓ Obra guardada en "${nombreColeccion}"`)
      // Actualizamos el contador local y el estado de guardado
      setColecciones(prev => prev.map((c: any) => 
        c.id === colId ? { ...c, obras_guardadas: [{ count: (c.obras_guardadas?.[0]?.count || 0) + 1 }] } : c
      ))
      setSavedCollections(prev => [...prev, colId]);
    }
  }

  const handleCrearYGuardar = async (nombre: string) => {
  if (!user || !obraSeleccionada) return;

  try {
    // 1. Intentar crear la colección
    const { data: nuevaCol, error: colError } = await supabase
      .from('colecciones')
      .insert([{ nombre: nombre.trim(), usuario_id: user.id }])
      .select()
      .single();

    if (colError) throw colError;
    if (!nuevaCol?.id) throw new Error("No se recibió el ID de la nueva colección");

    // 2. Intentar guardar la obra en esa nueva colección
    const { error: saveError } = await supabase
      .from('obras_guardadas')
      .insert([{ 
        usuario_id: user.id, 
        obra_id: obraSeleccionada.id, 
        coleccion_id: nuevaCol.id 
      }]);

    // Si el error es 23505, significa que YA se guardó (un doble clic accidental)
    if (saveError && saveError.code !== '23505') throw saveError;

    // 3. ACTUALIZACIÓN DE ESTADO LOCAL
    // Usamos el ID real que nos devolvió la base de datos
    const colFinal = { 
      ...nuevaCol, 
      obras_guardadas: [{ count: 1 }] 
    };

    setColecciones(prev => [...prev, colFinal]);
    setSavedCollections(prev => [...prev, nuevaCol.id]);
    
    toast(`✓ Colección "${nombre}" creada y obra guardada`);
    return nuevaCol;

  } catch (err: any) {
    // Ahora sí veremos qué pasa realmente
    console.error("Error en proceso:", err.message || err);
    toast(err.message || 'Error al procesar la colección', 'err');
  }
};



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
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#e8f4ff' }}>Explorar Galería</h1>
            <p style={{ color:'#1a4060', fontSize:13 }}>Descubre el arte de la comunidad</p>
          </div>
          {user && (
            <button className="btn-primary" onClick={() => setShowUpload(true)}>+ Subir obra</button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ textAlign:'center', marginTop: 50, color: '#1a4060' }}>Invocando obras...</p>
        ) : (
          <div style={{ columns:'3 280px', gap:16 }}>
            {obras.map((obra: any) => (
              <GalleryCard 
                key={obra.id} 
                obra={obra} 
                currentUserId={user?.id}
                isLiked={likesData[obra.id]} 
                onLike={handleLike} 
                onClick={() => setObraSeleccionada(obra)} 
                // NUEVAS PROPS PARA EL CARD OPTIMISTA
                colecciones={colecciones}
                onSaveOptimistic={handleSaveOnCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
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
          savedCollections={savedCollections} 
          onSave={handleSave}
          onCreateCollection={handleCrearYGuardar}
          onNext={goToNext}
          onPrev={goToPrev}
          onClose={() => setObraSeleccionada(null)} 
        />
      )}

      {/* DISEÑO DEL TOAST CONTAINER */}
      <div style={{ position:'fixed', bottom:24, left:24, zIndex:10000, display:'flex', flexDirection:'column', gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:'12px 18px', borderRadius:25, fontSize:13, fontWeight:600,
            background: t.tipo==='err'?'#ff6b9dcc': t.tipo==='info'?'#1e2f4dcc': '#00cfffcc',
            color: t.tipo==='err'?'#fff': t.tipo==='info'?'#fff': '#050d1a',
            backdropFilter:'blur(5px)', border: t.tipo==='err'?'1px solid #ff6b9d':'none',
            animation: 'toastIn 0.3s ease-out', boxShadow:'0 5px 20px rgba(0,0,0,0.3)'
          }}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
    </div>
  )
}