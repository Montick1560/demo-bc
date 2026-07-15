import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Brand } from '../shared/Brand'
import type { Role } from '../shared/project'

const roles: Role[] = ['Project Manager', 'Supervisor', 'Administrador']

export function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const { t, i18n } = useTranslation()
  const [role, setRole] = useState<Role>('Project Manager')
  const [loading, setLoading] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => onLogin(role), 550)
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <Brand />
        <div className="story-copy">
          <span className="eyebrow light">{t('login.eyebrow')}</span>
          <h1>{t('login.title')}</h1>
          <p>{t('login.copy')}</p>
        </div>
        <div className="story-status">
          <i /> BCYSA / LAB04 <span>09 Oct 2026 / 00:18</span>
        </div>
      </section>
      <section className="login-panel">
        <button
          type="button"
          className="login-language"
          onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
        >
          {t('language')}
        </button>
        <form className="login-card" onSubmit={submit}>
          <div className="login-heading">
            <div className="mobile-brand">
              <Brand compact />
            </div>
            <span className="eyebrow">{t('login.access')}</span>
            <h2>{t('login.welcome')}</h2>
            <p>{t('login.continue')}</p>
          </div>
          <label>
            {t('login.email')}
            <input type="email" defaultValue="valeria.soto@bcysa.com.mx" required />
          </label>
          <label>
            {t('login.password')}
            <div className="password">
              <input type="password" defaultValue="proyecto2026" required />
              <span>⌁</span>
            </div>
          </label>
          <fieldset>
            <legend>{t('login.explore')}</legend>
            <div className="role-picker">
              {roles.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={role === item ? 'selected' : ''}
                  onClick={() => setRole(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="primary login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                ...
              </>
            ) : (
              <>
                {t('login.enter')} <span>→</span>
              </>
            )}
          </button>
          <small>{t('login.demo')}</small>
        </form>
      </section>
    </main>
  )
}
