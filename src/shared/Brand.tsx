export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bcysa-brand ${compact ? 'compact' : ''}`}>
      <img src="/bcysa-logo.svg" alt="BCySA" />
      <span>
        LAB04<small>PROJECT CONTROL</small>
      </span>
    </div>
  )
}
