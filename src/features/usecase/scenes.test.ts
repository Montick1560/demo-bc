import { describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { useCaseCast, useCaseScenes } from './scenes'

const validTargets = new Set([
  'inicio',
  'planificacion',
  'cronograma',
  'riesgos',
  'control',
  'cierre',
  'dashboard',
])

describe('use case scenes', () => {
  it('links every scene to a reachable module', () => {
    for (const scene of useCaseScenes) expect(validTargets.has(scene.target)).toBe(true)
  })

  it('uses unique scene ids', () => {
    expect(new Set(useCaseScenes.map((scene) => scene.id)).size).toBe(useCaseScenes.length)
  })

  it('derives one cast entry per distinct actor', () => {
    const distinct = new Set(useCaseScenes.map((scene) => scene.initials))
    expect(useCaseCast).toHaveLength(distinct.size)
  })

  it('keeps scene copy complete in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const scene of useCaseScenes) {
        for (const field of ['phase', 'date', 'title', 'trigger', 'outcome', 'cta']) {
          expect(
            i18n.getResource(lang, 'translation', `useCase.scenes.${scene.id}.${field}`),
          ).toBeTruthy()
        }
        const actions = i18n.getResource(lang, 'translation', `useCase.scenes.${scene.id}.actions`)
        expect(Array.isArray(actions)).toBe(true)
        expect((actions as string[]).length).toBeGreaterThanOrEqual(2)
        expect(
          i18n.getResource(lang, 'translation', `useCase.roles.${scene.initials}`),
        ).toBeTruthy()
      }
    }
  })
})
