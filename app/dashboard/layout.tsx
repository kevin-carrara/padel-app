import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileSidebar from './MobileSidebar'
import RacketIcon from './RacketIcon'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.name ?? user.email ?? ''

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: null, isRacket: true },
    { href: '/dashboard/calendar', label: 'Calendario', icon: '📆', isRacket: false },
    { href: '/dashboard/bookings', label: 'Reservas', icon: '📅', isRacket: false },
    { href: '/dashboard/courts', label: 'Canchas', icon: '🎾', isRacket: false },
    { href: '/dashboard/finances', label: 'Finanzas', icon: '💰', isRacket: false },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#EBE9DF' }}>
      {/* SIDEBAR */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: '#004740' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <RacketIcon size={36} style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
          <Link href="/" className="logo text-xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            PadelBook
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item"
            >
              {item.isRacket ? (
                <RacketIcon size={18} />
              ) : (
                <span className="text-base">{item.icon}</span>
              )}
              {item.label}
            </Link>
          ))}
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar with drawer */}
        <MobileSidebar userName={userName} />

        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}