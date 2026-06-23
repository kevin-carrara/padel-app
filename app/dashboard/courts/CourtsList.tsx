'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type DaySchedule = {
  active: boolean
  openTime: string
  closeTime: string
  slotDuration: number
}

type Court = {
  id: string
  name: string
  surface: string
  isIndoor: boolean
  isActive: boolean
  pricePerHour: number | string
  schedules: { dayOfWeek: number; openTime: string; closeTime: string; slotDuration: number }[]
  _count: { bookings: number }
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

function initDaySchedules(schedules: Court['schedules']): DaySchedule[] {
  return DAYS.map((_, dayIndex) => {
    const existing = schedules.find(s => s.dayOfWeek === dayIndex)
    if (existing) {
      return { active: true, openTime: existing.openTime, closeTime: existing.closeTime, slotDuration: existing.slotDuration }
    }
    return { active: false, openTime: '08:00', closeTime: '22:00', slotDuration: 60 }
  })
}

export default function CourtsList({ courts: initial, clubId }: { courts: Court[]; clubId: string }) {
  const [courts, setCourts] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', surface: 'cristal', pricePerHour: '', isIndoor: false })
  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(null)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [editSchedules, setEditSchedules] = useState<Record<string, DaySchedule[]>>({})

  function setF(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function getScheduleForCourt(court: Court): DaySchedule[] {
    if (editSchedules[court.id]) return editSchedules[court.id]
    return initDaySchedules(court.schedules)
  }

  function toggleExpand(court: Court) {
    if (expandedCourtId === court.id) {
      setExpandedCourtId(null)
    } else {
      setExpandedCourtId(court.id)
      if (!editSchedules[court.id]) {
        setEditSchedules(prev => ({ ...prev, [court.id]: initDaySchedules(court.schedules) }))
      }
    }
  }

  function updateDaySchedule(courtId: string, dayIndex: number, patch: Partial<DaySchedule>) {
    setEditSchedules(prev => {
      const days = prev[courtId] ?? initDaySchedules(courts.find(c => c.id === courtId)?.schedules ?? [])
      const updated = days.map((d, i) => i === dayIndex ? { ...d, ...patch } : d)
      return { ...prev, [courtId]: updated }
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/courts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clubId, pricePerHour: Number(form.pricePerHour) }),
    })
    if (!res.ok) { toast.error('Error al crear la cancha'); setCreating(false); return }
    const { court } = await res.json()
    setCourts(prev => [...prev, { ...court, schedules: [], _count: { bookings: 0 } }])
    setForm({ name: '', surface: 'cristal', pricePerHour: '', isIndoor: false })
    setCreating(false)
    toast.success('Cancha creada')
  }

  async function toggleActive(courtId: string, current: boolean) {
    const res = await fetch(`/api/courts/${courtId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (!res.ok) { toast.error('Error al actualizar'); return }
    setCourts(prev => prev.map(c => c.id === courtId ? { ...c, isActive: !current } : c))
  }

  async function saveSchedules(courtId: string) {
    const days = editSchedules[courtId]
    if (!days) return
    const activeDays = days
      .map((d, i) => ({ ...d, dayOfWeek: i }))
      .filter(d => d.active)
      .map(({ dayOfWeek, openTime, closeTime, slotDuration }) => ({ dayOfWeek, openTime, closeTime, slotDuration }))

    if (activeDays.length === 0) {
      toast.error('Seleccioná al menos un día')
      return
    }

    setSavingSchedule(true)
    const res = await fetch(`/api/courts/${courtId}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedules: activeDays }),
    })

    if (!res.ok) { toast.error('Error al guardar horarios'); setSavingSchedule(false); return }
    const { schedules } = await res.json()
    setCourts(prev => prev.map(c => c.id === courtId ? { ...c, schedules } : c))
    setExpandedCourtId(null)
    setSavingSchedule(false)
    toast.success('Horarios guardados')
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="card p-6">
        <div className="section-label mb-1">Agregar</div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.25rem', fontWeight: 800, color: '#34252F', marginBottom: '1.25rem' }}>
          Nueva cancha
        </h2>
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="form-group">
              <label className="label">Nombre</label>
              <input required className="input" value={form.name} onChange={setF('name')} placeholder="Cancha 1" />
            </div>
            <div className="form-group">
              <label className="label">Precio/hora ($)</label>
              <input required type="number" className="input" value={form.pricePerHour} onChange={setF('pricePerHour')} placeholder="8000" />
            </div>
            <div className="form-group">
              <label className="label">Superficie</label>
              <select className="input" value={form.surface} onChange={setF('surface')}>
                <option value="cristal">Cristal</option>
                <option value="moqueta">Moqueta</option>
                <option value="cemento">Cemento</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.6)', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                <input type="checkbox" checked={form.isIndoor} onChange={e => setForm(f => ({ ...f, isIndoor: e.target.checked }))} className="rounded" />
                Techada
              </label>
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? 'Guardando…' : 'Crear cancha'}
          </button>
        </form>
      </div>

      {/* Courts list */}
      {courts.length === 0 ? (
        <div className="card p-10 text-center diagonal-stripe">
          <p style={{ color: 'rgba(52,37,47,0.4)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Todavia no tenes canchas configuradas.
          </p>
          <Link href="/dashboard/onboarding" style={{ color: '#004740', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>
            ¿Es tu primera cancha? Usar el asistente de configuración →
          </Link>
        </div>
      ) : (
        courts.map((court, i) => {
          const isExpanded = expandedCourtId === court.id
          const daySchedules = getScheduleForCourt(court)

          return (
            <div key={court.id} className="card-court card-hover anim-up" style={{ animationDelay: `${i * 60}ms` }}>
              {/* Info row */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '1.05rem', color: '#34252F' }}>
                      {court.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.5)', marginTop: '0.15rem', fontFamily: 'var(--font-inter)' }}>
                      {court.surface} · {court.isIndoor ? 'Techada' : 'Al aire libre'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.25rem', fontWeight: 800, color: '#004740' }}>
                      ${Number(court.pricePerHour).toLocaleString('es-AR')}/h
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                      {court._count.bookings} reservas
                    </span>
                    <button
                      onClick={() => toggleActive(court.id, court.isActive)}
                      className={`badge ${court.isActive ? 'badge-racing' : 'badge-outline'}`}
                      style={{ cursor: 'pointer', border: court.isActive ? undefined : '1px solid rgba(52,37,47,0.2)' }}
                    >
                      {court.isActive ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>

                {/* Schedule summary (collapsed) */}
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(52,37,47,0.08)' }}>
                  <div className="flex flex-wrap gap-2">
                    {court.schedules.length > 0 ? (
                      court.schedules.map(s => (
                        <span key={s.dayOfWeek} className="badge badge-outline" style={{ fontSize: '0.7rem' }}>
                          {DAYS[s.dayOfWeek]} {s.openTime}–{s.closeTime}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-inter)' }}>
                        Sin horarios configurados
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(court)}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    Configurar horarios {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Schedule editor (expanded) */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2" style={{ borderTop: '1px solid rgba(52,37,47,0.08)', background: 'rgba(235,233,223,0.35)' }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'rgba(52,37,47,0.4)', marginBottom: '1rem', fontFamily: 'var(--font-montserrat)' }}>
                    Horarios de operación
                  </p>

                  {/* Day toggle pills */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {DAYS.map((day, di) => (
                      <button
                        key={di}
                        onClick={() => updateDaySchedule(court.id, di, { active: !daySchedules[di].active })}
                        className="btn btn-sm"
                        style={{
                          background: daySchedules[di].active ? '#004740' : 'transparent',
                          color: daySchedules[di].active ? '#fff' : 'rgba(52,37,47,0.5)',
                          border: `1px solid ${daySchedules[di].active ? '#004740' : 'rgba(52,37,47,0.2)'}`,
                          borderRadius: '999px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Active day rows */}
                  <div className="space-y-3 mb-5">
                    {DAYS.map((day, di) => {
                      if (!daySchedules[di].active) return null
                      return (
                        <div key={di} className="flex items-center gap-3 flex-wrap">
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#34252F', fontFamily: 'var(--font-montserrat)', width: '2.5rem' }}>
                            {day}
                          </span>
                          <div className="flex items-center gap-2">
                            <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Apertura</label>
                            <select
                              className="input"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }}
                              value={daySchedules[di].openTime}
                              onChange={e => updateDaySchedule(court.id, di, { openTime: e.target.value })}
                            >
                              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Cierre</label>
                            <select
                              className="input"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }}
                              value={daySchedules[di].closeTime}
                              onChange={e => updateDaySchedule(court.id, di, { closeTime: e.target.value })}
                            >
                              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>Turno</label>
                            <select
                              className="input"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto' }}
                              value={daySchedules[di].slotDuration}
                              onChange={e => updateDaySchedule(court.id, di, { slotDuration: Number(e.target.value) })}
                            >
                              {SLOT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => saveSchedules(court.id)}
                    disabled={savingSchedule}
                    className="btn btn-secondary btn-sm"
                  >
                    {savingSchedule ? 'Guardando…' : 'Guardar horarios'}
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}