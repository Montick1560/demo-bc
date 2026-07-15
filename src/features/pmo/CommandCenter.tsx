import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Role } from '../../shared/project'
import { BaselineTab } from './BaselineTab'
import { ChangesTab } from './ChangesTab'
import { GovernanceTab } from './GovernanceTab'
import { WorkTab } from './WorkTab'

type Tab = 'trabajo' | 'cambios' | 'linea-base' | 'gobierno'

export function CommandCenter({ role, notify }: { role: Role; notify: (message: string) => void }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('trabajo')
  return (
    <>
      <div className="page-head pmo-head">
        <div>
          <span className="eyebrow">{t('pmo.eyebrow')}</span>
          <h2>{t('pmo.title')}</h2>
          <p>{t('pmo.copy')}</p>
        </div>
        <div className="pmo-role">
          <span>CCB / PMO</span>
          <b>{role}</b>
        </div>
      </div>
      <div className="pmo-tabs" role="tablist">
        {(
          [
            ['trabajo', t('pmo.work')],
            ['cambios', t('pmo.changes')],
            ['linea-base', t('pmo.baseline')],
            ['gobierno', t('pmo.governance')],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'active' : ''}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'trabajo' ? (
        <WorkTab openChanges={() => setTab('cambios')} />
      ) : tab === 'cambios' ? (
        <ChangesTab notify={notify} />
      ) : tab === 'linea-base' ? (
        <BaselineTab />
      ) : (
        <GovernanceTab notify={notify} />
      )}
    </>
  )
}
