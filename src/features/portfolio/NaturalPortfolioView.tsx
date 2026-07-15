import { useMemo, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import type { PortfolioProject, ProjectStatus } from '../../shared/contracts'
import { formatDate, formatPercent, localeFor } from '../../shared/format'
import type { View } from '../../shared/project'
import { useServiceResource } from '../../shared/useServiceResource'
import { useServices } from '../../shared/useServices'
import '../../styles/natural-portfolio.css'

type StatusFilter = 'all' | ProjectStatus

const statusOptions: readonly StatusFilter[] = [
  'all',
  'active',
  'completed',
  'on_hold',
  'cancelled',
]

const statusKeys: Record<ProjectStatus, string> = {
  active: 'naturalPortfolio.statuses.active',
  completed: 'naturalPortfolio.statuses.completed',
  cancelled: 'naturalPortfolio.statuses.cancelled',
  on_hold: 'naturalPortfolio.statuses.onHold',
}

const statusFilterKeys: Record<StatusFilter, string> = {
  all: 'naturalPortfolio.filters.all',
  active: 'naturalPortfolio.filters.active',
  completed: 'naturalPortfolio.filters.completed',
  on_hold: 'naturalPortfolio.filters.onHold',
  cancelled: 'naturalPortfolio.filters.cancelled',
}

const phaseKeys: Record<string, string> = {
  'project-014': 'naturalPortfolio.phases.project014',
  'project-009': 'naturalPortfolio.phases.project009',
  'project-021': 'naturalPortfolio.phases.project021',
  'project-005': 'naturalPortfolio.phases.project005',
  'project-027': 'naturalPortfolio.phases.project027',
}

const clientKeys: Record<string, string> = {
  'project-014': 'naturalPortfolio.clients.project014',
  'project-009': 'naturalPortfolio.clients.project009',
  'project-021': 'naturalPortfolio.clients.project021',
  'project-005': 'naturalPortfolio.clients.project005',
  'project-027': 'naturalPortfolio.clients.project027',
}

const searchableProjectText = (project: PortfolioProject, locale: string) =>
  [project.code, project.name, project.client, project.location, project.manager, project.phase]
    .join(' ')
    .toLocaleLowerCase(locale)

export function NaturalPortfolioView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'es'
  const locale = localeFor(language)
  const services = useServices()
  const {
    data: projects,
    loading,
    error,
    reload,
  } = useServiceResource(() => services.project.listPortfolio(), [services])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null)
  const [previewTrigger, setPreviewTrigger] = useState<HTMLElement | null>(null)

  const projectList = useMemo(() => projects ?? [], [projects])
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredProjects = useMemo(
    () =>
      projectList.filter(
        (project) =>
          (status === 'all' || project.status === status) &&
          (!normalizedQuery || searchableProjectText(project, locale).includes(normalizedQuery)),
      ),
    [locale, normalizedQuery, projectList, status],
  )

  const activeCount = projectList.filter((project) => project.status === 'active').length
  const completedCount = projectList.filter((project) => project.status === 'completed').length
  const attentionCount = projectList.filter(
    (project) => project.status === 'on_hold' || project.status === 'cancelled',
  ).length
  const averageProgress = projectList.length
    ? Math.round(
        projectList.reduce((total, project) => total + project.progress, 0) / projectList.length,
      )
    : 0
  const hasFilters = Boolean(normalizedQuery || status !== 'all')

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
  }

  const openPreview = (project: PortfolioProject, event: MouseEvent<HTMLButtonElement>) => {
    setPreviewTrigger(event.currentTarget)
    setSelectedProject(project)
  }

  const openProject = () => {
    if (!selectedProject?.eligible) return
    setSelectedProject(null)
    onNavigate('dashboard')
  }

  return (
    <div className="natural-portfolio-view">
      <header className="natural-portfolio-head">
        <div>
          <span className="eyebrow">{t('naturalPortfolio.eyebrow')}</span>
          <h2>{t('naturalPortfolio.title')}</h2>
          <p>{t('naturalPortfolio.copy')}</p>
        </div>
        <button
          type="button"
          className="natural-refresh-button"
          disabled={loading}
          onClick={() => void reload()}
        >
          <span aria-hidden="true">↻</span>
          {loading ? t('naturalPortfolio.refreshing') : t('naturalPortfolio.refresh')}
        </button>
      </header>

      <section className="natural-portfolio-kpis" aria-label={t('naturalPortfolio.summaryLabel')}>
        <PortfolioKpi
          label={t('naturalPortfolio.kpis.total')}
          value={projectList.length}
          detail={t('naturalPortfolio.kpis.totalDetail')}
        />
        <PortfolioKpi
          label={t('naturalPortfolio.kpis.active')}
          value={activeCount}
          detail={t('naturalPortfolio.kpis.activeDetail')}
          tone="green"
        />
        <PortfolioKpi
          label={t('naturalPortfolio.kpis.average')}
          value={formatPercent(averageProgress, language)}
          detail={t('naturalPortfolio.kpis.completed', { count: completedCount })}
          tone="blue"
        />
        <PortfolioKpi
          label={t('naturalPortfolio.kpis.attention')}
          value={attentionCount}
          detail={t('naturalPortfolio.kpis.attentionDetail')}
          tone={attentionCount ? 'amber' : 'green'}
        />
      </section>

      <section className="natural-portfolio-panel" aria-labelledby="natural-portfolio-list-title">
        <header className="natural-portfolio-toolbar">
          <div className="natural-portfolio-list-heading">
            <h3 id="natural-portfolio-list-title">{t('naturalPortfolio.listTitle')}</h3>
            <p aria-live="polite">
              {t('naturalPortfolio.recordCount', {
                filtered: filteredProjects.length,
                total: projectList.length,
              })}
            </p>
          </div>

          <div className="natural-portfolio-filters" role="search">
            <label className="natural-search-field">
              <span className="natural-sr-only">{t('naturalPortfolio.searchLabel')}</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                placeholder={t('naturalPortfolio.searchPlaceholder')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="natural-status-filter">
              <span className="natural-sr-only">{t('naturalPortfolio.filterLabel')}</span>
              <select
                value={status}
                aria-label={t('naturalPortfolio.filterAria')}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(statusFilterKeys[option])}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="natural-clear-button"
              disabled={!hasFilters}
              onClick={clearFilters}
            >
              {t('naturalPortfolio.clear')}
            </button>
          </div>
        </header>

        <AsyncState loading={loading} error={error ? t('naturalPortfolio.loadError') : undefined} />

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="natural-portfolio-table-wrap">
            <table className="natural-portfolio-table">
              <caption className="natural-sr-only">{t('naturalPortfolio.tableCaption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('naturalPortfolio.columns.project')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.status')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.clientLocation')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.owner')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.phase')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.progress')}</th>
                  <th scope="col">{t('naturalPortfolio.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onOpen={() => onNavigate('dashboard')}
                    onPreview={(event) => openPreview(project, event)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <div className="natural-portfolio-empty" role="status">
            <span aria-hidden="true">⌕</span>
            <h4>{t('naturalPortfolio.emptyTitle')}</h4>
            <p>{t('naturalPortfolio.emptyCopy')}</p>
            {hasFilters && (
              <button type="button" className="secondary" onClick={clearFilters}>
                {t('naturalPortfolio.resetFilters')}
              </button>
            )}
          </div>
        )}
      </section>

      <DetailModal
        open={Boolean(selectedProject)}
        eyebrow={t('naturalPortfolio.modalEyebrow')}
        title={selectedProject?.name ?? ''}
        returnFocus={previewTrigger}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && <ProjectPreview project={selectedProject} onOpen={openProject} />}
      </DetailModal>
    </div>
  )
}

function PortfolioKpi({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  detail: string
  tone?: 'neutral' | 'green' | 'blue' | 'amber'
}) {
  return (
    <article className={`natural-portfolio-kpi is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function ProjectRow({
  project,
  onOpen,
  onPreview,
}: {
  project: PortfolioProject
  onOpen: () => void
  onPreview: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'es'
  const projectPhase = phaseKeys[project.id] ? t(phaseKeys[project.id]) : project.phase
  const projectClient = clientKeys[project.id] ? t(clientKeys[project.id]) : project.client
  return (
    <tr className={project.eligible ? 'is-operable' : undefined}>
      <td className="natural-project-cell" data-label={t('naturalPortfolio.columns.project')}>
        <span className="natural-project-code">{project.code}</span>
        <strong>{project.name}</strong>
        {project.eligible && <small>{t('naturalPortfolio.eligibleProject')}</small>}
      </td>
      <td data-label={t('naturalPortfolio.columns.status')}>
        <ProjectStatusBadge status={project.status} />
      </td>
      <td data-label={t('naturalPortfolio.columns.clientLocation')}>
        <strong className="natural-cell-primary">{projectClient}</strong>
        <small>{project.location}</small>
      </td>
      <td data-label={t('naturalPortfolio.columns.owner')}>
        <strong className="natural-cell-primary">{project.manager}</strong>
        <small>{t('naturalPortfolio.projectManager')}</small>
      </td>
      <td data-label={t('naturalPortfolio.columns.phase')}>
        <strong className="natural-cell-primary">{projectPhase}</strong>
        <small>
          {t('naturalPortfolio.updated', { date: formatDate(project.updatedAt, language) })}
        </small>
      </td>
      <td data-label={t('naturalPortfolio.columns.progress')}>
        <div className="natural-progress-copy">
          <strong>{formatPercent(project.progress, language)}</strong>
        </div>
        <div
          className="natural-project-progress"
          role="progressbar"
          aria-label={t('naturalPortfolio.projectProgress', { name: project.name })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <span style={{ width: `${project.progress}%` }} />
        </div>
      </td>
      <td className="natural-actions-cell" data-label={t('naturalPortfolio.columns.actions')}>
        <button
          type="button"
          className="natural-row-action"
          aria-label={t('naturalPortfolio.previewProject', { name: project.name })}
          onClick={onPreview}
        >
          {t('naturalPortfolio.preview')}
        </button>
        {project.eligible ? (
          <button
            type="button"
            className="natural-row-action is-primary"
            aria-label={t('naturalPortfolio.openDashboard', { name: project.name })}
            onClick={onOpen}
          >
            {t('naturalPortfolio.open')}
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <span className="natural-readonly-label">{t('naturalPortfolio.readOnly')}</span>
        )}
      </td>
    </tr>
  )
}

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useTranslation()
  return <span className={`natural-project-status is-${status}`}>{t(statusKeys[status])}</span>
}

function ProjectPreview({ project, onOpen }: { project: PortfolioProject; onOpen: () => void }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'es'
  const projectPhase = phaseKeys[project.id] ? t(phaseKeys[project.id]) : project.phase
  const projectClient = clientKeys[project.id] ? t(clientKeys[project.id]) : project.client
  return (
    <div className="natural-project-preview">
      <div className="natural-preview-summary">
        <div>
          <ProjectStatusBadge status={project.status} />
          <span className="natural-project-code">{project.code}</span>
        </div>
        <div className="natural-preview-progress">
          <span>{t('naturalPortfolio.previewFields.physicalProgress')}</span>
          <strong>{formatPercent(project.progress, language)}</strong>
        </div>
      </div>

      <div
        className="natural-project-progress is-large"
        role="progressbar"
        aria-label={t('naturalPortfolio.projectProgress', { name: project.name })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={project.progress}
      >
        <span style={{ width: `${project.progress}%` }} />
      </div>

      <dl className="natural-preview-details">
        <div>
          <dt>{t('naturalPortfolio.previewFields.client')}</dt>
          <dd>{projectClient}</dd>
        </div>
        <div>
          <dt>{t('naturalPortfolio.previewFields.location')}</dt>
          <dd>{project.location}</dd>
        </div>
        <div>
          <dt>{t('naturalPortfolio.projectManager')}</dt>
          <dd>{project.manager}</dd>
        </div>
        <div>
          <dt>{t('naturalPortfolio.previewFields.currentPhase')}</dt>
          <dd>{projectPhase}</dd>
        </div>
        <div>
          <dt>{t('naturalPortfolio.previewFields.lastUpdate')}</dt>
          <dd>{formatDate(project.updatedAt, language)}</dd>
        </div>
        <div>
          <dt>{t('naturalPortfolio.previewFields.access')}</dt>
          <dd>
            {project.eligible
              ? t('naturalPortfolio.previewFields.operationEnabled')
              : t('naturalPortfolio.previewFields.readOnly')}
          </dd>
        </div>
      </dl>

      <div className={`natural-preview-access ${project.eligible ? 'is-operable' : ''}`}>
        <div>
          <strong>
            {project.eligible
              ? t('naturalPortfolio.accessReadyTitle')
              : t('naturalPortfolio.accessReadonlyTitle')}
          </strong>
          <p>
            {project.eligible
              ? t('naturalPortfolio.accessReadyCopy')
              : t('naturalPortfolio.accessReadonlyCopy')}
          </p>
        </div>
        {project.eligible && (
          <button type="button" className="primary" onClick={onOpen}>
            {t('naturalPortfolio.openDashboardButton')}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  )
}
