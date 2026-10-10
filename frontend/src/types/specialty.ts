export interface Specialty {
  specialtyId: number
  specialtyName: string
  description: string
  active: boolean
}

export type SpecialtyValues = Specialty
export type SpecialtyErrors = Partial<Record<'specialtyName' | 'description', string>>
