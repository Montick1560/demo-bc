import type { Role, View } from '../../shared/project'
import { RolesView } from '../admin/RolesView'
import { ClosureView } from './ClosureView'
import { ControlView } from './ControlView'
import { InitiationView } from './InitiationView'
import { PlanningView } from './PlanningView'
import { RiskView } from './RiskView'
import { ScheduleView } from './ScheduleView'

export function ProjectRouter({
  view,
  role,
  notify,
  onAdd,
}: {
  view: View
  role: Role
  notify: (message: string) => void
  onAdd?: () => void
}) {
  if (view === 'inicio') return <InitiationView onAdd={onAdd} />
  if (view === 'planificacion') return <PlanningView onAdd={onAdd} />
  if (view === 'cronograma') return <ScheduleView onAdd={onAdd} />
  if (view === 'riesgos') return <RiskView onAdd={onAdd} />
  if (view === 'control') return <ControlView onAdd={onAdd} />
  if (view === 'cierre') return <ClosureView onAdd={onAdd} notify={notify} />
  return <RolesView role={role} onAdd={onAdd} notify={notify} />
}
