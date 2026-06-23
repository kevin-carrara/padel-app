import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import NewBookingForm from './NewBookingForm'

export const dynamic = 'force-dynamic'

export default async function NewBookingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile?.clubId) redirect('/dashboard')

  const courts = await prisma.court.findMany({
    where: { clubId: profile.clubId, isActive: true },
    select: { id: true, name: true, pricePerHour: true },
    orderBy: { name: 'asc' },
  })
  const serializableCourts = courts.map(c => ({ ...c, pricePerHour: Number(c.pricePerHour) }))

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/bookings"
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#004740',
            textDecoration: 'none',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          ← Reservas
        </Link>
        <div className="section-label mt-4">Registrar</div>
        <h1
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#34252F',
            letterSpacing: '-0.02em',
          }}
        >
          Nueva reserva
        </h1>
      </div>
      {courts.length === 0 ? (
        <div className="card p-8 diagonal-stripe">
          <p style={{ color: 'rgba(52,37,47,0.4)', fontSize: '0.875rem' }}>
            No hay canchas activas.{' '}
            <Link href="/dashboard/courts" style={{ color: '#AE552D', fontWeight: 600 }}>
              Crear una cancha
            </Link>
          </p>
        </div>
      ) : (
        <NewBookingForm courts={serializableCourts} />
      )}
    </div>
  )
}