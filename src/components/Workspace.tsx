import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dashboard } from '../features/dashboard/Dashboard'
import { GlossaryView } from '../features/glossary/GlossaryView'
import { CommandCenter } from '../features/pmo/CommandCenter'
import { PortfolioView } from '../features/portfolio/PortfolioView'
import { ProjectRouter } from '../features/project/ProjectRouter'
import { UseCaseView } from '../features/usecase/UseCaseView'
import type { Capability } from '../shared/contracts'
import { type Role, type View } from '../shared/project'
import { useCapability, useSession } from '../shared/useServices'
import { AccessDenied } from './workspace/AccessDenied'
import { Overlays, type Panel } from './workspace/Overlays'
import { Sidebar } from './workspace/Sidebar'
import { Topbar } from './workspace/Topbar'
import type { ExperienceMode } from '../shared/experience'

const createCapabilities: Partial<Record<View, Capability>> = {
  planificacion: 'planning:write',
  cronograma: 'costs:write',
  riesgos: 'risks:write',
  control: 'field:update',
  cierre: 'field:update',
  roles: 'admin:manage',
}

export function Workspace({
  role,
  experienceMode,
  onExperienceModeChange,
  onRoleChange,
  onLogout,
}: {
  role: Role
  experienceMode: ExperienceMode
  onExperienceModeChange: (mode: ExperienceMode) => void
  onRoleChange: (role: Role) => void
  onLogout: () => void
}) {
  const { t, i18n } = useTranslation()
  const session = useSession()
  const canManageAdmin = useCapability('admin:manage')
  const [view, setView] = useState<View>('proyectos')
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileViewport, setMobileViewport] = useState(
    () => window.matchMedia('(max-width: 760px)').matches,
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [panel, setPanel] = useState<Panel>(null)
  const [query, setQuery] = useState('')
  const [denied, setDenied] = useState(false)
  const canAdd =
    !createCapabilities[view] || session.capabilities.includes(createCapabilities[view]!)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const syncViewport = () => {
      setMobileViewport(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    syncViewport()
    media.addEventListener('change', syncViewport)
    return () => media.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPanel('search')
      }
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [view, denied])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }
  const navigate = (nextView: View) => {
    setMobileMenuOpen(false)
    if (nextView === 'roles' && !canManageAdmin) {
      setDenied(true)
      return
    }
    setDenied(false)
    setView(nextView)
  }
  const changeExperienceMode = (nextMode: ExperienceMode) => {
    setMobileMenuOpen(false)
    setPanel(null)
    setDenied(false)
    setView(nextMode === 'natural' ? 'dashboard' : 'proyectos')
    onExperienceModeChange(nextMode)
  }
  const toggleLanguage = () => i18n.changeLanguage(i18n.resolvedLanguage === 'es' ? 'en' : 'es')

  return (
    <div
      className={`workspace ${experienceMode === 'natural' ? 'is-natural-experience' : 'is-presentation-experience'} ${desktopCollapsed ? 'is-desktop-collapsed' : ''} ${mobileMenuOpen ? 'is-mobile-menu-open' : ''}`}
      data-experience-mode={experienceMode}
    >
      <div data-app-background className="workspace-background">
        <Sidebar
          view={view}
          collapsed={desktopCollapsed}
          mobileViewport={mobileViewport}
          mobileOpen={mobileMenuOpen}
          experienceMode={experienceMode}
          onCollapse={() => setDesktopCollapsed((current) => !current)}
          onNavigate={navigate}
          onHelp={() => setPanel('help')}
          onLogout={onLogout}
        />
        <main className="main-area">
          <Topbar
            view={view}
            mobileMenuOpen={mobileMenuOpen}
            role={role}
            experienceMode={experienceMode}
            onMobileMenu={() => setMobileMenuOpen((current) => !current)}
            onSearch={() => setPanel('search')}
            onNotifications={() => setPanel('notifications')}
            onLanguage={toggleLanguage}
            onExperienceModeChange={changeExperienceMode}
            onRoleChange={onRoleChange}
          />
          <div className="content" key={`${experienceMode}-${view}-${i18n.resolvedLanguage}`}>
            {denied ? (
              <AccessDenied
                onBack={() => {
                  setDenied(false)
                  setView('dashboard')
                }}
              />
            ) : view === 'proyectos' ? (
              <PortfolioView onNavigate={navigate} />
            ) : view === 'dashboard' ? (
              <Dashboard onNavigate={navigate} notify={notify} />
            ) : view === 'recorrido' ? (
              <UseCaseView onNavigate={navigate} />
            ) : view === 'glosario' ? (
              <GlossaryView />
            ) : view === 'pmo' ? (
              <CommandCenter role={role} notify={notify} />
            ) : (
              <ProjectRouter
                view={view}
                role={role}
                notify={notify}
                onAdd={canAdd ? () => setPanel('entry') : undefined}
              />
            )}
          </div>
        </main>
      </div>
      {mobileMenuOpen && (
        <button
          className="mobile-backdrop"
          aria-label={t('shell.closeMenu')}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <Overlays
        panel={panel}
        query={query}
        view={view}
        onClose={() => setPanel(null)}
        onQuery={setQuery}
        onNavigate={navigate}
        onNotify={notify}
      />
      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  )
}
