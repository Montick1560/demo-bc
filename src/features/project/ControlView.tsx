import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import type { ChangeRequest, WeeklyReport } from '../../shared/contracts'
import { formatCurrency } from '../../shared/format'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card, PageHead, Status } from '../../shared/ui'

const changeTone: Record<ChangeRequest['status'], string> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
}

export function ControlView({ onAdd }: { onAdd?: () => void }) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const {
    data: reports,
    loading,
    error,
  } = useServiceResource(() => services.project.listWeeklyReports(), [services])
  const { data: changes } = useServiceResource(() => services.changes.list(), [services])
  const { data: audits } = useServiceResource(() => services.project.listAudits(), [services])
  const [lastReport, ...previousReports] = reports ?? []
  const lastAudit = audits?.[0]
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [reportTrigger, setReportTrigger] = useState<HTMLElement | null>(null)
  const openReport = (report: WeeklyReport, event: React.MouseEvent<HTMLElement>) => {
    setReportTrigger(event.currentTarget)
    setSelectedReport(report)
  }

  return (
    <>
      <PageHead
        page="control"
        eyebrow="ETAPA 05 / DESEMPEÑO"
        title="Monitoreo y control"
        copy="Reportes de avance, cambios, indicadores EVM y auditorías internas."
        onAdd={onAdd}
      />
      <AsyncState loading={loading} error={error?.message} />
      <div className="control-grid">
        {lastReport && (
          <Card title={t('control.lastReport')} className="report-card">
            <div className="report-title">
              <i>{lastReport.week}</i>
              <div>
                <b>
                  {t('control.week')} {lastReport.week} / {lastReport.range}
                </b>
                <small>
                  {t('control.publishedBy')} {lastReport.author}
                </small>
              </div>
              <Status>{t('control.published')}</Status>
            </div>
            <p>{lastReport.summary}</p>
            {previousReports.map((report) => (
              <button
                className="change report-row"
                key={report.id}
                onClick={(event) => openReport(report, event)}
              >
                <i>{report.week}</i>
                <span>
                  <b>
                    {t('control.week')} {report.week} / {report.range}
                  </b>
                  <small>{report.summary}</small>
                </span>
                <Status tone="gray">{report.progress}%</Status>
              </button>
            ))}
            <button className="secondary" onClick={(event) => openReport(lastReport, event)}>
              {t('control.openFull')}
            </button>
          </Card>
        )}
        <Card title={t('content.changeControl')}>
          {changes?.map((change) => (
            <div className="change" key={change.id}>
              <i>{change.id}</i>
              <span>
                <b>{change.title}</b>
                <small>
                  {t('control.impact')}: {change.cost >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(change.cost), i18n.resolvedLanguage)} /{' '}
                  {change.days >= 0 ? '+' : ''}
                  {change.days} {t('control.days')}
                </small>
              </span>
              <Status tone={changeTone[change.status]}>{t(`common.${change.status}`)}</Status>
            </div>
          ))}
        </Card>
        <Card title={t('content.audits')}>
          {lastAudit && (
            <div className="audit-score">
              <strong>{lastAudit.score}</strong>
              <span>
                / 100<b>{t('control.compliance')}</b>
              </span>
            </div>
          )}
          <ul className="check-list compact">
            {audits?.map((audit) => (
              <li key={audit.id}>
                <i>✓</i>
                {audit.name} · {audit.score}/100
                <small> — {audit.findings}</small>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <DetailModal
        open={Boolean(selectedReport)}
        eyebrow={t('control.reportEyebrow')}
        title={
          selectedReport
            ? `${t('control.week')} ${selectedReport.week} / ${selectedReport.range}`
            : ''
        }
        returnFocus={reportTrigger}
        onClose={() => setSelectedReport(null)}
      >
        {selectedReport && (
          <div className="doc-modal">
            <div className="risk-detail-tags">
              <Status>{t('control.published')}</Status>
              <span className="doc-author">
                {t('control.publishedBy')} {selectedReport.author}
              </span>
            </div>
            <div className="report-progress">
              <span>{t('control.reportProgress')}</span>
              <b>{selectedReport.progress}%</b>
              <div className="progress">
                <i style={{ width: `${selectedReport.progress}%` }} />
              </div>
            </div>
            <h4>{t('control.reportSummary')}</h4>
            <p>{selectedReport.summary}</p>
          </div>
        )}
      </DetailModal>
    </>
  )
}
