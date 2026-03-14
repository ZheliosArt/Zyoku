import type { Usuario } from '../utils/types'
import { TIPO_LABELS } from '../utils/constants'

interface ProfileInfoProps {
  editando: boolean
  perfil: Usuario | null
  userEmail: string
  nombreMostrado: string
  username: string
  locationText: string
  pronounText: string
  setUsername: (value: string) => void
  setLocationText: (value: string) => void
  setPronounText: (value: string) => void
}

export default function ProfileInfo({
  editando,
  perfil,
  userEmail,
  nombreMostrado,
  username,
  locationText,
  pronounText,
  setUsername,
  setLocationText,
  setPronounText
}: ProfileInfoProps) {
  return (
    <div style={{ marginBottom:12 }}>
      {editando ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="field"
            style={{ fontSize:18, fontWeight:800, maxWidth:280 }} 
            placeholder="Nombre de usuario" 
          />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <input 
              value={locationText} 
              onChange={e => setLocationText(e.target.value)} 
              className="field"
              style={{ fontSize:13, maxWidth:135 }} 
              placeholder="📍 Ubicación" 
            />
            <input 
              value={pronounText} 
              onChange={e => setPronounText(e.target.value)} 
              className="field"
              style={{ fontSize:13, maxWidth:135 }} 
              placeholder="🗣️ Pronombres" 
            />
          </div>
        </div>
      ) : (
        <h1 style={{ fontSize:22, fontWeight:800, color:'#e8f4ff', marginBottom:6 }}>
          {nombreMostrado} {perfil?.pronoun && <span style={{ fontSize:14, color:'#8ab4cc', fontWeight:400 }}>({perfil.pronoun})</span>}
        </h1>
      )}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ color:'#1a4060', fontSize:12 }}>{userEmail}</span>
        <span className="tipo-pill">{TIPO_LABELS[perfil?.tipo || 'fan'] || (perfil?.tipo?.toUpperCase()) || 'FAN'}</span>
        {!editando && perfil?.location && (
          <span style={{ color:'#8ab4cc', fontSize:12 }}>📍 {perfil.location}</span>
        )}
      </div>
    </div>
  )
}