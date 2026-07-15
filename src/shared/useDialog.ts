import { useEffect, useRef, type RefObject } from 'react'

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDialog(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  returnFocus?: HTMLElement | null,
) {
  const previousFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const returnFocusRef = useRef(returnFocus)
  returnFocusRef.current = returnFocus

  useEffect(() => {
    if (!open) return

    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('has-modal')
    const background = document.querySelector<HTMLElement>('[data-app-background]')
    background?.setAttribute('inert', '')
    background?.setAttribute('aria-hidden', 'true')

    const dialog = dialogRef.current
    const initialFocus = dialog?.querySelector<HTMLElement>('[data-autofocus]')
    const focusable = dialog?.querySelectorAll<HTMLElement>(focusableSelector)
    ;(initialFocus ?? focusable?.[0])?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('has-modal')
      background?.removeAttribute('inert')
      background?.removeAttribute('aria-hidden')
      const focusTarget = returnFocusRef.current ?? previousFocus.current
      window.requestAnimationFrame(() => focusTarget?.focus())
    }
  }, [open, dialogRef])
}
