import { useDashboardMetrics, useTodaySchedule } from '../../hooks/useDoctorData'
import { LoadingState } from '../ui'

const SCHEDULE_STATUS = {
  done: { cls: 'done', label: 'Finalizado' },
  waiting: { cls: 'waiting', label: 'Aguardando' },
  scheduled: { cls: 'scheduled', label: 'Agendado' },
}

export default function DashboardView() {
  const { metrics } = useDashboardMetrics()
  const { schedule, loading } = useTodaySchedule()

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Dashboard Gerencial</h1>
          <p>Visão geral da clínica</p>
        </div>
        <button className="btn">Filtro: Hoje ⌵</button>
      </header>

      <div className="metrics-grid">
        <div className="card">
          <span className="card-title">Pacientes do Dia</span>
          <span className="card-value">{metrics?.patientsToday ?? '—'}</span>
        </div>
        <div className="card">
          <span className="card-title">Aguardando na Recepção</span>
          <span className="card-value" style={{ color: '#FFA000' }}>
            {metrics?.waitingReception ?? '—'}
          </span>
        </div>
        <div className="card">
          <span className="card-title">Consultas Realizadas</span>
          <span className="card-value" style={{ color: '#4CAF50' }}>
            {metrics?.completedToday ?? '—'}
          </span>
        </div>
      </div>

      <div className="section-box">
        <div className="section-title">Agenda em Tempo Real (Hoje)</div>
        <div className="list-item dash-grid list-header">
          <span>Horário</span>
          <span>Paciente</span>
          <span>Procedimento</span>
          <span className="status">Status</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          schedule.map((item) => {
            const s = SCHEDULE_STATUS[item.status] ?? { cls: '', label: item.status }
            return (
              <div className="list-item dash-grid" key={item.id}>
                <span style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                <span>{item.patient}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.procedure}</span>
                <span className={`status ${s.cls}`}>{s.label}</span>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
