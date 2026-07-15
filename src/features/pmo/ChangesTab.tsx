import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import type { ChangeStatus } from '../../shared/contracts'
import { formatCurrency } from '../../shared/format'
import { useCapability, useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card } from '../../shared/ui'

export function ChangesTab({ notify }: { notify: (message: string) => void }) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const canDecide = useCapability('changes:decide')
  const {
    data: changes,
    loading,
    error,
    reload,
  } = useServiceResource(() => services.changes.list(), [services])
  const decide = async (id: string, status: Exclude<ChangeStatus, 'pending'>) => {
    const result = await services.changes.decide(id, status)
    if (result.ok) notify(`${id}: ${t(`common.${status}`)}`)
    await reload()
  }
  const approved = changes?.filter((item) => item.status === 'approved') ?? []
  const cost = approved.reduce((sum, item) => sum + item.cost, 0)
  const days = approved.reduce((sum, item) => sum + item.days, 0)
  return (
    <div className="pmo-layout">
      <section className="change-impact wide">
        <div>
          <span>{t('pmo.changeImpact')}</span>
          <b>{formatCurrency(cost, i18n.resolvedLanguage)}</b>
        </div>
        <div>
          <span>{t('pmo.reserve')}</span>
          <b>{formatCurrency(920_000 - cost, i18n.resolvedLanguage)}</b>
        </div>
        <div>
          <span>{t('pmo.scheduleVariance')}</span>
          <b>{days} días</b>
        </div>
      </section>
      <Card className="change-board wide">
        <header>
          <div>
            <h3>{t('pmo.changeCommittee')}</h3>
            <p>{t('pmo.integratedEvaluation')}</p>
          </div>
          <span>{t('pmo.quorum')}</span>
        </header>
        <AsyncState loading={loading} error={error?.message} />
        {changes?.map((change) => (
          <article key={change.id}>
            <div className="change-id">
              <b>{change.id}</b>
              <small>{change.owner}</small>
            </div>
            <div>
              <b>{change.title}</b>
              <span>
                <i>
                  Cost {change.cost >= 0 ? '+' : ''}
                  {formatCurrency(change.cost, i18n.resolvedLanguage)}
                </i>
                <i>
                  Schedule {change.days >= 0 ? '+' : ''}
                  {change.days} days
                </i>
                <i>Risk {t(`common.${change.risk}`)}</i>
              </span>
            </div>
            <em className={change.status}>{t(`common.${change.status}`)}</em>
            {canDecide && (
              <div className="change-actions">
                <button
                  disabled={change.status !== 'pending'}
                  onClick={() => void decide(change.id, 'rejected')}
                >
                  {t('pmo.reject')}
                </button>
                <button
                  disabled={change.status !== 'pending'}
                  onClick={() => void decide(change.id, 'approved')}
                >
                  {t('pmo.approve')}
                </button>
              </div>
            )}
          </article>
        ))}
      </Card>
    </div>
  )
}
