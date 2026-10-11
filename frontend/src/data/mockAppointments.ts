import type { Appointment } from '../types/appointment'

export const mockAppointments: Appointment[] = [
  { appointmentId: 1, patientUserId: 4, patientName: 'Paula Contreras', doctorId: 1, doctorName: 'Daniela Rojas', specialtyId: 1, specialtyName: 'Cardiología', scheduleSlotId: 1, date: '2026-10-09', time: '09:00', reason: 'Control general', modality: 'presencial', appointmentStatus: 'CONFIRMED' },
  { appointmentId: 2, patientUserId: 4, patientName: 'Paula Contreras', doctorId: 2, doctorName: 'Luis Pérez', specialtyId: 2, specialtyName: 'Pediatría', scheduleSlotId: 6, date: '2026-10-10', time: '11:30', reason: 'Control preventivo', modality: 'presencial', appointmentStatus: 'PENDING' },
  { appointmentId: 3, patientUserId: 4, patientName: 'Paula Contreras', doctorId: 1, doctorName: 'Daniela Rojas', specialtyId: 5, specialtyName: 'Neurología', scheduleSlotId: 2, date: '2026-10-09', time: '10:00', reason: 'Dolor de cabeza frecuente', modality: 'online', appointmentStatus: 'CONFIRMED' },
  { appointmentId: 4, patientUserId: 4, patientName: 'Paula Contreras', doctorId: 3, doctorName: 'María Soto', specialtyId: 3, specialtyName: 'Traumatología', scheduleSlotId: 9, date: '2026-10-08', time: '15:00', reason: 'Evaluación de dolor articular', modality: 'presencial', appointmentStatus: 'COMPLETED' },
  { appointmentId: 5, patientUserId: 4, patientName: 'Paula Contreras', doctorId: 2, doctorName: 'Luis Pérez', specialtyId: 4, specialtyName: 'Dermatología', scheduleSlotId: 8, date: '2026-10-11', time: '16:00', reason: 'Seguimiento dermatológico', modality: 'presencial', appointmentStatus: 'CANCELLED' },
]
