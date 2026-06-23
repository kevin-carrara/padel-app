'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CancelBookingButtonProps {
  bookingId: string
  playerName: string
  startTime: string
}

export default function CancelBookingButton({ bookingId, playerName, startTime }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCancel() {
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancelReason: reason || null }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al cancelar')
      }
    })
  }

  const timeLabel = new Date(startTime).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: '0.7rem',
          fontFamily: 'var(--font-montserrat)',
          fontWeight: 700,
          color: '#AE552D',
          background: 'rgba(174,85,45,0.08)',
          border: '1px solid rgba(174,85,45,0.2)',
          borderRadius: '6px',
          padding: '3px 8px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(174,85,45,0.16)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(174,85,45,0.08)')}
      >
        Cancelar
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(52,37,47,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="card anim-up"
            style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700,
              color: '#34252F', marginBottom: '0.5rem',
            }}>
              Cancelar reserva
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#34252F' }}>{playerName}</strong> — {timeLabel}
            </p>

            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-montserrat)', display: 'block', marginBottom: '0.4rem' }}>
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ej: El jugador avisó que no puede"
              style={{
                width: '100%', padding: '0.6rem 0.875rem',
                borderRadius: '8px', border: '1.5px solid rgba(52,37,47,0.15)',
                fontFamily: 'var(--font-inter)', fontSize: '0.875rem',
                color: '#34252F', background: '#FAFAF8',
                outline: 'none', marginBottom: '1.25rem',
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <p style={{ fontSize: '0.8rem', color: '#c0392b', marginBottom: '1rem', fontFamily: 'var(--font-inter)' }}>
                ⚠️ {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isPending}
                style={{
                  flex: 1, padding: '0.65rem 1rem',
                  background: isPending ? 'rgba(174,85,45,0.4)' : '#AE552D',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontFamily: 'var(--font-montserrat)', fontWeight: 700,
                  fontSize: '0.85rem', cursor: isPending ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {isPending ? 'Cancelando…' : 'Confirmar cancelación'}
              </button>
              <button
                onClick={() => { setOpen(false); setError('') }}
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
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
