'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '⊞' },
  { href: '/dashboard/calendar', label: 'Calendario', icon: '📆' },
  { href: '/dashboard/bookings', label: 'Reservas', icon: '📅' },
  { href: '/dashboard/courts', label: 'Canchas', icon: '🎾' },
  { href: '/dashboard/finances', label: 'Finanzas', icon: '💰' },
]

export default function MobileSidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile topbar */}
      <header
        className="lg:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-30"
        style={{ background: '#004740' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: '#FFFFFF',
            padding: '0.25rem',
            lineHeight: 1,
          }}
        >
          ☰
        </button>
        <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          PadelBook
        </Link>
        <Link
          href="/api/auth/signout"
          style={{ color: '#AE552D', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-montserrat)' }}
        >
          Salir ↩
        </Link>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 40,
          }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
          background: '#004740',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            PadelBook
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="nav-item"
                style={isActive ? { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' } : {}}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User box */}
        <div
          className="mx-3 mb-4 rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p
            style={{
              color: '#AE552D',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.25rem',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            Club activo
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
            {userName}
          </p>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-6">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm"
            style={{
              color: '#AE552D',
              textDecoration: 'none',
              fontFamily: 'var(--font-montserrat)',
              fontWeight: 600,
              transition: 'color 0.15s',
            }}
          >
            <span>↩</span> Salir
          </Link>
        </div>
      </aside>
    </>
  )
}
