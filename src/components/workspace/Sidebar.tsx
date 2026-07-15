import { useTranslation } from 'react-i18next'
import { Brand } from '../../shared/Brand'
import type { ExperienceMode } from '../../shared/experience'
import { isNavigationVisible, nav, type View } from '../../shared/project'
import { useCapability } from '../../shared/useServices'

interface SidebarProps {
  view: View
  collapsed: boolean
  mobileViewport: boolean
  mobileOpen: boolean
  experienceMode: ExperienceMode
  onCollapse(): void
  onNavigate(view: View): void
  onHelp(): void
  onLogout(): void
}

export function Sidebar({
  view,
  collapsed,
  mobileViewport,
  mobileOpen,
  experienceMode,
  onCollapse,
  onNavigate,
  onHelp,
  onLogout,
}: SidebarProps) {
  const { t } = useTranslation()
  const canAdmin = useCapability('admin:manage')
  const visibleNav = nav.filter(
    (item) =>
      isNavigationVisible(item.id) &&
      (experienceMode === 'presentation' || item.id !== 'recorrido') &&
      (item.id !== 'roles' || canAdmin),
  )

  return (
    <aside
      id="primary-sidebar"
      aria-hidden={mobileViewport && !mobileOpen ? true : undefined}
      inert={mobileViewport && !mobileOpen}
    >
      <div className="side-brand">
        <Brand compact />
        <button aria-label={t(collapsed ? 'shell.expand' : 'shell.collapse')} onClick={onCollapse}>
          ‹
        </button>
      </div>
      <div className="project-switcher">
        <span>
          {t(experienceMode === 'natural' ? 'shell.activeProject' : 'experience.presentationCase')}
        </span>
        <button onClick={() => onNavigate('proyectos')}>
          <i>BC</i>
          <b>Interconexión El Encino - La Laguna</b>
          <em>⌄</em>
        </button>
      </div>
      <nav aria-label={t('shell.primaryNavigation')}>
        {visibleNav.map((item) => (
          <div key={item.id}>
            {item.stage && <span className="nav-stage">{t(`groups.${item.stage}`)}</span>}
            <button
              className={view === item.id ? 'active' : ''}
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <i>{item.icon}</i>
              <span>{t(`nav.${item.id}`)}</span>
              {view === item.id && <b />}
            </button>
            {item.id === 'cierre' && <div className="nav-divider" />}
          </div>
        ))}
      </nav>
      <div className="side-footer">
        <button onClick={onHelp}>
          <i>?</i>
          <span>{t('shell.help')}</span>
        </button>
        <button onClick={onLogout}>
          <i>↗</i>
          <span>{t('shell.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
