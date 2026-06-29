'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Buildings,
  ChartBar,
  ShieldCheck,
} from '@phosphor-icons/react'

const navItems = [
  { href: '/admin/clubs', label: 'Clubes', Icon: Buildings },
  { href: '/admin/stats', label: 'Estadísticas', Icon: ChartBar },
]

export default function AdminMobileSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile topbar */}
      <header
        className="lg:hidden flex items-center justify-between px-5 py-3 sticky top-0 z-30"
        style={{ background: '#1a0a14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/admin/clubs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#AE552D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ShieldCheck size={18} weight="fill" color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.85rem', color: '#EBE9DF', lineHeight: 1 }}>
              AJClubPadel
            </p>
            <p style={{ fontSize: '0.55rem', color: '#AE552D', fontFamily: 'var(--font-inter)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
              Superadmin
            </p>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-inter)', maxWidth: '110px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {userEmail}
          </span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{
              color: '#AE552D', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'var(--font-montserrat)', background: 'rgba(174,85,45,0.12)',
              border: 'none', cursor: 'pointer', padding: '0.3rem 0.7rem', borderRadius: '9999px',
            }}>
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Bottom nav bar */}
      <nav
        className="lg:hidden flex"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: '#1a0a14',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.25rem', padding: '0.7rem 0.25rem',
                textDecoration: 'none',
                borderTop: active ? '2px solid #AE552D' : '2px solid transparent',
                background: active ? 'rgba(174,85,45,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon
                size={22}
                weight={active ? 'fill' : 'duotone'}
                color={active ? '#AE552D' : 'rgba(255,255,255,0.4)'}
              />
              <span style={{
                fontFamily: 'var(--font-montserrat)', fontWeight: 700,
                fontSize: '0.6rem', letterSpacing: '0.02em',
                color: active ? '#AE552D' : 'rgba(255,255,255,0.35)',
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