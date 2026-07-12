import { useOutletContext } from 'react-router-dom'
import { useAppointments } from '../../hooks/usePatientData'
import { AppointmentRow, LoadingState } from '../ui'

export default function HistoricoView() {
  const { user } = useOutletContext()
  const { appointments, loading } = useAppointments(user?.id)

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Meu Histórico</h1>
          <p>Registro de atendimentos.</p>
        </div>
      </header>

      <div className="section-box">
        <div className="list-item list-header">
          <span>Data</span>
          <span>Procedimento</span>
          <span>Médico Responsável</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          appointments.map((a) => <AppointmentRow key={a.id} appointment={a} />)
        )}
      </div>
    </section>
  )
}
