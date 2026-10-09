interface SkipLinkProps {
  targetId?: string
}

function SkipLink({ targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
      href={`#${targetId}`}
    >
      Saltar al contenido principal
    </a>
  )
}

export default SkipLink
