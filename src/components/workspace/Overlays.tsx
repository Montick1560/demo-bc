import { useRef, type FormEvent, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { isNavigationVisible, nav, type View } from '../../shared/project'
import { useCapability } from '../../shared/useServices'
import { useDialog } from '../../shared/useDialog'

export type Panel = 'search' | 'notifications' | 'entry' | 'help' | null

interface OverlaysProps {
  panel: Panel
  query: string
  view: View
  onClose(): void
  onQuery(query: string): void
  onNavigate(view: View): void
  onNotify(message: string): void
}

export function Overlays({
  panel,
  query,
  view,
  onClose,
  onQuery,
  onNavigate,
  onNotify,
}: OverlaysProps) {
  const { t } = useTranslation()
  const canManageAdmin = useCapability('admin:manage')
  const dialogRef = useRef<HTMLElement>(null)
  useDialog(panel !== null, dialogRef, onClose)
  if (!panel) return null
  const results = nav.filter(
    (item) =>
      isNavigationVisible(item.id) &&
      (item.id !== 'roles' || canManageAdmin) &&
      t(`nav.${item.id}`).toLowerCase().includes(query.toLowerCase()),
  )
  const entryTitle = entryTitles[view] ?? t('shell.newEntry')
  const saveEntry = (event: FormEvent) => {
    event.preventDefault()
    onClose()
    onNotify(t('form.saved', { view: t(`nav.${view}`) }))
  }

  return (
    <div
      className="overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      {panel === 'search' && (
        <section
          ref={dialogRef}
          className="command-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t('shell.searchDialog')}
        >
          <label>
            <span>⌕</span>
            <input
              autoFocus
              data-autofocus
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={`${t('shell.search')}…`}
            />
            <kbd>ESC</kbd>
          </label>
          <small>{t('shell.primaryNavigation')}</small>
          <div>
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onQuery('')
                  onClose()
                }}
              >
                <i>{item.icon}</i>
                <span>
                  <b>{t(`nav.${item.id}`)}</b>
                  <small>{item.stage ? t(`groups.${item.stage}`) : t('shell.portfolio')}</small>
                </span>
                <em>↵</em>
              </button>
            ))}
          </div>
          {!results.length && <p>{t('common.noResults')}</p>}
        </section>
      )}
      {panel === 'notifications' && (
        <section
          ref={dialogRef}
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t('shell.notifications')}
        >
          <header>
            <div>
              <span className="eyebrow">{t('shell.activityCenter')}</span>
              <h2>{t('shell.notifications')}</h2>
            </div>
            <button aria-label={t('common.close')} onClick={onClose}>
              ×
            </button>
          </header>
          <div className="notification new">
            <i>✓</i>
            <span>
              <b>ACTA-BCY-014-2026</b>
              <small>{t('shell.notifAcceptance')}</small>
              <em>09 oct</em>
            </span>
          </div>
          <div className="notification new">
            <i>✓</i>
            <span>
              <b>{t('shell.notifEvaluationTitle')}</b>
              <small>{t('shell.notifEvaluation')}</small>
              <em>09 oct</em>
            </span>
          </div>
          <div className="notification">
            <i>✓</i>
            <span>
              <b>REP-39</b>
              <small>{t('shell.notifReport')}</small>
              <em>27 sep</em>
            </span>
          </div>
          <button className="secondary" onClick={() => onNotify(t('shell.notificationsRead'))}>
            {t('shell.markRead')}
          </button>
        </section>
      )}
      {panel === 'entry' && (
        <form
          ref={dialogRef as Ref<HTMLFormElement>}
          className="entry-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t('shell.newEntry')}
          onSubmit={saveEntry}
        >
          <header>
            <div>
              <span className="eyebrow">{t(`nav.${view}`).toUpperCase()}</span>
              <h2>{entryTitle}</h2>
            </div>
            <button type="button" aria-label={t('common.close')} onClick={onClose}>
              ×
            </button>
          </header>
          <label>
            {t('form.title')}
            <input
              autoFocus
              data-autofocus
              name="title"
              placeholder={t('form.describeEntry')}
              required
            />
          </label>
          <ModuleEntryFields view={view} />
          <div className="form-row">
            <label>
              {t('form.owner')}
              <select defaultValue="Valeria Soto">
                <option>Valeria Soto</option>
                <option>Rafael Méndez</option>
                <option>Lucía Torres</option>
              </select>
            </label>
            <label>
              {t('form.dueDate')}
              <input type="date" defaultValue="2026-10-09" />
            </label>
          </div>
          <label>
            {t('form.priority')}
            <select defaultValue="medium">
              <option value="high">{t('common.high')}</option>
              <option value="medium">{t('common.medium')}</option>
              <option value="low">{t('common.low')}</option>
            </select>
          </label>
          <footer>
            <button type="button" className="secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button className="primary">Guardar en demo</button>
          </footer>
        </form>
      )}
      {panel === 'help' && (
        <section
          ref={dialogRef}
          className="entry-modal help-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Ayuda y recursos"
        >
          <header>
            <div>
              <span className="eyebrow">CENTRO DE AYUDA</span>
              <h2>Ayuda y recursos</h2>
            </div>
            <button type="button" aria-label={t('common.close')} onClick={onClose}>
              ×
            </button>
          </header>
          <p>Consulta conceptos del proyecto o recorre el caso práctico paso a paso.</p>
          <div className="help-options">
            <button
              data-autofocus
              onClick={() => {
                onNavigate('glosario')
                onClose()
              }}
            >
              <i>Aa</i>
              <span>
                <b>Abrir glosario</b>
                <small>PMI, EVM, obra, riesgos y calidad</small>
              </span>
            </button>
            <button
              onClick={() => {
                onNavigate('recorrido')
                onClose()
              }}
            >
              <i>▷</i>
              <span>
                <b>Ver recorrido guiado</b>
                <small>Historia y decisiones del caso práctico</small>
              </span>
            </button>
          </div>
          <footer>
            <button className="secondary" type="button" onClick={onClose}>
              {t('common.close')}
            </button>
          </footer>
        </section>
      )}
    </div>
  )
}

const entryTitles: Partial<Record<View, string>> = {
  inicio: 'Registrar interesado',
  planificacion: 'Registrar entregable del plan',
  cronograma: 'Registrar actividad',
  riesgos: 'Registrar riesgo',
  control: 'Registrar reporte semanal',
  cierre: 'Registrar entregable de cierre',
  roles: 'Agregar integrante',
  proyectos: 'Registrar proyecto',
}

function ModuleEntryFields({ view }: { view: View }) {
  if (view === 'inicio')
    return (
      <div className="form-row">
        <label>
          Tipo de interesado
          <select defaultValue="client">
            <option value="client">Cliente</option>
            <option value="authority">Autoridad</option>
            <option value="community">Comunidad</option>
            <option value="supplier">Proveedor</option>
          </select>
        </label>
        <label>
          Poder / interés
          <select defaultValue="high-high">
            <option value="high-high">Alto / Alto</option>
            <option value="high-medium">Alto / Medio</option>
            <option value="medium-high">Medio / Alto</option>
          </select>
        </label>
      </div>
    )
  if (view === 'planificacion')
    return (
      <>
        <div className="form-row">
          <label>
            Tipo de entregable
            <select defaultValue="scope">
              <option value="scope">Alcance / WBS</option>
              <option value="quality">Calidad</option>
              <option value="procurement">Adquisición</option>
              <option value="communication">Comunicación</option>
            </select>
          </label>
          <label>
            Código WBS
            <input placeholder="Ej. 1.5" />
          </label>
        </div>
        <label>
          Criterio de aceptación
          <textarea placeholder="Condición verificable para aceptar el entregable" />
        </label>
      </>
    )
  if (view === 'cronograma')
    return (
      <>
        <div className="form-row">
          <label>
            Fecha de inicio
            <input type="date" defaultValue="2026-10-12" />
          </label>
          <label>
            Fecha de término
            <input type="date" defaultValue="2026-10-16" />
          </label>
        </div>
        <div className="form-row">
          <label>
            Predecesora
            <input placeholder="Ej. SCH-07" />
          </label>
          <label>
            Avance inicial
            <input type="number" min="0" max="100" defaultValue="0" />
          </label>
        </div>
      </>
    )
  if (view === 'riesgos')
    return (
      <>
        <div className="form-row">
          <label>
            Categoría
            <select defaultValue="technical">
              <option value="technical">Técnico</option>
              <option value="environmental">Ambiental</option>
              <option value="financial">Financiero</option>
              <option value="regulatory">Normativo</option>
            </select>
          </label>
          <label>
            Probabilidad
            <select defaultValue="medium">
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </label>
        </div>
        <label>
          Respuesta y contingencia
          <textarea placeholder="Mitigación preventiva y acción si el riesgo ocurre" />
        </label>
      </>
    )
  if (view === 'control')
    return (
      <>
        <div className="form-row">
          <label>
            Semana
            <input type="number" min="1" max="53" defaultValue="40" />
          </label>
          <label>
            Avance reportado
            <input type="number" min="0" max="100" defaultValue="100" />
          </label>
        </div>
        <label>
          Resumen ejecutivo
          <textarea placeholder="Avances, desviaciones y decisiones requeridas" />
        </label>
      </>
    )
  if (view === 'cierre')
    return (
      <div className="form-row">
        <label>
          Tipo de entregable
          <select defaultValue="document">
            <option value="document">Documento</option>
            <option value="approval">Aprobación</option>
            <option value="knowledge">Lección aprendida</option>
          </select>
        </label>
        <label>
          Estado inicial
          <select defaultValue="pending">
            <option value="pending">Pendiente</option>
            <option value="active">En proceso</option>
            <option value="done">Listo</option>
          </select>
        </label>
      </div>
    )
  if (view === 'roles')
    return (
      <div className="form-row">
        <label>
          Correo corporativo
          <input type="email" placeholder="nombre@bcysa.com.mx" />
        </label>
        <label>
          Rol
          <select defaultValue="Supervisor">
            <option>Administrador</option>
            <option>Project Manager</option>
            <option>Supervisor</option>
          </select>
        </label>
      </div>
    )
  if (view === 'proyectos')
    return (
      <div className="form-row">
        <label>
          Código de proyecto
          <input placeholder="BCY-XXX-2026-000" />
        </label>
        <label>
          Estado
          <select defaultValue="on_hold">
            <option value="active">Activo</option>
            <option value="on_hold">En espera</option>
            <option value="completed">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
      </div>
    )
  return null
}
