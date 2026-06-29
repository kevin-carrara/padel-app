import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendUp, CalendarBlank, CurrencyDollar, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import CancelBookingButton from './bookings/CancelBookingButton'

export const dynamic = 'force-dynamic'

async function getStats(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile?.clubId) return null
  const club = await prisma.club.findUnique({ where: { id: profile.clubId } })
  if (!club) return null

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [todayCount, monthCount, confirmedCount, totalRevenue, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { clubId: club.id, startTime: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { clubId: club.id, startTime: { gte: monthStart } } }),
    prisma.booking.count({ where: { clubId: club.id, status: 'confirmed' } }),
    prisma.booking.aggregate({ where: { clubId: club.id, status: 'confirmed' }, _sum: { amount: true } }),
    prisma.booking.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { court: { select: { name: true } } },
    }),
  ])

  return { club, todayCount, monthCount, confirmedCount, totalRevenue: Number(totalRevenue._sum.amount ?? 0), recentBookings }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Superadmin va directo al panel de administración
  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { clubId: true, role: true } })
  if (profile?.role === 'superadmin') redirect('/admin/clubs')

  const stats = await getStats(user.id)

  if (!stats) return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.875rem', fontWeight: 800, color: '#34252F', marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <div className="card p-10 text-center anim-up">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#34252F', marginBottom: '0.75rem' }}>
          ¡Bienvenido a AJClubPadel!
        </h2>
        <p style={{ color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Configurá tu club en 3 pasos para empezar a recibir reservas.
        </p>
        <Link href="/dashboard/onboarding" className="btn btn-primary btn-lg">
          Configurar mi club →
        </Link>
      </div>
    </div>
  )

  const { club, todayCount, monthCount, confirmedCount, totalRevenue, recentBookings } = stats

  const occupancyPct = confirmedCount > 0 ? Math.round((todayCount / Math.max(confirmedCount, 1)) * 100) : 0

  const statusLabel: Record<string, string> = {
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    no_show: 'No show',
    completed: 'Completada',
  }
  const statusBadge: Record<string, string> = {
    confirmed: 'badge-racing',
    cancelled: 'badge-outline',
    no_show: 'badge-red',
    completed: 'badge-green',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="section-label">Panel de control</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 700, color: '#34252F', letterSpacing: '-0.01em' }}>
            {club.name}
          </h1>
          <span className="badge badge-cognac">
            {club.subscriptionStatus === 'active' ? 'Activo' : club.subscriptionStatus === 'trial' ? 'Trial' : club.subscriptionStatus}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Reservas hoy */}
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(0,71,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarBlank size={20} color="#004740" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.6rem', fontWeight: 800, color: '#004740', lineHeight: 1 }}>
                {todayCount}
              </p>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                Hoy
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)', marginTop: '0.15rem' }}>
              Reservas hoy
            </p>
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderLeft: '3px solid #AE552D' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(174,85,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CurrencyDollar size={20} color="#AE552D" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.6rem', fontWeight: 800, color: '#AE552D', lineHeight: 1 }}>
                ${totalRevenue.toLocaleString('es-AR')}
              </p>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                Este mes
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)', marginTop: '0.15rem' }}>
              Ingresos confirmados
            </p>
          </div>
        </div>

        {/* Tasa de ocupación */}
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(0,71,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendUp size={20} color="#004740" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.6rem', fontWeight: 800, color: '#004740', lineHeight: 1 }}>
                {occupancyPct}%
              </p>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                Ocupación
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)', marginTop: '0.15rem' }}>
              {confirmedCount} confirmadas total
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/bookings/new" className="btn btn-primary">+ Nueva reserva</Link>
        <Link href="/dashboard/calendar" className="btn btn-secondary">
          Ver calendario <ArrowRight size={16} />
        </Link>
        <Link href={`/${club.slug}`} target="_blank" className="btn btn-ghost">Ver página pública</Link>
      </div>

      {/* Recent bookings */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1rem', fontWeight: 700, color: '#34252F' }}>
            Últimas reservas
          </h2>
          <Link href="/dashboard/calendar" style={{ fontSize: '0.72rem', color: '#004740', fontWeight: 600, fontFamily: 'var(--font-montserrat)', textDecoration: 'none' }}>
            Ver todas →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="card p-8 text-center" style={{ color: 'rgba(52,37,47,0.4)' }}>
            Sin reservas aún.
          </div>
        ) : (
          <div className="card overflow-hidden">
            {recentBookings.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderBottom: i < recentBookings.length - 1 ? '1px solid rgba(52,37,47,0.06)' : 'none',
                }}
              >
                {/* Avatar inicial */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(0,71,64,0.09)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.8rem', color: '#004740',
                }}>
                  {b.playerName.charAt(0).toUpperCase()}
                </div>

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.82rem', color: '#34252F' }}>
                      {b.playerName}
                    </p>
                    <span className={`badge ${statusBadge[b.status] ?? 'badge-outline'}`} style={{ fontSize: '0.58rem' }}>
                      {statusLabel[b.status] ?? b.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.45)', fontFamily: 'var(--font-inter)', marginTop: '0.1rem' }}>
                    {b.court.name} · {new Date(b.startTime).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Cancelar */}
                {b.status === 'confirmed' && (
                  <div style={{ flexShrink: 0 }}>
                    <CancelBookingButton
                      bookingId={b.id}
                      playerName={b.playerName}
                      startTime={b.startTime.toISOString()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}