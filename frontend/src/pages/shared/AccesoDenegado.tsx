import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SkipLink from '../../components/ui/SkipLink'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'

function AccesoDenegado() {
  const { logout } = useAuth()

  useEffect(() => {
    document.title = 'Acceso restringido | MediReservas'
  }, [])

  return (
    <div className="grid min-h-screen place-items-center bg-page px-4 py-10 text-ink antialiased sm:px-6">
      <SkipLink />

      <main className="w-full max-w-xl" id="main-content" tabIndex={-1}>
        <section
          className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
          aria-labelledby="access-title"
        >
          <div className="bg-primary-dark px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <span
              className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/15 text-3xl font-bold"
              aria-hidden="true"
            >
              !
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-emerald-200">
              Acceso restringido
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="access-title">
              No tienes permiso para ingresar
            </h1>
          </div>

          <div className="p-6 text-center sm:p-10">
            <p className="leading-7 text-muted">
              Tu sesión está activa, pero el perfil asociado a tu cuenta no puede acceder a esta sección.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
                to={ROUTES.dashboard}
              >
                Volver al panel
              </Link>
              <button
                className="rounded-xl border border-line px-5 py-3 font-semibold text-primary-dark transition hover:bg-primary-light"
                type="button"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </section>

        <Link
          className="mx-auto mt-6 block w-fit text-sm font-semibold text-primary-dark hover:underline"
          to={ROUTES.home}
        >
          Ir al inicio de MediReservas
        </Link>
      </main>
    </div>
  )
}

export default AccesoDenegado
