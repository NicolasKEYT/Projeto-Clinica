import { useAsync } from './useAsync'
import {
  getDashboardMetrics,
  getTodaySchedule,
  getProcedures,
  getPatients,
} from '../services/doctorService'

export function useDashboardMetrics() {
  const { data, loading, error } = useAsync(() => getDashboardMetrics(), [])
  return { metrics: data, loading, error }
}

export function useTodaySchedule() {
  const { data, loading, error } = useAsync(() => getTodaySchedule(), [])
  return { schedule: data ?? [], loading, error }
}

export function useDoctorProcedures() {
  const { data, loading, error, refetch } = useAsync(() => getProcedures(), []) // ALTERADO: refetch extraído do useAsync
  return { procedures: data ?? [], loading, error, refetch } // ALTERADO: refetch exposto para quem usar o hook
}

export function usePatients(search) {
  const { data, loading, error } = useAsync(() => getPatients(search), [search])
  return { patients: data ?? [], loading, error }
}
