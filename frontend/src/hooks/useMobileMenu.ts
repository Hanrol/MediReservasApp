import { useCallback, useEffect, useRef, useState } from 'react'

export function useMobileMenu<T extends HTMLElement>() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuContainer = useRef<T>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const toggleMenu = useCallback(() => setMenuOpen((current) => !current), [])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }

    function closeOnResize() {
      if (window.innerWidth >= 1024) closeMenu()
    }

    function closeOnOutsideClick(event: MouseEvent) {
      const container = menuContainer.current
      if (container && !container.contains(event.target as Node)) closeMenu()
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('click', closeOnOutsideClick)
    window.addEventListener('resize', closeOnResize)

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('click', closeOnOutsideClick)
      window.removeEventListener('resize', closeOnResize)
    }
  }, [closeMenu])

  return { menuOpen, menuContainer, closeMenu, openMenu, toggleMenu }
}
