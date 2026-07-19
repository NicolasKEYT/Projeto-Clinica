import { supabase } from '../lib/supabase'

// ========================================================================
// false = dados reais do Supabase. true = dados fictícios (protótipo).
// O login NÃO passa por aqui: ele é sempre real (ver AuthContext.jsx).
// ========================================================================
const USE_MOCK = false

// Fuso da clínica. Usado só na versão mock; a versão real resolve isso
// dentro da função horarios_ocupados no banco.
const MOCK_KEY = 'sigmasters-mock-appointments'

const MOCK = {
  currentUser: { id: 'uuid-paciente-123', name: 'Mariana Costa', email: 'mariana@email.com' },
  clinics: [
    { id: 'clinic-centro', name: 'Clínica SIGmasters - Unidade Centro', slug: 'sigmasters-centro', address: 'Rua Central, 100 - Centro', phone: '(11) 3000-0000', description: 'Estética e dermatologia no centro da cidade.' },
    { id: 'clinic-sul', name: 'Clínica SIGmasters - Unidade Sul', slug: 'sigmasters-sul', address: 'Av. Sul, 200 - Zona Sul', phone: '(11) 3000-1111', description: 'Unidade sul com foco em avaliação estética.' },
  ],
  procedures: [
    { id: 'p1', clinic_id: 'clinic-centro', name: 'Avaliação Estética', duration_min: 30, price_base: 150.0 },
    { id: 'p2', clinic_id: 'clinic-centro', name: 'Toxina Botulínica', duration_min: 45, price_base: 800.0 },
    { id: 'p3', clinic_id: 'clinic-centro', name: 'Peeling Químico', duration_min: 60, price_base: 350.0 },
    { id: 'p4', clinic_id: 'clinic-sul', name: 'Avaliação Estética', duration_min: 30, price_base: 180.0 },
    { id: 'p5', clinic_id: 'clinic-sul', name: 'Limpeza de Pele', duration_min: 40, price_base: 200.0 },
  ],
  // Status idênticos aos do banco: agendada / concluida / cancelada / falta
  appointmentsSeed: [
    { id: 102, date: '2025-10-15T14:00:00.000Z', procedure: 'Consulta de Rotina', doctor: 'Dra. Ana Silva', clinic: 'Unidade Centro', status: 'concluida' },
    { id: 103, date: '2025-08-10T10:00:00.000Z', procedure: 'Limpeza de Pele', doctor: 'Dr. Carlos Mendes', clinic: 'Unidade Sul', status: 'concluida' },
  ],
  photos: [
    { id: 201, treatment: 'Peeling Químico', date: 'Agosto 2025', url_before: 'signed-url-before-1', url_after: 'signed-url-after-1' },
    { id: 202, treatment: 'Avaliação Inicial', date: 'Janeiro 2025', url_before: 'signed-url-before-2', url_after: null },
  ],
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.')
  }
}

function lerMock() {
  try {
    const raw = localStorage.getItem(MOCK_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* segue com as sementes */ }
  return [...MOCK.appointmentsSeed]
}

function salvarMock(lista) {
  try { localStorage.setItem(MOCK_KEY, JSON.stringify(lista)) } catch { /* ignora */ }
}

// 1. Usuário logado ------------------------------------------------------
export async function getCurrentUser() {
  if (USE_MOCK) {
    await delay(150)
    return MOCK.currentUser
  }
  requireSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return { id: user.id, name: user.user_metadata?.full_name ?? user.email, email: user.email }
}

// 2. Clínicas da rede ----------------------------------------------------
export async function getClinics() {
  if (USE_MOCK) {
    await delay(200)
    return MOCK.clinics
  }
  requireSupabase()
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, slug, address, phone, description')
    .order('name')
  if (error) throw error
  return data
}

// 3. Procedimentos DE UMA clínica ----------------------------------------
// O filtro por clinic_id é obrigatório: a política RLS deixa o paciente ler o
// catálogo de todas as unidades (ele é cliente da rede), então é esta query
// que garante que ele veja apenas os da clínica aberta na tela.
export async function getProcedures(clinicId) {
  if (!clinicId) return []
  if (USE_MOCK) {
    await delay(250)
    return MOCK.procedures.filter((p) => p.clinic_id === clinicId)
  }
  requireSupabase()
  const { data, error } = await supabase
    .from('procedures')
    .select('id, name, duration_min, price_base')
    .eq('clinic_id', clinicId)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

// 4. Horários já ocupados no dia -----------------------------------------
// O paciente não pode ler as consultas de outros pacientes (a RLS bloqueia,
// e é correto). Por isso a consulta passa por uma função no banco, que
// devolve só os horários — sem revelar de quem são.
export async function getBookedTimes(clinicId, dateISO) {
  if (USE_MOCK) {
    await delay(200)
    const seed = dateISO.split('-').reduce((acc, n) => acc + Number(n), 0)
    return ['08:30', '09:00', '10:30', '13:00', '14:30', '16:00']
      .filter((_, i) => (seed + i) % 3 === 0)
  }
  requireSupabase()
  const { data, error } = await supabase.rpc('horarios_ocupados', {
    p_clinic_id: clinicId,
    p_dia: dateISO,
  })
  if (error) {
    // Se a função ainda não existe no banco, não trava a tela: apenas não
    // consegue marcar os horários ocupados (o banco ainda impede duplicidade
    // no momento de gravar, pelo índice único).
    console.warn('horarios_ocupados indisponível:', error.message)
    return []
  }
  return (data ?? []).map((r) => (typeof r === 'string' ? r : r.hora))
}

// 5. Consultas do paciente logado ----------------------------------------
export async function getAppointments(patientId) {
  if (USE_MOCK) {
    await delay(250)
    return [...lerMock()].sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  requireSupabase()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      valor_cobrado,
      procedure:procedures(name),
      doctor:doctors(full_name),
      clinic:clinics(name)
    `)
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })
  if (error) throw error

  // O Supabase devolve as relações aninhadas; achatamos para o formato que
  // os componentes já esperam.
  return (data ?? []).map((a) => ({
    id: a.id,
    date: a.scheduled_at,
    status: a.status,
    valor: a.valor_cobrado,
    procedure: a.procedure?.name ?? '—',
    doctor: a.doctor?.full_name ?? '—',
    clinic: a.clinic?.name ?? null,
  }))
}

// 6. Criar consulta ------------------------------------------------------
export async function createAppointment({ clinicId, patientId, procedureId, scheduledAt, valor }) {
  if (USE_MOCK) {
    await delay(400)
    const proc = MOCK.procedures.find((p) => p.id === procedureId)
    const clin = MOCK.clinics.find((c) => c.id === clinicId)
    const nova = {
      id: 'mock-' + Date.now(),
      date: scheduledAt,
      procedure: proc?.name ?? '—',
      doctor: clinicId === 'clinic-centro' ? 'Dr. Carlos Mendes' : 'Dra. Ana Silva',
      clinic: clin?.name ?? null,
      status: 'agendada',
      valor,
    }
    salvarMock([...lerMock(), nova])
    return nova
  }

  requireSupabase()

  // Atribui um doutor da clínica escolhida. Hoje há um por unidade; quando
  // houver vários, esta é a linha que passa a considerar a disponibilidade.
  const { data: doutor } = await supabase
    .from('doctors')
    .select('id')
    .eq('clinic_id', clinicId)
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      procedure_id: procedureId,
      doctor_id: doutor?.id ?? null,
      scheduled_at: scheduledAt,
      valor_cobrado: valor, // congela o preço praticado no agendamento
      status: 'agendada',
    })
    .select()
    .single()

  if (error) {
    // 23505 = violação do índice único (doctor_id, scheduled_at):
    // alguém reservou esse horário entre a exibição da grade e o clique.
    if (error.code === '23505') {
      throw new Error('Esse horário acabou de ser reservado. Escolha outro, por favor.')
    }
    throw error
  }
  return data
}

// 7. Fotos clínicas ------------------------------------------------------
export async function getPhotos(patientId) {
  if (USE_MOCK) {
    await delay(250)
    return MOCK.photos
  }
  requireSupabase()
  const { data: rows, error } = await supabase
    .from('clinical_photos')
    .select('id, treatment, taken_at, path_before, path_after')
    .eq('patient_id', patientId)
  if (error) throw error
  return Promise.all(
    (rows ?? []).map(async (row) => ({
      id: row.id,
      treatment: row.treatment,
      date: row.taken_at,
      url_before: await createSignedUrl(row.path_before),
      url_after: row.path_after ? await createSignedUrl(row.path_after) : null,
    }))
  )
}

async function createSignedUrl(path) {
  const { data, error } = await supabase.storage
    .from('clinical_photos')
    .createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}
