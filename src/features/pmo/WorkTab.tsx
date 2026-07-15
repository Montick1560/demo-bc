import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { formatCurrency } from '../../shared/format'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card } from '../../shared/ui'

export function WorkTab({ openChanges }: { openChanges: () => void }) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const {
    data: actions,
    loading,
    error,
    reload,
  } = useServiceResource(() => services.governance.listActions(), [services])
  const toggle = async (id: string, complete: boolean) => {
    await services.governance.setActionComplete(id, complete)
    await reload()
  }
  const complete = actions?.filter((action) => action.complete).length ?? 0

  return (
    <div className="pmo-layout">
      <section className="pmo-kpis wide">
        <article>
          <span>{t('pmo.actionsOpen')}</span>
          <b>14</b>
          <small>{t('pmo.dueThisWeek')}</small>
        </article>
        <article>
          <span>{t('pmo.approvalsPending')}</span>
          <b>{formatCurrency(515_000, i18n.resolvedLanguage)}</b>
          <small>{t('pmo.underReview')}</small>
        </article>
        <article>
          <span>{t('pmo.decisionsOpen')}</span>
          <b>2</b>
          <small>{t('pmo.age')}</small>
        </article>
        <article>
          <span>{t('pmo.health')}</span>
          <b className="health-score">82</b>
          <small>{t('pmo.stable')}</small>
        </article>
      </section>
      <Card
        title={t('pmo.priorityActions')}
        action={
          <span>
            {complete} {t('common.completed')}
          </span>
        }
        className="action-board"
      >
        <AsyncState loading={loading} error={error?.message} />
        {actions?.map((action) => (
          <label className={action.complete ? 'complete' : ''} key={action.id}>
            <input
              type="checkbox"
              checked={action.complete}
              onChange={() => void toggle(action.id, !action.complete)}
            />
            <i className={`priority ${action.priority}`} />
            <span>
              <b>{action.title}</b>
              <small>
                {action.id} / {action.area} / {action.owner}
              </small>
            </span>
            <em>{action.due === 'Hoy' ? t('common.today') : action.due}</em>
          </label>
        ))}
      </Card>
      <Card
        title={t('pmo.upcomingDecisions')}
        action={<button onClick={openChanges}>{t('pmo.reviewAll')}</button>}
        className="decision-board"
      >
        {[
          ['12 JUL', 'Proveedor alterno de acero', 'Comité de cambios', 'Impacto alto'],
          ['15 JUL', 'Segundo turno de instalaciones', 'Project Manager', 'Impacto medio'],
          ['18 JUL', 'Liberación del hito de cimentación', 'Cliente', 'Hito contractual'],
        ].map(([date, title, owner, impact]) => (
          <div key={title}>
            <span>
              <i>{date}</i>
              <b>{title}</b>
              <small>Decide: {owner}</small>
            </span>
            <strong>{impact}</strong>
          </div>
        ))}
      </Card>
    </div>
  )
}
