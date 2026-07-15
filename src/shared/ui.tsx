import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function Status({ children, tone = 'green' }: { children: ReactNode; tone?: string }) {
  return <span className={`status ${tone}`}>{children}</span>
}

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header>
          <h3>{title}</h3>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

type PageId = 'inicio' | 'planificacion' | 'cronograma' | 'riesgos' | 'control' | 'cierre' | 'roles'

export function PageHead({
  page,
  eyebrow,
  title,
  copy,
  onAdd,
}: {
  page?: PageId
  eyebrow: string
  title: string
  copy: string
  onAdd?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{page ? t(`pages.${page}.eyebrow`) : eyebrow}</span>
        <h2>{page ? t(`pages.${page}.title`) : title}</h2>
        <p>{page ? t(`pages.${page}.copy`) : copy}</p>
      </div>
      {onAdd && (
        <button className="primary" onClick={onAdd}>
          + {t('shell.newEntry')}
        </button>
      )}
    </div>
  )
}
