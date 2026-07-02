'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, PencilSimple, Check, X } from '@phosphor-icons/react'

type CourtPosition = 'drive' | 'reves' | 'ambas'
type PlayerLevel = 'avanzado' | 'cuarta' | 'quinta' | 'sexta_mas' | 'sexta' | 'septima_mas' | 'septima' | 'octava'

type Profile = {
  fullName: string | null
  nickname: string | null
  avatarUrl: string | null
  phone: string | null
  courtPosition: CourtPosition | null
  playerLevel: PlayerLevel | null
  createdAt: Date
}

const POSITION_LABELS: Record<CourtPosition, string> = {
  drive: 'Drive',
  reves: 'Revés',
  ambas: 'Ambas',
}

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  avanzado:    'Avanzado',
  cuarta:      '4ta',
  quinta:      '5ta',
  sexta_mas:   '6ta+',
  sexta:       '6ta',
  septima_mas: '7ma+',
  septima:     '7ma',
  octava:      '8va',
}

const POSITIONS: CourtPosition[] = ['drive', 'reves', 'ambas']
const LEVELS: PlayerLevel[] = ['avanzado', 'cuarta', 'quinta', 'sexta_mas', 'sexta', 'septima_mas', 'septima', 'octava']

const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-montserrat)',
  fontWeight: 700,
  fontSize: '0.72rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(52,37,47,0.45)',
  marginBottom: '0.35rem',
}

export function ProfileView({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [nickname, setNickname] = useState(profile.nickname ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [position, setPosition] = useState<CourtPosition | null>(profile.courtPosition)
  const [level, setLevel] = useState<PlayerLevel | null>(profile.playerLevel)

  async function handleSave() {
    if (!nickname.trim()) return toast.error('El nombre no puede estar vacío')
    if (!position) return toast.error('Elegí una posición')
    if (!level) return toast.error('Elegí un nivel')

    setSaving(true)
    const res = await fetch('/api/jugador/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname.trim(), phone: phone.trim(), courtPosition: position, playerLevel: level }),
    })
    setSaving(false)
    if (!res.ok) return toast.error('No se pudo guardar.')
    toast.success('Perfil actualizado')
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setNickname(profile.nickname ?? '')
    setPhone(profile.phone ?? '')
    setPosition(profile.courtPosition)
    setLevel(profile.playerLevel)
    setEditing(false)
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: '#EBE9DF', fontFamily: 'var(--font-inter)', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{
        background: '#004740', padding: '0 1.25rem', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxSizing: 'border-box', width: '100%',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontFamily: 'var(--font-inter)', padding: 0 }}
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <span className="logo text-xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
        <div style={{ width: '60px' }} />
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.5rem)', boxSizing: 'border-box', width: '100%' }}>

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #004740' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#004740', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', color: 'white', fontFamily: 'var(--font-montserrat)', fontWeight: 800 }}>
                {(profile.nickname ?? profile.fullName ?? 'J')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.4rem', color: '#34252F', margin: 0 }}>
              {profile.nickname ?? profile.fullName ?? 'Jugador'}
            </h1>
            <p style={{ color: 'rgba(52,37,47,0.45)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
              Miembro desde {memberSince}
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(52,37,47,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '1rem', color: '#34252F', margin: 0 }}>
              Mis datos
            </h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: '1.5px solid rgba(52,37,47,0.2)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>
                <PencilSimple size={14} /> Editar
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCancel} style={{ background: 'none', border: '1.5px solid rgba(52,37,47,0.2)', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: 'rgba(52,37,47,0.5)' }}>
                  <X size={16} />
                </button>
                <button onClick={handleSave} disabled={saving} style={{ background: '#004740', border: 'none', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-montserrat)' }}>
                  <Check size={14} /> {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Nombre / Apodo */}
            <div>
              <span style={label}>Nombre o apodo</span>
              {editing ? (
                <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40}
                  style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1.5px solid rgba(52,37,47,0.18)', background: '#FAFAF8', fontSize: '0.9rem', fontFamily: 'var(--font-inter)', color: '#34252F', outline: 'none', boxSizing: 'border-box' }} />
              ) : (
                <p style={{ fontSize: '0.95rem', color: '#34252F', margin: 0, fontWeight: 500 }}>{profile.nickname || '—'}</p>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <span style={label}>Email</span>
              <p style={{ fontSize: '0.95rem', color: 'rgba(52,37,47,0.55)', margin: 0 }}>{email}</p>
            </div>

            {/* Teléfono */}
            <div>
              <span style={label}>Teléfono</span>
              {editing ? (
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 9 ..." maxLength={20}
                  style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1.5px solid rgba(52,37,47,0.18)', background: '#FAFAF8', fontSize: '0.9rem', fontFamily: 'var(--font-inter)', color: '#34252F', outline: 'none', boxSizing: 'border-box' }} />
              ) : (
                <p style={{ fontSize: '0.95rem', color: '#34252F', margin: 0, fontWeight: 500 }}>{profile.phone || '—'}</p>
              )}
            </div>

            {/* Posición */}
            <div>
              <span style={label}>Posición en cancha</span>
              {editing ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {POSITIONS.map(p => (
                    <button key={p} type="button" onClick={() => setPosition(p)} style={{ flex: 1, padding: '0.5rem 0.25rem', borderRadius: '8px', border: position === p ? '2px solid #004740' : '1.5px solid rgba(52,37,47,0.15)', background: position === p ? 'rgba(0,71,64,0.07)' : '#FAFAF8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)', color: position === p ? '#004740' : '#34252F', transition: 'all 0.15s' }}>
                      {POSITION_LABELS[p]}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(0,71,64,0.08)', color: '#004740', borderRadius: '6px', padding: '0.25rem 0.75rem', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)' }}>
                    {profile.courtPosition ? POSITION_LABELS[profile.courtPosition] : '—'}
                  </span>
                </div>
              )}
            </div>

            {/* Nivel */}
            <div>
              <span style={label}>Nivel / Categoría</span>
              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => setLevel(l)} style={{ padding: '0.5rem 0.25rem', borderRadius: '8px', border: level === l ? '2px solid #AE552D' : '1.5px solid rgba(52,37,47,0.15)', background: level === l ? 'rgba(174,85,45,0.08)' : '#FAFAF8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)', color: level === l ? '#AE552D' : '#34252F', transition: 'all 0.15s' }}>
                      {LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              ) : (
                <span style={{ background: 'rgba(174,85,45,0.1)', color: '#AE552D', borderRadius: '6px', padding: '0.25rem 0.75rem', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)' }}>
                  {profile.playerLevel ? LEVEL_LABELS[profile.playerLevel] : '—'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button type="submit" style={{ background: 'transparent', border: 'none', color: 'rgba(52,37,47,0.4)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
            Cerrar sesión
          </button>
        </form>
      </main>
    </div>
  )
}
