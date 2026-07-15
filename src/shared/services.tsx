import type { ReactNode } from 'react'
import { ServicesContext, type ServicesContextValue } from './services-context'

export function ServicesProvider({
  children,
  services,
  session,
}: ServicesContextValue & { children: ReactNode }) {
  return <ServicesContext value={{ services, session }}>{children}</ServicesContext>
}
