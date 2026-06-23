'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import CancelBookingButton from '../bookings/CancelBookingButton'
import RepeatBookingButton from '../bookings/RepeatBookingButton'

// Types
interface Court { id: string; name: string }
interface BookingWithCourt {
  id: string; playerName: string; playerPhone: string | null
  startTime: string; endTime: string; durationMin: number
  amount: number; status: string; notes: string | null
  court: { name: string }
}
interface DayData { date: string; label: string; bookings: BookingWithCourt[] }
interface WeekData { weekStart: string; days: DayData[] }
interface MonthBookingSummary { id: string; playerName: string; startTime: string; status: string; courtName: string }
interface MonthData { year: number; month: number; byDate: Record<string, { count: number; bookings: MonthBookingSummary[] }> }
interface Props { courts: Court[]; todayStr: string }
type StatusFilter = 'all' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
type ViewMode = 'week' | 'day' | 'month'

// Constants
const HOUR_PX = 72
const GRID_END_HOUR = 24
const COURT_COLORS = [
  { bg: 'rgba(0,71,64,0.9)',   border: '#004740' },
  { bg: 'rgba(174,85,45,0.9)', border: '#AE552D' },
  { bg: 'rgba(52,37,47,0.9)',  border: '#34252F' },
  { bg: 'rgba(0,100,90,0.9)',  border: '#00645a' },
]
const STATUS_BG: Record<string, string> = {
  cancelled: 'rgba(52,37,47,0.3)',
  no_show: 'rgba(174,85,45,0.4)',
}
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No show',
}
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const DAY_LABELS = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom']
const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'cancelled', label: 'Canceladas' },
  { key: 'no_show', label: 'No show' },
  { key: 'completed', label: 'Completadas' },
]

// Helpers (all UTC-safe for ART UTC-3)
function getMondayStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12))
  const dow = dt.getUTCDay()
  dt.setUTCDate(dt.getUTCDate() + (dow === 0 ? -6 : 1 - dow))
  return dt.toISOString().slice(0, 10)
}

function shiftDate(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}

function formatWeekLabel(days: DayData[]): string {
  if (!days.length) return ''
  const [, m0, d0] = days[0].date.split('-').map(Number)
  const [y1, m1, d1] = days[6].date.split('-').map(Number)
  return m0 === m1
    ? `${d0} - ${d1} ${SHORT_MONTHS[m1 - 1]} ${y1}`
    : `${d0} ${SHORT_MONTHS[m0 - 1]} - ${d1} ${SHORT_MONTHS[m1 - 1]} ${y1}`
}

function formatDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()
  return `${DAY_LABELS[dow === 0 ? 6 : dow - 1]} ${d} ${SHORT_MONTHS[m - 1]} ${y}`
}

function toART(isoStr: string): { hour: number; min: number } {
  const dt = new Date(isoStr)
  const totalMin = dt.getUTCHours() * 60 + dt.getUTCMinutes() - 180
  const adj = ((totalMin % 1440) + 1440) % 1440
  return { hour: Math.floor(adj / 60), min: adj % 60 }
}

function formatHM(isoStr: string): string {
  const { hour, min } = toART(isoStr)
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function getARTNow(): { hour: number; min: number } {
  const now = new Date()
  const totalMin = now.getUTCHours() * 60 + now.getUTCMinutes() - 180
  const adj = ((totalMin % 1440) + 1440) % 1440
  return { hour: Math.floor(adj / 60), min: adj % 60 }
}

function getTopPx(isoStr: string, gStart: number): number {
  const { hour, min } = toART(isoStr)
  return (hour - gStart + min / 60) * HOUR_PX
}

function getHeightPx(durationMin: number): number {
  return Math.max((durationMin / 60) * HOUR_PX, 24)
}

function getMonthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const startDow = first.getUTCDay()
  const offset = startDow === 0 ? 6 : startDow - 1
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const daysInPrev = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()
  const cells: { date: string; dayNum: number; isCurrentMonth: boolean }[] = []
  for (let i = 0; i < offset; i++) {
    const dd = daysInPrev - offset + 1 + i
    const pm = month === 1 ? 12 : month - 1
    const py = month === 1 ? year - 1 : year
    cells.push({ date: `${py}-${String(pm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`, dayNum: dd, isCurrentMonth: false })
  }
  for (let dd = 1; dd <= daysInMonth; dd++) {
    cells.push({ date: `${year}-${String(month).padStart(2,'0')}-${String(dd).padStart(2,'0')}`, dayNum: dd, isCurrentMonth: true })
  }
  const nm = month === 12 ? 1 : month + 1
  const ny = month === 12 ? year + 1 : year
  let nd = 1
  while (cells.length < 42) {
    cells.push({ date: `${ny}-${String(nm).padStart(2,'0')}-${String(nd).padStart(2,'0')}`, dayNum: nd, isCurrentMonth: false })
    nd++
  }
  return cells
}

// Component
export default function WeeklyCalendar({ courts, todayStr }: Props) {
  // Grid start hour: fixed on mount (1h before current ART hour)
  const [gridStart] = useState(() => Math.max(getARTNow().hour - 1, 8))
  const totalHours = GRID_END_HOUR - gridStart
  const gridHeight = totalHours * HOUR_PX

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [weekMonday, setWeekMonday] = useState<string>(() => getMondayStr(todayStr))
  const [selDay, setSelDay] = useState<string>(todayStr)
  const [monthView, setMonthView] = useState(() => {
    const [y, m] = todayStr.split('-').map(Number)
    return { year: y, month: m }
  })
  const [weekData, setWeekData] = useState<WeekData | null>(null)
  const [dayData, setDayData] = useState<DayData | null>(null)
  const [monthData, setMonthData] = useState<MonthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selBooking, setSelBooking] = useState<BookingWithCourt | null>(null)
  const [nowTime, setNowTime] = useState(() => getARTNow())
  const panelRef = useRef<HTMLDivElement>(null)

  const nowPx = (nowTime.hour - gridStart + nowTime.min / 60) * HOUR_PX
  const nowLabel = `${String(nowTime.hour).padStart(2,'0')}:${String(nowTime.min).padStart(2,'0')}`
  const courtColorMap = Object.fromEntries(courts.map((c, i) => [c.name, COURT_COLORS[i % COURT_COLORS.length]]))

  const fetchWeek = useCallback(async (monday: string) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/bookings/week?date=${monday}`)
      if (r.ok) setWeekData(await r.json()); else setWeekData(null)
    } catch { setWeekData(null) }
    finally { setLoading(false) }
  }, [])

  const fetchDay = useCallback(async (day: string) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/bookings/week?date=${getMondayStr(day)}`)
      if (r.ok) {
        const data: WeekData = await r.json()
        setDayData(data.days.find(d => d.date === day) ?? null)
      } else setDayData(null)
    } catch { setDayData(null) }
    finally { setLoading(false) }
  }, [])

  const fetchMonth = useCallback(async (year: number, month: number) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/bookings/month?year=${year}&month=${month}`)
      if (r.ok) setMonthData(await r.json()); else setMonthData(null)
    } catch { setMonthData(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (viewMode === 'week') fetchWeek(weekMonday) }, [viewMode, weekMonday, fetchWeek])
  useEffect(() => { if (viewMode === 'day') fetchDay(selDay) }, [viewMode, selDay, fetchDay])
  useEffect(() => { if (viewMode === 'month') fetchMonth(monthView.year, monthView.month) }, [viewMode, monthView, fetchMonth])

  useEffect(() => {
    const id = setInterval(() => setNowTime(getARTNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!selBooking) return
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setSelBooking(null)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [selBooking])

  const goToDay = (day: string) => { setSelDay(day); setViewMode('day') }

  const weekContainsToday = weekMonday <= todayStr && shiftDate(weekMonday, 6) >= todayStr

  const applyFilter = (bks: BookingWithCourt[]) =>
    statusFilter === 'all' ? bks : bks.filter(b => b.status === statusFilter)

  const filteredDays = weekData?.days.map(d => ({ ...d, bookings: applyFilter(d.bookings) }))
  const filteredDayBks = applyFilter(dayData?.bookings ?? [])

  // Shared time-grid renderer (week columns = days, day columns = courts)
  const renderGrid = (
    cols: { id: string; isToday: boolean; bookings: BookingWithCourt[] }[],
    showNow: boolean
  ) => (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `44px repeat(${cols.length}, 1fr)` }}>
        {/* Time labels */}
        <div style={{ position: 'relative', height: `${gridHeight}px` }}>
          {Array.from({ length: totalHours }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', top: `${i * HOUR_PX - 8}px`, right: '8px', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.6rem', color: 'rgba(52,37,47,0.3)', userSelect: 'none' }}>
              {String(gridStart + i).padStart(2, '0')}
            </div>
          ))}
        </div>
        {/* Data columns */}
        {cols.map(col => (
          <div key={col.id} style={{ position: 'relative', height: `${gridHeight}px`, background: col.isToday ? 'rgba(0,71,64,0.025)' : 'transparent', borderLeft: '1px solid rgba(52,37,47,0.07)' }}>
            {Array.from({ length: totalHours }).map((_, i) => (
              <div key={`l${i}`} style={{ position: 'absolute', top: `${i * HOUR_PX}px`, left: 0, right: 0, borderTop: i === 0 ? 'none' : '1px solid rgba(52,37,47,0.06)' }} />
            ))}
            {Array.from({ length: totalHours }).map((_, i) => (
              <div key={`h${i}`} style={{ position: 'absolute', top: `${i * HOUR_PX + HOUR_PX / 2}px`, left: 0, right: 0, borderTop: '1px dashed rgba(52,37,47,0.04)' }} />
            ))}
            {col.bookings.map(b => {
              const top = getTopPx(b.startTime, gridStart)
              const ht = getHeightPx(b.durationMin)
              if (top + ht < 0 || top > gridHeight) return null
              const isCancelled = b.status === 'cancelled' || b.status === 'no_show'
              const cc = courtColorMap[b.court.name] ?? COURT_COLORS[0]
              const isSel = selBooking?.id === b.id
              return (
                <button
                  key={b.id}
                  onClick={() => setSelBooking(isSel ? null : b)}
                  style={{
                    position: 'absolute', top: `${top + 2}px`, left: '3px', right: '3px', height: `${ht - 4}px`,
                    background: isCancelled ? (STATUS_BG[b.status] ?? 'rgba(52,37,47,0.25)') : cc.bg,
                    border: `1.5px solid ${isSel ? '#fff' : isCancelled ? 'rgba(52,37,47,0.2)' : cc.border}`,
                    borderRadius: '8px', padding: '0.2rem 0.4rem', textAlign: 'left', cursor: 'pointer',
                    overflow: 'hidden', zIndex: isSel ? 20 : 5,
                    boxShadow: isSel ? '0 2px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.12s', opacity: isCancelled ? 0.55 : 1,
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem', color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {b.playerName}
                  </p>
                  {ht > 38 && (
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {formatHM(b.startTime)} {b.court.name}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Now-line: horizontal, spanning all data columns */}
      {showNow && nowPx >= 0 && nowPx <= gridHeight && (
        <div style={{ position: 'absolute', top: `${nowPx}px`, left: 0, right: 0, zIndex: 20, pointerEvents: 'none', height: 0 }}>
          {/* Time label in the 44px time column */}
          <div style={{ position: 'absolute', top: '-9px', left: '2px', width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ background: '#AE552D', color: '#fff', fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.5rem', padding: '1px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
              {nowLabel}
            </span>
          </div>
          {/* Dot at left edge of data area */}
          <div style={{ position: 'absolute', left: '39px', top: '-5px', width: '10px', height: '10px', borderRadius: '50%', background: '#AE552D', boxShadow: '0 0 4px rgba(174,85,45,0.5)' }} />
          {/* Horizontal line across all data columns */}
          <div style={{ position: 'absolute', left: '44px', right: 0, top: '-1px', height: '2px', background: '#AE552D', boxShadow: '0 0 6px rgba(174,85,45,0.4)' }} />
        </div>
      )}
    </div>
  )

  const navBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick} style={{ background: 'transparent', border: '1px solid rgba(52,37,47,0.15)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontWeight: 700, color: '#34252F', fontSize: '0.9rem' }}>
      {label}
    </button>
  )

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {viewMode === 'week' && navBtn('<', () => setWeekMonday(shiftDate(weekMonday, -7)))}
        {viewMode === 'day' && navBtn('<', () => setSelDay(shiftDate(selDay, -1)))}
        {viewMode === 'month' && navBtn('<', () => setMonthView(mv => mv.month === 1 ? { year: mv.year - 1, month: 12 } : { ...mv, month: mv.month - 1 }))}

        <span style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.95rem', color: '#34252F', flex: 1, textAlign: 'center', minWidth: '190px' }}>
          {viewMode === 'week' && (weekData ? formatWeekLabel(weekData.days) : '...')}
          {viewMode === 'day' && formatDayLabel(selDay)}
          {viewMode === 'month' && `${MONTH_NAMES[monthView.month - 1]} ${monthView.year}`}
        </span>

        {viewMode === 'week' && navBtn('>', () => setWeekMonday(shiftDate(weekMonday, 7)))}
        {viewMode === 'day' && navBtn('>', () => setSelDay(shiftDate(selDay, 1)))}
        {viewMode === 'month' && navBtn('>', () => setMonthView(mv => mv.month === 12 ? { year: mv.year + 1, month: 1 } : { ...mv, month: mv.month + 1 }))}

        {/* Hoy = always go to day view for today */}
        <button onClick={() => goToDay(todayStr)} className="btn btn-secondary btn-sm">Hoy</button>

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid rgba(52,37,47,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
          {([['week','Semana'],['day','Dia'],['month','Mes']] as [ViewMode,string][]).map(([v, lbl], i) => (
            <button key={v} onClick={() => setViewMode(v)} style={{
              padding: '0.35rem 0.65rem',
              background: viewMode === v ? '#004740' : 'transparent',
              color: viewMode === v ? '#fff' : 'rgba(52,37,47,0.5)',
              fontFamily: 'var(--font-montserrat)', fontWeight: 600, fontSize: '0.72rem',
              border: 'none', cursor: 'pointer',
              borderLeft: i > 0 ? '1px solid rgba(52,37,47,0.12)' : 'none',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {viewMode !== 'month' && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {FILTERS.map(({ key, label }) => {
            const active = statusFilter === key
            return (
              <button key={key} onClick={() => setStatusFilter(key)} style={{
                padding: '0.3rem 0.8rem', borderRadius: '99px', cursor: 'pointer', transition: 'all 0.12s',
                border: active ? '1.5px solid #004740' : '1.5px solid rgba(52,37,47,0.12)',
                background: active ? '#004740' : 'transparent',
                color: active ? '#fff' : 'rgba(52,37,47,0.5)',
                fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 600,
              }}>{label}</button>
            )
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '72vh' }}>
            <div style={{ minWidth: '680px' }}>
              {/* Sticky day header */}
              <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid rgba(52,37,47,0.08)', position: 'sticky', top: 0, background: '#fff', zIndex: 30 }}>
                <div />
                {filteredDays?.map(day => {
                  const isToday = day.date === todayStr
                  return (
                    <button key={day.date} onClick={() => goToDay(day.date)} style={{ padding: '0.6rem 0.25rem', textAlign: 'center', background: isToday ? 'rgba(0,71,64,0.06)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.65rem', color: isToday ? '#004740' : 'rgba(52,37,47,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {day.label.split(' ')[0]}
                      </p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.05rem', color: isToday ? '#fff' : '#34252F', background: isToday ? '#004740' : 'transparent', borderRadius: '50%' }}>
                        {parseInt(day.date.split('-')[2])}
                      </span>
                    </button>
                  )
                })}
              </div>
              {renderGrid(
                filteredDays?.map(d => ({ id: d.date, isToday: d.date === todayStr, bookings: d.bookings })) ?? [],
                weekContainsToday
              )}
            </div>
          </div>
        </div>
      ))}

      {/* DAY VIEW - courts as columns */}
      {viewMode === 'day' && (loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '72vh' }}>
            <div style={{ minWidth: `${44 + Math.max(courts.length, 1) * 160}px` }}>
              {/* Sticky court header */}
              <div style={{ display: 'grid', gridTemplateColumns: `44px repeat(${courts.length}, 1fr)`, borderBottom: '1px solid rgba(52,37,47,0.08)', position: 'sticky', top: 0, background: '#fff', zIndex: 30 }}>
                <div />
                {courts.map((court, i) => {
                  const cc = COURT_COLORS[i % COURT_COLORS.length]
                  return (
                    <div key={court.id} style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.8rem', color: '#34252F', margin: 0 }}>{court.name}</p>
                      <div style={{ width: '28px', height: '3px', background: cc.border, borderRadius: '2px', margin: '0.3rem auto 0' }} />
                    </div>
                  )
                })}
              </div>
              {renderGrid(
                courts.map(c => ({
                  id: c.id,
                  isToday: selDay === todayStr,
                  bookings: filteredDayBks.filter(b => b.court.name === c.name),
                })),
                selDay === todayStr
              )}
            </div>
          </div>
        </div>
      ))}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="card overflow-hidden">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(52,37,47,0.07)' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ padding: '0.55rem', textAlign: 'center', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.62rem', color: 'rgba(52,37,47,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
            ))}
          </div>
          {loading ? (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid rgba(0,71,64,0.15)', borderTopColor: '#004740', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {getMonthCells(monthView.year, monthView.month).map((cell, idx) => {
                const isToday = cell.date === todayStr
                const info = monthData?.byDate[cell.date]
                return (
                  <div
                    key={idx}
                    onClick={() => cell.isCurrentMonth && goToDay(cell.date)}
                    style={{
                      minHeight: '80px', padding: '0.4rem',
                      borderRight: '1px solid rgba(52,37,47,0.05)',
                      borderBottom: '1px solid rgba(52,37,47,0.05)',
                      background: isToday ? 'rgba(0,71,64,0.045)' : 'transparent',
                      cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.75rem', color: isToday ? '#fff' : cell.isCurrentMonth ? '#34252F' : 'rgba(52,37,47,0.18)', background: isToday ? '#004740' : 'transparent', borderRadius: '50%' }}>
                      {cell.dayNum}
                    </span>
                    {cell.isCurrentMonth && info?.bookings.slice(0, 2).map(b => {
                      const cc = courtColorMap[b.courtName] ?? COURT_COLORS[0]
                      const isCancelled = b.status === 'cancelled' || b.status === 'no_show'
                      return (
                        <div key={b.id} style={{ marginTop: '2px', padding: '1px 4px', borderRadius: '3px', background: isCancelled ? 'rgba(52,37,47,0.12)' : cc.bg, fontFamily: 'var(--font-inter)', fontSize: '0.58rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: isCancelled ? 0.6 : 1 }}>
                          {formatHM(b.startTime)} {b.playerName}
                        </div>
                      )
                    })}
                    {cell.isCurrentMonth && info && info.count > 2 && (
                      <div style={{ marginTop: '2px', fontFamily: 'var(--font-inter)', fontSize: '0.56rem', color: '#AE552D', fontWeight: 600, paddingLeft: '4px' }}>
                        +{info.count - 2} mas
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Court legend */}
      {courts.length > 1 && viewMode !== 'month' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(52,37,47,0.35)' }}>Canchas:</span>
          {courts.map((c, i) => (
            <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'rgba(52,37,47,0.55)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: COURT_COLORS[i % COURT_COLORS.length].bg, flexShrink: 0 }} />
              {c.name}
            </span>
          ))}
        </div>
      )}

      {/* Booking detail panel */}
      {selBooking && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(52,37,47,0.18)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
          <div ref={panelRef} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px', maxWidth: '100vw', background: '#fff', zIndex: 50, boxShadow: '-4px 0 32px rgba(52,37,47,0.1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(52,37,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#004740' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#fff', margin: 0 }}>{selBooking.playerName}</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0' }}>{STATUS_LABELS[selBooking.status] ?? selBooking.status}</p>
              </div>
              <button onClick={() => setSelBooking(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', padding: '0.4rem 0.7rem' }}>X</button>
            </div>
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {([
                { label: 'Cancha', value: selBooking.court.name },
                { label: 'Horario', value: `${formatHM(selBooking.startTime)} - ${formatHM(selBooking.endTime)} (${selBooking.durationMin} min)` },
                { label: 'Monto', value: `$${Number(selBooking.amount).toLocaleString('es-AR')}` },
                ...(selBooking.playerPhone ? [{ label: 'Telefono', value: selBooking.playerPhone }] : []),
                ...(selBooking.notes ? [{ label: 'Notas', value: selBooking.notes }] : []),
              ] as { label: string; value: string }[]).map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.3)', margin: '0 0 0.2rem' }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#34252F', margin: 0 }}>{value}</p>
                </div>
              ))}
              {selBooking.status === 'confirmed' && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(52,37,47,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,37,47,0.3)', margin: '0 0 0.25rem' }}>Acciones</p>
                  <RepeatBookingButton bookingId={selBooking.id} playerName={selBooking.playerName} startTime={selBooking.startTime} courtName={selBooking.court.name} />
                  <CancelBookingButton bookingId={selBooking.id} playerName={selBooking.playerName} startTime={selBooking.startTime} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

function Spinner() {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,71,64,0.15)', borderTopColor: '#004740', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}