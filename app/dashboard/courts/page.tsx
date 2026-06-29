import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourtsList from './CourtsList'

export const dynamic = 'force-dynamic'

export default async function CourtsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  const courts = profile?.clubId
    ? await prisma.court.findMany({
        where: { clubId: profile.clubId },
        include: {
          schedules: { select: { dayOfWeek: true, openTime: true, closeTime: true, slotDuration: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { name: 'asc' },
      })
    : []

  const serialized = courts.map(c => ({ ...c, pricePerHour: Number(c.pricePerHour) }))

  return (
    <div>
      <div className="mb-8">
        <div className="section-label">Gestion</div>
        <h1
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: 800,
            color: '#34252F',
            letterSpacing: '-0.02em',
          }}
        >
          Canchas
        </h1>
      </div>
      {profile?.clubId ? (
        <CourtsList courts={serialized} clubId={profile.clubId} />
      ) : (
        <div className="card p-8 text-center diagonal-stripe">
          <p style={{ color: 'rgba(52,37,47,0.4)' }}>No se encontro tu club.</p>
        </div>
      )}
    </div>
  )
}