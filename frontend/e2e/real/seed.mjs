const gateway = (process.env.E2E_API_PROXY_TARGET ?? 'http://127.0.0.1:19013').replace(/\/+$/, '')
const masterAdmin = {
  email: 'admin-e2e@medireservas.local',
  password: 'E2eAdmin123!',
}
const patient = {
  email: 'patient-e2e@medireservas.local',
  password: 'E2ePatient123!',
}
const doctor = {
  email: 'doctor-e2e@medireservas.local',
  password: 'E2eDoctor123!',
}

async function api(path, { token, body, expectedStatus } = {}) {
  const response = await fetch(`${gateway}/api/v3${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let payload
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = { message: text }
  }
  if (!response.ok || (expectedStatus && response.status !== expectedStatus)) {
    throw new Error(
      `E2E seed: ${path} respondió HTTP ${response.status}: ${payload?.message ?? text}`,
    )
  }
  return payload?.data
}

async function login(credentials) {
  const result = await api('/auth/login', {
    body: credentials,
    expectedStatus: 200,
  })
  if (!result?.token) throw new Error(`E2E seed: no se pudo autenticar ${credentials.email}`)
  return result.token
}

async function loginAdminWithRetry() {
  const deadline = Date.now() + 120_000
  let lastError
  while (Date.now() < deadline) {
    try {
      return await login(masterAdmin)
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 2_000))
    }
  }
  throw new Error(`E2E seed: el admin inicial no estuvo listo a tiempo: ${lastError}`)
}

function clinicDateAfter(days) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

const adminToken = await loginAdminWithRetry()
const invitation = await api('/admin/invitations', {
  token: adminToken,
  body: { email: doctor.email, role: 'DOCTOR' },
  expectedStatus: 201,
})
await api('/invitations/accept', {
  body: {
    token: invitation.token,
    run: '33333333-3',
    firstName: 'Doctor',
    lastName: 'E2E',
    phone: '900000003',
    birthDate: '1985-04-03',
    address: 'Entorno de pruebas',
    password: doctor.password,
  },
  expectedStatus: 201,
})

const doctorToken = await login(doctor)
await api('/doctors/me', {
  token: doctorToken,
  body: {
    medicalLicenseNumber: `E2E-RUM-${Date.now()}`,
    specialtyIds: [1],
  },
  expectedStatus: 201,
})
const doctorProfileResponse = await fetch(`${gateway}/api/v3/doctors/me`, {
  headers: { Authorization: `Bearer ${doctorToken}` },
})
const doctorProfilePayload = await doctorProfileResponse.json()
if (!doctorProfileResponse.ok || !doctorProfilePayload?.doctorId) {
  throw new Error(`E2E seed: no se pudo consultar el perfil médico: HTTP ${doctorProfileResponse.status}`)
}
const doctorId = doctorProfilePayload.doctorId

await api('/schedule-slots', {
  token: doctorToken,
  body: {
    doctorId,
    slotDate: clinicDateAfter(8),
    startTime: '14:00:00',
    endTime: '14:30:00',
    slotStatus: 'DISPONIBLE',
    appointmentId: null,
  },
  expectedStatus: 201,
})

await api('/patient-registrations', {
  body: {
    run: '22222222-2',
    firstName: 'Paciente',
    lastName: 'E2E',
    birthDate: '1990-02-02',
    phone: '900000002',
    address: 'Entorno de pruebas',
    email: patient.email,
    password: patient.password,
    termsAccepted: true,
  },
  expectedStatus: 201,
})

console.log('E2E seed listo: usuario paciente, médico, especialidad y horario sintético creados.')
console.log(`Cuenta paciente: ${patient.email}`)
