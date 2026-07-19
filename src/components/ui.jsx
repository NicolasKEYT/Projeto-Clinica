import { createContext, useCallback, useContext, useState } from 'react'
import { formatDate } from '../utils/format'
import { statusLabel } from '../utils/status'

export function StatusBadge({ status }) {
  return <span className={`status ${status}`}>{statusLabel(status)}</span>
}

export function AppointmentRow({ appointment }) {
  return (
    <div className="list-item">
      <span style={{ color: 'var(--text-muted)' }}>{formatDate(appointment.date)}</span>
      <span>{appointment.procedure}</span>
      <span style={{ color: 'var(--text-muted)' }}>{appointment.doctor}</span>
      <div style={{ textAlign: 'right' }}>
        <StatusBadge status={appointment.status} />
      </div>
    </div>
  )
}

export function LoadingState({ label = 'Carregando...' }) {
  return <p className="loading-state">{label}</p>
}

// Toast (substitui a função alertMsg do protótipo)
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message }])
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
