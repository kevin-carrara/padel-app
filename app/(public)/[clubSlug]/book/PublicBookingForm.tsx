'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, Clock, CreditCard, MapPin, ArrowLeft, Check } from '@phosphor-icons/react/dist/ssr'

type CourtOption = { id: string; name: string }
type TimeSlot = { start: string; end: string; available: boolean; price: number }

export default function PublicBookingForm({
  clubSlug,
  courts,
  slots,
}: {
  clubSlug: string
  courts: CourtOption[]
  slots: TimeSlot[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [playerName, setPlayerName] = useState('')
  const [playerPhone, setPlayerPhone] = useState('')
  const [ballsSelected, setBallsSelected] = useState(false)
  const [racketsSelected, setRacketsSelected] = useState(false)
  const [racketCount, setRacketCount] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'at_club'>('at_club')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [createdRef, setCreatedRef] = useState('')

  const selectedCourtId = searchParams.get('courtId') ?? courts[0]?.id ?? ''
  const selectedDate = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  const slotMap = useMemo(() => new Map(slots.map(s => [s.start, s])), [slots])
  const selectedSlotData = slotMap.get(selectedSlot)

  const basePrice = selectedSlotData?.price ?? 0
  const ballsPrice = ballsSelected ? 500 : 0
  const racketsPrice = racketsSelected ? 1500 * racketCount : 0
  const totalPrice = basePrice + ballsPrice + racketsPrice

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const slot = slotMap.get(selectedSlot)
    if (!slot || !selectedCourtId) return
    setLoading(true)
    const start = new Date(`${selectedDate}T${slot.start}:00`)
    const end = new Date(`${selectedDate}T${slot.end}:00`)
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId: selectedCourtId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        playerName,
        playerPhone: playerPhone || undefined,
      }),
    })
    const payload = await response.json()
    if (!response.ok) {
      toast.error(typeof payload.error === 'string' ? payload.error : 'No se pudo reservar')
      setLoading(false)
      return
    }
    toast.success('Reserva confirmada!')
    setCreatedRef(payload.id ? payload.id.slice(0, 8).toUpperCase() : 'PB' + Date.now().toString(36).toUpperCase())
    setBookingSuccess(true)
    setLoading(false)
  }

  if (bookingSuccess) {
    const courtName = courts.find(c => c.id === selectedCourtId)?.name ?? 'Cancha'
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="card p-8 text-center"
          style={{ borderTop: '4px solid #004740' }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px', background: 'rgba(22,163,74,0.1)' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: '#34252F', marginBottom: '0.5rem' }}>
            ¡Turno Asegurado!
          </h2>
          <p style={{ color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)', marginBottom: '1.5rem' }}>
            Tu reserva fue confirmada exitosamente.
          </p>

          <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: '#EBE9DF' }}>
            <div className="section-label mb-3">Referencia de reserva</div>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#004740', letterSpacing: '0.05em' }}>
              #{createdRef}
            </p>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center gap-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', background: 'rgba(0,71,64,0.08)' }}>
                <Check size={16} color="#004740" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)', fontSize: '0.9rem' }}>{playerName}</p>
                <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>Jugador</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', background: 'rgba(0,71,64,0.08)' }}>
                <Clock size={16} color="#004740" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)', fontSize: '0.9rem' }}>
                  {selectedSlotData?.start} - {selectedSlotData?.end}
                </p>
                <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>{selectedDate} · {courtName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', background: 'rgba(174,85,45,0.1)' }}>
                <CreditCard size={16} color="#AE552D" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#AE552D', fontFamily: 'var(--font-montserrat)', fontSize: '1rem' }}>
                  ${totalPrice.toLocaleString('es-AR')}
                </p>
                <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>
                  {paymentMethod === 'at_club' ? 'Pagar en el club' : 'Tarjeta / Online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setBookingSuccess(false)
                setSelectedSlot('')
                setPlayerName('')
                setPlayerPhone('')
                setBallsSelected(false)
                setRacketsSelected(false)
                setRacketCount(1)
                setPaymentMethod('at_club')
              }}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Reservar otro turno
            </button>
            <a
              href={`/${clubSlug}`}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem' }}
            >
              <ArrowLeft size={16} /> Volver al club
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Left: Slot picker + addons */}
      <div className="space-y-5">
        {/* Court + Date selector */}
        <div className="card overflow-hidden">
          <div
            className="px-5 py-4 flex flex-wrap items-end gap-4"
            style={{ borderBottom: '1px solid rgba(52,37,47,0.08)', background: '#EBE9DF' }}
          >
            <div className="form-group mb-0">
              <label className="label">Cancha</label>
              <select
                value={selectedCourtId}
                onChange={e => {
                  const p = new URLSearchParams(searchParams.toString())
                  p.set('courtId', e.target.value)
                  p.set('date', selectedDate)
                  router.replace(`/${clubSlug}/book?${p.toString()}`)
                }}
                className="input"
                style={{ width: 'auto' }}
              >
                {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="label">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => {
                  const p = new URLSearchParams(searchParams.toString())
                  p.set('courtId', selectedCourtId)
                  p.set('date', e.target.value)
                  router.replace(`/${clubSlug}/book?${p.toString()}`)
                }}
                className="input"
                style={{ width: 'auto' }}
              />
            </div>
          </div>

          {/* Time slots */}
          <div className="p-5">
            {slots.length === 0 ? (
              <div className="py-12 text-center rounded-xl diagonal-stripe">
                <p style={{ color: 'rgba(52,37,47,0.4)', fontSize: '0.875rem' }}>
                  No hay horarios configurados para esta cancha y fecha.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'rgba(52,37,47,0.4)', marginBottom: '1rem', fontFamily: 'var(--font-montserrat)' }}>
                  Selecciona un horario
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  {slots.map(slot => {
                    const isSelected = selectedSlot === slot.start
                    const isUnavailable = !slot.available
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => slot.available && setSelectedSlot(slot.start)}
                        disabled={isUnavailable}
                        className="text-left rounded-xl p-3 transition-all duration-150 relative overflow-hidden"
                        style={{
                          background: isSelected ? '#004740' : isUnavailable ? '#EBE9DF' : '#FFFFFF',
                          border: isSelected ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.1)',
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,71,64,0.25)' : 'none',
                          opacity: isUnavailable ? 0.5 : 1,
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 right-0" style={{ height: '3px', borderRadius: '12px 12px 0 0', background: '#AE552D' }} />
                        )}
                        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#FFFFFF' : isUnavailable ? 'rgba(52,37,47,0.3)' : '#34252F', lineHeight: 1 }}>
                          {slot.start}
                        </p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem', color: isSelected ? 'rgba(255,255,255,0.65)' : isUnavailable ? 'rgba(52,37,47,0.25)' : 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-montserrat)' }}>
                          {isUnavailable ? 'Ocupado' : `$${slot.price.toLocaleString('es-AR')}`}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Equipment addons — shown when slot selected */}
        {selectedSlot && (
          <div className="card p-5">
            <div className="section-label mb-4">Adicionales</div>
            <div className="space-y-3">
              {/* Balls */}
              <button
                type="button"
                onClick={() => setBallsSelected(b => !b)}
                className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                style={{
                  background: ballsSelected ? 'rgba(0,71,64,0.06)' : '#FFFFFF',
                  border: ballsSelected ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.1)',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '1.5rem' }}>🎾</span>
                  <div className="text-left">
                    <p style={{ fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', fontSize: '0.9rem' }}>Pelotas</p>
                    <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>Incluye 3 pelotas nuevas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontWeight: 700, color: '#AE552D', fontFamily: 'var(--font-montserrat)' }}>+$500</span>
                  <div className="rounded-full flex items-center justify-center" style={{ width: '24px', height: '24px', background: ballsSelected ? '#004740' : 'rgba(52,37,47,0.08)' }}>
                    {ballsSelected && <Check size={14} color="#FFFFFF" />}
                  </div>
                </div>
              </button>

              {/* Rackets */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: racketsSelected ? 'rgba(0,71,64,0.06)' : '#FFFFFF',
                  border: racketsSelected ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRacketsSelected(r => !r)}
                    className="flex items-center gap-3"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🏓</span>
                    <div className="text-left">
                      <p style={{ fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', fontSize: '0.9rem' }}>Paletas</p>
                      <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>Alquiler por turno</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 700, color: '#AE552D', fontFamily: 'var(--font-montserrat)' }}>+$1500/u</span>
                    <div className="rounded-full flex items-center justify-center" style={{ width: '24px', height: '24px', background: racketsSelected ? '#004740' : 'rgba(52,37,47,0.08)' }}>
                      {racketsSelected && <Check size={14} color="#FFFFFF" />}
                    </div>
                  </div>
                </div>
                {racketsSelected && (
                  <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgba(52,37,47,0.08)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)' }}>Cantidad:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRacketCount(n => Math.max(1, n - 1))}
                        className="rounded-full flex items-center justify-center"
                        style={{ width: '28px', height: '28px', background: 'rgba(52,37,47,0.08)', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#34252F' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', minWidth: '20px', textAlign: 'center' }}>
                        {racketCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRacketCount(n => Math.min(4, n + 1))}
                        className="rounded-full flex items-center justify-center"
                        style={{ width: '28px', height: '28px', background: '#004740', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#FFFFFF' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Confirm form */}
      <form onSubmit={handleSubmit} className="card card-accent p-6 h-fit space-y-4 sticky top-6">
        <div>
          <div className="section-label mb-1">Confirmar</div>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.4rem', fontWeight: 800, color: '#34252F', lineHeight: 1 }}>
            Tu reserva
          </h2>
        </div>

        {/* Slot summary */}
        <div
          className="rounded-xl p-4"
          style={{
            background: selectedSlotData ? '#004740' : '#EBE9DF',
            border: selectedSlotData ? 'none' : '1.5px solid rgba(52,37,47,0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          {selectedSlotData ? (
            <>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                {selectedSlotData.start} - {selectedSlotData.end}
              </p>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                ${selectedSlotData.price.toLocaleString('es-AR')} · {selectedDate}
              </p>
            </>
          ) : (
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-inter)' }}>
              Elegi un horario disponible
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="label">Tu nombre</label>
          <input
            type="text"
            required
            minLength={2}
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Juan Garcia"
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Teléfono (opcional)</label>
          <input
            type="tel"
            value={playerPhone}
            onChange={e => setPlayerPhone(e.target.value)}
            placeholder="+54 9 351 000 0000"
            className="input"
          />
        </div>

        {/* Payment method */}
        <div>
          <label className="label">Método de pago</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
              style={{
                background: paymentMethod === 'card' ? 'rgba(0,71,64,0.08)' : '#FFFFFF',
                border: paymentMethod === 'card' ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.1)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', textAlign: 'center' }}>
                Tarjeta / Online
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('at_club')}
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
              style={{
                background: paymentMethod === 'at_club' ? 'rgba(0,71,64,0.08)' : '#FFFFFF',
                border: paymentMethod === 'at_club' ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.1)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🏠</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', textAlign: 'center' }}>
                Pagar en el club
              </span>
            </button>
          </div>
        </div>

        {/* Price summary */}
        {selectedSlotData && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: '#EBE9DF' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)' }}>Cancha</span>
              <span style={{ fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>${basePrice.toLocaleString('es-AR')}</span>
            </div>
            {ballsSelected && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)' }}>Pelotas</span>
                <span style={{ fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>$500</span>
              </div>
            )}
            {racketsSelected && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)' }}>Paletas x{racketCount}</span>
                <span style={{ fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>${racketsPrice.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(52,37,47,0.1)' }}>
              <span style={{ fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)', fontSize: '0.875rem' }}>Total</span>
              <span style={{ fontWeight: 800, color: '#AE552D', fontFamily: 'var(--font-montserrat)', fontSize: '1.1rem' }}>${totalPrice.toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedSlot || !selectedCourtId}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Reservando...' : 'Confirmar reserva'}
        </button>
      </form>
    </div>
  )
}