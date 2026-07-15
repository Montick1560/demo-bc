import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Login } from './components/Login'
import { Workspace } from './components/Workspace'
import type { ExperienceMode } from './shared/experience'
import type { Role } from './shared/project'
import { createDemoSession, createMockServices } from './mocks/services'
import type { AppServices } from './shared/contracts'
import { ServicesProvider } from './shared/services'
import './styles/index.css'

const OperationalWorkspace = lazy(() =>
  import('./features/operations/OperationalWorkspace').then((module) => ({
    default: module.OperationalWorkspace,
  })),
)

export default function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('presentation')
  const [servicesByMode, setServicesByMode] = useState<Record<ExperienceMode, AppServices> | null>(
    null,
  )
  const session = useMemo(() => (role ? createDemoSession(role) : null), [role])
  const sessionRef = useRef(session)
  sessionRef.current = session
  const services = servicesByMode?.[experienceMode] ?? null

  const login = (nextRole: Role) => {
    const initialSession = createDemoSession(nextRole)
    sessionRef.current = initialSession
    const getSession = () => sessionRef.current ?? initialSession
    setServicesByMode({
      presentation: createMockServices(getSession, 'presentation'),
      natural: createMockServices(getSession, 'natural'),
    })
    setExperienceMode('presentation')
    setRole(nextRole)
  }

  const changeRole = (nextRole: Role) => {
    sessionRef.current = createDemoSession(nextRole)
    setRole(nextRole)
  }

  const logout = () => {
    setExperienceMode('presentation')
    setServicesByMode(null)
    sessionRef.current = null
    setRole(null)
  }

  if (!role || !session || !services) return <Login onLogin={login} />

  return (
    <ServicesProvider services={services} session={session}>
      {experienceMode === 'natural' ? (
        <Suspense fallback={<div className="app-loading">LAB04</div>}>
          <OperationalWorkspace
            role={role}
            onRoleChange={changeRole}
            onReturnToPresentation={() => setExperienceMode('presentation')}
            onLogout={logout}
          />
        </Suspense>
      ) : (
        <Workspace
          role={role}
          experienceMode="presentation"
          onExperienceModeChange={setExperienceMode}
          onRoleChange={changeRole}
          onLogout={logout}
        />
      )}
    </ServicesProvider>
  )
}
