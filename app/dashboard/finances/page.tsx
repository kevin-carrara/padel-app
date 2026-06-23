import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile?.clubId) redirect('/dashboard')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const [thisMonth, lastMonth, allTime, bookingsByDay] = await Promise.all([
    prisma.booking.aggregate({ where: { clubId: profile.clubId, status: 'confirmed', startTime: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    prisma.booking.aggregate({ where: { clubId: profile.clubId, status: 'confirmed', startTime: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true }, _count: true }),
    prisma.booking.aggregate({ where: { clubId: profile.clubId, status: 'confirmed' }, _sum: { amount: true }, _count: true }),
    prisma.booking.groupBy({
      by: ['startTime'],
      where: { clubId: profile.clubId, status: 'confirmed', startTime: { gte: monthStart } },
      _sum: { amount: true },
      orderBy: { startTime: 'asc' },
    }),
  ])

  const thisMonthRevenue = Number(thisMonth._sum.amount ?? 0)
  const lastMonthRevenue = Number(lastMonth._sum.amount ?? 0)
  const allTimeRevenue = Number(allTime._sum.amount ?? 0)
  const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const cards = [
    { label: 'Este mes', value: thisMonthRevenue, sub: `${thisMonth._count} reservas`, trend: growth !== 0 ? `${growth > 0 ? '+' : ''}${growth.toFixed(0)}% vs mes anterior` : null, isMoney: true },
    { label: 'Mes anterior', value: lastMonthRevenue, sub: `${lastMonth._count} reservas`, trend: null, isMoney: false },
    { label: 'Total historico', value: allTimeRevenue, sub: `${allTime._count} reservas totales`, trend: null, isMoney: true },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="section-label">Analisis</div>
        <h1
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#34252F',
            letterSpacing: '-0.02em',
          }}
        >
          Finanzas
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card stat-card-accent p-6">
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(52,37,47,0.4)',
                fontFamily: 'var(--font-montserrat)',
                marginBottom: '0.75rem',
              }}
            >
              {c.label}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '2rem',
                fontWeight: 800,
                color: c.isMoney ? '#AE552D' : '#004740',
                lineHeight: 1,
              }}
            >
              ${c.value.toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.5)', marginTop: '0.5rem', fontFamily: 'var(--font-inter)' }}>
              {c.sub}
            </p>
            {c.trend && (
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: growth >= 0 ? '#004740' : '#c0392b',
                  marginTop: '0.25rem',
                  fontFamily: 'var(--font-montserrat)',
                }}
              >
                {c.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#34252F',
            marginBottom: '0.75rem',
          }}
        >
          Detalle diario — {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </h2>
        {bookingsByDay.length === 0 ? (
          <div className="card p-8 text-center diagonal-stripe" style={{ color: 'rgba(52,37,47,0.4)' }}>
            Sin ingresos este mes todavia.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
              {bookingsByDay.map((row, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center justify-between row-hover"
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#34252F',
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 500,
                    }}
                  >
                    {new Date(row.startTime).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#AE552D',
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  >
                    ${Number(row._sum.amount ?? 0).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}