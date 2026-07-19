import { useMemo } from 'react'
import { useBookedTimes } from '../../hooks/usePatientData'
import { gerarDias, gerarHorarios } from '../../utils/schedule'
import { LoadingState } from '../ui'

// Seletor de dia + horário, sem biblioteca de calendário.
// A grade é calculada com useMemo, então só é refeita quando o dia
// selecionado ou a lista de ocupados mudam.
export default function SlotPicker({ clinicId, dateISO, hora, onChangeDate, onChangeHora }) {
  // Os próximos 14 dias são fixos durante a sessão — calculados uma única vez.
  const dias = useMemo(() => gerarDias(14), [])

  const { bookedTimes, loading } = useBookedTimes(clinicId, dateISO)

  const horarios = useMemo(
    () => (dateISO ? gerarHorarios(dateISO, bookedTimes) : []),
    [dateISO, bookedTimes]
  )

  return (
    <div>
      <div className="picker-label">Escolha o dia</div>
      <div className="day-strip">
        {dias.map((d) => (
          <button
            key={d.iso}
            type="button"
            className={`day-chip${d.iso === dateISO ? ' active' : ''}${d.aberto ? '' : ' closed'}`}
            disabled={!d.aberto}
            onClick={() => onChangeDate(d.iso)}
            title={d.aberto ? undefined : 'Fechado'}
          >
            <span className="day-chip-week">{d.hoje ? 'Hoje' : d.diaSemana}</span>
            <span className="day-chip-num">{d.diaMes}</span>
            <span className="day-chip-month">{d.mes}</span>
          </button>
        ))}
      </div>

      <div className="picker-label">Escolha o horário</div>
      {loading ? (
        <LoadingState label="Verificando disponibilidade..." />
      ) : horarios.length === 0 ? (
        <p className="picker-empty">Sem atendimento neste dia. Selecione outra data.</p>
      ) : (
        <div className="slot-grid">
          {horarios.map((h) => (
            <button
              key={h.hora}
              type="button"
              className={`slot${h.hora === hora ? ' active' : ''}`}
              disabled={!h.disponivel}
              onClick={() => onChangeHora(h.hora)}
              title={h.motivo === 'ocupado' ? 'Horário ocupado' : h.motivo === 'passou' ? 'Horário já passou' : undefined}
            >
              {h.hora}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
