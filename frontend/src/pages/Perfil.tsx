import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import DashboardHeader from '../components/layout/DashboardHeader'
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

  const navigation = [
    { icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true },
    { icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true },
    ...config.actions,
  ]


  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <DashboardHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />

      <button className={`fixed inset-0 z-40 bg-slate-950/45 lg:hidden ${menuOpen ? '' : 'hidden'}`} type="button" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)} />
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:px-5 lg:py-8 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Menú del panel">
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5 lg:hidden">
            <p className="font-bold text-primary-dark">Menú principal</p>
            <button className="grid size-10 place-items-center rounded-xl border border-line text-xl text-muted" type="button" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)}>×</button>
          </header>
          <nav className="lg:sticky lg:top-8">
            <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p>
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => (
                <li key={item.title}>
                  {item.reactRoute ? (
                    <Link className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-primary-light hover:text-primary-dark ${item.href === '/perfil' ? 'bg-primary-light text-primary-dark' : 'text-muted'}`} to={item.href} aria-current={item.href === '/perfil' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark" aria-hidden="true">{item.icon}</span>{item.title}
                    </Link>
                  ) : (
                    <a className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-primary-light hover:text-primary-dark" href={item.href} onClick={() => setMenuOpen(false)}>
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark" aria-hidden="true">{item.icon}</span>{item.title}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-8" id="main-content" tabIndex={-1}>
          <nav className="mb-6 overflow-x-auto text-sm" aria-label="Ruta de navegación">
            <ol className="flex min-w-max items-center gap-2 text-muted">
              <li><Link className="font-semibold text-primary-dark hover:underline" to="/dashboard">Panel principal</Link></li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-ink" aria-current="page">Mi perfil</li>
            </ol>
          </nav>
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
