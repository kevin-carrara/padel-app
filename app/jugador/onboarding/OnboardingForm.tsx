'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Position = 'drive' | 'reves' | 'ambas'
type Level = 'avanzado' | 'cuarta' | 'quinta' | 'sexta_mas' | 'sexta' | 'septima_mas' | 'septima' | 'octava'

// Full top-down court — player shown as top-down paddle+hand
function CourtView({ side, active }: { side: 'right' | 'left' | 'both'; active: boolean }) {
  const courtFill   = active ? 'rgba(0,71,64,0.10)' : 'rgba(52,37,47,0.04)'
  const lineColor   = active ? 'rgba(0,71,64,0.45)' : 'rgba(52,37,47,0.22)'
  const netColor    = active ? 'rgba(0,71,64,0.7)'  : 'rgba(52,37,47,0.35)'
  const playerColor = active ? '#004740'             : 'rgba(52,37,47,0.4)'
  const arrowColor  = active ? '#AE552D'             : 'rgba(52,37,47,0.25)'
  const zoneFill    = active ? 'rgba(0,71,64,0.08)'  : 'transparent'

  const W = 76, H = 106, X = 2, Y = 2
  const midY   = Y + H / 2
  const midX   = X + W / 2
  const svcTop = Y + H * 0.31
  const svcBot = Y + H * 0.69

  const playerR = { x: midX + W * 0.27, y: Y + H * 0.82 }
  const playerL = { x: midX - W * 0.27, y: Y + H * 0.82 }
  const targetL = { x: midX - W * 0.27, y: Y + H * 0.18 }
  const targetR = { x: midX + W * 0.27, y: Y + H * 0.18 }

  function Arrow({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
    const dx = to.x - from.x, dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    return (
      <line
        x1={from.x + ux * 9} y1={from.y + uy * 9}
        x2={to.x   - ux * 5}  y2={to.y   - uy * 5}
        stroke={arrowColor} strokeWidth="1.8" strokeLinecap="round"
        strokeDasharray="4 3" markerEnd={`url(#ah-${side})`}
      />
    )
  }

  return (
    <svg width="80" height="110" viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`ah-${side}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={arrowColor} />
        </marker>
      </defs>

      {/* Court */}
      <rect x={X} y={Y} width={W} height={H} rx="2" fill={courtFill} stroke={lineColor} strokeWidth="1.5" />

      {/* Zone highlight */}
      {side !== 'both' && (
        <rect
          x={side === 'right' ? midX + 1 : X + 1}
          y={midY + 1} width={W / 2 - 2} height={H / 2 - 2}
          fill={zoneFill}
        />
      )}

      {/* Lines */}
      <line x1={midX} y1={Y} x2={midX} y2={Y + H} stroke={lineColor} strokeWidth="0.8" strokeDasharray="4 2" />
      <line x1={X} y1={svcTop} x2={X + W} y2={svcTop} stroke={lineColor} strokeWidth="0.8" />
      <line x1={X} y1={svcBot} x2={X + W} y2={svcBot} stroke={lineColor} strokeWidth="0.8" />
      {/* Net */}
      <rect x={X} y={midY - 2} width={W} height="4" rx="1" fill={netColor} />

      {/* Arrows */}
      {(side === 'right' || side === 'both') && <Arrow from={playerR} to={targetL} />}
      {(side === 'left'  || side === 'both') && <Arrow from={playerL} to={targetR} />}

      {/* Players — clean dot with paddle hint */}
      {(side === 'right' || side === 'both') && (
        <g>
          <circle cx={playerR.x} cy={playerR.y} r="6" fill={playerColor} />
          <circle cx={playerR.x} cy={playerR.y} r="3" fill="white" opacity="0.25" />
        </g>
      )}
      {(side === 'left' || side === 'both') && (
        <g>
          <circle cx={playerL.x} cy={playerL.y} r="6" fill={playerColor} />
          <circle cx={playerL.x} cy={playerL.y} r="3" fill="white" opacity="0.25" />
        </g>
      )}

      {/* Target dots */}
      {(side === 'right' || side === 'both') && <circle cx={targetL.x} cy={targetL.y} r="2.5" fill={arrowColor} opacity="0.7" />}
      {(side === 'left'  || side === 'both') && <circle cx={targetR.x} cy={targetR.y} r="2.5" fill={arrowColor} opacity="0.7" />}
    </svg>
  )
}

const POSITIONS: { value: Position; label: string; sublabel: string; side: 'right' | 'left' | 'both' }[] = [
  { value: 'drive', label: 'Drive',  sublabel: 'lado derecho',   side: 'right' },
  { value: 'reves', label: 'Revés',  sublabel: 'lado izquierdo', side: 'left'  },
  { value: 'ambas', label: 'Ambas',  sublabel: 'los dos lados',  side: 'both'  },
]

const LEVELS: { value: Level; label: string }[] = [
  { value: 'avanzado',    label: 'Avanzado' },
  { value: 'cuarta',      label: '4ta' },
  { value: 'quinta',      label: '5ta' },
  { value: 'sexta_mas',   label: '6ta+' },
  { value: 'sexta',       label: '6ta' },
  { value: 'septima_mas', label: '7ma+' },
  { value: 'septima',     label: '7ma' },
  { value: 'octava',      label: '8va' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  borderRadius: '10px',
  border: '1.5px solid rgba(52,37,47,0.18)',
  background: '#FFFFFF',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-inter)',
  color: '#34252F',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-montserrat)',
  fontWeight: 700,
  fontSize: '0.78rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(52,37,47,0.55)',
  marginBottom: '0.5rem',
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [nickname, setNickname] = useState(defaultName)
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState<Position | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) return toast.error('Ingresá tu nombre o apodo')
    if (!position) return toast.error('Elegí tu posición en cancha')
    if (!level) return toast.error('Elegí tu nivel')

    setLoading(true)
    const res = await fetch('/api/jugador/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname.trim(), phone: phone.trim() || null, courtPosition: position, playerLevel: level }),
    })
    setLoading(false)

    if (!res.ok) {
      toast.error('Hubo un error. Intentá de nuevo.')
      return
    }
    router.push('/jugador')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Nombre / Apodo */}
      <div>
        <label style={labelStyle}>Nombre o apodo</label>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="¿Cómo te conocen en la cancha?"
          maxLength={40}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#004740')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(52,37,47,0.18)')}
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label style={labelStyle}>Teléfono <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(52,37,47,0.35)', fontSize: '0.7rem' }}>(opcional)</span></label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+54 9 351 000 0000"
          maxLength={25}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#004740')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(52,37,47,0.18)')}
        />
      </div>

      {/* Posición */}
      <div>
        <label style={labelStyle}>Posición en cancha</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
          {POSITIONS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPosition(p.value)}
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '12px',
                border: position === p.value ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.15)',
                background: position === p.value ? 'rgba(0,71,64,0.06)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s',
                flex: 1,
              }}
            >
              <CourtView side={p.side} active={position === p.value} />
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-montserrat)',
                color: position === p.value ? '#004740' : '#34252F',
              }}>{p.label}</span>
              <span style={{
                fontSize: '0.63rem',
                color: position === p.value ? 'rgba(0,71,64,0.6)' : 'rgba(52,37,47,0.4)',
                fontFamily: 'var(--font-inter)',
                textAlign: 'center',
                lineHeight: 1.3,
              }}>{p.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nivel */}
      <div>
        <label style={labelStyle}>Nivel / Categoría</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
          {LEVELS.map(l => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              style={{
                padding: '0.6rem 0.25rem',
                borderRadius: '10px',
                border: level === l.value ? '2px solid #AE552D' : '1.5px solid rgba(52,37,47,0.15)',
                background: level === l.value ? 'rgba(174,85,45,0.08)' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-montserrat)',
                color: level === l.value ? '#AE552D' : '#34252F',
              }}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          width: '100%',
          padding: '0.85rem',
          borderRadius: '10px',
          background: loading ? 'rgba(0,71,64,0.5)' : '#004740',
          color: '#FFFFFF',
          fontFamily: 'var(--font-montserrat)',
          fontWeight: 700,
          fontSize: '0.95rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          letterSpacing: '0.03em',
        }}
      >
        {loading ? 'Guardando…' : 'Empezar a jugar →'}
      </button>
    </form>
  )
}
