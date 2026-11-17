import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getDoctorAppointments } from '../services/doctor-workflow.service'
import type { Appointment } from '../types/appointment'

export function useDoctorAppointments() {
  const { session, user } = useAuth()
  const token = session?.token
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const doctorName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  const refresh = useCallback(async () => {
    if (!token) {
      setAppointments([])
      setDoctorId(null)
      setLoading(false)
      setError('Inicia sesión para consultar tu agenda médica.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getDoctorAppointments(token, doctorName)
      setDoctorId(data.doctor.doctorId)
      setAppointments(data.appointments)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la agenda médica.')
    } finally {
      setLoading(false)
    }
  }, [doctorName, token])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  return { appointments, doctorId, loading, error, refresh, token }
}
