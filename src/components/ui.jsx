import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
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

  // NOVO: modal de confirmação genérico, usado antes de ações destrutivas (como excluir)
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// NOVO: dropdown de seleção múltipla (usado para vincular procedimentos a várias clínicas)
export function MultiSelectDropdown({ label, options, selectedIds, onToggle, placeholder = 'Selecione' }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // NOVO: fecha o dropdown ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const summary =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === 1
      ? options.find((o) => o.id === selectedIds[0])?.label ?? '1 selecionada'
      : `${selectedIds.length} clínicas selecionadas`

  return (
    <div className="multiselect" ref={containerRef}>
      {label && <span className="field-label">{label}</span>}
      <button
        type="button"
        className="multiselect-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedIds.length === 0 ? 'multiselect-placeholder' : ''}>
          {summary}
        </span>
        <span className="multiselect-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="multiselect-panel">
          {options.length === 0 ? (
            <p className="field-hint">Nenhuma clínica cadastrada ainda.</p>
          ) : (
            options.map((option) => {
              const selected = selectedIds.includes(option.id)
              return (
                <label
                  key={option.id}
                  className={`multiselect-option${selected ? ' selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      onToggle(option.id) // ALTERADO: marca/desmarca a clínica
                      setOpen(false) // NOVO: fecha o painel automaticamente após a escolha
                    }}
                    className="visually-hidden"
                  />
                  <span>{option.label}</span>
                  {selected && <span className="multiselect-check">✓</span>}
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}