import { useTranslation } from 'react-i18next'

export function AsyncState({ loading, error }: { loading: boolean; error?: string | null }) {
  const { t } = useTranslation()
  if (loading)
    return (
      <p className="async-state" role="status">
        {t('common.loading')}
      </p>
    )
  if (error)
    return (
      <p className="async-state" role="alert">
        {error}
      </p>
    )
  return null
}
