import { NavLink, Outlet } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/doutor', label: 'Dashboard', end: true },
  { to: '/doutor/procedimentos', label: 'Tipos de Consulta' },
  { to: '/doutor/pacientes', label: 'Pacientes' },
  { to: '/doutor/configuracoes', label: 'Configurações LGPD' },
]

// Por enquanto o doutor é fixo. Quando o Auth entrar, virá de getCurrentUser().
const DOCTOR = { name: 'Dr. Carlos Mendes', email: 'doutor@sigmasters.com' }

function Sidebar() {
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
        <span className="name">{DOCTOR.name}</span>
        <span className="role">{DOCTOR.email}</span>
      </div>
    </aside>
  )
}

export default function DoctorLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
