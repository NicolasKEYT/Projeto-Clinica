import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/paciente', label: 'Meu Início', end: true },
  { to: '/paciente/agendar', label: 'Agendar Consulta' },
  { to: '/paciente/historico', label: 'Meu Histórico' },
  { to: '/paciente/fotos', label: 'Galeria de Fotos' },
]

function Sidebar({ name, onLogout }) {
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
        <span className="name">{name}</span>
        <span className="role">Paciente</span>
        <button className="logout-btn" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  )
}

export default function PatientLayout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const name = profile?.full_name ?? user?.email ?? 'Paciente'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Sidebar name={name} onLogout={handleLogout} />
      <main>
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  )
}
