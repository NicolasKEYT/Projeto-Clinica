import { useState } from 'react'
import { usePatients } from '../../hooks/useDoctorData'
import { LoadingState, useToast } from '../ui'

export default function PacientesView() {
  const [search, setSearch] = useState('')
  const { patients, loading } = usePatients(search)
  const { show } = useToast()

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Base de Pacientes</h1>
          <p>Gestão centralizada de cadastros</p>
        </div>
        <input
          className="input-field"
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="section-box">
        <div className="list-item admin-grid list-header">
          <span>Nome</span>
          <span>CPF</span>
          <span>Última Consulta</span>
          <span>Contato</span>
          <span className="actions-col">Ações</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : patients.length ? (
          patients.map((p) => (
            <div className="list-item admin-grid" key={p.id}>
              <span>{p.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.cpf}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.lastVisit}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.phone}</span>
              <div className="actions-col">
                <a className="action-link" onClick={() => show('Abrir prontuário de ' + p.name)}>
                  Prontuário
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-state">Nenhum paciente encontrado.</p>
        )}
      </div>
    </section>
  )
}
