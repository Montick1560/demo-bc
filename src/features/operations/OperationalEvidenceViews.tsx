import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  FieldReport,
  FieldReportInput,
  IncidentInput,
  IncidentRecord,
} from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { formatDate, formatNumber } from '../../shared/format'
import { useServiceResource } from '../../shared/useServiceResource'
import { useCapability, useServices, useSession } from '../../shared/useServices'
import '../../styles/operations-evidence.css'

const copy = {
  es: {
    documents: {
      eyebrow: 'Evidencia del proyecto',
      title: 'Documentos',
      copy: 'Control documental, revisiones y archivos vinculados al proyecto.',
      upload: 'Subir documento',
      search: 'Buscar por nombre o responsable',
      all: 'Todos los tipos',
      name: 'Documento',
      type: 'Tipo',
      size: 'Tamaño',
      owner: 'Responsable',
      date: 'Fecha',
      actions: 'Acciones',
      preview: 'Vista previa',
      history: 'Historial',
      historyTitle: 'Historial de revisiones',
      options: 'Opciones del documento',
      empty: 'No hay documentos para este filtro.',
      formTitle: 'Subir documento',
      file: 'Archivo',
      save: 'Incorporar al expediente',
      detail: 'Ficha documental',
      current: 'Revisión vigente',
      revision: 'Revisión',
      released: 'Liberado para uso',
      previewCopy: 'Vista demostrativa del expediente controlado',
      noBinary: 'El archivo binario se conectará al repositorio documental del Backend.',
      demo: 'En esta demo se almacena únicamente la metadata del archivo.',
      roleMode: 'Permisos documentales',
      roleHelp: {
        Administrador: 'Puede incorporar documentos y consultar toda la trazabilidad.',
        'Project Manager': 'Puede incorporar evidencia y consultar revisiones del proyecto.',
        Supervisor: 'Consulta y vista previa habilitadas; la incorporación es de sólo lectura.',
      },
      editable: 'Carga habilitada',
      readonly: 'Sólo consulta',
    },
    field: {
      eyebrow: 'Ejecución en sitio',
      title: 'Control de campo',
      copy: 'Partes diarios, mano de obra, avance e incidencias del frente.',
      report: 'Nuevo parte diario',
      incident: 'Registrar incidencia',
      crew: 'Personal reportado',
      today: 'Partes al corte',
      open: 'Incidencias abiertas',
      progress: 'Avance físico',
      reports: 'Partes de campo',
      incidents: 'Incidencias',
      date: 'Fecha',
      front: 'Frente',
      supervisor: 'Supervisor',
      people: 'Cuadrilla',
      weather: 'Clima',
      note: 'Resumen',
      status: 'Estado',
      actions: 'Acciones',
      view: 'Abrir',
      contain: 'Contener',
      close: 'Cerrar',
      reopen: 'Reabrir',
      reportTitle: 'Registrar parte diario',
      incidentTitle: 'Registrar incidencia',
      saveReport: 'Enviar parte',
      saveIncident: 'Registrar incidencia',
      severity: 'Severidad',
      type: 'Tipo',
      owner: 'Responsable',
      titleField: 'Descripción breve',
      emptyReports: 'No hay partes de campo.',
      emptyIncidents: 'No hay incidencias.',
      detail: 'Detalle del parte',
      incidentDetail: 'Detalle de incidencia',
      confirmStatus: 'Confirmar cambio de estado',
      confirmStatusCopy: 'El registro y los indicadores del corte se actualizarán inmediatamente.',
      applyStatus: 'Aplicar estado',
      roleMode: 'Permisos de campo',
      roleHelp: {
        Administrador: 'Puede registrar, revisar y resolver cualquier evidencia de campo.',
        'Project Manager':
          'Consulta ejecutiva habilitada; la operación de campo corresponde al Supervisor.',
        Supervisor:
          'Puede enviar partes, registrar incidencias y actualizar su contención o cierre.',
      },
      editable: 'Operación habilitada',
      readonly: 'Sólo consulta',
    },
  },
  en: {
    documents: {
      eyebrow: 'Project evidence',
      title: 'Documents',
      copy: 'Document control, revisions and project-linked files.',
      upload: 'Upload document',
      search: 'Search by name or owner',
      all: 'All types',
      name: 'Document',
      type: 'Type',
      size: 'Size',
      owner: 'Owner',
      date: 'Date',
      actions: 'Actions',
      preview: 'Preview',
      history: 'History',
      historyTitle: 'Revision history',
      options: 'Document options',
      empty: 'No documents match this filter.',
      formTitle: 'Upload document',
      file: 'File',
      save: 'Add to file',
      detail: 'Document record',
      current: 'Current revision',
      revision: 'Revision',
      released: 'Released for use',
      previewCopy: 'Demo preview of the controlled project file',
      noBinary: 'The binary file will be connected to the Backend document repository.',
      demo: 'This demo stores file metadata only.',
      roleMode: 'Document permissions',
      roleHelp: {
        Administrador: 'Can add documents and inspect the full audit trail.',
        'Project Manager': 'Can add evidence and review project revisions.',
        Supervisor: 'Search and preview are enabled; document intake is read-only.',
      },
      editable: 'Upload enabled',
      readonly: 'View only',
    },
    field: {
      eyebrow: 'Site execution',
      title: 'Field control',
      copy: 'Daily reports, workforce, progress and work-front issues.',
      report: 'New daily report',
      incident: 'Create issue',
      crew: 'Reported workforce',
      today: 'Reports at cutoff',
      open: 'Open issues',
      progress: 'Physical progress',
      reports: 'Field reports',
      incidents: 'Issues',
      date: 'Date',
      front: 'Work front',
      supervisor: 'Supervisor',
      people: 'Crew',
      weather: 'Weather',
      note: 'Summary',
      status: 'Status',
      actions: 'Actions',
      view: 'Open',
      contain: 'Contain',
      close: 'Close',
      reopen: 'Reopen',
      reportTitle: 'Create daily report',
      incidentTitle: 'Create issue',
      saveReport: 'Submit report',
      saveIncident: 'Create issue',
      severity: 'Severity',
      type: 'Type',
      owner: 'Owner',
      titleField: 'Short description',
      emptyReports: 'No field reports.',
      emptyIncidents: 'No issues.',
      detail: 'Report detail',
      incidentDetail: 'Issue details',
      confirmStatus: 'Confirm status change',
      confirmStatusCopy: 'The record and cutoff indicators will update immediately.',
      applyStatus: 'Apply status',
      roleMode: 'Field permissions',
      roleHelp: {
        Administrador: 'Can create, review and resolve all field evidence.',
        'Project Manager':
          'Executive review is enabled; field operation belongs to the Supervisor.',
        Supervisor: 'Can submit reports, create issues and update containment or closure.',
      },
      editable: 'Operation enabled',
      readonly: 'View only',
    },
  },
} as const

function useCopy() {
  const { i18n } = useTranslation()
  const language: 'es' | 'en' = i18n.resolvedLanguage === 'en' ? 'en' : 'es'
  return { language, text: copy[language] }
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <header className="op-page-heading op-register-heading">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="op-heading-actions">{actions}</div>}
    </header>
  )
}

function RoleContext({
  label,
  role,
  description,
  enabled,
  enabledLabel,
  readOnlyLabel,
}: {
  label: string
  role: 'Administrador' | 'Project Manager' | 'Supervisor'
  description: string
  enabled: boolean
  enabledLabel: string
  readOnlyLabel: string
}) {
  return (
    <aside className="op-evidence-role" aria-label={`${label}: ${role}`}>
      <span>{label}</span>
      <strong>{role}</strong>
      <p>{description}</p>
      <b className={enabled ? 'is-enabled' : 'is-readonly'}>
        {enabled ? enabledLabel : readOnlyLabel}
      </b>
    </aside>
  )
}

const bytes = (size: number, language: string) =>
  `${new Intl.NumberFormat(language === 'en' ? 'en-MX' : 'es-MX', { maximumFractionDigits: 1 }).format(size / 1_000_000)} MB`
const docType = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'FILE'

export function OperationalDocumentsView({ notify }: { notify: (message: string) => void }) {
  const { language, text } = useCopy()
  const services = useServices()
  const session = useSession()
  const canUpload = useCapability('planning:write')
  const resource = useServiceResource(() => services.project.listDocuments(), [services])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const selected = resource.data?.find((document) => document.id === selectedId) ?? null
  const historyDocument = resource.data?.find((document) => document.id === historyId) ?? null
  const types = [...new Set((resource.data ?? []).map((document) => docType(document.name)))]
  const visible = (resource.data ?? []).filter(
    (document) =>
      (type === 'all' || docType(document.name) === type) &&
      `${document.name} ${document.owner}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return
    const result = await services.project.addDocument({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
    })
    if (result.ok) {
      setOpen(false)
      setFile(null)
      notify(
        language === 'es'
          ? 'Documento incorporado al expediente'
          : 'Document added to project file',
      )
      await resource.reload()
    } else {
      notify(
        language === 'es'
          ? 'No fue posible incorporar el documento'
          : 'Document could not be added',
      )
    }
  }
  return (
    <div className="op-evidence-page">
      <PageHeader
        eyebrow={text.documents.eyebrow}
        title={text.documents.title}
        description={text.documents.copy}
        actions={
          canUpload ? (
            <button
              className="op-button primary"
              title={text.documents.upload}
              onClick={(event) => {
                setTrigger(event.currentTarget)
                setOpen(true)
              }}
            >
              + {text.documents.upload}
            </button>
          ) : undefined
        }
      />
      <RoleContext
        label={text.documents.roleMode}
        role={session.role}
        description={text.documents.roleHelp[session.role]}
        enabled={canUpload}
        enabledLabel={text.documents.editable}
        readOnlyLabel={text.documents.readonly}
      />
      <div className="op-document-toolbar" role="search">
        <label>
          <span className="sr-only">{text.documents.search}</span>
          <input
            type="search"
            title={text.documents.search}
            placeholder={text.documents.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">{text.documents.type}</span>
          <select
            title={text.documents.type}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">{text.documents.all}</option>
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <span>
          {visible.length} / {resource.data?.length ?? 0}
        </span>
      </div>
      <section className="op-data-panel is-register">
        <div className="op-table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{text.documents.name}</th>
                <th>{text.documents.type}</th>
                <th>{text.documents.size}</th>
                <th>{text.documents.owner}</th>
                <th>{text.documents.date}</th>
                <th>{text.documents.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((document) => (
                <tr key={document.id}>
                  <td>
                    <code>{document.id}</code>
                  </td>
                  <td>
                    <strong>{document.name}</strong>
                    <small>{text.documents.current}</small>
                  </td>
                  <td>
                    <span className="op-file-type">{docType(document.name)}</span>
                  </td>
                  <td>{bytes(document.size, language)}</td>
                  <td>{document.owner}</td>
                  <td>{formatDate(document.uploadedAt, language)}</td>
                  <td>
                    <div className="op-row-actions">
                      <button
                        title={`${text.documents.preview}: ${document.name}`}
                        onClick={(event) => {
                          setTrigger(event.currentTarget)
                          setSelectedId(document.id)
                        }}
                      >
                        {text.documents.preview}
                      </button>
                      <button
                        title={`${text.documents.history}: ${document.name}`}
                        onClick={(event) => {
                          setTrigger(event.currentTarget)
                          setHistoryId(document.id)
                        }}
                      >
                        {text.documents.history}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!resource.loading && visible.length === 0 && (
            <p className="op-empty">{text.documents.empty}</p>
          )}
        </div>
      </section>
      <FormModal
        open={open}
        eyebrow={text.documents.eyebrow}
        title={text.documents.formTitle}
        submitLabel={text.documents.save}
        returnFocus={trigger}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      >
        <label>
          {text.documents.file}
          <input
            data-autofocus
            type="file"
            required
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <p className="op-form-note">{text.documents.demo}</p>
        {file && (
          <dl className="op-upload-summary" aria-live="polite">
            <div>
              <dt>{text.documents.name}</dt>
              <dd>{file.name}</dd>
            </div>
            <div>
              <dt>{text.documents.type}</dt>
              <dd>{docType(file.name)}</dd>
            </div>
            <div>
              <dt>{text.documents.size}</dt>
              <dd>{bytes(file.size, language)}</dd>
            </div>
          </dl>
        )}
      </FormModal>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={text.documents.detail}
        title={selected?.name ?? ''}
        returnFocus={trigger}
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <>
            <div className="op-document-preview" aria-label={text.documents.previewCopy}>
              <span>{docType(selected.name)}</span>
              <div>
                <strong>{selected.name}</strong>
                <p>{text.documents.previewCopy}</p>
                <small>{text.documents.noBinary}</small>
              </div>
            </div>
            <dl className="op-detail-grid">
              <div>
                <dt>ID</dt>
                <dd>{selected.id}</dd>
              </div>
              <div>
                <dt>{text.documents.type}</dt>
                <dd>{selected.type}</dd>
              </div>
              <div>
                <dt>{text.documents.owner}</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>{text.documents.date}</dt>
                <dd>{formatDate(selected.uploadedAt, language)}</dd>
              </div>
              <div className="is-wide">
                <dt>{text.documents.size}</dt>
                <dd>{bytes(selected.size, language)}</dd>
              </div>
            </dl>
          </>
        )}
      </DetailModal>
      <DetailModal
        open={Boolean(historyDocument)}
        eyebrow={text.documents.historyTitle}
        title={historyDocument?.name ?? ''}
        returnFocus={trigger}
        onClose={() => setHistoryId(null)}
      >
        {historyDocument && (
          <ol className="op-document-history">
            <li>
              <span>Rev. 02</span>
              <div>
                <strong>{text.documents.released}</strong>
                <small>
                  {historyDocument.owner} · {formatDate(historyDocument.uploadedAt, language)}
                </small>
              </div>
              <b>{text.documents.current}</b>
            </li>
            <li>
              <span>Rev. 01</span>
              <div>
                <strong>{language === 'es' ? 'Revisión técnica' : 'Technical review'}</strong>
                <small>PMO · {formatDate('2026-07-04', language)}</small>
              </div>
              <b>{language === 'es' ? 'Sustituida' : 'Superseded'}</b>
            </li>
          </ol>
        )}
      </DetailModal>
    </div>
  )
}

export function OperationalFieldView({ notify }: { notify: (message: string) => void }) {
  const { language, text } = useCopy()
  const services = useServices()
  const session = useSession()
  const canUpdate = useCapability('field:update')
  const reports = useServiceResource(() => services.field.listReports(), [services])
  const incidents = useServiceResource(() => services.field.listIncidents(), [services])
  const [reportOpen, setReportOpen] = useState(false)
  const [incidentOpen, setIncidentOpen] = useState(false)
  const [selected, setSelected] = useState<FieldReport | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null)
  const [pendingStatus, setPendingStatus] = useState<{
    incident: IncidentRecord
    status: IncidentRecord['status']
  } | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [report, setReport] = useState<FieldReportInput>({
    date: '2026-07-12',
    front: '',
    supervisor: session.name,
    crew: 1,
    progress: 64,
    weather: 'clear',
    note: '',
  })
  const [incident, setIncident] = useState<IncidentInput>({
    title: '',
    type: 'technical',
    severity: 'medium',
    owner: session.name,
    openedAt: '2026-07-12',
  })
  const crew = (reports.data ?? [])
    .filter((item) => item.date === '2026-07-12')
    .reduce((sum, item) => sum + item.crew, 0)
  const openIncidents = (incidents.data ?? []).filter((item) => item.status !== 'closed')
  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await services.field.addReport(report)
    if (result.ok) {
      setReportOpen(false)
      setReport({
        date: '2026-07-12',
        front: '',
        supervisor: session.name,
        crew: 1,
        progress: 64,
        weather: 'clear',
        note: '',
      })
      notify(language === 'es' ? 'Parte diario enviado' : 'Daily report submitted')
      await reports.reload()
    } else {
      notify(
        language === 'es'
          ? 'No fue posible enviar el parte diario'
          : 'Daily report could not be submitted',
      )
    }
  }
  const submitIncident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await services.field.addIncident(incident)
    if (result.ok) {
      setIncidentOpen(false)
      setIncident({
        title: '',
        type: 'technical',
        severity: 'medium',
        owner: session.name,
        openedAt: '2026-07-12',
      })
      notify(language === 'es' ? 'Incidencia registrada' : 'Issue created')
      await incidents.reload()
    } else {
      notify(
        language === 'es' ? 'No fue posible registrar la incidencia' : 'Issue could not be created',
      )
    }
  }
  const changeStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pendingStatus || !canUpdate) return
    const result = await services.field.updateIncidentStatus(
      pendingStatus.incident.id,
      pendingStatus.status,
    )
    if (result.ok) {
      setPendingStatus(null)
      notify(language === 'es' ? 'Incidencia actualizada' : 'Issue updated')
      await incidents.reload()
    } else {
      notify(
        language === 'es'
          ? 'No fue posible actualizar la incidencia'
          : 'Issue could not be updated',
      )
    }
  }
  const weather = {
    clear: language === 'es' ? 'Despejado' : 'Clear',
    rain: language === 'es' ? 'Lluvia' : 'Rain',
    wind: language === 'es' ? 'Viento' : 'Wind',
  }
  const issueType = {
    safety: language === 'es' ? 'Seguridad' : 'Safety',
    quality: language === 'es' ? 'Calidad' : 'Quality',
    technical: language === 'es' ? 'Técnica' : 'Technical',
    environmental: language === 'es' ? 'Ambiental' : 'Environmental',
  }
  const severityLabel: Record<IncidentRecord['severity'], string> = {
    low: language === 'es' ? 'Baja' : 'Low',
    medium: language === 'es' ? 'Media' : 'Medium',
    high: language === 'es' ? 'Alta' : 'High',
  }
  const incidentStatusLabel: Record<IncidentRecord['status'], string> = {
    open: language === 'es' ? 'Abierta' : 'Open',
    contained: language === 'es' ? 'Contenida' : 'Contained',
    closed: language === 'es' ? 'Cerrada' : 'Closed',
  }
  return (
    <div className="op-evidence-page">
      <PageHeader
        eyebrow={text.field.eyebrow}
        title={text.field.title}
        description={text.field.copy}
        actions={
          canUpdate ? (
            <>
              <button
                className="op-button secondary"
                title={text.field.incident}
                onClick={(event) => {
                  setTrigger(event.currentTarget)
                  setIncidentOpen(true)
                }}
              >
                + {text.field.incident}
              </button>
              <button
                className="op-button primary"
                title={text.field.report}
                onClick={(event) => {
                  setTrigger(event.currentTarget)
                  setReportOpen(true)
                }}
              >
                + {text.field.report}
              </button>
            </>
          ) : undefined
        }
      />
      <RoleContext
        label={text.field.roleMode}
        role={session.role}
        description={text.field.roleHelp[session.role]}
        enabled={canUpdate}
        enabledLabel={text.field.editable}
        readOnlyLabel={text.field.readonly}
      />
      <section className="op-register-metrics">
        <article>
          <span>{text.field.crew}</span>
          <strong>{formatNumber(crew, language)}</strong>
        </article>
        <article>
          <span>{text.field.today}</span>
          <strong>{reports.data?.filter((item) => item.date === '2026-07-12').length ?? 0}</strong>
        </article>
        <article className="is-warning">
          <span>{text.field.open}</span>
          <strong>{openIncidents.length}</strong>
        </article>
        <article>
          <span>{text.field.progress}</span>
          <strong>64%</strong>
        </article>
      </section>
      <div className="op-field-grid">
        <section className="op-data-panel">
          <header>
            <h2>{text.field.reports}</h2>
            <span>{reports.data?.length ?? 0}</span>
          </header>
          <div className="op-field-report-list">
            {(reports.data ?? []).map((item) => (
              <button
                key={item.id}
                title={`${text.field.view}: ${item.front}`}
                onClick={(event) => {
                  setTrigger(event.currentTarget)
                  setSelected(item)
                }}
              >
                <span>
                  <code>{item.id}</code>
                  <time>{formatDate(item.date, language)}</time>
                </span>
                <strong>{item.front}</strong>
                <small>
                  {item.supervisor} · {item.crew} {text.field.people}
                </small>
                <div>
                  <span>{weather[item.weather]}</span>
                  <b>{item.progress}%</b>
                </div>
              </button>
            ))}
            {!reports.loading && !reports.data?.length && (
              <p className="op-empty">{text.field.emptyReports}</p>
            )}
          </div>
        </section>
        <section className="op-data-panel">
          <header>
            <h2>{text.field.incidents}</h2>
            <span>{incidents.data?.length ?? 0}</span>
          </header>
          <div className="op-incident-list">
            {(incidents.data ?? []).map((item) => (
              <article key={item.id}>
                <header>
                  <code>{item.id}</code>
                  <span className={`op-status is-${item.severity}`}>
                    {severityLabel[item.severity]}
                  </span>
                </header>
                <strong>{item.title}</strong>
                <small>
                  {issueType[item.type]} · {item.owner} · {formatDate(item.openedAt, language)}
                </small>
                <footer>
                  <span className={`op-status is-${item.status}`}>
                    {incidentStatusLabel[item.status]}
                  </span>
                  <div className="op-row-actions">
                    <button
                      title={`${text.field.view}: ${item.title}`}
                      onClick={(event) => {
                        setTrigger(event.currentTarget)
                        setSelectedIncident(item)
                      }}
                    >
                      {text.field.view}
                    </button>
                    {canUpdate && (
                      <>
                        {item.status === 'open' && (
                          <button
                            title={`${text.field.contain}: ${item.title}`}
                            onClick={(event) => {
                              setTrigger(event.currentTarget)
                              setPendingStatus({ incident: item, status: 'contained' })
                            }}
                          >
                            {text.field.contain}
                          </button>
                        )}
                        {item.status !== 'closed' && (
                          <button
                            title={`${text.field.close}: ${item.title}`}
                            onClick={(event) => {
                              setTrigger(event.currentTarget)
                              setPendingStatus({ incident: item, status: 'closed' })
                            }}
                          >
                            {text.field.close}
                          </button>
                        )}
                        {item.status === 'closed' && (
                          <button
                            title={`${text.field.reopen}: ${item.title}`}
                            onClick={(event) => {
                              setTrigger(event.currentTarget)
                              setPendingStatus({ incident: item, status: 'open' })
                            }}
                          >
                            {text.field.reopen}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </footer>
              </article>
            ))}
            {!incidents.loading && !incidents.data?.length && (
              <p className="op-empty">{text.field.emptyIncidents}</p>
            )}
          </div>
        </section>
      </div>
      <FormModal
        open={reportOpen}
        eyebrow={text.field.eyebrow}
        title={text.field.reportTitle}
        submitLabel={text.field.saveReport}
        returnFocus={trigger}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
        wide
      >
        <div className="form-row">
          <label>
            {text.field.date}
            <input
              type="date"
              required
              value={report.date}
              onChange={(e) => setReport({ ...report, date: e.target.value })}
            />
          </label>
          <label>
            {text.field.supervisor}
            <input
              required
              value={report.supervisor}
              onChange={(e) => setReport({ ...report, supervisor: e.target.value })}
            />
          </label>
        </div>
        <label>
          {text.field.front}
          <input
            data-autofocus
            required
            value={report.front}
            onChange={(e) => setReport({ ...report, front: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            {text.field.people}
            <input
              type="number"
              min="1"
              required
              value={report.crew}
              onChange={(e) => setReport({ ...report, crew: Number(e.target.value) })}
            />
          </label>
          <label>
            {text.field.progress}
            <input
              type="number"
              min="0"
              max="100"
              required
              value={report.progress}
              onChange={(e) => setReport({ ...report, progress: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          {text.field.weather}
          <select
            value={report.weather}
            onChange={(e) =>
              setReport({ ...report, weather: e.target.value as FieldReportInput['weather'] })
            }
          >
            <option value="clear">{weather.clear}</option>
            <option value="rain">{weather.rain}</option>
            <option value="wind">{weather.wind}</option>
          </select>
        </label>
        <label>
          {text.field.note}
          <textarea
            required
            value={report.note}
            onChange={(e) => setReport({ ...report, note: e.target.value })}
          />
        </label>
      </FormModal>
      <FormModal
        open={incidentOpen}
        eyebrow={text.field.eyebrow}
        title={text.field.incidentTitle}
        submitLabel={text.field.saveIncident}
        returnFocus={trigger}
        onClose={() => setIncidentOpen(false)}
        onSubmit={submitIncident}
      >
        <label>
          {text.field.titleField}
          <input
            data-autofocus
            required
            value={incident.title}
            onChange={(e) => setIncident({ ...incident, title: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            {text.field.type}
            <select
              value={incident.type}
              onChange={(e) =>
                setIncident({ ...incident, type: e.target.value as IncidentInput['type'] })
              }
            >
              {Object.entries(issueType).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {text.field.severity}
            <select
              value={incident.severity}
              onChange={(e) =>
                setIncident({ ...incident, severity: e.target.value as IncidentInput['severity'] })
              }
            >
              <option value="low">{severityLabel.low}</option>
              <option value="medium">{severityLabel.medium}</option>
              <option value="high">{severityLabel.high}</option>
            </select>
          </label>
        </div>
        <label>
          {text.field.owner}
          <input
            required
            value={incident.owner}
            onChange={(e) => setIncident({ ...incident, owner: e.target.value })}
          />
        </label>
      </FormModal>
      <DetailModal
        open={Boolean(selected)}
        eyebrow={text.field.detail}
        title={selected ? `${selected.id} · ${selected.front}` : ''}
        returnFocus={trigger}
        onClose={() => setSelected(null)}
        wide
      >
        {selected && (
          <dl className="op-detail-grid">
            <div>
              <dt>{text.field.date}</dt>
              <dd>{formatDate(selected.date, language)}</dd>
            </div>
            <div>
              <dt>{text.field.supervisor}</dt>
              <dd>{selected.supervisor}</dd>
            </div>
            <div>
              <dt>{text.field.people}</dt>
              <dd>{selected.crew}</dd>
            </div>
            <div>
              <dt>{text.field.weather}</dt>
              <dd>{weather[selected.weather]}</dd>
            </div>
            <div className="is-wide">
              <dt>{text.field.note}</dt>
              <dd>{selected.note}</dd>
            </div>
          </dl>
        )}
      </DetailModal>
      <DetailModal
        open={Boolean(selectedIncident)}
        eyebrow={text.field.incidentDetail}
        title={selectedIncident ? `${selectedIncident.id} · ${selectedIncident.title}` : ''}
        returnFocus={trigger}
        onClose={() => setSelectedIncident(null)}
      >
        {selectedIncident && (
          <dl className="op-detail-grid">
            <div>
              <dt>{text.field.type}</dt>
              <dd>{issueType[selectedIncident.type]}</dd>
            </div>
            <div>
              <dt>{text.field.severity}</dt>
              <dd>{severityLabel[selectedIncident.severity]}</dd>
            </div>
            <div>
              <dt>{text.field.owner}</dt>
              <dd>{selectedIncident.owner}</dd>
            </div>
            <div>
              <dt>{text.field.date}</dt>
              <dd>{formatDate(selectedIncident.openedAt, language)}</dd>
            </div>
            <div className="is-wide">
              <dt>{text.field.status}</dt>
              <dd>
                <span className={`op-status is-${selectedIncident.status}`}>
                  {incidentStatusLabel[selectedIncident.status]}
                </span>
              </dd>
            </div>
          </dl>
        )}
      </DetailModal>
      <FormModal
        open={Boolean(pendingStatus)}
        eyebrow={text.field.incidents}
        title={text.field.confirmStatus}
        submitLabel={text.field.applyStatus}
        returnFocus={trigger}
        onClose={() => setPendingStatus(null)}
        onSubmit={changeStatus}
      >
        {pendingStatus && (
          <div className="op-status-confirmation">
            <span className={`op-status is-${pendingStatus.incident.severity}`}>
              {severityLabel[pendingStatus.incident.severity]}
            </span>
            <strong>{pendingStatus.incident.title}</strong>
            <p>{text.field.confirmStatusCopy}</p>
            <div>
              <small>{incidentStatusLabel[pendingStatus.incident.status]}</small>
              <b aria-hidden="true">→</b>
              <small>{incidentStatusLabel[pendingStatus.status]}</small>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
