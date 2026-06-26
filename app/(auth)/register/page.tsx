'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', clubName: '', phone: '' })
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      if (res.status === 409) {
        toast.error('Ya existe una cuenta con ese email.')
      } else {
        toast.error(data.error ?? 'Error al registrarse.')
      }
    } else {
      router.push('/bienvenido')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] relative overflow-hidden"
        style={{ background: '#004740' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px)',
          }}
        />
        <div className="relative z-10 p-10">
          <Link href="/" className="logo text-2xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            AJClubPadel
          </Link>
        </div>
        <div className="relative z-10 p-10 pb-16">
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3, marginBottom: '1.25rem' }}>
            Tu club, tu horario,<br />
            <span style={{ color: '#AE552D' }}>tus reglas.</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Calendario de reservas en tiempo real',
              'Panel de administracion completo',
              'Pagina publica para tus jugadores',
              'Sin contratos ni permanencia',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(174,85,45,0.3)', border: '1.5px solid #AE552D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#AE552D', fontSize: '0.6rem', fontWeight: 800 }}>+</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-tl-full" style={{ background: '#AE552D', opacity: 0.12 }} />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#EBE9DF' }}>
        <div className="w-full max-w-sm">
          <Link href="/" className="logo text-2xl block mb-10 lg:hidden" style={{ color: '#004740', textDecoration: 'none' }}>
            AJClubPadel
          </Link>

          <div className="mb-8">
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#AE552D', fontFamily: 'var(--font-montserrat)', marginBottom: '0.4rem' }}>
              Registro de club
            </p>
            <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: '1.875rem', fontWeight: 800, color: '#34252F', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              Registra tu club
            </h1>
            <p style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>
              Completa el formulario y te contactamos para activar tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label">Tu nombre</label>
              <input type="text" className="input" placeholder="Juan Garcia" value={form.name} onChange={set('name')} required autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Nombre del club</label>
              <input type="text" className="input" placeholder="Club Monte Cristo" value={form.clubName} onChange={set('clubName')} required />
            </div>
            <div className="form-group">
              <label className="label">Telefono de contacto</label>
              <input type="tel" className="input" placeholder="+54 9 351 000 0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="label">Contrasena</label>
              <input type="password" className="input" placeholder="Minimo 8 caracteres" value={form.password} onChange={set('password')} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-1">
              {loading ? 'Creando cuenta...' : 'Solicitar acceso'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)' }}>
            Ya tenes cuenta?{' '}
            <Link href="/login" style={{ color: '#AE552D', fontWeight: 600, textDecoration: 'none' }}>
              Ingresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}