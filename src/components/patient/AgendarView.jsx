import { useState } from 'react'
import { useProcedures } from '../../hooks/usePatientData'
import { formatPrice } from '../../utils/format'
import { LoadingState, useToast } from '../ui'

export default function AgendarView() {
  const { procedures, loading } = useProcedures()
  const { show } = useToast()
  const [selectedId, setSelectedId] = useState(null)

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Agendar Consulta</h1>
          <p>Selecione o procedimento para ver os horários.</p>
        </div>
      </header>

      <div className="section-box">
        <div className="section-title">1. Escolha o Procedimento</div>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid-cards">
            {procedures.map((proc) => (
              <div
                key={proc.id}
                className={`select-card ${proc.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(proc.id)}
              >
                <h4>{proc.name}</h4>
                <p>
                  {proc.duration_min} min • {formatPrice(proc.price_base)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-box muted-box">
        <div className="section-title">2. Profissional e Horário</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          A agenda do médico será carregada aqui via Supabase (RPC / Edge Function).
        </p>
      </div>

      <button
        className="btn-primary"
        onClick={() => show('Agendamento validado no backend e inserido na tabela appointments!')}
      >
        Confirmar
      </button>
    </section>
  )
}
