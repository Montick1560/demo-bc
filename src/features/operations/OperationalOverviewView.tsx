import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import type { WorkAction } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { formatCurrency, formatDate } from '../../shared/format'
import { useServiceResource } from '../../shared/useServiceResource'
import { useCapability, useServices, useSession } from '../../shared/useServices'
import type { OperationalView } from './navigation'
import '../../styles/operations-overview.css'

const copy = {
  es: {
    eyebrow: 'Centro de trabajo / ejecución',
    title: 'Control del día',
    subtitle:
      'Interconexión El Encino - La Laguna · Información viva al corte del 12 de julio de 2026.',
    fieldReport: 'Registrar parte de campo',
    viewField: 'Consultar control de campo',
    updateSchedule: 'Actualizar cronograma',
    viewSchedule: 'Consultar cronograma',
    roleMode: 'Vista de trabajo activa',
    roleHelp: {
      Administrador: 'Control total: puede operar, supervisar y resolver registros.',
      'Project Manager': 'Control del proyecto: planificación, costos, riesgos y decisiones.',
      Supervisor: 'Control de sitio: partes, incidencias, avance de campo y riesgos.',
    },
    physical: 'Avance físico',
    plan: 'Plan al corte',
    cost: 'Costo ejercido',
    pending: 'Decisiones pendientes',
    openRisks: 'Riesgos activos',
    myWork: 'Bandeja de trabajo',
    myWorkCopy: 'Pendientes asignados y próximos vencimientos',
    complete: 'Marcar como completada',
    completeTitle: 'Completar pendiente',
    completeCopy:
      'La actividad saldrá de la bandeja de trabajo. El cambio dura durante esta sesión de demostración.',
    confirmComplete: 'Confirmar finalización',
    restricted: 'Esta acción no forma parte de las capacidades del rol activo.',
    actionDetail: 'Detalle del pendiente',
    area: 'Área',
    roleAccess: 'Acceso del rol',
    enabled: 'Operación habilitada',
    readOnly: 'Sólo consulta',
    done: 'Completada',
    open: 'Abrir',
    noWork: 'No hay pendientes abiertos para este corte.',
    blockers: 'Bloqueos y decisiones',
    risks: 'Riesgos prioritarios',
    changes: 'Solicitudes de cambio',
    viewRegister: 'Abrir registro',
    lookahead: 'Ventana de 14 días',
    activity: 'Actividad',
    owner: 'Responsable',
    finish: 'Fin previsto',
    progress: 'Avance',
    status: 'Estado',
    critical: 'Crítica',
    active: 'En curso',
    upcoming: 'Próxima',
    viewFullSchedule: 'Ver cronograma completo',
    activityLog: 'Últimos reportes de campo',
    crew: 'personas',
    updated: 'Actualizado',
    noReports: 'Todavía no hay partes de campo.',
    error: 'No fue posible cargar el centro de trabajo.',
    priority: { high: 'Alta', medium: 'Media', low: 'Baja' },
    impact: { critical: 'Crítico', high: 'Alto', medium: 'Medio' },
  },
  en: {
    eyebrow: 'Work center / execution',
    title: 'Daily control',
    subtitle: 'Interconexión El Encino - La Laguna · Live information at the July 12, 2026 cutoff.',
    fieldReport: 'Create field report',
    viewField: 'View field control',
    updateSchedule: 'Update schedule',
    viewSchedule: 'View schedule',
    roleMode: 'Active workspace view',
    roleHelp: {
      Administrador: 'Full control: can operate, supervise and resolve records.',
      'Project Manager': 'Project control: planning, costs, risks and decisions.',
      Supervisor: 'Site control: reports, issues, field progress and risks.',
    },
    physical: 'Physical progress',
    plan: 'Plan at cutoff',
    cost: 'Actual cost',
    pending: 'Pending decisions',
    openRisks: 'Active risks',
    myWork: 'Work queue',
    myWorkCopy: 'Assigned items and upcoming due dates',
    complete: 'Mark as completed',
    completeTitle: 'Complete work item',
    completeCopy: 'The activity will leave the work queue. The change lasts for this demo session.',
    confirmComplete: 'Confirm completion',
    restricted: 'This action is outside the active role capabilities.',
    actionDetail: 'Work item details',
    area: 'Area',
    roleAccess: 'Role access',
    enabled: 'Operation enabled',
    readOnly: 'View only',
    done: 'Completed',
    open: 'Open',
    noWork: 'There are no open items for this cutoff.',
    blockers: 'Blockers and decisions',
    risks: 'Priority risks',
    changes: 'Change requests',
    viewRegister: 'Open register',
    lookahead: '14-day window',
    activity: 'Activity',
    owner: 'Owner',
    finish: 'Forecast finish',
    progress: 'Progress',
    status: 'Status',
    critical: 'Critical',
    active: 'In progress',
    upcoming: 'Upcoming',
    viewFullSchedule: 'View full schedule',
    activityLog: 'Latest field reports',
    crew: 'people',
    updated: 'Updated',
    noReports: 'No field reports yet.',
    error: 'The work center could not be loaded.',
    priority: { high: 'High', medium: 'Medium', low: 'Low' },
    impact: { critical: 'Critical', high: 'High', medium: 'Medium' },
  },
} as const

export function OperationalOverviewView({
  onNavigate,
  notify,
}: {
  onNavigate: (view: OperationalView) => void
  notify: (message: string) => void
}) {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'es'
  const text = copy[language]
  const services = useServices()
  const session = useSession()
  const canPlan = useCapability('planning:write')
  const canManageProject = useCapability('changes:review')
  const canUpdateField = useCapability('field:update')
  const canAdminister = useCapability('admin:manage')
  const [selectedAction, setSelectedAction] = useState<WorkAction | null>(null)
  const [pendingAction, setPendingAction] = useState<WorkAction | null>(null)
  const [dialogTrigger, setDialogTrigger] = useState<HTMLElement | null>(null)
  const project = useServiceResource(() => services.project.getSummary(), [services])
  const performance = useServiceResource(() => services.project.listPerformance(), [services])
  const actions = useServiceResource(() => services.governance.listActions(), [services])
  const risks = useServiceResource(() => services.risks.list(), [services])
  const changes = useServiceResource(() => services.changes.list(), [services])
  const schedule = useServiceResource(() => services.project.listSchedule(), [services])
  const reports = useServiceResource(() => services.field.listReports(), [services])

  if (!project.data)
    return <AsyncState loading={project.loading} error={project.error ? text.error : undefined} />

  const july = performance.data?.find((period) => period.period === 'JUL')
  const openActions = (actions.data ?? []).filter((action) => !action.complete)
  const activeRisks = (risks.data ?? []).filter((risk) => risk.status !== 'closed')
  const pendingChanges = (changes.data ?? []).filter((change) => change.status === 'pending')
  const lookahead = [...(schedule.data ?? [])]
    .filter((task) => task.end >= '2026-07-12' && task.start <= '2026-07-26')
    .sort((left, right) => left.end.localeCompare(right.end))
    .slice(0, 6)
  const busy =
    performance.loading ||
    actions.loading ||
    risks.loading ||
    changes.loading ||
    schedule.loading ||
    reports.loading

  const mayCompleteAction = (action: WorkAction) =>
    canAdminister ||
    canManageProject ||
    (canUpdateField && ['Cronograma', 'Riesgos', 'Campo'].includes(action.area))

  const completeAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pendingAction || !mayCompleteAction(pendingAction)) return
    const result = await services.governance.setActionComplete(pendingAction.id, true)
    if (result.ok) {
      setPendingAction(null)
      notify(language === 'es' ? 'Pendiente completado' : 'Work item completed')
      await actions.reload()
    } else {
      notify(
        language === 'es'
          ? 'No fue posible completar el pendiente'
          : 'Work item could not be completed',
      )
    }
  }

  return (
    <div className="op-overview" aria-busy={busy}>
      <header className="op-page-heading">
        <div>
          <span>{text.eyebrow}</span>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
        <div className="op-heading-actions">
          <button
            className="op-button secondary"
            title={canPlan ? text.updateSchedule : text.viewSchedule}
            onClick={() => onNavigate('schedule')}
          >
            {canPlan ? text.updateSchedule : text.viewSchedule}
          </button>
          <button
            className={`op-button ${canUpdateField ? 'primary' : 'secondary'}`}
            title={canUpdateField ? text.fieldReport : text.viewField}
            onClick={() => onNavigate('field')}
          >
            {canUpdateField ? text.fieldReport : text.viewField}
          </button>
        </div>
      </header>

      <aside className="op-role-context" aria-label={`${text.roleMode}: ${session.role}`}>
        <span>{text.roleMode}</span>
        <strong>{session.role}</strong>
        <p>{text.roleHelp[session.role]}</p>
        <b>{canPlan || canUpdateField ? text.enabled : text.readOnly}</b>
      </aside>

      <section className="op-metric-strip" aria-label={text.title}>
        <Metric
          label={text.physical}
          value={`${july?.actual ?? project.data.progress}%`}
          meta="−3 pp"
        />
        <Metric
          label={text.plan}
          value={`${july?.planned ?? 67}%`}
          meta={`SPI ${july?.spi ?? 0.96}`}
        />
        <Metric
          label={text.cost}
          value={formatCurrency(project.data.spent, language)}
          meta={`CPI ${july?.cpi ?? project.data.cpi}`}
        />
        <Metric label={text.pending} value={pendingChanges.length} meta="CCB" tone="warning" />
        <Metric label={text.openRisks} value={activeRisks.length} meta="RISK" tone="danger" />
      </section>

      <div className="op-overview-grid">
        <section className="op-work-panel" aria-labelledby="op-work-title">
          <PanelHeader
            id="op-work-title"
            title={text.myWork}
            copy={text.myWorkCopy}
            badge={`${openActions.length}`}
          />
          <div className="op-work-table-wrap">
            <table className="op-work-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{text.activity}</th>
                  <th>{text.owner}</th>
                  <th>{text.finish}</th>
                  <th>{text.status}</th>
                  <th>{text.open}</th>
                </tr>
              </thead>
              <tbody>
                {openActions.map((action) => (
                  <tr key={action.id}>
                    <td>
                      <code>{action.id}</code>
                    </td>
                    <td>
                      <strong>{action.title}</strong>
                      <small>{action.area}</small>
                    </td>
                    <td>{action.owner === session.name ? session.name : action.owner}</td>
                    <td>
                      <span className={action.due === '12 Jul' ? 'is-overdue' : ''}>
                        {action.due}
                      </span>
                    </td>
                    <td>
                      <span className={`op-priority is-${action.priority}`}>
                        {text.priority[action.priority]}
                      </span>
                    </td>
                    <td>
                      <div className="op-work-actions">
                        <button
                          className="op-row-open"
                          title={`${text.open}: ${action.title}`}
                          onClick={(event) => {
                            setDialogTrigger(event.currentTarget)
                            setSelectedAction(action)
                          }}
                        >
                          {text.open}
                        </button>
                        <button
                          className="op-icon-action"
                          aria-label={`${text.complete}: ${action.title}`}
                          title={mayCompleteAction(action) ? text.complete : text.restricted}
                          disabled={!mayCompleteAction(action)}
                          onClick={(event) => {
                            setDialogTrigger(event.currentTarget)
                            setPendingAction(action)
                          }}
                        >
                          {mayCompleteAction(action) ? '✓' : '🔒'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!busy && openActions.length === 0 && <p className="op-empty">{text.noWork}</p>}
          </div>
        </section>

        <aside className="op-blockers-panel" aria-labelledby="op-blockers-title">
          <PanelHeader
            id="op-blockers-title"
            title={text.blockers}
            copy={`${activeRisks.length + pendingChanges.length}`}
          />
          <div className="op-block-group">
            <div className="op-block-title">
              <h3>{text.risks}</h3>
              <button onClick={() => onNavigate('risks')}>{text.viewRegister}</button>
            </div>
            {activeRisks.slice(0, 3).map((risk) => (
              <button className="op-block-row" key={risk.id} onClick={() => onNavigate('risks')}>
                <span className={`op-severity is-${risk.impact}`}>{text.impact[risk.impact]}</span>
                <strong>{risk.name}</strong>
                <small>
                  {risk.id} · {risk.owner}
                </small>
              </button>
            ))}
          </div>
          <div className="op-block-group">
            <div className="op-block-title">
              <h3>{text.changes}</h3>
              <button onClick={() => onNavigate('changes')}>{text.viewRegister}</button>
            </div>
            {pendingChanges.slice(0, 3).map((change) => (
              <button
                className="op-change-row"
                key={change.id}
                onClick={() => onNavigate('changes')}
              >
                <code>{change.id}</code>
                <strong>{change.title}</strong>
                <small>
                  {formatCurrency(change.cost, language)} · {change.days >= 0 ? '+' : ''}
                  {change.days} d
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="op-lookahead-panel" aria-labelledby="op-lookahead-title">
          <PanelHeader
            id="op-lookahead-title"
            title={text.lookahead}
            copy={`${formatDate('2026-07-12', language)} — ${formatDate('2026-07-26', language)}`}
            action={<button onClick={() => onNavigate('schedule')}>{text.viewFullSchedule}</button>}
          />
          <div className="op-lookahead-table-wrap">
            <table className="op-lookahead-table">
              <thead>
                <tr>
                  <th>{text.activity}</th>
                  <th>{text.owner}</th>
                  <th>{text.finish}</th>
                  <th>{text.progress}</th>
                  <th>{text.status}</th>
                </tr>
              </thead>
              <tbody>
                {lookahead.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.name}</strong>
                      <small>{task.id}</small>
                    </td>
                    <td>{task.owner}</td>
                    <td>{formatDate(task.end, language)}</td>
                    <td>
                      <div className="op-inline-progress">
                        <span>
                          <i style={{ width: `${task.progress}%` }} />
                        </span>
                        <b>{task.progress}%</b>
                      </div>
                    </td>
                    <td>
                      <span className={`op-task-state ${task.critical ? 'is-critical' : ''}`}>
                        {task.critical
                          ? text.critical
                          : task.progress
                            ? text.active
                            : text.upcoming}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="op-field-feed" aria-labelledby="op-field-title">
          <PanelHeader
            id="op-field-title"
            title={text.activityLog}
            copy={`${reports.data?.length ?? 0}`}
          />
          {(reports.data ?? []).slice(0, 3).map((report) => (
            <button key={report.id} onClick={() => onNavigate('field')}>
              <span>
                <code>{report.id}</code>
                <time>{formatDate(report.date, language)}</time>
              </span>
              <strong>{report.front}</strong>
              <small>
                {report.supervisor} · {report.crew} {text.crew}
              </small>
            </button>
          ))}
          {!busy && !reports.data?.length && <p className="op-empty">{text.noReports}</p>}
        </section>
      </div>
      <DetailModal
        open={Boolean(selectedAction)}
        eyebrow={text.actionDetail}
        title={selectedAction ? `${selectedAction.id} · ${selectedAction.title}` : ''}
        returnFocus={dialogTrigger}
        onClose={() => setSelectedAction(null)}
      >
        {selectedAction && (
          <dl className="op-detail-grid op-action-detail">
            <div>
              <dt>{text.owner}</dt>
              <dd>{selectedAction.owner}</dd>
            </div>
            <div>
              <dt>{text.finish}</dt>
              <dd>{selectedAction.due}</dd>
            </div>
            <div>
              <dt>{text.area}</dt>
              <dd>{selectedAction.area}</dd>
            </div>
            <div>
              <dt>{text.status}</dt>
              <dd>{text.priority[selectedAction.priority]}</dd>
            </div>
            <div className="is-wide">
              <dt>{text.roleAccess}</dt>
              <dd>{mayCompleteAction(selectedAction) ? text.enabled : text.readOnly}</dd>
            </div>
          </dl>
        )}
      </DetailModal>
      <FormModal
        open={Boolean(pendingAction)}
        eyebrow={text.myWork}
        title={text.completeTitle}
        submitLabel={text.confirmComplete}
        returnFocus={dialogTrigger}
        onClose={() => setPendingAction(null)}
        onSubmit={completeAction}
      >
        {pendingAction && (
          <div className="op-confirmation-copy">
            <strong>{pendingAction.title}</strong>
            <p>{text.completeCopy}</p>
            <span>
              {pendingAction.id} · {pendingAction.owner} · {pendingAction.due}
            </span>
          </div>
        )}
      </FormModal>
    </div>
  )
}

function Metric({
  label,
  value,
  meta,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  meta: string
  tone?: 'neutral' | 'warning' | 'danger'
}) {
  return (
    <article className={`op-metric is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </article>
  )
}

function PanelHeader({
  id,
  title,
  copy: panelCopy,
  badge,
  action,
}: {
  id?: string
  title: string
  copy: string
  badge?: string
  action?: ReactNode
}) {
  return (
    <header className="op-panel-header">
      <div>
        <h2 id={id}>{title}</h2>
        <p>{panelCopy}</p>
      </div>
      {badge && <span>{badge}</span>}
      {action}
    </header>
  )
}
