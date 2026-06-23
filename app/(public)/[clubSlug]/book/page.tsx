import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { getAvailableSlots } from '@/lib/booking/availability'
import PublicBookingForm from './PublicBookingForm'

export default async function PublicBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubSlug: string }>
  searchParams: Promise<{ courtId?: string; date?: string }>
}) {
  const { clubSlug } = await params
  const query = await searchParams

  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    include: { courts: { where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } } },
  })

  if (!club || (club.subscriptionStatus !== 'active' && club.subscriptionStatus !== 'trial')) notFound()

  const courts = club.courts
  const defaultCourtId = courts[0]?.id
  const selectedCourtId = query.courtId && courts.some(c => c.id === query.courtId) ? query.courtId : defaultCourtId
  const selectedDate = query.date ?? new Date().toISOString().slice(0, 10)
  const slots = selectedCourtId ? await getAvailableSlots(selectedCourtId, selectedDate) : []

  return (
    <main className="min-h-screen" style={{ background: '#EBE9DF' }}>
      <nav style={{ background: '#004740' }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            PadelBook
          </Link>
          <Link
            href={`/${club.slug}`}
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            {club.name}
          </Link>
        </div>
      </nav>

      <section
        className="relative overflow-hidden"
        style={{ background: '#004740', paddingBottom: '3rem' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-12 pb-2">
          <div className="section-label anim-in" style={{ color: 'rgba(235,233,223,0.65)' }}>
            Reservar turno
          </div>
          <h1
            className="anim-up d-100"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginTop: '0.5rem',
            }}
          >
            {club.name}
          </h1>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10">
        {courts.length === 0 ? (
          <div className="card p-8 text-center diagonal-stripe">
            <p style={{ color: 'rgba(52,37,47,0.4)' }}>Este club no tiene canchas activas para reservar.</p>
          </div>
        ) : (
          <PublicBookingForm clubSlug={club.slug} courts={courts} slots={slots} />
        )}
      </section>
    </main>
  )
}