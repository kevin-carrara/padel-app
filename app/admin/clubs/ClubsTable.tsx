'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircle,
  PauseCircle,
  XCircle,
  ArrowClockwise,
  Buildings,
  CalendarDots,
  Warning,
} from '@phosphor-icons/react'

type SubscriptionStatus = 'pending' | 'trial' | 'active' | 'inactive' | 'suspended'

interface Club {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: string | null
  createdAt: string
  _count: { courts: number; bookings: number }
  _revenue: number
  admin: { id: string; fullName: string | null; phone: string | null; email: string | null } | null
}

interface Props {
  clubs: Club[]
}

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'Pendiente',  color: '#1e40af', bg: 'rgba(30,64,175,0.1)',   dot: '#3b82f6' },
  active:    { label: 'Activo',    color: '#166534', bg: 'rgba(22,101,52,0.1)',   dot: '#16a34a' },
  trial:     { label: 'Trial',     color: '#92400e', bg: 'rgba(146,64,14,0.1)',  dot: '#f59e0b' },
  inactive:  { label: 'Inactivo',  color: '#374151', bg: 'rgba(55,65,81,0.1)',   dot: '#9ca3af' },
  suspended: { label: 'Suspendido',color: '#991b1b', bg: 'rgba(153,27,27,0.1)',  dot: '#ef4444' },
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.65rem', borderRadius: '9999px',
      background: cfg.bg, color: cfg.color,
      fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function ConfirmModal({
  club,
  targetStatus,
  onConfirm,
  onCancel,
  loading,
}: {
  club: Club
  targetStatus: SubscriptionStatus
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const cfg = STATUS_CONFIG[targetStatus]
  const messages: Record<SubscriptionStatus, string> = {
    pending:   'El club quedará en espera de aprobación.',
    active:    'El club podrá acceder a todas las funciones del sistema.',
    trial:     'El club tendrá acceso limitado por período de prueba.',
    inactive:  'El club quedará desactivado pero conservará sus datos.',
    suspended: 'El club no podrá acceder al sistema hasta que se reactive.',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(26,10,20,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '20px',
        padding: '2rem', maxWidth: '420px', width: '100%',
        boxShadow: '0 20px 60px rgba(26,10,20,0.25)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <Warning size={24} weight="fill" color={cfg.dot} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.1rem', color: '#34252F', marginBottom: '0.5rem' }}>
          Cambiar a {cfg.label}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(52,37,47,0.6)', marginBottom: '0.35rem' }}>
          <strong style={{ color: '#34252F' }}>{club.name}</strong>
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(52,37,47,0.55)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          {messages[targetStatus]}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '0.625rem', borderRadius: '9999px', border: '1.5px solid rgba(52,37,47,0.15)',
              background: 'transparent', fontFamily: 'var(--font-montserrat)', fontWeight: 600,
              fontSize: '0.85rem', color: '#34252F', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '0.625rem', borderRadius: '9999px',
              background: cfg.dot, border: 'none',
              fontFamily: 'var(--font-montserrat)', fontWeight: 700,
              fontSize: '0.85rem', color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {loading && <ArrowClockwise size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClubsTable({ clubs: initialClubs }: Props) {
  const [clubs, setClubs] = useState(initialClubs)
  const [confirm, setConfirm] = useState<{ club: Club; status: SubscriptionStatus } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Club | null>(null)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all')

  const filtered = clubs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.subscriptionStatus === filterStatus
    return matchSearch && matchStatus
  })

  async function changeStatus(club: Club, status: SubscriptionStatus) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/clubs/${club.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Failed')
        const updated = await res.json()
        setClubs(prev => prev.map(c => c.id === club.id ? { ...c, subscriptionStatus: updated.subscriptionStatus } : c))
        setConfirm(null)
      } catch {
        alert('Error al cambiar el estado. Intentá de nuevo.')
        setConfirm(null)
      }
    })
  }

  async function deleteClub(club: Club) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/clubs/${club.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed')
        setClubs(prev => prev.filter(c => c.id !== club.id))
        setConfirmDelete(null)
      } catch {
        alert('Error al eliminar el club. Intentá de nuevo.')
        setConfirmDelete(null)
      }
    })
  }

  const stats = {
    total: clubs.length,
    pending: clubs.filter(c => c.subscriptionStatus === 'pending').length,
    active: clubs.filter(c => c.subscriptionStatus === 'active').length,
    trial: clubs.filter(c => c.subscriptionStatus === 'trial').length,
    suspended: clubs.filter(c => c.subscriptionStatus === 'suspended').length,
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          club={confirm.club}
          targetStatus={confirm.status}
          onConfirm={() => changeStatus(confirm.club, confirm.status)}
          onCancel={() => setConfirm(null)}
          loading={isPending}
        />
      )}

      {/* Modal de eliminación */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(26,10,20,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', padding: '2rem',
            maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(26,10,20,0.25)',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '1.25rem',
            }}>
              <XCircle size={24} weight="fill" color="#dc2626" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.1rem', color: '#34252F', marginBottom: '0.5rem' }}>
              Rechazar solicitud
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(52,37,47,0.6)', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#34252F' }}>{confirmDelete.name}</strong>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(52,37,47,0.55)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Se eliminará el club y la cuenta del administrador de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isPending}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '9999px',
                  border: '1.5px solid rgba(52,37,47,0.15)', background: 'transparent',
                  fontFamily: 'var(--font-montserrat)', fontWeight: 600, fontSize: '0.85rem',
                  color: '#34252F', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteClub(confirmDelete)}
                disabled={isPending}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '9999px',
                  background: '#dc2626', border: 'none',
                  fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.85rem',
                  color: '#FFFFFF', cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {isPending && <ArrowClockwise size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Buildings, color: '#004740', bg: 'rgba(0,71,64,0.08)' },
          { label: 'Pendientes', value: stats.pending, icon: PauseCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Activos', value: stats.active, icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'En trial', value: stats.trial, icon: CalendarDots, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
          { label: 'Suspendidos', value: stats.suspended, icon: XCircle, color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} weight="duotone" color={color} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.6rem', color: '#34252F', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(52,37,47,0.5)', marginTop: '0.2rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar club..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: '280px', flex: '1' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'pending', 'active', 'trial', 'suspended', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.45rem 0.85rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.72rem',
                textTransform: 'capitalize', letterSpacing: '0.04em', transition: 'all 0.15s',
                background: filterStatus === s ? '#004740' : 'rgba(52,37,47,0.07)',
                color: filterStatus === s ? '#FFFFFF' : 'rgba(52,37,47,0.6)',
              }}
            >
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1fr 0.7fr 0.7fr 1fr',
          padding: '0.75rem 1.5rem',
          background: '#EBE9DF',
          borderBottom: '1px solid rgba(52,37,47,0.08)',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'rgba(52,37,47,0.4)',
          fontFamily: 'var(--font-montserrat)',
        }}>
          <span>Club</span>
          <span>Estado</span>
          <span>Canchas</span>
          <span>Reservas</span>
          <span style={{ textAlign: 'right' }}>Acciones</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(52,37,47,0.4)', fontSize: '0.875rem' }}>
            No se encontraron clubes.
          </div>
        )}

        {filtered.map((club, i) => (
          <div
            key={club.id}
            style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.7fr 0.7fr 1fr',
              padding: '1rem 1.5rem', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(52,37,47,0.06)' : 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,37,47,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            {/* Club info */}
            <div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.9rem', color: '#34252F', marginBottom: '0.15rem' }}>
                {club.name}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-inter)' }}>
                /{club.slug}
              </span>
              {/* Contacto del admin */}
              {club.admin && (
                <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  {club.admin.fullName && (
                    <span style={{ fontSize: '0.72rem', color: '#34252F', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                      👤 {club.admin.fullName}
                    </span>
                  )}
                  {club.admin.email && (() => {
                    const isPending = club.subscriptionStatus === 'pending'
                    const subject = isPending
                      ? encodeURIComponent(`Bienvenido a AJClubPadel - ${club.name}`)
                      : encodeURIComponent(`AJClubPadel - ${club.name}`)
                    const body = isPending
                      ? encodeURIComponent(
                          `Hola ${club.admin.fullName ?? ''}!\n\nSoy Kevin de AJClubPadel. Recibimos la solicitud de ${club.name} y nos pone muy contentos tenerte.\n\nQuería contactarte para conocer un poco más tu club y contarte cómo podemos ayudarte a digitalizar tus reservas de pádel.\n\n¿Tenés unos minutos para conversar esta semana?\n\nSaludos,\nKevin — AJClubPadel`
                        )
                      : ''
                    const href = isPending
                      ? `mailto:${club.admin.email}?subject=${subject}&body=${body}`
                      : `mailto:${club.admin.email}`
                    return (
                      <a href={href} style={{ fontSize: '0.7rem', color: '#AE552D', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                        ✉ {club.admin.email}
                      </a>
                    )
                  })()}
                  {club.admin.phone && (() => {
                    const isPending = club.subscriptionStatus === 'pending'
                    const digits = club.admin.phone.replace(/\D/g, '')
                    const waMsg = isPending
                      ? encodeURIComponent(
                          `Hola ${club.admin.fullName ?? ''}! Soy Kevin de *AJClubPadel* 👋\n\nRecibimos la solicitud de *${club.name}* y nos pone muy contentos tenerte.\n\nQuería contactarte para conocer tu club y mostrarte cómo podemos ayudarte a gestionar tus reservas de pádel de forma más fácil y profesional.\n\n¿Tenés un momento para charlar? 🎾`
                        )
                      : encodeURIComponent(`Hola ${club.admin.fullName ?? ''}, te contacto de AJClubPadel.`)
                    return (
                      <a
                        href={`https://wa.me/${digits}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.7rem', color: '#16a34a', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
                      >
                        📱 {club.admin.phone}
                      </a>
                    )
                  })()}
                </div>
              )}
              {club.trialEndsAt && club.subscriptionStatus === 'trial' && (
                <span style={{
                  fontSize: '0.62rem', color: '#d97706', fontFamily: 'var(--font-montserrat)', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem',
                }}>
                  <CalendarDots size={11} weight="fill" />
                  Trial hasta {new Date(club.trialEndsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Status */}
            <div>
              <StatusBadge status={club.subscriptionStatus} />
            </div>

            {/* Courts */}
            <span style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#004740' }}>
              {club._count.courts}
            </span>

            {/* Bookings */}
            <span style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#004740' }}>
              {club._count.bookings}
            </span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {/* Pending: mostrar solo "Aprobar a Trial" y "Rechazar" */}
              {club.subscriptionStatus === 'pending' && (
                <>
                  <button
                    onClick={() => setConfirm({ club, status: 'trial' })}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.35rem 0.8rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                      background: 'rgba(59,130,246,0.15)', color: '#1d4ed8',
                      fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
                  >
                    <CheckCircle size={13} weight="fill" />
                    Aprobar → Trial
                  </button>
                  <button
                    onClick={() => setConfirmDelete(club)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.35rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                      background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                      fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.16)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
                  >
                    <XCircle size={13} weight="fill" />
                    Rechazar
                  </button>
                </>
              )}

              {/* Activos: botones normales */}
              {club.subscriptionStatus !== 'pending' && club.subscriptionStatus !== 'active' && (
                <button
                  onClick={() => setConfirm({ club, status: 'active' })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.35rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                    background: 'rgba(22,163,74,0.1)', color: '#15803d',
                    fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(22,163,74,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(22,163,74,0.1)')}
                >
                  <CheckCircle size={13} weight="fill" />
                  Activar
                </button>
              )}
              {club.subscriptionStatus !== 'pending' && club.subscriptionStatus !== 'trial' && (
                <button
                  onClick={() => setConfirm({ club, status: 'trial' })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.35rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                    background: 'rgba(217,119,6,0.1)', color: '#b45309',
                    fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.1)')}
                >
                  <CalendarDots size={13} weight="fill" />
                  Trial
                </button>
              )}
              {club.subscriptionStatus !== 'pending' && club.subscriptionStatus !== 'suspended' && (
                <button
                  onClick={() => setConfirm({ club, status: 'suspended' })}
                  title="Suspender"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.35rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                    background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                    fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.68rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
                >
                  <XCircle size={13} weight="fill" />
                  Suspender
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
