// Vocabulário único de status, igual ao do banco (schema.sql):
//   check (status in ('agendada','confirmada','em_andamento','concluida','cancelada','falta'))
// A interface usa exatamente esses valores para não precisar traduzir nada.

export const STATUS_LABELS = {
  agendada: 'Agendado',
  confirmada: 'Confirmado',
  em_andamento: 'Em andamento',
  concluida: 'Realizada',
  cancelada: 'Cancelada',
  falta: 'Falta',
}

// Consultas que ainda vão acontecer.
const FUTUROS = new Set(['agendada', 'confirmada', 'em_andamento'])

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

export function isFuturo(status) {
  return FUTUROS.has(status)
}

// A "próxima consulta": a mais próxima de agora entre as que ainda vão ocorrer.
export function proximaConsulta(appointments, agora = Date.now()) {
  return appointments
    .filter((a) => isFuturo(a.status) && new Date(a.date).getTime() >= agora)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
}

// Consultas já realizadas, da mais recente para a mais antiga.
export function consultasRealizadas(appointments) {
  return appointments
    .filter((a) => a.status === 'concluida')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}
