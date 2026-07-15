import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectDocument, QualityMetric, WorkBreakdownItem } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { formatDate, formatNumber, formatPercent } from '../../shared/format'
import { useCapability, useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import '../../styles/operations-planning.css'

type ModalName = 'wbs' | 'upload' | 'baseline' | 'wbs-detail' | 'document' | 'quality' | null

interface WorkMetadata {
  readonly parent: string
  readonly owner: string
  readonly start: string
  readonly end: string
  readonly deliverable: string
}

const WORK_METADATA: Readonly<Record<string, WorkMetadata>> = {
  '1.1': {
    parent: '1.0',
    owner: 'Marina Ortiz',
    start: '2026-01-15',
    end: '2026-02-05',
    deliverable: 'Frentes y permisos liberados',
  },
  '1.2': {
    parent: '1.0',
    owner: 'Rafael Méndez',
    start: '2026-02-06',
    end: '2026-07-30',
    deliverable: 'Cimentaciones y estructura civil',
  },
  '1.3': {
    parent: '1.0',
    owner: 'Lucía Torres',
    start: '2026-07-01',
    end: '2026-08-27',
    deliverable: 'Sistemas MEP instalados y probados',
  },
  '1.4': {
    parent: '1.0',
    owner: 'Héctor Salgado',
    start: '2026-09-01',
    end: '2026-09-28',
    deliverable: 'Sistema energizado y comisionado',
  },
}

const ES = {
  location: 'Portafolio / BCY-PMO-2026-014 / Planificación',
  title: 'Planificación y WBS',
  projectCode: 'BCY-PMO-2026-014',
  active: 'En ejecución',
  cutoff: 'Corte operativo',
  cutoffDate: '12 jul 2026',
  baseline: 'Línea base',
  baselineValue: 'LB-05 / Contractual',
  scopeStatus: 'Alcance aprobado',
  scopeCurrent: 'Vigente',
  reload: 'Actualizar datos',
  reloadHint: 'Sincroniza WBS, expediente y criterios con el corte demostrativo.',
  addPackage: 'Nuevo paquete WBS',
  upload: 'Subir archivo',
  readOnly: 'Solo consulta',
  writeUnavailable: 'Disponible para Administrador y Project Manager.',
  feedback: {
    refreshed: 'Plan sincronizado con el corte operativo.',
    created: 'Paquete WBS creado y disponible en la estructura.',
    uploaded: 'Archivo incorporado al expediente de esta sesión.',
  },
  summary: {
    packages: 'Paquetes de trabajo',
    overall: 'Avance físico',
    completed: 'Completados',
    pending: 'Sin iniciar',
  },
  wbs: {
    eyebrow: 'ESTRUCTURA DE DESGLOSE DEL TRABAJO',
    title: 'WBS controlada',
    root: 'Interconexión El Encino - La Laguna',
    code: 'Código',
    package: 'Paquete / entregable',
    owner: 'Responsable',
    dates: 'Ventana planificada',
    progress: 'Avance',
    status: 'Estado',
    actions: 'Acciones',
    collapse: 'Contraer estructura',
    expand: 'Expandir estructura',
    inspect: 'Vista previa',
    empty: 'Aún no hay paquetes de trabajo registrados.',
    loading: 'Cargando estructura WBS…',
    error: 'No fue posible cargar la estructura WBS.',
    retry: 'Reintentar',
    statusDone: 'Terminado',
    statusActive: 'En curso',
    statusPending: 'Pendiente',
    rootDeliverable: 'Alcance contractual completo',
  },
  documents: {
    eyebrow: 'ENTREGABLES Y EXPEDIENTE',
    title: 'Control documental',
    count: 'archivos vigentes',
    name: 'Documento',
    date: 'Carga',
    owner: 'Responsable',
    inspect: 'Abrir vista previa',
    empty: 'No hay documentos incorporados al expediente.',
    loading: 'Cargando expediente…',
    error: 'No fue posible cargar el expediente.',
    deliverables: 'Entregables próximos',
    civil: 'Cimentaciones y estructura civil',
    civilMeta: '30 jul / Rafael Méndez',
    mep: 'Sistemas MEP instalados y probados',
    mepMeta: '27 ago / Lucía Torres',
    due: 'Próximo',
    inProgress: 'En elaboración',
  },
  quality: {
    eyebrow: 'CRITERIOS DE ACEPTACIÓN',
    title: 'Calidad del alcance',
    metric: 'Criterio',
    target: 'Meta',
    result: 'Resultado',
    compliance: 'Cumplimiento',
    compliant: 'Cumple',
    attention: 'Atención',
    inspect: 'Revisar criterio',
    empty: 'No hay criterios de calidad configurados.',
    loading: 'Cargando criterios…',
    error: 'No fue posible cargar los criterios de calidad.',
  },
  control: {
    eyebrow: 'CONTROL DEL PLAN',
    title: 'Configuración vigente',
    version: 'Versión de trabajo',
    revision: 'Rev. 06 / Corte julio',
    changeControl: 'Control de cambios',
    changeState: '1 solicitud en análisis',
    lastReview: 'Última revisión',
    reviewDate: '10 jul 2026 / PM y Control de Obra',
    compare: 'Comparar línea base',
    nextReview: 'Próxima revisión del plan: 15 jul 2026',
  },
  modal: {
    wbsEyebrow: 'PLANIFICACIÓN / ALCANCE',
    wbsTitle: 'Registrar paquete WBS',
    wbsSubmit: 'Crear paquete',
    name: 'Nombre del paquete de trabajo',
    namePlaceholder: 'Ej. Integración de tableros de control',
    parent: 'Elemento padre',
    owner: 'Responsable',
    start: 'Inicio planificado',
    end: 'Fin planificado',
    deliverable: 'Entregable verificable',
    deliverablePlaceholder: 'Ej. Tableros instalados y protocolo firmado',
    wbsHelp: 'El nuevo paquete se incorpora a la WBS vigente con avance inicial de 0%.',
    uploadEyebrow: 'EXPEDIENTE DEL PROYECTO',
    uploadTitle: 'Incorporar archivo',
    uploadSubmit: 'Registrar archivo',
    file: 'Selecciona un archivo',
    fileHelp:
      'La demo registra nombre, tipo y tamaño. El contenido no se conserva al reiniciar la sesión.',
    saveError: 'No fue posible guardar el registro. Intenta nuevamente.',
    dateError: 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
    baselineEyebrow: 'CONTROL INTEGRADO DEL PLAN',
    baselineTitle: 'Comparación contra línea base',
    current: 'Corte actual',
    variance: 'Variación',
    packages: 'Paquetes',
    finish: 'Fin contractual',
    budget: 'Presupuesto base',
    noScopeVariance: 'Sin variación de alcance aprobada',
    scheduleVariance: 'Pronóstico: +6 días',
    detailEyebrow: 'FICHA DE PAQUETE WBS',
    documentEyebrow: 'VISTA PREVIA DEL EXPEDIENTE',
    qualityEyebrow: 'FICHA DEL CRITERIO',
    parentLabel: 'Elemento padre',
    statusLabel: 'Estado operativo',
    deliverableLabel: 'Entregable verificable',
    dateLabel: 'Ventana planificada',
    uploaded: 'Fecha de carga',
    type: 'Tipo de archivo',
    size: 'Tamaño',
    demoPreview: 'Vista de metadatos demostrativa; el archivo binario no se almacena.',
    criterion: 'Criterio',
    finding: 'Lectura al corte',
    qualityGood: 'El resultado está dentro del criterio de aceptación.',
    qualityAttention: 'Requiere plan de cierre antes del siguiente corte.',
  },
  names: {
    '1.1': 'Preliminares',
    '1.2': 'Obra civil',
    '1.3': 'Instalaciones',
    '1.4': 'Puesta en marcha',
  } as Readonly<Record<string, string>>,
  qualityNames: {} as Readonly<Record<string, string>>,
  documentNames: {} as Readonly<Record<string, string>>,
  deliverableNames: {} as Readonly<Record<string, string>>,
}

const EN: typeof ES = {
  ...ES,
  location: 'Portfolio / BCY-PMO-2026-014 / Planning',
  title: 'Planning and WBS',
  active: 'In execution',
  cutoff: 'Operational cutoff',
  cutoffDate: 'Jul 12, 2026',
  baseline: 'Baseline',
  baselineValue: 'BL-05 / Contractual',
  scopeStatus: 'Approved scope',
  scopeCurrent: 'Current',
  reload: 'Refresh data',
  reloadHint: 'Synchronizes WBS, project records, and criteria with the demo cut-off.',
  addPackage: 'New WBS package',
  upload: 'Upload file',
  readOnly: 'Read only',
  writeUnavailable: 'Available to Administrator and Project Manager.',
  feedback: {
    refreshed: 'Plan synchronized with the operational cut-off.',
    created: 'WBS package created and available in the structure.',
    uploaded: 'File added to this session project record.',
  },
  summary: {
    packages: 'Work packages',
    overall: 'Physical progress',
    completed: 'Completed',
    pending: 'Not started',
  },
  wbs: {
    eyebrow: 'WORK BREAKDOWN STRUCTURE',
    title: 'Controlled WBS',
    root: 'El Encino - La Laguna Interconnection',
    code: 'Code',
    package: 'Package / deliverable',
    owner: 'Owner',
    dates: 'Planned window',
    progress: 'Progress',
    status: 'Status',
    actions: 'Actions',
    collapse: 'Collapse structure',
    expand: 'Expand structure',
    inspect: 'Preview',
    empty: 'No work packages have been registered yet.',
    loading: 'Loading WBS…',
    error: 'The WBS could not be loaded.',
    retry: 'Retry',
    statusDone: 'Completed',
    statusActive: 'In progress',
    statusPending: 'Pending',
    rootDeliverable: 'Complete contractual scope',
  },
  documents: {
    eyebrow: 'DELIVERABLES AND RECORDS',
    title: 'Document control',
    count: 'current files',
    name: 'Document',
    date: 'Uploaded',
    owner: 'Owner',
    inspect: 'Open preview',
    empty: 'No documents have been added to the project record.',
    loading: 'Loading project record…',
    error: 'The project record could not be loaded.',
    deliverables: 'Upcoming deliverables',
    civil: 'Foundations and civil structure',
    civilMeta: 'Jul 30 / Rafael Méndez',
    mep: 'MEP systems installed and tested',
    mepMeta: 'Aug 27 / Lucía Torres',
    due: 'Upcoming',
    inProgress: 'In preparation',
  },
  quality: {
    eyebrow: 'ACCEPTANCE CRITERIA',
    title: 'Scope quality',
    metric: 'Criterion',
    target: 'Target',
    result: 'Result',
    compliance: 'Compliance',
    compliant: 'Compliant',
    attention: 'Attention',
    inspect: 'Review criterion',
    empty: 'No quality criteria are configured.',
    loading: 'Loading criteria…',
    error: 'The quality criteria could not be loaded.',
  },
  control: {
    eyebrow: 'PLAN CONTROL',
    title: 'Current configuration',
    version: 'Working version',
    revision: 'Rev. 06 / July cutoff',
    changeControl: 'Change control',
    changeState: '1 request under analysis',
    lastReview: 'Last review',
    reviewDate: 'Jul 10, 2026 / PM and Field Control',
    compare: 'Compare baseline',
    nextReview: 'Next plan review: Jul 15, 2026',
  },
  modal: {
    wbsEyebrow: 'PLANNING / SCOPE',
    wbsTitle: 'Register WBS package',
    wbsSubmit: 'Create package',
    name: 'Work package name',
    namePlaceholder: 'E.g. Control panel integration',
    parent: 'Parent element',
    owner: 'Owner',
    start: 'Planned start',
    end: 'Planned finish',
    deliverable: 'Verifiable deliverable',
    deliverablePlaceholder: 'E.g. Installed panels and signed test report',
    wbsHelp: 'The new package is added to the current WBS with 0% initial progress.',
    uploadEyebrow: 'PROJECT RECORD',
    uploadTitle: 'Add file',
    uploadSubmit: 'Register file',
    file: 'Select a file',
    fileHelp:
      'The demo records name, type and size. File content is discarded when the session restarts.',
    saveError: 'The record could not be saved. Please try again.',
    dateError: 'The finish date must be on or after the start date.',
    baselineEyebrow: 'INTEGRATED PLAN CONTROL',
    baselineTitle: 'Baseline comparison',
    current: 'Current cutoff',
    variance: 'Variance',
    packages: 'Packages',
    finish: 'Contract finish',
    budget: 'Baseline budget',
    noScopeVariance: 'No approved scope variance',
    scheduleVariance: 'Forecast: +6 days',
    detailEyebrow: 'WBS PACKAGE RECORD',
    documentEyebrow: 'PROJECT RECORD PREVIEW',
    qualityEyebrow: 'CRITERION RECORD',
    parentLabel: 'Parent element',
    statusLabel: 'Operating status',
    deliverableLabel: 'Verifiable deliverable',
    dateLabel: 'Planned window',
    uploaded: 'Upload date',
    type: 'File type',
    size: 'Size',
    demoPreview: 'Demo metadata preview; the binary file is not stored.',
    criterion: 'Criterion',
    finding: 'Cutoff reading',
    qualityGood: 'The result is within the acceptance criterion.',
    qualityAttention: 'A closeout plan is required before the next cutoff.',
  },
  names: {
    '1.1': 'Preliminaries',
    '1.2': 'Civil works',
    '1.3': 'Installations',
    '1.4': 'Commissioning',
  },
  qualityNames: {
    'Q-01': 'Welds accepted on first inspection',
    'Q-02': 'Earthwork compaction (Proctor)',
    'Q-03': 'Nonconformities closed',
    'Q-04': 'Lost-time incidents',
  },
  documentNames: {
    'DOC-001': 'Project charter Rev. 02.pdf',
    'DOC-002': 'Contractual WBS.xlsx',
  },
  deliverableNames: {
    '1.1': 'Workfronts and permits released',
    '1.2': 'Foundations and civil structure',
    '1.3': 'MEP systems installed and tested',
    '1.4': 'Energized and commissioned system',
  },
}

const statusFor = (progress: number) =>
  progress >= 100 ? 'done' : progress > 0 ? 'active' : 'pending'

function ResourceState({
  loading,
  error,
  loadingText,
  errorText,
  retryText,
  onRetry,
}: {
  loading: boolean
  error: boolean
  loadingText: string
  errorText: string
  retryText: string
  onRetry(): void
}) {
  if (loading) return <p className="op-plan-resource-state">{loadingText}</p>
  if (!error) return null
  return (
    <div className="op-plan-resource-state is-error" role="alert">
      <span>{errorText}</span>
      <button type="button" onClick={onRetry}>
        {retryText}
      </button>
    </div>
  )
}

export function OperationalPlanningView() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage ?? i18n.language ?? 'es').startsWith('en') ? 'en' : 'es'
  const copy = language === 'en' ? EN : ES
  const services = useServices()
  const canWrite = useCapability('planning:write')
  const summaryResource = useServiceResource(() => services.project.getSummary(), [services])
  const wbsResource = useServiceResource(() => services.project.listWorkBreakdown(), [services])
  const documentResource = useServiceResource(() => services.project.listDocuments(), [services])
  const qualityResource = useServiceResource(() => services.project.listQuality(), [services])
  const [modal, setModal] = useState<ModalName>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [selectedWork, setSelectedWork] = useState<WorkBreakdownItem | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<QualityMetric | null>(null)
  const [createdMetadata, setCreatedMetadata] = useState<Record<string, WorkMetadata>>({})
  const [saveError, setSaveError] = useState('')
  const [feedback, setFeedback] = useState('')

  const items = useMemo(() => wbsResource.data ?? [], [wbsResource.data])
  const averageProgress =
    summaryResource.data?.progress ??
    (items.length
      ? Math.round(items.reduce((total, item) => total + item.progress, 0) / items.length)
      : 0)
  const completed = items.filter((item) => item.progress >= 100).length
  const pending = items.filter((item) => item.progress === 0).length

  const metadataFor = (item: WorkBreakdownItem): WorkMetadata =>
    createdMetadata[item.id] ??
    WORK_METADATA[item.id] ?? {
      parent: '1.0',
      owner: 'Ana Cruz',
      start: '2026-07-13',
      end: '2026-08-14',
      deliverable: item.name,
    }

  const workName = (item: WorkBreakdownItem) => copy.names[item.id] ?? item.name
  const deliverableName = (item: WorkBreakdownItem) =>
    copy.deliverableNames[item.id] ?? metadataFor(item).deliverable
  const documentName = (document: ProjectDocument) =>
    copy.documentNames[document.id] ?? document.name
  const qualityName = (metric: QualityMetric) => copy.qualityNames[metric.id] ?? metric.name
  const statusLabel = (progress: number) => {
    const status = statusFor(progress)
    if (status === 'done') return copy.wbs.statusDone
    if (status === 'active') return copy.wbs.statusActive
    return copy.wbs.statusPending
  }

  const reloadAll = async () => {
    setFeedback('')
    await Promise.all([
      summaryResource.reload(),
      wbsResource.reload(),
      documentResource.reload(),
      qualityResource.reload(),
    ])
    setFeedback(copy.feedback.refreshed)
  }

  const openModal = (name: Exclude<ModalName, null>, element: HTMLElement) => {
    setSaveError('')
    setTrigger(element)
    setModal(name)
  }

  const addWorkPackage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    if (!name) return
    const start = String(form.get('start') ?? '')
    const end = String(form.get('end') ?? '')
    if (end < start) {
      setSaveError(copy.modal.dateError)
      return
    }
    const result = await services.project.addWorkBreakdown(name)
    if (!result.ok) {
      setSaveError(copy.modal.saveError)
      return
    }
    setCreatedMetadata((current) => ({
      ...current,
      [result.data.id]: {
        parent: String(form.get('parent') ?? '1.0'),
        owner: String(form.get('owner') ?? 'Ana Cruz'),
        start,
        end,
        deliverable: String(form.get('deliverable') ?? name).trim() || name,
      },
    }))
    setModal(null)
    setFeedback(copy.feedback.created)
    await wbsResource.reload()
  }

  const uploadFile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const result = await services.project.addDocument({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
    })
    if (!result.ok) {
      setSaveError(copy.modal.saveError)
      return
    }
    setModal(null)
    setFeedback(copy.feedback.uploaded)
    await documentResource.reload()
  }

  const project = summaryResource.data
  if (!project)
    return (
      <section className="op-planning op-plan-page-state" aria-busy={summaryResource.loading}>
        <ResourceState
          loading={summaryResource.loading}
          error={Boolean(summaryResource.error)}
          loadingText={language === 'en' ? 'Loading project plan…' : 'Cargando plan del proyecto…'}
          errorText={
            language === 'en'
              ? 'The project plan could not be loaded.'
              : 'No fue posible cargar el plan del proyecto.'
          }
          retryText={copy.wbs.retry}
          onRetry={() => void summaryResource.reload()}
        />
      </section>
    )

  return (
    <div className="op-planning">
      <header className="op-plan-header">
        <div className="op-plan-heading">
          <span>{copy.location}</span>
          <div>
            <h1>{copy.title}</h1>
            <strong className="op-plan-state is-active">
              <i aria-hidden="true" /> {copy.active}
            </strong>
          </div>
          <p>
            {project.name} <span aria-hidden="true">·</span> {copy.projectCode}
          </p>
        </div>
        <dl className="op-plan-context">
          <div>
            <dt>{copy.cutoff}</dt>
            <dd>{copy.cutoffDate}</dd>
          </div>
          <div>
            <dt>{copy.baseline}</dt>
            <dd>{copy.baselineValue}</dd>
          </div>
          <div>
            <dt>{copy.scopeStatus}</dt>
            <dd className="is-good">✓ {copy.scopeCurrent}</dd>
          </div>
        </dl>
        <div className="op-plan-header-actions">
          <button
            className="op-plan-button is-secondary"
            type="button"
            title={copy.reloadHint}
            onClick={() => void reloadAll()}
          >
            ↻ {copy.reload}
          </button>
          {canWrite ? (
            <>
              <button
                className="op-plan-button is-secondary"
                type="button"
                onClick={(event) => openModal('upload', event.currentTarget)}
              >
                ↑ {copy.upload}
              </button>
              <button
                className="op-plan-button is-primary"
                type="button"
                onClick={(event) => openModal('wbs', event.currentTarget)}
              >
                + {copy.addPackage}
              </button>
            </>
          ) : (
            <>
              <span
                className="op-plan-locked-action"
                data-tooltip={copy.writeUnavailable}
                tabIndex={0}
              >
                <button
                  className="op-plan-button is-secondary"
                  type="button"
                  disabled
                  aria-describedby="op-plan-permission"
                >
                  ↑ {copy.upload}
                </button>
              </span>
              <span
                className="op-plan-locked-action"
                data-tooltip={copy.writeUnavailable}
                tabIndex={0}
              >
                <button
                  className="op-plan-button is-primary"
                  type="button"
                  disabled
                  aria-describedby="op-plan-permission"
                >
                  + {copy.addPackage}
                </button>
              </span>
              <span className="op-plan-readonly" id="op-plan-permission">
                {copy.readOnly}
              </span>
            </>
          )}
        </div>
      </header>

      {feedback && (
        <p className="op-plan-feedback" role="status">
          ✓ {feedback}
        </p>
      )}

      <section
        className="op-plan-summary"
        aria-label={language === 'en' ? 'Plan summary' : 'Resumen del plan'}
      >
        <article>
          <span>{copy.summary.packages}</span>
          <b>{formatNumber(items.length, language)}</b>
          <small>WBS 1.0</small>
        </article>
        <article>
          <span>{copy.summary.overall}</span>
          <b>{formatPercent(averageProgress, language)}</b>
          <div
            className="op-plan-progress"
            role="progressbar"
            aria-label={copy.summary.overall}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={averageProgress}
          >
            <i style={{ width: `${averageProgress}%` }} />
          </div>
        </article>
        <article>
          <span>{copy.summary.completed}</span>
          <b>{completed}</b>
          <small>{items.length ? `${Math.round((completed / items.length) * 100)}%` : '0%'}</small>
        </article>
        <article>
          <span>{copy.summary.pending}</span>
          <b>{pending}</b>
          <small>{pending ? copy.documents.inProgress : '—'}</small>
        </article>
      </section>

      <div className="op-plan-layout">
        <main className="op-plan-main">
          <section className="op-plan-panel op-plan-wbs" aria-labelledby="op-plan-wbs-title">
            <header className="op-plan-panel-head">
              <div>
                <span>{copy.wbs.eyebrow}</span>
                <h2 id="op-plan-wbs-title">{copy.wbs.title}</h2>
              </div>
              <button
                className="op-plan-link-button"
                type="button"
                aria-expanded={expanded}
                aria-controls="op-plan-wbs-body"
                title={expanded ? copy.wbs.collapse : copy.wbs.expand}
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? copy.wbs.collapse : copy.wbs.expand}
              </button>
            </header>
            <ResourceState
              loading={wbsResource.loading}
              error={Boolean(wbsResource.error)}
              loadingText={copy.wbs.loading}
              errorText={copy.wbs.error}
              retryText={copy.wbs.retry}
              onRetry={() => void wbsResource.reload()}
            />
            {!wbsResource.loading && !wbsResource.error && items.length === 0 && (
              <p className="op-plan-empty">{copy.wbs.empty}</p>
            )}
            {!wbsResource.error && items.length > 0 && (
              <div className="op-plan-table-scroll" id="op-plan-wbs-body">
                <table className="op-plan-wbs-table" role="treegrid">
                  <thead>
                    <tr>
                      <th>{copy.wbs.code}</th>
                      <th>{copy.wbs.package}</th>
                      <th>{copy.wbs.owner}</th>
                      <th>{copy.wbs.dates}</th>
                      <th>{copy.wbs.progress}</th>
                      <th>{copy.wbs.status}</th>
                      <th>{copy.wbs.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="is-root" aria-level={1} aria-expanded={expanded}>
                      <td>
                        <code>1.0</code>
                      </td>
                      <td>
                        <strong>{copy.wbs.root}</strong>
                        <small>{copy.wbs.rootDeliverable}</small>
                      </td>
                      <td>{project.manager}</td>
                      <td>
                        <time dateTime={project.startDate}>
                          {formatDate(project.startDate, language)}
                        </time>
                        <span> — </span>
                        <time dateTime={project.endDate}>
                          {formatDate(project.endDate, language)}
                        </time>
                      </td>
                      <td>
                        <div className="op-plan-row-progress">
                          <span>
                            <i style={{ width: `${project.progress}%` }} />
                          </span>
                          <b>{formatPercent(project.progress, language)}</b>
                        </div>
                      </td>
                      <td>
                        <span className="op-plan-state is-active">{copy.active}</span>
                      </td>
                      <td>—</td>
                    </tr>
                    {expanded &&
                      items.map((item) => {
                        const metadata = metadataFor(item)
                        const state = statusFor(item.progress)
                        return (
                          <tr key={item.id} aria-level={2}>
                            <td>
                              <code>{item.id}</code>
                            </td>
                            <td className="op-plan-work-name">
                              <i aria-hidden="true" />
                              <div>
                                <strong>{workName(item)}</strong>
                                <small>{deliverableName(item)}</small>
                              </div>
                            </td>
                            <td>{metadata.owner}</td>
                            <td>
                              <time dateTime={metadata.start}>
                                {formatDate(metadata.start, language)}
                              </time>
                              <span> — </span>
                              <time dateTime={metadata.end}>
                                {formatDate(metadata.end, language)}
                              </time>
                            </td>
                            <td>
                              <div className="op-plan-row-progress">
                                <span>
                                  <i style={{ width: `${item.progress}%` }} />
                                </span>
                                <b>{formatPercent(item.progress, language)}</b>
                              </div>
                            </td>
                            <td>
                              <span className={`op-plan-state is-${state}`}>
                                {statusLabel(item.progress)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="op-plan-row-action"
                                type="button"
                                onClick={(event) => {
                                  setSelectedWork(item)
                                  openModal('wbs-detail', event.currentTarget)
                                }}
                                aria-label={`${copy.wbs.inspect}: ${workName(item)}`}
                                title={`${copy.wbs.inspect}: ${workName(item)}`}
                              >
                                {copy.wbs.inspect}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section
            className="op-plan-panel op-plan-quality"
            aria-labelledby="op-plan-quality-title"
          >
            <header className="op-plan-panel-head">
              <div>
                <span>{copy.quality.eyebrow}</span>
                <h2 id="op-plan-quality-title">{copy.quality.title}</h2>
              </div>
            </header>
            <ResourceState
              loading={qualityResource.loading}
              error={Boolean(qualityResource.error)}
              loadingText={copy.quality.loading}
              errorText={copy.quality.error}
              retryText={copy.wbs.retry}
              onRetry={() => void qualityResource.reload()}
            />
            {!qualityResource.loading &&
              !qualityResource.error &&
              !qualityResource.data?.length && (
                <p className="op-plan-empty">{copy.quality.empty}</p>
              )}
            {Boolean(qualityResource.data?.length) && (
              <div className="op-plan-table-scroll">
                <table className="op-plan-quality-table">
                  <thead>
                    <tr>
                      <th>{copy.quality.metric}</th>
                      <th>{copy.quality.target}</th>
                      <th>{copy.quality.result}</th>
                      <th>{copy.quality.compliance}</th>
                      <th>{copy.wbs.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityResource.data?.map((metric) => (
                      <tr key={metric.id}>
                        <td>
                          <strong>{qualityName(metric)}</strong>
                          <small>{metric.id}</small>
                        </td>
                        <td>{metric.target}</td>
                        <td>{metric.result}</td>
                        <td>
                          <span
                            className={`op-plan-state ${metric.met ? 'is-done' : 'is-attention'}`}
                          >
                            {metric.met ? copy.quality.compliant : copy.quality.attention}
                          </span>
                        </td>
                        <td>
                          <button
                            className="op-plan-row-action"
                            type="button"
                            onClick={(event) => {
                              setSelectedQuality(metric)
                              openModal('quality', event.currentTarget)
                            }}
                            aria-label={`${copy.quality.inspect}: ${qualityName(metric)}`}
                            title={`${copy.quality.inspect}: ${qualityName(metric)}`}
                          >
                            {copy.quality.inspect}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <aside className="op-plan-side">
          <section
            className="op-plan-panel op-plan-documents"
            aria-labelledby="op-plan-documents-title"
          >
            <header className="op-plan-panel-head">
              <div>
                <span>{copy.documents.eyebrow}</span>
                <h2 id="op-plan-documents-title">{copy.documents.title}</h2>
              </div>
              <b>
                {documentResource.data?.length ?? 0} {copy.documents.count}
              </b>
            </header>
            <ResourceState
              loading={documentResource.loading}
              error={Boolean(documentResource.error)}
              loadingText={copy.documents.loading}
              errorText={copy.documents.error}
              retryText={copy.wbs.retry}
              onRetry={() => void documentResource.reload()}
            />
            {!documentResource.loading &&
              !documentResource.error &&
              !documentResource.data?.length && (
                <p className="op-plan-empty">{copy.documents.empty}</p>
              )}
            <ul className="op-plan-document-list">
              {documentResource.data?.slice(0, 4).map((document) => (
                <li key={document.id}>
                  <i aria-hidden="true">
                    {document.name.split('.').pop()?.slice(0, 4).toUpperCase()}
                  </i>
                  <div>
                    <strong>{documentName(document)}</strong>
                    <small>
                      {formatDate(document.uploadedAt, language)} · {document.owner}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      setSelectedDocument(document)
                      openModal('document', event.currentTarget)
                    }}
                    aria-label={`${copy.documents.inspect}: ${documentName(document)}`}
                    title={`${copy.documents.inspect}: ${documentName(document)}`}
                  >
                    →
                  </button>
                </li>
              ))}
            </ul>
            <div className="op-plan-deliverables">
              <h3>{copy.documents.deliverables}</h3>
              <article>
                <span className="op-plan-state is-active">{copy.documents.due}</span>
                <strong>{copy.documents.civil}</strong>
                <small>{copy.documents.civilMeta}</small>
              </article>
              <article>
                <span className="op-plan-state is-pending">{copy.documents.inProgress}</span>
                <strong>{copy.documents.mep}</strong>
                <small>{copy.documents.mepMeta}</small>
              </article>
            </div>
          </section>

          <section
            className="op-plan-panel op-plan-control"
            aria-labelledby="op-plan-control-title"
          >
            <header className="op-plan-panel-head">
              <div>
                <span>{copy.control.eyebrow}</span>
                <h2 id="op-plan-control-title">{copy.control.title}</h2>
              </div>
            </header>
            <dl>
              <div>
                <dt>{copy.control.version}</dt>
                <dd>{copy.control.revision}</dd>
              </div>
              <div>
                <dt>{copy.control.changeControl}</dt>
                <dd className="is-warning">{copy.control.changeState}</dd>
              </div>
              <div>
                <dt>{copy.control.lastReview}</dt>
                <dd>{copy.control.reviewDate}</dd>
              </div>
            </dl>
            <button
              className="op-plan-button is-secondary is-full"
              type="button"
              title={copy.control.compare}
              onClick={(event) => openModal('baseline', event.currentTarget)}
            >
              {copy.control.compare}
            </button>
            <p>{copy.control.nextReview}</p>
          </section>
        </aside>
      </div>

      <FormModal
        open={modal === 'wbs'}
        eyebrow={copy.modal.wbsEyebrow}
        title={copy.modal.wbsTitle}
        submitLabel={copy.modal.wbsSubmit}
        returnFocus={trigger}
        onClose={() => setModal(null)}
        onSubmit={(event) => void addWorkPackage(event)}
        wide
      >
        <div className="op-plan-modal-grid">
          <label className="op-plan-modal-field is-wide">
            <span>{copy.modal.name}</span>
            <input
              name="name"
              required
              autoFocus
              data-autofocus
              placeholder={copy.modal.namePlaceholder}
            />
          </label>
          <label className="op-plan-modal-field">
            <span>{copy.modal.parent}</span>
            <select name="parent" defaultValue="1.0">
              <option value="1.0">1.0 / {copy.wbs.root}</option>
            </select>
          </label>
          <label className="op-plan-modal-field">
            <span>{copy.modal.owner}</span>
            <select name="owner" defaultValue="Ana Cruz">
              <option>Ana Cruz</option>
              <option>Rafael Méndez</option>
              <option>Lucía Torres</option>
              <option>Marina Ortiz</option>
            </select>
          </label>
          <label className="op-plan-modal-field">
            <span>{copy.modal.start}</span>
            <input name="start" type="date" defaultValue="2026-07-13" required />
          </label>
          <label className="op-plan-modal-field">
            <span>{copy.modal.end}</span>
            <input name="end" type="date" defaultValue="2026-08-14" required />
          </label>
          <label className="op-plan-modal-field is-wide">
            <span>{copy.modal.deliverable}</span>
            <input name="deliverable" required placeholder={copy.modal.deliverablePlaceholder} />
          </label>
        </div>
        <p className="op-plan-modal-help">{copy.modal.wbsHelp}</p>
        {saveError && (
          <p className="op-plan-modal-error" role="alert">
            {saveError}
          </p>
        )}
      </FormModal>

      <FormModal
        open={modal === 'upload'}
        eyebrow={copy.modal.uploadEyebrow}
        title={copy.modal.uploadTitle}
        submitLabel={copy.modal.uploadSubmit}
        returnFocus={trigger}
        onClose={() => setModal(null)}
        onSubmit={(event) => void uploadFile(event)}
      >
        <label className="op-plan-modal-field op-plan-file-field">
          <span>{copy.modal.file}</span>
          <input
            name="file"
            type="file"
            required
            autoFocus
            data-autofocus
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
          />
        </label>
        <p className="op-plan-modal-help">{copy.modal.fileHelp}</p>
        {saveError && (
          <p className="op-plan-modal-error" role="alert">
            {saveError}
          </p>
        )}
      </FormModal>

      <DetailModal
        open={modal === 'baseline'}
        eyebrow={copy.modal.baselineEyebrow}
        title={copy.modal.baselineTitle}
        returnFocus={trigger}
        onClose={() => setModal(null)}
        wide
      >
        <div className="op-plan-baseline-grid">
          <article>
            <span>{copy.modal.packages}</span>
            <b>{items.length}</b>
            <small>{copy.modal.noScopeVariance}</small>
          </article>
          <article>
            <span>{copy.summary.overall}</span>
            <b>{formatPercent(project.progress, language)}</b>
            <small>
              {copy.modal.current}: {copy.cutoffDate}
            </small>
          </article>
          <article>
            <span>{copy.modal.finish}</span>
            <b>{formatDate(project.endDate, language)}</b>
            <small className="is-warning">{copy.modal.scheduleVariance}</small>
          </article>
          <article>
            <span>{copy.modal.budget}</span>
            <b>$18.45 M MXN</b>
            <small>{copy.baselineValue}</small>
          </article>
        </div>
      </DetailModal>

      <DetailModal
        open={modal === 'wbs-detail' && Boolean(selectedWork)}
        eyebrow={copy.modal.detailEyebrow}
        title={selectedWork ? `${selectedWork.id} / ${workName(selectedWork)}` : ''}
        returnFocus={trigger}
        onClose={() => {
          setModal(null)
          setSelectedWork(null)
        }}
      >
        {selectedWork && (
          <dl className="op-plan-detail-list">
            <div>
              <dt>{copy.modal.parentLabel}</dt>
              <dd>
                {metadataFor(selectedWork).parent} / {copy.wbs.root}
              </dd>
            </div>
            <div>
              <dt>{copy.modal.owner}</dt>
              <dd>{metadataFor(selectedWork).owner}</dd>
            </div>
            <div>
              <dt>{copy.modal.statusLabel}</dt>
              <dd>
                <span className={`op-plan-state is-${statusFor(selectedWork.progress)}`}>
                  {statusLabel(selectedWork.progress)}
                </span>
              </dd>
            </div>
            <div>
              <dt>{copy.wbs.progress}</dt>
              <dd>{formatPercent(selectedWork.progress, language)}</dd>
            </div>
            <div className="is-wide">
              <dt>{copy.modal.dateLabel}</dt>
              <dd>
                {formatDate(metadataFor(selectedWork).start, language)} —{' '}
                {formatDate(metadataFor(selectedWork).end, language)}
              </dd>
            </div>
            <div className="is-wide">
              <dt>{copy.modal.deliverableLabel}</dt>
              <dd>{deliverableName(selectedWork)}</dd>
            </div>
          </dl>
        )}
      </DetailModal>

      <DetailModal
        open={modal === 'document' && Boolean(selectedDocument)}
        eyebrow={copy.modal.documentEyebrow}
        title={selectedDocument ? documentName(selectedDocument) : ''}
        returnFocus={trigger}
        onClose={() => {
          setModal(null)
          setSelectedDocument(null)
        }}
      >
        {selectedDocument && (
          <div className="op-plan-document-preview">
            <i aria-hidden="true">{selectedDocument.name.split('.').pop()?.toUpperCase()}</i>
            <dl className="op-plan-detail-list">
              <div>
                <dt>{copy.modal.uploaded}</dt>
                <dd>{formatDate(selectedDocument.uploadedAt, language)}</dd>
              </div>
              <div>
                <dt>{copy.modal.owner}</dt>
                <dd>{selectedDocument.owner}</dd>
              </div>
              <div>
                <dt>{copy.modal.type}</dt>
                <dd>{selectedDocument.type}</dd>
              </div>
              <div>
                <dt>{copy.modal.size}</dt>
                <dd>{formatNumber(Math.ceil(selectedDocument.size / 1000), language)} KB</dd>
              </div>
            </dl>
            <p>{copy.modal.demoPreview}</p>
          </div>
        )}
      </DetailModal>

      <DetailModal
        open={modal === 'quality' && Boolean(selectedQuality)}
        eyebrow={copy.modal.qualityEyebrow}
        title={selectedQuality ? qualityName(selectedQuality) : ''}
        returnFocus={trigger}
        onClose={() => {
          setModal(null)
          setSelectedQuality(null)
        }}
      >
        {selectedQuality && (
          <dl className="op-plan-detail-list">
            <div>
              <dt>{copy.modal.criterion}</dt>
              <dd>{selectedQuality.id}</dd>
            </div>
            <div>
              <dt>{copy.quality.target}</dt>
              <dd>{selectedQuality.target}</dd>
            </div>
            <div>
              <dt>{copy.quality.result}</dt>
              <dd>{selectedQuality.result}</dd>
            </div>
            <div>
              <dt>{copy.quality.compliance}</dt>
              <dd>
                <span
                  className={`op-plan-state ${selectedQuality.met ? 'is-done' : 'is-attention'}`}
                >
                  {selectedQuality.met ? copy.quality.compliant : copy.quality.attention}
                </span>
              </dd>
            </div>
            <div className="is-wide">
              <dt>{copy.modal.finding}</dt>
              <dd>{selectedQuality.met ? copy.modal.qualityGood : copy.modal.qualityAttention}</dd>
            </div>
          </dl>
        )}
      </DetailModal>
    </div>
  )
}
