import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { MapPin } from '@phosphor-icons/react/dist/ssr'
import { getClubCover, CLUB_LOGO_STYLE } from '@/lib/club-image'

export const dynamic = 'force-dynamic'

type LandingClub = {
  id: string
  name: string
  slug: string
  address: string | null
  logoUrl: string | null
  coverUrl: string | null
  courts: { id: string }[]
}

async function getActiveClubs(): Promise<LandingClub[]> {
  const clubs = await prisma.club.findMany({
    where: { subscriptionStatus: { in: ['active', 'trial'] } },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      courts: { where: { isActive: true }, select: { id: true } },
    },
    orderBy: { name: 'asc' },
  })
  return clubs as LandingClub[]
}

export default async function ClubesPage() {
  const clubs = await getActiveClubs()

  return (
    <div className="min-h-screen" style={{ background: '#EBE9DF' }}>
      {/* NAV */}
      <nav style={{ background: '#004740' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', background: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
            </div>
            <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>AJClubPadel</Link>
          </div>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.2)' }}>
            ← Inicio
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ background: '#004740', padding: '3rem 0 2.5rem' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="section-label" style={{ color: 'rgba(235,233,223,0.55)', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
            Directorio
          </div>
          <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Clubes de Pádel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', fontSize: '1rem' }}>
            {clubs.length} club{clubs.length !== 1 ? 's' : ''} disponible{clubs.length !== 1 ? 's' : ''} · Reserva en menos de 30 segundos
          </p>
        </div>
      </section>

      {/* CLUBS GRID */}
      <section className="max-w-6xl mx-auto px-5 py-10">
        {clubs.length === 0 ? (
          <div className="card diagonal-stripe p-16 text-center">
            <p style={{ color: 'rgba(52,37,47,0.4)', fontSize: '1rem', marginBottom: '0.5rem' }}>
              Todavía no hay clubes activos.
            </p>
            <p style={{ color: 'rgba(52,37,47,0.3)', fontSize: '0.875rem' }}>Los primeros clubs se están incorporando — volvé pronto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club: LandingClub, i: number) => (
              <Link key={club.id} href={`/${club.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  className="group relative overflow-hidden anim-up"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid rgba(52,37,47,0.06)',
                    boxShadow: '0 2px 12px rgba(52,37,47,0.06)',
                    animationDelay: `${i * 60}ms`,
                    transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                  }}
                >
                  <div style={{ height: '4px', background: '#004740', borderRadius: '24px 24px 0 0' }} />
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: CLUB_LOGO_STYLE[club.slug]?.bg ?? '#EBE9DF' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getClubCover(club.slug, club.logoUrl, club.coverUrl)}
                      alt={club.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      style={{
                        width: '100%', height: '100%',
                        objectFit: CLUB_LOGO_STYLE[club.slug]?.fit ?? 'cover',
                        padding: CLUB_LOGO_STYLE[club.slug]?.padding ?? '0',
                      }}
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>4.9</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}>
                      <span className="badge badge-racing" style={{ background: 'rgba(0,71,64,0.85)', color: '#FFFFFF', borderColor: 'transparent', fontSize: '0.6rem' }}>Club Pádel</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.1rem', fontWeight: 700, color: '#34252F', marginBottom: '0.5rem' }}>
                      {club.name}
                    </h3>
                    {club.address && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <MapPin size={13} color="rgba(52,37,47,0.45)" />
                        <span style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.825rem', fontFamily: 'var(--font-inter)' }}>{club.address}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="badge badge-racing">{club.courts.length} cancha{club.courts.length !== 1 ? 's' : ''}</span>
                      <span style={{ color: '#AE552D', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-montserrat)' }}>
                        Reservar →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
