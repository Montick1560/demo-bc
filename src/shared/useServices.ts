import { useContext } from 'react'
import { hasCapability, type Capability } from './contracts'
import { ServicesContext } from './services-context'

function useServicesContext() {
  const context = useContext(ServicesContext)
  if (!context) throw new Error('Services hooks must be used within ServicesProvider')
  return context
}

export function useServices() {
  return useServicesContext().services
}

export function useSession() {
  return useServicesContext().session
}

export function useCapability(capability: Capability) {
  return hasCapability(useSession(), capability)
}
