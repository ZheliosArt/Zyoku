import type { Usuario } from '../utils/types'

interface SocialLinksProps {
  editando: boolean
  perfil: Usuario | null
  socialTwitter: string
  socialInstagram: string
  socialPatreon: string
  socialTiktok: string
  socialYoutube: string
  setSocialTwitter: (value: string) => void
  setSocialInstagram: (value: string) => void
  setSocialPatreon: (value: string) => void
  setSocialTiktok: (value: string) => void
  setSocialYoutube: (value: string) => void
  limpiarUsername: (input: string, plataforma: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'patreon') => string
}

export default function SocialLinks({
  editando,
  perfil,
  socialTwitter,
  socialInstagram,
  socialPatreon,
  socialTiktok,
  socialYoutube,
  setSocialTwitter,
  setSocialInstagram,
  setSocialPatreon,
  setSocialTiktok,
  setSocialYoutube,
  limpiarUsername
}: SocialLinksProps) {
  return editando ? (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', flexDirection:'column' }}>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        
        {/* Twitter */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
          background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
          <span style={{ color:'#1a4060', fontSize:13, fontWeight:700 }}>𝕏</span>
          <input 
            value={socialTwitter} 
            onChange={e => setSocialTwitter(limpiarUsername(e.target.value, 'twitter'))}
            placeholder="usuario" 
            style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} 
          />
        </div>

        {/* Instagram */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
          background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
          <span style={{ color:'#1a4060', fontSize:13 }}>📸</span>
          <input 
            value={socialInstagram} 
            onChange={e => setSocialInstagram(limpiarUsername(e.target.value, 'instagram'))}
            placeholder="usuario" 
            style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} 
          />
        </div>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        
        {/* Patreon */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
          background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
          <span style={{ color:'#1a4060', fontSize:13 }}>🟠</span>
          <input 
            value={socialPatreon} 
            onChange={e => setSocialPatreon(limpiarUsername(e.target.value, 'patreon'))}
            placeholder="usuario" 
            style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} 
          />
        </div>

        {/* TikTok */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
          background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
          <span style={{ color:'#1a4060', fontSize:13 }}>🎵</span>
          <input 
            value={socialTiktok} 
            onChange={e => setSocialTiktok(limpiarUsername(e.target.value, 'tiktok'))}
            placeholder="usuario" 
            style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} 
          />
        </div>

        {/* YouTube */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:160,
          background:'#07111f', border:'1px solid #0d2040', borderRadius:10, padding:'7px 12px' }}>
          <span style={{ color:'#1a4060', fontSize:13 }}>▶️</span>
          <input 
            value={socialYoutube} 
            onChange={e => setSocialYoutube(limpiarUsername(e.target.value, 'youtube'))}
            placeholder="canal" 
            style={{ background:'none', border:'none', color:'#c8e0f4', fontSize:13, width:'100%', outline:'none', fontFamily:'sans-serif' }} 
          />
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {perfil?.social_twitter && (
        <a className="social-chip" href={`https://twitter.com/${perfil.social_twitter}`} target="_blank" rel="noopener noreferrer">
          𝕏 @{perfil.social_twitter}
        </a>
      )}
      {perfil?.social_instagram && (
        <a className="social-chip" href={`https://instagram.com/${perfil.social_instagram}`} target="_blank" rel="noopener noreferrer">
          📸 @{perfil.social_instagram}
        </a>
      )}
      {perfil?.social_patreon && (
        <a className="social-chip" href={`https://patreon.com/${perfil.social_patreon}`} target="_blank" rel="noopener noreferrer">
          🟠 @{perfil.social_patreon}
        </a>
      )}
      {perfil?.social_tiktok && (
        <a className="social-chip" href={`https://tiktok.com/@${perfil.social_tiktok}`} target="_blank" rel="noopener noreferrer">
          🎵 @{perfil.social_tiktok}
        </a>
      )}
      {perfil?.social_youtube && (
        <a className="social-chip" href={`https://youtube.com/@${perfil.social_youtube}`} target="_blank" rel="noopener noreferrer">
          ▶️ @{perfil.social_youtube}
        </a>
      )}
    </div>
  )
}