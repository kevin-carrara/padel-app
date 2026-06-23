'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type DaySchedule = {
  active: boolean
  openTime: string
  closeTime: string
  slotDuration: number
}

const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = 7 + i
  return `${String(hour).padStart(2, '0')}:00`
})

const SLOT_OPTIONS = [
  { value: 60, label: '1 hora' },
  { value: 90, label: '1:30 hs' },
  { value: 120, label: '2 horas' },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function defaultSchedules(): DaySchedule[] {
  return DAYS.map((_, i) => ({
    active: i >= 1 && i <= 6,
    openTime: '08:00',
    closeTime: '22:00',
    slotDuration: 60,
  }))
}

interface Props {
  userId: string
  existingClubId?: string
  existingClubName?: string
}

export default function OnboardingWizard({ userId, existingClubId, existingClubName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  const [clubId, setClubId] = useState(existingClubId ?? '')
  const [clubForm, setClubForm] = useState({
    name: existingClubName ?? '',
    slug: existingClubId ? '' : (existingClubName ? slugify(existingClubName) : ''),
    address: '',
    phone: '',
  })

  const [courtId, setCourtId] = useState('')
  const [courtForm, setCourtForm] = useState({
    name: 'Cancha 1',
    surface: 'cristal',
    isIndoor: false,
    pricePerHour: '',
  })

  const [schedules, setSchedules] = useState<DaySchedule[]>(defaultSchedules())

  function updateDaySchedule(dayIndex: number, patch: Partial<DaySchedule>) {
    setSchedules(prev => prev.map((d, i) => i === dayIndex ? { ...d, ...patch } : d))
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (existingClubId) {
        const res = await fetch(`/api/clubs/${existingClubId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: clubForm.name, address: clubForm.address || undefined, phone: clubForm.phone || undefined }),
        })
        if (!res.ok) { toast.error('Error al actualizar el club'); return }
        setClubId(existingClubId)
      } else {
        const res = await fetch('/api/clubs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: clubForm.name, slug: clubForm.slug, address: clubForm.address || undefined, phone: clubForm.phone || undefined }),
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error ?? 'Error al crear el club')
          return
        }
        const { club } = await res.json()
        setClubId(club.id)
        const profileRes = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: club.id }),
        })
        if (!profileRes.ok) { toast.error('Error al vincular el club'); return }
      }
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!clubId) { toast.error('Club no configurado'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...courtForm, clubId, pricePerHour: Number(courtForm.pricePerHour) }),
      })
      if (!res.ok) { toast.error('Error al crear la cancha'); return }
      const { court } = await res.json()
      setCourtId(court.id)
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3() {
    if (!courtId) { toast.error('Cancha no configurada'); return }
    const activeDays = schedules
      .map((d, i) => ({ ...d, dayOfWeek: i }))
      .filter(d => d.active)
      .map(({ dayOfWeek, openTime, closeTime, slotDuration }) => ({ dayOfWeek, openTime, closeTime, slotDuration }))

    if (activeDays.length === 0) { toast.error('Seleccioná al menos un día'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/courts/${courtId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: activeDays }),
      })
      if (!res.ok) { toast.error('Error al guardar horarios'); return }
      toast.success('¡Club configurado con éxito!')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Tu Club' },
    { num: 2, label: 'Primera Cancha' },
    { num: 3, label: 'Horarios' },
  ]

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-montserrat)',
                fontWeight: 800,
                fontSize: '0.8rem',
                background: step > s.num ? '#004740' : step === s.num ? '#004740' : '#EBE9DF',
                color: step >= s.num ? '#fff' : 'rgba(52,37,47,0.4)',
                transition: 'all 0.2s',
              }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-montserrat)',
                color: step >= s.num ? '#004740' : 'rgba(52,37,47,0.35)',
              }}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                width: '5rem',
                height: '2px',
                background: step > s.num ? '#004740' : 'rgba(52,37,47,0.12)',
                margin: '0 0.5rem',
                marginBottom: '1.2rem',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card p-8 anim-in">
          <div className="section-label mb-1">Paso 1</div>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#34252F', marginBottom: '0.5rem' }}>
            Configura tu club
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '1.75rem' }}>
            Ingresá los datos básicos de tu club de padel.
          </p>
          <form onSubmit={handleStep1}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="label">Nombre del club *</label>
                <input
                  required
                  className="input"
                  value={clubForm.name}
                  onChange={e => {
                    const name = e.target.value
                    setClubForm(prev => ({ ...prev, name, slug: existingClubId ? prev.slug : slugify(name) }))
                  }}
                  placeholder="Mi Club de Pádel"
                />
              </div>
              {!existingClubId && (
                <div className="form-group">
                  <label className="label">URL pública</label>
                  <div className="flex items-center" style={{ background: '#EBE9DF', borderRadius: '0.5rem', padding: '0 0.75rem', border: '1px solid rgba(52,37,47,0.15)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
                      padelbook.com/
                    </span>
                    <input
                      className="input"
                      style={{ border: 'none', background: 'transparent', paddingLeft: '0.25rem' }}
                      value={clubForm.slug}
                      onChange={e => setClubForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="mi-club"
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="label">Dirección</label>
                <input className="input" value={clubForm.address} onChange={e => setClubForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Av. Siempre Viva 742" />
              </div>
              <div className="form-group">
                <label className="label">Teléfono</label>
                <input className="input" value={clubForm.phone} onChange={e => setClubForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+54 351 000-0000" />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Guardando…' : 'Siguiente →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card p-8 anim-in">
          <div className="section-label mb-1">Paso 2</div>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#34252F', marginBottom: '0.5rem' }}>
            Tu primera cancha
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '1.75rem' }}>
            Configurá los detalles de tu primera cancha de pádel.
          </p>
          <form onSubmit={handleStep2}>
            <div className="space-y-4">
              <div className="form-group">
                <label className="label">Nombre de la cancha *</label>
                <input required className="input" value={courtForm.name} onChange={e => setCourtForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Cancha 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Superficie</label>
                  <select className="input" value={courtForm.surface} onChange={e => setCourtForm(prev => ({ ...prev, surface: e.target.value }))}>
                    <option value="cristal">Cristal</option>
                    <option value="moqueta">Moqueta</option>
                    <option value="cemento">Cemento</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Precio por hora ($) *</label>
                  <input required type="number" className="input" value={courtForm.pricePerHour} onChange={e => setCourtForm(prev => ({ ...prev, pricePerHour: e.target.value }))} placeholder="8000" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.6)', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                  <input type="checkbox" checked={courtForm.isIndoor} onChange={e => setCourtForm(prev => ({ ...prev, isIndoor: e.target.checked }))} className="rounded" />
                  ¿Techada?
                </label>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
                ← Atrás
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Guardando…' : 'Siguiente →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card p-8 anim-in">
          <div className="section-label mb-1">Paso 3</div>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#34252F', marginBottom: '0.5rem' }}>
            Horarios de apertura
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '1.75rem' }}>
            Configurá los horarios de operación de tu cancha.
          </p>

          {/* Day toggles */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {DAYS.map((day, di) => (
              <button
                key={di}
                type="button"
                onClick={() => updateDaySchedule(di, { active: !schedules[di].active })}
                style={{
                  background: schedules[di].active ? '#004740' : 'transparent',
                  color: schedules[di].active ? '#fff' : 'rgba(52,37,47,0.5)',
                  border: `1px solid ${schedules[di].active ? '#004740' : 'rgba(52,37,47,0.2)'}`,
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-montserrat)',
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Active day rows */}
          <div className="space-y-3 mb-6">
            {DAYS.map((day, di) => {
              if (!schedules[di].active) return null
              return (
                <div key={di} className="flex items-center gap-3 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#34252F', fontFamily: 'var(--font-montserrat)', width: '2.5rem' }}>
                    {day}
                  </span>
                  <div className="flex items-center gap-2">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Apertura</label>
                    <select className="input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }} value={schedules[di].openTime} onChange={e => updateDaySchedule(di, { openTime: e.target.value })}>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Cierre</label>
                    <select className="input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }} value={schedules[di].closeTime} onChange={e => updateDaySchedule(di, { closeTime: e.target.value })}>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Turno</label>
                    <select className="input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }} value={schedules[di].slotDuration} onChange={e => updateDaySchedule(di, { slotDuration: Number(e.target.value) })}>
                      {SLOT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="btn btn-ghost">
              ← Atrás
            </button>
            <button onClick={handleStep3} disabled={loading} className="btn btn-primary btn-lg">
              {loading ? 'Guardando…' : 'Completar configuración ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}