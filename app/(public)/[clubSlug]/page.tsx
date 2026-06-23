import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { MapPin, Star, Award, ArrowRight } from 'lucide-react'

export default async function ClubPublicPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params

  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    include: { courts: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  })

  if (!club || (club.subscriptionStatus !== 'active' && club.subscriptionStatus !== 'trial')) notFound()

  return (
    <main className="min-h-screen" style={{ background: '#EBE9DF' }}>
      {/* NAV */}
      <nav style={{ background: '#004740' }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg" style={{ width: '32px', height: '32px', background: '#AE552D', flexShrink: 0 }}>
              <Award size={16} color="#FFFFFF" />
            </div>
            <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>PadelBook</Link>
          </div>
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            style={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
          >
            ← Clubes
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight: '320px', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' }}>
        <img
          src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1600"
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,71,64,0.7)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-5 w-full pt-16">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 anim-in" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ color: 'rgba(235,233,223,0.75)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat)' }}>
              Club de Pádel
            </span>
          </div>
          <h1
            className="anim-up d-100"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.05,
              marginTop: '0.25rem',
            }}
          >
            {club.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 anim-up d-200">
            {club.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} color="rgba(235,233,223,0.55)" />
                <span style={{ color: 'rgba(235,233,223,0.6)', fontSize: '0.9rem', fontFamily: 'var(--font-inter)' }}>
                  {club.address}
                </span>
              </div>
            )}
            <span className="badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.15)' }}>
              {club.courts.length} canchas
            </span>
            <span className="badge badge-green">
              {club.subscriptionStatus === 'active' ? 'Activo' : 'Trial'}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ background: '#EBE9DF' }}>
        <div className="max-w-5xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Courts list */}
            <div className="lg:col-span-2">
              <div className="section-label mb-4">Canchas disponibles</div>
              {club.courts.length === 0 ? (
                <div className="card p-10 text-center diagonal-stripe">
                  <p style={{ color: 'rgba(52,37,47,0.4)' }}>Sin canchas activas por el momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {club.courts.map((court, i) => (
                    <div
                      key={court.id}
                      className="anim-up"
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid rgba(52,37,47,0.07)',
                        borderTop: '4px solid #004740',
                        boxShadow: '0 2px 8px rgba(52,37,47,0.04)',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        animationDelay: `${i * 70}ms`,
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '1rem', color: '#34252F' }}>
                          {court.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-racing" style={{ fontSize: '0.6rem' }}>{court.surface}</span>
                          <span className="badge badge-cognac" style={{ fontSize: '0.6rem' }}>
                            {court.isIndoor ? 'Techada' : 'Al aire libre'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.4rem', fontWeight: 800, color: '#004740', lineHeight: 1 }}>
                          ${Number(court.pricePerHour).toLocaleString('es-AR')}
                        </p>
                        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'rgba(52,37,47,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                          por hora
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            <div>
              <div
                className="sticky top-6"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid rgba(52,37,47,0.08)',
                  borderLeft: '4px solid #004740',
                  boxShadow: '0 4px 12px rgba(52,37,47,0.06)',
                  padding: '1.5rem',
                }}
              >
                <div className="section-label mb-2">Reservar ahora</div>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <span style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.5)', marginLeft: '0.25rem', fontFamily: 'var(--font-inter)' }}>4.9</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.6)', lineHeight: 1.65, marginBottom: '1.25rem', fontFamily: 'var(--font-inter)' }}>
                  Elegí tu cancha y horario en segundos. Sin llamadas, sin espera.
                </p>
                <Link
                  href={`/${club.slug}/book`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem' }}
                >
                  Elegir horario <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#34252F' }}>
        <div className="max-w-5xl mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg" style={{ width: '28px', height: '28px', background: '#AE552D', flexShrink: 0 }}>
              <Award size={14} color="#FFFFFF" />
            </div>
            <span className="logo text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>PadelBook</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textDecoration: 'none', fontFamily: 'var(--font-montserrat)', fontWeight: 600 }}>
              Administración
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}