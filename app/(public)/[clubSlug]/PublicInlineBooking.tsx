'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { TimeSlot } from '@/types'

type Court = {
  id: string
  name: string
  surface: string
  isIndoor: boolean
  pricePerHour: number
}

interface Props {
  courts: Court[]
  clubId: string
}

const DURATIONS = [
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '2 hs', value: 120 },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
}
function formatDateShort(ds: string) {
  return new Date(ds + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function timeToMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minToTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}
function isRangeAvailable(slots: TimeSlot[], startIndex: number, durationMin: number): boolean {
  if (!slots.length) return false
  const slotMin = slots.length > 1 ? timeToMin(slots[1].start) - timeToMin(slots[0].start) : 60
  const needed = Math.ceil(durationMin / slotMin)
  for (let i = startIndex; i < startIndex + needed; i++) {
    if (i >= slots.length || !slots[i].available) return false
  }
  return true
}

type Step = 'pick' | 'confirm' | 'done'

export default function PublicInlineBooking({ courts, clubId }: Props) {
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '')
  const [date, setDate] = useState(todayStr())
  const [durationMin, setDurationMin] = useState(60)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerPhone, setPlayerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<Step>('pick')

  const selectedCourt = courts.find(c => c.id === courtId)
  const slotMin = slots.length > 1 ? timeToMin(slots[1].start) - timeToMin(slots[0].start) : 60
  const selectedSlotIndex = slots.findIndex(s => s.start === selectedSlot)
  const endTime = selectedSlot ? minToTime(timeToMin(selectedSlot) + durationMin) : null
  const totalPrice = selectedCourt ? selectedCourt.pricePerHour * (durationMin / 60) : 0

  const loadSlots = useCallback(async (cId: string, d: string) => {
    if (!cId || !d) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    try {
      const res = await fetch(`/api/courts/${cId}/availability?date=${d}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch { setSlots([]) }
    finally { setSlotsLoading(false) }
  }, [])

  useEffect(() => { loadSlots(courtId, date) }, [courtId, date, loadSlots])
  useEffect(() => { setSelectedSlot(null) }, [durationMin])

  async function handleConfirm() {
    if (!selectedSlot || !playerName.trim() || !endTime) return
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
      }),
    })
    const payload = await res.json()
    if (!res.ok) {
      toast.error(typeof payload.error === 'string' ? payload.error : 'No se pudo crear la reserva')
      setSubmitting(false)
      return
    }
    setStep('done')
    setSubmitting(false)
  }

  if (step === 'done') {
    return (
      <div className="card p-8 text-center" style={{ borderTop: '4px solid #004740' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎾</div>
        <h3 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.25rem', color: '#004740', marginBottom: '0.5rem' }}>
          ¡Reserva confirmada!
        </h3>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'rgba(52,37,47,0.6)', marginBottom: '1.25rem' }}>
          {selectedCourt?.name} · {formatDateShort(date)} · {selectedSlot} → {endTime}
        </p>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.5rem', color: '#AE552D', marginBottom: '1.5rem' }}>
          ${totalPrice.toLocaleString('es-AR')}
        </p>
        <button
          onClick={() => { setStep('pick'); setSelectedSlot(null); setPlayerName(''); setPlayerPhone('') }}
          className="btn btn-secondary btn-sm"
        >
          Hacer otra reserva
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="section-label mb-3">Reservar ahora</div>

      {/* Court selector — if multiple courts */}
      {courts.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {courts.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourtId(c.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '99px',
                border: courtId === c.id ? '1.5px solid #004740' : '1.5px solid rgba(52,37,47,0.15)',
                background: courtId === c.id ? '#004740' : 'transparent',
                color: courtId === c.id ? '#fff' : 'rgba(52,37,47,0.55)',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >{c.name}</button>
          ))}
        </div>
      )}

      {/* Date quick-picks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={e => setDate(e.target.value)}
          className="input"
          style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
        />
        {[{ label: 'Hoy', val: todayStr() }, { label: 'Mañana', val: tomorrowStr() }].map(({ label, val }) => (
          <button
            key={label}
            type="button"
            onClick={() => setDate(val)}
            style={{
              padding: '0.4rem 0.75rem',
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

      {/* Duration */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {DURATIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDurationMin(value)}
            style={{
              padding: '0.35rem 0.75rem',
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

      {/* Slots */}
      {slotsLoading ? (
        <div style={{ padding: '1.25rem 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(0,71,64,0.15)', borderTopColor: '#004740', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : slots.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(52,37,47,0.4)', padding: '0.75rem 0' }}>
          Sin horarios para este día.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {slots.map((slot, i) => {
            const canBook = isRangeAvailable(slots, i, durationMin)
            const isSelected = selectedSlot === slot.start
            const wouldCover = selectedSlot !== null && i > selectedSlotIndex && i < selectedSlotIndex + Math.ceil(durationMin / slotMin)
            let bg = '#fff', border = 'rgba(52,37,47,0.12)', color = '#34252F', cursor = 'pointer'
            if (!slot.available || !canBook) { bg = 'rgba(52,37,47,0.05)'; border = 'transparent'; color = 'rgba(52,37,47,0.25)'; cursor = 'not-allowed' }
            else if (isSelected) { bg = '#004740'; border = '#004740'; color = '#fff' }
            else if (wouldCover) { bg = 'rgba(0,71,64,0.08)'; border = 'rgba(0,71,64,0.3)'; color = '#004740' }
            return (
              <button
                key={slot.start}
                type="button"
                disabled={!canBook || !slot.available}
                onClick={() => setSelectedSlot(isSelected ? null : slot.start)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '7px', border: `1.5px solid ${border}`, background: bg, color, fontFamily: 'var(--font-montserrat)', fontWeight: 600, fontSize: '0.78rem', cursor, transition: 'all 0.12s' }}
              >{slot.start}</button>
            )
          })}
        </div>
      )}

      {/* Selected slot summary */}
      {selectedSlot && step === 'pick' && (
        <div style={{ background: 'rgba(0,71,64,0.06)', border: '1px solid rgba(0,71,64,0.15)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: '#34252F', marginBottom: '0.15rem' }}>
            <strong>{selectedCourt?.name}</strong> · {formatDateShort(date)} · {selectedSlot}–{endTime}
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.1rem', color: '#004740' }}>
            ${totalPrice.toLocaleString('es-AR')}
          </p>
        </div>
      )}

      {/* Player form — show when slot selected */}
      {selectedSlot && step === 'pick' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Tu nombre *"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
          />
          <input
            type="tel"
            className="input"
            placeholder="Teléfono (opcional)"
            value={playerPhone}
            onChange={e => setPlayerPhone(e.target.value)}
            style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
          />
        </div>
      )}

      <button
        type="button"
        disabled={!selectedSlot || !playerName.trim() || submitting}
        onClick={handleConfirm}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', opacity: (!selectedSlot || !playerName.trim()) ? 0.5 : 1 }}
      >
        {submitting ? 'Confirmando…' : selectedSlot && playerName.trim() ? `Confirmar · $${totalPrice.toLocaleString('es-AR')}` : selectedSlot ? 'Ingresá tu nombre' : 'Elegí un horario'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
