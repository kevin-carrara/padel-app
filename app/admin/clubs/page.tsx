import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubs = await prisma.club.findMany({
    include: { _count: { select: { courts: true, bookings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge: Record<string, string> = {
    active: 'badge-racing',
    trial: 'badge-cognac',
    suspended: 'badge-outline',
  }

  return (
    <main className="min-h-screen" style={{ background: '#EBE9DF' }}>
      <nav style={{ background: '#004740' }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="logo text-xl" style={{ color: '#FFFFFF' }}>
            AJClubPadel
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#AE552D',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            Superadmin
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="section-label mb-2">Panel de administracion</div>
        <h1
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#34252F',
            letterSpacing: '-0.02em',
            marginBottom: '2rem',
          }}
        >
          Clubes
        </h1>

        <div className="card overflow-hidden">
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 text-xs font-bold uppercase tracking-widest"
            style={{
              background: '#EBE9DF',
              borderBottom: '1px solid rgba(52,37,47,0.08)',
              color: 'rgba(52,37,47,0.4)',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            <span>Club</span>
            <span>Estado</span>
            <span>Canchas</span>
            <span>Reservas</span>
          </div>
          {clubs.map((club, i) => (
            <div
              key={club.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3.5 items-center row-hover"
              style={{ borderBottom: i < clubs.length - 1 ? '1px solid rgba(52,37,47,0.08)' : 'none' }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#34252F',
                  }}
                >
                  {club.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.4)' }}>/{club.slug}</p>
              </div>
              <span className={`badge ${statusBadge[club.subscriptionStatus] ?? 'badge-outline'}`}>
                {club.subscriptionStatus}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontWeight: 800,
                  color: '#004740',
                }}
              >
                {club._count.courts}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontWeight: 800,
                  color: '#004740',
                }}
              >
                {club._count.bookings}
              </span>
            </div>
          ))}
          {clubs.length === 0 && (
            <div className="px-5 py-8 text-center" style={{ color: 'rgba(52,37,47,0.4)' }}>
              Sin clubes registrados.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}