import { useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Navigate } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { createProfileData } from '../lib/profile'
import { DASHBOARD_CONFIG } from '../lib/roles'
import { getSession, getUserById } from '../lib/storage'

function Perfil() {
  const session = getSession()
  const user = session ? getUserById(session.userId) : undefined
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const profile = user && config ? createProfileData(user, config.label) : null

  useEffect(() => {
    if (profile) document.title = `${profile.fullName} | MediReservas`
  }, [profile])


  if (!session || !config || !profile) return <Navigate to="/login" replace />



  return (
    <DashboardLayout currentPath="/perfil" mainClassName="flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-8">

      <Breadcrumbs items={[{ label: 'Panel principal', href: '/dashboard' }, { label: 'Mi perfil' }]} />
      <section className="mx-auto max-w-4xl" aria-labelledby="profile-title">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Cuenta personal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="profile-title">Mi perfil</h1>
          <p className="mt-3 text-muted">Consulta la información asociada a tu cuenta.</p>
        </div>

        <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm" aria-labelledby="personal-data-title">
          <header className="flex items-center gap-5 bg-primary-dark p-6 text-white sm:p-8">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl font-bold sm:size-20 sm:text-2xl" aria-hidden="true">{profile.initials}</div>
            <div><h2 className="text-xl font-bold sm:text-2xl">{profile.fullName}</h2><p className="mt-1 text-sm text-emerald-100">{profile.role}</p></div>
          </header>
          <section className="p-6 sm:p-8" aria-labelledby="personal-data-title">
            <h2 className="text-xl font-bold" id="personal-data-title">Datos personales</h2>
            <dl className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {[
                ['RUN', profile.run],
                ['Correo electrónico', profile.email],
                ['Teléfono', profile.phone],
                ['Fecha de nacimiento', profile.birthDate],
                ['Dirección', profile.address],
              ].map(([label, value]) => (
                <div className="border-b border-line py-4" key={label}><dt className="text-sm font-medium text-muted">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>
              ))}
              <div className="border-b border-line py-4"><dt className="text-sm font-medium text-muted">Estado de la cuenta</dt><dd className="mt-1 inline-flex rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark">{profile.status}</dd></div>
            </dl>
          </section>
        </article>
      </section>
    </DashboardLayout>
  )
}

export default Perfil
