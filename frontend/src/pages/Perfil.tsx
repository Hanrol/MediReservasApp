import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import DashboardHeader from '../components/layout/DashboardHeader'
import DashboardSidebar from '../components/layout/DashboardSidebar'
import { createProfileData } from '../lib/profile'
import { DASHBOARD_CONFIG } from '../lib/roles'
import { getSession, getUserById } from '../lib/storage'

function Perfil() {
  const session = getSession()
  const user = session ? getUserById(session.userId) : undefined
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const [menuOpen, setMenuOpen] = useState(false)
  const profile = user && config ? createProfileData(user, config.label) : null

  useEffect(() => {
    if (profile) document.title = `${profile.fullName} | MediReservas`
  }, [profile])

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', menuOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen])

  if (!session || !config || !profile) return <Navigate to="/login" replace />



  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <DashboardHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />

      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <DashboardSidebar currentPath="/perfil" menuOpen={menuOpen} onCloseMenu={() => setMenuOpen(false)} />

        <main className="min-w-0 flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-8" id="main-content" tabIndex={-1}>
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
        </main>
      </div>

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted"><p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p></footer>
    </div>
  )
}

export default Perfil
