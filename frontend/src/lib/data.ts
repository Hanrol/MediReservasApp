import type { User } from './types'

export const BASE_USERS: User[] = [
  { userId: 1, authUserId: 1, run: '11111111-1', firstName: 'Andrea', lastName: 'Muñoz', email: 'administrador@medireservas.cl', password: 'Admin123', role: 'ADMIN', active: true },
  { userId: 2, authUserId: 2, run: '22222222-2', firstName: 'Ricardo', lastName: 'Silva', email: 'recepcion@medireservas.cl', password: 'Recepcion123', role: 'RECEPTIONIST', active: true },
  { userId: 3, authUserId: 3, run: '33333333-3', firstName: 'Daniela', lastName: 'Rojas', email: 'medico@medireservas.cl', password: 'Medico123', role: 'DOCTOR', active: true },
  { userId: 4, authUserId: 4, run: '44444444-4', firstName: 'Paula', lastName: 'Contreras', email: 'paciente@medireservas.cl', password: 'Paciente123', role: 'PATIENT', active: true },
  { userId: 5, authUserId: 5, run: '18265432-9', firstName: 'Luis', lastName: 'Pérez', email: 'luis.perez@medireservas.cl', password: 'Medico123', role: 'DOCTOR', active: true },
  { userId: 6, authUserId: 6, run: '16753248-9', firstName: 'María', lastName: 'Soto', email: 'maria.soto@medireservas.cl', password: 'Medico123', role: 'DOCTOR', active: false },
]
