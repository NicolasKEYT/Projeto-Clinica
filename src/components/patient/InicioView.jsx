import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAppointments } from '../../hooks/usePatientData'
import { formatDate } from '../../utils/format'
import { proximaConsulta, consultasRealizadas } from '../../utils/status'
import { AppointmentRow, LoadingState } from '../ui'

export default function InicioView() {
  const { user, profile } = useOutletContext()
  const navigate = useNavigate()
  const { appointments, loading } = useAppointments(user?.id)

  const proxima = proximaConsulta(appointments)
  const realizadas = consultasRealizadas(appointments)
  const firstName = (profile?.full_name ?? '').split(' ')[0]

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Olá{firstName ? ', ' + firstName : ''}!</h1>
          <p>Bem-vindo à sua área de autoatendimento.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/paciente/agendar')}>
          + Nova Consulta
        </button>
      </header>

      {loading ? (
        <LoadingState />
      ) : proxima ? (
        <div className="highlight-card">
          <div className="highlight-info">
            <h3>Próximo Agendamento</h3>
            <h2 style={{ textTransform: 'capitalize' }}>{formatDate(proxima.date, 'full')}</h2>
            <p>
              {proxima.procedure}
              {proxima.doctor && proxima.doctor !== '—' ? ` com ${proxima.doctor}` : ''}
              {proxima.clinic ? ` • ${proxima.clinic}` : ''}
            </p>
          </div>
          <button className="btn-secondary">Remarcar</button>
        </div>
      ) : (
        <div className="empty-highlight">
          <p>Você não possui agendamentos futuros.</p>
          <button className="btn-primary" onClick={() => navigate('/paciente/agendar')}>
            Agendar agora
          </button>
        </div>
      )}

      <div className="section-box">
        <div className="section-title">Últimas Consultas</div>
        <div className="list-item list-header">
          <span>Data</span>
          <span>Procedimento</span>
          <span>Profissional</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : realizadas.length === 0 ? (
          <p className="picker-empty" style={{ paddingTop: 16 }}>
            Nenhuma consulta realizada ainda.
          </p>
        ) : (
          realizadas.slice(0, 3).map((a) => <AppointmentRow key={a.id} appointment={a} />)
        )}
      </div>
    </section>
  )
}
