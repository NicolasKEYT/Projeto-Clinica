import { NavLink, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/usePatientData'
import { LoadingState } from './ui'

const NAV_LINKS = [
  { to: '/paciente', label: 'Meu Início', end: true },
  { to: '/paciente/agendar', label: 'Agendar Consulta' },
  { to: '/paciente/historico', label: 'Meu Histórico' },
  { to: '/paciente/fotos', label: 'Galeria de Fotos' },
]

function Sidebar({ userName }) {
  return (
    <aside>
      <div className="logo">Clínica SIGmasters</div>
      <nav>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="user-profile">
        <span className="name">{userName ?? 'Carregando...'}</span>
        <span className="role">Paciente</span>
      </div>
    </aside>
  )
}

export default function PatientLayout() {
  const { user, loading } = useCurrentUser()

  return (
    <div className="app-shell">
      <Sidebar userName={user?.name} />
      <main>
        {loading ? <LoadingState label="Carregando sua área..." /> : <Outlet context={{ user }} />}
      </main>
    </div>
  )
}
