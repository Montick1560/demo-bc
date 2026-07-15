import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import type { PerformancePeriod, ScheduleTask, ScheduleTaskInput } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { formatCurrency } from '../../shared/format'
import { FormModal } from '../../shared/FormModal'
import { useServiceResource } from '../../shared/useServiceResource'
import { useCapability, useServices } from '../../shared/useServices'
import { Card, PageHead, Status } from '../../shared/ui'

type ScheduleFilter = 'all' | 'critical' | 'milestone' | 'delayed' | 'completed'
const presentationCutoff = '2026-09-29'
const timelineStart = Date.parse('2026-01-01T00:00:00Z')
const timelineDay = 86_400_000
const timelineDays = 273
const timelineMonths = 9
const blankTask: ScheduleTaskInput = {
  name: '',
  owner: 'Valeria Soto',
  start: presentationCutoff,
  end: presentationCutoff,
  progress: 0,
  critical: false,
  milestone: false,
}

const condition = (task: ScheduleTask, cutoff: string) => {
  if (task.progress === 100) return 'completed'
  if (task.end < cutoff) return 'delayed'
  if (task.start > cutoff) return 'upcoming'
  return 'active'
}

const timelinePosition = (start: string, end: string) => ({
  left: Math.min(
    98,
    Math.max(
      0,
      ((Date.parse(`${start}T00:00:00Z`) - timelineStart) / timelineDay / timelineDays) * 100,
    ),
  ),
  width: Math.min(
    100,
    Math.max(
      1,
      (((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / timelineDay + 1) /
        timelineDays) *
        100,
    ),
  ),
})

const baselineVariance = (task: ScheduleTask) => {
  if (!task.baselineEnd) return null
  return Math.round(
    (Date.parse(`${task.end}T00:00:00Z`) - Date.parse(`${task.baselineEnd}T00:00:00Z`)) /
      timelineDay,
  )
}

const durationDays = (task: ScheduleTask) =>
  Math.round(
    (Date.parse(`${task.end}T00:00:00Z`) - Date.parse(`${task.start}T00:00:00Z`)) / timelineDay,
  ) + 1

// Holgura libre estilo CPM: días entre el fin de la actividad y el arranque más
// temprano de sus sucesoras. Los traslapes por fast-tracking se reportan como 0.
const freeFloat = (task: ScheduleTask, all: readonly ScheduleTask[]) => {
  const successors = all.filter((candidate) => candidate.predecessor === task.id)
  if (!successors.length) return null
  const gap = Math.min(
    ...successors.map(
      (successor) =>
        (Date.parse(`${successor.start}T00:00:00Z`) - Date.parse(`${task.end}T00:00:00Z`)) /
        timelineDay,
    ),
  )
  return Math.max(0, Math.round(gap) - 1)
}

// Alto de fila del lienzo Gantt; los estilos usan el mismo valor.
const GANTT_ROW = 44
const chartX = (index: number, count: number) => 34 + (index * 672) / Math.max(count - 1, 1)

function SCurveChart({
  periods,
  locale,
}: {
  periods: readonly PerformancePeriod[]
  locale?: string
}) {
  const y = (value: number) => 16 + ((100 - value) / 100) * 180
  const points = (key: 'planned' | 'actual') =>
    periods.map((period, index) => `${chartX(index, periods.length)},${y(period[key])}`).join(' ')
  const last = periods[periods.length - 1]
  return (
    <svg className="schedule-chart" viewBox="0 0 720 250" role="img">
      {[0, 25, 50, 75, 100].map((line) => (
        <g key={line}>
          <line x1="34" x2="706" y1={y(line)} y2={y(line)} stroke="var(--line)" strokeWidth="1" />
          <text x="28" y={y(line) + 4} textAnchor="end" className="chart-tick">
            {line}
          </text>
        </g>
      ))}
      <polygon
        points={`${points('actual')} ${chartX(periods.length - 1, periods.length)},${y(0)} ${chartX(0, periods.length)},${y(0)}`}
        fill="var(--cobalt)"
        opacity="0.08"
      />
      <polyline
        points={points('planned')}
        fill="none"
        stroke="#8c94a7"
        strokeWidth="2.5"
        strokeDasharray="7 6"
      />
      <polyline points={points('actual')} fill="none" stroke="var(--cobalt)" strokeWidth="3.5" />
      {last && (
        <g>
          <circle
            cx={chartX(periods.length - 1, periods.length)}
            cy={y(last.actual)}
            r="6"
            fill="var(--cobalt)"
          />
          <text
            x={chartX(periods.length - 1, periods.length) - 14}
            y={y(last.actual) + 6}
            textAnchor="end"
            className="chart-label"
          >
            {last.actual}%
          </text>
        </g>
      )}
      {periods.map((period, index) => (
        <text
          key={period.period}
          x={chartX(index, periods.length)}
          y="244"
          textAnchor="middle"
          className="chart-tick"
        >
          {monthLabel(index, locale)}
        </text>
      ))}
    </svg>
  )
}

function EvmTrendChart({
  periods,
  locale,
}: {
  periods: readonly PerformancePeriod[]
  locale?: string
}) {
  const y = (value: number) => 16 + ((1.1 - value) / 0.26) * 180
  const points = (key: 'cpi' | 'spi') =>
    periods.map((period, index) => `${chartX(index, periods.length)},${y(period[key])}`).join(' ')
  const last = periods[periods.length - 1]
  return (
    <svg className="schedule-chart" viewBox="0 0 720 250" role="img">
      {[0.9, 1.0, 1.1].map((line) => (
        <g key={line}>
          <line
            x1="34"
            x2="706"
            y1={y(line)}
            y2={y(line)}
            stroke={line === 1 ? '#8c94a7' : 'var(--line)'}
            strokeWidth="1"
            strokeDasharray={line === 1 ? '5 5' : undefined}
          />
          <text x="28" y={y(line) + 4} textAnchor="end" className="chart-tick">
            {line.toFixed(1)}
          </text>
        </g>
      ))}
      <polyline points={points('spi')} fill="none" stroke="var(--acid)" strokeWidth="3" />
      <polyline points={points('cpi')} fill="none" stroke="var(--cobalt)" strokeWidth="3.5" />
      {last && (
        <g>
          <circle
            cx={chartX(periods.length - 1, periods.length)}
            cy={y(last.cpi)}
            r="6"
            fill="var(--cobalt)"
          />
          <circle
            cx={chartX(periods.length - 1, periods.length)}
            cy={y(last.spi)}
            r="6"
            fill="var(--acid)"
          />
        </g>
      )}
      {periods.map((period, index) => (
        <text
          key={period.period}
          x={chartX(index, periods.length)}
          y="244"
          textAnchor="middle"
          className="chart-tick"
        >
          {monthLabel(index, locale)}
        </text>
      ))}
    </svg>
  )
}

const monthLabel = (index: number, locale?: string) =>
  new Intl.DateTimeFormat(locale ?? 'es', { month: 'short', timeZone: 'UTC' })
    .format(Date.UTC(2026, index, 1))
    .replace('.', '')
    .toUpperCase()
    .slice(0, 3)

const monthMarks = Array.from({ length: timelineMonths }, (_, index) => {
  const start = Date.UTC(2026, index, 1)
  const end = Date.UTC(2026, index + 1, 1)
  return {
    index,
    left: ((start - timelineStart) / timelineDay / timelineDays) * 100,
    width: ((end - start) / timelineDay / timelineDays) * 100,
  }
})

const quarterMarks = Array.from({ length: 3 }, (_, index) => {
  const start = Date.UTC(2026, index * 3, 1)
  const end = Date.UTC(2026, index * 3 + 3, 1)
  return {
    index,
    left: ((start - timelineStart) / timelineDay / timelineDays) * 100,
    width: ((end - start) / timelineDay / timelineDays) * 100,
  }
})

export function ScheduleView({ onAdd }: { onAdd?: () => void }) {
  const { t, i18n } = useTranslation()
  const services = useServices()
  const canEditSchedule = useCapability('costs:write')
  const canUpdateField = useCapability('field:update')
  const canUpdateProgress = canEditSchedule || canUpdateField
  const {
    data: project,
    loading,
    error,
  } = useServiceResource(() => services.project.getSummary(), [services])
  const { data: tasks, reload } = useServiceResource(
    () => services.project.listSchedule(),
    [services],
  )
  const { data: budget } = useServiceResource(() => services.project.listBudget(), [services])
  const { data: performance } = useServiceResource(
    () => services.project.listPerformance(),
    [services],
  )
  const [filter, setFilter] = useState<ScheduleFilter>('all')
  const [query, setQuery] = useState('')
  const [showBaseline, setShowBaseline] = useState(true)
  const [scale, setScale] = useState<'months' | 'quarters'>('months')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<ScheduleTaskInput>(blankTask)
  const [editing, setEditing] = useState<ScheduleTask | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<ScheduleTask | null>(null)
  const [modalTrigger, setModalTrigger] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState('')
  const cutoff = project?.status === 'completed' ? presentationCutoff : '2026-07-12'
  const dataDatePct =
    ((Date.parse(`${cutoff}T00:00:00Z`) - timelineStart) / timelineDay / timelineDays) * 100

  const visibleTasks = useMemo(
    () =>
      (tasks ?? [])
        .filter((task) => {
          const matchesQuery = `${task.id} ${task.name} ${task.owner}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
          const matchesFilter =
            filter === 'all' ||
            (filter === 'critical' && task.critical) ||
            (filter === 'milestone' && task.milestone) ||
            (filter === 'delayed' && condition(task, cutoff) === 'delayed') ||
            (filter === 'completed' && task.progress === 100)
          return matchesQuery && matchesFilter
        })
        .slice()
        .sort((a, b) =>
          a.start === b.start ? a.id.localeCompare(b.id) : a.start < b.start ? -1 : 1,
        ),
    [cutoff, filter, query, tasks],
  )

  const marks = scale === 'months' ? monthMarks : quarterMarks
  const markLabel = (index: number) =>
    scale === 'months'
      ? monthLabel(index, i18n.resolvedLanguage)
      : `${t('schedule.quarterShort')}${index + 1}`

  const rowOf = new Map(visibleTasks.map((task, index) => [task.id, index]))
  const links = visibleTasks.flatMap((task) => {
    if (!task.predecessor || !rowOf.has(task.predecessor)) return []
    const from = visibleTasks[rowOf.get(task.predecessor)!]
    return [{ id: `${from.id}-${task.id}`, from, to: task }]
  })
  const linkPath = ({ from, to }: (typeof links)[number]) => {
    const x1 = (from.left + from.width) * 10
    const y1 = rowOf.get(from.id)! * GANTT_ROW + GANTT_ROW / 2
    const x2 = to.left * 10
    const y2 = rowOf.get(to.id)! * GANTT_ROW + GANTT_ROW / 2
    if (x2 >= x1 + 24) {
      const xm = x1 + 12
      return `M ${x1} ${y1} L ${xm} ${y1} L ${xm} ${y2} L ${x2} ${y2}`
    }
    const yMid = Math.max(y1, y2) - GANTT_ROW / 2
    const xBack = Math.max(2, x2 - 14)
    return `M ${x1} ${y1} L ${x1 + 12} ${y1} L ${x1 + 12} ${yMid} L ${xBack} ${yMid} L ${xBack} ${y2} L ${x2} ${y2}`
  }

  const workload = [...(tasks ?? [])]
    .filter((task) => !task.milestone)
    .reduce((map, task) => {
      const entry = map.get(task.owner) ?? { days: 0, count: 0 }
      map.set(task.owner, { days: entry.days + durationDays(task), count: entry.count + 1 })
      return map
    }, new Map<string, { days: number; count: number }>())
  const workloadRows = [...workload]
    .map(([owner, value]) => ({ owner, ...value }))
    .sort((a, b) => b.days - a.days)
  const workloadMax = Math.max(...workloadRows.map((row) => row.days), 1)

  if (!project) return <AsyncState loading={loading} error={error?.message} />

  const milestones = tasks?.filter((task) => task.milestone) ?? []
  const finishVariance = (() => {
    if (!tasks?.length) return 0
    const latest = (key: 'end' | 'baselineEnd') =>
      tasks.reduce((max, task) => {
        const value = key === 'end' ? task.end : (task.baselineEnd ?? task.end)
        return value > max ? value : max
      }, '')
    return Math.round(
      (Date.parse(`${latest('end')}T00:00:00Z`) -
        Date.parse(`${latest('baselineEnd')}T00:00:00Z`)) /
        timelineDay,
    )
  })()
  const stats = {
    total: tasks?.length ?? 0,
    completed: tasks?.filter((task) => task.progress === 100).length ?? 0,
    critical: tasks?.filter((task) => task.critical && task.progress < 100).length ?? 0,
    milestonesDone: milestones.filter((task) => task.progress === 100).length,
    milestonesTotal: milestones.length,
  }

  const saveNewTask = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await services.project.addScheduleTask(draft)
    if (!result.ok) return setMessage(result.error.message)
    setDraft(blankTask)
    setCreating(false)
    setMessage(t('schedule.added'))
    await reload()
  }

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    const result = await services.project.updateScheduleTask(editing.id, editing)
    if (!result.ok) return setMessage(result.error.message)
    setEditing(null)
    setMessage(t('schedule.saved'))
    await reload()
  }

  const advance = async (task: ScheduleTask, amount: number) => {
    await services.project.updateScheduleProgress(task.id, task.progress + amount)
    await reload()
  }

  const remove = async (task: ScheduleTask) => {
    const result = await services.project.deleteScheduleTask(task.id)
    setMessage(result.ok ? t('schedule.deleted') : result.error.message)
    if (result.ok) {
      setDeleteCandidate(null)
      await reload()
    }
  }

  const exportSchedule = () => {
    const rows = [
      [
        'ID',
        t('schedule.activity'),
        t('schedule.owner'),
        t('schedule.startField'),
        t('schedule.endField'),
        t('schedule.duration'),
        `${t('schedule.progress')} %`,
        t('schedule.baselineVar'),
        t('schedule.floatCol'),
        t('schedule.dependency'),
      ],
      ...visibleTasks.map((task) => [
        task.id,
        task.name,
        task.owner,
        task.start,
        task.end,
        `${durationDays(task)} d`,
        String(task.progress),
        `${baselineVariance(task) ?? 0} d`,
        freeFloat(task, tasks ?? []) === null ? '—' : `${freeFloat(task, tasks ?? [])} d`,
        task.predecessor ?? '—',
      ]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'bcysa-lab04-cronograma.csv'
    link.click()
    URL.revokeObjectURL(url)
    setMessage(t('schedule.exported'))
  }

  const summaryCells: [string, string | number, string][] = [
    [t('schedule.activities'), stats.total, t('schedule.activitiesCopy')],
    [
      t('schedule.completedCell'),
      stats.completed,
      t('schedule.completedCellCopy', {
        percent: Math.round((stats.completed / Math.max(stats.total, 1)) * 100),
      }),
    ],
    [
      t('schedule.milestonesCell'),
      `${stats.milestonesDone}/${Math.max(stats.milestonesTotal, 1)}`,
      t('schedule.milestonesCellCopy'),
    ],
    [
      t('schedule.baselineCell'),
      `${finishVariance >= 0 ? '+' : ''}${finishVariance} d`,
      t('schedule.baselineCellCopy'),
    ],
    [t('schedule.criticalCell'), stats.critical, t('schedule.criticalCellCopy')],
    [t('schedule.deliveryCell'), '29 SEP', t('schedule.deliveryCellCopy')],
  ]

  return (
    <>
      <PageHead
        page="cronograma"
        eyebrow="ETAPA 03 / TIEMPO + COSTO"
        title="Cronograma y presupuesto"
        copy="Avance físico, hitos, dependencias y control de la línea base del caso práctico."
        onAdd={onAdd}
      />
      <div className="schedule-stack">
        <section className="schedule-summary" aria-label={t('schedule.summaryLabel')}>
          {summaryCells.map(([label, value, copy]) => (
            <div key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <small>{copy}</small>
            </div>
          ))}
        </section>

        <Card
          title={t('schedule.interactive')}
          action={
            <div className="filters">
              {(['months', 'quarters'] as const).map((option) => (
                <button
                  key={option}
                  className={scale === option ? 'active' : ''}
                  aria-pressed={scale === option}
                  onClick={() => setScale(option)}
                >
                  {t(`schedule.scale_${option}`)}
                </button>
              ))}
            </div>
          }
        >
          <div className="schedule-toolbar">
            <label className="schedule-search">
              <span>{t('schedule.search')}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('schedule.searchPlaceholder')}
              />
            </label>
            <label className="baseline-toggle">
              <input
                type="checkbox"
                checked={showBaseline}
                onChange={(event) => setShowBaseline(event.target.checked)}
              />
              {t('schedule.compareBaseline')}
            </label>
            <button className="secondary" onClick={exportSchedule}>
              {t('schedule.export')}
            </button>
            {canEditSchedule && (
              <button
                className="primary"
                onClick={(event) => {
                  setModalTrigger(event.currentTarget)
                  setDraft({ ...blankTask, start: cutoff, end: cutoff })
                  setCreating(true)
                }}
              >
                + {t('schedule.newTitle')}
              </button>
            )}
          </div>
          <div className="schedule-filters" aria-label={t('schedule.filterLabel')}>
            {(
              [
                ['all', t('schedule.filterAll')],
                ['critical', t('schedule.filterCritical')],
                ['milestone', t('schedule.filterMilestones')],
                ['delayed', t('schedule.filterDelayed')],
                ['completed', t('schedule.filterCompleted')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={filter === id ? 'active' : ''}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="gantt-legend">
            <span>
              <i className="legend-current" /> {t('schedule.legendCurrent')}
            </span>
            {showBaseline && (
              <span>
                <i className="legend-baseline" /> {t('schedule.legendBaseline')}
              </span>
            )}
            <span>
              <i className="legend-critical" /> {t('schedule.legendCritical')}
            </span>
            <span>
              <i className="legend-milestone" /> {t('schedule.legendMilestone')}
            </span>
          </div>
          {visibleTasks.length ? (
            <div className="gantt-board">
              <div className="gantt-header">
                <span>{t('schedule.activity')}</span>
                <div className="gantt-months">
                  {marks.map((mark) => (
                    <b key={mark.index} style={{ width: `${mark.width}%` }}>
                      {markLabel(mark.index)}
                    </b>
                  ))}
                </div>
              </div>
              <div className="gantt-body">
                <div className="gantt-names">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={hoverId === task.id ? 'is-hover' : ''}
                      onMouseEnter={() => setHoverId(task.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <b>
                        {task.milestone && (
                          <em className="milestone-flag" aria-hidden>
                            ◆{' '}
                          </em>
                        )}
                        {task.name}
                      </b>
                      <small>
                        {task.owner} · {durationDays(task)} d
                      </small>
                    </div>
                  ))}
                </div>
                <div className="gantt-timeline" style={{ height: visibleTasks.length * GANTT_ROW }}>
                  {marks.slice(1).map((mark) => (
                    <em key={mark.index} className="gantt-tick" style={{ left: `${mark.left}%` }} />
                  ))}
                  <svg
                    className="gantt-links"
                    viewBox={`0 0 1000 ${visibleTasks.length * GANTT_ROW}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {links.map((link) => (
                      <path key={link.id} d={linkPath(link)} />
                    ))}
                  </svg>
                  {links.map((link) => (
                    <em
                      key={`arrow-${link.id}`}
                      className="gantt-arrow"
                      style={{
                        left: `${link.to.left}%`,
                        top: rowOf.get(link.to.id)! * GANTT_ROW + GANTT_ROW / 2,
                      }}
                    />
                  ))}
                  {visibleTasks.map((task, row) => {
                    const variance = baselineVariance(task)
                    const baseline =
                      showBaseline && task.baselineStart
                        ? timelinePosition(
                            task.baselineStart,
                            task.baselineEnd ?? task.baselineStart,
                          )
                        : null
                    return (
                      <div key={task.id} style={{ display: 'contents' }}>
                        {baseline && (
                          <i
                            className="baseline-task"
                            style={{
                              left: `${baseline.left}%`,
                              width: `${Math.max(baseline.width, 3)}%`,
                              top: row * GANTT_ROW + 30,
                            }}
                          />
                        )}
                        <i
                          className={`${
                            task.milestone
                              ? 'milestone-task'
                              : task.critical
                                ? 'critical-task'
                                : task.progress === 100
                                  ? 'done'
                                  : 'active'
                          }${hoverId === task.id ? ' is-hover' : ''}`}
                          style={{
                            left: `${task.left}%`,
                            width: `${Math.max(task.width, 3)}%`,
                            top: row * GANTT_ROW + (task.milestone ? 15 : 11),
                          }}
                          onMouseEnter={() => setHoverId(task.id)}
                          onMouseLeave={() => setHoverId(null)}
                          title={`${task.start} — ${task.end}${
                            task.baselineStart
                              ? ` · ${t('schedule.legendBaseline')}: ${task.baselineStart} — ${task.baselineEnd}`
                              : ''
                          }${variance === null ? '' : ` · ${variance >= 0 ? '+' : ''}${variance} d`}`}
                        >
                          {!task.milestone && task.progress > 0 && `${task.progress}%`}
                        </i>
                      </div>
                    )
                  })}
                  <div className="gantt-datadate" style={{ left: `${dataDatePct}%` }}>
                    <span>{t('schedule.dataDate')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="schedule-empty">{t('schedule.empty')}</p>
          )}
        </Card>

        {message && (
          <div className="schedule-message" role="status">
            {message}
          </div>
        )}

        {performance && (
          <div className="two-cols schedule-analytics">
            <Card title={t('schedule.sCurve')} className="chart-card">
              <SCurveChart periods={performance} locale={i18n.resolvedLanguage} />
              <footer className="chart-legend">
                <span>
                  <i className="swatch planned" /> {t('schedule.planned')}
                </span>
                <span>
                  <i className="swatch actual" /> {t('schedule.actual')}
                </span>
                <b>{t('schedule.sCurveResult')}</b>
              </footer>
            </Card>
            <Card title={t('schedule.evmTrend')} className="chart-card">
              <EvmTrendChart periods={performance} locale={i18n.resolvedLanguage} />
              <footer className="chart-legend">
                <span>
                  <i className="swatch actual" /> CPI
                </span>
                <span>
                  <i className="swatch milestone" /> SPI
                </span>
                <b>{t('schedule.evmTrendResult')}</b>
              </footer>
            </Card>
          </div>
        )}

        <Card title={t('schedule.detail')}>
          <div className="schedule-table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('schedule.activity')}</th>
                  <th>{t('schedule.owner')}</th>
                  <th>{t('schedule.dependency')}</th>
                  <th>{t('schedule.dates')}</th>
                  <th>{t('schedule.duration')}</th>
                  <th>{t('schedule.progress')}</th>
                  <th>{t('schedule.baselineVar')}</th>
                  <th>{t('schedule.floatCol')}</th>
                  <th>{t('schedule.condition')}</th>
                  <th>{t('schedule.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => {
                  const state = condition(task, cutoff)
                  const variance = baselineVariance(task)
                  const taskFloat = freeFloat(task, tasks ?? [])
                  return (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>
                        <b>
                          {task.milestone && (
                            <em className="milestone-flag" aria-hidden>
                              ◆{' '}
                            </em>
                          )}
                          {task.name}
                        </b>
                        {task.notes && <small>{task.notes}</small>}
                      </td>
                      <td>{task.owner}</td>
                      <td>{task.predecessor ?? '—'}</td>
                      <td>
                        <span>{task.start}</span>
                        <small>
                          {t('schedule.to')} {task.end}
                        </small>
                      </td>
                      <td>{durationDays(task)} d</td>
                      <td>
                        <div className="task-progress">
                          <span>{task.progress}%</span>
                          <div className="progress">
                            <i style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        {variance === null ? (
                          '—'
                        ) : (
                          <Status tone={variance > 0 ? 'amber' : 'green'}>
                            {variance >= 0 ? '+' : ''}
                            {variance} d
                          </Status>
                        )}
                      </td>
                      <td>
                        {taskFloat === null ? (
                          '—'
                        ) : (
                          <Status tone={taskFloat === 0 ? 'gray' : 'green'}>{taskFloat} d</Status>
                        )}
                      </td>
                      <td>
                        <Status
                          tone={
                            state === 'delayed' ? 'red' : state === 'upcoming' ? 'amber' : 'green'
                          }
                        >
                          {t(`schedule.state_${state}`)}
                        </Status>
                      </td>
                      <td>
                        <div className="schedule-actions">
                          <button
                            className="secondary"
                            disabled={task.progress >= 100 || !canUpdateProgress}
                            onClick={() => void advance(task, 5)}
                          >
                            +5%
                          </button>
                          {canEditSchedule && (
                            <>
                              <button
                                className="secondary"
                                onClick={(event) => {
                                  setModalTrigger(event.currentTarget)
                                  setEditing(task)
                                }}
                              >
                                {t('schedule.edit')}
                              </button>
                              <button
                                className="icon-danger"
                                aria-label={`${t('schedule.deleteLabel')} ${task.name}`}
                                onClick={(event) => {
                                  setModalTrigger(event.currentTarget)
                                  setDeleteCandidate(task)
                                }}
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="schedule-finance">
          <Card title={t('schedule.evmTitle')}>
            <div className="evm">
              <div>
                <span>{t('schedule.pv')}</span>
                <b>{formatCurrency(project.budget, i18n.resolvedLanguage)}</b>
              </div>
              <div>
                <span>{t('schedule.ev')}</span>
                <b>{formatCurrency(project.budget, i18n.resolvedLanguage)}</b>
              </div>
              <div>
                <span>{t('schedule.ac')}</span>
                <b>{formatCurrency(project.spent, i18n.resolvedLanguage)}</b>
              </div>
              <div>
                <span>{t('schedule.vac')}</span>
                <b>{formatCurrency(project.budget - project.spent, i18n.resolvedLanguage)}</b>
              </div>
            </div>
          </Card>
          <Card title={t('schedule.budgetTitle')}>
            <table>
              <thead>
                <tr>
                  <th>{t('schedule.item')}</th>
                  <th>{t('schedule.plannedCol')}</th>
                  <th>{t('schedule.actualCol')}</th>
                  <th>{t('schedule.varianceCol')}</th>
                </tr>
              </thead>
              <tbody>
                {budget?.map((line) => {
                  const variance = ((line.planned - line.actual) / line.planned) * 100
                  const label = `${variance >= 0 ? '+' : '−'}${Math.abs(variance).toFixed(1)}%`
                  return (
                    <tr key={line.id}>
                      <td>{t(`budget.${line.category}`)}</td>
                      <td>{formatCurrency(line.planned, i18n.resolvedLanguage)}</td>
                      <td>{formatCurrency(line.actual, i18n.resolvedLanguage)}</td>
                      <td>
                        <Status tone={variance >= 0 ? 'green' : 'amber'}>{label}</Status>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
          <Card title={t('schedule.workload')}>
            {workloadRows.map((row) => (
              <div className="resource" key={row.owner}>
                <span>
                  {row.owner} · {row.count} {t('schedule.workloadUnit')}
                </span>
                <b>{row.days} d</b>
                <div className="progress">
                  <i style={{ width: `${(row.days / workloadMax) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="modal-help">{t('schedule.workloadCopy')}</p>
          </Card>
        </div>
      </div>
      <FormModal
        open={creating && canEditSchedule}
        eyebrow={t('schedule.newEyebrow')}
        title={t('schedule.newTitle')}
        submitLabel={t('schedule.submitNew')}
        wide
        returnFocus={modalTrigger}
        onClose={() => {
          setCreating(false)
          setDraft(blankTask)
        }}
        onSubmit={saveNewTask}
      >
        <ScheduleFields
          value={draft}
          tasks={tasks ?? []}
          onChange={(changes) => setDraft((current) => ({ ...current, ...changes }))}
        />
      </FormModal>
      <FormModal
        open={Boolean(editing) && canEditSchedule}
        eyebrow={t('schedule.editEyebrow')}
        title={`${t('schedule.edit')} ${editing?.id ?? ''}`}
        submitLabel={t('schedule.saveChanges')}
        wide
        returnFocus={modalTrigger}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}
      >
        {editing && (
          <ScheduleFields
            value={editing}
            tasks={(tasks ?? []).filter((task) => task.id !== editing.id)}
            onChange={(changes) =>
              setEditing((current) => (current ? { ...current, ...changes } : current))
            }
          />
        )}
      </FormModal>
      <DetailModal
        open={Boolean(deleteCandidate)}
        eyebrow="CRONOGRAMA / CONFIRMACIÓN"
        title="Eliminar actividad"
        returnFocus={modalTrigger}
        onClose={() => setDeleteCandidate(null)}
      >
        {deleteCandidate && (
          <div className="confirm-action">
            <p>
              Se eliminará{' '}
              <b>
                {deleteCandidate.id} / {deleteCandidate.name}
              </b>{' '}
              de esta sesión demostrativa.
            </p>
            <p className="modal-help">
              La operación se bloqueará si existen actividades sucesoras vinculadas.
            </p>
            <div className="modal-options">
              <button className="secondary" type="button" onClick={() => setDeleteCandidate(null)}>
                Cancelar
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => void remove(deleteCandidate)}
              >
                Eliminar actividad
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </>
  )
}

function ScheduleFields({
  value,
  tasks,
  onChange,
}: {
  value: ScheduleTaskInput
  tasks: readonly ScheduleTask[]
  onChange: (changes: Partial<ScheduleTaskInput>) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="schedule-fields">
      <label className="field-wide">
        <span>{t('schedule.activity')}</span>
        <input
          autoFocus
          data-autofocus
          required
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>
      <label>
        <span>{t('schedule.owner')}</span>
        <input
          required
          value={value.owner}
          onChange={(event) => onChange({ owner: event.target.value })}
        />
      </label>
      <label>
        <span>{t('schedule.startField')}</span>
        <input
          required
          type="date"
          value={value.start}
          onChange={(event) => onChange({ start: event.target.value })}
        />
      </label>
      <label>
        <span>{t('schedule.endField')}</span>
        <input
          required
          type="date"
          value={value.end}
          onChange={(event) => onChange({ end: event.target.value })}
        />
      </label>
      <label>
        <span>{t('schedule.progress')}</span>
        <input
          type="number"
          min="0"
          max="100"
          value={value.progress}
          onChange={(event) => onChange({ progress: Number(event.target.value) })}
        />
      </label>
      <label>
        <span>{t('schedule.predecessorField')}</span>
        <select
          value={value.predecessor ?? ''}
          onChange={(event) => onChange({ predecessor: event.target.value || undefined })}
        >
          <option value="">{t('schedule.noDependency')}</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.id} · {task.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field-wide">
        <span>{t('schedule.noteField')}</span>
        <input
          value={value.notes ?? ''}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
      <label className="check-field">
        <input
          type="checkbox"
          checked={value.critical}
          onChange={(event) => onChange({ critical: event.target.checked })}
        />
        <span>{t('schedule.criticalField')}</span>
      </label>
      <label className="check-field">
        <input
          type="checkbox"
          checked={value.milestone}
          onChange={(event) => onChange({ milestone: event.target.checked })}
        />
        <span>{t('schedule.milestoneField')}</span>
      </label>
    </div>
  )
}
