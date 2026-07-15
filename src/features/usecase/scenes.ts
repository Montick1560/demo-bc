import type { View } from '../../shared/project'

// The use-case walkthrough narrates how the team drove the practical case from
// authorization to close. Scene copy lives in the i18n catalog under
// `useCase.scenes.<id>`; only the structural anchors (actor, deep-link target,
// outcome tone) live here so the narrative stays fully translatable.
export interface UseCaseScene {
  readonly id: string
  readonly initials: string
  readonly name: string
  readonly target: View
  readonly tone: 'green' | 'amber'
}

export const useCaseScenes: readonly UseCaseScene[] = [
  { id: 's1', initials: 'VS', name: 'Valeria Soto', target: 'inicio', tone: 'green' },
  { id: 's2', initials: 'MO', name: 'Marina Ortiz', target: 'planificacion', tone: 'green' },
  { id: 's3', initials: 'LT', name: 'Lucía Torres', target: 'riesgos', tone: 'amber' },
  { id: 's4', initials: 'RM', name: 'Rafael Méndez', target: 'cronograma', tone: 'amber' },
  { id: 's5', initials: 'AC', name: 'Ana Cruz', target: 'control', tone: 'green' },
  { id: 's6', initials: 'VS', name: 'Valeria Soto', target: 'dashboard', tone: 'green' },
  { id: 's7', initials: 'VS', name: 'Valeria Soto', target: 'cierre', tone: 'green' },
]

export const useCaseCast = useCaseScenes.filter(
  (scene, index, scenes) =>
    scenes.findIndex((other) => other.initials === scene.initials) === index,
)
