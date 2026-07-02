'use client'

import Link from 'next/link'
import {
  Buildings,
  Lightning,
  CalendarBlank,
  UserCircle,
} from '@phosphor-icons/react'

const css = `
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes comingSoonPulse {
    0%, 100% { border-color: rgba(52,37,47,0.13); }
    50%       { border-color: rgba(52,37,47,0.28); }
  }

  .aj-action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  /* ── base card ── */
  .aj-card {
    border-radius: 14px;
    padding: clamp(1rem, 4vw, 1.4rem) clamp(0.875rem, 3vw, 1.2rem);
    display: block;
    text-decoration: none;
    min-width: 0;
    overflow: hidden;
    transition: transform 0.22s cubic-bezier(.25,.8,.25,1),
                box-shadow 0.22s cubic-bezier(.25,.8,.25,1),
                background 0.22s ease;
    animation: cardIn 0.38s ease both;
    position: relative;
  }
  .aj-card:nth-child(1) { animation-delay: 0.05s; }
  .aj-card:nth-child(2) { animation-delay: 0.12s; }
  .aj-card:nth-child(3) { animation-delay: 0.19s; }
  .aj-card:nth-child(4) { animation-delay: 0.26s; }

  .aj-card-icon {
    display: block;
    margin-bottom: 0.625rem;
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1);
  }

  /* ── primary (Ver clubes) ── */
  .aj-card-primary {
    background: #FFFFFF;
    border: 1.5px solid rgba(0,71,64,0.25);
    box-shadow: 0 1px 4px rgba(0,71,64,0.06);
  }
  .aj-card-primary:hover {
    background: rgba(0,71,64,0.04);
    border-color: #004740;
    transform: translateY(-3px) scale(1.015);
    box-shadow: 0 10px 28px rgba(0,71,64,0.14);
  }
  .aj-card-primary:hover .aj-card-icon { transform: translateY(-2px) scale(1.08); }
  .aj-card-primary:active { transform: translateY(-1px) scale(1.005); }

  /* ── secondary (Mi perfil) ── */
  .aj-card-secondary {
    background: #FFFFFF;
    border: 1.5px solid rgba(174,85,45,0.25);
    box-shadow: 0 1px 4px rgba(174,85,45,0.06);
  }
  .aj-card-secondary:hover {
    background: rgba(174,85,45,0.04);
    border-color: #AE552D;
    transform: translateY(-3px) scale(1.015);
    box-shadow: 0 10px 28px rgba(174,85,45,0.14);
  }
  .aj-card-secondary:hover .aj-card-icon { transform: translateY(-2px) scale(1.08); }
  .aj-card-secondary:active { transform: translateY(-1px) scale(1.005); }

  /* ── disabled (Próximamente) ── */
  .aj-card-disabled {
    background: rgba(52,37,47,0.04);
    border: 1.5px dashed rgba(52,37,47,0.13);
    cursor: not-allowed;
    opacity: 0.72;
    animation: cardIn 0.38s ease both, comingSoonPulse 3s ease-in-out 1s infinite;
  }

  /* badge "Próximamente" */
  .aj-soon-badge {
    display: inline-block;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(52,37,47,0.38);
    background: rgba(52,37,47,0.07);
    border-radius: 99px;
    padding: 0.15rem 0.5rem;
    margin-top: 0.2rem;
  }
`

export function ActionGrid() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="aj-action-grid">
        {/* Ver clubes */}
        <Link href="/clubes" className="aj-card aj-card-primary">
          <Buildings
            size={28}
            color="#004740"
            weight="duotone"
            className="aj-card-icon"
          />
          <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
            Ver clubes
          </p>
          <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: 'clamp(0.68rem, 2.4vw, 0.76rem)', lineHeight: 1.3 }}>
            Explorá y reservá canchas
          </p>
        </Link>

        {/* Partidos abiertos */}
        <div className="aj-card aj-card-disabled">
          <Lightning
            size={28}
            color="#34252F"
            weight="duotone"
            className="aj-card-icon"
            style={{ opacity: 0.5 }}
          />
          <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.25rem' }}>
            Partidos abiertos
          </p>
          <span className="aj-soon-badge">Próximamente</span>
        </div>

        {/* Mis reservas */}
        <div className="aj-card aj-card-disabled">
          <CalendarBlank
            size={28}
            color="#34252F"
            weight="duotone"
            className="aj-card-icon"
            style={{ opacity: 0.5 }}
          />
          <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.25rem' }}>
            Mis reservas
          </p>
          <span className="aj-soon-badge">Próximamente</span>
        </div>

        {/* Mi perfil */}
        <Link href="/jugador/perfil" className="aj-card aj-card-secondary">
          <UserCircle
            size={28}
            color="#AE552D"
            weight="duotone"
            className="aj-card-icon"
          />
          <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
            Mi perfil
          </p>
          <p style={{ color: 'rgba(52,37,47,0.5)', fontSize: 'clamp(0.68rem, 2.4vw, 0.76rem)' }}>
            Ver y editar datos
          </p>
        </Link>
      </div>
    </>
  )
}
