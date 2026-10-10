import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

function Modal({ title, eyebrow, children, footer, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl outline-none sm:p-8" role="dialog" aria-modal="true" aria-labelledby="shared-modal-title" tabIndex={-1}>
        <header className="flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>}
            <h2 className="mt-2 text-2xl font-bold" id="shared-modal-title">{title}</h2>
          </div>
          <button className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-xl text-muted hover:bg-page" type="button" aria-label="Cerrar ventana" onClick={onClose}>×</button>
        </header>
        <div className="mt-6">{children}</div>
        {footer && <footer className="mt-7">{footer}</footer>}
      </section>
    </div>
  )
}

export default Modal
