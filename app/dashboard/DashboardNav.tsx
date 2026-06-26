'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HouseSimple,
  CalendarDots,
  Trophy,
  ChartLineUp,
  Buildings,
  SignOut,
} from '@phosphor-icons/react'

const navItems = [
  {
    href: '/dashboard',
    label: 'Panel',
    sublabel: 'Resumen',
    Icon: HouseSimple,
    exact: true,
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendario',
    sublabel: 'Reservas',
    Icon: CalendarDots,
  },
  {
    href: '/dashboard/courts',
    label: 'Canchas',
    sublabel: 'Gestión',
    Icon: Trophy,
  },
  {
    href: '/dashboard/finances',
    label: 'Finanzas',
    sublabel: 'Ingresos',
    Icon: ChartLineUp,
  },
  {
    href: '/dashboard/settings',
    label: 'Mi Club',
    sublabel: 'Configuración',
    Icon: Buildings,
  },
]

export default function DashboardNav() {
  const pathname = usePathname()

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5">
      {navItems.map(({ href, label, sublabel, Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              background: active ? 'rgba(174,85,45,0.18)' : 'transparent',
              borderLeft: active ? '3px solid #AE552D' : '3px solid transparent',
              paddingLeft: active ? 'calc(0.75rem - 3px)' : '0.75rem',
            }}
          >
            {/* Icon container */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: active
                  ? 'rgba(174,85,45,0.25)'
                  : 'rgba(255,255,255,0.07)',
                transition: 'background 0.15s',
              }}
            >
              <Icon
                size={18}
                weight={active ? 'fill' : 'regular'}
                color={active ? '#AE552D' : 'rgba(255,255,255,0.6)'}
              />
            </div>

            {/* Label */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: active ? '#EBE9DF' : 'rgba(255,255,255,0.7)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.65rem',
                  color: active ? 'rgba(174,85,45,0.8)' : 'rgba(255,255,255,0.3)',
                  lineHeight: 1,
                  marginTop: '0.1rem',
                }}
              >
                {sublabel}
              </p>
            </div>
          </Link>
        )
      })}

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.5rem 0' }} />

      {/* Sign out */}
      <SignOutButton />
    </nav>
  )
}

function SignOutButton() {
  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.65rem 0.75rem',
        borderRadius: '12px',
        textDecoration: 'none',
        borderLeft: '3px solid transparent',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        borderLeft2: '3px solid transparent',
      } as React.CSSProperties}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <SignOut size={18} weight="regular" color="rgba(174,85,45,0.6)" />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-montserrat)',
          fontWeight: 600,
          fontSize: '0.8rem',
          color: 'rgba(174,85,45,0.7)',
          margin: 0,
        }}
      >
        Salir
      </p>
    </button>
  )
}
