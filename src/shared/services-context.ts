import { createContext } from 'react'
import type { AppServices, UserSession } from './contracts'

export interface ServicesContextValue {
  readonly services: AppServices
  readonly session: UserSession
}

export const ServicesContext = createContext<ServicesContextValue | null>(null)
