'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { TimeSlot } from '@/types'
import {
  CourtBasketball,
  CalendarDots,
  User,
  CalendarBlank,
  Timer,
  Racquet,
} from '@phosphor-icons/react'

type CourtOption = {
  id: string
  name: string
  pricePerHour: number
}

const DURATIONS = [
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '2 hs', value: 120 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Check if N consecutive slots starting at index are all available
function isRangeAvailable(slots: TimeSlot[], startIndex: number, durationMin: number): boolean {
  if (slots.length === 0) return false
  const slotMin = slots.length > 1
    ? timeToMin(slots[1].start) - timeToMin(slots[0].start)
    : 60
  const slotsNeeded = Math.ceil(durationMin / slotMin)
  for (let i = startIndex; i < startIndex + slotsNeeded; i++) {
    if (i >= slots.length || !slots[i].available) return false
  }
  return true
}
function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function minToTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export default function NewBookingForm({ courts }: { courts: CourtOption[] }) {
  const router = useRouter()

  const [courtId, setCourtId] = useState(courts[0]?.id ?? '')
  const [date, setDate] = useState(todayStr())
  const [durationMin, setDurationMin] = useState(60)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [playerPhone, setPlayerPhone] = useState('')
  const [notes, setNotes] = useState('')

  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const selectedCourt = courts.find(c => c.id === courtId)

  // Load availability whenever court or date changes
  const loadSlots = useCallback(async (cId: string, d: string) => {
    if (!cId || !d) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    try {
      const res = await fetch(`/api/courts/${cId}/availability?date=${d}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSlots(courtId, date)
  }, [courtId, date, loadSlots])

  // Reset slot selection when duration changes
  useEffect(() => {
    setSelectedSlot(null)
  }, [durationMin])

  const selectedSlotIndex = slots.findIndex(s => s.start === selectedSlot)
  const slotMin = slots.length > 1 ? timeToMin(slots[1].start) - timeToMin(slots[0].start) : 60
  const endTime = selectedSlot ? minToTime(timeToMin(selectedSlot) + durationMin) : null
  const totalPrice = selectedCourt ? selectedCourt.pricePerHour * (durationMin / 60) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!courtId || !selectedSlot || !playerName.trim()) return
    setSubmitting(true)

    const start = new Date(`${date}T${selectedSlot}:00`)
    const end = new Date(`${date}T${endTime}:00`)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        playerName: playerName.trim(),
        playerPhone: playerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    })

    const payload = await res.json()
    if (!res.ok) {
      toast.error(typeof payload.error === 'string' ? payload.error : 'No se pudo crear la reserva')
      setSubmitting(false)
      return
    }

    toast.success('¡Reserva creada!')
    router.push('/dashboard/bookings')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── STEP 1: Court selector ── */}
      <div className="card p-5">
        <p className="label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#004740', borderRadius: '8px', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CourtBasketball size={14} color="#fff" weight="fill" />
          </span>
          Elegí la cancha
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {courts.map(c => {
            const active = courtId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCourtId(c.id)}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: active ? '2px solid #004740' : '2px solid rgba(52,37,47,0.12)',
                  background: active ? '#004740' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.9rem', color: active ? '#fff' : '#34252F', marginBottom: '0.2rem' }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: active ? 'rgba(255,255,255,0.65)' : 'rgba(52,37,47,0.45)' }}>
                  ${c.pricePerHour.toLocaleString('es-AR')}/h
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 2: Date + Duration + Slots ── */}
      <div className="card p-5">
        <p className="label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#004740', borderRadius: '8px', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarDots size={14} color="#fff" weight="fill" />
          </span>
          Fecha y horario
        </p>

        {/* Date + duration row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
            <label className="label" style={{ marginBottom: '0.4rem' }}>Fecha</label>
            <input
              type="date"
              className="input"
              value={date}
              min={todayStr()}
              onChange={e => setDate(e.target.value)}
              style={{ fontFamily: 'var(--font-inter)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingBottom: '2px' }}>
            {[{ label: 'Hoy', val: todayStr() }, { label: 'Mañana', val: tomorrowStr() }].map(({ label, val }) => (
              <button
                key={label}
                type="button"
                onClick={() => setDate(val)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '99px',
                  border: date === val ? '1.5px solid #004740' : '1.5px solid rgba(52,37,47,0.15)',
                  background: date === val ? '#004740' : 'transparent',
                  color: date === val ? '#fff' : 'rgba(52,37,47,0.55)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingBottom: '2px' }}>
            {DURATIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDurationMin(value)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '99px',
                  border: durationMin === value ? '1.5px solid #AE552D' : '1.5px solid rgba(52,37,47,0.15)',
                  background: durationMin === value ? '#AE552D' : 'transparent',
                  color: durationMin === value ? '#fff' : 'rgba(52,37,47,0.55)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Slots grid */}
        {slotsLoading ? (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(0,71,64,0.15)', borderTopColor: '#004740', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(52,37,47,0.4)', marginTop: '0.5rem' }}>Cargando disponibilidad…</p>
          </div>
        ) : slots.length === 0 ? (
          <div style={{ padding: '1.5rem', background: 'rgba(52,37,47,0.04)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'rgba(52,37,47,0.4)' }}>
              Sin horarios disponibles para {formatDateLabel(date)}.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {slots.map((slot, i) => {
                const canBook = isRangeAvailable(slots, i, durationMin)
                const isSelected = selectedSlot === slot.start
                const wouldCover = selectedSlot !== null &&
                  i > selectedSlotIndex &&
                  i < selectedSlotIndex + Math.ceil(durationMin / slotMin)

                let bg = '#fff'
                let borderColor = 'rgba(52,37,47,0.12)'
                let textColor = '#34252F'
                let cursor = 'pointer'

                if (!slot.available) {
                  bg = 'rgba(52,37,47,0.05)'
                  borderColor = 'transparent'
                  textColor = 'rgba(52,37,47,0.25)'
                  cursor = 'not-allowed'
                } else if (isSelected) {
                  bg = '#004740'
                  borderColor = '#004740'
                  textColor = '#fff'
                } else if (wouldCover) {
                  bg = 'rgba(0,71,64,0.08)'
                  borderColor = 'rgba(0,71,64,0.3)'
                  textColor = '#004740'
                } else if (!canBook) {
                  bg = 'rgba(52,37,47,0.05)'
                  borderColor = 'transparent'
                  textColor = 'rgba(52,37,47,0.25)'
                  cursor = 'not-allowed'
                }

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={!canBook}
                    onClick={() => setSelectedSlot(isSelected ? null : slot.start)}
                    title={!slot.available ? 'Ocupado' : !canBook ? `No hay ${durationMin} min disponibles desde aquí` : ''}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${borderColor}`,
                      background: bg,
                      color: textColor,
                      fontFamily: 'var(--font-montserrat)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor,
                      transition: 'all 0.12s',
                      position: 'relative',
                      minWidth: '70px',
                    }}
                  >
                    {slot.start}
                    {!slot.available && (
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'rgba(52,37,47,0.3)', paddingTop: '14px' }}>●</span>
                    )}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { bg: '#004740', label: 'Seleccionado' },
                { bg: '#fff', border: 'rgba(52,37,47,0.12)', label: 'Disponible' },
                { bg: 'rgba(52,37,47,0.05)', label: 'Ocupado' },
              ].map(({ bg, border, label }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'rgba(52,37,47,0.45)' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: bg, border: border ? `1.5px solid ${border}` : 'none', flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── STEP 3: Player info + summary ── */}
      <div className="card p-5">
        <p className="label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#004740', borderRadius: '8px', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={14} color="#fff" weight="fill" />
          </span>
          Datos del jugador
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Nombre *</label>
            <input
              type="text"
              className="input"
              required
              minLength={2}
              placeholder="Carlos García"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Teléfono</label>
            <input
              type="tel"
              className="input"
              placeholder="351 000 0000"
              value={playerPhone}
              onChange={e => setPlayerPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: '0 0 1.25rem' }}>
          <label className="label">Notas</label>
          <textarea
            className="input"
            style={{ minHeight: '72px', resize: 'none' }}
            placeholder="Info adicional…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Summary strip */}
        {selectedSlot && (
          <div style={{ background: 'rgba(0,71,64,0.06)', border: '1px solid rgba(0,71,64,0.15)', borderRadius: '10px', padding: '0.875rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CalendarBlank size={14} color="#004740" weight="fill" />
              <strong style={{ color: '#34252F' }}>{formatDateLabel(date)}</strong>
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Timer size={14} color="#004740" weight="fill" />
              <strong style={{ color: '#34252F' }}>{selectedSlot} → {endTime}</strong>
              <span style={{ color: 'rgba(52,37,47,0.4)' }}>({durationMin} min)</span>
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(52,37,47,0.55)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Racquet size={14} color="#004740" weight="fill" />
              <strong style={{ color: '#34252F' }}>{selectedCourt?.name}</strong>
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.05rem', color: '#004740' }}>
              ${totalPrice.toLocaleString('es-AR')}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !selectedSlot || !playerName.trim()}
          className="btn btn-primary btn-lg"
          style={{ opacity: (!selectedSlot || !playerName.trim()) ? 0.5 : 1 }}
        >
          {submitting ? 'Guardando…' : selectedSlot ? `Confirmar reserva · $${totalPrice.toLocaleString('es-AR')}` : 'Elegí un horario para continuar'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}