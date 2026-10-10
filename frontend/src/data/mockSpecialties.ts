import type { Specialty } from '../types/specialty.ts'

export const mockSpecialties: Specialty[] = [
  { specialtyId: 1, specialtyName: 'Cardiología', description: 'Diagnóstico y tratamiento de enfermedades del corazón.', active: true },
  { specialtyId: 2, specialtyName: 'Pediatría', description: 'Atención médica para niños y adolescentes.', active: true },
  { specialtyId: 3, specialtyName: 'Traumatología', description: 'Tratamiento de lesiones de huesos, músculos y articulaciones.', active: true },
  { specialtyId: 4, specialtyName: 'Dermatología', description: 'Cuidado de la piel, cabello y uñas.', active: true },
  { specialtyId: 5, specialtyName: 'Neurología', description: 'Diagnóstico y tratamiento de enfermedades del sistema nervioso.', active: true },
  { specialtyId: 6, specialtyName: 'Medicina General', description: 'Atención primaria y controles de salud.', active: false },
]
