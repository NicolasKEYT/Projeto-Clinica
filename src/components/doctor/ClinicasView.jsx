import { useState } from 'react'
import { useDoctorClinics } from '../../hooks/useDoctorData'
import { createClinic, deleteClinic } from '../../services/doctorService'
import { LoadingState, Modal, ConfirmDialog, useToast } from '../ui'
import { maskCNPJ, maskPhone } from '../../utils/format'
import { isValidCNPJ, isValidPhone } from '../../utils/validation'

const EMPTY_FORM = { name: '', cnpj: '', phone: '', address: '', description: '' }

// Formulário de cadastro de clínica, dentro do Modal
function ClinicFormModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleChange(field, value) {
  setForm((current) => ({ ...current, [field]: value }))
  }

  // NOVO: aplica a máscara de CNPJ em tempo real
  function handleCnpjChange(value) {
    setForm((current) => ({ ...current, cnpj: maskCNPJ(value) }))
  }

  // NOVO: aplica a máscara de telefone em tempo real
  function handlePhoneChange(value) {
    setForm((current) => ({ ...current, phone: maskPhone(value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
  setError('Informe o nome da clínica.')
  return
  }
  // ALTERADO: agora valida o CNPJ de verdade (dígito verificador), não só se está preenchido
  if (!isValidCNPJ(form.cnpj)) {
    setError('Informe um CNPJ válido.')
    return
  }
  // ALTERADO: agora exige quantidade correta de dígitos (10 ou 11, com DDD)
  if (!isValidPhone(form.phone)) {
    setError('Informe um telefone válido, com DDD.')
    return
  }
  if (!form.address.trim()) {
    setError('Informe o endereço.')
    return
  }

    setError(null)
    setSaving(true)
    try {
      await createClinic(form)
      onCreated()
    } catch (err) {
      setError(err.message ?? 'Não foi possível salvar a clínica.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Nova Clínica" onClose={onClose}>
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
          CNPJ
          <input
            type="text"
            inputMode="numeric" // NOVO: sugere teclado numérico em celulares
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => handleCnpjChange(e.target.value)} // ALTERADO: usa o handler com máscara
            maxLength={18} // NOVO: tamanho máximo do CNPJ já mascarado
          />
        </label>

        <label>
          Telefone
          <input
            type="text"
            inputMode="numeric" // NOVO
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)} // ALTERADO: usa o handler com máscara
            maxLength={15} // NOVO: tamanho máximo do telefone já mascarado
          />
        </label>

        <label>
          Endereço
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </label>

        <label>
          Descrição
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
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

export default function ClinicasView() {
  const { clinics, loading, refetch } = useDoctorClinics()
  const { show } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [deletingClinic, setDeletingClinic] = useState(null) // clínica marcada para exclusão (ou null)
  const [deleting, setDeleting] = useState(false)

  function handleCreated() {
    setShowCreate(false)
    refetch()
    show('Clínica adicionada com sucesso.')
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await deleteClinic(deletingClinic.id)
      setDeletingClinic(null)
      refetch()
      show('Clínica removida com sucesso.')
    } catch (err) {
      show(err.message ?? 'Não foi possível remover a clínica.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Clínicas</h1>
          <p>Gerencie as clínicas onde você atende</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + Clínica
        </button>
      </header>

      <div className="section-box">
        <div className="list-item admin-grid list-header">
          <span>Nome</span>
          <span>CNPJ</span>
          <span>Telefone</span>
          <span>Endereço</span>
          <span className="actions-col">Ações</span>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          clinics.map((c) => (
            <div className="list-item admin-grid" key={c.id}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.cnpj}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.phone}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.address}</span>
              <div className="actions-col">
                <button className="action-link" onClick={() => setDeletingClinic(c)}>
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <ClinicFormModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      {deletingClinic && (
        <ConfirmDialog
          title="Excluir Clínica"
          message={`Tem certeza que deseja excluir "${deletingClinic.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingClinic(null)}
        />
      )}
    </section>
  )
}