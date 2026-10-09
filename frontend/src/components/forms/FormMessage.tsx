interface FormMessageProps {
  children?: string
  id?: string
  className?: string
}

function FormMessage({ children, id, className = '' }: FormMessageProps) {
  return (
    <p className={`mt-1.5 min-h-5 text-sm text-red-600 ${className}`} id={id} role="alert">
      {children}
    </p>
  )
}

export default FormMessage
