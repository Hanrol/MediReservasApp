import { useCallback, useEffect, useState } from 'react'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { getContactMessages, type ContactMessage } from '../../services/contact-messages.service'

function formatReceivedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function MensajesContacto() {
  const { session } = useAuth()
  const token = session?.token
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      setMessages(await getContactMessages(token))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los mensajes de contacto.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  useEffect(() => {
    document.title = 'Mensajes de contacto | MediReservas'
  }, [])

  return (
    <DashboardLayout currentPath={ROUTES.contactMessages}>
      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Mensajes de contacto' }]} />
      <section className="mx-auto max-w-5xl" aria-labelledby="contact-messages-title">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Recepción</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="contact-messages-title">Mensajes de contacto</h1>
            <p className="mt-3 text-muted">Bandeja compartida: los mensajes enviados por el formulario están disponibles para todo el equipo de recepción.</p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:bg-page disabled:opacity-60">
            Actualizar
          </button>
        </header>

        {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p>}
        {loading && <p className="mt-6 text-muted" role="status">Cargando mensajes…</p>}
        {!loading && !error && messages.length === 0 && (
          <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">Aún no se han recibido mensajes.</p>
        )}
        {!loading && !error && messages.length > 0 && (
          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <article className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6" key={message.contactMessageId}>
                <header className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{message.subject}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {message.name} · <a className="text-primary underline" href={`mailto:${message.email}`}>{message.email}</a>
                    </p>
                  </div>
                  <time className="shrink-0 text-sm text-muted" dateTime={message.createdAt}>{formatReceivedAt(message.createdAt)}</time>
                </header>
                <p className="mt-4 whitespace-pre-wrap leading-7">{message.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}

export default MensajesContacto
