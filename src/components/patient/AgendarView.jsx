import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useClinics, useProcedures } from '../../hooks/usePatientData'
import { createAppointment } from '../../services/patientService'
import { formatPrice } from '../../utils/format'
import { paraTimestamp, rotuloAgendamento } from '../../utils/schedule'
import { LoadingState, useToast } from '../ui'
import SlotPicker from './SlotPicker'

function EtapaTitulo({ numero, texto, extra }) {
  return (
    <div className="section-title">
      <span>{numero}. {texto}</span>
      {extra}
    </div>
  )
}

export default function AgendarView() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { show } = useToast()

  const [clinicId, setClinicId] = useState(null)
  const [procedureId, setProcedureId] = useState(null)
  const [dateISO, setDateISO] = useState(null)
  const [hora, setHora] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const { clinics, loading: loadingClinics } = useClinics()
  const { procedures, loading: loadingProcs } = useProcedures(clinicId)

  const clinicaSelecionada = clinics.find((c) => c.id === clinicId)
  const procedimentoSelecionado = procedures.find((p) => p.id === procedureId)
  const podeConfirmar = Boolean(clinicId && procedureId && dateISO && hora)

  // Trocar de clínica invalida as escolhas seguintes.
  function escolherClinica(id) {
    setClinicId(id)
    setProcedureId(null)
    setDateISO(null)
    setHora(null)
  }

  // Trocar de procedimento invalida o horário (a duração pode ser outra).
  function escolherProcedimento(id) {
    setProcedureId(id)
    setHora(null)
  }

  async function confirmar() {
    setSalvando(true)
    try {
      await createAppointment({
        clinicId,
        patientId: user?.id,
        procedureId,
        scheduledAt: paraTimestamp(dateISO, hora),
        valor: procedimentoSelecionado?.price_base,
      })
      show(`Consulta agendada para ${rotuloAgendamento(dateISO, hora)}.`)
      setProcedureId(null)
      setDateISO(null)
      setHora(null)
      // Leva para o início, onde a nova consulta já aparece como próxima.
      navigate('/paciente')
    } catch (e) {
      show('Não foi possível agendar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Agendar Consulta</h1>
          <p>Escolha a clínica, o procedimento e o horário.</p>
        </div>
      </header>

      {/* Etapa 1 — Clínica */}
      <div className="section-box">
        <EtapaTitulo
          numero="1"
          texto="Escolha a clínica"
          extra={
            clinicId && (
              <button className="link-btn" onClick={() => escolherClinica(null)}>
                Alterar
              </button>
            )
          }
        />

        {loadingClinics ? (
          <LoadingState />
        ) : clinicId ? (
          <div className="clinic-selected">
            <div>
              <strong className="clinic-selected-name">{clinicaSelecionada?.name}</strong>
              <span className="clinic-selected-address">{clinicaSelecionada?.address}</span>
            </div>
            <span className="clinic-check">✓ Selecionada</span>
          </div>
        ) : (
          <div className="clinic-grid">
            {clinics.map((c) => (
              <button
                key={c.id}
                type="button"
                className="clinic-card"
                onClick={() => escolherClinica(c.id)}
              >
                <h4>{c.name}</h4>
                <p className="clinic-card-desc">{c.description}</p>
                <div className="clinic-card-meta">
                  <span>📍 {c.address}</span>
                  <span>📞 {c.phone}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Etapa 2 — Procedimento */}
      <div className={`section-box${clinicId ? '' : ' muted-box'}`}>
        <EtapaTitulo numero="2" texto="Escolha o procedimento" />
        {!clinicId ? (
          <p className="picker-empty">Selecione uma clínica para ver os procedimentos.</p>
        ) : loadingProcs ? (
          <LoadingState />
        ) : procedures.length === 0 ? (
          <p className="picker-empty">Esta clínica ainda não tem procedimentos cadastrados.</p>
        ) : (
          <div className="grid-cards">
            {procedures.map((p) => (
              <div
                key={p.id}
                className={`select-card${p.id === procedureId ? ' active' : ''}`}
                onClick={() => escolherProcedimento(p.id)}
              >
                <h4>{p.name}</h4>
                <p>{p.duration_min} min • {formatPrice(p.price_base)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Etapa 3 — Horário */}
      <div className={`section-box${procedureId ? '' : ' muted-box'}`}>
        <EtapaTitulo numero="3" texto="Escolha o horário" />
        {!procedureId ? (
          <p className="picker-empty">Selecione um procedimento para ver os horários.</p>
        ) : (
          <SlotPicker
            clinicId={clinicId}
            dateISO={dateISO}
            hora={hora}
            onChangeDate={(iso) => {
              setDateISO(iso)
              setHora(null)
            }}
            onChangeHora={setHora}
          />
        )}
      </div>

      {/* Resumo + confirmação */}
      {podeConfirmar && (
        <div className="summary-card">
          <div>
            <span className="summary-label">Resumo do agendamento</span>
            <strong className="summary-main">
              {procedimentoSelecionado?.name} — {rotuloAgendamento(dateISO, hora)}
            </strong>
            <span className="summary-sub">
              {clinicaSelecionada?.name} • {formatPrice(procedimentoSelecionado?.price_base)}
            </span>
          </div>
        </div>
      )}

      <button className="btn-primary" disabled={!podeConfirmar || salvando} onClick={confirmar}>
        {salvando ? 'Agendando...' : 'Confirmar agendamento'}
      </button>
    </section>
  )
}
