import { useEffect, useState } from 'react'

// Alterna o tema aplicando a classe 'light-theme' no body.
// O CSS cuida do resto via variáveis.
export default function ThemeToggle() {
  const [light, setLight] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('light-theme', light)
  }, [light])

  return (
    <div className="theme-btn-container">
      <button className="btn" onClick={() => setLight((v) => !v)}>
        {light ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
      </button>
    </div>
  )
}