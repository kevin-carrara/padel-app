'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HouseSimple,
  CalendarDots,
  Trophy,
  ChartLineUp,
  Buildings,
} from '@phosphor-icons/react'

const navItems = [
  { href: '/dashboard', label: 'Panel', Icon: HouseSimple, exact: true },
  { href: '/dashboard/calendar', label: 'Calendario', Icon: CalendarDots },
  { href: '/dashboard/courts', label: 'Canchas', Icon: Trophy },
  { href: '/dashboard/finances', label: 'Finanzas', Icon: ChartLineUp },
  { href: '/dashboard/settings', label: 'Mi Club', Icon: Buildings },
]

export default function MobileSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile topbar */}
      <header
        className="lg:hidden flex items-center justify-between px-5 py-3 sticky top-0 z-30"
        style={{ background: '#004740', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: '#FFFFFF', borderRadius: '8px', flexShrink: 0, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isotipo.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
          </div>
          <span className="logo" style={{ color: '#FFFFFF', fontSize: '1rem' }}>AJClubPadel</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)',
            fontFamily: 'var(--font-inter)', maxWidth: '120px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {userName}
          </span>
          <button
            onClick={async () => { await fetch('/api/auth/signout', { method: 'POST' }); window.location.href = '/login' }}
            style={{
              color: '#AE552D', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'var(--font-montserrat)', background: 'rgba(174,85,45,0.12)',
              border: 'none', cursor: 'pointer', padding: '0.3rem 0.7rem', borderRadius: '9999px',
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Bottom nav bar */}
      <nav
        className="lg:hidden flex"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: '#004740',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.25rem', padding: '0.6rem 0.25rem',
                textDecoration: 'none',
                borderTop: active ? '2px solid #AE552D' : '2px solid transparent',
                background: active ? 'rgba(174,85,45,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon
                size={22}
                weight={active ? 'fill' : 'regular'}
                color={active ? '#AE552D' : 'rgba(255,255,255,0.45)'}
              />
              <span style={{
                fontFamily: 'var(--font-montserrat)', fontWeight: 700,
                fontSize: '0.58rem', letterSpacing: '0.02em',
                color: active ? '#AE552D' : 'rgba(255,255,255,0.4)',
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
