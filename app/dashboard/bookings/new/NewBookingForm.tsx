'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type CourtOption = {
  id: string
  name: string
  pricePerHour: number | string
}

export default function NewBookingForm({ courts }: { courts: CourtOption[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    courtId: courts[0]?.id ?? '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    durationMin: '60',
    playerName: '',
    playerPhone: '',
    notes: '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.courtId) return
    setLoading(true)
    const start = new Date(`${form.date}T${form.startTime}:00`)
    const end = new Date(start.getTime() + Number(form.durationMin) * 60_000)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId: form.courtId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        playerName: form.playerName,
        playerPhone: form.playerPhone || undefined,
        notes: form.notes || undefined,
      }),
    })

    const payload = await res.json()
    if (!res.ok) {
      const msg = typeof payload.error === 'string' ? payload.error : 'No se pudo crear la reserva'
      toast.error(msg)
      setLoading(false)
      return
    }

    toast.success('Reserva creada')
    router.push('/dashboard/bookings')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label className="label">Cancha</label>
          <select className="input" required value={form.courtId} onChange={set('courtId')}>
            {courts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (${Number(c.pricePerHour).toLocaleString('es-AR')}/h)
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Fecha</label>
          <input type="date" className="input" required value={form.date} onChange={set('date')} />
        </div>
        <div className="form-group">
          <label className="label">Hora de inicio</label>
          <input type="time" className="input" required value={form.startTime} onChange={set('startTime')} />
        </div>
        <div className="form-group">
          <label className="label">Duracion</label>
          <select className="input" value={form.durationMin} onChange={set('durationMin')}>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
            <option value="120">120 min</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label className="label">Nombre del jugador</label>
          <input type="text" className="input" required minLength={2} value={form.playerName} onChange={set('playerName')} placeholder="Carlos Garcia" />
        </div>
        <div className="form-group">
          <label className="label">Telefono</label>
          <input type="tel" className="input" value={form.playerPhone} onChange={set('playerPhone')} placeholder="351 000 0000" />
        </div>
      </div>

      <div className="form-group mb-6">
        <label className="label">Notas (opcional)</label>
        <textarea className="input" style={{ minHeight: '80px', resize: 'none' }} value={form.notes} onChange={set('notes')} placeholder="Informacion adicional..." />
      </div>

      <button type="submit" disabled={loading || !form.courtId} className="btn btn-primary btn-lg">
        {loading ? 'Guardando…' : 'Crear reserva'}
      </button>
    </form>
  )
}