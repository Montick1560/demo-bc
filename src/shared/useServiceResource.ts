import { useCallback, useEffect, useState } from 'react'
import type { ServiceError, ServiceResult } from './contracts'

export function useServiceResource<T>(
  load: () => Promise<ServiceResult<T>>,
  dependencies: readonly unknown[],
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ServiceError | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const result = await load()
    if (result.ok) {
      setData(result.data)
      setError(null)
    } else setError(result.error)
    setLoading(false)
    // The caller explicitly supplies the stable dependencies for its service operation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    void reload()
  }, [reload])
  return { data, error, loading, reload }
}
