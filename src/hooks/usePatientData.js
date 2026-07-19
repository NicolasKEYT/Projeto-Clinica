import { useAsync } from './useAsync'
import {
  getCurrentUser,
  getClinics,
  getProcedures,
  getBookedTimes,
  getAppointments,
  getPhotos,
} from '../services/patientService'

export function useCurrentUser() {
  const { data, loading, error } = useAsync(() => getCurrentUser(), [])
  return { user: data, loading, error }
}

export function useClinics() {
  const { data, loading, error } = useAsync(() => getClinics(), [])
  return { clinics: data ?? [], loading, error }
}

// Só busca quando há uma clínica escolhida.
export function useProcedures(clinicId) {
  const { data, loading, error } = useAsync(() => getProcedures(clinicId), [clinicId])
  return { procedures: data ?? [], loading, error }
}

// Horários já ocupados no dia selecionado.
export function useBookedTimes(clinicId, dateISO) {
  const { data, loading, error } = useAsync(
    () => (clinicId && dateISO ? getBookedTimes(clinicId, dateISO) : Promise.resolve([])),
    [clinicId, dateISO]
  )
  return { bookedTimes: data ?? [], loading, error }
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
