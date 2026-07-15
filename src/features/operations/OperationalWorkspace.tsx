import { lazy, Suspense, useEffect, useState } from 'react'
import type { Role } from '../../shared/contracts'
import { OperationalShell } from './OperationalShell'
import type { OperationalView } from './navigation'

const OperationalOverviewView = lazy(() =>
  import('./OperationalOverviewView').then((module) => ({
    default: module.OperationalOverviewView,
  })),
)
const OperationalPlanningView = lazy(() =>
  import('./OperationalPlanningView').then((module) => ({
    default: module.OperationalPlanningView,
  })),
)
const OperationalScheduleView = lazy(() =>
  import('./OperationalScheduleView').then((module) => ({
    default: module.OperationalScheduleView,
  })),
)
const OperationalCostsView = lazy(() =>
  import('./OperationalFinanceControlViews').then((module) => ({
    default: module.OperationalCostsView,
  })),
)
const OperationalRisksView = lazy(() =>
  import('./OperationalFinanceControlViews').then((module) => ({
    default: module.OperationalRisksView,
  })),
)
const OperationalChangesView = lazy(() =>
  import('./OperationalFinanceControlViews').then((module) => ({
    default: module.OperationalChangesView,
  })),
)
const OperationalDocumentsView = lazy(() =>
  import('./OperationalEvidenceViews').then((module) => ({
    default: module.OperationalDocumentsView,
  })),
)
const OperationalFieldView = lazy(() =>
  import('./OperationalEvidenceViews').then((module) => ({ default: module.OperationalFieldView })),
)

export function OperationalWorkspace({
  role,
  onRoleChange,
  onReturnToPresentation,
  onLogout,
}: {
  role: Role
  onRoleChange: (role: Role) => void
  onReturnToPresentation: () => void
  onLogout: () => void
}) {
  const [view, setView] = useState<OperationalView>('overview')
  const [toast, setToast] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [view])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const content =
    view === 'overview' ? (
      <OperationalOverviewView onNavigate={setView} notify={notify} />
    ) : view === 'planning' ? (
      <OperationalPlanningView />
    ) : view === 'schedule' ? (
      <OperationalScheduleView />
    ) : view === 'costs' ? (
      <OperationalCostsView notify={notify} />
    ) : view === 'risks' ? (
      <OperationalRisksView notify={notify} />
    ) : view === 'changes' ? (
      <OperationalChangesView notify={notify} />
    ) : view === 'documents' ? (
      <OperationalDocumentsView notify={notify} />
    ) : (
      <OperationalFieldView notify={notify} />
    )

  return (
    <>
      <div data-app-background className="operational-experience">
        <OperationalShell
          currentView={view}
          onNavigate={setView}
          role={role}
          onRoleChange={onRoleChange}
          onReturnToPresentation={onReturnToPresentation}
          onLogout={onLogout}
        >
          <Suspense fallback={<div className="op-view-loading">LAB04 / OPERATIONS</div>}>
            {content}
          </Suspense>
        </OperationalShell>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </>
  )
}
