import type { Doctor } from '../types/doctor.ts'

export const mockDoctors: Doctor[] = [
  { doctorId: 1, userId: 3, firstName: 'Daniela', lastName: 'Rojas', run: '33333333-3', email: 'medico@medireservas.cl', phone: '+56 9 1234 5678', medicalLicenseNumber: 'RUM-12345', specialtyIds: [1, 5], admissionDate: '2024-03-15', active: true },
  { doctorId: 2, userId: 5, firstName: 'Luis', lastName: 'Pérez', run: '18265432-9', email: 'luis.perez@medireservas.cl', phone: '+56 9 8765 4321', medicalLicenseNumber: 'RUM-67890', specialtyIds: [2, 4], admissionDate: '2023-08-02', active: true },
  { doctorId: 3, userId: 6, firstName: 'María', lastName: 'Soto', run: '16753248-9', email: 'maria.soto@medireservas.cl', phone: '', medicalLicenseNumber: 'RUM-11223', specialtyIds: [3], admissionDate: '2022-01-10', active: false },
]
