import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import RacketHero from './RacketHero'
import {
  CaretDown, MapPin, Phone, Envelope, Medal, CalendarBlank, Users,
  Trophy, Buildings, TennisBall,
  ChartLineUp, CalendarDots, CourtBasketball, DeviceMobile,
  UsersFour, CheckCircle, ArrowRight,
} from '@phosphor-icons/react/dist/ssr'

export const dynamic = 'force-dynamic'

async function getClubCount(): Promise<number> {
  return prisma.club.count({ where: { subscriptionStatus: { in: ['active', 'trial'] } } })
}

export default async function LandingPage() {
  const clubCount = await getClubCount()

  return (
    <div className="min-h-screen" style={{ background: '#EBE9DF' }}>

      {/* NAV */}
      <nav style={{ background: '#004740' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ width: '44px', height: '44px', background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '44px', height: '44px', objectFit: 'cover' }} />
            </div>
            <span className="logo text-2xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              <a href="/clubes" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', border: 'none' }}>Clubes</a>
              <a href="#precios" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', border: 'none' }}>Precios</a>
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
              <Trophy size={14} color="#f0a070" weight="fill" />
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
              <a href="/clubes" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <TennisBall size={18} weight="fill" /> Reservar cancha
              </a>
              <Link href="/register" className="btn btn-ghost btn-lg" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Buildings size={18} weight="fill" /> Registrar mi club
              </Link>
            </div>

            {/* Micro-stat badges */}
            <div className="flex flex-wrap gap-3 anim-in d-500">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Users size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-montserrat)' }}>
                  {clubCount} Clubes
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <CalendarBlank size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-montserrat)' }}>24/7 Online</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Medal size={12} color="rgba(255,255,255,0.7)" />
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
          <CaretDown size={24} color="rgba(255,255,255,0.45)" />
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
                <CheckCircle size={15} color="#FFFFFF" weight="fill" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAYER CTA — replaced full club directory */}
      <section id="clubes" style={{ background: '#004740', padding: '4rem 0' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="section-label" style={{ color: 'rgba(235,233,223,0.5)', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>¿Jugás pádel?</div>
              <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Encontrá tu club y reservá en segundos
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)', fontSize: '1rem', maxWidth: '440px' }}>
                Mirá disponibilidad en tiempo real, elegí horario y confirmá sin llamadas ni WhatsApp.
              </p>
            </div>
            <Link href="/clubes" className="btn btn-primary btn-lg" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              Ver clubes →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES — Para administradores de club */}
      <section style={{ background: '#34252F', padding: '5rem 0' }}>
        <div className="max-w-6xl mx-auto px-5">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ background: 'rgba(174,85,45,0.2)', border: '1px solid rgba(174,85,45,0.3)' }}>
              <Buildings size={13} color="#f0a070" weight="fill" />
              <span style={{ color: '#f0a070', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat)' }}>
                Para administradores
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1rem',
            }}>
              Control total,{' '}
              <span style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: '#AE552D' }}>
                cero complicaciones
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Todo lo que necesitás para gestionar tu club desde un solo lugar, en menos de 5 minutos de configuración.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              {
                Icon: ChartLineUp,
                title: 'Panel de métricas',
                desc: 'Ocupación, ingresos y reservas en tiempo real. Tomá decisiones con datos, no intuición.',
                highlight: false,
              },
              {
                Icon: CalendarDots,
                title: 'Calendario inteligente',
                desc: 'Vista semanal con todos los turnos. Creá, cancelá o bloqueá canchas en segundos.',
                highlight: true,
              },
              {
                Icon: CourtBasketball,
                title: 'Gestión de canchas',
                desc: 'Configurá precios por horario, tipo de superficie y disponibilidad de cada cancha.',
                highlight: false,
              },
              {
                Icon: DeviceMobile,
                title: 'Reservas 24/7',
                desc: 'Tus jugadores reservan online desde el celular sin llamadas, sin WhatsApp.',
                highlight: false,
              },
              {
                Icon: Buildings,
                title: 'Página pública del club',
                desc: 'Tu club con foto de portada, descripción, amenidades y precios visibles para todos.',
                highlight: false,
              },
              {
                Icon: UsersFour,
                title: 'Multi-usuario',
                desc: 'Sumá empleados y recepcionistas con roles y accesos diferenciados según el plan.',
                highlight: false,
              },
            ].map(({ Icon: FeatureIcon, title, desc, highlight }) => (
              <div
                key={title}
                style={{
                  background: highlight ? '#AE552D' : 'rgba(255,255,255,0.05)',
                  border: highlight ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: highlight ? 'rgba(255,255,255,0.2)' : 'rgba(174,85,45,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FeatureIcon
                    size={22}
                    weight="fill"
                    color={highlight ? '#FFFFFF' : '#AE552D'}
                  />
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem',
                    color: highlight ? '#FFFFFF' : '#EBE9DF', marginBottom: '0.4rem', lineHeight: 1.2,
                  }}>
                    {title}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '0.875rem', lineHeight: 1.6,
                    color: highlight ? 'rgba(255,255,255,0.85)' : 'rgba(235,233,223,0.5)',
                  }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA inferior */}
          <div className="text-center">
            <Link
              href="/register"
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Registrar mi club gratis
              <ArrowRight size={18} weight="bold" />
            </Link>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem' }}>
              30 días de prueba · Sin tarjeta de crédito · Configuración asistida
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" style={{ background: '#EBE9DF', padding: '5rem 0' }}>
        <div className="max-w-6xl mx-auto px-5">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="section-label" style={{ color: '#AE552D', justifyContent: 'center', marginBottom: '0.75rem' }}>
              Planes y precios
            </div>
            <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#34252F', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Sin sorpresas. Sin comisiones por reserva.
            </h2>
            <p style={{ color: 'rgba(52,37,47,0.6)', fontFamily: 'var(--font-inter)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              Pagás un abono mensual fijo por tu club. Tus jugadores reservan gratis, siempre.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            {/* Starter */}
            <div className="card p-7" style={{ position: 'relative' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(52,37,47,0.4)', marginBottom: '0.5rem' }}>
                Starter
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.75rem', fontWeight: 800, color: '#34252F', lineHeight: 1 }}>$9.900</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: 'rgba(52,37,47,0.45)', marginLeft: '0.4rem' }}>/mes</span>
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Ideal para clubes pequeños que quieren empezar a digitalizar sus reservas.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['Hasta 2 canchas', 'Reservas ilimitadas', 'Panel de administración', 'Página pública del club', 'Soporte por WhatsApp'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#34252F' }}>
                    <CheckCircle size={15} color="#004740" weight="fill" /> {f}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Starter" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Empezar gratis 30 días
              </a>
            </div>

            {/* Pro — destacado */}
            <div className="card p-7" style={{ position: 'relative', border: '2px solid #004740', background: '#004740' }}>
              {/* Badge */}
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#AE552D', borderRadius: '99px', padding: '3px 14px' }}>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.65rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  Más popular
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                Pro
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.75rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>$18.900</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginLeft: '0.4rem' }}>/mes</span>
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Para clubes en crecimiento que quieren profesionalizar su operación.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['Hasta 6 canchas', 'Reservas ilimitadas', 'Calendario semanal', 'Reservas recurrentes', 'Vista de caja e ingresos', 'Onboarding asistido', 'Soporte prioritario'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#FFFFFF' }}>
                    <CheckCircle size={15} color="#AE552D" weight="fill" /> {f}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Pro" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Empezar gratis 30 días
              </a>
            </div>

            {/* Club */}
            <div className="card p-7" style={{ position: 'relative' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(52,37,47,0.4)', marginBottom: '0.5rem' }}>
                Club
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '2.75rem', fontWeight: 800, color: '#34252F', lineHeight: 1 }}>$29.900</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: 'rgba(52,37,47,0.45)', marginLeft: '0.4rem' }}>/mes</span>
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Para clubes consolidados con múltiples canchas y alta demanda.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['Canchas ilimitadas', 'Todo lo del plan Pro', 'Múltiples recepcionistas', 'Estadísticas avanzadas', 'API de integración', 'SLA garantizado', 'Gerente de cuenta dedicado'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#34252F' }}>
                    <CheckCircle size={15} color="#004740" weight="fill" /> {f}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Club" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Hablar con ventas
              </a>
            </div>
          </div>

          {/* FAQ rápido */}
          <div className="card p-6 md:p-8" style={{ background: 'rgba(0,71,64,0.05)', border: '1px solid rgba(0,71,64,0.1)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { q: '¿Los jugadores pagan algo?', a: 'No. La reserva online es 100% gratuita para los jugadores. El club paga el abono mensual.' },
                { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, sin permanencia ni penalidades. Podés darte de baja en cualquier momento desde tu panel.' },
                { q: '¿Hay soporte para la configuración?', a: 'Sí. Te ayudamos a configurar tu club, canchas y horarios sin costo adicional.' },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.875rem', color: '#34252F', marginBottom: '0.4rem' }}>{q}</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.825rem', color: 'rgba(52,37,47,0.6)', lineHeight: 1.55 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#34252F' }}>
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: '44px', height: '44px', background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '44px', height: '44px', objectFit: 'cover' }} />
                </div>
                <span className="logo text-xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
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
                  <Envelope size={13} color="rgba(174,85,45,0.7)" />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontFamily: 'var(--font-inter)' }}>hola@ajclubpadel.ar</span>
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
              © {new Date().getFullYear()} AJClubPadel. Todos los derechos reservados.
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
