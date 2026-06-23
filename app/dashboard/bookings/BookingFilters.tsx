'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FILTERS = [
  { label: 'Todas', value: '' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Canceladas', value: 'cancelled' },
  { label: 'No show', value: 'no_show' },
  { label: 'Completadas', value: 'completed' },
]

export default function BookingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('status') ?? ''

  function setFilter(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) {
      p.set('status', value)
    } else {
      p.delete('status')
    }
    router.replace(`/dashboard/bookings?${p.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mb-5">
      {FILTERS.map(f => (
        <button
          key={f.value}
          type="button"
          onClick={() => setFilter(f.value)}
          className="btn btn-sm"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-montserrat)',
            fontWeight: 600,
            fontSize: '0.825rem',
            color: active === f.value ? '#AE552D' : 'rgba(52,37,47,0.55)',
            borderBottom: active === f.value ? '2px solid #AE552D' : '2px solid transparent',
            borderRadius: 0,
            paddingBottom: '0.3rem',
            paddingLeft: '0.5rem',
            paddingRight: '0.5rem',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}