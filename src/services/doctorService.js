import { supabase } from '../lib/supabase'

// Mesma chave de transição da área do paciente.
const USE_MOCK = true

const MOCK = {
  metrics: { patientsToday: 14, waitingReception: 3, completedToday: 5 },
  todaySchedule: [
    { id: 'a1', time: '08:00', patient: 'Carlos Silva', procedure: 'Consulta', status: 'done' },
    { id: 'a2', time: '09:30', patient: 'Mariana Costa', procedure: 'Avaliação', status: 'done' },
    { id: 'a3', time: '10:45', patient: 'Roberto Alves', procedure: 'Retorno', status: 'waiting' },
  ],
  procedures: [],
  patients: [
    { id: 'p1', name: 'Ana Beatriz Lima', cpf: '123.***.***-00', lastVisit: 'Hoje', phone: '(11) 98765-4321' },
    { id: 'p2', name: 'Mariana Costa', cpf: '456.***.***-22', lastVisit: 'Hoje', phone: '(21) 99999-8888' },
  ],
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha o .env ou mantenha USE_MOCK = true.')
  }
}

// Métricas do dashboard (no Supabase, use uma view ou RPC de agregação)
export async function getDashboardMetrics() {
  if (USE_MOCK) {
    await delay(200)
    return MOCK.metrics
  }
  requireSupabase()
  // const { data, error } = await supabase.rpc('dashboard_metrics')
  // if (error) throw error
  // return data
}

// Agenda de hoje (todos os pacientes do doutor)
export async function getTodaySchedule() {
  if (USE_MOCK) {
    await delay(250)
    return MOCK.todaySchedule
  }
  requireSupabase()
  // const today = new Date().toISOString().slice(0, 10)
  // const { data, error } = await supabase.from('appointments')
  //   .select('id, date, status, patient:patients(name), procedure:procedures(name)')
  //   .gte('date', today + 'T00:00:00').lte('date', today + 'T23:59:59')
  //   .order('date')
  // if (error) throw error
  // return data.map(...) // achatar para { id, time, patient, procedure, status }
}

// Procedimentos — doutor vê todos, inclusive inativos
export async function getProcedures() {
  if (USE_MOCK) {
    await delay(200)
    return MOCK.procedures
  }
  requireSupabase()
  // const { data, error } = await supabase.from('procedures')
  //   .select('id, name, duration_min, price_base, active').order('name')
  // if (error) throw error
  // return data
}

// Lista de pacientes com busca
export async function getPatients(search = '') {
  if (USE_MOCK) {
    await delay(250)
    const term = search.trim().toLowerCase()
    if (!term) return MOCK.patients
    return MOCK.patients.filter(
      (p) => p.name.toLowerCase().includes(term) || p.cpf.includes(term)
    )
  }
  requireSupabase()
  // let query = supabase.from('patients').select('id, name, cpf, phone, last_visit')
  // if (search) query = query.ilike('name', '%' + search + '%')
  // const { data, error } = await query
  // if (error) throw error
  // return data
}

// NOVO: cria um novo procedimento (usado pelo formulário do modal em ProcedimentosView)
export async function createProcedure(procedure) {
  if (USE_MOCK) {
    await delay(200)
    const newProcedure = {
      id: Date.now(),
      name: procedure.name.trim(),
      duration_min: Number(procedure.duration_min),
      price_base: Number(procedure.price_base),
      active: procedure.active ?? true,
    }
    MOCK.procedures.push(newProcedure) // NOVO: insere no mock em memória pra refletir na lista após o refetch
    return newProcedure
  }
  requireSupabase()
  // const { data, error } = await supabase.from('procedures').insert({
  //   name: procedure.name.trim(),
  //   duration_min: Number(procedure.duration_min),
  //   price_base: Number(procedure.price_base),
  //   active: procedure.active ?? true,
  // }).select().single()
  // if (error) throw error
  // return data
}

  // NOVO: atualiza um procedimento existente
export async function updateProcedure(id, updates) {
  if (USE_MOCK) {
    await delay(200)
    const index = MOCK.procedures.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('Procedimento não encontrado.')
    }
    const updated = {
      ...MOCK.procedures[index],
      name: updates.name.trim(),
      duration_min: Number(updates.duration_min),
      price_base: Number(updates.price_base),
      active: updates.active ?? true,
    }
    MOCK.procedures[index] = updated // NOVO: substitui o item no array mock
    return updated
  }
  requireSupabase()
  // const { data, error } = await supabase.from('procedures').update({
  //   name: updates.name.trim(),
  //   duration_min: Number(updates.duration_min),
  //   price_base: Number(updates.price_base),
  //   active: updates.active ?? true,
  // }).eq('id', id).select().single()
  // if (error) throw error
  // return data
  }

