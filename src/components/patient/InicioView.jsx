import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAppointments } from '../../hooks/usePatientData'
import { formatDate } from '../../utils/format'
import { AppointmentRow, LoadingState } from '../ui'

export default function InicioView() {
  const { user, profile } = useOutletContext()
  const navigate = useNavigate()
  const { appointments, loading } = useAppointments(user?.id)

  const nextAppointment = appointments.find((a) => a.status === 'scheduled')
  const doneAppointments = appointments.filter((a) => a.status === 'done')
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
      ) : nextAppointment ? (
        <div className="highlight-card">
          <div className="highlight-info">
            <h3>Próximo Agendamento</h3>
            <h2 style={{ textTransform: 'capitalize' }}>{formatDate(nextAppointment.date, 'full')}</h2>
            <p>
              {nextAppointment.procedure} com {nextAppointment.doctor}
            </p>
          </div>
          <button className="btn-secondary">Remarcar</button>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Você não possui agendamentos futuros.
        </p>
      )}

      <div className="section-box">
        <div className="section-title">Últimas Consultas</div>
        <div className="list-item list-header">
          <span>Data</span>
          <span>Procedimento</span>
          <span>Profissional</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>
        {!loading &&
          doneAppointments.slice(0, 2).map((a) => <AppointmentRow key={a.id} appointment={a} />)}
      </div>
    </section>
  )
}
