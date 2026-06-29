import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileSidebar from './MobileSidebar'
import DashboardNav from './DashboardNav'
import { prisma } from '@/lib/db/prisma'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })

  // Si el perfil fue eliminado (cuenta rechazada), cerrar sesión
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const club = profile.clubId ? await prisma.club.findUnique({ where: { id: profile.clubId }, select: { name: true, subscriptionStatus: true } }) : null

  const displayName = club?.name ?? user.user_metadata?.name ?? user.email ?? ''
  const userName = user.user_metadata?.name ?? user.email ?? ''

  // Bloquear acceso a clubes en espera (pending) — redirigir a bienvenido
  if (club?.subscriptionStatus === 'pending') {
    redirect('/bienvenido')
  }

  // Bloquear acceso a clubes suspendidos
  if (club?.subscriptionStatus === 'suspended') {
    return (
      <div style={{ minHeight: '100vh', background: '#EBE9DF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.5rem',
          }}>
            <svg width="36" height="36" viewBox="0 0 256 256" fill="none">
              <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm-8-80V80a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm20 36a12 12 0 1 1-12-12 12 12 0 0 1 12 12Z" fill="#dc2626"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1.6rem',
            color: '#34252F', letterSpacing: '-0.02em', marginBottom: '0.75rem',
          }}>
            Cuenta suspendida
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(52,37,47,0.6)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            El acceso a <strong style={{ color: '#34252F' }}>{displayName}</strong> ha sido suspendido.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(52,37,47,0.5)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Para reactivar tu suscripción o consultar el motivo, contactá con soporte.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <a
              href="mailto:soporte@ajclubpadel.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.75rem', borderRadius: '9999px',
                background: '#004740', color: '#FFFFFF', textDecoration: 'none',
                fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.875rem',
              }}
            >
              Contactar soporte
            </a>
            <form action="/api/auth/signout" method="post">
              <button type="submit" style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat)', fontWeight: 600, fontSize: '0.82rem',
                color: 'rgba(52,37,47,0.45)', textDecoration: 'underline', padding: '0.25rem',
              }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#EBE9DF' }}>
      {/* SIDEBAR */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: '#004740', position: 'relative' }}
      >
        {/* Subtle diagonal texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', background: '#FFFFFF', borderRadius: '10px', flexShrink: 0, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
              </div>
              <div>
                <p className="logo" style={{ color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.1 }}>AJClubPadel</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', fontFamily: 'var(--font-inter)', marginTop: '0.1rem', letterSpacing: '0.06em' }}>
                  PANEL ADMIN
                </p>
              </div>
            </Link>
          </div>

          {/* Club badge */}
          {club && (
            <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(174,85,45,0.12)', border: '1px solid rgba(174,85,45,0.2)' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.78rem', color: '#EBE9DF', lineHeight: 1.2, marginBottom: '0.15rem' }}>
                {displayName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: club.subscriptionStatus === 'active' ? '#4ade80' : '#f59e0b', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: 'rgba(174,85,45,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {club.subscriptionStatus === 'active' ? 'Activo' : club.subscriptionStatus === 'trial' ? 'Trial' : club.subscriptionStatus}
                </p>
              </div>
            </div>
          )}

          {/* Nav */}
          <DashboardNav />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <MobileSidebar userName={userName} />
        <main className="flex-1 px-6 py-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
