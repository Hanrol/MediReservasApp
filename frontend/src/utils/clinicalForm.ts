export interface ClinicalFormValues {
  diagnosis: string
  notes: string
  treatment: string
}

export type ClinicalFormErrors = Partial<Record<keyof ClinicalFormValues, string>>

export function validateClinicalForm(values: ClinicalFormValues): ClinicalFormErrors {
  const errors: ClinicalFormErrors = {}
  const diagnosis = values.diagnosis.trim()
  const notes = values.notes.trim()
  const treatment = values.treatment.trim()

  if (!diagnosis) errors.diagnosis = 'Ingrese el diagnóstico clínico.'
  else if (diagnosis.length < 3) errors.diagnosis = 'El diagnóstico debe contener al menos 3 caracteres.'
  else if (diagnosis.length > 300) errors.diagnosis = 'El diagnóstico no puede superar los 300 caracteres.'
  if (!notes) errors.notes = 'Ingrese las observaciones clínicas.'
  else if (notes.length < 5) errors.notes = 'Las observaciones deben contener al menos 5 caracteres.'
  else if (notes.length > 2000) errors.notes = 'Las observaciones no pueden superar los 2000 caracteres.'
  if (!treatment) errors.treatment = 'Ingrese el tratamiento o las indicaciones.'
  else if (treatment.length < 3) errors.treatment = 'El tratamiento debe contener al menos 3 caracteres.'
  else if (treatment.length > 1000) errors.treatment = 'El tratamiento no puede superar los 1000 caracteres.'

  return errors
}
