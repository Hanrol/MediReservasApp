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
