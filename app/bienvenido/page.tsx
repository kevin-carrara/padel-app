import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const WHATSAPP_NUMBER = '3513159096' // Reemplazar con tu número real

export default async function BienvenidoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: { club: { select: { name: true, subscriptionStatus: true } } },
  })

  // Si el perfil fue eliminado (cuenta rechazada), cerrar sesión y redirigir
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Si ya está activo o en trial, ir al dashboard
  const status = profile.club?.subscriptionStatus
  if (status === 'active' || status === 'trial') redirect('/dashboard')

  const clubName = profile.club?.name ?? 'tu club'
  const contactName = profile.fullName ?? user.email ?? ''

  const waMessage = encodeURIComponent(
    `Hola! Me registré en AJClubPadel como administrador de *${clubName}*. Mi nombre es ${contactName}. Quisiera solicitar más información.`
  )
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return (
    <div style={{ minHeight: '100vh', background: '#004740', display: 'flex', flexDirection: 'column' }}>
      {/* Subtle grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px)',
      }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="logo text-xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-montserrat)',
              fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: '9999px', cursor: 'pointer',
            }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          {/* Checkmark */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 2rem',
            background: 'rgba(174,85,45,0.2)', border: '1.5px solid rgba(174,85,45,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 256 256" fill="none">
              <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm49.66-109.66a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L116 156.69l50.34-50.35a8 8 0 0 1 11.32 0Z" fill="#AE552D"/>
            </svg>
          </div>

          <p style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: '#AE552D', fontFamily: 'var(--font-montserrat)', marginBottom: '0.75rem',
          }}>
            Solicitud recibida
          </p>

          <h1 style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.25rem',
          }}>
            ¡Bienvenido a<br />AJClubPadel!
          </h1>

          <p style={{
            fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65,
            fontFamily: 'var(--font-inter)', marginBottom: '0.75rem', maxWidth: '400px', margin: '0 auto 0.75rem',
          }}>
            Registramos{' '}
            <strong style={{ color: '#EBE9DF' }}>{clubName}</strong>.
            {' '}Para activar tu acceso, hablá con nuestro asesor de ventas por WhatsApp — te configuramos todo en minutos.
          </p>

          <p style={{
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
            fontFamily: 'var(--font-inter)', marginBottom: '2.5rem',
          }}>
            También podés esperar — te vamos a contactar pronto al email registrado.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.875rem 2rem', borderRadius: '9999px',
              background: '#25D366', color: '#FFFFFF', textDecoration: 'none',
              fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 4px 20px rgba(37,211,102,0.35)', transition: 'all 0.2s',
              marginBottom: '1.25rem',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Hablar con ventas
          </a>

          <div>
            <Link
              href="/login"
              style={{
                fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
                fontFamily: 'var(--font-inter)', display: 'block', marginTop: '0.5rem',
              }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
