import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useDialog } from './useDialog'

// Read-only companion to FormModal: same accessible dialog shell (portal, focus
// trap, Escape, inert background, focus restore) but for reviewing records and
// documents instead of data entry, so it renders content plus a single close
// control rather than a form with a submit action.
export function DetailModal({
  open,
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
  returnFocus,
}: {
  open: boolean
  title: string
  eyebrow?: string
  onClose(): void
  children: ReactNode
  wide?: boolean
  returnFocus?: HTMLElement | null
}) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDialog(open, dialogRef, onClose, returnFocus)
  if (!open) return null

  return createPortal(
    <div
      className="overlay form-modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className={`form-modal ${wide ? 'is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" aria-label={t('common.close')} onClick={onClose}>
            ×
          </button>
        </header>
        <div className="form-modal-body">{children}</div>
        <footer>
          <button type="button" className="primary" data-autofocus onClick={onClose}>
            {t('common.close')}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
