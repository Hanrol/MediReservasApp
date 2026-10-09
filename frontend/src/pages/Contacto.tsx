import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import PublicFooter from '../components/layout/PublicFooter'
import PublicHeader from '../components/layout/PublicHeader'
import type { ContactErrors, ContactValues } from '../lib/types'
import { validateContact } from '../lib/validations'

const emptyForm: ContactValues = { nombre: '', correo: '', asunto: '', mensaje: '' }

function Contacto() {
  const [form, setForm] = useState<ContactValues>(emptyForm)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    document.title = 'Contacto | MediReservas'
  }, [])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccess('')
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateContact(form)

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) {
      setSuccess("");
      return;
    }

    setSuccess('El mensaje fue enviado correctamente.')
    setForm(emptyForm)
  };

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <a
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido principal
      </a>

      <PublicHeader currentPage="contact" />

      <main id="main-content" tabIndex={-1}>
        <section
          className="bg-primary-dark py-14 text-white sm:py-20"
          aria-labelledby="contact-title"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
              Estamos para ayudarte
            </p>

            <h1
              className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl"
              id="contact-title"
            >
              Contacto y ubicación
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50">
              Consulta nuestros canales de atención o envíanos un mensaje.
            </p>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
          aria-labelledby="contact-info-title"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Contacto
          </p>

          <h2 className="mt-2 text-3xl font-bold" id="contact-info-title">
            Información de atención
          </h2>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-dark">
                Dirección
              </h3>

              <p className="mt-3 text-muted">
                Av. Vicuña Mackenna 4917
              </p>

              <p className="text-muted">
                San Joaquín, Santiago
              </p>
            </article>

            <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-dark">
                Teléfono
              </h3>

              <a
                className="mt-3 inline-flex text-muted hover:text-primary"
                href="tel:+56223456789"
              >
                +56 2 2345 6789
              </a>
            </article>

            <article className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-bold text-primary-dark">
                Correo electrónico
              </h3>

              <a
                className="mt-3 inline-flex break-all text-muted hover:text-primary"
                href="mailto:contacto@medireservas.cl"
              >
                contacto@medireservas.cl
              </a>
            </article>
          </div>
        </section>

        <section
          className="border-y border-line bg-white py-14 sm:py-20"
          aria-labelledby="location-title"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Ubicación
              </p>

              <h2 className="mt-2 text-3xl font-bold" id="location-title">
                Encuéntranos en San Joaquín
              </h2>

              <p className="mt-4 leading-7 text-muted">
                Nuestra referencia de atención está ubicada cerca de Duoc UC
                sede San Joaquín.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-page p-2 shadow-sm">
              <iframe
                className="h-80 w-full rounded-xl sm:h-96"
                src="https://www.google.com/maps?q=Duoc+UC+San+Joaquín,+Santiago,+Chile&output=embed"
                title="Mapa de MediReservas en San Joaquín"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section
          className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16 lg:px-8"
          aria-labelledby="form-title"
        >
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Escríbenos
            </p>

            <h2 className="mt-2 text-3xl font-bold" id="form-title">
              Formulario de contacto
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Completa los datos y nuestro equipo responderá a tu correo
              electrónico.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-primary-light p-5">
              <p className="font-semibold text-primary-dark">
                Horario de atención
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Lunes a viernes, de 08:00 a 18:00 horas.
              </p>
            </div>
          </div>

          <form
            className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-semibold"
                >
                  Nombre
                </label>

                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  autoComplete="name"
                />

                <p
                  className="mt-1 min-h-5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.nombre}
                </p>
              </div>

              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-semibold"
                >
                  Correo electrónico
                </label>

                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  autoComplete="email"
                />

                <p
                  className="mt-1 min-h-5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.correo}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="asunto"
                className="block text-sm font-semibold"
              >
                Asunto
              </label>

              <input
                type="text"
                id="asunto"
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              />

              <p
                className="mt-1 min-h-5 text-sm text-red-600"
                role="alert"
              >
                {errors.asunto}
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="mensaje"
                className="block text-sm font-semibold"
              >
                Mensaje
              </label>

              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                value={form.mensaje}
                onChange={handleChange}
                className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              />

              <p
                className="mt-1 min-h-5 text-sm text-red-600"
                role="alert"
              >
                {errors.mensaje}
              </p>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark sm:w-auto"
            >
              Enviar mensaje
            </button>

            {success && (
              <div
                className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                role="status"
              >
                <p className="font-semibold text-emerald-700">
                  {success}
                </p>
              </div>
            )}
          </form>
        </section>
      </main>

      <PublicFooter compact />
    </div>
  )
}
export default Contacto
