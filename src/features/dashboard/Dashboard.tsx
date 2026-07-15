import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import { formatCurrency } from '../../shared/format'
import type { View } from '../../shared/project'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card } from '../../shared/ui'

export function Dashboard({
  onNavigate,
  notify,
}: {
  onNavigate: (view: View) => void
  notify: (message: string) => void
}) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const {
    data: project,
    loading,
    error,
  } = useServiceResource(() => services.project.getSummary(), [services])
  const { data: performance } = useServiceResource(
    () => services.project.listPerformance(),
    [services],
  )
  const [performanceMetric, setPerformanceMetric] = useState<'progress' | 'cpi' | 'spi'>('progress')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyTrigger, setHistoryTrigger] = useState<HTMLElement | null>(null)
  if (!project) return <AsyncState loading={loading} error={error?.message} />
  const downloadReport = () => {
    const report = [
      'BCYSA LAB04 / REPORTE EJECUTIVO DE CIERRE',
      project.name,
      `Estado,Finalizado`,
      `Ejecución,${project.startDate} a ${project.endDate}`,
      `Acta de aceptación,${project.acceptedAt}`,
      `Avance,${project.progress}%`,
      `CPI,${project.cpi}`,
      `SPI,${project.spi}`,
      `Presupuesto (BAC),${project.budget}`,
      `Costo final (AC),${project.spent}`,
      `Variación al término (VAC),${project.budget - project.spent}`,
    ].join('\n')
    const url = URL.createObjectURL(new Blob([report], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'bcysa-lab04-reporte-cierre.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify(t('dashboard.reportDownloaded'))
  }
  const stages = ['Inicio', 'Planificación', 'Ejecución', 'Control', 'Cierre']
  const recentActivity = [
    ['VS', 'Valeria archivó el expediente final del proyecto', '09 oct, 13:05'],
    ['AC', 'Ana registró la evaluación post-proyecto (4.6/5)', '09 oct, 11:20'],
    ['RM', 'Rafael publicó el reporte semanal 39 de cierre', '27 sep, 18:44'],
  ]
  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow">{t('dashboard.eyebrow')}</span>
          <h2>
            {t('dashboard.title')}
            <br />
            <em>{t('dashboard.accent')}</em>
          </h2>
          <p>{t('dashboard.copy')}</p>
        </div>
        <button className="primary" onClick={downloadReport}>
          {t('dashboard.report')} <span>↓</span>
        </button>
      </section>
      <div className="metric-grid">
        <article>
          <span>
            {t('dashboard.progress')} <i>✓ {t('dashboard.delivered')}</i>
          </span>
          <strong>{project.progress}%</strong>
          <div className="progress">
            <b style={{ width: `${project.progress}%` }} />
          </div>
          <small>{t('dashboard.periodGoal')}</small>
        </article>
        <article>
          <span>
            {t('dashboard.cpi')} <i>{t('dashboard.healthy')}</i>
          </span>
          <strong>{project.cpi.toFixed(2)}</strong>
          <div className="spark bars">
            <b />
            <b />
            <b />
            <b />
            <b />
            <b />
          </div>
          <small>≥ 1.00</small>
        </article>
        <article>
          <span>
            {t('dashboard.spi')} <i>{t('dashboard.onTime')}</i>
          </span>
          <strong>{project.spi.toFixed(2)}</strong>
          <div className="spark line">⌁</div>
          <small>{t('dashboard.scheduleDrift')}</small>
        </article>
        <article>
          <span>
            {t('dashboard.budget')} <i>{Math.round((project.spent / project.budget) * 100)}%</i>
          </span>
          <strong>{formatCurrency(project.spent, i18n.resolvedLanguage)}</strong>
          <div className="progress gold">
            <b style={{ width: `${(project.spent / project.budget) * 100}%` }} />
          </div>
          <small>{formatCurrency(project.budget, i18n.resolvedLanguage)}</small>
        </article>
      </div>
      <div className="sgi-strip">
        <span>SGI / HSE</span>
        <b>0</b>
        <small>{t('dashboard.incidents')}</small>
        <b>96</b>
        <small>{t('dashboard.compliance')}</small>
        <b>0</b>
        <small>{t('dashboard.permits')}</small>
      </div>
      <Card
        title="Histórico de rendimiento / Caso práctico"
        action={
          <div className="performance-filters">
            {(
              [
                ['progress', 'Avance'],
                ['cpi', 'CPI'],
                ['spi', 'SPI'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={performanceMetric === id ? 'active' : ''}
                onClick={() => setPerformanceMetric(id)}
              >
                {label}
              </button>
            ))}
          </div>
        }
        className="performance-card"
      >
        <div className="performance-story">
          <span>ENERO — SEPTIEMBRE 2026</span>
          <p>
            El proyecto arrancó con atraso por derechos de vía, recuperó plazo con doble turno en
            obra civil y montaje, y cerró el 29 de septiembre en fecha contractual con costo final
            2% por debajo del presupuesto.
          </p>
        </div>
        <div className="performance-chart">
          {performance?.map((period) => {
            const actual =
              performanceMetric === 'progress'
                ? period.actual
                : performanceMetric === 'cpi'
                  ? period.cpi * 70
                  : period.spi * 70
            const planned = performanceMetric === 'progress' ? period.planned : 70
            return (
              <article key={period.period}>
                <div className="performance-bars">
                  <i style={{ height: `${Math.min(100, planned)}%` }} />
                  <b style={{ height: `${Math.min(100, actual)}%` }} />
                </div>
                <strong>{period.period}</strong>
                <span>
                  {performanceMetric === 'progress'
                    ? `${period.actual}% / ${period.planned}%`
                    : (performanceMetric === 'cpi' ? period.cpi : period.spi).toFixed(2)}
                </span>
                <small>{period.note}</small>
              </article>
            )
          })}
        </div>
        <footer className="performance-legend">
          <span>
            <i className="planned" />
            Planeado
          </span>
          <span>
            <i className="actual" />
            Real
          </span>
          <b>Resultado final: CPI 1.02 / SPI 1.00</b>
        </footer>
      </Card>
      <div className="dashboard-grid">
        <Card
          title={t('dashboard.route')}
          action={
            <button className="text-button" onClick={() => onNavigate('planificacion')}>
              {t('dashboard.masterPlan')}
            </button>
          }
          className="journey-card"
        >
          <div className="journey">
            {stages.map((name) => (
              <div className="done" key={name}>
                <i>✓</i>
                <b>{name}</b>
                <small>Completado</small>
              </div>
            ))}
          </div>
          <div className="milestone">
            <div className="calendar">
              <b>09</b>
              <small>OCT</small>
            </div>
            <div>
              <span>{t('dashboard.finalMilestone')}</span>
              <strong>{t('dashboard.acceptanceSigned')}</strong>
              <small>ACTA-BCY-014-2026 / Valeria Soto</small>
            </div>
            <div className="mini-progress">
              <b style={{ width: '100%' }} />
            </div>
          </div>
        </Card>
        <Card title={t('dashboard.outcomes')} className="attention-card">
          <button onClick={() => onNavigate('riesgos')}>
            <i className="risk-dot low">✓</i>
            <span>
              <b>{t('dashboard.risksClosed')}</b>
              <small>{t('dashboard.risksClosedCopy')}</small>
            </span>
            <em>4/4</em>
          </button>
          <button onClick={() => onNavigate('control')}>
            <i className="risk-dot low">✓</i>
            <span>
              <b>{t('dashboard.changesResolved')}</b>
              <small>{t('dashboard.changesResolvedCopy')}</small>
            </span>
            <em>3/3</em>
          </button>
          <button onClick={() => onNavigate('cierre')}>
            <i className="risk-dot low">✓</i>
            <span>
              <b>{t('dashboard.closeoutComplete')}</b>
              <small>{t('dashboard.closeoutCompleteCopy')}</small>
            </span>
            <em>7/7</em>
          </button>
        </Card>
        <Card
          title={t('dashboard.activity')}
          action={
            <button
              className="text-button"
              onClick={(event) => {
                setHistoryTrigger(event.currentTarget)
                setHistoryOpen(true)
              }}
            >
              {t('dashboard.seeAll')}
            </button>
          }
          className="activity-card"
        >
          {recentActivity.map(([avatar, text, time]) => (
            <div className="activity" key={text}>
              <i>{avatar}</i>
              <span>
                <b>{text}</b>
                <small>{time}</small>
              </span>
            </div>
          ))}
        </Card>
      </div>
      <DetailModal
        open={historyOpen}
        eyebrow="TRAZABILIDAD DEL PROYECTO"
        title="Historial de actividad"
        returnFocus={historyTrigger}
        onClose={() => setHistoryOpen(false)}
      >
        <div className="activity-history">
          {[
            ...recentActivity,
            ['MO', 'Marina cerró la conciliación final de costos', '26 sep, 16:10'],
            ['LT', 'Lucía liberó el expediente ambiental', '24 sep, 10:32'],
            ['VS', 'Valeria aprobó el pronóstico final', '19 sep, 09:15'],
          ].map(([avatar, text, time]) => (
            <div className="activity" key={`${text}-${time}`}>
              <i>{avatar}</i>
              <span>
                <b>{text}</b>
                <small>{time}</small>
              </span>
            </div>
          ))}
        </div>
      </DetailModal>
    </>
  )
}
