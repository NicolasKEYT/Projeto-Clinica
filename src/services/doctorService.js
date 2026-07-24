import { supabase } from '../lib/supabase'

// ========================================================================
// Área do doutor — tudo ligado ao Supabase.
//
// Modelo de procedimentos: cada procedimento pertence a UMA clínica e tem
// preço próprio. O mesmo serviço oferecido em duas unidades vira duas
// linhas, uma para cada, com o preço de cada uma.
//
// O clinic_id NÃO é enviado pelo frontend: o banco preenche sozinho com a
// clínica do doutor logado (DEFAULT current_clinic_id()). Isso evita que a
// tela possa, por engano, cadastrar na clínica errada.
// ========================================================================

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha o .env com as chaves do projeto.')
  }
}

// ======================= AGENDA / MÉTRICAS / PACIENTES =======================

// Métricas do dashboard — função dashboard_metrics() no banco.
export async function getDashboardMetrics() {
  requireSupabase()
  const { data, error } = await supabase.rpc('dashboard_metrics')
  if (error) throw error
  const m = Array.isArray(data) ? data[0] : data
  return {
    patientsToday: Number(m?.patients_today ?? 0),
    revenueToday: Number(m?.revenue_today ?? 0),
    averageTicket: Number(m?.average_ticket ?? 0),
    noShows: Number(m?.no_shows ?? 0),
    revenueSeries: [], // série de 7 dias fica para uma etapa futura
  }
}

// Agenda do dia — função agenda_hoje() no banco.
export async function getTodaySchedule() {
  requireSupabase()
  const { data, error } = await supabase.rpc('agenda_hoje')
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    time: r.hora,
    patient: r.paciente,
    procedure: r.procedimento,
    status: r.status,
  }))
}

// Avança o status de uma consulta (botões da agenda).
export async function updateAppointmentStatus(id, status) {
  requireSupabase()
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Pacientes da clínica — função pacientes_da_clinica().
export async function getPatients(search = '') {
  requireSupabase()
  const { data, error } = await supabase.rpc('pacientes_da_clinica', { p_busca: search ?? '' })
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.full_name,
    cpf: r.cpf_mascara,
    phone: r.phone ?? '—',
    lastVisit: r.ultima ? new Date(r.ultima).toLocaleDateString('pt-BR') : '—',
  }))
}

// ============================ PROCEDIMENTOS ============================

// A RLS já limita o resultado à clínica do doutor logado, inclusive os
// inativos — não é preciso filtrar por clinic_id aqui.
export async function getProcedures() {
  requireSupabase()
  const { data, error } = await supabase
    .from('procedures')
    .select('id, name, duration_min, price_base, active, clinic_id')
    .order('name')
  if (error) throw error

  // clinic_ids (array) é mantido por compatibilidade com a listagem atual da
  // tela, que exibe o nome da clínica vinculada. Pode ser removido quando o
  // formulário deixar de usar seleção múltipla.
  return (data ?? []).map((p) => ({ ...p, clinic_ids: p.clinic_id ? [p.clinic_id] : [] }))
}

export async function createProcedure(procedure) {
  requireSupabase()
  const { data, error } = await supabase
    .from('procedures')
    .insert({
      name: procedure.name.trim(),
      duration_min: Number(procedure.duration_min),
      price_base: Number(procedure.price_base),
      active: procedure.active ?? true,
      // clinic_id omitido de propósito: o banco preenche com a clínica do doutor.
    })
    .select()
    .single()
  if (error) throw error
  return { ...data, clinic_ids: data.clinic_id ? [data.clinic_id] : [] }
}

export async function updateProcedure(id, updates) {
  requireSupabase()
  const { data, error } = await supabase
    .from('procedures')
    .update({
      name: updates.name.trim(),
      duration_min: Number(updates.duration_min),
      price_base: Number(updates.price_base),
      active: updates.active ?? true,
      // clinic_id nunca é alterado: um procedimento não muda de clínica.
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { ...data, clinic_ids: data.clinic_id ? [data.clinic_id] : [] }
}

// Excluir um procedimento que já foi usado em consultas apaga o nome dele do
// histórico dos pacientes (a consulta fica sem procedimento, só com o valor).
// Por isso: se houver consultas, o procedimento é DESATIVADO em vez de
// excluído — some das opções de agendamento e o histórico fica preservado.
export async function deleteProcedure(id) {
  requireSupabase()

  const { count, error: countError } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('procedure_id', id)
  if (countError) throw countError

  if (count && count > 0) {
    const { error } = await supabase.from('procedures').update({ active: false }).eq('id', id)
    if (error) throw error
    return {
      deleted: false,
      deactivated: true,
      appointments: count,
      message: `Este procedimento já foi usado em ${count} consulta(s), então foi desativado em vez de excluído. Ele some das opções de agendamento e o histórico dos pacientes fica preservado.`,
    }
  }

  const { error } = await supabase.from('procedures').delete().eq('id', id)
  if (error) throw error
  return { deleted: true, deactivated: false, message: 'Procedimento excluído.' }
}

// ============================== CLÍNICAS ==============================

export async function getClinics() {
  requireSupabase()
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, cnpj, phone, address, description')
    .order('name')
  if (error) throw error
  return data ?? []
}

// Criar e excluir clínica são operações de administração da rede. As
// políticas atuais não dão essa permissão ao doutor, então o banco recusa.
// Se a rede passar a ter um perfil administrativo, é aqui (e na RLS) que
// isso será liberado.
export async function createClinic(clinic) {
  requireSupabase()
  const { data, error } = await supabase
    .from('clinics')
    .insert({
      name: clinic.name.trim(),
      cnpj: clinic.cnpj.trim(),
      phone: clinic.phone.trim(),
      address: clinic.address.trim(),
      description: clinic.description.trim(),
    })
    .select()
    .single()
  if (error) {
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      throw new Error('Cadastro de clínicas é uma operação da administração da rede e não está liberado para o perfil de doutor.')
    }
    throw error
  }
  return data
}

export async function deleteClinic(id) {
  requireSupabase()
  const { error } = await supabase.from('clinics').delete().eq('id', id)
  if (error) {
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      throw new Error('Exclusão de clínicas é uma operação da administração da rede e não está liberada para o perfil de doutor.')
    }
    throw error
  }
  return true
}
