import { useTranslation } from 'react-i18next'

export function AccessDenied({ onBack }: { onBack(): void }) {
  const { t } = useTranslation()
  return (
    <section className="access-denied">
      <span className="eyebrow">403</span>
      <h2>{t('common.accessDenied')}</h2>
      <p>{t('pages.roles.copy')}</p>
      <button className="primary" onClick={onBack}>
        {t('common.backToDashboard')}
      </button>
    </section>
  )
}
