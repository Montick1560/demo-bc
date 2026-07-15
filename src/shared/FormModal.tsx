import { useId, useRef, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useDialog } from './useDialog'

export function FormModal({
  open,
  title,
  eyebrow,
  submitLabel,
  onClose,
  onSubmit,
  children,
  wide = false,
  returnFocus,
}: {
  open: boolean
  title: string
  eyebrow?: string
  submitLabel: string
  onClose(): void
  onSubmit(event: FormEvent<HTMLFormElement>): void
  children: ReactNode
  wide?: boolean
  returnFocus?: HTMLElement | null
}) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLFormElement>(null)
  const titleId = useId()
  useDialog(open, dialogRef, onClose, returnFocus)
  if (!open) return null

  return createPortal(
    <div
      className="overlay form-modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        ref={dialogRef}
        className={`form-modal ${wide ? 'is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={onSubmit}
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
          <button type="button" className="secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="primary" type="submit">
            {submitLabel}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  )
}
