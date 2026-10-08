import type {
  LoginErrors,
  LoginValues,
  ManagedUserErrors,
  ManagedUserValues,
  RegistrationErrors,
  RegistrationValues,
} from './types'

export function normalizeRun(value: string) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  return clean.length < 2 ? clean : `${clean.slice(0, -1)}-${clean.slice(-1)}`
}

export function isValidRun(value: string) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false
  const body = clean.slice(0, -1)
  let sum = 0
  let multiplier = 2
  for (let index = body.length - 1; index >= 0; index--) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const result = 11 - (sum % 11)
  return clean.slice(-1) === (result === 11 ? '0' : result === 10 ? 'K' : String(result))
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidName(value: string) {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(value)
}

export function getLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {}
  if (!values.run) errors.run = 'El RUN es obligatorio.'
  else if (!isValidRun(values.run)) errors.run = 'Ingresa un RUN chileno válido.'
  if (!values.firstName) errors.firstName = 'El nombre es obligatorio.'
  else if (values.firstName.length > 80) errors.firstName = 'El nombre no puede superar 80 caracteres.'
  else if (!isValidName(values.firstName)) errors.firstName = 'El nombre contiene caracteres no permitidos.'
  if (!values.lastName) errors.lastName = 'Los apellidos son obligatorios.'
  else if (values.lastName.length > 80) errors.lastName = 'Los apellidos no pueden superar 80 caracteres.'
  else if (!isValidName(values.lastName)) errors.lastName = 'Los apellidos contienen caracteres no permitidos.'
  if (values.birthDate && values.birthDate >= getLocalDateString()) errors.birthDate = 'La fecha de nacimiento debe ser anterior a hoy.'
  if (values.phone) {
    const digits = values.phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 12) errors.phone = 'Ingresa un teléfono válido de 9 a 12 dígitos.'
  }
  if (values.address.length > 150) errors.address = 'La dirección no puede superar 150 caracteres.'
  if (!values.email) errors.email = 'El correo electrónico es obligatorio.'
  else if (values.email.length > 100) errors.email = 'El correo no puede superar 100 caracteres.'
  else if (!isValidEmail(values.email)) errors.email = 'Ingresa un correo electrónico válido.'
  if (!values.password) errors.password = 'La contraseña es obligatoria.'
  else if (values.password.length < 6 || values.password.length > 100) errors.password = 'La contraseña debe tener entre 6 y 100 caracteres.'
  if (!values.passwordConfirmation) errors.passwordConfirmation = 'Confirma tu contraseña.'
  else if (values.passwordConfirmation !== values.password) errors.passwordConfirmation = 'Las contraseñas no coinciden.'
  if (!values.terms) errors.terms = 'Debes aceptar los términos para continuar.'
  return errors
}

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}
  if (!values.email) errors.email = 'El correo electrónico es obligatorio.'
  else if (!isValidEmail(values.email)) errors.email = 'Ingresa un correo electrónico válido.'
  if (!values.password) errors.password = 'La contraseña es obligatoria.'
  else if (values.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  return errors
}

export function validateManagedUser(values: ManagedUserValues, isEditing = false): ManagedUserErrors {
  const errors: ManagedUserErrors = {}
  if (!values.run) errors.run = 'El RUN es obligatorio.'
  else if (!isValidRun(values.run)) errors.run = 'Ingresa un RUN chileno válido.'
  if (!values.firstName) errors.firstName = 'El nombre es obligatorio.'
  else if (values.firstName.length > 80) errors.firstName = 'El nombre no puede superar 80 caracteres.'
  else if (!isValidName(values.firstName)) errors.firstName = 'El nombre contiene caracteres no permitidos.'
  if (!values.lastName) errors.lastName = 'Los apellidos son obligatorios.'
  else if (values.lastName.length > 80) errors.lastName = 'Los apellidos no pueden superar 80 caracteres.'
  else if (!isValidName(values.lastName)) errors.lastName = 'Los apellidos contienen caracteres no permitidos.'
  if (!values.email) errors.email = 'El correo electrónico es obligatorio.'
  else if (values.email.length > 100) errors.email = 'El correo no puede superar 100 caracteres.'
  else if (!isValidEmail(values.email)) errors.email = 'Ingresa un correo electrónico válido.'
  if (values.phone) {
    const digits = values.phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 12) errors.phone = 'Ingresa un teléfono válido de 9 a 12 dígitos.'
  }
  if (values.address.length > 150) errors.address = 'La dirección no puede superar 150 caracteres.'
  if (!isEditing && !values.password) errors.password = 'La contraseña temporal es obligatoria.'
  else if (values.password && (values.password.length < 6 || values.password.length > 100)) errors.password = 'La contraseña debe tener entre 6 y 100 caracteres.'
  return errors
}
