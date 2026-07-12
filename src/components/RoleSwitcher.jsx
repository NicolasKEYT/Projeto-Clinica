import { useLocation, useNavigate } from 'react-router-dom'

// Ferramenta temporária de pré-visualização: alterna entre as duas áreas
// sem login. Quando o Supabase Auth entrar, o perfil virá do usuário
// autenticado e este seletor pode ser removido.
export default function RoleSwitcher() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDoctor = location.pathname.startsWith('/doutor')

  return (
    <div className="role-switcher-container">
      <button
        className={`role-btn ${!isDoctor ? 'active' : ''}`}
        onClick={() => navigate('/paciente')}
      >
        Visão Paciente
      </button>
      <button
        className={`role-btn ${isDoctor ? 'active' : ''}`}
        onClick={() => navigate('/doutor')}
      >
        Visão Doutor
      </button>
    </div>
  )
}
