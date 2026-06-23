'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface RepeatBookingButtonProps {
  bookingId: string
  playerName: string
  startTime: string
  courtName: string
}

const WEEK_OPTIONS = [4, 8, 12, 24]

type ResultState = { created: number; skipped: string[] } | null

export default function RepeatBookingButton({
  bookingId,
  playerName,
  startTime,
  courtName,
}: RepeatBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [weeks, setWeeks] = useState(4)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultState>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRepeat() {
    setError('')
    setResult(null)
    startTransition(async () => {
      const res = await fetch('/api/bookings/repeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, weeks }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        router.refresh()
      } else {
        setError(data.error ?? 'Error al repetir reserva')
      }
    })
  }

  function handleClose() {
    setOpen(false)
    setResult(null)
    setError('')
    setWeeks(4)
  }

  const dayName = new Date(startTime).toLocaleDateString('es-AR', { weekday: 'long' })
  const timeLabel = new Date(startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Repetir cada semana"
        style={{
          fontSize: '0.7rem',
          fontFamily: 'var(--font-montserrat)',
          fontWeight: 700,
          color: '#004740',
          background: 'rgba(0,71,64,0.08)',
          border: '1px solid rgba(0,71,64,0.2)',
          borderRadius: '6px',
          padding: '3px 8px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,71,64,0.16)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,71,64,0.08)')}
      >
        🔁 Fijar
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(52,37,47,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="card anim-up" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>

            {result ? (
              /* ── Success state ── */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📅</div>
                <h2 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700,
                  color: '#004740', marginBottom: '0.5rem',
                }}>
                  ¡Reservas creadas!
                </h2>
                <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(52,37,47,0.6)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Se crearon <strong style={{ color: '#004740' }}>{result.created} reservas</strong> para los próximos{' '}
                  {weeks} {weeks === 1 ? 'semana' : 'semanas'}.
                  {result.skipped.length > 0 && (
                    <span style={{ display: 'block', marginTop: '0.5rem', color: '#AE552D' }}>
                      ⚠️ {result.skipped.length} fecha{result.skipped.length > 1 ? 's' : ''} con conflicto:{' '}
                      {result.skipped.map(d => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })).join(', ')}
                    </span>
                  )}
                </p>
                <button
                  onClick={handleClose}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Listo
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <h2 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700,
                  color: '#34252F', marginBottom: '0.25rem',
                }}>
                  Fijar reserva semanal
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '1.5rem' }}>
                  <strong style={{ color: '#34252F' }}>{playerName}</strong> —{' '}
                  {courtName} · Todos los <strong style={{ color: '#34252F', textTransform: 'capitalize' }}>{dayName}</strong> a las <strong style={{ color: '#34252F' }}>{timeLabel}</strong>
                </p>

                <label style={{
                  fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(52,37,47,0.5)',
                  fontFamily: 'var(--font-montserrat)', display: 'block', marginBottom: '0.75rem',
                }}>
                  ¿Cuántas semanas repetir?
                </label>

                <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '1.5rem' }}>
                  {WEEK_OPTIONS.map(w => (
                    <button
                      key={w}
                      onClick={() => setWeeks(w)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: weeks === w ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.15)',
                        background: weeks === w ? 'rgba(0,71,64,0.08)' : 'transparent',
                        color: weeks === w ? '#004740' : 'rgba(52,37,47,0.6)',
                        fontFamily: 'var(--font-montserrat)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {w}
                      <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 500, opacity: 0.7 }}>sem</span>
                    </button>
                  ))}
                </div>

                <p style={{
                  fontSize: '0.78rem', color: 'rgba(52,37,47,0.45)',
                  fontFamily: 'var(--font-inter)', marginBottom: '1.5rem',
                  background: 'rgba(52,37,47,0.04)', borderRadius: '8px', padding: '0.6rem 0.875rem',
                }}>
                  💡 Se crean <strong>{weeks} reservas</strong> semanales. Si alguna fecha ya está ocupada, se omite automáticamente.
                </p>

                {error && (
                  <p style={{ fontSize: '0.8rem', color: '#c0392b', marginBottom: '1rem', fontFamily: 'var(--font-inter)' }}>
                    ⚠️ {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleRepeat}
                    disabled={isPending}
                    style={{
                      flex: 1, padding: '0.65rem 1rem',
                      background: isPending ? 'rgba(0,71,64,0.4)' : '#004740',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      fontFamily: 'var(--font-montserrat)', fontWeight: 700,
                      fontSize: '0.85rem', cursor: isPending ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {isPending ? 'Creando…' : `Crear ${weeks} reservas`}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={isPending}
                    style={{
                      padding: '0.65rem 1rem',
                      background: 'transparent',
                      color: 'rgba(52,37,47,0.6)',
                      border: '1.5px solid rgba(52,37,47,0.15)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-montserrat)', fontWeight: 600,
                      fontSize: '0.85rem', cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
