export const CANCELLATION_HOURS_LIMIT = 2

export function canCancel(startTime: Date): boolean {
  const now = new Date()
  const diffMs = startTime.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours >= CANCELLATION_HOURS_LIMIT
}

export function isPrismaConflictError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
