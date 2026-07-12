import { useAsync } from './useAsync'
import {
  getCurrentUser,
  getProcedures,
  getAppointments,
  getPhotos,
} from '../services/patientService'

export function useCurrentUser() {
  const { data, loading, error } = useAsync(() => getCurrentUser(), [])
  return { user: data, loading, error }
}

export function useProcedures() {
  const { data, loading, error } = useAsync(() => getProcedures(), [])
  return { procedures: data ?? [], loading, error }
}

export function useAppointments(patientId) {
  const { data, loading, error } = useAsync(
    () => (patientId ? getAppointments(patientId) : Promise.resolve([])),
    [patientId]
  )
  return { appointments: data ?? [], loading, error }
}

export function usePhotos(patientId) {
  const { data, loading, error } = useAsync(
    () => (patientId ? getPhotos(patientId) : Promise.resolve([])),
    [patientId]
  )
  return { photos: data ?? [], loading, error }
}
