import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Brand } from '../../shared/Brand'
import type { Capability, Role } from '../../shared/contracts'
import { DetailModal } from '../../shared/DetailModal'
import { useSession } from '../../shared/useServices'
import {
  getOperationalLanguage,
  operationalCopy,
  operationalNavigation,
  operationalNavGroups,
  type OperationalView,
} from './navigation'
import '../../styles/operations-shell.css'

interface OperationalShellProps {
  readonly currentView: OperationalView
  readonly onNavigate: (view: OperationalView) => void
  readonly role: Role
  readonly onRoleChange: (role: Role) => void
  readonly onReturnToPresentation: () => void
  readonly onLogout: () => void
  readonly children: ReactNode
}

const roleOptions: readonly Role[] = ['Project Manager', 'Supervisor', 'Administrador']

const viewCapabilities: Partial<Record<OperationalView, Capability>> = {
  planning: 'planning:write',
  schedule: 'planning:write',
  costs: 'costs:write',
  risks: 'risks:write',
  changes: 'changes:decide',
  documents: 'planning:write',
  field: 'field:update',
}

function WorkAreaIcon({ name }: { name: OperationalView }) {
  const paths: Record<OperationalView, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 17.5h7M17.5 14v7" />
      </>
    ),
    planning: (
      <>
        <path d="M9 5h11M9 12h11M9 19h11" />
        <path d="m3.5 5 1.3 1.3L7 3.8M3.5 12l1.3 1.3L7 10.8M3.5 19l1.3 1.3L7 17.8" />
      </>
    ),
    schedule: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h3M13 14h3M8 17h3" />
      </>
    ),
    costs: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 15h3M14 15h3M3 9h18M8 5V3M16 5V3" />
      </>
    ),
    risks: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v5M12 17.5v.2" />
      </>
    ),
    changes: (
      <>
        <path d="M20 7h-8a5 5 0 0 0-5 5v1" />
        <path d="m17 4 3 3-3 3M4 17h8a5 5 0 0 0 5-5v-1" />
        <path d="m7 20-3-3 3-3" />
      </>
    ),
    documents: (
      <>
        <path d="M6 2h8l5 5v15H6z" />
        <path d="M14 2v6h5M9 13h6M9 17h6" />
      </>
    ),
    field: (
      <>
        <path d="M4 21V9l8-6 8 6v12" />
        <path d="M8 21v-7h8v7M2 21h20M12 3v6" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {paths[name]}
    </svg>
  )
}

export function OperationalShell({
  currentView,
  onNavigate,
  role,
  onRoleChange,
  onReturnToPresentation,
  onLogout,
  children,
}: OperationalShellProps) {
  const { i18n } = useTranslation()
  const session = useSession()
  const language = getOperationalLanguage(i18n.resolvedLanguage)
  const copy = operationalCopy[language]
  const [mobileViewport, setMobileViewport] = useState(
    () => window.matchMedia('(max-width: 860px)').matches,
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleGuideOpen, setRoleGuideOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const roleGuideButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)')
    const updateViewport = () => {
      setMobileViewport(media.matches)
      if (!media.matches) setMenuOpen(false)
    }
    updateViewport()
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    const drawer = drawerRef.current
    if (drawer) drawer.inert = mobileViewport && !menuOpen
  }, [menuOpen, mobileViewport])

  useEffect(() => {
    if (!menuOpen) return

    const content = contentRef.current
    const previousOverflow = document.body.style.overflow
    if (content) content.inert = true
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
    }, 0)

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      window.setTimeout(() => menuButtonRef.current?.focus(), 0)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
      if (content) content.inert = false
    }
  }, [menuOpen])

  const navigate = (view: OperationalView) => {
    onNavigate(view)
    setMenuOpen(false)
    if (mobileViewport) window.setTimeout(() => menuButtonRef.current?.focus(), 0)
  }

  const closeDrawer = () => {
    setMenuOpen(false)
    window.setTimeout(() => menuButtonRef.current?.focus(), 0)
  }

  const trapDrawerFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!menuOpen || event.key !== 'Tab') return
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const toggleLanguage = () => i18n.changeLanguage(language === 'es' ? 'en' : 'es')

  return (
    <div className={`ops-shell ${menuOpen ? 'ops-shell--drawer-open' : ''}`}>
      {menuOpen && (
        <button
          type="button"
          className="ops-backdrop"
          aria-label={copy.shell.closeMenu}
          onClick={closeDrawer}
        />
      )}

      <aside
        ref={drawerRef}
        id="operational-navigation"
        className="ops-sidebar"
        aria-label={copy.shell.navigation}
        aria-hidden={mobileViewport && !menuOpen}
        onKeyDown={trapDrawerFocus}
      >
        <div className="ops-brandbar">
          <Brand compact />
          <span>{copy.shell.environment}</span>
          <button
            type="button"
            className="ops-sidebar-close"
            aria-label={copy.shell.closeMenu}
            onClick={closeDrawer}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="ops-project-card">
          <span className="ops-project-card__label">{copy.shell.project}</span>
          <strong>{copy.shell.projectName}</strong>
          <small>{copy.shell.projectCode}</small>
          <div className="ops-project-card__status">
            <span>{copy.shell.active}</span>
            <b>{copy.shell.progress}</b>
          </div>
          <div className="ops-project-card__progress" aria-hidden="true">
            <i />
          </div>
        </div>

        <nav className="ops-navigation">
          {operationalNavGroups.map((group) => (
            <section key={group} aria-labelledby={`ops-nav-${group}`}>
              <h2 id={`ops-nav-${group}`}>{copy.groups[group]}</h2>
              {operationalNavigation
                .filter((item) => item.group === group)
                .map((item) => {
                  const capability = viewCapabilities[item.id]
                  const canOperate = !capability || session.capabilities.includes(capability)
                  const access = canOperate ? copy.shell.editAccess : copy.shell.readAccess
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={currentView === item.id ? 'is-active' : undefined}
                      aria-current={currentView === item.id ? 'page' : undefined}
                      title={`${copy.viewDescriptions[item.id]} · ${access}`}
                      onClick={() => navigate(item.id)}
                    >
                      <span className="ops-nav-icon">
                        <WorkAreaIcon name={item.icon} />
                      </span>
                      <span className="ops-nav-copy">
                        <span>{copy.views[item.id]}</span>
                        <small
                          className={canOperate ? 'can-operate' : undefined}
                          aria-hidden="true"
                        >
                          {access}
                        </small>
                      </span>
                      {currentView === item.id && <i aria-hidden="true" />}
                    </button>
                  )
                })}
            </section>
          ))}
        </nav>

        <div className="ops-sidebar-footer">
          <button type="button" onClick={onReturnToPresentation}>
            <span aria-hidden="true">←</span>
            {copy.shell.return}
          </button>
          <button type="button" onClick={onLogout}>
            <span aria-hidden="true">↗</span>
            {copy.shell.logout}
          </button>
        </div>
      </aside>

      <div ref={contentRef} className="ops-workspace">
        <header className="ops-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="ops-menu-button"
            aria-label={menuOpen ? copy.shell.closeMenu : copy.shell.openMenu}
            aria-expanded={menuOpen}
            aria-controls="operational-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <div className="ops-current-area">
            <small>{copy.shell.currentWorkspace}</small>
            <h1>{copy.views[currentView]}</h1>
          </div>

          <div className="ops-project-context" aria-label={copy.shell.project}>
            <span className="ops-live-dot" aria-hidden="true" />
            <div>
              <b>{copy.shell.projectCode}</b>
              <small>{copy.shell.active}</small>
            </div>
          </div>

          <div className="ops-cutoff">
            <small>{copy.shell.cutoff}</small>
            <strong>{copy.shell.cutoffDate}</strong>
          </div>

          <button
            type="button"
            className="ops-return"
            aria-label={copy.shell.return}
            onClick={onReturnToPresentation}
          >
            <b aria-hidden="true">←</b>
            <span>{copy.shell.return}</span>
          </button>

          <button
            type="button"
            className="ops-language"
            aria-label={copy.shell.language}
            onClick={toggleLanguage}
          >
            {copy.shell.languageShort}
          </button>

          <button
            ref={roleGuideButtonRef}
            type="button"
            className="ops-role-guide-button"
            title={copy.shell.roleGuide}
            aria-label={copy.shell.roleGuide}
            onClick={() => setRoleGuideOpen(true)}
          >
            ?
          </button>

          <label className="ops-role-selector">
            <span className="ops-avatar" aria-hidden="true">
              {session.initials}
            </span>
            <span className="ops-role-mobile" aria-hidden="true">
              {role === 'Project Manager' ? 'PM' : role === 'Supervisor' ? 'SUP' : 'ADM'}
            </span>
            <span className="ops-role-selector__copy">
              <small>{copy.shell.demoMode}</small>
              <select
                value={role}
                aria-label={`${copy.shell.demoMode}: ${copy.shell.role}`}
                onChange={(event) => onRoleChange(event.target.value as Role)}
              >
                {roleOptions.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {copy.roles[roleOption]}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </header>

        <div className="ops-content" key={`${currentView}-${language}`}>
          {children}
        </div>
      </div>

      <DetailModal
        open={roleGuideOpen}
        eyebrow={copy.shell.roleGuideEyebrow}
        title={`${copy.shell.roleGuideTitle}: ${copy.roles[role]}`}
        returnFocus={roleGuideButtonRef.current}
        onClose={() => setRoleGuideOpen(false)}
        wide
      >
        <div className="ops-role-guide">
          <p>{copy.roleDescriptions[role]}</p>
          <p>{copy.shell.roleGuideCopy}</p>
          <div className="ops-role-guide__table" role="table">
            <div role="row" className="ops-role-guide__header">
              <span role="columnheader">{copy.shell.capability}</span>
              <span role="columnheader">{copy.shell.access}</span>
            </div>
            {operationalNavigation.map((item) => {
              const capability = viewCapabilities[item.id]
              const canOperate = !capability || session.capabilities.includes(capability)
              return (
                <div role="row" key={item.id}>
                  <span role="cell">{copy.views[item.id]}</span>
                  <strong role="cell" className={canOperate ? 'can-operate' : undefined}>
                    {canOperate ? copy.shell.editAccess : copy.shell.readAccess}
                  </strong>
                </div>
              )
            })}
          </div>
        </div>
      </DetailModal>
    </div>
  )
}
