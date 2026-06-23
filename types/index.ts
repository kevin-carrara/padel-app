export type UserRole = 'superadmin' | 'club_admin' | 'receptionist' | 'player'
export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PaymentMethod = 'cash' | 'mp' | 'transfer'
export type SubscriptionStatus = 'trial' | 'active' | 'inactive' | 'suspended'

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  price: number
}

export interface ClubPublic {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  logoUrl: string | null
  subscriptionStatus: SubscriptionStatus
  courts: { id: string; name: string; isActive: boolean }[]
}
