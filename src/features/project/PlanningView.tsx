import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import type { ProjectDocument } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card, PageHead, Status } from '../../shared/ui'

export function PlanningView({ onAdd }: { onAdd?: () => void }) {
  const { t } = useTranslation()
  const services = useServices()
  const {
    data: items,
    loading,
    error,
    reload: reloadWbs,
  } = useServiceResource(() => services.project.listWorkBreakdown(), [services])
  const { data: documents, reload: reloadDocuments } = useServiceResource(
    () => services.project.listDocuments(),
    [services],
  )
  const { data: qualityMetrics } = useServiceResource(
    () => services.project.listQuality(),
    [services],
  )
  const [newItem, setNewItem] = useState('')
  const [revision, setRevision] = useState('Revisión 07 / Conforme a obra')
  const [formModal, setFormModal] = useState<'wbs' | 'documents' | null>(null)
  const [detailModal, setDetailModal] = useState<'baseline' | 'document' | 'history' | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null)
  const [modalTrigger, setModalTrigger] = useState<HTMLElement | null>(null)
  const addWbsItem = async (event: FormEvent) => {
    event.preventDefault()
    if (!newItem.trim()) return
    await services.project.addWorkBreakdown(newItem.trim())
    setNewItem('')
    setFormModal(null)
    await reloadWbs()
  }
  const uploadDocuments = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem('documents') as HTMLInputElement
    const files = [...(input.files ?? [])]
    for (const file of files)
      await services.project.addDocument({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      })
    setFormModal(null)
    await reloadDocuments()
  }
  const downloadDocumentMetadata = () => {
    if (!selectedDocument) return
    const content = `${selectedDocument.name}\n${selectedDocument.owner}\n${selectedDocument.uploadedAt}\n${selectedDocument.type}`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedDocument.id}-metadatos.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <PageHead
        page="planificacion"
        eyebrow="ETAPA 02 / ALCANCE"
        title="Plan maestro"
        copy="WBS, recursos, calidad, comunicaciones y adquisiciones en una sola vista."
        onAdd={onAdd}
      />
      <div className="planning-grid">
        <Card title={t('content.wbs')} className="wbs-card">
          <div className="wbs-root">1.0 Interconexión El Encino - La Laguna</div>
          <AsyncState loading={loading} error={error?.message} />
          {items && (
            <div className="wbs-branches">
              {items.map((item) => (
                <article key={item.id}>
                  <span>{item.id}</span>
                  <b>{item.name}</b>
                  <small>{item.progress}%</small>
                  <div className="progress">
                    <i style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          )}
          <button
            className="secondary wbs-modal-trigger"
            onClick={(event) => {
              setModalTrigger(event.currentTarget)
              setFormModal('wbs')
            }}
          >
            + Agregar paquete WBS
          </button>
        </Card>
        <Card title={t('content.resources')}>
          <div className="resource">
            <span>Cuadrilla obra civil / {t('planning.demobilized')}</span>
            <b>28 / 28</b>
            <div className="progress">
              <i style={{ width: '100%' }} />
            </div>
          </div>
          <div className="resource">
            <span>Grúa telescópica / {t('planning.released')}</span>
            <b>1 / 1</b>
            <div className="progress">
              <i style={{ width: '100%' }} />
            </div>
          </div>
          <div className="resource">
            <span>Acero estructural / {t('planning.supplied')}</span>
            <b>100%</b>
            <div className="progress gold">
              <i style={{ width: '100%' }} />
            </div>
          </div>
        </Card>
        <Card title={t('content.quality')}>
          <table>
            <thead>
              <tr>
                <th>{t('planning.criterion')}</th>
                <th>{t('planning.target')}</th>
                <th>{t('planning.result')}</th>
              </tr>
            </thead>
            <tbody>
              {qualityMetrics?.map((metric) => (
                <tr key={metric.id}>
                  <td>{metric.name}</td>
                  <td>{metric.target}</td>
                  <td>
                    <Status tone={metric.met ? 'green' : 'amber'}>{metric.result}</Status>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title={t('content.communications')}>
          <table>
            <thead>
              <tr>
                <th>{t('planning.audience')}</th>
                <th>{t('planning.channel')}</th>
                <th>{t('planning.frequency')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('content.client')}</td>
                <td>{t('planning.committee')}</td>
                <td>{t('planning.biweekly')}</td>
              </tr>
              <tr>
                <td>{t('planning.contractors')}</td>
                <td>{t('planning.siteMeeting')}</td>
                <td>{t('planning.daily')}</td>
              </tr>
              <tr>
                <td>{t('content.community')}</td>
                <td>{t('planning.newsletter')}</td>
                <td>{t('planning.monthly')}</td>
              </tr>
            </tbody>
          </table>
        </Card>
        <Card title={t('content.procurement')}>
          <div className="purchase">
            <i>18 JUL</i>
            <span>
              <b>Tableros eléctricos</b>
              <small>ElectroNova / OC-042</small>
            </span>
            <Status>{t('planning.delivered')}</Status>
          </div>
          <div className="purchase">
            <i>24 JUL</i>
            <span>
              <b>Sistema HVAC</b>
              <small>ClimaPro / OC-051</small>
            </span>
            <Status>{t('planning.settled')}</Status>
          </div>
        </Card>
        <Card title="Control del plan" className="planning-control">
          <label>
            Versión de trabajo
            <select value={revision} onChange={(event) => setRevision(event.target.value)}>
              <option>Revisión 07 / Conforme a obra</option>
              <option>Revisión 05 / Contractual</option>
              <option>Escenario de recuperación / +2 cuadrillas</option>
            </select>
          </label>
          <dl>
            <div>
              <dt>Alcance aprobado</dt>
              <dd>42 paquetes WBS / sin desviaciones</dd>
            </div>
            <div>
              <dt>Entregables críticos</dt>
              <dd>11 / 11 liberados</dd>
            </div>
            <div>
              <dt>Reserva de gestión</dt>
              <dd>$490,000 MXN sin ejercer al cierre</dd>
            </div>
          </dl>
          <button
            className="secondary"
            type="button"
            onClick={(event) => {
              setModalTrigger(event.currentTarget)
              setDetailModal('baseline')
            }}
          >
            Comparar con línea base
          </button>
        </Card>
        <Card
          title="Documentos del proyecto"
          className="documents-card wide"
          action={
            <button
              className="upload-button"
              onClick={(event) => {
                setModalTrigger(event.currentTarget)
                setFormModal('documents')
              }}
            >
              Subir archivos
            </button>
          }
        >
          <p>Los archivos se conservan únicamente durante esta sesión demostrativa.</p>
          <div className="document-list">
            {documents?.map((document) => (
              <article key={document.id}>
                <i>{document.name.split('.').pop()?.toUpperCase()}</i>
                <span>
                  <b>{document.name}</b>
                  <small>
                    {document.owner} / {(document.size / 1_000_000).toFixed(2)} MB /{' '}
                    {document.uploadedAt}
                  </small>
                </span>
                <button
                  type="button"
                  aria-label={`Ver ${document.name}`}
                  onClick={(event) => {
                    setModalTrigger(event.currentTarget)
                    setSelectedDocument(document)
                    setDetailModal('document')
                  }}
                >
                  •••
                </button>
              </article>
            ))}
          </div>
        </Card>
      </div>
      <FormModal
        open={formModal === 'wbs'}
        eyebrow="PLANIFICACIÓN / ALCANCE"
        title="Agregar paquete WBS"
        submitLabel="Agregar a WBS"
        returnFocus={modalTrigger}
        onClose={() => {
          setFormModal(null)
          setNewItem('')
        }}
        onSubmit={(event) => void addWbsItem(event)}
      >
        <label className="modal-field">
          <span>Actividad o paquete de trabajo</span>
          <input
            autoFocus
            data-autofocus
            required
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            placeholder="Ej. Pruebas de energización"
          />
        </label>
        <p className="modal-help">
          Se agregará como un nuevo elemento de primer nivel dentro del caso práctico.
        </p>
      </FormModal>
      <FormModal
        open={formModal === 'documents'}
        eyebrow="EXPEDIENTE DEL PROYECTO"
        title="Subir documentos"
        submitLabel="Incorporar archivos"
        returnFocus={modalTrigger}
        onClose={() => setFormModal(null)}
        onSubmit={(event) => void uploadDocuments(event)}
      >
        <label className="modal-field file-drop-field">
          <span>Selecciona uno o varios archivos</span>
          <input
            autoFocus
            data-autofocus
            required
            name="documents"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg"
          />
        </label>
        <p className="modal-help">
          Esta demo registra nombre, tipo y tamaño; no persiste el contenido del archivo.
        </p>
      </FormModal>
      <DetailModal
        open={detailModal === 'baseline'}
        eyebrow="CONTROL DEL PLAN"
        title="Comparación contra línea base"
        returnFocus={modalTrigger}
        onClose={() => setDetailModal(null)}
        wide
      >
        <div className="baseline-preview">
          <div>
            <span>Versión</span>
            <b>{revision}</b>
            <small>Línea base: Revisión 05 / Contractual</small>
          </div>
          <div>
            <span>Alcance</span>
            <b>42 paquetes</b>
            <small>Sin cambios pendientes</small>
          </div>
          <div>
            <span>Fecha final</span>
            <b>29 sep 2026</b>
            <small>0 días de variación</small>
          </div>
          <div>
            <span>Presupuesto</span>
            <b>$17.96 M MXN</b>
            <small>$490 mil favorables</small>
          </div>
        </div>
      </DetailModal>
      <DetailModal
        open={detailModal === 'document' && Boolean(selectedDocument)}
        eyebrow="EXPEDIENTE DEL PROYECTO"
        title={selectedDocument?.name ?? ''}
        returnFocus={modalTrigger}
        onClose={() => {
          setDetailModal(null)
          setSelectedDocument(null)
        }}
      >
        {selectedDocument && (
          <div className="document-preview">
            <i>{selectedDocument.name.split('.').pop()?.toUpperCase()}</i>
            <dl className="details">
              <div>
                <dt>Responsable</dt>
                <dd>{selectedDocument.owner}</dd>
              </div>
              <div>
                <dt>Fecha de carga</dt>
                <dd>{selectedDocument.uploadedAt}</dd>
              </div>
              <div>
                <dt>Tamaño</dt>
                <dd>{(selectedDocument.size / 1_000_000).toFixed(2)} MB</dd>
              </div>
              <div>
                <dt>Tipo MIME</dt>
                <dd>{selectedDocument.type}</dd>
              </div>
            </dl>
            <div className="modal-options">
              <button className="secondary" type="button" onClick={downloadDocumentMetadata}>
                Descargar metadatos
              </button>
              <button className="secondary" type="button" onClick={() => setDetailModal('history')}>
                Ver historial
              </button>
            </div>
          </div>
        )}
      </DetailModal>
      <DetailModal
        open={detailModal === 'history' && Boolean(selectedDocument)}
        eyebrow="CONTROL DOCUMENTAL"
        title={`Historial / ${selectedDocument?.name ?? ''}`}
        returnFocus={modalTrigger}
        onClose={() => {
          setDetailModal(null)
          setSelectedDocument(null)
        }}
      >
        <div className="document-history">
          <div>
            <i>03</i>
            <span>
              <b>Documento incorporado al expediente</b>
              <small>
                {selectedDocument?.uploadedAt} / {selectedDocument?.owner}
              </small>
            </span>
          </div>
          <div>
            <i>02</i>
            <span>
              <b>Metadatos validados</b>
              <small>Control documental / sin observaciones</small>
            </span>
          </div>
          <div>
            <i>01</i>
            <span>
              <b>Versión demostrativa creada</b>
              <small>Registro en memoria / LAB04</small>
            </span>
          </div>
        </div>
      </DetailModal>
    </>
  )
}
