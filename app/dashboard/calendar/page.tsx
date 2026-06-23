import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  return (
    <div>
      <div className="mb-8">
        <div className="section-label">Reservas</div>
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#34252F',
            letterSpacing: '-0.01em',
          }}
        >
          Calendario Semanal
        </h1>
      </div>
      <WeeklyCalendar courts={courts} />
    </div>
  )
}
