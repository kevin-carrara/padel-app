import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import RacketHero from './RacketHero'
import { ChevronDown, MapPin, Phone, Mail, Award, Calendar, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

type LandingClub = {
  id: string
  name: string
  slug: string
  address: string | null
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
      courts: { where: { isActive: true }, select: { id: true } },
    },
    orderBy: { name: 'asc' },
  })
  return clubs as LandingClub[]
}

const CLUB_IMAGES = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600',
]

// Imágenes locales por slug de club (archivos en /public/clubs/)
const CLUB_LOCAL_IMAGES: Record<string, string> = {
  'pochi-padel':  '/clubs/pochi-padel.png',
  'puente-padel': '/clubs/puente-padel.png',
}

// Logos que necesitan fondo de color + contain (logos sin fondo propio)
const CLUB_LOGO_STYLE: Record<string, { bg: string; fit: 'contain' | 'cover'; padding?: string }> = {
  'pochi-padel':  { bg: '#F97316', fit: 'contain', padding: '1.5rem' },
  'puente-padel': { bg: 'transparent', fit: 'cover' },
}

function getClubImage(slug: string, index: number): string {
  return CLUB_LOCAL_IMAGES[slug] ?? CLUB_IMAGES[index % CLUB_IMAGES.length]
}

export default async function LandingPage() {
  const clubs = await getActiveClubs()

  return (
    <div className="min-h-screen" style={{ background: '#EBE9DF' }}>

      {/* NAV */}
      <nav style={{ background: '#004740' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: '36px', height: '36px', background: '#AE552D', flexShrink: 0 }}
            >
              <Award size={18} color="#FFFFFF" />
            </div>
            <span className="logo text-2xl" style={{ color: '#FFFFFF' }}>PadelBook</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              <a href="#clubes" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', border: 'none' }}>Clubes</a>
              <a href="#clubes" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', border: 'none' }}>Canchas</a>
              <a href="#clubes" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', border: 'none' }}>Nosotros</a>
            </div>
            <Link href="/login" className="btn btn-primary btn-sm">Ingresar</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#004740', minHeight: '85vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Background image */}
        <img
          src="/hero-bg.png"
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.25, pointerEvents: 'none',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,71,64,0.35)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 w-full py-20">
          {/* Main content card */}
          <div
            className="max-w-2xl rounded-3xl p-8 anim-up"
            style={{
              background: 'rgba(0,55,50,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 anim-in" style={{ background: 'rgba(174,85,45,0.2)', border: '1px solid rgba(174,85,45,0.35)' }}>
              <span style={{ fontSize: '0.85rem' }}>🏆</span>
              <span style={{ color: '#f0a070', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat)' }}>
                La mejor plataforma de Pádel
              </span>
            </div>

            <h1
              className="anim-up d-100 mt-0 mb-5"
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              La forma más inteligente de reservar tu{' '}
              <span
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#EBE9DF',
                }}
              >
                cancha de pádel
              </span>
            </h1>

            <p
              className="anim-up d-200 mb-8"
              style={{
                color: 'rgba(255,255,255,0.85)',
                maxWidth: '32rem',
                lineHeight: 1.65,
                fontSize: '1.05rem',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Sin llamadas, sin WhatsApp. Elegí el club, la hora y confirmás al instante.
            </p>

            <div className="anim-up d-300 flex flex-wrap items-center gap-3 mb-7">
              <a href="#clubes" className="btn btn-primary btn-lg">Buscar Cancha →</a>
              <Link href="/login" className="btn btn-ghost btn-lg" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)' }}>
                Ver Panel Admin
              </Link>
            </div>

            {/* Micro-stat badges */}
            <div className="flex flex-wrap gap-3 anim-in d-500">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Users size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-montserrat)' }}>
                  {clubs.length} Clubes
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Calendar size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-montserrat)' }}>24/7 Online</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Award size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-montserrat)' }}>WPT Clubs</span>
              </div>
            </div>
          </div>

          {/* Interactive Racket */}
          <RacketHero />
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2"
          style={{ transform: 'translateX(-50%)', animation: 'bounce 2s ease-in-out infinite' }}
        >
          <ChevronDown size={24} color="rgba(255,255,255,0.45)" />
        </div>
      </section>

      {/* COGNAC STRIP */}
      <section style={{ background: '#AE552D', padding: '1rem 0' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div
            className="flex flex-wrap items-center gap-6 text-sm font-semibold"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-montserrat)' }}
          >
            {['Reserva en menos de 30 segundos', 'Sin registro obligatorio', 'Confirmacion instantanea', 'Panel de gestion para el club'].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 800 }}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLUBS SECTION */}
      <section id="clubes" className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="section-label">Directorio de clubes</div>
            <h2
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '1.875rem',
                fontWeight: 800,
                color: '#34252F',
                letterSpacing: '-0.02em',
              }}
            >
              {clubs.length > 0 ? 'Clubes activos' : 'Próximamente'}
            </h2>
          </div>
          <span className="badge badge-racing">{clubs.length} disponible{clubs.length !== 1 ? 's' : ''}</span>
        </div>

        {clubs.length === 0 ? (
          <div className="card diagonal-stripe p-12 text-center">
            <p style={{ color: 'rgba(52,37,47,0.4)' }}>Los primeros clubes se están incorporando.</p>
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
                    animationDelay: `${i * 80}ms`,
                    transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                  }}
                >
                  {/* Green top accent */}
                  <div style={{ height: '4px', background: '#004740', borderRadius: '24px 24px 0 0' }} />

                  {/* Image */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: CLUB_LOGO_STYLE[club.slug]?.bg ?? '#EBE9DF' }}>
                    <img
                      src={getClubImage(club.slug, i)}
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
                    {/* Rating badge */}
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1"
                      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
                    >
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>4.9</span>
                    </div>
                    {/* Club name overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-4 py-3"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="badge badge-racing" style={{ background: 'rgba(0,71,64,0.85)', color: '#FFFFFF', borderColor: 'transparent', fontSize: '0.6rem' }}>
                          Club Pádel
                        </span>
                        <span className="badge" style={{ background: 'rgba(174,85,45,0.85)', color: '#FFFFFF', borderColor: 'transparent', fontSize: '0.6rem' }}>
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3
                      style={{
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#34252F',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {club.name}
                    </h3>
                    {club.address && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <MapPin size={13} color="rgba(52,37,47,0.45)" />
                        <span style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.825rem', fontFamily: 'var(--font-inter)' }}>
                          {club.address}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="badge badge-racing">
                        {club.courts.length} cancha{club.courts.length !== 1 ? 's' : ''}
                      </span>
                      <span
                        style={{
                          color: '#AE552D',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          fontFamily: 'var(--font-montserrat)',
                        }}
                      >
                        Ver disponibilidad →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#34252F' }}>
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center rounded-lg" style={{ width: '32px', height: '32px', background: '#AE552D', flexShrink: 0 }}>
                  <Award size={16} color="#FFFFFF" />
                </div>
                <span className="logo text-xl" style={{ color: '#FFFFFF' }}>PadelBook</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.65, fontFamily: 'var(--font-inter)' }}>
                La plataforma de reservas para clubes de pádel más moderna de Argentina.
              </p>
            </div>

            {/* Sedes */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'var(--font-montserrat)' }}>
                Sedes
              </p>
              <div className="space-y-2">
                {['Monte Cristo', 'Córdoba Capital'].map(sede => (
                  <div key={sede} className="flex items-center gap-2">
                    <MapPin size={13} color="rgba(174,85,45,0.7)" />
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)' }}>{sede}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Soporte */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'var(--font-montserrat)' }}>
                Soporte
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone size={13} color="rgba(174,85,45,0.7)" />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)' }}>+54 9 351 000 0000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} color="rgba(174,85,45,0.7)" />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)' }}>hola@padelbook.ar</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} color="rgba(174,85,45,0.7)" />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)' }}>Monte Cristo, Córdoba</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'var(--font-montserrat)' }}>
                Legal
              </p>
              <div className="space-y-2">
                <Link href="/login" style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
                  Política de privacidad
                </Link>
                <Link href="/login" style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
                  Términos y condiciones
                </Link>
                <Link href="/admin" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
                  Administración
                </Link>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              © {new Date().getFullYear()} PadelBook. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  )
}