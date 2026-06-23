'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', clubName: '' })
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
      toast.error(data.error ?? 'Error al registrarse.')
    } else {
      toast.success('Cuenta creada. ¡Ya podes ingresar!')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] relative overflow-hidden"
        style={{ background: '#004740' }}
      >
        {/* Net pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px)',
          }}
        />

        <div className="relative z-10 p-10">
          <Link href="/" className="logo text-2xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            PadelBook
          </Link>
        </div>

        <div className="relative z-10 p-10 pb-16">
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.4rem',
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#FFFFFF',
              lineHeight: 1.35,
              marginBottom: '0.75rem',
            }}
          >
            Suma tu club a la plataforma y empieza a recibir reservas online.
          </p>
          <span
            style={{
              color: '#AE552D',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            Gratis · Sin tarjeta · Sin compromiso
          </span>
        </div>

        {/* Cognac circle accent */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 rounded-tl-full"
          style={{ background: '#AE552D', opacity: 0.15 }}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#EBE9DF' }}>
        <div className="w-full max-w-sm">
          <Link href="/" className="logo text-2xl block mb-10 lg:hidden" style={{ color: '#004740', textDecoration: 'none' }}>
            PadelBook
          </Link>

          <div className="mb-8">
            <h1
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '1.875rem',
                fontWeight: 800,
                color: '#34252F',
                letterSpacing: '-0.02em',
                marginBottom: '0.25rem',
              }}
            >
              Crear cuenta
            </h1>
            <p style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.9rem', fontFamily: 'var(--font-inter)' }}>
              Registra tu club en minutos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label">Nombre</label>
              <input type="text" className="input" placeholder="Tu nombre" value={form.name} onChange={set('name')} required autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="label">Contraseña</label>
              <input type="password" className="input" placeholder="Minimo 8 caracteres" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="label">Nombre del club</label>
              <input type="text" className="input" placeholder="Club Monte Cristo" value={form.clubName} onChange={set('clubName')} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-1">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)' }}>
            ¿Ya tenes cuenta?{' '}
            <Link href="/login" style={{ color: '#AE552D', fontWeight: 600, textDecoration: 'none' }}>
              Ingresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}