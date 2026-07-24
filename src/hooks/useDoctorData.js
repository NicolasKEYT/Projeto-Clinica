import { useAsync } from './useAsync'
import {
  getDashboardMetrics,
  getTodaySchedule,
  getProcedures,
  getPatients,
  getClinics,
} from '../services/doctorService'

// ALTERADO: agora expõe refetch, para o dashboard recarregar os números
// depois que o doutor muda o status de uma consulta.
export function useDashboardMetrics() {
  const { data, loading, error, refetch } = useAsync(() => getDashboardMetrics(), [])
  return { metrics: data, loading, error, refetch }
}

// ALTERADO: idem — a agenda precisa se atualizar após "Iniciar"/"Concluir".
export function useTodaySchedule() {
  const { data, loading, error, refetch } = useAsync(() => getTodaySchedule(), [])
  return { schedule: data ?? [], loading, error, refetch }
}

export function useDoctorProcedures() {
  const { data, loading, error, refetch } = useAsync(() => getProcedures(), [])
  return { procedures: data ?? [], loading, error, refetch }
}

export function usePatients(search) {
  const { data, loading, error, refetch } = useAsync(() => getPatients(search), [search])
  return { patients: data ?? [], loading, error, refetch }
}

// Hook de clínicas, com refetch (mesmo padrão do useDoctorProcedures)
export function useDoctorClinics() {
  const { data, loading, error, refetch } = useAsync(() => getClinics(), [])
  return { clinics: data ?? [], loading, error, refetch }
}
