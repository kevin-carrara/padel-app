import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import {
  MapPin, Phone, Envelope, Trophy, Buildings, TennisBall,
  ChartLineUp, CalendarDots, CourtBasketball, DeviceMobile,
  UsersFour, CheckCircle, ArrowRight, MagnifyingGlass, CalendarCheck,
} from '@phosphor-icons/react/dist/ssr'

export const dynamic = 'force-dynamic'

async function getClubCount(): Promise<number> {
  return prisma.club.count({ where: { subscriptionStatus: { in: ['active', 'trial'] } } })
}

const landingCss = `
  /* -- Scroll behaviour -- */
  html { scroll-behavior: smooth; }

  /* -- SKIP NAV -- */
  .lp-skip-nav {
    position: absolute; top: -100px; left: 1rem; z-index: 999;
    background: #004740; color: #fff; padding: 0.5rem 1rem;
    border-radius: 0 0 8px 8px; font-family: var(--font-montserrat);
    font-size: 0.85rem; font-weight: 700; text-decoration: none;
    transition: top 0.2s;
  }
  .lp-skip-nav:focus { top: 0; }

  /* -- NAV -- */
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    background: #004740;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(8px);
  }
  .lp-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; box-sizing: border-box; width: 100%; }
  .lp-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .lp-logo-img { width: 38px; height: 38px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
  .lp-nav-links { display: none; gap: 0.25rem; }
  @media (min-width: 768px) { .lp-nav-links { display: flex; } }
  .lp-nav-links a {
    color: rgba(255,255,255,0.65); font-size: 0.875rem;
    font-family: var(--font-montserrat); font-weight: 600;
    padding: 0.4rem 0.875rem; border-radius: 9999px; text-decoration: none;
    min-height: 44px; display: inline-flex; align-items: center;
    transition: color 0.15s, background 0.15s;
  }
  .lp-nav-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .lp-nav-links a:focus-visible { outline: 2px solid #f0a070; outline-offset: 3px; }

  /* -- TOUCH TARGETS (WCAG 2.5.5) -- */
  .btn { min-height: 44px; display: inline-flex; align-items: center; }
  .btn:focus-visible { outline: 2px solid #f0a070; outline-offset: 3px; }

  /* -- HERO -- */
  .lp-hero {
    position: relative; overflow: hidden;
    background: #004740;
    min-height: 90vh;
    display: flex; align-items: center;
  }
  .lp-hero-lines {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      repeating-linear-gradient(0deg,   rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px),
      repeating-linear-gradient(90deg,  rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px);
  }
  .lp-hero-inner {
    position: relative; z-index: 10;
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 5rem 1.5rem 4rem;
    width: 100%; max-width: 1100px; margin: 0 auto; box-sizing: border-box;
  }
  @media (min-width: 900px) {
    .lp-hero-inner { grid-template-columns: 1.15fr 0.85fr; align-items: center; padding: 5rem 1.5rem; }
  }

  /* Hero content */
  .lp-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(174,85,45,0.2); border: 1px solid rgba(174,85,45,0.35);
    border-radius: 9999px; padding: 0.375rem 1rem; margin-bottom: 1.5rem;
    color: #f0a070; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: var(--font-montserrat);
  }
  .lp-hero-h1 {
    font-family: var(--font-montserrat); font-weight: 800;
    font-size: clamp(2.4rem, 6vw, 4rem);
    color: #FFFFFF; line-height: 1.08; letter-spacing: -0.025em;
    margin: 0 0 1.25rem;
  }
  .lp-hero-em {
    font-family: var(--font-playfair); font-style: italic;
    font-weight: 700; color: #EBE9DF;
  }
  .lp-hero-sub {
    color: rgba(255,255,255,0.72); font-family: var(--font-inter);
    font-size: 1.05rem; line-height: 1.65; max-width: 28rem;
    margin: 0 0 2rem;
  }
  .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2.25rem; }
  .lp-cta-btn { display: inline-flex; align-items: center; gap: 0.5rem; }
  .lp-cta-ghost {
    display: inline-flex; align-items: center; gap: 0.5rem;
    color: rgba(255,255,255,0.85) !important;
    border-color: rgba(255,255,255,0.25) !important;
  }
  .lp-hero-stats {
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  }
  .lp-stat-pill {
    display: flex; flex-direction: column;
  }
  .lp-stat-num {
    font-family: var(--font-montserrat); font-weight: 800;
    font-size: 1.25rem; color: #FFFFFF; line-height: 1.1;
  }
  .lp-stat-pill span:last-child {
    font-family: var(--font-inter); font-size: 0.7rem;
    color: rgba(255,255,255,0.45); letter-spacing: 0.04em;
  }
  .lp-stat-sep {
    width: 1px; height: 2rem; background: rgba(255,255,255,0.12);
  }

  /* Hero visual - court */
  .lp-hero-visual {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  @media (max-width: 899px) { .lp-hero-visual { display: none; } }
  .lp-court-wrap {
    position: relative; display: inline-block;
  }
  .lp-court-svg {
    width: 200px; height: auto;
    filter: drop-shadow(0 32px 64px rgba(0,0,0,0.5));
    border-radius: 8px;
  }
  @keyframes lpBallPath {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    18%  { transform: translate(35px, -85px) scale(0.7); opacity: 0.9; }
    36%  { transform: translate(-30px, -155px) scale(1); opacity: 1; }
    50%  { transform: translate(0px, -5px) scale(1); opacity: 1; }
    68%  { transform: translate(-35px, 80px) scale(0.7); opacity: 0.9; }
    86%  { transform: translate(30px, 150px) scale(1); opacity: 1; }
    100% { transform: translate(0, 0) scale(1); opacity: 1; }
  }
  @keyframes lpPlayerPulse {
    0%, 100% { r: 7; opacity: 1; }
    50% { r: 5.5; opacity: 0.75; }
  }
  .lp-ball { animation: lpBallPath 3.2s cubic-bezier(0.45,0,0.55,1) infinite; }
  .lp-player-a { animation: lpPlayerPulse 3.2s 0s ease-in-out infinite; }
  .lp-player-b { animation: lpPlayerPulse 3.2s 0.4s ease-in-out infinite; }
  .lp-player-c { animation: lpPlayerPulse 3.2s 0.8s ease-in-out infinite; }
  .lp-player-d { animation: lpPlayerPulse 3.2s 1.2s ease-in-out infinite; }

  /* Floating booking card */
  .lp-booking-card {
    position: absolute; bottom: -20px; right: -60px;
    background: #FFFFFF; border-radius: 14px;
    padding: 0.875rem 1.1rem;
    box-shadow: 0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04);
    width: 200px;
    animation: lpCardFloat 4s ease-in-out infinite;
  }
  @keyframes lpCardFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .lp-booking-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
  .lp-booking-label { font-family: var(--font-montserrat); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(52,37,47,0.4); }
  .lp-booking-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: lpDotPulse 2s ease-in-out infinite; }
  @keyframes lpDotPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
  .lp-booking-club { font-family: var(--font-montserrat); font-size: 0.78rem; font-weight: 700; color: #34252F; margin: 0 0 0.15rem; }
  .lp-booking-time { font-family: var(--font-inter); font-size: 0.72rem; color: rgba(52,37,47,0.55); margin: 0 0 0.5rem; }
  .lp-booking-confirm {
    display: flex; align-items: center; gap: 0.35rem;
    background: rgba(0,71,64,0.07); border-radius: 9999px; padding: 0.22rem 0.6rem;
    font-family: var(--font-montserrat); font-size: 0.65rem; font-weight: 700; color: #004740;
    width: fit-content;
  }

  /* -- SOCIAL PROOF STRIP -- */
  .lp-proof-strip {
    background: #AE552D;
    display: flex; flex-wrap: wrap;
    justify-content: space-around; align-items: center;
    padding: 1.5rem 1.5rem;
    gap: 1.5rem;
  }
  .lp-proof-item { text-align: center; }
  .lp-proof-num {
    display: block; font-family: var(--font-montserrat); font-weight: 800;
    font-size: clamp(1.75rem, 4vw, 2.5rem); color: #FFFFFF; line-height: 1;
    letter-spacing: -0.02em;
  }
  .lp-proof-label {
    display: block; font-family: var(--font-inter); font-size: 0.72rem;
    color: rgba(255,255,255,0.65); letter-spacing: 0.04em; margin-top: 0.2rem;
    text-transform: uppercase; font-weight: 600;
  }

  /* -- SECTIONS -- */
  .lp-section { padding: 5rem 0; }
  .lp-section-header { text-align: center; margin-bottom: 3.5rem; }
  .lp-section-header-light .section-label { color: rgba(235,233,223,0.45) !important; }
  .lp-section-h2 {
    font-family: var(--font-montserrat); font-weight: 800;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    color: #34252F; letter-spacing: -0.02em; line-height: 1.15;
    margin: 0 0 0.875rem;
  }
  .lp-section-sub {
    font-family: var(--font-inter); font-size: 1rem;
    color: rgba(52,37,47,0.55); max-width: 480px; margin: 0 auto; line-height: 1.65;
  }

  /* -- HOW IT WORKS -- */
  .lp-how { background: #EBE9DF; }
  .lp-steps { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 768px) { .lp-steps { grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; } }
  .lp-step {
    background: #FFFFFF; border-radius: 18px;
    padding: 1.75rem 1.5rem;
    border: 1px solid rgba(52,37,47,0.06);
    box-shadow: 0 2px 12px rgba(52,37,47,0.04);
    position: relative;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .lp-step:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,71,64,0.12); }
  .lp-step-number {
    font-family: var(--font-montserrat); font-weight: 800;
    font-size: 0.65rem; letter-spacing: 0.14em; color: rgba(52,37,47,0.25);
    text-transform: uppercase; margin-bottom: 1rem;
  }
  .lp-step-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(0,71,64,0.06); border: 1px solid rgba(0,71,64,0.1);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.125rem;
  }
  .lp-step-title { font-family: var(--font-montserrat); font-weight: 800; font-size: 1rem; color: #34252F; margin: 0 0 0.5rem; }
  .lp-step-desc { font-family: var(--font-inter); font-size: 0.875rem; color: rgba(52,37,47,0.55); line-height: 1.6; margin: 0; }

  /* -- FEATURES (bento) -- */
  .lp-features { background: #34252F; }
  .lp-bento { display: grid; grid-template-columns: 1fr; gap: 0.875rem; }
  @media (min-width: 640px) { .lp-bento { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 960px) {
    .lp-bento { grid-template-columns: 1fr 1fr 1fr; }
    .lp-bento-large { grid-row: 1 / 3; }
  }
  .lp-bento-item {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 1.625rem;
    transition: background 0.2s, border-color 0.2s, transform 0.22s;
    position: relative; overflow: hidden;
  }
  .lp-bento-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(174,85,45,0.25); transform: translateY(-2px); }
  .lp-bento-highlight { background: rgba(174,85,45,0.12) !important; border-color: rgba(174,85,45,0.25) !important; }
  .lp-bento-highlight:hover { background: rgba(174,85,45,0.18) !important; border-color: rgba(174,85,45,0.45) !important; }
  .lp-bento-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(174,85,45,0.15); border: 1px solid rgba(174,85,45,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
  }
  .lp-bento-highlight .lp-bento-icon { background: rgba(174,85,45,0.2); }
  .lp-bento-title { font-family: var(--font-montserrat); font-weight: 800; font-size: 1rem; color: #EBE9DF; margin: 0 0 0.5rem; }
  .lp-bento-desc { font-family: var(--font-inter); font-size: 0.85rem; color: rgba(235,233,223,0.45); line-height: 1.6; margin: 0; }
  .lp-bento-large .lp-bento-desc { color: rgba(235,233,223,0.6); font-size: 0.9rem; }
  .lp-bento-tag {
    position: absolute; top: 1rem; right: 1rem;
    background: #AE552D; color: #fff; border-radius: 9999px;
    font-family: var(--font-montserrat); font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.6rem;
  }

  /* -- PRICING -- */
  .lp-pricing-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-bottom: 2.5rem; }
  @media (min-width: 768px) { .lp-pricing-grid { grid-template-columns: 1fr 1fr 1fr; } }
  .lp-plan {
    background: #FFFFFF; border-radius: 20px; padding: 2rem;
    border: 1.5px solid rgba(52,37,47,0.08);
    box-shadow: 0 2px 12px rgba(52,37,47,0.04);
    position: relative; display: flex; flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .lp-plan:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,71,64,0.1); }
  .lp-plan-featured { background: #004740 !important; border-color: #004740 !important; box-shadow: 0 8px 32px rgba(0,71,64,0.28) !important; }
  .lp-plan-featured:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 48px rgba(0,71,64,0.35) !important; }
  .lp-plan-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    background: #AE552D; border-radius: 9999px; padding: 3px 14px;
    font-family: var(--font-montserrat); font-size: 0.62rem; font-weight: 700;
    color: #fff; text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
  }
  .lp-plan-name { font-family: var(--font-montserrat); font-weight: 700; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(52,37,47,0.38); margin: 0 0 0.5rem; }
  .lp-plan-price { margin: 0 0 1rem; display: flex; align-items: baseline; gap: 0.3rem; }
  .lp-plan-price span { font-family: var(--font-montserrat); font-weight: 800; font-size: 2.5rem; color: #34252F; line-height: 1; }
  .lp-plan-price em { font-family: var(--font-inter); font-size: 0.85rem; color: rgba(52,37,47,0.4); font-style: normal; }
  .lp-plan-tagline { font-family: var(--font-inter); font-size: 0.875rem; color: rgba(52,37,47,0.52); line-height: 1.55; margin: 0 0 1.5rem; flex: 1; }
  .lp-plan-features { list-style: none; padding: 0; margin: 0 0 1.75rem; display: flex; flex-direction: column; gap: 0.55rem; }
  .lp-plan-features li { display: flex; align-items: center; gap: 0.55rem; font-family: var(--font-inter); font-size: 0.875rem; color: #34252F; }
  .lp-plan-features-light li { color: rgba(255,255,255,0.85); }
  .lp-faq {
    background: rgba(0,71,64,0.05); border: 1px solid rgba(0,71,64,0.1);
    border-radius: 18px; padding: 1.75rem 2rem;
    display: grid; grid-template-columns: 1fr; gap: 1.5rem;
  }
  @media (min-width: 768px) { .lp-faq { grid-template-columns: 1fr 1fr 1fr; } }
  .lp-faq-q { font-family: var(--font-montserrat); font-weight: 700; font-size: 0.875rem; color: #34252F; margin: 0 0 0.35rem; }
  .lp-faq-a { font-family: var(--font-inter); font-size: 0.82rem; color: rgba(52,37,47,0.55); line-height: 1.6; margin: 0; }

  /* -- FINAL CTA -- */
  .lp-final-cta { background: #004740; padding: 5rem 0; position: relative; overflow: hidden; }
  .lp-final-cta::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(-45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 18px);
  }
  .lp-final-cta-inner {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2rem;
  }
  @media (min-width: 768px) {
    .lp-final-cta-inner { flex-direction: row; justify-content: space-between; text-align: left; }
  }
  .lp-final-h2 {
    font-family: var(--font-montserrat); font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem);
    color: #FFFFFF; line-height: 1.1; letter-spacing: -0.025em; margin: 0;
  }
  .lp-final-actions { display: flex; flex-wrap: wrap; gap: 0.875rem; flex-shrink: 0; }

  /* -- FOOTER -- */
  .lp-footer { background: #34252F; padding: 3.5rem 0 2rem; }
  .lp-footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2.5rem; }
  @media (min-width: 768px) { .lp-footer-grid { grid-template-columns: 1.5fr 1fr 1fr 1fr; } }
  .lp-footer-col-title {
    color: rgba(255,255,255,0.55); font-weight: 700; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.12em;
    margin: 0 0 0.875rem; font-family: var(--font-montserrat);
  }
  .lp-footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 1.5rem; }
  .lp-footer-bottom p { color: rgba(255,255,255,0.22); font-size: 0.75rem; font-family: var(--font-inter); margin: 0; }

  /* -- REDUCED MOTION -- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`

export default async function LandingPage() {
  const clubCount = await getClubCount()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const loginHref = user ? '/auth/home' : '/login'

  return (
    <div style={{ background: '#EBE9DF', minHeight: '100vh', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: landingCss }} />
      <a href="#main" className="lp-skip-nav">Ir al contenido principal</a>

      {/* --- NAV --- */}
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="lp-logo-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="logo" style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>AJClubPadel</span>
          </div>
          <nav className="lp-nav-links">
            <a href="/clubes">Clubes</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#precios">Precios</a>
          </nav>
          <Link href={loginHref} className="btn btn-primary btn-sm">Ingresar</Link>
        </div>
      </nav>

      <main id="main">

      {/* --- HERO --- */}
      <section className="lp-hero">
        <div className="lp-hero-lines" aria-hidden="true" />

        <div className="lp-hero-inner">
          {/* LEFT */}
          <div>
            <div className="lp-badge anim-up">
              <Trophy size={13} weight="fill" color="#f0a070" />
              <span>Córdoba, Argentina · Reservas online</span>
            </div>

            <h1 className="lp-hero-h1 anim-up d-100">
              Reservá tu cancha{' '}
              <em className="lp-hero-em">en segundos</em>
            </h1>

            <p className="lp-hero-sub anim-up d-200">
              Sin llamadas, sin WhatsApp. Elegí el club, la hora y confirmás al instante desde donde estés.
            </p>

            <div className="lp-hero-ctas anim-up d-300">
              <a href="/clubes" className="btn btn-primary btn-lg lp-cta-btn">
                <TennisBall size={18} weight="fill" /> Reservar cancha
              </a>
              <Link href="/register" className="btn btn-ghost btn-lg lp-cta-ghost">
                <Buildings size={18} weight="fill" /> Registrar mi club
              </Link>
            </div>

            <div className="lp-hero-stats anim-in d-500">
              <div className="lp-stat-pill">
                <span className="lp-stat-num">{clubCount}</span>
                <span>Clubes</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-pill">
                <span className="lp-stat-num">30s</span>
                <span>Para reservar</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-pill">
                <span className="lp-stat-num">24/7</span>
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* RIGHT - Animated court */}
          <div className="lp-hero-visual anim-in d-200">
            <div className="lp-court-wrap">
              <svg viewBox="0 0 260 520" className="lp-court-svg" aria-hidden="true">
                <rect x="0" y="0" width="260" height="520" rx="8" fill="#1a5c20"/>
                <rect x="14" y="14" width="232" height="492" rx="4" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2"/>
                <rect x="14" y="14" width="232" height="58" fill="rgba(255,255,255,0.05)"/>
                <rect x="14" y="448" width="232" height="58" fill="rgba(255,255,255,0.05)"/>
                <line x1="14" y1="140" x2="246" y2="140" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                <line x1="14" y1="380" x2="246" y2="380" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                <line x1="130" y1="140" x2="130" y2="380" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                <rect x="14" y="256" width="232" height="8" rx="4" fill="rgba(255,255,255,0.08)"/>
                <line x1="14" y1="260" x2="246" y2="260" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeDasharray="5 3"/>
                <circle cx="130" cy="260" r="4" fill="rgba(255,255,255,0.6)"/>
                <circle cx="78" cy="325" r="7" fill="#AE552D" className="lp-player-a"/>
                <circle cx="182" cy="325" r="7" fill="#AE552D" className="lp-player-b"/>
                <circle cx="78" cy="195" r="7" fill="#EBE9DF" className="lp-player-c"/>
                <circle cx="182" cy="195" r="7" fill="#EBE9DF" className="lp-player-d"/>
                <circle cx="130" cy="260" r="5" fill="#f5e200" className="lp-ball"/>
              </svg>

              {/* Floating booking card */}
              <div className="lp-booking-card anim-up d-400">
                <div className="lp-booking-card-top">
                  <span className="lp-booking-label">Tu próxima reserva</span>
                  <span className="lp-booking-dot" />
                </div>
                <p className="lp-booking-club">AJ Club Padel · Cancha 2</p>
                <p className="lp-booking-time">Mañana · 19:00 – 20:00</p>
                <div className="lp-booking-confirm">
                  <CheckCircle size={13} weight="fill" color="#004740" />
                  <span>Confirmada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF STRIP --- */}
      <section className="lp-proof-strip">
        {[
          { num: `${clubCount}+`, label: 'Clubes adheridos' },
          { num: '30s', label: 'Tiempo de reserva' },
          { num: '$0', label: 'Comisión por reserva' },
          { num: '24/7', label: 'Disponibilidad online' },
        ].map(({ num, label }) => (
          <div key={label} className="lp-proof-item">
            <span className="lp-proof-num">{num}</span>
            <span className="lp-proof-label">{label}</span>
          </div>
        ))}
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="como-funciona" className="lp-section lp-how">
        <div className="lp-container">
          <div className="lp-section-header">
            <p className="section-label" style={{ justifyContent: 'center' }}>¿Jugás Pádel?</p>
            <h2 className="lp-section-h2">
              Reservá en{' '}
              <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: '#AE552D' }}>3 pasos</em>
            </h2>
            <p className="lp-section-sub">Sin registro obligatorio. Sin llamadas. Sin esperar.</p>
          </div>

          <div className="lp-steps">
            {([
              { Icon: MagnifyingGlass, step: '01', title: 'Elegí tu club', desc: 'Explorá los clubes disponibles y sus canchas con disponibilidad en tiempo real.' },
              { Icon: CalendarDots, step: '02', title: 'Selecioná horario', desc: 'Mirá los turnos libres y elegí el que mejor te quede según tu agenda.' },
              { Icon: CalendarCheck, step: '03', title: 'Confirmás al instante', desc: 'Tu reserva queda confirmada en segundos. Sin llamadas, sin esperas.' },
            ] as const).map(({ Icon, step, title, desc }, i) => (
              <div key={step} className={`lp-step anim-up d-${(i + 1) * 100}`}>
                <div className="lp-step-number">{step}</div>
                <div className="lp-step-icon-wrap">
                  <Icon size={26} weight="duotone" color="#004740" />
                </div>
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a href="/clubes" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Ver clubes disponibles <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="lp-section lp-features">
        <div className="lp-container">
          <div className="lp-section-header lp-section-header-light">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(174,85,45,0.2)', border: '1px solid rgba(174,85,45,0.3)', borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1rem' }}>
              <Buildings size={12} color="#f0a070" weight="fill" />
              <span style={{ color: '#f0a070', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat)' }}>Para administradores</span>
            </div>
            <h2 className="lp-section-h2" style={{ color: '#FFFFFF' }}>
              Control total,{' '}
              <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: '#AE552D' }}>cero complicaciones</em>
            </h2>
            <p className="lp-section-sub" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Todo lo que necesitás para gestionar tu club desde un solo lugar.
            </p>
          </div>

          <div className="lp-bento">
            <div className="lp-bento-item lp-bento-large lp-bento-highlight">
              <div className="lp-bento-icon"><CalendarDots size={28} weight="fill" color="#AE552D" /></div>
              <h3 className="lp-bento-title">Calendario inteligente</h3>
              <p className="lp-bento-desc">Vista semanal con todos los turnos. Creá, cancelá o bloqueá canchas en segundos desde cualquier dispositivo.</p>
              <div className="lp-bento-tag">Más popular</div>
            </div>
            {([
              { Icon: ChartLineUp, title: 'Panel de métricas', desc: 'Ocupación e ingresos en tiempo real.' },
              { Icon: CourtBasketball, title: 'Gestión de canchas', desc: 'Precios por horario y disponibilidad configurable.' },
              { Icon: DeviceMobile, title: 'Reservas 24/7', desc: 'Tus jugadores reservan desde el celular.' },
              { Icon: UsersFour, title: 'Multi-usuario', desc: 'Empleados con roles diferenciados.' },
              { Icon: Buildings, title: 'Página pública', desc: 'Tu club visible para todos los jugadores.' },
            ] as const).map(({ Icon, title, desc }) => (
              <div key={title} className="lp-bento-item">
                <div className="lp-bento-icon"><Icon size={24} weight="fill" color="#AE552D" /></div>
                <h3 className="lp-bento-title">{title}</h3>
                <p className="lp-bento-desc">{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Registrar mi club gratis <ArrowRight size={18} weight="bold" />
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              30 días de prueba · Sin tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="precios" className="lp-section" style={{ background: '#EBE9DF' }}>
        <div className="lp-container">
          <div className="lp-section-header">
            <p className="section-label" style={{ justifyContent: 'center' }}>Planes y precios</p>
            <h2 className="lp-section-h2">
              Sin sorpresas.{' '}
              <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: '#004740' }}>Sin comisiones.</em>
            </h2>
            <p className="lp-section-sub">Pagás un abono mensual fijo. Tus jugadores reservan gratis, siempre.</p>
          </div>

          <div className="lp-pricing-grid">
            {/* Starter */}
            <div className="lp-plan">
              <p className="lp-plan-name">Starter</p>
              <div className="lp-plan-price"><span>$9.900</span><em>/mes</em></div>
              <p className="lp-plan-tagline">Ideal para clubes pequeños que quieren empezar a digitalizar.</p>
              <ul className="lp-plan-features">
                {['Hasta 2 canchas', 'Reservas ilimitadas', 'Panel de administración', 'Página pública del club', 'Soporte por WhatsApp'].map(f => (
                  <li key={f}><CheckCircle size={14} color="#004740" weight="fill" />{f}</li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Starter" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Empezar gratis 30 días
              </a>
            </div>

            {/* Pro */}
            <div className="lp-plan lp-plan-featured">
              <div className="lp-plan-badge">Más popular</div>
              <p className="lp-plan-name" style={{ color: 'rgba(255,255,255,0.45)' }}>Pro</p>
              <div className="lp-plan-price"><span style={{ color: '#FFFFFF' }}>$18.900</span><em style={{ color: 'rgba(255,255,255,0.4)' }}>/mes</em></div>
              <p className="lp-plan-tagline" style={{ color: 'rgba(255,255,255,0.6)' }}>Para clubes en crecimiento que se profesionalizan.</p>
              <ul className="lp-plan-features lp-plan-features-light">
                {['Hasta 6 canchas', 'Reservas ilimitadas', 'Calendario semanal', 'Reservas recurrentes', 'Vista de caja e ingresos', 'Onboarding asistido', 'Soporte prioritario'].map(f => (
                  <li key={f}><CheckCircle size={14} color="#AE552D" weight="fill" />{f}</li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Pro" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Empezar gratis 30 días
              </a>
            </div>

            {/* Club */}
            <div className="lp-plan">
              <p className="lp-plan-name">Club</p>
              <div className="lp-plan-price"><span>$29.900</span><em>/mes</em></div>
              <p className="lp-plan-tagline">Para clubes consolidados con múltiples canchas y alta demanda.</p>
              <ul className="lp-plan-features">
                {['Canchas ilimitadas', 'Todo lo del plan Pro', 'Múltiples recepcionistas', 'Estadísticas avanzadas', 'API de integración', 'SLA garantizado', 'Gerente de cuenta dedicado'].map(f => (
                  <li key={f}><CheckCircle size={14} color="#004740" weight="fill" />{f}</li>
                ))}
              </ul>
              <a href="https://wa.me/5493510000000?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Club" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Hablar con ventas
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="lp-faq">
            {[
              { q: '¿Los jugadores pagan algo?', a: 'No. La reserva online es 100% gratuita. El club paga el abono mensual.' },
              { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, sin permanencia ni penalidades. Podés darte de baja en cualquier momento.' },
              { q: '¿Hay soporte para la configuración?', a: 'Sí. Te ayudamos a configurar tu club y canchas sin costo adicional.' },
            ].map(({ q, a }) => (
              <div key={q} className="lp-faq-item">
                <p className="lp-faq-q">{q}</p>
                <p className="lp-faq-a">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="lp-final-cta">
        <div className="lp-container lp-final-cta-inner">
          <div>
            <h2 className="lp-final-h2">
              ¿Listo para digitalizar{' '}
              <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: '#AE552D' }}>tu club?</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', fontSize: '1rem', marginTop: '0.75rem' }}>
              Configuración en menos de 5 minutos. Sin tarjeta de crédito.
            </p>
          </div>
          <div className="lp-final-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Registrar mi club gratis
            </Link>
            <a href="/clubes" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              Ver clubes
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/isotipo.png" alt="AJClubPadel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span className="logo" style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>AJClubPadel</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', lineHeight: 1.65, fontFamily: 'var(--font-inter)', maxWidth: '220px', margin: 0 }}>
                La plataforma de reservas para clubes de Pádel más moderna de Argentina.
              </p>
            </div>
            <div>
              <p className="lp-footer-col-title">Sedes</p>
              {['Monte Cristo', 'Córdoba Capital'].map(sede => (
                <div key={sede} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={12} color="rgba(174,85,45,0.65)" />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontFamily: 'var(--font-inter)' }}>{sede}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="lp-footer-col-title">Contacto</p>
              {[
                { Icon: Phone, text: '+54 9 351 000 0000' },
                { Icon: Envelope, text: 'hola@ajclubpadel.ar' },
                { Icon: MapPin, text: 'Monte Cristo, Córdoba' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Icon size={12} color="rgba(174,85,45,0.65)" />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontFamily: 'var(--font-inter)' }}>{text}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="lp-footer-col-title">Legal</p>
              {[
                { href: '/login', label: 'Política de privacidad' },
                { href: '/login', label: 'Términos y condiciones' },
                { href: '/admin', label: 'Administración' },
              ].map(({ href, label }) => (
                <Link key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', fontFamily: 'var(--font-inter)', textDecoration: 'none', marginBottom: '0.45rem' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&#169; {new Date().getFullYear()} AJClubPadel. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      </main>
    </div>
  )
}
