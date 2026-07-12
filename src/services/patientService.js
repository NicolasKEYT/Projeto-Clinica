import { supabase } from '../lib/supabase'

// ========================================================================
// CHAVE DA TRANSIÇÃO: mantenha true enquanto não há backend.
// Ao ligar o Supabase, mude para false. Os componentes NÃO mudam.
// ========================================================================
const USE_MOCK = true

const MOCK = {
  currentUser: { id: 'uuid-paciente-123', name: 'Mariana Costa', email: 'mariana@email.com' },
  procedures: [
    { id: 1, name: 'Avaliação Estética', duration_min: 30, price_base: 150.0 },
    { id: 2, name: 'Toxina Botulínica', duration_min: 45, price_base: 800.0 },
    { id: 3, name: 'Peeling Químico', duration_min: 60, price_base: 350.0 },
  ],
  appointments: [
    { id: 101, date: '2026-07-15T09:30:00', procedure: 'Avaliação Estética', doctor: 'Dr. Carlos Mendes', status: 'scheduled' },
    { id: 102, date: '2025-10-15T14:00:00', procedure: 'Consulta de Rotina', doctor: 'Dra. Ana Silva', status: 'done' },
    { id: 103, date: '2025-08-10T10:00:00', procedure: 'Limpeza de Pele', doctor: 'Dr. Carlos Mendes', status: 'done' },
  ],
  photos: [
    { id: 201, treatment: 'Peeling Químico', date: 'Agosto 2025', url_before: 'signed-url-before-1', url_after: 'signed-url-after-1' },
    { id: 202, treatment: 'Avaliação Inicial', date: 'Janeiro 2025', url_before: 'signed-url-before-2', url_after: null },
  ],
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha o .env ou mantenha USE_MOCK = true.')
  }
}

// 1. Usuário logado
export async function getCurrentUser() {
  if (USE_MOCK) {
    await delay(150)
    return MOCK.currentUser
  }
  requireSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return { id: user.id, name: user.user_metadata?.name ?? user.email, email: user.email }
}

// 2. Procedimentos (paciente vê apenas os ativos)
export async function getProcedures() {
  if (USE_MOCK) {
    await delay(250)
    return MOCK.procedures
  }
  requireSupabase()
  const { data, error } = await supabase
    .from('procedures')
    .select('id, name, duration_min, price_base')
    .eq('active', true)
  if (error) throw error
  return data
}

// 3. Consultas do paciente logado (protegidas por RLS)
export async function getAppointments(patientId) {
  if (USE_MOCK) {
    await delay(250)
    return MOCK.appointments
  }
  requireSupabase()
  const { data, error } = await supabase
    .from('appointments')
    .select('id, date, status, procedure:procedures(name), doctor:doctors(name)')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
  if (error) throw error
  // Supabase devolve procedure/doctor aninhados; achatamos para a UI.
  return data.map((a) => ({
    id: a.id,
    date: a.date,
    status: a.status,
    procedure: a.procedure?.name ?? '—',
    doctor: a.doctor?.name ?? '—',
  }))
}

// 4. Fotos clínicas — LGPD: URLs assinadas e temporárias
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
    rows.map(async (row) => ({
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
