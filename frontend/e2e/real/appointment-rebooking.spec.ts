import { randomUUID } from 'node:crypto'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface PublicDoctor {
  doctorId: number
  firstName: string
  lastName: string
  specialties: Array<{ specialtyId: number; specialtyName: string }>
}

interface PublicSlot {
  scheduleSlotId: number
  doctorId: number
  slotDate: string
  startTime: string
  endTime: string
}

interface Appointment {
  appointmentId: number
  scheduleSlotId: number
  appointmentStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  reason: string | null
}

interface SessionSummary {
  userId: number
  token: string
}

const apiPath = '/api/v3'

async function readData<T>(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<T> {
  expect(response.ok(), `API respondió HTTP ${response.status()}`).toBeTruthy()
  return (await response.json() as ApiResponse<T>).data
}

async function findAvailableSlot(request: APIRequestContext): Promise<{
  doctor: PublicDoctor
  specialtyId: number
  slot: PublicSlot
}> {
  const doctors = await readData<PublicDoctor[]>(
    await request.get(`${apiPath}/doctors/directory`),
  )
  const now = Date.now() + 3 * 60 * 1000

  for (const doctor of doctors) {
    const specialties = doctor.specialties ?? []
    if (specialties.length === 0) continue

    const slots = await readData<PublicSlot[]>(
      await request.get(`${apiPath}/schedule-slots/public?doctorId=${doctor.doctorId}`),
    )
    const slot = slots.find((candidate) =>
      new Date(`${candidate.slotDate}T${candidate.startTime}`).getTime() > now,
    )
    if (slot) {
      return { doctor, specialtyId: specialties[0]!.specialtyId, slot }
    }
  }

  throw new Error('No hay horarios públicos a más de tres minutos para probar el backend.')
}

async function getOwnAppointments(
  request: APIRequestContext,
  token: string,
  userId: number,
): Promise<Appointment[]> {
  return readData<Appointment[]>(await request.get(
    `${apiPath}/appointments/patient/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  ))
}

async function cancelAppointment(
  request: APIRequestContext,
  token: string,
  userId: number,
  appointmentId: number,
  reason: string,
) {
  const response = await request.patch(`${apiPath}/appointments/${appointmentId}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { cancelledByUserId: userId, cancellationReason: reason },
  })
  expect(response.ok(), `No se pudo cancelar la cita ${appointmentId}: HTTP ${response.status()}`)
    .toBeTruthy()
}

async function bookThroughUi(
  page: Page,
  doctorId: number,
  specialtyId: number,
  slot: PublicSlot,
  reason: string,
) {
  await page.goto('/#/solicitar-cita')
  await page.getByLabel(/Especialidad/).selectOption(String(specialtyId))
  await page.getByLabel(/Médico/).selectOption(String(doctorId))
  await page.getByLabel(/Fecha de atención/).fill(slot.slotDate)
  await page.getByLabel(/Hora de atención/).selectOption(slot.startTime.slice(0, 5))
  await page.getByLabel(/Motivo de la consulta/).fill(reason)
  await page.getByLabel(/Presencial/).check()
  await page.getByRole('button', { name: 'Solicitar cita' }).click()
  await expect(page.getByRole('status'))
    .toContainText('Tu solicitud de cita se registró correctamente')
}

test('real API: cancela una cita y permite reservar otra vez el mismo horario', async ({
  page,
  request,
}) => {
  const email = process.env.E2E_PATIENT_EMAIL!
  const password = process.env.E2E_PATIENT_PASSWORD!
  const marker = `E2E rebooking ${randomUUID()}`

  await page.goto('/#/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page).toHaveURL(/#\/dashboard$/)

  const session = await page.evaluate(() => {
    const raw = localStorage.getItem('medireservas_session')
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<SessionSummary>
    return typeof stored.userId === 'number' && typeof stored.token === 'string'
      ? { userId: stored.userId, token: stored.token }
      : null
  })
  expect(session, 'El login real no guardó una sesión válida').not.toBeNull()
  if (!session) throw new Error('El login real no guardó una sesión válida')

  const { doctor, specialtyId, slot } = await findAvailableSlot(request)
  try {
    await bookThroughUi(page, doctor.doctorId, specialtyId, slot, `${marker} first`)
    let appointments = await getOwnAppointments(request, session.token, session.userId)
    let first = appointments.find((appointment) => appointment.reason === `${marker} first`)
    expect(first, 'No apareció la primera cita creada en el backend').toBeTruthy()
    expect(first).toMatchObject({
      scheduleSlotId: slot.scheduleSlotId,
      appointmentStatus: 'PENDING',
    })
    await page.goto('/#/mis-citas')
    const firstAppointment = page.getByRole('article').filter({ hasText: `${marker} first` })
    page.once('dialog', (dialog) => dialog.accept())
    await firstAppointment.getByRole('button', { name: 'Cancelar cita' }).click()
    await expect(page.getByRole('status')).toContainText('La cita se canceló correctamente')
    appointments = await getOwnAppointments(request, session.token, session.userId)
    first = appointments.find((appointment) => appointment.reason === `${marker} first`)
    expect(first?.appointmentStatus).toBe('CANCELLED')
    const releasedSlots = await readData<PublicSlot[]>(
      await request.get(`${apiPath}/schedule-slots/public?doctorId=${doctor.doctorId}`),
    )
    expect(releasedSlots.some((candidate) =>
      candidate.scheduleSlotId === slot.scheduleSlotId,
    ), 'El horario cancelado no volvió a estar disponible').toBeTruthy()

    await bookThroughUi(page, doctor.doctorId, specialtyId, slot, `${marker} second`)
    appointments = await getOwnAppointments(request, session.token, session.userId)
    const second = appointments.find((appointment) => appointment.reason === `${marker} second`)
    expect(second, 'No apareció la segunda cita creada en el backend').toBeTruthy()
    expect(second).toMatchObject({
      scheduleSlotId: slot.scheduleSlotId,
      appointmentStatus: 'PENDING',
    })
  } finally {
    const appointments = await getOwnAppointments(request, session.token, session.userId)
      .catch(() => [])
    const pendingTestAppointments = appointments.filter((appointment) =>
      (appointment.reason?.startsWith(marker) ?? false)
      && ['PENDING', 'CONFIRMED'].includes(appointment.appointmentStatus),
    )
    for (const appointment of pendingTestAppointments) {
      await cancelAppointment(
        request,
        session.token,
        session.userId,
        appointment.appointmentId,
        `${marker} cleanup`,
      ).catch(() => undefined)
    }
  }
})
