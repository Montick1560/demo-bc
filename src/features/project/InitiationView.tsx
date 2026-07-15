import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card, PageHead, Status } from '../../shared/ui'

const stakeholders = [
  {
    name: 'Transportista del Sector Energético',
    type: 'client' as const,
    power: 'High / High',
    tone: 'green',
    strategy: 'closeManage' as const,
  },
  {
    name: 'SEMARNAT / Autoridad ambiental',
    type: 'authority' as const,
    power: 'High / Medium',
    tone: 'amber',
    strategy: 'satisfy' as const,
  },
  {
    name: 'CENAGAS / Operador del sistema',
    type: 'authority' as const,
    power: 'High / High',
    tone: 'green',
    strategy: 'closeManage' as const,
  },
  {
    name: 'Ejidos El Encino y La Laguna',
    type: 'community' as const,
    power: 'Medium / High',
    tone: '',
    strategy: 'weekly' as const,
  },
]

export function InitiationView({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  const services = useServices()
  const {
    data: project,
    loading,
    error,
  } = useServiceResource(() => services.project.getSummary(), [services])
  const [charterOpen, setCharterOpen] = useState(false)
  const [charterTrigger, setCharterTrigger] = useState<HTMLElement | null>(null)
  if (!project) return <AsyncState loading={loading} error={error?.message} />
  return (
    <>
      <PageHead
        page="inicio"
        eyebrow="ETAPA 01 / AUTORIZACIÓN"
        title="Ficha de inicio"
        copy="Definición, interesados y criterios que autorizan formalmente el proyecto."
        onAdd={onAdd}
      />
      <div className="two-cols">
        <Card title={t('content.identity')}>
          <dl className="details">
            <div>
              <dt>{t('content.projectName')}</dt>
              <dd>{project.name}</dd>
            </div>
            <div>
              <dt>{t('content.objective')}</dt>
              <dd>{t('content.objectiveCopy')}</dd>
            </div>
            <div>
              <dt>{t('content.client')}</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>{t('content.manager')}</dt>
              <dd>{project.manager}</dd>
            </div>
          </dl>
        </Card>
        <Card
          title={t('content.authorization')}
          action={
            <button
              className="secondary"
              onClick={(event) => {
                setCharterTrigger(event.currentTarget)
                setCharterOpen(true)
              }}
            >
              {t('content.charterAction')}
            </button>
          }
        >
          <dl className="details">
            <div>
              <dt>{t('content.charter')}</dt>
              <dd>Acta de constitución Rev. 02</dd>
            </div>
            <div>
              <dt>{t('content.sponsor')}</dt>
              <dd>Comité de Inversión BCySA</dd>
            </div>
            <div>
              <dt>{t('content.authorizedAt')}</dt>
              <dd>
                2026-01-12 <Status>{t('content.authorized')}</Status>
              </dd>
            </div>
            <div>
              <dt>{t('content.execution')}</dt>
              <dd>
                {project.startDate} — {project.endDate}
              </dd>
            </div>
          </dl>
        </Card>
        <Card title={t('content.success')} action={<Status>{t('content.successMet')}</Status>}>
          <ul className="check-list">
            {['success1', 'success2', 'success3', 'success4'].map((item) => (
              <li key={item}>
                <i>✓</i>
                {t(`content.${item}`)}
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t('content.stakeholders')} className="wide">
          <table>
            <thead>
              <tr>
                <th>{t('content.stakeholder')}</th>
                <th>{t('content.type')}</th>
                <th>{t('content.powerInterest')}</th>
                <th>{t('content.strategy')}</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((stakeholder) => (
                <tr key={stakeholder.name}>
                  <td>
                    <b>{stakeholder.name}</b>
                  </td>
                  <td>{t(`content.${stakeholder.type}`)}</td>
                  <td>
                    {stakeholder.tone ? (
                      <Status tone={stakeholder.tone}>{stakeholder.power}</Status>
                    ) : (
                      stakeholder.power
                    )}
                  </td>
                  <td>{t(`content.${stakeholder.strategy}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <DetailModal
        open={charterOpen}
        eyebrow={t('content.charterEyebrow')}
        title={t('content.charter')}
        returnFocus={charterTrigger}
        onClose={() => setCharterOpen(false)}
      >
        <div className="doc-modal">
          <div className="doc-head">
            <span>{project.code}</span>
            <b>{t('content.charterRev')}</b>
          </div>
          <dl className="details">
            <div>
              <dt>{t('content.projectName')}</dt>
              <dd>{project.name}</dd>
            </div>
            <div>
              <dt>{t('content.objective')}</dt>
              <dd>{t('content.objectiveCopy')}</dd>
            </div>
            <div>
              <dt>{t('content.sponsor')}</dt>
              <dd>Comité de Inversión BCySA</dd>
            </div>
            <div>
              <dt>{t('content.authorizedAt')}</dt>
              <dd>
                2026-01-12 <Status>{t('content.authorized')}</Status>
              </dd>
            </div>
            <div>
              <dt>{t('content.execution')}</dt>
              <dd>
                {project.startDate} — {project.endDate}
              </dd>
            </div>
            <div>
              <dt>{t('content.manager')}</dt>
              <dd>{project.manager}</dd>
            </div>
          </dl>
          <h4>{t('content.success')}</h4>
          <ul className="check-list">
            {['success1', 'success2', 'success3', 'success4'].map((item) => (
              <li key={item}>
                <i>✓</i>
                {t(`content.${item}`)}
              </li>
            ))}
          </ul>
          <p className="doc-statement">{t('content.charterStatement')}</p>
        </div>
      </DetailModal>
    </>
  )
}
