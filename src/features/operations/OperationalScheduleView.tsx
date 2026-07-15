import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { PerformancePeriod, ScheduleTask, ScheduleTaskInput } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { useServiceResource } from '../../shared/useServiceResource'
import { useCapability, useServices } from '../../shared/useServices'
import '../../styles/operations-schedule.css'

type Filter = 'all' | 'critical' | 'delayed' | 'milestone' | 'active' | 'completed'
type Scale = 'weeks' | 'months'

const DATA_DATE = '2026-07-12'
const DAY = 86_400_000
const ROW_HEIGHT = 52
const VIEW_START = Date.parse('2026-01-01T00:00:00Z')
const VIEW_END = Date.parse('2026-09-30T00:00:00Z')
const VIEW_DAYS = Math.round((VIEW_END - VIEW_START) / DAY) + 1

const copy = {
  es: {
    eyebrow: 'PROYECTO / CONTROL INTEGRADO',
    title: 'Cronograma operativo',
    subtitle: 'Programa maestro · actualización diaria y control de ruta crítica',
    dateLabel: 'Fecha de datos',
    updated: 'Corte contractual',
    reload: 'Actualizar',
    reloadHint: 'Sincroniza programa, indicadores y curva EVM con el corte demostrativo.',
    add: 'Nueva actividad',
    search: 'Buscar ID, actividad o responsable',
    filter: 'Filtrar actividades',
    all: 'Todas',
    critical: 'Ruta crítica',
    delayed: 'Atrasadas',
    milestone: 'Hitos',
    active: 'En curso',
    completed: 'Terminadas',
    baseline: 'Mostrar línea base',
    weeks: 'Semanas',
    months: 'Meses',
    scaleLabel: 'Escala del cronograma',
    legend: 'Leyenda del cronograma',
    activities: 'Actividades',
    finished: 'Terminadas',
    criticalKpi: 'Críticas abiertas',
    delayedKpi: 'Atrasadas',
    variance: 'Variación fin',
    days: 'días',
    onTime: 'En fecha',
    plan: 'Plan',
    actual: 'Real',
    grid: 'Hoja de programación',
    visible: 'visibles',
    id: 'ID',
    activity: 'Actividad',
    owner: 'Responsable',
    start: 'Inicio',
    end: 'Fin',
    duration: 'Dur.',
    predecessor: 'Predecesora',
    progress: 'Avance',
    condition: 'Condición',
    actions: 'Acciones',
    actionMenu: 'Abrir opciones de la actividad',
    actionMenuLabel: 'Opciones de actividad',
    edit: 'Editar',
    noDependency: 'Sin dependencia',
    completedState: 'Terminada',
    delayedState: 'Atrasada',
    upcomingState: 'No iniciada',
    activeState: 'En curso',
    criticalState: 'Crítica',
    milestoneState: 'Hito',
    gantt: 'Gantt técnico',
    today: 'Fecha de datos',
    detail: 'Detalle de actividad',
    selectHint: 'Selecciona una actividad en la hoja o en el Gantt para inspeccionarla.',
    baselineStart: 'Inicio LB',
    baselineEnd: 'Fin LB',
    forecast: 'Pronóstico',
    finishVariance: 'Variación al fin',
    float: 'Holgura libre',
    notes: 'Notas de control',
    none: 'Sin registro',
    progressAction: 'Registrar avance',
    deleteAction: 'Eliminar',
    loading: 'Cargando programa maestro…',
    loadError: 'No fue posible cargar el cronograma.',
    retry: 'Reintentar',
    emptyTitle: 'No hay actividades que mostrar',
    emptyCopy: 'Cambia los filtros o agrega la primera actividad al programa.',
    noPermission: 'Tu perfil puede consultar el cronograma, pero no modificarlo.',
    writeUnavailable: 'Disponible para Administrador y Project Manager.',
    newEyebrow: 'CRONOGRAMA / ALTA',
    newTitle: 'Nueva actividad',
    create: 'Agregar al programa',
    editEyebrow: 'CRONOGRAMA / EDICIÓN',
    editTitle: 'Editar actividad',
    save: 'Guardar cambios',
    progressEyebrow: 'CRONOGRAMA / AVANCE',
    progressTitle: 'Actualizar avance',
    register: 'Registrar actualización',
    progressHelp: 'El avance físico debe reflejar trabajo comprobable a la fecha de datos.',
    deleteEyebrow: 'CRONOGRAMA / CONFIRMACIÓN',
    deleteTitle: 'Eliminar actividad',
    deleteCopy: 'Se eliminará del programa de esta sesión demostrativa.',
    deleteWarning: 'La operación se bloqueará si existen actividades sucesoras vinculadas.',
    cancel: 'Cancelar',
    confirmDelete: 'Eliminar actividad',
    nameField: 'Nombre de la actividad',
    ownerField: 'Responsable',
    startField: 'Inicio pronosticado',
    endField: 'Fin pronosticado',
    progressField: 'Avance físico (%)',
    predecessorField: 'Predecesora',
    noteField: 'Nota de control',
    criticalField: 'Pertenece a la ruta crítica',
    milestoneField: 'Es un hito',
    requiredError: 'Completa el nombre, responsable y fechas válidas.',
    saved: 'Actividad actualizada.',
    created: 'Actividad agregada al programa.',
    progressSaved: 'Avance registrado.',
    deleted: 'Actividad eliminada.',
    refreshed: 'Cronograma sincronizado con el corte operativo.',
    plannedVsActual: 'Avance acumulado',
    spi: 'SPI actual',
    performanceEmpty: 'Sin serie de desempeño disponible.',
  },
  en: {
    eyebrow: 'PROJECT / INTEGRATED CONTROL',
    title: 'Operational schedule',
    subtitle: 'Master programme · daily update and critical path control',
    dateLabel: 'Data date',
    updated: 'Contract cut-off',
    reload: 'Refresh',
    reloadHint: 'Synchronizes programme, indicators, and EVM curve with the demo cut-off.',
    add: 'New activity',
    search: 'Search ID, activity or owner',
    filter: 'Filter activities',
    all: 'All',
    critical: 'Critical path',
    delayed: 'Delayed',
    milestone: 'Milestones',
    active: 'In progress',
    completed: 'Completed',
    baseline: 'Show baseline',
    weeks: 'Weeks',
    months: 'Months',
    scaleLabel: 'Schedule scale',
    legend: 'Schedule legend',
    activities: 'Activities',
    finished: 'Completed',
    criticalKpi: 'Open critical',
    delayedKpi: 'Delayed',
    variance: 'Finish variance',
    days: 'days',
    onTime: 'On time',
    plan: 'Plan',
    actual: 'Actual',
    grid: 'Schedule sheet',
    visible: 'visible',
    id: 'ID',
    activity: 'Activity',
    owner: 'Owner',
    start: 'Start',
    end: 'Finish',
    duration: 'Dur.',
    predecessor: 'Predecessor',
    progress: 'Progress',
    condition: 'Condition',
    actions: 'Actions',
    actionMenu: 'Open activity options',
    actionMenuLabel: 'Activity options',
    edit: 'Edit',
    noDependency: 'No dependency',
    completedState: 'Completed',
    delayedState: 'Delayed',
    upcomingState: 'Not started',
    activeState: 'In progress',
    criticalState: 'Critical',
    milestoneState: 'Milestone',
    gantt: 'Technical Gantt',
    today: 'Data date',
    detail: 'Activity details',
    selectHint: 'Select an activity in the sheet or Gantt to inspect it.',
    baselineStart: 'BL start',
    baselineEnd: 'BL finish',
    forecast: 'Forecast',
    finishVariance: 'Finish variance',
    float: 'Free float',
    notes: 'Control notes',
    none: 'No record',
    progressAction: 'Record progress',
    deleteAction: 'Delete',
    loading: 'Loading master schedule…',
    loadError: 'The schedule could not be loaded.',
    retry: 'Try again',
    emptyTitle: 'No activities to display',
    emptyCopy: 'Change the filters or add the first activity to the programme.',
    noPermission: 'Your profile can view the schedule, but cannot modify it.',
    writeUnavailable: 'Available to Administrator and Project Manager.',
    newEyebrow: 'SCHEDULE / CREATE',
    newTitle: 'New activity',
    create: 'Add to programme',
    editEyebrow: 'SCHEDULE / EDIT',
    editTitle: 'Edit activity',
    save: 'Save changes',
    progressEyebrow: 'SCHEDULE / PROGRESS',
    progressTitle: 'Update progress',
    register: 'Record update',
    progressHelp: 'Physical progress must reflect verified work at the data date.',
    deleteEyebrow: 'SCHEDULE / CONFIRMATION',
    deleteTitle: 'Delete activity',
    deleteCopy: 'It will be removed from this demonstration session.',
    deleteWarning: 'The operation will be blocked if linked successor activities exist.',
    cancel: 'Cancel',
    confirmDelete: 'Delete activity',
    nameField: 'Activity name',
    ownerField: 'Owner',
    startField: 'Forecast start',
    endField: 'Forecast finish',
    progressField: 'Physical progress (%)',
    predecessorField: 'Predecessor',
    noteField: 'Control note',
    criticalField: 'Is on the critical path',
    milestoneField: 'Is a milestone',
    requiredError: 'Complete the name, owner, and valid dates.',
    saved: 'Activity updated.',
    created: 'Activity added to the programme.',
    progressSaved: 'Progress recorded.',
    deleted: 'Activity deleted.',
    refreshed: 'Schedule synchronized with the operational cut-off.',
    plannedVsActual: 'Cumulative progress',
    spi: 'Current SPI',
    performanceEmpty: 'No performance series available.',
  },
} as const

const daysBetween = (start: string, end: string) =>
  Math.max(0, Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY))

const signedDaysBetween = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY)

const duration = (task: ScheduleTask) => daysBetween(task.start, task.end) + 1

const stateOf = (task: ScheduleTask) => {
  if (task.progress >= 100) return 'completed' as const
  if (task.end < DATA_DATE) return 'delayed' as const
  if (task.start > DATA_DATE) return 'upcoming' as const
  return 'active' as const
}

const finishVariance = (task: ScheduleTask) =>
  task.baselineEnd ? signedDaysBetween(task.baselineEnd, task.end) : null

const datePosition = (date: string) =>
  Math.min(
    100,
    Math.max(0, ((Date.parse(`${date}T00:00:00Z`) - VIEW_START) / DAY / VIEW_DAYS) * 100),
  )

const dateWidth = (start: string, end: string) =>
  Math.max(0.8, Math.min(100, ((daysBetween(start, end) + 1) / VIEW_DAYS) * 100))

const blankDraft = (): ScheduleTaskInput => ({
  name: '',
  owner: 'Valeria Soto',
  start: DATA_DATE,
  end: DATA_DATE,
  progress: 0,
  critical: false,
  milestone: false,
  notes: '',
})

const monthMarks = Array.from({ length: 9 }, (_, index) => {
  const start = Date.UTC(2026, index, 1)
  const end = Date.UTC(2026, index + 1, 1)
  return {
    key: index,
    left: ((start - VIEW_START) / DAY / VIEW_DAYS) * 100,
    width: ((end - start) / DAY / VIEW_DAYS) * 100,
    date: start,
  }
})

const weekMarks = Array.from({ length: 39 }, (_, index) => ({
  key: index,
  left: ((index * 7) / VIEW_DAYS) * 100,
  width: (7 / VIEW_DAYS) * 100,
  date: VIEW_START + index * 7 * DAY,
}))

export function OperationalScheduleView() {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'es'
  const t = copy[language]
  const locale = language === 'en' ? 'en-MX' : 'es-MX'
  const services = useServices()
  const canWrite = useCapability('planning:write')
  const summaryResource = useServiceResource(() => services.project.getSummary(), [services])
  const scheduleResource = useServiceResource(() => services.project.listSchedule(), [services])
  const performanceResource = useServiceResource(
    () => services.project.listPerformance(),
    [services],
  )
  const { data: project } = summaryResource
  const tasks = useMemo(() => scheduleResource.data ?? [], [scheduleResource.data])
  const performance = useMemo(() => performanceResource.data ?? [], [performanceResource.data])

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [scale, setScale] = useState<Scale>('months')
  const [showBaseline, setShowBaseline] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<ScheduleTaskInput>(blankDraft)
  const [editing, setEditing] = useState<ScheduleTask | null>(null)
  const [progressTask, setProgressTask] = useState<ScheduleTask | null>(null)
  const [progressDraft, setProgressDraft] = useState(0)
  const [deleteTask, setDeleteTask] = useState<ScheduleTask | null>(null)
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)
  const [notice, setNotice] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (!actionMenuId) return
    const focusFrame = requestAnimationFrame(() => {
      document
        .getElementById(`ops-actions-${actionMenuId}`)
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus()
    })
    const closeOnPointer = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.ops-row-actions')) setActionMenuId(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setActionMenuId(null)
        requestAnimationFrame(() =>
          document.getElementById(`ops-actions-trigger-${actionMenuId}`)?.focus(),
        )
      }
    }
    document.addEventListener('pointerdown', closeOnPointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('pointerdown', closeOnPointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [actionMenuId])

  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale)
    return tasks
      .filter((task) => {
        const state = stateOf(task)
        const matchesQuery = `${task.id} ${task.name} ${task.owner}`
          .toLocaleLowerCase(locale)
          .includes(normalized)
        const matchesFilter =
          filter === 'all' ||
          (filter === 'critical' && task.critical && task.progress < 100) ||
          (filter === 'milestone' && task.milestone) ||
          (filter === 'delayed' && state === 'delayed') ||
          filter === state
        return matchesQuery && matchesFilter
      })
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id))
  }, [filter, locale, query, tasks])

  const selected = tasks.find((task) => task.id === selectedId) ?? visibleTasks[0] ?? null
  const delayedCount = tasks.filter((task) => stateOf(task) === 'delayed').length
  const criticalCount = tasks.filter((task) => task.critical && task.progress < 100).length
  const finishedCount = tasks.filter((task) => task.progress >= 100).length
  const baselineFinish = tasks
    .map((task) => task.baselineEnd)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)
  const forecastFinish = tasks
    .map((task) => task.end)
    .sort()
    .at(-1)
  const programmeVariance =
    baselineFinish && forecastFinish ? signedDaysBetween(baselineFinish, forecastFinish) : 0
  const lastPerformance = performance.at(-1)
  const loading = summaryResource.loading || scheduleResource.loading || performanceResource.loading
  const loadError =
    summaryResource.error?.message ||
    scheduleResource.error?.message ||
    performanceResource.error?.message

  const reloadAll = async () => {
    setNotice('')
    await Promise.all([
      summaryResource.reload(),
      scheduleResource.reload(),
      performanceResource.reload(),
    ])
    setNotice(t.refreshed)
  }

  const openFrom = (element: HTMLElement, action: () => void) => {
    setReturnFocus(element)
    setMutationError('')
    action()
  }

  const validate = (value: ScheduleTaskInput) =>
    Boolean(
      value.name.trim() &&
      value.owner.trim() &&
      value.start &&
      value.end &&
      value.end >= value.start,
    )

  const saveNew = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate(draft)) {
      setMutationError(t.requiredError)
      return
    }
    const result = await services.project.addScheduleTask({
      ...draft,
      progress: Number(draft.progress),
    })
    if (!result.ok) {
      setMutationError(result.error.message)
      return
    }
    setCreating(false)
    setDraft(blankDraft())
    setSelectedId(result.data.id)
    setNotice(t.created)
    await scheduleResource.reload()
  }

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing || !validate(editing)) {
      setMutationError(t.requiredError)
      return
    }
    const result = await services.project.updateScheduleTask(editing.id, {
      name: editing.name,
      owner: editing.owner,
      start: editing.start,
      end: editing.end,
      progress: Number(editing.progress),
      critical: editing.critical,
      milestone: editing.milestone,
      predecessor: editing.predecessor,
      notes: editing.notes,
    })
    if (!result.ok) {
      setMutationError(result.error.message)
      return
    }
    setEditing(null)
    setSelectedId(result.data.id)
    setNotice(t.saved)
    await scheduleResource.reload()
  }

  const saveProgress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!progressTask) return
    const result = await services.project.updateScheduleProgress(
      progressTask.id,
      Math.max(0, Math.min(100, Number(progressDraft))),
    )
    if (!result.ok) {
      setMutationError(result.error.message)
      return
    }
    setProgressTask(null)
    setSelectedId(result.data.id)
    setNotice(t.progressSaved)
    await scheduleResource.reload()
  }

  const remove = async () => {
    if (!deleteTask) return
    const result = await services.project.deleteScheduleTask(deleteTask.id)
    if (!result.ok) {
      setMutationError(result.error.message)
      return
    }
    setDeleteTask(null)
    setSelectedId(null)
    setNotice(t.deleted)
    await scheduleResource.reload()
  }

  if (loading && !tasks.length) {
    return (
      <div className="ops-schedule-state" role="status">
        {t.loading}
      </div>
    )
  }

  if (loadError && !tasks.length) {
    return (
      <div className="ops-schedule-state is-error" role="alert">
        <strong>{t.loadError}</strong>
        <span>{loadError}</span>
        <button className="ops-button secondary" type="button" onClick={() => void reloadAll()}>
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <section className="ops-schedule" aria-labelledby="ops-schedule-title">
      <header className="ops-schedule-head">
        <div className="ops-title-block">
          <span className="ops-eyebrow">{t.eyebrow}</span>
          <div>
            <h1 id="ops-schedule-title">{t.title}</h1>
            <span className="ops-project-code">{project?.code ?? 'LAB04-020'}</span>
          </div>
          <p>{t.subtitle}</p>
        </div>
        <div className="ops-head-actions">
          <div className="ops-data-date">
            <span>{t.dateLabel}</span>
            <strong>{formatDate(DATA_DATE, locale)}</strong>
            <small>{t.updated}</small>
          </div>
          <button
            className="ops-button secondary"
            type="button"
            title={t.reloadHint}
            onClick={() => void reloadAll()}
          >
            <span aria-hidden>↻</span> {t.reload}
          </button>
          <button
            className="ops-button primary"
            type="button"
            disabled={!canWrite}
            title={canWrite ? t.add : t.writeUnavailable}
            aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
            onClick={(event) =>
              openFrom(event.currentTarget, () => {
                setDraft(blankDraft())
                setCreating(true)
              })
            }
          >
            <span aria-hidden>＋</span> {t.add}
          </button>
        </div>
      </header>

      {!canWrite && (
        <p className="ops-permission-note" id="ops-schedule-permission">
          {t.noPermission} {t.writeUnavailable}
        </p>
      )}

      <div className="ops-toolbar" aria-label={t.filter}>
        <label className="ops-search">
          <span aria-hidden>⌕</span>
          <span className="sr-only">{t.search}</span>
          <input
            type="search"
            value={query}
            placeholder={t.search}
            title={t.search}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="ops-filter-select">
          <span className="sr-only">{t.filter}</span>
          <select
            value={filter}
            title={t.filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
          >
            <option value="all">{t.all}</option>
            <option value="critical">{t.critical}</option>
            <option value="delayed">{t.delayed}</option>
            <option value="milestone">{t.milestone}</option>
            <option value="active">{t.active}</option>
            <option value="completed">{t.completed}</option>
          </select>
        </label>
        <label className="ops-switch">
          <input
            type="checkbox"
            checked={showBaseline}
            title={t.baseline}
            onChange={(event) => setShowBaseline(event.target.checked)}
          />
          <span aria-hidden />
          {t.baseline}
        </label>
        <div className="ops-scale" role="group" aria-label={t.scaleLabel}>
          <button
            type="button"
            className={scale === 'weeks' ? 'is-active' : ''}
            aria-pressed={scale === 'weeks'}
            title={t.weeks}
            onClick={() => setScale('weeks')}
          >
            {t.weeks}
          </button>
          <button
            type="button"
            className={scale === 'months' ? 'is-active' : ''}
            aria-pressed={scale === 'months'}
            title={t.months}
            onClick={() => setScale('months')}
          >
            {t.months}
          </button>
        </div>
      </div>

      <div className="ops-schedule-kpis">
        <Kpi
          label={t.activities}
          value={String(tasks.length)}
          detail={`${visibleTasks.length} ${t.visible}`}
        />
        <Kpi
          label={t.finished}
          value={String(finishedCount)}
          detail={`${Math.round((finishedCount / Math.max(tasks.length, 1)) * 100)}%`}
          tone="good"
        />
        <Kpi
          label={t.criticalKpi}
          value={String(criticalCount)}
          detail={t.critical}
          tone={criticalCount ? 'warning' : 'good'}
        />
        <Kpi
          label={t.delayedKpi}
          value={String(delayedCount)}
          detail={`${lastPerformance?.spi?.toFixed(2) ?? '—'} SPI`}
          tone={delayedCount ? 'danger' : 'good'}
        />
        <Kpi
          label={t.variance}
          value={programmeVariance > 0 ? `+${programmeVariance}` : String(programmeVariance)}
          detail={programmeVariance ? t.days : t.onTime}
          tone={programmeVariance > 0 ? 'danger' : 'good'}
        />
      </div>

      {notice && (
        <div className="ops-notice" role="status">
          {notice}
        </div>
      )}

      <div className="ops-schedule-workspace">
        <div className="ops-schedule-main">
          <section className="ops-panel ops-grid-panel" aria-labelledby="ops-grid-title">
            <header className="ops-panel-head">
              <div>
                <span className="ops-panel-kicker">WBS / CPM</span>
                <h2 id="ops-grid-title">{t.grid}</h2>
              </div>
              <span className="ops-count">
                {visibleTasks.length} {t.visible}
              </span>
            </header>
            {visibleTasks.length ? (
              <div className="ops-grid-scroll">
                <table className="ops-schedule-table">
                  <thead>
                    <tr>
                      <th>{t.id}</th>
                      <th>{t.activity}</th>
                      <th>{t.owner}</th>
                      <th>{t.start}</th>
                      <th>{t.end}</th>
                      <th>{t.duration}</th>
                      <th>{t.predecessor}</th>
                      <th>{t.progress}</th>
                      <th>{t.condition}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map((task) => {
                      const state = stateOf(task)
                      return (
                        <tr key={task.id} className={selected?.id === task.id ? 'is-selected' : ''}>
                          <td>
                            <code>{task.id}</code>
                          </td>
                          <td>
                            <button
                              className="ops-task-select"
                              type="button"
                              title={`${t.detail}: ${task.name}`}
                              onClick={() => {
                                setActionMenuId(null)
                                setSelectedId(task.id)
                              }}
                            >
                              <strong>{task.name}</strong>
                              <span>
                                {task.critical && (
                                  <em className="ops-chip is-critical">{t.criticalState}</em>
                                )}
                                {task.milestone && (
                                  <em className="ops-chip is-milestone">{t.milestoneState}</em>
                                )}
                              </span>
                            </button>
                          </td>
                          <td>{task.owner}</td>
                          <td>{formatShortDate(task.start, locale)}</td>
                          <td>{formatShortDate(task.end, locale)}</td>
                          <td>{duration(task)} d</td>
                          <td>
                            <code>{task.predecessor ?? '—'}</code>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="ops-progress-cell"
                              disabled={!canWrite}
                              title={canWrite ? t.progressAction : t.writeUnavailable}
                              aria-label={`${t.progressAction}: ${task.name}`}
                              aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
                              onClick={(event) =>
                                openFrom(event.currentTarget, () => {
                                  setProgressDraft(task.progress)
                                  setProgressTask(task)
                                })
                              }
                            >
                              <span>
                                <i style={{ width: `${task.progress}%` }} />
                              </span>
                              <b>{task.progress}%</b>
                            </button>
                          </td>
                          <td>
                            <StateBadge state={state} labels={t} />
                          </td>
                          <td className="ops-action-cell">
                            <div className="ops-row-actions">
                              <button
                                className="ops-icon-action"
                                id={`ops-actions-trigger-${task.id}`}
                                type="button"
                                disabled={!canWrite}
                                aria-label={`${t.actionMenu}: ${task.name}`}
                                aria-expanded={actionMenuId === task.id}
                                aria-controls={`ops-actions-${task.id}`}
                                title={canWrite ? t.actionMenu : t.writeUnavailable}
                                aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
                                onClick={() =>
                                  setActionMenuId((current) =>
                                    current === task.id ? null : task.id,
                                  )
                                }
                              >
                                ⋯
                              </button>
                              {canWrite && actionMenuId === task.id && (
                                <div
                                  className="ops-row-menu"
                                  id={`ops-actions-${task.id}`}
                                  role="menu"
                                  aria-label={`${t.actionMenuLabel}: ${task.name}`}
                                  onKeyDown={(event) => {
                                    if (
                                      !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
                                    )
                                      return
                                    event.preventDefault()
                                    const options = Array.from(
                                      event.currentTarget.querySelectorAll<HTMLButtonElement>(
                                        '[role="menuitem"]',
                                      ),
                                    )
                                    const current = options.indexOf(
                                      document.activeElement as HTMLButtonElement,
                                    )
                                    const next =
                                      event.key === 'Home'
                                        ? 0
                                        : event.key === 'End'
                                          ? options.length - 1
                                          : event.key === 'ArrowDown'
                                            ? (current + 1) % options.length
                                            : (current - 1 + options.length) % options.length
                                    options[next]?.focus()
                                  }}
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(event) => {
                                      const trigger = event.currentTarget
                                        .closest('.ops-row-actions')
                                        ?.querySelector<HTMLElement>('.ops-icon-action')
                                      setActionMenuId(null)
                                      openFrom(trigger ?? event.currentTarget, () => {
                                        setProgressDraft(task.progress)
                                        setProgressTask(task)
                                      })
                                    }}
                                  >
                                    {t.progressAction}
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(event) => {
                                      const trigger = event.currentTarget
                                        .closest('.ops-row-actions')
                                        ?.querySelector<HTMLElement>('.ops-icon-action')
                                      setActionMenuId(null)
                                      openFrom(trigger ?? event.currentTarget, () =>
                                        setEditing(task),
                                      )
                                    }}
                                  >
                                    {t.edit}
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="is-danger"
                                    onClick={(event) => {
                                      const trigger = event.currentTarget
                                        .closest('.ops-row-actions')
                                        ?.querySelector<HTMLElement>('.ops-icon-action')
                                      setActionMenuId(null)
                                      openFrom(trigger ?? event.currentTarget, () =>
                                        setDeleteTask(task),
                                      )
                                    }}
                                  >
                                    {t.deleteAction}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title={t.emptyTitle} copy={t.emptyCopy} />
            )}
          </section>

          <section className="ops-panel ops-gantt-panel" aria-labelledby="ops-gantt-title">
            <header className="ops-panel-head">
              <div>
                <span className="ops-panel-kicker">BASELINE / FORECAST</span>
                <h2 id="ops-gantt-title">{t.gantt}</h2>
              </div>
              <div className="ops-gantt-legend" aria-label={t.legend}>
                <span>
                  <i className="is-baseline" /> {t.plan}
                </span>
                <span>
                  <i className="is-actual" /> {t.actual}
                </span>
                <span>
                  <i className="is-critical" /> {t.criticalState}
                </span>
              </div>
            </header>
            {visibleTasks.length ? (
              <Gantt
                tasks={visibleTasks}
                selectedId={selected?.id ?? null}
                scale={scale}
                showBaseline={showBaseline}
                locale={locale}
                todayLabel={t.today}
                onSelect={setSelectedId}
              />
            ) : (
              <EmptyState title={t.emptyTitle} copy={t.emptyCopy} />
            )}
          </section>
        </div>

        <aside className="ops-schedule-side">
          <section className="ops-panel ops-detail-panel" aria-labelledby="ops-detail-title">
            <header className="ops-panel-head">
              <div>
                <span className="ops-panel-kicker">INSPECTOR</span>
                <h2 id="ops-detail-title">{t.detail}</h2>
              </div>
              {selected && <code>{selected.id}</code>}
            </header>
            {selected ? (
              <TaskInspector
                task={selected}
                tasks={tasks}
                locale={locale}
                labels={t}
                canWrite={canWrite}
                onEdit={(element) => openFrom(element, () => setEditing(selected))}
                onProgress={(element) =>
                  openFrom(element, () => {
                    setProgressDraft(selected.progress)
                    setProgressTask(selected)
                  })
                }
                onDelete={(element) => openFrom(element, () => setDeleteTask(selected))}
              />
            ) : (
              <p className="ops-inspector-empty">{t.selectHint}</p>
            )}
          </section>

          <section className="ops-panel ops-performance" aria-labelledby="ops-performance-title">
            <header className="ops-panel-head">
              <div>
                <span className="ops-panel-kicker">EVM / TREND</span>
                <h2 id="ops-performance-title">{t.plannedVsActual}</h2>
              </div>
              <span className={`ops-spi ${(lastPerformance?.spi ?? 1) < 1 ? 'is-warning' : ''}`}>
                {t.spi} <b>{lastPerformance?.spi?.toFixed(2) ?? '—'}</b>
              </span>
            </header>
            {performance.length ? (
              <MiniPerformance periods={performance} />
            ) : (
              <p>{t.performanceEmpty}</p>
            )}
          </section>
        </aside>
      </div>

      <FormModal
        open={creating && canWrite}
        eyebrow={t.newEyebrow}
        title={t.newTitle}
        submitLabel={t.create}
        wide
        returnFocus={returnFocus}
        onClose={() => {
          setCreating(false)
          setMutationError('')
        }}
        onSubmit={saveNew}
      >
        <TaskFields
          value={draft}
          tasks={tasks}
          labels={t}
          error={mutationError}
          onChange={(changes) => setDraft((current) => ({ ...current, ...changes }))}
        />
      </FormModal>

      <FormModal
        open={Boolean(editing) && canWrite}
        eyebrow={t.editEyebrow}
        title={`${t.editTitle} · ${editing?.id ?? ''}`}
        submitLabel={t.save}
        wide
        returnFocus={returnFocus}
        onClose={() => {
          setEditing(null)
          setMutationError('')
        }}
        onSubmit={saveEdit}
      >
        {editing && (
          <TaskFields
            value={editing}
            tasks={tasks.filter((task) => task.id !== editing.id)}
            labels={t}
            error={mutationError}
            onChange={(changes) =>
              setEditing((current) => (current ? { ...current, ...changes } : null))
            }
          />
        )}
      </FormModal>

      <FormModal
        open={Boolean(progressTask) && canWrite}
        eyebrow={t.progressEyebrow}
        title={`${t.progressTitle} · ${progressTask?.id ?? ''}`}
        submitLabel={t.register}
        returnFocus={returnFocus}
        onClose={() => {
          setProgressTask(null)
          setMutationError('')
        }}
        onSubmit={saveProgress}
      >
        <div className="ops-progress-form">
          <strong>{progressTask?.name}</strong>
          <label>
            <span>{t.progressField}</span>
            <div>
              <input
                data-autofocus
                type="range"
                min="0"
                max="100"
                step="1"
                value={progressDraft}
                onChange={(event) => setProgressDraft(Number(event.target.value))}
              />
              <output>{progressDraft}%</output>
            </div>
          </label>
          <p>{t.progressHelp}</p>
          {mutationError && (
            <p className="ops-form-error" role="alert">
              {mutationError}
            </p>
          )}
        </div>
      </FormModal>

      <DetailModal
        open={Boolean(deleteTask) && canWrite}
        eyebrow={t.deleteEyebrow}
        title={t.deleteTitle}
        returnFocus={returnFocus}
        onClose={() => {
          setDeleteTask(null)
          setMutationError('')
        }}
      >
        {deleteTask && (
          <div className="ops-confirm">
            <p>{t.deleteCopy}</p>
            <strong>
              {deleteTask.id} · {deleteTask.name}
            </strong>
            <p>{t.deleteWarning}</p>
            {mutationError && (
              <p className="ops-form-error" role="alert">
                {mutationError}
              </p>
            )}
            <div>
              <button
                className="ops-button secondary"
                type="button"
                onClick={() => setDeleteTask(null)}
              >
                {t.cancel}
              </button>
              <button className="ops-button danger" type="button" onClick={() => void remove()}>
                {t.confirmDelete}
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </section>
  )
}

type Labels = (typeof copy)['es'] | (typeof copy)['en']

function Kpi({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: string
  detail: string
  tone?: 'neutral' | 'good' | 'warning' | 'danger'
}) {
  return (
    <article className={`ops-kpi is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function StateBadge({ state, labels }: { state: ReturnType<typeof stateOf>; labels: Labels }) {
  const label =
    state === 'completed'
      ? labels.completedState
      : state === 'delayed'
        ? labels.delayedState
        : state === 'upcoming'
          ? labels.upcomingState
          : labels.activeState
  return (
    <span className={`ops-state is-${state}`}>
      <i aria-hidden />
      {label}
    </span>
  )
}

function EmptyState({ title, copy: description }: { title: string; copy: string }) {
  return (
    <div className="ops-empty">
      <span aria-hidden>⌁</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

function TaskFields({
  value,
  tasks,
  labels,
  error,
  onChange,
}: {
  value: ScheduleTaskInput
  tasks: readonly ScheduleTask[]
  labels: Labels
  error: string
  onChange(changes: Partial<ScheduleTaskInput>): void
}) {
  return (
    <div className="ops-task-fields">
      <label className="is-wide">
        <span>{labels.nameField}</span>
        <input
          autoFocus
          data-autofocus
          required
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>
      <label>
        <span>{labels.ownerField}</span>
        <input
          required
          value={value.owner}
          onChange={(event) => onChange({ owner: event.target.value })}
        />
      </label>
      <label>
        <span>{labels.progressField}</span>
        <input
          type="number"
          min="0"
          max="100"
          value={value.progress}
          onChange={(event) => onChange({ progress: Number(event.target.value) })}
        />
      </label>
      <label>
        <span>{labels.startField}</span>
        <input
          required
          type="date"
          value={value.start}
          onChange={(event) => onChange({ start: event.target.value })}
        />
      </label>
      <label>
        <span>{labels.endField}</span>
        <input
          required
          type="date"
          value={value.end}
          onChange={(event) => onChange({ end: event.target.value })}
        />
      </label>
      <label className="is-wide">
        <span>{labels.predecessorField}</span>
        <select
          value={value.predecessor ?? ''}
          onChange={(event) => onChange({ predecessor: event.target.value || undefined })}
        >
          <option value="">{labels.noDependency}</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.id} · {task.name}
            </option>
          ))}
        </select>
      </label>
      <label className="is-wide">
        <span>{labels.noteField}</span>
        <textarea
          rows={3}
          value={value.notes ?? ''}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
      <label className="ops-check">
        <input
          type="checkbox"
          checked={value.critical}
          onChange={(event) => onChange({ critical: event.target.checked })}
        />
        <span>{labels.criticalField}</span>
      </label>
      <label className="ops-check">
        <input
          type="checkbox"
          checked={value.milestone}
          onChange={(event) => onChange({ milestone: event.target.checked })}
        />
        <span>{labels.milestoneField}</span>
      </label>
      {error && (
        <p className="ops-form-error is-wide" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function TaskInspector({
  task,
  tasks,
  locale,
  labels,
  canWrite,
  onEdit,
  onProgress,
  onDelete,
}: {
  task: ScheduleTask
  tasks: readonly ScheduleTask[]
  locale: string
  labels: Labels
  canWrite: boolean
  onEdit(element: HTMLElement): void
  onProgress(element: HTMLElement): void
  onDelete(element: HTMLElement): void
}) {
  const predecessor = tasks.find((candidate) => candidate.id === task.predecessor)
  const successors = tasks.filter((candidate) => candidate.predecessor === task.id)
  const taskVariance = finishVariance(task)
  const nextStart = successors.map((candidate) => candidate.start).sort()[0]
  const freeFloat = nextStart ? Math.max(0, daysBetween(task.end, nextStart) - 1) : null
  return (
    <div className="ops-inspector">
      <div className="ops-inspector-title">
        <StateBadge state={stateOf(task)} labels={labels} />
        <h3>{task.name}</h3>
        <p>{task.owner}</p>
      </div>
      <div className="ops-inspector-progress">
        <div>
          <span>{labels.progress}</span>
          <strong>{task.progress}%</strong>
        </div>
        <span>
          <i style={{ width: `${task.progress}%` }} />
        </span>
      </div>
      <dl>
        <div>
          <dt>{labels.forecast}</dt>
          <dd>
            {formatShortDate(task.start, locale)} — {formatShortDate(task.end, locale)}
          </dd>
        </div>
        <div>
          <dt>{labels.baselineStart}</dt>
          <dd>{task.baselineStart ? formatShortDate(task.baselineStart, locale) : '—'}</dd>
        </div>
        <div>
          <dt>{labels.baselineEnd}</dt>
          <dd>{task.baselineEnd ? formatShortDate(task.baselineEnd, locale) : '—'}</dd>
        </div>
        <div>
          <dt>{labels.finishVariance}</dt>
          <dd className={(taskVariance ?? 0) > 0 ? 'is-danger' : ''}>
            {taskVariance === null ? '—' : `${taskVariance > 0 ? '+' : ''}${taskVariance} d`}
          </dd>
        </div>
        <div>
          <dt>{labels.predecessor}</dt>
          <dd>{predecessor ? `${predecessor.id} · ${predecessor.name}` : labels.noDependency}</dd>
        </div>
        <div>
          <dt>{labels.float}</dt>
          <dd>{freeFloat === null ? '—' : `${freeFloat} d`}</dd>
        </div>
      </dl>
      <div className="ops-inspector-notes">
        <span>{labels.notes}</span>
        <p>{task.notes || labels.none}</p>
      </div>
      <div className="ops-inspector-actions">
        <button
          className="ops-button primary"
          type="button"
          disabled={!canWrite}
          title={canWrite ? labels.progressAction : labels.writeUnavailable}
          aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
          onClick={(event) => onProgress(event.currentTarget)}
        >
          {labels.progressAction}
        </button>
        <button
          className="ops-button secondary"
          type="button"
          disabled={!canWrite}
          title={canWrite ? labels.edit : labels.writeUnavailable}
          aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
          onClick={(event) => onEdit(event.currentTarget)}
        >
          {labels.edit}
        </button>
        <button
          className="ops-button danger-ghost"
          type="button"
          disabled={!canWrite}
          title={canWrite ? labels.deleteAction : labels.writeUnavailable}
          aria-describedby={!canWrite ? 'ops-schedule-permission' : undefined}
          onClick={(event) => onDelete(event.currentTarget)}
        >
          {labels.deleteAction}
        </button>
      </div>
    </div>
  )
}

function Gantt({
  tasks,
  selectedId,
  scale,
  showBaseline,
  locale,
  todayLabel,
  onSelect,
}: {
  tasks: readonly ScheduleTask[]
  selectedId: string | null
  scale: Scale
  showBaseline: boolean
  locale: string
  todayLabel: string
  onSelect(id: string): void
}) {
  const rowIndex = new Map(tasks.map((task, index) => [task.id, index]))
  const links = tasks.flatMap((task) =>
    task.predecessor && rowIndex.has(task.predecessor)
      ? [{ from: tasks[rowIndex.get(task.predecessor)!], to: task }]
      : [],
  )
  const marks = scale === 'months' ? monthMarks : weekMarks
  return (
    <div className="ops-gantt-scroll">
      <div className={`ops-gantt is-${scale}`}>
        <div className="ops-gantt-axis">
          {marks.map((mark) => (
            <span key={mark.key} style={{ left: `${mark.left}%`, width: `${mark.width}%` }}>
              {scale === 'months'
                ? new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
                    .format(mark.date)
                    .replace('.', '')
                : mark.key % 2 === 0
                  ? `S${mark.key + 1}`
                  : ''}
            </span>
          ))}
        </div>
        <div className="ops-gantt-canvas" style={{ height: tasks.length * ROW_HEIGHT }}>
          {marks.slice(1).map((mark) => (
            <i key={mark.key} className="ops-gantt-gridline" style={{ left: `${mark.left}%` }} />
          ))}
          <svg
            className="ops-gantt-links"
            viewBox={`0 0 1000 ${tasks.length * ROW_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {links.map(({ from, to }) => {
              const x1 = (datePosition(from.start) + dateWidth(from.start, from.end)) * 10
              const y1 = rowIndex.get(from.id)! * ROW_HEIGHT + ROW_HEIGHT / 2
              const x2 = datePosition(to.start) * 10
              const y2 = rowIndex.get(to.id)! * ROW_HEIGHT + ROW_HEIGHT / 2
              const elbow = Math.max(x1 + 8, x2 - 12)
              return (
                <path key={`${from.id}-${to.id}`} d={`M ${x1} ${y1} H ${elbow} V ${y2} H ${x2}`} />
              )
            })}
          </svg>
          {tasks.map((task, index) => {
            const left = datePosition(task.start)
            const width = dateWidth(task.start, task.end)
            const baselineLeft = task.baselineStart ? datePosition(task.baselineStart) : 0
            const baselineWidth = task.baselineStart
              ? dateWidth(task.baselineStart, task.baselineEnd ?? task.baselineStart)
              : 0
            return (
              <div
                className={`ops-gantt-row ${selectedId === task.id ? 'is-selected' : ''}`}
                key={task.id}
                style={{ top: index * ROW_HEIGHT }}
              >
                {showBaseline && task.baselineStart && (
                  <i
                    className="ops-baseline-bar"
                    style={{ left: `${baselineLeft}%`, width: `${baselineWidth}%` }}
                  />
                )}
                <button
                  type="button"
                  className={`ops-gantt-bar ${task.critical ? 'is-critical' : ''} ${task.milestone ? 'is-milestone' : ''} ${task.progress >= 100 ? 'is-complete' : ''}`}
                  style={{
                    left: `${left}%`,
                    width: `${task.milestone ? 12 : Math.max(width, 1.5)}%`,
                  }}
                  aria-label={`${task.id} ${task.name}, ${task.progress}%`}
                  title={`${task.id} · ${task.name} · ${task.progress}%`}
                  onClick={() => onSelect(task.id)}
                >
                  <i style={{ width: `${task.progress}%` }} />
                  <span>{width > 8 && !task.milestone ? `${task.progress}%` : ''}</span>
                </button>
              </div>
            )
          })}
          <div className="ops-data-line" style={{ left: `${datePosition(DATA_DATE)}%` }}>
            <span>{todayLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniPerformance({ periods }: { periods: readonly PerformancePeriod[] }) {
  const point = (value: number, index: number) =>
    `${periods.length === 1 ? 50 : (index / (periods.length - 1)) * 100},${100 - value}`
  const planned = periods.map((period, index) => point(period.planned, index)).join(' ')
  const actual = periods.map((period, index) => point(period.actual, index)).join(' ')
  return (
    <div className="ops-mini-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <line x1="0" x2="100" y1="75" y2="75" />
        <line x1="0" x2="100" y1="50" y2="50" />
        <line x1="0" x2="100" y1="25" y2="25" />
        <polyline className="is-plan" points={planned} />
        <polyline className="is-actual" points={actual} />
      </svg>
      <div>
        {periods.map((period) => (
          <span key={period.period}>{period.period}</span>
        ))}
      </div>
    </div>
  )
}

const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
const formatShortDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
    .replace('.', '')
