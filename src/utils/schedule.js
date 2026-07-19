// Geração de dias e horários sem bibliotecas externas.
// Tudo é calculado com Date nativo — nenhum pacote de calendário instalado.

// Expediente por dia da semana (0 = domingo).
// Ajuste aqui quando a disponibilidade vier do banco (tabela de disponibilidade
// do doutor), sem precisar mexer nos componentes.
export const EXPEDIENTE = {
  0: null,               // domingo: fechado
  1: ['08:00', '18:00'],
  2: ['08:00', '18:00'],
  3: ['08:00', '18:00'],
  4: ['08:00', '18:00'],
  5: ['08:00', '18:00'],
  6: ['08:00', '12:00'], // sábado: meio período
}

export const INTERVALO_MIN = 30

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// 'YYYY-MM-DD' no fuso local (evita o deslocamento de toISOString em UTC)
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Próximos N dias a partir de hoje, já com rótulos prontos para exibição.
export function gerarDias(quantidade = 14, base = new Date()) {
  const inicio = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  const dias = []
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    dias.push({
      iso: toISODate(d),
      diaSemana: DIAS_CURTOS[d.getDay()],
      diaMes: d.getDate(),
      mes: MESES_CURTOS[d.getMonth()],
      aberto: EXPEDIENTE[d.getDay()] !== null,
      hoje: i === 0,
    })
  }
  return dias
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function paraHHMM(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0')
  const m = String(minutos % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Grade de horários de um dia, de INTERVALO_MIN em INTERVALO_MIN.
// Marca como indisponível o que já passou (se for hoje) e o que está ocupado.
export function gerarHorarios(dateISO, ocupados = [], agora = new Date()) {
  const [ano, mes, dia] = dateISO.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  const faixa = EXPEDIENTE[data.getDay()]
  if (!faixa) return []

  const ehHoje = toISODate(agora) === dateISO
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes()
  const ocupadosSet = new Set(ocupados)

  const inicio = paraMinutos(faixa[0])
  const fim = paraMinutos(faixa[1])
  const horarios = []

  for (let m = inicio; m < fim; m += INTERVALO_MIN) {
    const hora = paraHHMM(m)
    const passou = ehHoje && m <= minutosAgora
    horarios.push({
      hora,
      disponivel: !passou && !ocupadosSet.has(hora),
      motivo: passou ? 'passou' : ocupadosSet.has(hora) ? 'ocupado' : null,
    })
  }
  return horarios
}

// Junta dia + hora num instante absoluto (UTC) para gravar no banco.
//
// IMPORTANTE: a coluna scheduled_at é timestamptz. Se enviássemos a string
// solta '2026-07-20T09:30:00', o Postgres a interpretaria como UTC e o
// navegador exibiria 06:30 no Brasil. Convertendo para o instante real com
// toISOString(), 09:30 local continua sendo 09:30 na tela.
export function paraTimestamp(dateISO, hora) {
  const [ano, mes, dia] = dateISO.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  return new Date(ano, mes - 1, dia, h, m, 0).toISOString()
}

// Rótulo amigável: "Seg, 21 Jul às 09:30"
export function rotuloAgendamento(dateISO, hora) {
  const [ano, mes, dia] = dateISO.split('-').map(Number)
  const d = new Date(ano, mes - 1, dia)
  return `${DIAS_CURTOS[d.getDay()]}, ${dia} ${MESES_CURTOS[d.getMonth()]} às ${hora}`
}
