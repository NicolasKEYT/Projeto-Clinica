import { useState } from 'react'
import { useDoctorProcedures, useDoctorClinics } from '../../hooks/useDoctorData'
import { createProcedure, updateProcedure, deleteProcedure } from '../../services/doctorService' // ALTERADO: deleteProcedure adicionado
import { formatPrice } from '../../utils/format'
import { LoadingState, Modal, MultiSelectDropdown, ConfirmDialog, useToast } from '../ui' // ALTERADO: ConfirmDialog adicionado

const EMPTY_FORM = { name: '', duration_min: '', price_base: '', active: true, clinic_ids: [] }

function ProcedureFormModal({ procedure, onClose, onSaved }) {
  const isEditing = Boolean(procedure)
  const { clinics } = useDoctorClinics()

  const [form, setForm] = useState(
    procedure
      ? {
          name: procedure.name,
          duration_min: procedure.duration_min,
          price_base: procedure.price_base,
          active: procedure.active,
          clinic_ids: procedure.clinic_ids ?? [],
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleToggleClinic(clinicId) {
    setForm((current) => {
      const alreadySelected = current.clinic_ids.includes(clinicId)
      return {
        ...current,
        clinic_ids: alreadySelected
          ? current.clinic_ids.filter((id) => id !== clinicId)
          : [...current.clinic_ids, clinicId],
      }
    })
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
      if (isEditing) {
        await updateProcedure(procedure.id, form)
      } else {
        await createProcedure(form)
      }
      onSaved(isEditing)
    } catch (err) {
      setError(err.message ?? 'Não foi possível salvar o procedimento.')
    } finally {
      setSaving(false)
    }
  }

  return (
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

        <MultiSelectDropdown
          label="Clínicas"
          options={clinics.map((c) => ({ id: c.id, label: c.name }))}
          selectedIds={form.clinic_ids}
          onToggle={handleToggleClinic}
          placeholder="Selecione as clínicas"
        />

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
  const [showCreate, setShowCreate] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState(null)
  const [deletingProcedure, setDeletingProcedure] = useState(null) // NOVO: procedimento marcado para exclusão (ou null)
  const [deleting, setDeleting] = useState(false) // NOVO: estado de carregamento da exclusão

  function handleSaved(wasEditing) {
    setShowCreate(false)
    setEditingProcedure(null)
    refetch()
    show(wasEditing ? 'Procedimento atualizado com sucesso.' : 'Procedimento adicionado com sucesso.')
  }

  function handleCloseModal() {
    setShowCreate(false)
    setEditingProcedure(null)
  }

  // NOVO: confirma e executa a exclusão do procedimento
  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await deleteProcedure(deletingProcedure.id)
      setDeletingProcedure(null)
      refetch()
      show('Procedimento removido com sucesso.')
    } catch (err) {
      show(err.message ?? 'Não foi possível remover o procedimento.')
    } finally {
      setDeleting(false)
    }
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
                <button className="action-link" onClick={() => setEditingProcedure(p)}>
                  Editar
                </button>
                {/* NOVO: botão de lixeira, abre a confirmação de exclusão */}
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => setDeletingProcedure(p)}
                  aria-label={`Excluir ${p.name}`}
                  title="Excluir"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {(showCreate || editingProcedure) && (
        <ProcedureFormModal
          procedure={editingProcedure}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {/* NOVO: confirmação antes de excluir um procedimento */}
      {deletingProcedure && (
        <ConfirmDialog
          title="Excluir Procedimento"
          message={`Tem certeza que deseja excluir "${deletingProcedure.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingProcedure(null)}
        />
      )}
    </section>
  )
}