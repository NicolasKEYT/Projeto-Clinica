import { useState } from 'react'
import { useDoctorProcedures } from '../../hooks/useDoctorData'
import { createProcedure, updateProcedure } from '../../services/doctorService' // ALTERADO: updateProcedure adicionado
import { formatPrice } from '../../utils/format'
import { LoadingState, Modal, useToast } from '../ui'

const EMPTY_FORM = { name: '', duration_min: '', price_base: '', active: true }

// ALTERADO: agora aceita uma prop opcional `procedure` — se vier preenchida, o modal entra em modo de edição
function ProcedureFormModal({ procedure, onClose, onSaved }) {
  const isEditing = Boolean(procedure) // NOVO

  // NOVO: se `procedure` foi passado, usa os dados dele como valor inicial do formulário
  const [form, setForm] = useState(
    procedure
      ? {
          name: procedure.name,
          duration_min: procedure.duration_min,
          price_base: procedure.price_base,
          active: procedure.active,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe o nome do procedimento.')
      return
    }
    if (!form.duration_min || Number(form.duration_min) <= 0) {
      setError('Informe uma duração válida.')
      return
    }
    if (form.price_base === '' || Number(form.price_base) < 0) {
      setError('Informe um valor base válido.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      // ALTERADO: decide entre criar ou atualizar, dependendo do modo do modal
      if (isEditing) {
        await updateProcedure(procedure.id, form)
      } else {
        await createProcedure(form)
      }
      onSaved(isEditing) // ALTERADO: informa ao pai se foi uma edição ou criação, pra customizar o toast
    } catch (err) {
      setError(err.message ?? 'Não foi possível salvar o procedimento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // ALTERADO: título muda conforme o modo
    <Modal title={isEditing ? 'Editar Procedimento' : 'Novo Procedimento'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Nome
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            autoFocus
          />
        </label>

        <label>
          Duração (min)
          <input
            type="number"
            min="1"
            value={form.duration_min}
            onChange={(e) => handleChange('duration_min', e.target.value)}
          />
        </label>

        <label>
          Valor Base (R$)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price_base}
            onChange={(e) => handleChange('price_base', e.target.value)}
          />
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => handleChange('active', e.target.checked)}
          />
          Ativo
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProcedimentosView() {
  const { procedures, loading, refetch } = useDoctorProcedures()
  const { show } = useToast()
  const [showCreate, setShowCreate] = useState(false) // ALTERADO: antes era `modalOpen`, renomeado pra deixar claro que é só do fluxo de criação
  const [editingProcedure, setEditingProcedure] = useState(null) // NOVO: guarda o procedimento sendo editado (ou null)

  // ALTERADO: renomeado de handleCreated pra handleSaved, cobre criação e edição
  function handleSaved(wasEditing) {
    setShowCreate(false)
    setEditingProcedure(null)
    refetch()
    show(wasEditing ? 'Procedimento atualizado com sucesso.' : 'Procedimento adicionado com sucesso.') // NOVO: mensagem varia conforme o caso
  }

  // NOVO: fecha o modal independente de qual dos dois estados estava aberto
  function handleCloseModal() {
    setShowCreate(false)
    setEditingProcedure(null)
  }

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Tipos de Consulta</h1>
          <p>Gerencie procedimentos e valores</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + Procedimento
        </button>
      </header>

      <div className="section-box">
        <div className="list-item admin-grid list-header">
          <span>Procedimento</span>
          <span>Duração</span>
          <span>Valor Base</span>
          <span>Status</span>
          <span className="actions-col">Ações</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          procedures.map((p) => (
            <div className="list-item admin-grid" key={p.id}>
              <span>{p.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.duration_min} min</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatPrice(p.price_base)}</span>
              <span>
                {p.active ? (
                  <span className="status active-tag">Ativo</span>
                ) : (
                  <span className="status" style={{ color: 'var(--text-muted)' }}>Inativo</span>
                )}
              </span>
              <div className="actions-col">
                {/* ALTERADO: agora abre o modal de edição em vez de só mostrar um toast */}
                <button className="action-link" onClick={() => setEditingProcedure(p)}>
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ALTERADO: um único modal cobre os dois fluxos — cria quando showCreate é true, edita quando editingProcedure tem valor */}
      {(showCreate || editingProcedure) && (
        <ProcedureFormModal
          procedure={editingProcedure}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}
    </section>
  )
}