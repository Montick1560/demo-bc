import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import type { WorkAction } from '../../shared/contracts'
import { NATURAL_MODE_CUTOFF } from '../../shared/experience'
import { formatCurrency, formatDate, formatPercent, localeFor } from '../../shared/format'
import type { View } from '../../shared/project'
import { useServices, useSession } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import '../../styles/natural-dashboard.css'

const CUTOFF = NATURAL_MODE_CUTOFF
const CUTOFF_TIME = Date.parse(`${CUTOFF}T12:00:00`)
const LOOKAHEAD_END = Date.parse('2026-07-26T12:00:00')

const actionTitleKeys: Record<string, string> = {
  'A-104': 'naturalDashboard.records.actions.a104',
  'A-103': 'naturalDashboard.records.actions.a103',
  'A-099': 'naturalDashboard.records.actions.a099',
  'A-097': 'naturalDashboard.records.actions.a097',
}

const taskTitleKeys: Record<string, string> = {
  'SCH-02': 'naturalDashboard.records.tasks.sch02',
  'SCH-03': 'naturalDashboard.records.tasks.sch03',
  'SCH-04': 'naturalDashboard.records.tasks.sch04',
  'SCH-07': 'naturalDashboard.records.tasks.sch07',
  'SCH-05': 'naturalDashboard.records.tasks.sch05',
}

const riskTitleKeys: Record<string, string> = {
  'R-021': 'naturalDashboard.records.risks.r021',
  'R-018': 'naturalDashboard.records.risks.r018',
  'R-014': 'naturalDashboard.records.risks.r014',
  'R-009': 'naturalDashboard.records.risks.r009',
}

const changeTitleKeys: Record<string, string> = {
  'CR-018': 'naturalDashboard.records.changes.cr018',
  'CR-019': 'naturalDashboard.records.changes.cr019',
  'CR-020': 'naturalDashboard.records.changes.cr020',
}

const areaKeys: Record<string, string> = {
  Riesgos: 'naturalDashboard.areas.risks',
  Costos: 'naturalDashboard.areas.costs',
  Cronograma: 'naturalDashboard.areas.schedule',
  Planificación: 'naturalDashboard.areas.planning',
  Cierre: 'naturalDashboard.areas.closeout',
  Control: 'naturalDashboard.areas.control',
}

const translatedRecord = (
  t: TFunction,
  keys: Record<string, string>,
  id: string,
  fallback: string,
) => (keys[id] ? t(keys[id]) : fallback)

const actionView = (action: WorkAction): View => {
  if (action.area === 'Riesgos') return 'riesgos'
  if (action.area === 'Cronograma') return 'cronograma'
  if (action.area === 'Cierre') return 'cierre'
  return 'control'
}

const shortDate = (value: string, language: string) =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-MX' : 'es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`))

export function NaturalDashboard({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'es'
  const services = useServices()
  const session = useSession()
  const projectResource = useServiceResource(() => services.project.getSummary(), [services])
  const performanceResource = useServiceResource(
    () => services.project.listPerformance(),
    [services],
  )
  const actionResource = useServiceResource(() => services.governance.listActions(), [services])
  const riskResource = useServiceResource(() => services.risks.list(), [services])
  const changeResource = useServiceResource(() => services.changes.list(), [services])
  const scheduleResource = useServiceResource(() => services.project.listSchedule(), [services])

  if (!projectResource.data)
    return (
      <AsyncState
        loading={projectResource.loading}
        error={projectResource.error ? t('naturalDashboard.loadError') : undefined}
      />
    )

  const project = projectResource.data
  const julyPerformance = performanceResource.data?.find((period) => period.period === 'JUL')
  const progress = julyPerformance?.actual ?? project.progress
  const planned = julyPerformance?.planned ?? 67
  const progressVariance = progress - planned
  const cpi = julyPerformance?.cpi ?? project.cpi
  const spi =
    julyPerformance?.spi ?? (planned > 0 ? Number((progress / planned).toFixed(2)) : project.spi)
  const actualCost = project.spent
  const activeRisks = (riskResource.data ?? []).filter((risk) => risk.status !== 'closed')
  const criticalRisks = activeRisks.filter(
    (risk) => risk.impact === 'critical' || risk.impact === 'high',
  )
  const riskHighlights = [...activeRisks]
    .sort((left, right) => {
      const rank = { critical: 0, high: 1, medium: 2 }
      return rank[left.impact] - rank[right.impact]
    })
    .slice(0, 2)
  const pendingChanges = (changeResource.data ?? []).filter((change) => change.status === 'pending')
  const todayActions = (actionResource.data ?? []).filter(
    (action) =>
      !action.complete &&
      (action.due === 'Hoy' || action.due === '12 Jul' || action.due === '14 Jul'),
  )
  const lookahead = [...(scheduleResource.data ?? [])]
    .filter((task) => {
      const start = Date.parse(`${task.start}T12:00:00`)
      const end = Date.parse(`${task.end}T12:00:00`)
      return start <= LOOKAHEAD_END && end >= CUTOFF_TIME
    })
    .sort((left, right) => left.end.localeCompare(right.end))
    .slice(0, 5)
  const scheduleDelayDays = Math.max(
    0,
    ...(scheduleResource.data ?? []).map((task) =>
      Math.ceil(
        (Date.parse(`${task.end}T12:00:00`) - Date.parse(`${task.baselineEnd}T12:00:00`)) /
          86_400_000,
      ),
    ),
  )
  const secondaryLoading =
    performanceResource.loading ||
    actionResource.loading ||
    riskResource.loading ||
    changeResource.loading ||
    scheduleResource.loading
  const partialError =
    performanceResource.error ||
    actionResource.error ||
    riskResource.error ||
    changeResource.error ||
    scheduleResource.error
  const cutoffLabel = formatDate(CUTOFF, language).toLocaleUpperCase(localeFor(language))
  const clientLabel =
    project.id === 'project-014' ? t('naturalDashboard.records.client') : project.client
  const shortcuts: readonly {
    view: View
    code: string
    label: string
    meta: string
  }[] = [
    {
      view: 'planificacion',
      code: '02',
      label: t('naturalDashboard.shortcuts.planning'),
      meta: t('naturalDashboard.shortcuts.planningMeta'),
    },
    {
      view: 'cronograma',
      code: '03',
      label: t('naturalDashboard.shortcuts.schedule'),
      meta: t('naturalDashboard.shortcuts.scheduleMeta', { count: lookahead.length }),
    },
    {
      view: 'riesgos',
      code: '04',
      label: t('naturalDashboard.shortcuts.risks'),
      meta: t('naturalDashboard.shortcuts.risksMeta', { count: activeRisks.length }),
    },
    {
      view: 'control',
      code: '05',
      label: t('naturalDashboard.shortcuts.control'),
      meta: t('naturalDashboard.shortcuts.controlMeta', { count: pendingChanges.length }),
    },
  ]

  return (
    <div className="natural-dashboard" aria-busy={secondaryLoading}>
      <header className="nd-header">
        <div className="nd-project-context">
          <div className="nd-breadcrumb" aria-label={t('naturalDashboard.currentLocation')}>
            <span>{t('naturalDashboard.portfolio')}</span>
            <i aria-hidden="true">/</i>
            <strong>{project.code}</strong>
          </div>
          <div className="nd-title-line">
            <h1>{project.name}</h1>
            <span className="nd-status nd-status-active">{t('naturalDashboard.activeStatus')}</span>
          </div>
          <p>
            {clientLabel} <span aria-hidden="true">·</span> {t('naturalDashboard.projectManager')}:{' '}
            {project.manager}
          </p>
        </div>
        <div className="nd-header-tools">
          <div className="nd-cutoff">
            <span>{t('naturalDashboard.cutoffDate')}</span>
            <strong>
              <time dateTime={CUTOFF}>{cutoffLabel}</time>
            </strong>
            <small>{t('naturalDashboard.updatedAt', { time: '08:42' })}</small>
          </div>
          <button
            className="nd-button nd-button-secondary"
            onClick={() => onNavigate('planificacion')}
          >
            {t('naturalDashboard.masterPlan')}
          </button>
          <button className="nd-button nd-button-primary" onClick={() => onNavigate('cronograma')}>
            {t('naturalDashboard.updateProgress')}
          </button>
        </div>
      </header>

      {partialError && (
        <p className="nd-data-warning" role="alert">
          {t('naturalDashboard.partialData')}
        </p>
      )}

      <section className="nd-kpis" aria-label={t('naturalDashboard.indicatorsLabel')}>
        <article className="nd-kpi nd-kpi-progress">
          <div className="nd-kpi-label">
            <span>{t('naturalDashboard.physicalProgress')}</span>
            <strong className="nd-status nd-status-warning">
              {t('naturalDashboard.variancePoints', {
                value: `${progressVariance > 0 ? '+' : ''}${progressVariance}`,
              })}
            </strong>
          </div>
          <b>{formatPercent(progress, language)}</b>
          <div
            className="nd-progress"
            role="progressbar"
            aria-label={t('naturalDashboard.physicalProgress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <i style={{ width: `${progress}%` }} />
            <em style={{ left: `${planned}%` }} aria-hidden="true" />
          </div>
          <small>
            {t('naturalDashboard.planAtCutoff', {
              percent: formatPercent(planned, language),
            })}
          </small>
        </article>

        <article className="nd-kpi">
          <div className="nd-kpi-label">
            <span>{t('naturalDashboard.schedule')}</span>
            <strong className="nd-status nd-status-warning">
              {t('naturalDashboard.attention')}
            </strong>
          </div>
          <b>{spi.toFixed(2)}</b>
          <div className="nd-kpi-detail">
            <span>SPI</span>
            <i aria-hidden="true">↘</i>
          </div>
          <small>{t('naturalDashboard.daysOverBaseline', { count: scheduleDelayDays })}</small>
        </article>

        <article className="nd-kpi">
          <div className="nd-kpi-label">
            <span>{t('naturalDashboard.costPerformance')}</span>
            <strong className="nd-status nd-status-good">{t('naturalDashboard.favorable')}</strong>
          </div>
          <b>{cpi.toFixed(2)}</b>
          <div className="nd-kpi-detail">
            <span>CPI</span>
            <i className="nd-trend-up" aria-hidden="true">
              ↗
            </i>
          </div>
          <small>
            {t('naturalDashboard.actualCost', { value: formatCurrency(actualCost, language) })}
          </small>
        </article>

        <article className="nd-kpi">
          <div className="nd-kpi-label">
            <span>{t('naturalDashboard.riskExposure')}</span>
            <strong className="nd-status nd-status-danger">{t('naturalDashboard.review')}</strong>
          </div>
          <b>{activeRisks.length}</b>
          <div className="nd-kpi-detail">
            <span>{t('naturalDashboard.activeRisks', { count: activeRisks.length })}</span>
            <i className="nd-risk-stack" aria-hidden="true" />
          </div>
          <small>{t('naturalDashboard.highCriticalRisks', { count: criticalRisks.length })}</small>
        </article>
      </section>

      <div className="nd-workspace">
        <div className="nd-main-column">
          <section className="nd-panel nd-work-panel" aria-labelledby="nd-my-work">
            <header className="nd-panel-head">
              <div>
                <span className="nd-section-kicker">{t('naturalDashboard.operationalInbox')}</span>
                <h2 id="nd-my-work">{t('naturalDashboard.myWorkToday')}</h2>
              </div>
              <span className="nd-counter">
                {t('naturalDashboard.pending', { count: todayActions.length })}
              </span>
            </header>
            <ul className="nd-action-list">
              {todayActions.map((action) => (
                <li key={action.id}>
                  {(() => {
                    const actionTitle = translatedRecord(
                      t,
                      actionTitleKeys,
                      action.id,
                      action.title,
                    )
                    const areaKey = areaKeys[action.area]
                    const dueToday = action.due === 'Hoy' || action.due === '12 Jul'
                    return (
                      <>
                        <span
                          className={`nd-priority nd-priority-${action.priority}`}
                          aria-label={t('naturalDashboard.priority', {
                            priority: t(`common.${action.priority}`),
                          })}
                        />
                        <div className="nd-action-copy">
                          <div>
                            <span className="nd-record-id">{action.id}</span>
                            <span className="nd-area">{areaKey ? t(areaKey) : action.area}</span>
                          </div>
                          <strong>{actionTitle}</strong>
                          <small>
                            {action.owner === session.name
                              ? t('naturalDashboard.assignedToMe')
                              : action.owner}
                            <span aria-hidden="true"> · </span>
                            <b className={dueToday ? 'is-due' : ''}>
                              {dueToday
                                ? t('naturalDashboard.dueToday')
                                : t('naturalDashboard.dueInDays', { count: 2 })}
                            </b>
                          </small>
                        </div>
                        <button
                          className="nd-row-action"
                          aria-label={t('naturalDashboard.openRecord', { title: actionTitle })}
                          onClick={() => onNavigate(actionView(action))}
                        >
                          {t('naturalDashboard.open')} <span aria-hidden="true">→</span>
                        </button>
                      </>
                    )
                  })()}
                </li>
              ))}
              {!secondaryLoading && todayActions.length === 0 && (
                <li className="nd-empty-row">{t('naturalDashboard.noActions')}</li>
              )}
            </ul>
          </section>

          <section className="nd-panel nd-lookahead-panel" aria-labelledby="nd-lookahead">
            <header className="nd-panel-head">
              <div>
                <span className="nd-section-kicker">
                  {t('naturalDashboard.nextDays', { count: 14 })}
                </span>
                <h2 id="nd-lookahead">{t('naturalDashboard.executionLookahead')}</h2>
              </div>
              <button className="nd-link-button" onClick={() => onNavigate('cronograma')}>
                {t('naturalDashboard.viewSchedule')} <span aria-hidden="true">→</span>
              </button>
            </header>
            <div className="nd-table-scroll">
              <table className="nd-lookahead-table">
                <thead>
                  <tr>
                    <th>{t('naturalDashboard.columns.activity')}</th>
                    <th>{t('naturalDashboard.columns.owner')}</th>
                    <th>{t('naturalDashboard.columns.window')}</th>
                    <th>{t('naturalDashboard.columns.progress')}</th>
                    <th>{t('naturalDashboard.columns.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {lookahead.map((task) => {
                    const taskProgress = task.progress
                    const taskTitle = translatedRecord(t, taskTitleKeys, task.id, task.name)
                    return (
                      <tr key={task.id}>
                        <td>
                          <strong>{taskTitle}</strong>
                          <small>{task.id}</small>
                        </td>
                        <td>{task.owner}</td>
                        <td>
                          <time dateTime={task.start}>{shortDate(task.start, language)}</time>
                          <span aria-hidden="true"> — </span>
                          <time dateTime={task.end}>{shortDate(task.end, language)}</time>
                        </td>
                        <td>
                          <div className="nd-table-progress">
                            <span
                              role="progressbar"
                              aria-label={t('naturalDashboard.taskProgress', { name: taskTitle })}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={taskProgress}
                            >
                              <i style={{ width: `${taskProgress}%` }} />
                            </span>
                            <b>{formatPercent(taskProgress, language)}</b>
                          </div>
                        </td>
                        <td>
                          <span className={`nd-task-state ${task.critical ? 'is-critical' : ''}`}>
                            {task.milestone
                              ? t('naturalDashboard.taskState.milestone')
                              : taskProgress === 0
                                ? t('naturalDashboard.taskState.upcoming')
                                : t('naturalDashboard.taskState.active')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="nd-side-column" aria-label={t('naturalDashboard.projectAlertsLabel')}>
          <section className="nd-panel nd-attention-panel" aria-labelledby="nd-attention">
            <header className="nd-panel-head">
              <div>
                <span className="nd-section-kicker">{t('naturalDashboard.immediateControl')}</span>
                <h2 id="nd-attention">{t('naturalDashboard.alertsAndDecisions')}</h2>
              </div>
              <span className="nd-live-indicator">
                <i aria-hidden="true" /> {t('naturalDashboard.tracking')}
              </span>
            </header>

            <div className="nd-alert-group">
              <h3>{t('naturalDashboard.priorityRisks')}</h3>
              {riskHighlights.map((risk) => {
                const riskTitle = translatedRecord(t, riskTitleKeys, risk.id, risk.name)
                return (
                  <button
                    className="nd-alert-row"
                    key={risk.id}
                    onClick={() => onNavigate('riesgos')}
                    aria-label={t('naturalDashboard.reviewRisk', {
                      id: risk.id,
                      name: riskTitle,
                    })}
                  >
                    <span className={`nd-severity nd-severity-${risk.impact}`}>
                      {t(`naturalDashboard.severity.${risk.impact}`)}
                    </span>
                    <strong>{riskTitle}</strong>
                    <small>
                      {risk.id} <span aria-hidden="true">·</span> {risk.owner}
                    </small>
                    <i aria-hidden="true">→</i>
                  </button>
                )
              })}
            </div>

            <div className="nd-alert-group nd-decision-group">
              <div className="nd-group-title">
                <h3>{t('naturalDashboard.requiredDecisions')}</h3>
                <span>{pendingChanges.length}</span>
              </div>
              {pendingChanges.map((change) => {
                const changeTitle = translatedRecord(t, changeTitleKeys, change.id, change.title)
                return (
                  <button
                    className="nd-decision-row"
                    key={change.id}
                    onClick={() => onNavigate('control')}
                    aria-label={t('naturalDashboard.reviewChange', {
                      id: change.id,
                      title: changeTitle,
                    })}
                  >
                    <span className="nd-record-id">{change.id}</span>
                    <strong>{changeTitle}</strong>
                    <small>
                      {change.cost >= 0 ? '+' : ''}
                      {formatCurrency(change.cost, language)}
                      <span aria-hidden="true"> · </span>
                      {change.days > 0
                        ? t('naturalDashboard.dayImpact', { count: change.days })
                        : t('naturalDashboard.noScheduleImpact')}
                    </small>
                    <span className="nd-decision-state">
                      {t('naturalDashboard.pendingDecision')}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <nav className="nd-panel nd-shortcuts" aria-labelledby="nd-shortcuts">
            <header className="nd-panel-head">
              <div>
                <span className="nd-section-kicker">{t('naturalDashboard.modules')}</span>
                <h2 id="nd-shortcuts">{t('naturalDashboard.quickAccess')}</h2>
              </div>
            </header>
            {shortcuts.map((shortcut) => (
              <button key={shortcut.view} onClick={() => onNavigate(shortcut.view)}>
                <span>{shortcut.code}</span>
                <strong>{shortcut.label}</strong>
                <small>{shortcut.meta}</small>
                <i aria-hidden="true">→</i>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  )
}
