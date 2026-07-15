import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import { formatCurrency } from '../../shared/format'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card, PageHead, Status } from '../../shared/ui'

export function ClosureView({
  onAdd,
  notify,
}: {
  onAdd?: () => void
  notify: (message: string) => void
}) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const {
    data: items,
    loading,
    error,
  } = useServiceResource(() => services.project.listCloseoutItems(), [services])
  const { data: closure } = useServiceResource(
    () => services.project.getClosureSummary(),
    [services],
  )
  const { data: project } = useServiceResource(() => services.project.getSummary(), [services])
  const done = items?.filter((item) => item.status === 'done').length ?? 0
  const total = items?.length ?? 0
  const percent = total ? Math.round((done / total) * 100) : 0
  const [actOpen, setActOpen] = useState(false)
  const [actTrigger, setActTrigger] = useState<HTMLElement | null>(null)
  return (
    <>
      <PageHead
        page="cierre"
        eyebrow="ETAPA 06 / ENTREGA"
        title="Preparación del cierre"
        copy="Documentación, aceptación, lecciones aprendidas y evaluación post-proyecto."
        onAdd={onAdd}
      />
      <div className="close-layout">
        <Card className="close-card">
          <div className="close-progress">
            <strong>{percent}%</strong>
            <div>
              <b>{t('pages.cierre.title')}</b>
              <span>{t('closure.deliverablesReady', { done, total })}</span>
              <div className="progress">
                <i style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        </Card>
        {closure && (
          <Card
            title={t('closure.acceptance')}
            action={
              <button
                className="secondary"
                onClick={(event) => {
                  setActTrigger(event.currentTarget)
                  setActOpen(true)
                }}
              >
                {t('closure.viewAct')}
              </button>
            }
          >
            <dl className="details">
              <div>
                <dt>{t('closure.actNumber')}</dt>
                <dd>{closure.actNumber}</dd>
              </div>
              <div>
                <dt>{t('closure.acceptedBy')}</dt>
                <dd>{closure.acceptedBy}</dd>
              </div>
              <div>
                <dt>{t('closure.deliveredAt')}</dt>
                <dd>{closure.deliveredAt}</dd>
              </div>
              <div>
                <dt>{t('closure.acceptedAt')}</dt>
                <dd>
                  {closure.acceptedAt} <Status>{t('closure.signed')}</Status>
                </dd>
              </div>
            </dl>
          </Card>
        )}
        {closure && (
          <Card title={t('closure.evaluation')}>
            <div className="audit-score">
              <strong>{closure.evaluationScore.toFixed(1)}</strong>
              <span>
                / 5.0<b>{t('closure.evaluationCopy')}</b>
              </span>
            </div>
            <dl className="details">
              <div>
                <dt>CPI / SPI</dt>
                <dd>
                  {closure.finalCpi.toFixed(2)} / {closure.finalSpi.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>{t('closure.costSaving')}</dt>
                <dd>{formatCurrency(closure.costSaving, i18n.resolvedLanguage)}</dd>
              </div>
            </dl>
          </Card>
        )}
        <Card title={t('content.closeoutList')} className="wide">
          <AsyncState loading={loading} error={error?.message} />
          {items && (
            <div className="close-list">
              {items.map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.status === 'done'}
                    onChange={() => notify(t('closure.archived'))}
                  />
                  <span>
                    <b>{item.name}</b>
                    <small>{item.type}</small>
                  </span>
                  <Status
                    tone={
                      item.status === 'done' ? 'green' : item.status === 'active' ? 'amber' : 'gray'
                    }
                  >
                    {item.status === 'done'
                      ? t('common.done')
                      : item.status === 'active'
                        ? t('common.inProgress')
                        : t('common.pending')}
                  </Status>
                </label>
              ))}
            </div>
          )}
        </Card>
      </div>
      {closure && (
        <DetailModal
          open={actOpen}
          eyebrow={t('closure.actEyebrow')}
          title={t('closure.actTitle')}
          returnFocus={actTrigger}
          onClose={() => setActOpen(false)}
        >
          <div className="doc-modal">
            <div className="doc-head">
              <span>{closure.actNumber}</span>
              <b>{project?.code}</b>
            </div>
            <dl className="details">
              <div>
                <dt>{t('content.projectName')}</dt>
                <dd>{project?.name}</dd>
              </div>
              <div>
                <dt>{t('closure.acceptedBy')}</dt>
                <dd>{closure.acceptedBy}</dd>
              </div>
              <div>
                <dt>{t('closure.deliveredAt')}</dt>
                <dd>{closure.deliveredAt}</dd>
              </div>
              <div>
                <dt>{t('closure.acceptedAt')}</dt>
                <dd>
                  {closure.acceptedAt} <Status>{t('closure.signed')}</Status>
                </dd>
              </div>
              <div>
                <dt>CPI / SPI</dt>
                <dd>
                  {closure.finalCpi.toFixed(2)} / {closure.finalSpi.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>{t('closure.costSaving')}</dt>
                <dd>{formatCurrency(closure.costSaving, i18n.resolvedLanguage)}</dd>
              </div>
            </dl>
            <p className="doc-statement">{t('closure.actStatement')}</p>
            <div className="doc-signatures">
              <div>
                <span />
                <b>{t('closure.signatureClient')}</b>
                <small>{closure.acceptedBy}</small>
              </div>
              <div>
                <span />
                <b>{t('closure.signatureBcysa')}</b>
                <small>{project?.manager}</small>
              </div>
            </div>
          </div>
        </DetailModal>
      )}
    </>
  )
}
