import type { UserRole } from '@prisma/client'

export function getHomePathForRole(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'player':
      return '/jugador'
    case 'superadmin':
      return '/admin/clubs'
    default:
      return '/dashboard'
  }
}
