'use client'
import { useRouter } from 'next/navigation'
import { MapPin } from '@phosphor-icons/react'
import { getClubCover, CLUB_LOGO_STYLE } from '@/lib/club-image'

type Props = {
  club: {
    id: string
    name: string
    slug: string
    address: string | null
    logoUrl: string | null
    coverUrl: string | null
    courts: { id: string }[]
    hasAvailabilityToday: boolean
  }
  index: number
  isPlayer: boolean
}

export function ClubCard({ club, index, isPlayer }: Props) {
  const router = useRouter()

  function handleClick() {
    if (!isPlayer) {
      router.push(`/login?next=/${club.slug}`)
      return
    }
    router.push(`/${club.slug}`)
  }

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden anim-up"
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(52,37,47,0.06)',
        boxShadow: '0 2px 12px rgba(52,37,47,0.06)',
        animationDelay: `${index * 60}ms`,
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <div style={{ height: '4px', background: '#004740', borderRadius: '24px 24px 0 0' }} />
      <div
        className="club-cover"
        style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden',
          background: CLUB_LOGO_STYLE[club.slug]?.bg ?? '#EBE9DF',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getClubCover(club.slug, club.logoUrl, club.coverUrl)}
          alt={club.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: CLUB_LOGO_STYLE[club.slug]?.fit ?? 'cover',
            padding: CLUB_LOGO_STYLE[club.slug]?.padding ?? '0',
          }}
        />
        <div
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
        >
          <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>4.9</span>
        </div>
      </div>

      <div className="club-card-body p-5">
        <h3
          className="text-sm md:text-[1.1rem]"
          style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, color: '#34252F', marginBottom: '0.4rem' }}
        >
          {club.name}
        </h3>
        {club.address && (
          <div className="hidden md:flex items-center gap-1.5 mb-3">
            <MapPin size={13} color="rgba(52,37,47,0.45)" />
            <span style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.825rem', fontFamily: 'var(--font-inter)' }}>
              {club.address}
            </span>
          </div>
        )}
        <div className="club-court-row flex items-center justify-between mt-4">
          <span className="badge badge-racing">
            {club.courts.length} cancha{club.courts.length !== 1 ? 's' : ''}
          </span>
          <span
            className="club-reservar"
            style={{ color: '#AE552D', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-montserrat)' }}
          >
            {isPlayer ? 'Reservar →' : 'Ver →'}
          </span>
        </div>

        {/* Availability badge */}
        <div
          className="club-avail-row"
          style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(52,37,47,0.07)' }}
        >
          {club.hasAvailabilityToday ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', flexShrink: 0, boxShadow: '0 0 0 2px rgba(22,163,74,0.2)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)', color: '#16a34a', letterSpacing: '0.03em' }}>
                Hay horarios disponibles hoy
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(52,37,47,0.25)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)', color: 'rgba(52,37,47,0.35)', letterSpacing: '0.03em' }}>
                Sin horarios disponibles hoy
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
