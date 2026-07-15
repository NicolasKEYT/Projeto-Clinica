import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SignupPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (password.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.')
      return
    }
    setLoading(true)
    const { data, error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (!data?.session) {
      setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.')
      return
    }
    // Com sessão ativa, o contexto detecta o login e as rotas redirecionam sozinhas.
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">Clínica SIGmasters</div>
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Cadastro de paciente</p>

        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Nome completo</label>
            <input
              id="name"
              className="auth-input"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Senha</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
