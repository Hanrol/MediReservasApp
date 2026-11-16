import { expect, test, type Page } from '@playwright/test'
import { mockDoctors } from '../src/data/mockDoctors'
import { mockSpecialties } from '../src/data/mockSpecialties'
import { mockUsers } from '../src/data/mockUsers'
import { loginAs } from './helpers'

const appointments = [
  { appointmentId: 11, patientUserId: 4, doctorId: 1, specialtyId: 1, scheduleSlotId: 21, slotDate: '2026-10-11', startTime: '09:00:00', endTime: '09:30:00', appointmentStatus: 'PENDING', reason: 'Control' },
  { appointmentId: 12, patientUserId: 4, doctorId: 1, specialtyId: 1, scheduleSlotId: 22, slotDate: '2026-10-11', startTime: '10:00:00', endTime: '10:30:00', appointmentStatus: 'CONFIRMED', reason: 'Control' },
  { appointmentId: 13, patientUserId: 5, doctorId: 1, specialtyId: 1, scheduleSlotId: 23, slotDate: '2026-10-10', startTime: '11:00:00', endTime: '11:30:00', appointmentStatus: 'COMPLETED', reason: 'Control' },
]

async function mockDashboardApi(page: Page) {
  await page.route('**/api/v3/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let data: unknown
    if (pathname === '/api/v3/appointments') {
      data = appointments.map(({ appointmentId, patientUserId, doctorId, specialtyId, scheduleSlotId, appointmentStatus, reason }) => ({
        appointmentId, patientUserId, doctorId, specialtyId, scheduleSlotId, appointmentStatus, reason,
      }))
    } else if (pathname === '/api/v3/appointments/doctor/1' || pathname === '/api/v3/appointments/patient/4') {
      data = appointments.filter((item) => pathname.endsWith('/doctor/1')
        ? item.doctorId === 1
        : item.patientUserId === 4)
    } else if (pathname === '/api/v3/schedule-slots') {
      data = appointments.map((item) => ({
        scheduleSlotId: item.scheduleSlotId, doctorId: item.doctorId, slotDate: item.slotDate,
        startTime: item.startTime, endTime: item.endTime, slotStatus: 'RESERVADO', appointmentId: item.appointmentId,
      }))
    } else if (pathname === '/api/v3/users') {
      data = mockUsers.map(({ userId, run }) => ({ userId, run }))
    } else if (pathname === '/api/v3/user-profiles') {
      data = mockUsers.map(({ userId, firstName, lastName }) => ({ userId, firstName, lastName }))
    } else if (pathname === '/api/v3/doctors') {
      data = mockDoctors
    } else if (pathname === '/api/v3/doctors/me') {
      data = { doctorId: 1, userId: 3, medicalLicenseNumber: 'E2E', active: true, specialtyIds: [1] }
    } else if (pathname === '/api/v3/doctors/directory') {
      data = mockDoctors.map((doctor) => ({
        doctorId: doctor.doctorId,
        firstName: mockUsers.find((user) => user.userId === doctor.userId)?.firstName ?? '',
        lastName: mockUsers.find((user) => user.userId === doctor.userId)?.lastName ?? '',
        specialties: mockSpecialties.filter((item) => doctor.specialtyIds.includes(item.specialtyId)),
      }))
    } else if (pathname === '/api/v3/specialties') {
      data = mockSpecialties.map(({ specialtyId, specialtyName }) => ({ specialtyId, specialtyName }))
    } else {
      await route.continue()
      return
    }
    const rawResponse = pathname === '/api/v3/doctors' || pathname === '/api/v3/doctors/me'
    await route.fulfill({
      status: 200,
      json: rawResponse ? data : { code: 200, message: 'Simulado para E2E', data },
    })
  })

}

for (const [email, label] of [
  ['recepcion@medireservas.cl', 'Citas pendientes'],
  ['medico@medireservas.cl', 'Atenciones completadas'],
  ['paciente@medireservas.cl', 'Atenciones realizadas'],
] as const) {
  test(`CP-146 · ${email} obtiene el resumen desde APIs simuladas`, async ({ page }) => {
    await mockDashboardApi(page)
    await loginAs(page, email, 'E2E123')
    await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible()
    await expect(page.getByText(label)).toBeVisible()
  })
}
