import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { View } from '../../shared/project'
import { Status } from '../../shared/ui'
import { useCaseCast, useCaseScenes } from './scenes'

function Actor({
  initials,
  name,
  role,
  inline = false,
}: {
  initials: string
  name: string
  role: string
  inline?: boolean
}) {
  return (
    <span className={`usecase-actor${inline ? ' inline' : ''}`}>
      <i>{initials}</i>
      <span>
        <b>{name}</b>
        <small>{role}</small>
      </span>
    </span>
  )
}

export function UseCaseView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const total = useCaseScenes.length
  const scene = useCaseScenes[index]
  const actions = t(`useCase.scenes.${scene.id}.actions`, { returnObjects: true }) as string[]

  return (
    <div className="usecase">
      <header className="usecase-hero">
        <span className="eyebrow">{t('useCase.eyebrow')}</span>
        <h2>{t('useCase.title')}</h2>
        <p>{t('useCase.intro')}</p>
        <div className="usecase-cast">
          {useCaseCast.map((member) => (
            <Actor
              key={member.initials}
              initials={member.initials}
              name={member.name}
              role={t(`useCase.roles.${member.initials}`)}
            />
          ))}
        </div>
      </header>

      <div className="usecase-layout">
        <ol className="usecase-rail" aria-label={t('useCase.stepsLabel')}>
          {useCaseScenes.map((item, itemIndex) => (
            <li
              key={item.id}
              className={itemIndex === index ? 'active' : itemIndex < index ? 'done' : ''}
            >
              <button
                type="button"
                aria-current={itemIndex === index}
                onClick={() => setIndex(itemIndex)}
              >
                <i>{itemIndex < index ? '✓' : itemIndex + 1}</i>
                <span>
                  <small>{t(`useCase.scenes.${item.id}.phase`)}</small>
                  <b>{t(`useCase.scenes.${item.id}.title`)}</b>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <article className="usecase-stage" aria-live="polite">
          <header>
            <span className="usecase-step">
              {t('useCase.sceneCounter', { current: index + 1, total })} ·{' '}
              {t(`useCase.scenes.${scene.id}.phase`)} · {t(`useCase.scenes.${scene.id}.date`)}
            </span>
            <h3>{t(`useCase.scenes.${scene.id}.title`)}</h3>
            <Actor
              initials={scene.initials}
              name={scene.name}
              role={t(`useCase.roles.${scene.initials}`)}
              inline
            />
          </header>

          <div className="usecase-blocks">
            <section className="usecase-block">
              <h4>{t('useCase.trigger')}</h4>
              <p>{t(`useCase.scenes.${scene.id}.trigger`)}</p>
            </section>
            <section className="usecase-block">
              <h4>{t('useCase.action')}</h4>
              <ol>
                {actions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
            <section className="usecase-block outcome">
              <h4>{t('useCase.outcome')}</h4>
              <Status tone={scene.tone}>{t(`useCase.scenes.${scene.id}.outcome`)}</Status>
            </section>
          </div>

          <footer className="usecase-nav">
            <button
              className="secondary"
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
            >
              ← {t('useCase.prev')}
            </button>
            <button
              className="primary usecase-cta"
              type="button"
              onClick={() => onNavigate(scene.target)}
            >
              {t(`useCase.scenes.${scene.id}.cta`)} →
            </button>
            <button
              className="secondary"
              type="button"
              disabled={index === total - 1}
              onClick={() => setIndex((current) => Math.min(total - 1, current + 1))}
            >
              {t('useCase.next')} →
            </button>
          </footer>
        </article>
      </div>
    </div>
  )
}
