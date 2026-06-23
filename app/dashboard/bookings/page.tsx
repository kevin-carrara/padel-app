import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingFilters from './BookingFilters'
import CancelBookingButton from './CancelBookingButton'
import RepeatBookingButton from './RepeatBookingButton'

export const dynamic = 'force-dynamic'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status } = await searchParams

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  const allBookings = profile?.clubId
    ? await prisma.booking.findMany({
        where: { clubId: profile.clubId },
        orderBy: { startTime: 'desc' },
        take: 100,
        include: { court: { select: { name: true } } },
      })
    : []

  const bookings = status
    ? allBookings.filter(b => b.status === status)
    : allBookings

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-label">Gestión</div>
          <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2rem', fontWeight: 800, color: '#34252F', letterSpacing: '-0.02em' }}>
            Reservas
          </h1>
        </div>
        <Link href="/dashboard/bookings/new" className="btn btn-primary">+ Nueva</Link>
      </div>

      <BookingFilters />

      {bookings.length === 0 ? (
        <div className="card p-12 text-center diagonal-stripe">
          <p style={{ color: 'rgba(52,37,47,0.4)', marginBottom: '1rem' }}>
            {status ? 'Sin reservas con ese estado.' : 'Sin reservas todavia.'}
          </p>
          {!status && (
            <Link href="/dashboard/bookings/new" className="btn btn-primary btn-sm">Crear la primera</Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
        <div className="card overflow-hidden" style={{ minWidth: '600px' }}>
          <div
            className="grid px-5 py-3 text-xs font-bold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr 80px 100px 140px',
              background: '#EBE9DF',
              borderBottom: '1px solid rgba(52,37,47,0.08)',
              color: 'rgba(52,37,47,0.4)',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            <span>Jugador</span>
            <span>Cancha</span>
            <span>Inicio</span>
            <span>Monto</span>
            <span>Estado</span>
            <span></span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
            {bookings.map(b => (
              <div
                key={b.id}
                className="grid px-5 py-3.5 items-center row-hover"
                style={{ gridTemplateColumns: '1fr 1fr 1fr 80px 100px 140px' }}
              >
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
                  {new Date(b.startTime).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  {' '}{new Date(b.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ fontWeight: 700, color: '#AE552D', fontFamily: 'var(--font-montserrat)' }}>
                  ${Number(b.amount).toLocaleString('es-AR')}
                </span>
                <span className={`badge ${statusBadge[b.status] ?? 'badge-outline'}`}>
                  {statusLabel[b.status] ?? b.status}
                </span>
                <div className="flex gap-1.5">
                  {b.status === 'confirmed' && (
                    <>
                      <RepeatBookingButton
                        bookingId={b.id}
                        playerName={b.playerName}
                        startTime={b.startTime.toISOString()}
                        courtName={b.court.name}
                      />
                      <CancelBookingButton
                        bookingId={b.id}
                        playerName={b.playerName}
                        startTime={b.startTime.toISOString()}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  )
}