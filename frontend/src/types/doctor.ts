export interface Doctor {
  doctorId: number
  userId: number
  firstName: string
  lastName: string
  run: string
  email: string
  phone: string
  medicalLicenseNumber: string
  specialtyIds: number[]
  admissionDate: string
  active: boolean
}

export interface DoctorValues extends Omit<Doctor, 'specialtyIds'> {
  specialtyId: number
  extraSpecialtyIds: number[]
}

export type DoctorErrors = Partial<Record<keyof DoctorValues, string>>
