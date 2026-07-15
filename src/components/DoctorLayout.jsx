import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/doutor', label: 'Dashboard', end: true },
  { to: '/doutor/procedimentos', label: 'Tipos de Consulta' },
  { to: '/doutor/pacientes', label: 'Pacientes' },
  { to: '/doutor/configuracoes', label: 'Configurações LGPD' },
]

function Sidebar({ name, email, onLogout }) {
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
        <span className="role">{email}</span>
        <button className="logout-btn" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  )
}

export default function DoctorLayout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const name = profile?.full_name ?? 'Doutor'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Sidebar name={name} email={user?.email} onLogout={handleLogout} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
