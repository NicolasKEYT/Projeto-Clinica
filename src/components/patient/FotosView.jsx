import { useOutletContext } from 'react-router-dom'
import { usePhotos } from '../../hooks/usePatientData'
import { LoadingState } from '../ui'

// Mostra a imagem real quando a URL é http(s) (Supabase Storage).
// No mock as URLs são fictícias, então cai no placeholder — de propósito.
function ImageSlot({ url, label, pending = false }) {
  const isRealUrl = typeof url === 'string' && /^https?:\/\//.test(url)
  const filled = !pending && Boolean(url)

  return (
    <div className={`image-box${filled ? ' filled' : ''}`} data-label={label}>
      {isRealUrl ? (
        <img className="clinical-photo" src={url} alt={label} />
      ) : pending ? (
        'Aguardando'
      ) : (
        'URL Assinada (Storage)'
      )}
    </div>
  )
}

function PhotoPair({ photo }) {
  const hasAfter = Boolean(photo.url_after)
  return (
    <div className="photo-pair">
      <div className="photo-pair-title">{photo.treatment}</div>
      <span className="photo-pair-date">{photo.date}</span>
      <div className="images-container">
        <ImageSlot url={photo.url_before} label="ANTES" />
        <ImageSlot url={photo.url_after} label={hasAfter ? 'DEPOIS' : 'PENDENTE'} pending={!hasAfter} />
      </div>
    </div>
  )
}

export default function FotosView() {
  const { user } = useOutletContext()
  const { photos, loading } = usePhotos(user?.id)

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Minhas Fotos</h1>
          <p>Evolução clínica (uso exclusivo médico).</p>
        </div>
      </header>

      <div className="lgpd-warning">
        <strong>🔒 Privacidade LGPD:</strong> Imagens carregadas via URLs assinadas
        temporárias (Supabase Storage), com políticas RLS. Não são partilhadas publicamente.
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <PhotoPair key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </section>
  )
}
