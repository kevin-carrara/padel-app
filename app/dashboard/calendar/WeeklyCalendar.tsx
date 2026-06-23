'use client'

import { useEffect, useState, useCallback } from 'react'

interface Court {
  id: string
  name: string
}

interface BookingWithCourt {
  id: string
  playerName: string
  playerPhone: string | null
  startTime: string
  endTime: string
  durationMin: number
  amount: number
  status: string
  court: { name: string }
}

interface DayData {
  date: string
  label: string
  bookings: BookingWithCourt[]
}

interface WeekData {
  weekStart: string
  days: DayData[]
}

interface Props {
  courts: Court[]
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekRange(days: DayData[]): string {
  if (!days.length) return ''
  const first = new Date(days[0].date + 'T00:00:00')
  const last = new Date(days[6].date + 'T00:00:00')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const sameMonth = first.getMonth() === last.getMonth()
  if (sameMonth) {
    return `${first.getDate()} – ${last.getDate()} ${months[last.getMonth()]} ${last.getFullYear()}`
  }
  return `${first.getDate()} ${months[first.getMonth()]} – ${last.getDate()} ${months[last.getMonth()]} ${last.getFullYear()}`
}

const statusColor: Record<string, string> = {
  confirmed: '#004740',
  completed: '#34252F',
  cancelled: 'rgba(52,37,47,0.35)',
  no_show: '#AE552D',
}
const statusBg: Record<string, string> = {
  confirmed: 'rgba(0,71,64,0.08)',
  completed: 'rgba(52,37,47,0.08)',
  cancelled: 'rgba(52,37,47,0.04)',
  no_show: 'rgba(174,85,45,0.08)',
}
const statusBorder: Record<string, string> = {
  confirmed: 'rgba(0,71,64,0.18)',
  completed: 'rgba(52,37,47,0.18)',
  cancelled: 'rgba(52,37,47,0.12)',
  no_show: 'rgba(174,85,45,0.18)',
}

export default function WeeklyCalendar({ courts }: Props) {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()))
  const [weekData, setWeekData] = useState<WeekData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWeek = useCallback(async (monday: Date) => {
    setLoading(true)
    try {
      const dateStr = monday.toISOString().split('T')[0]
      const res = await fetch(`/api/bookings/week?date=${dateStr}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: WeekData = await res.json()
      setWeekData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeek(currentMonday)
  }, [currentMonday, fetchWeek])

  function prevWeek() {
    const d = new Date(currentMonday)
    d.setDate(d.getDate() - 7)
    setCurrentMonday(d)
  }

  function nextWeek() {
    const d = new Date(currentMonday)
    d.setDate(d.getDate() + 7)
    setCurrentMonday(d)
  }

  const weekLabel = weekData ? formatWeekRange(weekData.days) : '...'

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={prevWeek} className="btn btn-ghost btn-sm">
          ← Semana anterior
        </button>
        <span
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#34252F',
            flex: 1,
            textAlign: 'center',
            minWidth: '180px',
          }}
        >
          {weekLabel}
        </span>
        <button onClick={nextWeek} className="btn btn-ghost btn-sm">
          Semana siguiente →
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card p-3">
              <div className="skeleton mb-3" style={{ width: '100%', height: '16px' }} />
              {[0, 1].map(j => (
                <div key={j} className="skeleton mb-2" style={{ width: '100%', height: '56px' }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '8px', minWidth: '840px' }}>
            {weekData?.days.map(day => {
              const isToday = day.date === new Date().toISOString().split('T')[0]
              return (
                <div
                  key={day.date}
                  className="card p-3 flex flex-col gap-2"
                  style={isToday ? { borderColor: '#004740', borderWidth: '2px' } : {}}
                >
                  {/* Day header */}
                  <div
                    className="pb-2 mb-1"
                    style={{
                      borderBottom: '1px solid rgba(52,37,47,0.08)',
                      fontFamily: 'var(--font-montserrat)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: isToday ? '#004740' : '#34252F',
                    }}
                  >
                    {day.label}
                    {isToday && (
                      <span
                        className="ml-1 badge badge-racing"
                        style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}
                      >
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Bookings */}
                  {day.bookings.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: 'rgba(52,37,47,0.35)',
                        fontFamily: 'var(--font-inter)',
                        textAlign: 'center',
                        padding: '1rem 0',
                      }}
                    >
                      Sin reservas
                    </p>
                  ) : (
                    day.bookings.map(b => {
                      const start = new Date(b.startTime)
                      const timeStr = start.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                      const color = statusColor[b.status] ?? '#34252F'
                      const bg = statusBg[b.status] ?? 'rgba(52,37,47,0.04)'
                      const border = statusBorder[b.status] ?? 'rgba(52,37,47,0.12)'
                      return (
                        <div
                          key={b.id}
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: '10px',
                            padding: '0.4rem 0.5rem',
                          }}
                        >
                          <p
                            style={{
                              fontFamily: 'var(--font-montserrat)',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              color,
                              lineHeight: 1.3,
                              marginBottom: '0.15rem',
                            }}
                          >
                            {b.playerName}
                          </p>
                          <p style={{ fontSize: '0.65rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)', marginBottom: '0.25rem' }}>
                            {b.court.name}
                          </p>
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span style={{ fontSize: '0.65rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)' }}>
                              {timeStr}
                            </span>
                            <span
                              className="badge badge-cognac"
                              style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}
                            >
                              {b.durationMin}min
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Courts legend */}
      {courts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(52,37,47,0.4)',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            Canchas:
          </span>
          {courts.map(c => (
            <span key={c.id} className="badge badge-outline">{c.name}</span>
          ))}
        </div>
      )}
    </div>
  )
}
