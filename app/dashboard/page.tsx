import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react'
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
  const stats = await getStats(user.id)

  if (!stats) return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.875rem', fontWeight: 800, color: '#34252F', marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <div className="card p-10 text-center anim-up">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#34252F', marginBottom: '0.75rem' }}>
          ¡Bienvenido a PadelBook!
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
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.25rem', fontWeight: 700, color: '#34252F', letterSpacing: '-0.01em' }}>
            {club.name}
          </h1>
          <span className="badge badge-cognac">
            {club.subscriptionStatus === 'active' ? 'Activo' : club.subscriptionStatus === 'trial' ? 'Trial' : club.subscriptionStatus}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Reservas hoy */}
        <div className="card stat-card-accent p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl flex items-center justify-center" style={{ width: '40px', height: '40px', background: 'rgba(0,71,64,0.08)' }}>
              <Calendar size={20} color="#004740" />
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-montserrat)' }}>
              Hoy
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.5rem', fontWeight: 800, color: '#004740', lineHeight: 1 }}>
            {todayCount}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginTop: '0.25rem' }}>
            Reservas hoy
          </p>
        </div>

        {/* Ingresos del mes */}
        <div className="card p-5" style={{ borderLeft: '4px solid #AE552D', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl flex items-center justify-center" style={{ width: '40px', height: '40px', background: 'rgba(174,85,45,0.08)' }}>
              <DollarSign size={20} color="#AE552D" />
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-montserrat)' }}>
              Este mes
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.5rem', fontWeight: 800, color: '#AE552D', lineHeight: 1 }}>
            ${totalRevenue.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginTop: '0.25rem' }}>
            Ingresos confirmados
          </p>
        </div>

        {/* Tasa de ocupación */}
        <div className="card stat-card-accent p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl flex items-center justify-center" style={{ width: '40px', height: '40px', background: 'rgba(0,71,64,0.08)' }}>
              <TrendingUp size={20} color="#004740" />
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-montserrat)' }}>
              Ocupación
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.5rem', fontWeight: 800, color: '#004740', lineHeight: 1 }}>
            {occupancyPct}%
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginTop: '0.25rem' }}>
            {confirmedCount} confirmadas total
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/bookings/new" className="btn btn-primary">+ Nueva reserva</Link>
        <Link href="/dashboard/bookings" className="btn btn-secondary">
          Ver reservas <ArrowRight size={16} />
        </Link>
        <Link href={`/${club.slug}`} target="_blank" className="btn btn-ghost">Ver página pública</Link>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.125rem', fontWeight: 700, color: '#34252F', marginBottom: '0.75rem' }}>
          Últimas reservas
        </h2>
        {recentBookings.length === 0 ? (
          <div className="card p-8 text-center diagonal-stripe" style={{ color: 'rgba(52,37,47,0.4)' }}>
            Sin reservas aun.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div
              className="grid px-5 py-3 text-xs font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 100px 80px', background: '#EBE9DF', borderBottom: '1px solid rgba(52,37,47,0.08)', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-montserrat)' }}
            >
              <span>Jugador</span>
              <span>Cancha</span>
              <span>Horario</span>
              <span>Estado</span>
              <span></span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
              {recentBookings.map(b => (
                <div key={b.id} className="grid px-5 py-3.5 items-center row-hover" style={{ gridTemplateColumns: '1fr 1fr 1fr 100px 80px' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>
                      {b.playerName}
                    </p>
                    {b.playerPhone && (
                      <p style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.4)' }}>{b.playerPhone}</p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#34252F', fontWeight: 500, fontFamily: 'var(--font-inter)' }}>
                    {b.court.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)' }}>
                    {new Date(b.startTime).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`badge ${statusBadge[b.status] ?? 'badge-outline'}`}>
                    {statusLabel[b.status] ?? b.status}
                  </span>
                  <div>
                    {b.status === 'confirmed' && (
                      <CancelBookingButton
                        bookingId={b.id}
                        playerName={b.playerName}
                        startTime={b.startTime.toISOString()}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}