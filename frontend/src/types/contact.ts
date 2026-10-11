export interface ContactValues {
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>
