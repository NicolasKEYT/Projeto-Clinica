import { useState } from 'react'
import { useDashboardMetrics, useTodaySchedule } from '../../hooks/useDoctorData'
import { updateAppointmentStatus } from '../../services/doctorService'
import { formatMoney } from '../../utils/format'
import { statusLabel } from '../../utils/status'
import { LoadingState, useToast } from '../ui'

// Máquina de estados da consulta, do ponto de vista do doutor.
// Cada status atual define quais ações ficam disponíveis na linha da agenda.
const ACOES_POR_STATUS = {
  agendada: [
    { label: 'Confirmar', status: 'confirmada' },
    { label: 'Falta', status: 'falta', discreto: true },
  ],
  confirmada: [
    { label: 'Iniciar', status: 'em_andamento' },
    { label: 'Falta', status: 'falta', discreto: true },
  ],
  em_andamento: [
    { label: 'Concluir', status: 'concluida' },
  ],
  concluida: [],
  cancelada: [],
  falta: [],
}

function LinhaAgenda({ item, onMudarStatus, ocupado }) {
  const acoes = ACOES_POR_STATUS[item.status] ?? []

  return (
    <div className="list-item agenda-grid">
      <span style={{ color: 'var(--text-muted)' }}>{item.time}</span>
      <span>{item.patient}</span>
      <span style={{ color: 'var(--text-muted)' }}>{item.procedure}</span>
      <span className={`status ${item.status}`}>{statusLabel(item.status)}</span>
      <div className="actions-col">
        {acoes.map((acao) => (
          <button
            key={acao.status}
            className={acao.discreto ? 'btn-mini ghost' : 'btn-mini'}
            disabled={ocupado}
            onClick={() => onMudarStatus(item.id, acao.status, acao.label)}
          >
            {acao.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DashboardView() {
  const { metrics, refetch: recarregarMetricas } = useDashboardMetrics()
  const { schedule, loading, refetch: recarregarAgenda } = useTodaySchedule()
  const { show } = useToast()
  const [salvando, setSalvando] = useState(false)

  async function mudarStatus(id, novoStatus, rotulo) {
    setSalvando(true)
    try {
      await updateAppointmentStatus(id, novoStatus)
      show(`Consulta atualizada: ${rotulo}.`)
      // Recarrega agenda e métricas — o faturamento muda quando conclui.
      recarregarAgenda()
      recarregarMetricas()
    } catch (e) {
      show('Não foi possível atualizar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Dashboard Gerencial e Financeiro</h1>
          <p>Visão geral da clínica, faturamento e atendimentos</p>
        </div>
        <button className="btn" onClick={() => { recarregarAgenda(); recarregarMetricas() }}>
          Atualizar
        </button>
      </header>

      <div className="metrics-grid cols-4">
        <div className="card">
          <span className="card-title">Pacientes do Dia</span>
          <span className="card-value">{metrics?.patientsToday ?? '—'}</span>
        </div>
        <div className="card">
          <span className="card-title">Faturamento (Hoje)</span>
          <span className="card-value" style={{ color: '#4CAF50' }}>
            {metrics ? formatMoney(metrics.revenueToday) : '—'}
          </span>
        </div>
        <div className="card">
          <span className="card-title">Ticket Médio</span>
          <span className="card-value">{metrics ? formatMoney(metrics.averageTicket) : '—'}</span>
        </div>
        <div className="card">
          <span className="card-title">No-Shows (Faltas)</span>
          <span className="card-value" style={{ color: '#ef4444' }}>
            {metrics?.noShows ?? '—'}
          </span>
        </div>
      </div>

      <div className="section-box">
        <div className="section-title">
          <span>Agenda de Hoje</span>
        </div>
        <div className="list-item agenda-grid list-header">
          <span>Horário</span>
          <span>Paciente</span>
          <span>Procedimento</span>
          <span>Status</span>
          <span className="actions-col">Ações</span>
        </div>

        {loading ? (
          <LoadingState />
        ) : schedule.length === 0 ? (
          <p className="picker-empty" style={{ paddingTop: 16 }}>
            Nenhuma consulta agendada para hoje.
          </p>
        ) : (
          schedule.map((item) => (
            <LinhaAgenda
              key={item.id}
              item={item}
              ocupado={salvando}
              onMudarStatus={mudarStatus}
            />
          ))
        )}
      </div>
    </section>
  )
}
