export type { Role } from './contracts'

export type View =
  | 'proyectos'
  | 'dashboard'
  | 'recorrido'
  | 'pmo'
  | 'inicio'
  | 'planificacion'
  | 'cronograma'
  | 'riesgos'
  | 'control'
  | 'cierre'
  | 'glosario'
  | 'roles'

export const nav: {
  id: View
  icon: string
  stage?: 'executive' | 'stages' | 'resources' | 'admin'
}[] = [
  { id: 'proyectos', icon: '▦', stage: 'executive' },
  { id: 'dashboard', icon: '⌂' },
  { id: 'recorrido', icon: '▷' },
  { id: 'pmo', icon: '◆', stage: 'executive' },
  { id: 'inicio', icon: '01', stage: 'stages' },
  { id: 'planificacion', icon: '02' },
  { id: 'cronograma', icon: '03' },
  { id: 'riesgos', icon: '04' },
  { id: 'control', icon: '05' },
  { id: 'cierre', icon: '06' },
  { id: 'glosario', icon: 'Aa', stage: 'resources' },
  { id: 'roles', icon: '◎', stage: 'admin' },
]

// Temporary product visibility switch: keep the PMO module available in code, but out of the UI.
export const temporarilyHiddenViews: readonly View[] = ['pmo']

export const isNavigationVisible = (view: View) => !temporarilyHiddenViews.includes(view)
