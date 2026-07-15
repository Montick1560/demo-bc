import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import type { Risk } from '../../shared/contracts'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card, PageHead, Status } from '../../shared/ui'

const impactTone: Record<Risk['impact'], string> = {
  critical: 'red',
  high: 'amber',
  medium: 'gray',
}

const statusTone: Record<Risk['status'], string> = {
  open: 'red',
  mitigated: 'amber',
  closed: 'green',
}

const exposureLabel: Record<Risk['impact'], string> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
}

export function RiskView({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  const services = useServices()
  const {
    data: risks,
    loading,
    error,
  } = useServiceResource(() => services.risks.list(), [services])
  const [filter, setFilter] = useState<'all' | Risk['category']>('all')
  const [selected, setSelected] = useState<Risk | null>(null)
  const [detailTrigger, setDetailTrigger] = useState<HTMLElement | null>(null)
  const filteredRisks = risks?.filter((risk) => filter === 'all' || risk.category === filter) ?? []
  const categories: ('all' | Risk['category'])[] = [
    'all',
    'technical',
    'environmental',
    'financial',
    'regulatory',
  ]
  const closed = risks?.filter((risk) => risk.status === 'closed').length ?? 0
  const open = risks?.filter((risk) => risk.status === 'open').length ?? 0

  return (
    <>
      <PageHead
        page="riesgos"
        eyebrow="ETAPA 04 / PREVENCIÓN"
        title="Registro de riesgos"
        copy="Amenazas técnicas, ambientales y normativas priorizadas por exposición."
        onAdd={onAdd}
      />
      <div className="risk-summary">
        <article>
          <span>{t('risk.registered')}</span>
          <b>{risks?.length ?? 0}</b>
          <small>{t('risk.registeredCopy')}</small>
        </article>
        <article>
          <span>{t('risk.closedTitle')}</span>
          <b>{closed}</b>
          <small>{t('risk.closedCopy')}</small>
        </article>
        <article>
          <span>{t('risk.residualTitle')}</span>
          <b>{open}</b>
          <small>{t('risk.residualCopy')}</small>
        </article>
      </div>
      <Card
        title={t('content.risks')}
        action={
          <div className="filters">
            {categories.map((item) => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {t(`risk.${item}`)}
              </button>
            ))}
          </div>
        }
      >
        <AsyncState loading={loading} error={error?.message} />
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID / {t('content.risks')}</th>
                <th>{t('content.type')}</th>
                <th>{t('risk.probability')}</th>
                <th>{t('risk.impact')}</th>
                <th>{t('form.owner')}</th>
                <th>{t('risk.mitigation')}</th>
                <th>{t('risk.contingency')}</th>
                <th>{t('risk.state')}</th>
                <th>{t('risk.detailCol')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => (
                <tr key={risk.id}>
                  <td>
                    <b>
                      {risk.id} / {risk.name}
                    </b>
                    {risk.note && <small>{risk.note}</small>}
                  </td>
                  <td>{t(`risk.${risk.category}`)}</td>
                  <td>{t(`common.${risk.probability}`)}</td>
                  <td>
                    <Status tone={impactTone[risk.impact]}>{t(`common.${risk.impact}`)}</Status>
                  </td>
                  <td>{risk.owner}</td>
                  <td>{risk.mitigation}</td>
                  <td>{risk.contingency}</td>
                  <td>
                    <Status tone={statusTone[risk.status]}>{t(`risk.${risk.status}`)}</Status>
                  </td>
                  <td>
                    <button
                      className="secondary"
                      onClick={(event) => {
                        setDetailTrigger(event.currentTarget)
                        setSelected(risk)
                      }}
                    >
                      {t('risk.detailAction')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={t('risk.detailEyebrow')}
        title={selected ? `${selected.id} / ${selected.name}` : ''}
        returnFocus={detailTrigger}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="doc-modal">
            <div className="risk-detail-tags">
              <Status tone={impactTone[selected.impact]}>
                {t('risk.exposureLabel')}: {t(`common.${exposureLabel[selected.impact]}`)}
              </Status>
              <Status tone={statusTone[selected.status]}>{t(`risk.${selected.status}`)}</Status>
            </div>
            <dl className="details">
              <div>
                <dt>{t('content.type')}</dt>
                <dd>{t(`risk.${selected.category}`)}</dd>
              </div>
              <div>
                <dt>{t('risk.probability')}</dt>
                <dd>{t(`common.${selected.probability}`)}</dd>
              </div>
              <div>
                <dt>{t('risk.impact')}</dt>
                <dd>{t(`common.${selected.impact}`)}</dd>
              </div>
              <div>
                <dt>{t('form.owner')}</dt>
                <dd>{selected.owner}</dd>
              </div>
            </dl>
            <h4>{t('risk.mitigation')}</h4>
            <p>{selected.mitigation}</p>
            <h4>{t('risk.contingency')}</h4>
            <p>{selected.contingency}</p>
            {selected.note && (
              <>
                <h4>{t('risk.noteLabel')}</h4>
                <p>{selected.note}</p>
              </>
            )}
          </div>
        )}
      </DetailModal>
    </>
  )
}
