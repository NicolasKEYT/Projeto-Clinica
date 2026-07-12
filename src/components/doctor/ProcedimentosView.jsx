import { useDoctorProcedures } from '../../hooks/useDoctorData'
import { formatPrice } from '../../utils/format'
import { LoadingState, useToast } from '../ui'

export default function ProcedimentosView() {
  const { procedures, loading } = useDoctorProcedures()
  const { show } = useToast()

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Tipos de Consulta</h1>
          <p>Gerencie procedimentos e valores</p>
        </div>
        <button className="btn-primary" onClick={() => show('Abrir modal de novo procedimento (a implementar).')}>
          + Procedimento
        </button>
      </header>

      <div className="section-box">
        <div className="list-item admin-grid list-header">
          <span>Procedimento</span>
          <span>Duração</span>
          <span>Valor Base</span>
          <span>Status</span>
          <span className="actions-col">Ações</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          procedures.map((p) => (
            <div className="list-item admin-grid" key={p.id}>
              <span>{p.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.duration_min} min</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatPrice(p.price_base)}</span>
              <span>
                {p.active ? (
                  <span className="status active-tag">Ativo</span>
                ) : (
                  <span className="status" style={{ color: 'var(--text-muted)' }}>Inativo</span>
                )}
              </span>
              <div className="actions-col">
                <a className="action-link" onClick={() => show('Editar: ' + p.name)}>
                  Editar
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
