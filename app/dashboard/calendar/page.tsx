import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WeeklyCalendar from './WeeklyCalendar'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile?.clubId) redirect('/dashboard')

  const courts = await prisma.court.findMany({
    where: { clubId: profile.clubId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  // Compute today's date in ART (UTC-3) server-side to avoid hydration mismatch
  const todayStr = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="section-label">Reservas</div>
          <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2rem', fontWeight: 800, color: '#34252F', letterSpacing: '-0.02em' }}>
            Calendario
          </h1>
        </div>
        <Link href="/dashboard/bookings/new" className="btn btn-primary">+ Nueva reserva</Link>
      </div>
      <WeeklyCalendar courts={courts} todayStr={todayStr} />
    </div>
  )
}
