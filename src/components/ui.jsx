import { createContext, useCallback, useContext, useEffect, useState } from 'react' // ALTERADO: adicionado useEffect
import { formatDate } from '../utils/format'

const STATUS_LABELS = { done: 'Realizada', scheduled: 'Agendado' }

export function StatusBadge({ status }) {
  return <span className={`status ${status}`}>{STATUS_LABELS[status] ?? status}</span>
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

// NOVO: componente de modal genérico e reutilizável (usado por qualquer tela que precise de um card sobreposto)
export function Modal({ title, onClose, children }) {
  // NOVO: fecha o modal ao apertar Esc
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    // NOVO: overlay escuro; clicar fora do card fecha o modal
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()} // NOVO: impede que clique dentro do card feche o modal
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}