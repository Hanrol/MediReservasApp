import { expect, type Page } from '@playwright/test'
import { mockAppointments } from '../src/data/mockAppointments'
import { mockDoctors } from '../src/data/mockDoctors'
import { mockSchedules } from '../src/data/mockSchedules'
import { mockSpecialties } from '../src/data/mockSpecialties'
import { mockUsers } from '../src/data/mockUsers'

export async function loginAs(page: Page, email: string, password: string) {
  const user = mockUsers.find((candidate) => candidate.email === email)
  if (!user) throw new Error(`No existe usuario E2E para ${email}`)

  await seedMockAppData(page)
  await mockAuthApi(page, user)

  await page.goto('/#/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page).toHaveURL(/#\/dashboard$/)
}

export async function mockAuthApi(page: Page, user: (typeof mockUsers)[number]) {
  await page.route('**/api/v3/auth/login', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Inicio de sesión exitoso',
      data: {
        authUserId: user.authUserId,
        email: user.email,
        token: `e2e-token-${user.userId}`,
        roles: [user.role],
      },
    },
  }))
  await page.route('**/api/v3/users/me', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Usuario autenticado',
      data: {
        userId: user.userId,
        authUserId: user.authUserId,
        run: user.run,
        email: user.email,
        active: user.active,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  }))
}

export async function seedMockAppData(page: Page) {
  await page.addInitScript(({ initialData }) => {
    for (const [key, value] of Object.entries(initialData)) {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  }, {
    initialData: {
      medireservas_users: mockUsers,
      medireservas_doctors: mockDoctors,
      medireservas_specialties: mockSpecialties,
      medireservas_appointments: mockAppointments,
      medireservas_schedules: mockSchedules,
      medireservas_clinical_observations: [],
    },
  })
}

export async function mockAdminApi(page: Page) {
  await page.route('**/api/v3/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    let data: unknown
    if (pathname === '/api/v3/users') {
      data = mockUsers.map(({ userId, authUserId, run, email, active }) => ({
        userId, authUserId, run, email, active,
      }))
    } else if (pathname === '/api/v3/auth/users') {
      data = mockUsers.map(({ authUserId, email, role, active }) => ({
        authUserId, email, enabled: active, roles: [role],
      }))
    } else if (pathname === '/api/v3/user-profiles') {
      data = mockUsers.map(({ userId, firstName, lastName, phone, birthDate, address }) => ({
        userProfileId: userId, userId, firstName, lastName, phone, birthDate, address,
      }))
    } else if (pathname === '/api/v3/admin/invitations') {
      data = []
    } else {
      await route.fulfill({ status: 404, json: { code: 404, message: 'Ruta admin no simulada', data: null } })
      return
    }

    await route.fulfill({
      status: 200,
      json: { code: 200, message: 'OK', data },
    })
  })
}

export async function mockPublicDirectoryApi(page: Page) {
  await page.route('**/api/v3/doctors/directory', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Directorio médico obtenido correctamente',
      data: mockDoctors.filter((doctor) => doctor.active).map((doctor) => ({
        doctorId: doctor.doctorId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        medicalLicenseNumber: doctor.medicalLicenseNumber,
        specialties: doctor.specialtyIds
          .map((specialtyId) => mockSpecialties.find((specialty) => specialty.specialtyId === specialtyId))
          .filter((specialty) => specialty?.active)
          .map((specialty) => ({
            specialtyId: specialty!.specialtyId,
            specialtyName: specialty!.specialtyName,
            description: specialty!.description,
          })),
      })),
    },
  }))

  await page.route('**/api/v3/specialties/public/active', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Especialidades activas',
      data: mockSpecialties.filter((specialty) => specialty.active),
    },
  }))

  await page.route('**/api/v3/schedule-slots/public**', async (route) => {
    const doctorId = Number(new URL(route.request().url()).searchParams.get('doctorId'))
    const data = mockSchedules
      .filter((schedule) => schedule.doctorId === doctorId && schedule.available)
      .map((schedule) => ({
        scheduleSlotId: schedule.id,
        doctorId: schedule.doctorId,
        slotDate: schedule.date,
        startTime: `${schedule.time}:00`,
        endTime: `${schedule.time}:30`,
      }))
    await route.fulfill({ status: 200, json: { code: 200, message: 'Horarios disponibles', data } })
  })
}

export async function mockPatientBookingApi(page: Page) {
  let appointments = [...mockAppointments]
  const directory = mockDoctors.filter((doctor) => doctor.active).map((doctor) => ({
    doctorId: doctor.doctorId,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    medicalLicenseNumber: doctor.medicalLicenseNumber,
    specialties: doctor.specialtyIds
      .map((specialtyId) => mockSpecialties.find((specialty) => specialty.specialtyId === specialtyId))
      .filter((specialty) => specialty?.active)
      .map((specialty) => ({
        specialtyId: specialty!.specialtyId,
        specialtyName: specialty!.specialtyName,
        description: specialty!.description,
      })),
  }))

  await page.route('**/api/v3/doctors/directory', (route) => route.fulfill({
    status: 200,
    json: { code: 200, message: 'Directorio médico', data: directory },
  }))
  await page.route('**/api/v3/specialties/public/active', (route) => route.fulfill({
    status: 200,
    json: { code: 200, message: 'Especialidades activas', data: mockSpecialties.filter((item) => item.active) },
  }))
  await page.route('**/api/v3/schedule-slots/public**', async (route) => {
    const doctorId = Number(new URL(route.request().url()).searchParams.get('doctorId'))
    const data = mockSchedules.filter((item) => item.doctorId === doctorId && item.available).map((item) => ({
      scheduleSlotId: item.id,
      doctorId: item.doctorId,
      slotDate: item.date,
      startTime: `${item.time}:00`,
      endTime: `${item.time}:30`,
    }))
    await route.fulfill({ status: 200, json: { code: 200, message: 'Disponibilidad', data } })
  })
  await page.route('**/api/v3/schedule-slots', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Slots',
      data: mockSchedules.map((item) => ({
        scheduleSlotId: item.id,
        slotDate: item.date,
        startTime: `${item.time}:00`,
      })),
    },
  }))
  await page.route('**/api/v3/appointments**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'POST' && url.pathname.endsWith('/appointments')) {
      const input = request.postDataJSON() as { patientUserId: number; doctorId: number; specialtyId: number; scheduleSlotId: number; reason: string }
      const appointment = {
        appointmentId: 100,
        patientUserId: input.patientUserId,
        doctorId: input.doctorId,
        specialtyId: input.specialtyId,
        scheduleSlotId: input.scheduleSlotId,
        appointmentStatus: 'PENDING',
        reason: input.reason,
      }
      appointments = [...appointments, appointment as typeof appointments[number]]
      await route.fulfill({ status: 201, json: { code: 201, message: 'Cita creada', data: appointment } })
      return
    }
    if (request.method() === 'GET' && url.pathname.includes('/appointments/patient/')) {
      await route.fulfill({ status: 200, json: { code: 200, message: 'Citas', data: appointments } })
      return
    }
    if (request.method() === 'PATCH' && url.pathname.endsWith('/cancel')) {
      const id = Number(url.pathname.split('/').at(-2))
      appointments = appointments.map((appointment) => appointment.appointmentId === id
        ? { ...appointment, appointmentStatus: 'CANCELLED' }
        : appointment)
      await route.fulfill({ status: 200, json: { code: 200, message: 'Cancelada', data: null } })
      return
    }
    await route.continue()
  })
}

export async function mockDoctorAvailabilityApi(page: Page) {
  const doctor = mockDoctors.find((item) => item.userId === 3)!
  let schedules = [
    {
      doctorScheduleId: 41,
      doctorId: doctor.doctorId,
      dayOfWeek: 'LUNES',
      startTime: '09:00:00',
      endTime: '12:00:00',
      active: true,
    },
  ]
  await page.route('**/api/v3/doctors/me', (route) => route.fulfill({
    status: 200,
    json: { doctorId: doctor.doctorId, userId: doctor.userId, active: true, specialtyIds: doctor.specialtyIds },
  }))
  await page.route('**/api/v3/doctor-schedules**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, json: { code: 200, message: 'Horarios', data: schedules } })
      return
    }
    if (request.method() === 'POST') {
      const input = request.postDataJSON() as Omit<typeof schedules[number], 'doctorScheduleId'>
      const created = { ...input, doctorScheduleId: 42 }
      schedules = [...schedules, created]
      await route.fulfill({ status: 201, json: { code: 201, message: 'Creado', data: created } })
      return
    }
    if (request.method() === 'DELETE') {
      if (url.pathname.endsWith('/me')) {
        schedules = []
        await route.fulfill({ status: 200, json: { code: 200, message: 'Recurrencias eliminadas', data: null } })
        return
      }
      const id = Number(url.pathname.split('/').at(-1))
      schedules = schedules.filter((schedule) => schedule.doctorScheduleId !== id)
      await route.fulfill({ status: 200, json: { code: 200, message: 'Eliminado', data: null } })
      return
    }
    await route.continue()
  })
  let slots: Array<{
    scheduleSlotId: number
    doctorId: number
    slotDate: string
    startTime: string
    endTime: string
    slotStatus: string
    appointmentId: number | null
  }> = []
  await page.route('**/api/v3/schedule-slots**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.endsWith('/public')) {
      await route.fulfill({ status: 200, json: { code: 200, message: 'Disponibilidad', data: [] } })
      return
    }
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, json: { code: 200, message: 'Slots', data: slots } })
      return
    }
    if (request.method() === 'POST') {
      const input = request.postDataJSON() as Omit<typeof slots[number], 'scheduleSlotId'>
      const created = { ...input, scheduleSlotId: 99 }
      slots = [...slots, created]
      await route.fulfill({ status: 201, json: { code: 201, message: 'Slot creado', data: created } })
      return
    }
    if (request.method() === 'DELETE') {
      const id = Number(url.pathname.split('/').at(-1))
      slots = slots.filter((slot) => slot.scheduleSlotId !== id)
      await route.fulfill({ status: 200, json: { code: 200, message: 'Slot eliminado', data: null } })
      return
    }
    await route.continue()
  })
}

export async function mockContactMessagesApi(
  page: Page,
  initialMessages: Array<{
    contactMessageId: number
    name: string
    email: string
    subject: string
    message: string
    createdAt: string
  }> = [],
) {
  const messages = [...initialMessages]
  await page.route('**/api/v3/contact-messages', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      const input = request.postDataJSON() as {
        name: string
        email: string
        subject: string
        message: string
      }
      const created = {
        ...input,
        contactMessageId: messages.length + 1,
        createdAt: new Date().toISOString(),
      }
      messages.splice(0, 0, created)
      await route.fulfill({
        status: 201,
        json: { code: 201, message: 'Mensaje recibido', data: created },
      })
      return
    }
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: { code: 200, message: 'Mensajes', data: messages },
      })
      return
    }
    await route.fulfill({ status: 405, json: { code: 405, message: 'Método no permitido', data: null } })
  })
  return { messages }
}

export async function mockDoctorApi(page: Page) {
  const visits: Array<{
    medicalVisitId: number
    appointmentId: number
    doctorId: number
    visitDate: string
    visitReason: string
    observations: string
    treatment: string
    createdAt: string
    diagnoses: Array<{ diagnosisId: number; diagnosisDescription: string; diagnosisNotes: string }>
  }> = []
  let diagnosisId = 1

  await page.route('**/api/v3/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    const method = route.request().method()
    let data: unknown
    let message = 'OK'

    if (method === 'GET' && pathname === '/api/v3/doctors/me') {
      await route.fulfill({
        status: 200,
        json: { doctorId: 1, userId: 3, medicalLicenseNumber: 'RUM-E2E', active: true, specialtyIds: [1] },
      })
      return
    } else if (method === 'GET' && pathname === '/api/v3/appointments/doctor/1') {
      data = mockAppointments.map((appointment) => ({
        appointmentId: appointment.appointmentId,
        patientUserId: appointment.patientUserId,
        patientName: appointment.patientName,
        patientRun: mockUsers.find((user) => user.userId === appointment.patientUserId)?.run ?? '',
        doctorId: appointment.doctorId,
        specialtyId: appointment.specialtyId,
        scheduleSlotId: appointment.scheduleSlotId,
        slotDate: appointment.date,
        startTime: `${appointment.time}:00`,
        endTime: `${appointment.time}:30`,
        appointmentStatus: appointment.appointmentStatus,
        reason: appointment.reason,
      })).filter((appointment) => appointment.doctorId === 1)
    } else if (method === 'GET' && pathname === '/api/v3/specialties') {
      data = mockSpecialties.map(({ specialtyId, specialtyName, description, active }) => ({
        specialtyId, specialtyName, description, active,
      }))
    } else if (method === 'POST' && pathname === '/api/v3/medical-records/for-appointment/1') {
      data = { medicalRecordId: 1, patientId: 4, active: true }
    } else if (method === 'GET' && /^\/api\/v3\/medical-visit\/\d+$/.test(pathname)) {
      data = visits
    } else if (method === 'POST' && pathname === '/api/v3/medical-visit') {
      const body = route.request().postDataJSON() as {
        appointmentId: number
        doctorId: number
        visitDate: string
        visitReason: string
        observations: string
        treatment: string
      }
      const visit = {
        medicalVisitId: visits.length + 1,
        ...body,
        createdAt: '2026-10-11 12:00:00',
        diagnoses: [],
      }
      visits.push(visit)
      data = visit
      message = 'Visita médica creada'
    } else if (method === 'POST' && pathname === '/api/v3/diagnoses') {
      const body = route.request().postDataJSON() as {
        medicalVisitId: number
        diagnosisDescription: string
        diagnosisNotes: string
      }
      const visit = visits.find((item) => item.medicalVisitId === body.medicalVisitId)
      if (visit) visit.diagnoses.push({ diagnosisId: diagnosisId++, ...body })
      data = null
      message = 'Diagnóstico creado'
    } else if (method === 'PATCH' && pathname === '/api/v3/appointments/1/complete') {
      const appointment = mockAppointments.find((item) => item.appointmentId === 1)
      if (appointment) appointment.appointmentStatus = 'COMPLETED'
      data = null
      message = 'Cita completada'
    } else if (method === 'GET' && pathname === '/api/v3/medical-records') {
      data = visits.length
        ? [{ medicalRecordId: 1, patientUserId: 4, active: true, visits }]
        : []
    } else {
      await route.fulfill({ status: 404, json: { code: 404, message: `Ruta doctor no simulada: ${method} ${pathname}`, data: null } })
      return
    }

    await route.fulfill({ status: 200, json: { code: 200, message, data } })
  })
}

export async function mockPatientClinicalHistoryApi(page: Page) {
  await mockPublicDirectoryApi(page)
  await page.route('**/api/v3/appointments/patient/4', (route) => {
    const data = mockAppointments
      .filter((appointment) => appointment.patientUserId === 4)
      .map((appointment) => ({
        appointmentId: appointment.appointmentId,
        patientUserId: appointment.patientUserId,
        doctorId: appointment.doctorId,
        specialtyId: appointment.specialtyId,
        scheduleSlotId: appointment.scheduleSlotId,
        slotDate: appointment.date,
        startTime: `${appointment.time}:00`,
        endTime: `${appointment.time}:30`,
        appointmentStatus: appointment.appointmentStatus,
        reason: appointment.reason,
      }))
    return route.fulfill({
      status: 200,
      json: { code: 200, message: 'Citas del paciente', data },
    })
  })
  await page.route('**/api/v3/medical-records/me', (route) => route.fulfill({
    status: 200,
    json: {
      code: 200,
      message: 'Historial clínico obtenido correctamente',
      data: [{
        medicalVisitId: 15,
        appointmentId: 1,
        doctorId: 1,
        visitDate: '2026-10-09 09:00:00',
        visitReason: 'Control general',
        observations: 'Seguimiento clínico de prueba.',
        treatment: 'Control en cuatro semanas.',
        diagnoses: [{
          diagnosisId: 4,
          medicalVisitId: 15,
          diagnosisDescription: 'Migraña persistente',
          diagnosisNotes: 'E2E simulado',
        }],
        vitalSigns: [],
      }],
    },
  }))
}

export async function freezeMockDate(page: Page) {
  await page.clock.install({ time: new Date('2026-10-11T12:00:00') })
}

export async function mockReceptionApi(page: Page) {
  const appointments = mockAppointments.map((appointment) => ({
    appointmentId: appointment.appointmentId,
    patientUserId: appointment.patientUserId,
    doctorId: appointment.doctorId,
    specialtyId: appointment.specialtyId,
    scheduleSlotId: appointment.scheduleSlotId,
    appointmentStatus: appointment.appointmentStatus,
    reason: appointment.reason,
  }))
  const slots = mockSchedules.map((schedule) => {
    const appointment = appointments.find((item) => item.scheduleSlotId === schedule.id)
    const slotStatus = schedule.available
      ? 'DISPONIBLE'
      : appointment?.appointmentStatus === 'COMPLETED'
        ? 'COMPLETADO'
        : appointment?.appointmentStatus === 'CANCELLED'
          ? 'LIBERADO_POR_CANCELACION'
          : 'RESERVADO'
    return {
      scheduleSlotId: schedule.id,
      doctorId: schedule.doctorId,
      slotDate: schedule.date,
      startTime: `${schedule.time}:00`,
      endTime: `${schedule.time}:59`,
      slotStatus,
      appointmentId: slotStatus === 'RESERVADO' || slotStatus === 'COMPLETADO'
        ? appointment?.appointmentId ?? null
        : null,
    }
  })

  await page.route('**/api/v3/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    const method = route.request().method()
    let responseData: unknown = null
    let message = 'OK'

    if (method === 'POST' && pathname === '/api/v3/auth/login') {
      await route.fulfill({
        status: 200,
        json: {
          code: 200,
          message: 'Inicio de sesión exitoso',
          data: {
            authUserId: 2,
            email: 'recepcion@medireservas.cl',
            token: 'e2e-reception-token',
            roles: ['RECEPTIONIST'],
          },
        },
      })
      return
    } else if (method === 'GET' && pathname === '/api/v3/users/me') {
      await route.fulfill({
        status: 200,
        json: {
          code: 200,
          message: 'Usuario autenticado',
          data: {
            userId: 2,
            authUserId: 2,
            run: '22222222-2',
            email: 'recepcion@medireservas.cl',
            active: true,
            firstName: 'Ricardo',
            lastName: 'Silva',
          },
        },
      })
      return
    } else if (method === 'GET' && pathname === '/api/v3/appointments') {
      responseData = appointments
    } else if (method === 'GET' && pathname === '/api/v3/schedule-slots') {
      responseData = slots
    } else if (method === 'GET' && pathname === '/api/v3/users') {
      responseData = mockUsers.map(({ userId, run }) => ({ userId, run }))
    } else if (method === 'GET' && pathname === '/api/v3/user-profiles') {
      responseData = mockUsers.map(({ userId, firstName, lastName }) => ({
        userProfileId: userId,
        userId,
        firstName,
        lastName,
        phone: '',
        birthDate: null,
        address: '',
      }))
    } else if (method === 'GET' && pathname === '/api/v3/doctors') {
      responseData = mockDoctors.map(({ doctorId, userId, specialtyIds, medicalLicenseNumber, active }) => ({
        doctorId,
        userId,
        specialtyIds,
        medicalLicenseNumber,
        active,
      }))
    } else if (method === 'GET' && pathname === '/api/v3/specialties') {
      responseData = {
        code: 200,
        message: 'Especialidades obtenidas',
        data: mockSpecialties.map(({ specialtyId, specialtyName }) => ({ specialtyId, specialtyName })),
      }
    } else if (method === 'PATCH' && pathname.endsWith('/confirm')) {
      const appointmentId = Number(pathname.split('/').at(-2))
      const appointment = appointments.find((item) => item.appointmentId === appointmentId)
      if (appointment) appointment.appointmentStatus = 'CONFIRMED'
      message = 'Cita confirmada'
    } else if (method === 'PATCH' && pathname.endsWith('/cancel')) {
      const appointmentId = Number(pathname.split('/').at(-2))
      const appointment = appointments.find((item) => item.appointmentId === appointmentId)
      if (appointment) {
        appointment.appointmentStatus = 'CANCELLED'
        const slot = slots.find((item) => item.scheduleSlotId === appointment.scheduleSlotId)
        if (slot) {
          slot.slotStatus = 'LIBERADO_POR_CANCELACION'
          slot.appointmentId = null
        }
      }
      message = 'Cita cancelada'
    } else if (method === 'PUT' && /^\/api\/v3\/appointments\/\d+$/.test(pathname)) {
      const appointmentId = Number(pathname.split('/').at(-1))
      const appointment = appointments.find((item) => item.appointmentId === appointmentId)
      const body = route.request().postDataJSON() as { scheduleSlotId: number }
      if (appointment) {
        const oldSlot = slots.find((item) => item.scheduleSlotId === appointment.scheduleSlotId)
        if (oldSlot) {
          oldSlot.slotStatus = 'LIBERADO_POR_CANCELACION'
          oldSlot.appointmentId = null
        }
        appointment.scheduleSlotId = body.scheduleSlotId
        const newSlot = slots.find((item) => item.scheduleSlotId === body.scheduleSlotId)
        if (newSlot) {
          newSlot.slotStatus = 'RESERVADO'
          newSlot.appointmentId = appointment.appointmentId
        }
      }
      message = 'Cita actualizada'
    } else {
      await route.fulfill({ status: 404, json: { code: 404, message: 'Ruta no simulada', data: null } })
      return
    }

    const wrappedData = method === 'GET' && pathname === '/api/v3/doctors'
      ? responseData
      : method === 'GET' && pathname === '/api/v3/specialties'
        ? responseData
        : { code: 200, message, data: responseData }
    await route.fulfill({ status: 200, json: wrappedData })
  })

  return { appointments, slots }
}
