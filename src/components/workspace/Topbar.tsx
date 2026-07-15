import { useTranslation } from 'react-i18next'
import { NATURAL_MODE_CUTOFF, type ExperienceMode } from '../../shared/experience'
import { formatDate, localeFor } from '../../shared/format'
import type { Role, View } from '../../shared/project'
import { useSession } from '../../shared/useServices'

interface TopbarProps {
  view: View
  mobileMenuOpen: boolean
  role: Role
  experienceMode: ExperienceMode
  onMobileMenu(): void
  onSearch(): void
  onNotifications(): void
  onLanguage(): void
  onExperienceModeChange(mode: ExperienceMode): void
  onRoleChange(role: Role): void
}

export function Topbar({
  view,
  mobileMenuOpen,
  role,
  experienceMode,
  onMobileMenu,
  onSearch,
  onNotifications,
  onLanguage,
  onExperienceModeChange,
  onRoleChange,
}: TopbarProps) {
  const { t, i18n } = useTranslation()
  const session = useSession()
  const language = i18n.resolvedLanguage ?? 'es'
  const cutoffLabel = formatDate(NATURAL_MODE_CUTOFF, language).toLocaleUpperCase(
    localeFor(language),
  )
  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        aria-label={t(mobileMenuOpen ? 'shell.closeMenu' : 'shell.expand')}
        aria-expanded={mobileMenuOpen}
        aria-controls="primary-sidebar"
        onClick={onMobileMenu}
      >
        ☰
      </button>
      <div className="topbar-context">
        <span>{t('shell.portfolio')} / BCY-PMO-2026-014</span>
        <h1>{t(`nav.${view}`)}</h1>
      </div>
      <div className="experience-controls">
        {experienceMode === 'natural' && (
          <span className="operational-cutoff">
            <small>{t('experience.operationalCutoff')}</small>
            <b>{cutoffLabel}</b>
          </span>
        )}
        <button
          type="button"
          className={`experience-switch experience-switch--${experienceMode}`}
          onClick={() =>
            onExperienceModeChange(experienceMode === 'presentation' ? 'natural' : 'presentation')
          }
        >
          {t(
            experienceMode === 'presentation'
              ? 'experience.goNatural'
              : 'experience.returnToPresentation',
          )}
        </button>
      </div>
      <div className="top-actions">
        <button className="search" onClick={onSearch}>
          <span>⌕</span> {t('shell.search')} <kbd>⌘ K</kbd>
        </button>
        <button className="language" aria-label={t('language')} onClick={onLanguage}>
          {t('language')}
        </button>
        <button className="bell" aria-label={t('shell.notifications')} onClick={onNotifications}>
          ♢<b>3</b>
        </button>
        <label className="profile">
          <span>{session.initials}</span>
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value as Role)}
            aria-label={`${t('common.demoMode')}: ${t('content.role')}`}
          >
            <option value="Project Manager">{t('experience.roles.projectManager')}</option>
            <option value="Supervisor">{t('experience.roles.supervisor')}</option>
            <option value="Administrador">{t('experience.roles.administrator')}</option>
          </select>
          <small>{session.isDemo ? t('common.demoMode') : role}</small>
        </label>
      </div>
    </header>
  )
}
