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
  const { data, loading, error } = useAsync(() => getProcedures(), [])
  return { procedures: data ?? [], loading, error }
}

export function usePatients(search) {
  const { data, loading, error } = useAsync(() => getPatients(search), [search])
  return { patients: data ?? [], loading, error }
}
