import { useEffect, useState, type FormEvent } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import { createProfileData } from '../../utils/profile'
import { DASHBOARD_CONFIG } from '../../constants/roles'
import {
  createDoctorProfileForCurrentUser,
  getActiveSpecialties,
  getDoctorProfileForCurrentUser,
  getProfileCompletion,
  getMyPatientProfile,
  updateMyPatientProfile,
  updateMyProfile,
  type DoctorProfileData,
  type ProfileCompletion,
  type PatientProfileData,
  type SpecialtyOption,
} from '../../services/profile-onboarding.service'

function getLatestBirthDate() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function Perfil() {
  const { user } = useAuth()
  const { session, startSession } = useAuth()
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfileData | null>(null)
  const [doctorLicense, setDoctorLicense] = useState('')
  const [specialtyIds, setSpecialtyIds] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [patientDetailsLoaded, setPatientDetailsLoaded] = useState(false)
  const [patientDetails, setPatientDetails] = useState<Omit<PatientProfileData, 'patientProfileId' | 'userId'>>({
    healthInsurance: '', emergencyContactName: '', emergencyContactPhone: '', bloodType: '', allergies: '', weight: null,
  })
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const config = user ? DASHBOARD_CONFIG[user.role] : null
  const profile = user && config ? createProfileData(user, config.label) : null

  useEffect(() => {
    if (profile) document.title = `${profile.fullName} | MediReservas`
  }, [profile])

  useEffect(() => {
    if (!session || !user || user.role === 'ADMIN') return
    let active = true
    void getProfileCompletion(session.token).then(async (status) => {
      if (!active) return
      setCompletion(status)
      if (status.role === 'DOCTOR') {
        const [catalog, doctor] = await Promise.all([
          getActiveSpecialties(session.token),
          getDoctorProfileForCurrentUser(session.token).catch(() => null),
        ])
        if (!active) return
        setSpecialties(catalog)
        setDoctorProfile(doctor)
        if (doctor) {
          setDoctorLicense(doctor.medicalLicenseNumber)
          setSpecialtyIds(doctor.specialtyIds)
        }
      } else if (status.role === 'PATIENT') {
        const patientProfile = await getMyPatientProfile(session.token, user.userId)
        if (!active) return
        setPatientDetails({
          healthInsurance: patientProfile.healthInsurance ?? '',
          emergencyContactName: patientProfile.emergencyContactName ?? '',
          emergencyContactPhone: patientProfile.emergencyContactPhone ?? '',
          bloodType: patientProfile.bloodType ?? '',
          allergies: patientProfile.allergies ?? '',
          weight: patientProfile.weight,
        })
        setPatientDetailsLoaded(true)
      }
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el estado del perfil.')
    })
    return () => { active = false }
  }, [session, user])

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !session) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateMyProfile(session.token, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: phone.trim(),
        birthDate: birthDate || null,
        address: address.trim(),
      })
      startSession({
        ...user,
        ...updated,
        phone: updated.phone ?? undefined,
        birthDate: updated.birthDate ?? undefined,
        address: updated.address ?? undefined,
      }, session.token)
      const status = await getProfileCompletion(session.token)
      setCompletion(status)
      setMessage(status.complete ? 'Tu perfil está completo.' : 'Datos personales guardados.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron guardar tus datos.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDoctorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const created = await createDoctorProfileForCurrentUser(session.token, {
        medicalLicenseNumber: doctorLicense.trim(),
        specialtyIds,
      })
      setDoctorProfile(created)
      const status = await getProfileCompletion(session.token)
      setCompletion(status)
      setMessage(status.complete ? 'Tu perfil está completo.' : 'Perfil profesional guardado.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el perfil profesional.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePatientDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateMyPatientProfile(session.token, {
        healthInsurance: patientDetails.healthInsurance?.trim() || null,
        emergencyContactName: patientDetails.emergencyContactName?.trim() || null,
        emergencyContactPhone: patientDetails.emergencyContactPhone?.trim() || null,
        bloodType: patientDetails.bloodType?.trim() || null,
        allergies: patientDetails.allergies?.trim() || null,
        weight: patientDetails.weight,
      })
      setPatientDetails({
        healthInsurance: updated.healthInsurance ?? '',
        emergencyContactName: updated.emergencyContactName ?? '',
        emergencyContactPhone: updated.emergencyContactPhone ?? '',
        bloodType: updated.bloodType ?? '',
        allergies: updated.allergies ?? '',
        weight: updated.weight,
      })
      setMessage('Datos opcionales de atención guardados.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron guardar los datos opcionales.')
    } finally {
      setSaving(false)
    }
  }


  if (!user || !config || !profile) return <Navigate to={ROUTES.login} replace />



  return (
    <DashboardLayout currentPath={ROUTES.profile} mainClassName="flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-8">

      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Mi perfil' }]} />
      <section className="mx-auto max-w-4xl" aria-labelledby="profile-title">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Cuenta personal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="profile-title">Mi perfil</h1>
          <p className="mt-3 text-muted">Mantén actualizados los datos asociados a tu cuenta.</p>
        </div>

        <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm" aria-labelledby="personal-data-title">
          <header className="flex items-center gap-5 bg-primary-dark p-6 text-white sm:p-8">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl font-bold sm:size-20 sm:text-2xl" aria-hidden="true">{profile.initials}</div>
            <div><h2 className="text-xl font-bold sm:text-2xl">{profile.fullName}</h2><p className="mt-1 text-sm text-emerald-100">{profile.role}</p></div>
          </header>
          <section className="p-6 sm:p-8" aria-labelledby="personal-data-title">
            <h2 className="text-xl font-bold" id="personal-data-title">Datos personales</h2>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {[
                ['RUN', profile.run],
                ['Correo electrónico', profile.email],
                ['Estado de la cuenta', profile.status],
              ].map(([label, value]) => (
                <div className="border-b border-line py-3" key={label}><dt className="text-sm font-medium text-muted">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>
              ))}
            </dl>
            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
              <label className="grid gap-2 text-sm font-semibold">Nombre
                <input className="min-h-11 rounded-xl border border-line px-3 font-normal" value={user.firstName} readOnly />
              </label>
              <label className="grid gap-2 text-sm font-semibold">Apellidos
                <input className="min-h-11 rounded-xl border border-line px-3 font-normal" value={user.lastName} readOnly />
              </label>
              <label className="grid gap-2 text-sm font-semibold">Teléfono <span className="font-normal text-muted">Opcional</span>
                <input className="min-h-11 rounded-xl border border-line px-3 font-normal" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">Fecha de nacimiento <span className="font-normal text-muted">Opcional</span>
                <input className="min-h-11 rounded-xl border border-line px-3 font-normal" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} max={getLatestBirthDate()} />
              </label>
              <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Dirección <span className="font-normal text-muted">Opcional</span>
                <input className="min-h-11 rounded-xl border border-line px-3 font-normal" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={150} />
              </label>
              {user.role === 'PATIENT' && <p className="text-sm text-muted sm:col-span-2">Los datos de contacto y antecedentes médicos son opcionales; no necesitas completarlos para que tu perfil figure como completo.</p>}
              <button className="min-h-11 rounded-xl bg-primary-dark px-5 py-2 font-semibold text-white hover:bg-primary disabled:opacity-60 sm:col-span-2 sm:justify-self-start" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar datos personales'}</button>
            </form>
            {user.role === 'PATIENT' && (
              <details className="mt-7 rounded-2xl border border-line p-5">
                <summary className="cursor-pointer font-semibold">Datos opcionales para tu atención</summary>
                <p className="mt-2 text-sm text-muted">Son voluntarios, no afectan el estado de completitud y puedes dejarlos vacíos.</p>
                <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handlePatientDetailsSubmit}>
                  <label className="grid gap-2 text-sm font-semibold">Previsión
                    <input className="min-h-11 rounded-xl border border-line px-3 font-normal" maxLength={80} value={patientDetails.healthInsurance ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, healthInsurance: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Grupo sanguíneo
                    <input className="min-h-11 rounded-xl border border-line px-3 font-normal" maxLength={10} value={patientDetails.bloodType ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, bloodType: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Contacto de emergencia
                    <input className="min-h-11 rounded-xl border border-line px-3 font-normal" maxLength={100} value={patientDetails.emergencyContactName ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, emergencyContactName: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Teléfono de emergencia
                    <input className="min-h-11 rounded-xl border border-line px-3 font-normal" type="tel" maxLength={20} value={patientDetails.emergencyContactPhone ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, emergencyContactPhone: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Alergias (opcional)
                    <textarea className="min-h-20 rounded-xl border border-line p-3 font-normal" maxLength={255} value={patientDetails.allergies ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, allergies: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Peso (kg, opcional)
                    <input className="min-h-11 rounded-xl border border-line px-3 font-normal" type="number" min="1" max="400" step="0.01" value={patientDetails.weight ?? ''} onChange={(event) => setPatientDetails({ ...patientDetails, weight: event.target.value === '' ? null : Number(event.target.value) })} />
                  </label>
                  <button className="min-h-11 rounded-xl border border-primary px-5 py-2 font-semibold text-primary-dark disabled:opacity-60 sm:col-span-2 sm:justify-self-start" disabled={saving || !patientDetailsLoaded} type="submit">Guardar datos opcionales</button>
                </form>
              </details>
            )}
          </section>
        </article>
        {user.role === 'DOCTOR' && completion?.missingFields.includes('doctorProfile') && (
          <section className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8" aria-labelledby="professional-profile-title">
            <h2 className="text-xl font-bold" id="professional-profile-title">Perfil profesional</h2>
            <p className="mt-2 text-sm text-muted">Ingresa tu número de registro profesional y al menos una especialidad para habilitar tu perfil médico.</p>
            {doctorProfile ? <p className="mt-4 text-sm font-semibold text-emerald-800">Perfil profesional ya registrado.</p> : (
              <form className="mt-5 grid gap-5" onSubmit={handleDoctorSubmit}>
                <label className="grid gap-2 text-sm font-semibold">Número de registro profesional
                  <input className="min-h-11 rounded-xl border border-line px-3 font-normal" value={doctorLicense} onChange={(event) => setDoctorLicense(event.target.value)} required maxLength={50} />
                </label>
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-semibold">Especialidades (selecciona una o más)</legend>
                  {specialties.map((specialty) => (
                    <label className="flex items-center gap-3 py-1 text-sm" key={specialty.specialtyId}>
                      <input type="checkbox" checked={specialtyIds.includes(specialty.specialtyId)} onChange={(event) => setSpecialtyIds((current) => event.target.checked ? [...current, specialty.specialtyId] : current.filter((id) => id !== specialty.specialtyId))} />
                      {specialty.specialtyName}
                    </label>
                  ))}
                  {specialties.length === 0 && <p className="text-sm text-muted">No hay especialidades disponibles; contacta con administración.</p>}
                </fieldset>
                <button className="min-h-11 rounded-xl bg-primary-dark px-5 py-2 font-semibold text-white hover:bg-primary disabled:opacity-60 sm:justify-self-start" disabled={saving || specialties.length === 0 || specialtyIds.length === 0} type="submit">{saving ? 'Guardando…' : 'Guardar perfil profesional'}</button>
              </form>
            )}
          </section>
        )}
        {message && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-900" role="status">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-900" role="alert">{error}</p>}
      </section>
    </DashboardLayout>
  )
}

export default Perfil
