import { useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  ChangeRequest,
  ChangeRequestInput,
  CostEstimate,
  CostEstimateInput,
  Risk,
  RiskInput,
} from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { formatCurrency, formatDate } from '../../shared/format'
import { useServiceResource } from '../../shared/useServiceResource'
import { useCapability, useServices } from '../../shared/useServices'
import '../../styles/operations-registers.css'

const labels = {
  es: {
    costs: {
      eyebrow: 'Control financiero',
      title: 'Costos y estimaciones',
      copy: 'Presupuesto, costo real y estimaciones del contratista al corte.',
      add: 'Registrar estimación',
      bac: 'Presupuesto base / BAC',
      ac: 'Costo real / AC',
      variance: 'Disponible',
      pending: 'Por autorizar',
      budget: 'Presupuesto por partida',
      estimates: 'Estimaciones',
      category: 'Partida',
      planned: 'Planeado',
      actual: 'Ejercido',
      delta: 'Variación',
      id: 'Folio',
      period: 'Periodo',
      contractor: 'Contratista',
      amount: 'Importe',
      progress: 'Avance físico',
      status: 'Estado',
      actions: 'Acciones',
      approve: 'Autorizar',
      reject: 'Rechazar',
      formTitle: 'Nueva estimación',
      save: 'Enviar a revisión',
      empty: 'No hay estimaciones registradas.',
      view: 'Ver ficha',
      options: 'Opciones',
      decisionTitle: 'Confirmar decisión de estimación',
      approveConfirm: 'Autorizar estimación',
      rejectConfirm: 'Rechazar estimación',
      decisionCopy:
        'La decisión quedará registrada en la sesión demostrativa y actualizará los indicadores.',
      noWrite: 'Este rol puede consultar costos, pero no registrar estimaciones.',
      noDecide: 'Este rol no cuenta con atribución para autorizar estimaciones.',
      decided: 'La estimación ya cuenta con una decisión registrada.',
      bacHelp: 'Budget at Completion: presupuesto total aprobado de la línea base.',
      acHelp: 'Actual Cost: costo real acumulado al corte del proyecto.',
      detail: 'Ficha de estimación',
    },
    risks: {
      eyebrow: 'Aseguramiento',
      title: 'Registro de riesgos',
      copy: 'Identificación, respuesta, responsable y exposición residual.',
      add: 'Registrar riesgo',
      all: 'Todos',
      open: 'Abiertos',
      mitigated: 'Mitigados',
      closed: 'Cerrados',
      risk: 'Riesgo',
      category: 'Categoría',
      probability: 'Probabilidad',
      impact: 'Impacto',
      owner: 'Responsable',
      response: 'Respuesta',
      status: 'Estado',
      actions: 'Acciones',
      mitigate: 'Marcar mitigado',
      close: 'Cerrar riesgo',
      reopen: 'Reabrir',
      view: 'Ver detalle',
      formTitle: 'Nuevo riesgo',
      save: 'Registrar riesgo',
      mitigation: 'Mitigación',
      contingency: 'Contingencia',
      empty: 'No hay riesgos para este filtro.',
      options: 'Opciones',
      statusTitle: 'Confirmar cambio de estado',
      statusCopy:
        'El movimiento actualizará inmediatamente el registro de riesgos de esta demostración.',
      noWrite: 'Este rol puede consultar riesgos, pero no modificar el registro.',
      statusLocked: 'El cambio de estado requiere la capacidad de gestión de riesgos.',
      confirmMitigate: 'Confirmar mitigación',
      confirmClose: 'Confirmar cierre',
      confirmReopen: 'Confirmar reapertura',
    },
    changes: {
      eyebrow: 'Gobierno del proyecto',
      title: 'Cambios y aprobaciones',
      copy: 'Solicitudes con impacto integrado en costo, plazo y riesgo.',
      add: 'Nueva solicitud',
      id: 'Folio',
      request: 'Solicitud',
      owner: 'Responsable',
      cost: 'Impacto costo',
      days: 'Impacto plazo',
      risk: 'Riesgo',
      status: 'Estado',
      actions: 'Decisión',
      approve: 'Aprobar',
      reject: 'Rechazar',
      formTitle: 'Registrar solicitud de cambio',
      save: 'Enviar al CCB',
      empty: 'No hay solicitudes registradas.',
      detail: 'Ficha de cambio',
      view: 'Ver ficha',
      options: 'Opciones',
      decisionTitle: 'Confirmar decisión del CCB',
      decisionCopy:
        'La resolución quedará registrada y actualizará el impacto aprobado en costo y plazo.',
      approveConfirm: 'Confirmar aprobación',
      rejectConfirm: 'Confirmar rechazo',
      noReview: 'Este rol puede consultar cambios, pero no presentar solicitudes al CCB.',
      noDecide: 'Este rol no tiene voto de decisión dentro del CCB.',
      decided: 'La solicitud ya fue resuelta por el CCB.',
    },
    common: {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      draft: 'Borrador',
      active: 'Activo',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo',
      critical: 'Crítico',
      loading: 'Cargando información…',
      retry: 'Reintentar',
      loadError: 'No fue posible cargar la información.',
      restricted: 'Acción restringida para el rol demostrativo actual',
      confirm: 'Confirmar',
    },
  },
  en: {
    costs: {
      eyebrow: 'Financial control',
      title: 'Costs and estimates',
      copy: 'Budget, actual cost and contractor estimates at cutoff.',
      add: 'Create estimate',
      bac: 'Baseline budget / BAC',
      ac: 'Actual cost / AC',
      variance: 'Available',
      pending: 'Pending approval',
      budget: 'Budget by category',
      estimates: 'Estimates',
      category: 'Category',
      planned: 'Planned',
      actual: 'Actual',
      delta: 'Variance',
      id: 'ID',
      period: 'Period',
      contractor: 'Contractor',
      amount: 'Amount',
      progress: 'Physical progress',
      status: 'Status',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      formTitle: 'New estimate',
      save: 'Submit for review',
      empty: 'No estimates registered.',
      view: 'View record',
      options: 'Options',
      decisionTitle: 'Confirm estimate decision',
      approveConfirm: 'Approve estimate',
      rejectConfirm: 'Reject estimate',
      decisionCopy:
        'The decision will be recorded in the demo session and will update the indicators.',
      noWrite: 'This role can review costs but cannot create estimates.',
      noDecide: 'This role is not authorized to approve estimates.',
      decided: 'This estimate already has a recorded decision.',
      bacHelp: 'Budget at Completion: total approved baseline budget.',
      acHelp: 'Actual Cost: actual cumulative cost at the project cutoff.',
      detail: 'Estimate record',
    },
    risks: {
      eyebrow: 'Assurance',
      title: 'Risk register',
      copy: 'Identification, response, owner and residual exposure.',
      add: 'Create risk',
      all: 'All',
      open: 'Open',
      mitigated: 'Mitigated',
      closed: 'Closed',
      risk: 'Risk',
      category: 'Category',
      probability: 'Probability',
      impact: 'Impact',
      owner: 'Owner',
      response: 'Response',
      status: 'Status',
      actions: 'Actions',
      mitigate: 'Mark mitigated',
      close: 'Close risk',
      reopen: 'Reopen',
      view: 'View detail',
      formTitle: 'New risk',
      save: 'Create risk',
      mitigation: 'Mitigation',
      contingency: 'Contingency',
      empty: 'No risks match this filter.',
      options: 'Options',
      statusTitle: 'Confirm status change',
      statusCopy: 'This action will immediately update the risk register in the demo session.',
      noWrite: 'This role can review risks but cannot modify the register.',
      statusLocked: 'Changing status requires the risk management capability.',
      confirmMitigate: 'Confirm mitigation',
      confirmClose: 'Confirm closure',
      confirmReopen: 'Confirm reopening',
    },
    changes: {
      eyebrow: 'Project governance',
      title: 'Changes and approvals',
      copy: 'Requests with integrated cost, schedule and risk impact.',
      add: 'New request',
      id: 'ID',
      request: 'Request',
      owner: 'Owner',
      cost: 'Cost impact',
      days: 'Schedule impact',
      risk: 'Risk',
      status: 'Status',
      actions: 'Decision',
      approve: 'Approve',
      reject: 'Reject',
      formTitle: 'Create change request',
      save: 'Submit to CCB',
      empty: 'No change requests registered.',
      detail: 'Change record',
      view: 'View record',
      options: 'Options',
      decisionTitle: 'Confirm CCB decision',
      decisionCopy:
        'The resolution will be recorded and will update the approved cost and schedule impact.',
      approveConfirm: 'Confirm approval',
      rejectConfirm: 'Confirm rejection',
      noReview: 'This role can review changes but cannot submit requests to the CCB.',
      noDecide: 'This role does not have decision authority in the CCB.',
      decided: 'This request has already been resolved by the CCB.',
    },
    common: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      draft: 'Draft',
      active: 'Active',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      critical: 'Critical',
      loading: 'Loading information…',
      retry: 'Retry',
      loadError: 'The information could not be loaded.',
      restricted: 'Action restricted for the current demo role',
      confirm: 'Confirm',
    },
  },
} as const

const budgetCategory: Record<string, { es: string; en: string }> = {
  materials: { es: 'Materiales', en: 'Materials' },
  labor: { es: 'Mano de obra', en: 'Labor' },
  machinery: { es: 'Maquinaria', en: 'Machinery' },
  indirect: { es: 'Indirectos', en: 'Indirect' },
}

const riskCategory: Record<Risk['category'], { es: string; en: string }> = {
  technical: { es: 'Técnico', en: 'Technical' },
  environmental: { es: 'Ambiental', en: 'Environmental' },
  financial: { es: 'Financiero', en: 'Financial' },
  regulatory: { es: 'Regulatorio', en: 'Regulatory' },
}

function useOpCopy() {
  const { i18n } = useTranslation()
  const language: 'es' | 'en' = i18n.resolvedLanguage === 'en' ? 'en' : 'es'
  return { language, text: labels[language] }
}

function PageHeader({
  eyebrow,
  title,
  copy,
  action,
  onAction,
  actionRestricted = false,
  actionReason,
}: {
  eyebrow: string
  title: string
  copy: string
  action?: string
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void
  actionRestricted?: boolean
  actionReason?: string
}) {
  return (
    <header className="op-page-heading op-register-heading">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action && onAction && (
        <div className="op-heading-action">
          <button
            className={`op-button primary ${actionRestricted ? 'is-restricted' : ''}`}
            aria-disabled={actionRestricted}
            title={actionRestricted ? actionReason : undefined}
            onClick={onAction}
          >
            + {action}
          </button>
          {actionRestricted && actionReason && (
            <span className="op-permission-note" role="note">
              <span aria-hidden="true">◇</span> {actionReason}
            </span>
          )}
        </div>
      )}
    </header>
  )
}

function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="op-info-tip" tabIndex={0} aria-label={`${label}: ${String(children)}`}>
      <span aria-hidden="true">?</span>
      <span role="tooltip">{children}</span>
    </span>
  )
}

function ResourceState({
  loading,
  error,
  onRetry,
  text,
}: {
  loading: boolean
  error: boolean
  onRetry(): void
  text: (typeof labels)['es']['common'] | (typeof labels)['en']['common']
}) {
  if (loading) return <p className="op-resource-state">{text.loading}</p>
  if (!error) return null
  return (
    <div className="op-resource-state is-error" role="alert">
      <span>{text.loadError}</span>
      <button type="button" onClick={onRetry}>
        {text.retry}
      </button>
    </div>
  )
}

function ConfirmationModal({
  open,
  eyebrow,
  title,
  copy,
  confirmLabel,
  returnFocus,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean
  eyebrow: string
  title: string
  copy: string
  confirmLabel: string
  returnFocus: HTMLElement | null
  onClose(): void
  onConfirm(): void | Promise<void>
  children?: ReactNode
}) {
  return (
    <FormModal
      open={open}
      eyebrow={eyebrow}
      title={title}
      submitLabel={confirmLabel}
      returnFocus={returnFocus}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault()
        void onConfirm()
      }}
    >
      <div className="op-confirmation-copy">
        <span aria-hidden="true">!</span>
        <p>{copy}</p>
      </div>
      {children}
    </FormModal>
  )
}

function ActionMenu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="op-action-menu">
      <summary>{label}</summary>
      <div role="menu">{children}</div>
    </details>
  )
}

function RestrictedAction({
  label,
  reason,
  notify,
}: {
  label: string
  reason: string
  notify(message: string): void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="is-restricted"
      aria-disabled="true"
      title={reason}
      onClick={() => notify(reason)}
    >
      {label}
      <small>{reason}</small>
    </button>
  )
}

export function OperationalCostsView({ notify }: { notify: (message: string) => void }) {
  const { language, text } = useOpCopy()
  const services = useServices()
  const canWrite = useCapability('costs:write')
  const canDecide = useCapability('changes:decide')
  const budget = useServiceResource(() => services.project.listBudget(), [services])
  const estimates = useServiceResource(() => services.costs.listEstimates(), [services])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<CostEstimate | null>(null)
  const [pendingDecision, setPendingDecision] = useState<{
    estimate: CostEstimate
    status: 'approved' | 'rejected'
  } | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [draft, setDraft] = useState<CostEstimateInput>({
    period: '01–15 Jul 2026',
    contractor: '',
    amount: 0,
    physicalProgress: 64,
  })
  const totalPlanned = (budget.data ?? []).reduce((sum, line) => sum + line.planned, 0)
  const totalActual = (budget.data ?? []).reduce((sum, line) => sum + line.actual, 0)
  const pendingAmount = (estimates.data ?? [])
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await services.costs.addEstimate(draft)
    if (!result.ok) return
    setOpen(false)
    setDraft({ period: '01–15 Jul 2026', contractor: '', amount: 0, physicalProgress: 64 })
    notify(language === 'es' ? 'Estimación enviada a revisión' : 'Estimate submitted for review')
    await estimates.reload()
  }
  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const result = await services.costs.decideEstimate(id, status)
    if (result.ok) {
      setPendingDecision(null)
      notify(language === 'es' ? 'Decisión registrada' : 'Decision recorded')
      await estimates.reload()
    }
  }

  return (
    <div className="op-register-page">
      <PageHeader
        eyebrow={text.costs.eyebrow}
        title={text.costs.title}
        copy={text.costs.copy}
        action={text.costs.add}
        actionRestricted={!canWrite}
        actionReason={text.costs.noWrite}
        onAction={(event) => {
          if (!canWrite) {
            notify(text.costs.noWrite)
            return
          }
          setTrigger(event.currentTarget)
          setOpen(true)
        }}
      />
      <section className="op-register-metrics">
        <article>
          <span>
            {text.costs.bac} <InfoTip label="BAC">{text.costs.bacHelp}</InfoTip>
          </span>
          <strong>{formatCurrency(totalPlanned, language)}</strong>
        </article>
        <article>
          <span>
            {text.costs.ac} <InfoTip label="AC">{text.costs.acHelp}</InfoTip>
          </span>
          <strong>{formatCurrency(totalActual, language)}</strong>
        </article>
        <article>
          <span>{text.costs.variance}</span>
          <strong>{formatCurrency(totalPlanned - totalActual, language)}</strong>
        </article>
        <article className="is-warning">
          <span>{text.costs.pending}</span>
          <strong>{formatCurrency(pendingAmount, language)}</strong>
        </article>
      </section>
      <div className="op-register-split">
        <section className="op-data-panel">
          <header>
            <h2>{text.costs.budget}</h2>
          </header>
          <ResourceState
            loading={budget.loading}
            error={Boolean(budget.error)}
            onRetry={() => void budget.reload()}
            text={text.common}
          />
          <div className="op-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{text.costs.category}</th>
                  <th>{text.costs.planned}</th>
                  <th>{text.costs.actual}</th>
                  <th>{text.costs.delta}</th>
                </tr>
              </thead>
              <tbody>
                {(budget.data ?? []).map((line) => (
                  <tr key={line.id}>
                    <td>
                      <code>{line.id}</code>
                      <strong>{budgetCategory[line.category][language]}</strong>
                    </td>
                    <td>{formatCurrency(line.planned, language)}</td>
                    <td>{formatCurrency(line.actual, language)}</td>
                    <td className={line.actual > line.planned ? 'is-negative' : 'is-positive'}>
                      {formatCurrency(line.planned - line.actual, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="op-data-panel is-wide">
          <header>
            <h2>{text.costs.estimates}</h2>
            <span>{estimates.data?.length ?? 0}</span>
          </header>
          <ResourceState
            loading={estimates.loading}
            error={Boolean(estimates.error)}
            onRetry={() => void estimates.reload()}
            text={text.common}
          />
          <div className="op-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{text.costs.id}</th>
                  <th>{text.costs.period}</th>
                  <th>{text.costs.contractor}</th>
                  <th>{text.costs.amount}</th>
                  <th>{text.costs.progress}</th>
                  <th>{text.costs.status}</th>
                  <th>{text.costs.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(estimates.data ?? []).map((estimate) => (
                  <tr key={estimate.id}>
                    <td>
                      <code>{estimate.id}</code>
                    </td>
                    <td>
                      {estimate.period}
                      <small>{formatDate(estimate.submittedAt, language)}</small>
                    </td>
                    <td>
                      <strong>{estimate.contractor}</strong>
                    </td>
                    <td>{formatCurrency(estimate.amount, language)}</td>
                    <td>{estimate.physicalProgress}%</td>
                    <td>
                      <Status value={estimate.status} label={text.common[estimate.status]} />
                    </td>
                    <td>
                      <ActionMenu label={text.costs.options}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => {
                            setTrigger(event.currentTarget)
                            setSelected(estimate)
                          }}
                        >
                          {text.costs.view}
                        </button>
                        {estimate.status === 'pending' && canDecide && (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={(event) => {
                                setTrigger(event.currentTarget)
                                setPendingDecision({ estimate, status: 'approved' })
                              }}
                            >
                              {text.costs.approve}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="danger"
                              onClick={(event) => {
                                setTrigger(event.currentTarget)
                                setPendingDecision({ estimate, status: 'rejected' })
                              }}
                            >
                              {text.costs.reject}
                            </button>
                          </>
                        )}
                        {estimate.status === 'pending' && !canDecide && (
                          <RestrictedAction
                            label={`${text.costs.approve} / ${text.costs.reject}`}
                            reason={text.costs.noDecide}
                            notify={notify}
                          />
                        )}
                        {estimate.status !== 'pending' && (
                          <RestrictedAction
                            label={text.common[estimate.status]}
                            reason={text.costs.decided}
                            notify={notify}
                          />
                        )}
                      </ActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!estimates.loading && !estimates.data?.length && (
              <p className="op-empty">{text.costs.empty}</p>
            )}
          </div>
        </section>
      </div>
      <FormModal
        open={open}
        eyebrow={text.costs.eyebrow}
        title={text.costs.formTitle}
        submitLabel={text.costs.save}
        returnFocus={trigger}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      >
        <div className="form-row">
          <label>
            {text.costs.period}
            <input
              required
              value={draft.period}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
            />
          </label>
          <label>
            {text.costs.progress}
            <input
              type="number"
              min="0"
              max="100"
              required
              value={draft.physicalProgress}
              onChange={(e) => setDraft({ ...draft, physicalProgress: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          {text.costs.contractor}
          <input
            data-autofocus
            required
            value={draft.contractor}
            onChange={(e) => setDraft({ ...draft, contractor: e.target.value })}
          />
        </label>
        <label>
          {text.costs.amount}
          <input
            type="number"
            min="1"
            required
            value={draft.amount || ''}
            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
          />
        </label>
      </FormModal>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={text.costs.detail}
        title={selected ? `${selected.id} · ${selected.contractor}` : ''}
        returnFocus={trigger}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <dl className="op-detail-grid">
              <div>
                <dt>{text.costs.period}</dt>
                <dd>{selected.period}</dd>
              </div>
              <div>
                <dt>{text.costs.status}</dt>
                <dd>
                  <Status value={selected.status} label={text.common[selected.status]} />
                </dd>
              </div>
              <div>
                <dt>{text.costs.amount}</dt>
                <dd>{formatCurrency(selected.amount, language)}</dd>
              </div>
              <div>
                <dt>{text.costs.progress}</dt>
                <dd>{selected.physicalProgress}%</dd>
              </div>
              <div className="is-wide">
                <dt>{language === 'es' ? 'Enviada' : 'Submitted'}</dt>
                <dd>{formatDate(selected.submittedAt, language)}</dd>
              </div>
            </dl>
            {selected.status === 'pending' && (
              <div className="op-detail-actions">
                {canDecide ? (
                  <>
                    <button
                      type="button"
                      className="op-button primary"
                      onClick={() => {
                        setPendingDecision({ estimate: selected, status: 'approved' })
                        setSelected(null)
                      }}
                    >
                      {text.costs.approve}
                    </button>
                    <button
                      type="button"
                      className="op-button secondary danger"
                      onClick={() => {
                        setPendingDecision({ estimate: selected, status: 'rejected' })
                        setSelected(null)
                      }}
                    >
                      {text.costs.reject}
                    </button>
                  </>
                ) : (
                  <p className="op-permission-panel">{text.costs.noDecide}</p>
                )}
              </div>
            )}
          </>
        )}
      </DetailModal>
      <ConfirmationModal
        open={Boolean(pendingDecision)}
        eyebrow={text.costs.eyebrow}
        title={text.costs.decisionTitle}
        copy={text.costs.decisionCopy}
        confirmLabel={
          pendingDecision?.status === 'rejected'
            ? text.costs.rejectConfirm
            : text.costs.approveConfirm
        }
        returnFocus={trigger}
        onClose={() => setPendingDecision(null)}
        onConfirm={() => {
          if (pendingDecision) {
            return decide(pendingDecision.estimate.id, pendingDecision.status)
          }
        }}
      >
        {pendingDecision && (
          <dl className="op-confirmation-record">
            <div>
              <dt>{text.costs.id}</dt>
              <dd>{pendingDecision.estimate.id}</dd>
            </div>
            <div>
              <dt>{text.costs.amount}</dt>
              <dd>{formatCurrency(pendingDecision.estimate.amount, language)}</dd>
            </div>
          </dl>
        )}
      </ConfirmationModal>
    </div>
  )
}

export function OperationalRisksView({ notify }: { notify: (message: string) => void }) {
  const { language, text } = useOpCopy()
  const services = useServices()
  const canWrite = useCapability('risks:write')
  const resource = useServiceResource(() => services.risks.list(), [services])
  const [filter, setFilter] = useState<'all' | Risk['status']>('all')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Risk | null>(null)
  const [pendingStatus, setPendingStatus] = useState<{
    risk: Risk
    value: Risk['status']
  } | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [draft, setDraft] = useState<RiskInput>({
    name: '',
    category: 'technical',
    probability: 'medium',
    impact: 'medium',
    owner: 'Valeria Soto',
    mitigation: '',
    contingency: '',
  })
  const visible = (resource.data ?? []).filter((risk) => filter === 'all' || risk.status === filter)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await services.risks.add(draft)
    if (result.ok) {
      setOpen(false)
      setDraft({
        name: '',
        category: 'technical',
        probability: 'medium',
        impact: 'medium',
        owner: 'Valeria Soto',
        mitigation: '',
        contingency: '',
      })
      notify(language === 'es' ? 'Riesgo registrado' : 'Risk created')
      await resource.reload()
    }
  }
  const status = async (id: string, value: Risk['status']) => {
    const result = await services.risks.updateStatus(id, value)
    if (result.ok) {
      setPendingStatus(null)
      notify(language === 'es' ? 'Estado actualizado' : 'Status updated')
      await resource.reload()
    }
  }
  return (
    <div className="op-register-page">
      <PageHeader
        eyebrow={text.risks.eyebrow}
        title={text.risks.title}
        copy={text.risks.copy}
        action={text.risks.add}
        actionRestricted={!canWrite}
        actionReason={text.risks.noWrite}
        onAction={(event) => {
          if (!canWrite) {
            notify(text.risks.noWrite)
            return
          }
          setTrigger(event.currentTarget)
          setOpen(true)
        }}
      />
      <div className="op-filterbar" role="group" aria-label={text.risks.status}>
        {(['all', 'open', 'mitigated', 'closed'] as const).map((item) => (
          <button
            key={item}
            className={filter === item ? 'is-active' : ''}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {text.risks[item]}
          </button>
        ))}
      </div>
      <section className="op-data-panel is-register">
        <ResourceState
          loading={resource.loading}
          error={Boolean(resource.error)}
          onRetry={() => void resource.reload()}
          text={text.common}
        />
        <div className="op-table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{text.risks.risk}</th>
                <th>{text.risks.category}</th>
                <th>{text.risks.probability}</th>
                <th>{text.risks.impact}</th>
                <th>{text.risks.owner}</th>
                <th>{text.risks.status}</th>
                <th>{text.risks.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((risk) => (
                <tr key={risk.id}>
                  <td>
                    <code>{risk.id}</code>
                  </td>
                  <td>
                    <strong>{risk.name}</strong>
                    <small>{risk.note}</small>
                  </td>
                  <td>{riskCategory[risk.category][language]}</td>
                  <td>
                    <Status value={risk.probability} label={text.common[risk.probability]} />
                  </td>
                  <td>
                    <Status value={risk.impact} label={text.common[risk.impact]} />
                  </td>
                  <td>{risk.owner}</td>
                  <td>
                    <Status value={risk.status} label={text.risks[risk.status]} />
                  </td>
                  <td>
                    <ActionMenu label={text.risks.options}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(event) => {
                          setTrigger(event.currentTarget)
                          setSelected(risk)
                        }}
                      >
                        {text.risks.view}
                      </button>
                      {canWrite && risk.status === 'open' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => {
                            setTrigger(event.currentTarget)
                            setPendingStatus({ risk, value: 'mitigated' })
                          }}
                        >
                          {text.risks.mitigate}
                        </button>
                      )}
                      {canWrite && risk.status !== 'closed' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => {
                            setTrigger(event.currentTarget)
                            setPendingStatus({ risk, value: 'closed' })
                          }}
                        >
                          {text.risks.close}
                        </button>
                      )}
                      {canWrite && risk.status === 'closed' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => {
                            setTrigger(event.currentTarget)
                            setPendingStatus({ risk, value: 'open' })
                          }}
                        >
                          {text.risks.reopen}
                        </button>
                      )}
                      {!canWrite && (
                        <RestrictedAction
                          label={text.risks.status}
                          reason={text.risks.statusLocked}
                          notify={notify}
                        />
                      )}
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!resource.loading && visible.length === 0 && (
            <p className="op-empty">{text.risks.empty}</p>
          )}
        </div>
      </section>
      <FormModal
        open={open}
        eyebrow={text.risks.eyebrow}
        title={text.risks.formTitle}
        submitLabel={text.risks.save}
        returnFocus={trigger}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        wide
      >
        <label>
          {text.risks.risk}
          <input
            data-autofocus
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            {text.risks.category}
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as RiskInput['category'] })
              }
            >
              <option value="technical">{riskCategory.technical[language]}</option>
              <option value="environmental">{riskCategory.environmental[language]}</option>
              <option value="financial">{riskCategory.financial[language]}</option>
              <option value="regulatory">{riskCategory.regulatory[language]}</option>
            </select>
          </label>
          <label>
            {text.risks.owner}
            <input
              required
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            {text.risks.probability}
            <select
              value={draft.probability}
              onChange={(e) =>
                setDraft({ ...draft, probability: e.target.value as RiskInput['probability'] })
              }
            >
              <option value="medium">{text.common.medium}</option>
              <option value="high">{text.common.high}</option>
            </select>
          </label>
          <label>
            {text.risks.impact}
            <select
              value={draft.impact}
              onChange={(e) =>
                setDraft({ ...draft, impact: e.target.value as RiskInput['impact'] })
              }
            >
              <option value="medium">{text.common.medium}</option>
              <option value="high">{text.common.high}</option>
              <option value="critical">{text.common.critical}</option>
            </select>
          </label>
        </div>
        <label>
          {text.risks.mitigation}
          <textarea
            required
            value={draft.mitigation}
            onChange={(e) => setDraft({ ...draft, mitigation: e.target.value })}
          />
        </label>
        <label>
          {text.risks.contingency}
          <textarea
            required
            value={draft.contingency}
            onChange={(e) => setDraft({ ...draft, contingency: e.target.value })}
          />
        </label>
      </FormModal>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={text.risks.view}
        title={selected ? `${selected.id} · ${selected.name}` : ''}
        returnFocus={trigger}
        onClose={() => setSelected(null)}
        wide
      >
        {selected && (
          <>
            <dl className="op-detail-grid">
              <div>
                <dt>{text.risks.owner}</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>{text.risks.status}</dt>
                <dd>
                  <Status value={selected.status} label={text.risks[selected.status]} />
                </dd>
              </div>
              <div>
                <dt>{text.risks.probability}</dt>
                <dd>
                  <Status value={selected.probability} label={text.common[selected.probability]} />
                </dd>
              </div>
              <div>
                <dt>{text.risks.impact}</dt>
                <dd>
                  <Status value={selected.impact} label={text.common[selected.impact]} />
                </dd>
              </div>
              <div className="is-wide">
                <dt>{text.risks.mitigation}</dt>
                <dd>{selected.mitigation}</dd>
              </div>
              <div className="is-wide">
                <dt>{text.risks.contingency}</dt>
                <dd>{selected.contingency}</dd>
              </div>
            </dl>
            <div className="op-detail-actions">
              {canWrite ? (
                <>
                  {selected.status === 'open' && (
                    <button
                      type="button"
                      className="op-button primary"
                      onClick={() => {
                        setPendingStatus({ risk: selected, value: 'mitigated' })
                        setSelected(null)
                      }}
                    >
                      {text.risks.mitigate}
                    </button>
                  )}
                  {selected.status !== 'closed' && (
                    <button
                      type="button"
                      className="op-button secondary"
                      onClick={() => {
                        setPendingStatus({ risk: selected, value: 'closed' })
                        setSelected(null)
                      }}
                    >
                      {text.risks.close}
                    </button>
                  )}
                  {selected.status === 'closed' && (
                    <button
                      type="button"
                      className="op-button primary"
                      onClick={() => {
                        setPendingStatus({ risk: selected, value: 'open' })
                        setSelected(null)
                      }}
                    >
                      {text.risks.reopen}
                    </button>
                  )}
                </>
              ) : (
                <p className="op-permission-panel">{text.risks.statusLocked}</p>
              )}
            </div>
          </>
        )}
      </DetailModal>
      <ConfirmationModal
        open={Boolean(pendingStatus)}
        eyebrow={text.risks.eyebrow}
        title={text.risks.statusTitle}
        copy={text.risks.statusCopy}
        confirmLabel={
          pendingStatus?.value === 'mitigated'
            ? text.risks.confirmMitigate
            : pendingStatus?.value === 'closed'
              ? text.risks.confirmClose
              : text.risks.confirmReopen
        }
        returnFocus={trigger}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => {
          if (pendingStatus) return status(pendingStatus.risk.id, pendingStatus.value)
        }}
      >
        {pendingStatus && (
          <dl className="op-confirmation-record">
            <div>
              <dt>ID</dt>
              <dd>{pendingStatus.risk.id}</dd>
            </div>
            <div>
              <dt>{text.risks.risk}</dt>
              <dd>{pendingStatus.risk.name}</dd>
            </div>
          </dl>
        )}
      </ConfirmationModal>
    </div>
  )
}

export function OperationalChangesView({ notify }: { notify: (message: string) => void }) {
  const { language, text } = useOpCopy()
  const services = useServices()
  const canReview = useCapability('changes:review')
  const canDecide = useCapability('changes:decide')
  const resource = useServiceResource(() => services.changes.list(), [services])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ChangeRequest | null>(null)
  const [pendingDecision, setPendingDecision] = useState<{
    change: ChangeRequest
    status: 'approved' | 'rejected'
  } | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [draft, setDraft] = useState<ChangeRequestInput>({
    title: '',
    owner: 'Valeria Soto',
    cost: 0,
    days: 0,
    risk: 'medium',
  })
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await services.changes.add(draft)
    if (result.ok) {
      setOpen(false)
      setDraft({ title: '', owner: 'Valeria Soto', cost: 0, days: 0, risk: 'medium' })
      notify(language === 'es' ? 'Solicitud enviada al CCB' : 'Request submitted to CCB')
      await resource.reload()
    }
  }
  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const result = await services.changes.decide(id, status)
    if (result.ok) {
      setPendingDecision(null)
      notify(language === 'es' ? 'Decisión registrada' : 'Decision recorded')
      await resource.reload()
    }
  }
  const totals = useMemo(
    () => ({
      pending: (resource.data ?? []).filter((item) => item.status === 'pending').length,
      cost: (resource.data ?? [])
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + item.cost, 0),
      days: (resource.data ?? [])
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + item.days, 0),
    }),
    [resource.data],
  )
  return (
    <div className="op-register-page">
      <PageHeader
        eyebrow={text.changes.eyebrow}
        title={text.changes.title}
        copy={text.changes.copy}
        action={text.changes.add}
        actionRestricted={!canReview}
        actionReason={text.changes.noReview}
        onAction={(event) => {
          if (!canReview) {
            notify(text.changes.noReview)
            return
          }
          setTrigger(event.currentTarget)
          setOpen(true)
        }}
      />
      <section className="op-register-metrics">
        <article>
          <span>{text.common.pending}</span>
          <strong>{totals.pending}</strong>
        </article>
        <article>
          <span>{text.changes.cost}</span>
          <strong>{formatCurrency(totals.cost, language)}</strong>
        </article>
        <article>
          <span>{text.changes.days}</span>
          <strong>
            {totals.days >= 0 ? '+' : ''}
            {totals.days} d
          </strong>
        </article>
      </section>
      <section className="op-data-panel is-register">
        <ResourceState
          loading={resource.loading}
          error={Boolean(resource.error)}
          onRetry={() => void resource.reload()}
          text={text.common}
        />
        <div className="op-table-scroll">
          <table>
            <thead>
              <tr>
                <th>{text.changes.id}</th>
                <th>{text.changes.request}</th>
                <th>{text.changes.owner}</th>
                <th>{text.changes.cost}</th>
                <th>{text.changes.days}</th>
                <th>{text.changes.risk}</th>
                <th>{text.changes.status}</th>
                <th>{text.changes.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(resource.data ?? []).map((change) => (
                <tr key={change.id}>
                  <td>
                    <button
                      className="op-record-link"
                      onClick={(event) => {
                        setTrigger(event.currentTarget)
                        setSelected(change)
                      }}
                    >
                      {change.id}
                    </button>
                  </td>
                  <td>
                    <strong>{change.title}</strong>
                  </td>
                  <td>{change.owner}</td>
                  <td>{formatCurrency(change.cost, language)}</td>
                  <td>
                    {change.days >= 0 ? '+' : ''}
                    {change.days} d
                  </td>
                  <td>
                    <Status value={change.risk} label={text.common[change.risk]} />
                  </td>
                  <td>
                    <Status value={change.status} label={text.common[change.status]} />
                  </td>
                  <td>
                    <ActionMenu label={text.changes.options}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(event) => {
                          setTrigger(event.currentTarget)
                          setSelected(change)
                        }}
                      >
                        {text.changes.view}
                      </button>
                      {change.status === 'pending' && canDecide && (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={(event) => {
                              setTrigger(event.currentTarget)
                              setPendingDecision({ change, status: 'approved' })
                            }}
                          >
                            {text.changes.approve}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="danger"
                            onClick={(event) => {
                              setTrigger(event.currentTarget)
                              setPendingDecision({ change, status: 'rejected' })
                            }}
                          >
                            {text.changes.reject}
                          </button>
                        </>
                      )}
                      {change.status === 'pending' && !canDecide && (
                        <RestrictedAction
                          label={`${text.changes.approve} / ${text.changes.reject}`}
                          reason={text.changes.noDecide}
                          notify={notify}
                        />
                      )}
                      {change.status !== 'pending' && (
                        <RestrictedAction
                          label={text.common[change.status]}
                          reason={text.changes.decided}
                          notify={notify}
                        />
                      )}
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!resource.loading && !resource.data?.length && (
            <p className="op-empty">{text.changes.empty}</p>
          )}
        </div>
      </section>
      <FormModal
        open={open}
        eyebrow={text.changes.eyebrow}
        title={text.changes.formTitle}
        submitLabel={text.changes.save}
        returnFocus={trigger}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      >
        <label>
          {text.changes.request}
          <input
            data-autofocus
            required
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <label>
          {text.changes.owner}
          <input
            required
            value={draft.owner}
            onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            {text.changes.cost}
            <input
              type="number"
              value={draft.cost}
              onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) })}
            />
          </label>
          <label>
            {text.changes.days}
            <input
              type="number"
              value={draft.days}
              onChange={(e) => setDraft({ ...draft, days: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          {text.changes.risk}
          <select
            value={draft.risk}
            onChange={(e) =>
              setDraft({ ...draft, risk: e.target.value as ChangeRequestInput['risk'] })
            }
          >
            <option value="low">{text.common.low}</option>
            <option value="medium">{text.common.medium}</option>
            <option value="high">{text.common.high}</option>
          </select>
        </label>
      </FormModal>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={text.changes.detail}
        title={selected ? `${selected.id} · ${selected.title}` : ''}
        returnFocus={trigger}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <dl className="op-detail-grid">
              <div>
                <dt>{text.changes.owner}</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>{text.changes.status}</dt>
                <dd>
                  <Status value={selected.status} label={text.common[selected.status]} />
                </dd>
              </div>
              <div>
                <dt>{text.changes.cost}</dt>
                <dd>{formatCurrency(selected.cost, language)}</dd>
              </div>
              <div>
                <dt>{text.changes.days}</dt>
                <dd>
                  {selected.days >= 0 ? '+' : ''}
                  {selected.days} d
                </dd>
              </div>
              <div className="is-wide">
                <dt>{text.changes.risk}</dt>
                <dd>
                  <Status value={selected.risk} label={text.common[selected.risk]} />
                </dd>
              </div>
            </dl>
            {selected.status === 'pending' && (
              <div className="op-detail-actions">
                {canDecide ? (
                  <>
                    <button
                      type="button"
                      className="op-button primary"
                      onClick={() => {
                        setPendingDecision({ change: selected, status: 'approved' })
                        setSelected(null)
                      }}
                    >
                      {text.changes.approve}
                    </button>
                    <button
                      type="button"
                      className="op-button secondary danger"
                      onClick={() => {
                        setPendingDecision({ change: selected, status: 'rejected' })
                        setSelected(null)
                      }}
                    >
                      {text.changes.reject}
                    </button>
                  </>
                ) : (
                  <p className="op-permission-panel">{text.changes.noDecide}</p>
                )}
              </div>
            )}
          </>
        )}
      </DetailModal>
      <ConfirmationModal
        open={Boolean(pendingDecision)}
        eyebrow="CCB"
        title={text.changes.decisionTitle}
        copy={text.changes.decisionCopy}
        confirmLabel={
          pendingDecision?.status === 'rejected'
            ? text.changes.rejectConfirm
            : text.changes.approveConfirm
        }
        returnFocus={trigger}
        onClose={() => setPendingDecision(null)}
        onConfirm={() => {
          if (pendingDecision) {
            return decide(pendingDecision.change.id, pendingDecision.status)
          }
        }}
      >
        {pendingDecision && (
          <dl className="op-confirmation-record">
            <div>
              <dt>{text.changes.id}</dt>
              <dd>{pendingDecision.change.id}</dd>
            </div>
            <div>
              <dt>{text.changes.request}</dt>
              <dd>{pendingDecision.change.title}</dd>
            </div>
            <div>
              <dt>{text.changes.cost}</dt>
              <dd>{formatCurrency(pendingDecision.change.cost, language)}</dd>
            </div>
            <div>
              <dt>{text.changes.days}</dt>
              <dd>{pendingDecision.change.days} d</dd>
            </div>
          </dl>
        )}
      </ConfirmationModal>
    </div>
  )
}

function Status({ value, label }: { value: string; label: string }) {
  return <span className={`op-status is-${value}`}>{label}</span>
}
