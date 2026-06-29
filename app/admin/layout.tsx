import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import AdminMobileSidebar from './AdminMobileSidebar'
import {
  Buildings,
  ChartBar,
  SignOut,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr'

const navItems = [
  { href: '/admin/clubs', label: 'Clubes', sublabel: 'Gestión', Icon: Buildings },
  { href: '/admin/stats', label: 'Estadísticas', sublabel: 'Global', Icon: ChartBar },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex" style={{ background: '#EBE9DF' }}>
      {/* SIDEBAR */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: '#1a0a14', position: 'relative' }}
      >
        {/* Grain texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/admin/clubs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '9px',
                background: '#AE552D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShieldCheck size={20} weight="fill" color="#fff" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '0.85rem', color: '#EBE9DF', lineHeight: 1.1 }}>
                  AJClubPadel
                </p>
                <p style={{ fontSize: '0.58rem', color: '#AE552D', fontFamily: 'var(--font-inter)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginTop: '0.1rem' }}>
                  Superadmin
                </p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navItems.map(({ href, label, sublabel, Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0.7rem', borderRadius: '10px', textDecoration: 'none',
                  transition: 'background 0.15s',
                  color: 'rgba(235,233,223,0.7)',
                }}
                className="admin-nav-link"
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: 'rgba(174,85,45,0.18)',
                }}>
                  <Icon size={16} weight="duotone" color="#AE552D" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.78rem', color: '#EBE9DF', lineHeight: 1.2 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(235,233,223,0.35)', lineHeight: 1, marginTop: '0.1rem' }}>
                    {sublabel}
                  </p>
                </div>
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="px-3 pb-5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '0.6rem 0.7rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem' }}>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.72rem', color: '#EBE9DF', marginBottom: '0.1rem' }}>
                {user.email}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#AE552D', fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                superadmin
              </p>
            </div>
            <form action="/api/auth/signout" method="post">
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.5rem 0.7rem', borderRadius: '8px', width: '100%',
                color: 'rgba(174,85,45,0.6)', fontSize: '0.75rem', fontFamily: 'var(--font-montserrat)', fontWeight: 600,
                transition: 'background 0.15s',
              }}>
                <SignOut size={15} color="#AE552D" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileSidebar userEmail={user.email ?? ''} />
        <main className="flex-1 px-6 py-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
