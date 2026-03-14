interface ProfileBioProps {
  editando: boolean
  bio: string
  setBio: (value: string) => void
}

export default function ProfileBio({ editando, bio, setBio }: ProfileBioProps) {
  return (
    <div style={{ marginBottom:14 }}>
      {editando
        ? <textarea 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            className="field"
            placeholder="Cuéntanos sobre ti…" 
            rows={3} 
            style={{ resize:'none' }} 
          />
        : <p style={{
            color: bio ? '#8ab4cc' : '#1a4060', 
            fontSize:14, 
            lineHeight:1.75,
            fontStyle: bio ? 'normal' : 'italic',
          }}>
            {bio || 'Sin bio aún — haz clic en Editar perfil para agregar una.'}
          </p>
      }
    </div>
  )
}