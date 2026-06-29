import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from './BackButton'
import { ClubCard } from './ClubCard'

export const dynamic = 'force-dynamic'

const TZ_OFFSET = '-03:00'

type LandingClub = {
  id: string
  name: string
  slug: string
  address: string | null
  logoUrl: string | null
  coverUrl: string | null
  courts: { id: string }[]
  hasAvailabilityToday: boolean
}

/** Returns today's date string in ART (UTC-3) as 'YYYY-MM-DD' */
function getTodayART(): string {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns true if the club has at least one free slot today */
async function clubHasAvailabilityToday(clubId: string, courtIds: string[], today: string): Promise<boolean> {
  if (courtIds.length === 0) return false

  const [y, m, d] = today.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay()

  const [schedules, bookings] = await Promise.all([
    prisma.courtSchedule.findMany({
      where: { courtId: { in: courtIds }, dayOfWeek },
    }),
    prisma.booking.findMany({
      where: {
        clubId,
        status: { not: 'cancelled' },
        startTime: {
          gte: new Date(`${today}T00:00:00${TZ_OFFSET}`),
          lt: new Date(`${today}T23:59:59${TZ_OFFSET}`),
        },
      },
      select: { courtId: true, startTime: true, endTime: true },
    }),
  ])

  const now = new Date()

  for (const sched of schedules) {
    const [openH, openM] = sched.openTime.split(':').map(Number)
    const [closeH, closeM] = sched.closeTime.split(':').map(Number)
    const slotMin = sched.slotDuration
    const courtBookings = bookings.filter(b => b.courtId === sched.courtId)

    let curMin = openH * 60 + openM
    const closeMin = closeH * 60 + closeM

    while (curMin + slotMin <= closeMin) {
      const slotH = Math.floor(curMin / 60)
      const slotM = curMin % 60
      const slotStart = new Date(`${today}T${String(slotH).padStart(2,'0')}:${String(slotM).padStart(2,'0')}:00${TZ_OFFSET}`)

      // Skip past slots
      if (slotStart > now) {
        const endMin = curMin + slotMin
        const slotEnd = new Date(`${today}T${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00${TZ_OFFSET}`)
        const isTaken = courtBookings.some(b =>
          new Date(b.startTime) < slotEnd && new Date(b.endTime) > slotStart
        )
        if (!isTaken) return true
      }
      curMin += slotMin
    }
  }

  return false
}

async function getActiveClubs(): Promise<LandingClub[]> {
  const today = getTodayART()

  const clubs = await prisma.club.findMany({
    where: { subscriptionStatus: { in: ['active', 'trial'] } },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      courts: { where: { isActive: true }, select: { id: true } },
    },
    orderBy: { name: 'asc' },
  })

  const clubsWithAvailability = await Promise.all(
    clubs.map(async (club) => ({
      ...club,
      hasAvailabilityToday: await clubHasAvailabilityToday(
        club.id,
        club.courts.map(c => c.id),
        today
      ),
    }))
  )

  return clubsWithAvailability
}

export default async function ClubesPage() {
  const clubs = await getActiveClubs()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isPlayer = false
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    isPlayer = profile?.role === 'player'
  }

  return (
    <div className="min-h-screen" style={{ background: '#EBE9DF' }}>
      <style>{`
        @media (max-width: 767px) {
          .club-cover { height: 120px !important; }
          .club-card-body { padding: 0.6rem 0.75rem 0.75rem !important; }
          .club-avail-row { margin-top: 0.5rem !important; padding-top: 0.5rem !important; }
          .club-court-row { flex-direction: column !important; align-items: flex-start !important; gap: 0.4rem !important; margin-top: 0.5rem !important; }
          .club-court-row .badge { font-size: 0.6rem !important; padding: 0.2rem 0.5rem !important; }
          .club-reservar { font-size: 0.75rem !important; }
        }
      `}</style>
      {/* NAV */}
      <nav style={{ background: '#004740' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', background: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
            </div>
            <span className="logo text-xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
          </div>
          <BackButton />
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ background: '#004740', padding: '3rem 0 2.5rem' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="section-label" style={{ color: 'rgba(235,233,223,0.55)', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
            Directorio
          </div>
          <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Clubes de Pádel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', fontSize: '1rem' }}>
            {clubs.length} club{clubs.length !== 1 ? 's' : ''} disponible{clubs.length !== 1 ? 's' : ''} · Reserva en menos de 30 segundos
          </p>
        </div>
      </section>

      {/* CLUBS GRID */}
      <section className="max-w-6xl mx-auto px-5 py-10">
        {clubs.length === 0 ? (
          <div className="card diagonal-stripe p-16 text-center">
            <p style={{ color: 'rgba(52,37,47,0.4)', fontSize: '1rem', marginBottom: '0.5rem' }}>
              Todavía no hay clubes activos.
            </p>
            <p style={{ color: 'rgba(52,37,47,0.3)', fontSize: '0.875rem' }}>Los primeros clubs se están incorporando — volvé pronto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {clubs.map((club: LandingClub, i: number) => (
                <ClubCard key={club.id} club={club} index={i} isPlayer={isPlayer} />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
