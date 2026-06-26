'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Wine, Drop, DropSimple, Television, Car, WifiHigh,
  Key, Storefront, Student, Lamp, Door,
} from '@phosphor-icons/react'
import type { ComponentType } from 'react'

type PhosphorIcon = ComponentType<{ size?: number; weight?: string; color?: string }>

const AMENITY_OPTIONS: { key: string; label: string; Icon: PhosphorIcon }[] = [
  { key: 'bar',          label: 'Bar / Cantina',        Icon: Wine as PhosphorIcon },
  { key: 'showers',      label: 'Duchas',               Icon: Drop as PhosphorIcon },
  { key: 'vestuarios',   label: 'Vestuarios',           Icon: Door as PhosphorIcon },
  { key: 'tv',           label: 'TV / Pantallas',       Icon: Television as PhosphorIcon },
  { key: 'free_water',   label: 'Agua gratis',          Icon: DropSimple as PhosphorIcon },
  { key: 'parking',      label: 'Estacionamiento',      Icon: Car as PhosphorIcon },
  { key: 'wifi',         label: 'Wi-Fi',                Icon: WifiHigh as PhosphorIcon },
  { key: 'locker_room',  label: 'Casilleros',           Icon: Key as PhosphorIcon },
  { key: 'pro_shop',     label: 'Tienda de equipos',    Icon: Storefront as PhosphorIcon },
  { key: 'coaching',     label: 'Clases / Coaching',    Icon: Student as PhosphorIcon },
  { key: 'lighting',     label: 'Iluminación nocturna', Icon: Lamp as PhosphorIcon },
]

type AmenityKey = string

interface Club {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  description: string | null
  coverUrl: string | null
  amenities: string[]
  subscriptionStatus: string
}

/** Comprime una imagen usando Canvas: max 1200px de ancho, calidad 0.82 JPEG */
function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
    img.src = url
  })
}

export default function ClubSettingsForm({ club }: { club: Club }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: club.name,
    address: club.address ?? '',
    phone: club.phone ?? '',
    description: club.description ?? '',
    coverUrl: club.coverUrl ?? '',
    amenities: club.amenities as AmenityKey[],
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  // true cuando la imagen viene de un upload desde archivo (oculta el campo URL)
  const [uploadedFromFile, setUploadedFromFile] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_MB = 10
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`La imagen no puede superar ${MAX_MB}MB.`)
      return
    }

    setUploading(true)
    try {
      // Comprimir con Canvas antes de subir
      const compressed = await compressImage(file)
      const originalKB = Math.round(file.size / 1024)
      const compressedKB = Math.round(compressed.size / 1024)

      const supabase = createClient()
      const path = `clubs/${club.id}/cover-${Date.now()}.jpg`

      const { error } = await supabase.storage
        .from('padel-app')
        .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

      if (error) {
        toast.error('Error al subir la imagen: ' + error.message)
        return
      }

      const { data } = supabase.storage.from('padel-app').getPublicUrl(path)
      setForm(p => ({ ...p, coverUrl: data.publicUrl }))
      setUploadedFromFile(true)
      setPreviewError(false)
      toast.success(`Imagen lista · ${originalKB}KB → ${compressedKB}KB. Guardá los cambios.`)
    } catch {
      toast.error('Error inesperado al subir la imagen.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function toggleAmenity(key: AmenityKey) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clubs/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        const errMsg = typeof data.error === 'string'
          ? data.error
          : Object.values(data.error as Record<string, string[]>).flat().join(', ')
        toast.error(errMsg || 'Error al guardar.')
      } else {
        toast.success('¡Cambios guardados correctamente!')
        router.push('/dashboard')
      }
    } catch {
      toast.error('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '680px' }}>

        {/* Foto de portada */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#34252F', marginBottom: '0.25rem' }}>
            Foto de portada
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.5)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Esta imagen aparece como fondo en tu página pública. Recomendado: 1200×600px, máx. 5MB.
          </p>

          {/* Preview */}
          {form.coverUrl && !previewError ? (
            <div style={{
              width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden',
              marginBottom: '1rem', border: '1px solid rgba(52,37,47,0.08)', position: 'relative',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setPreviewError(true)}
              />
              <button
                type="button"
                onClick={() => { setForm(p => ({ ...p, coverUrl: '' })); setPreviewError(false); setUploadedFromFile(false) }}
                style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
                  borderRadius: '6px', padding: '0.25rem 0.55rem', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-montserrat)',
                }}
              >
                ✕ Quitar
              </button>
            </div>
          ) : (
            /* Drop zone / upload button */
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', height: '140px', borderRadius: '12px', marginBottom: '1rem',
                border: '2px dashed rgba(0,71,64,0.25)', background: 'rgba(0,71,64,0.03)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', cursor: uploading ? 'wait' : 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,71,64,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,71,64,0.25)')}
            >
              <span style={{ fontSize: '1.75rem' }}>{uploading ? '⏳' : '📷'}</span>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '0.8rem', color: '#004740', margin: 0 }}>
                {uploading ? 'Subiendo imagen…' : 'Hacé clic para subir una foto'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.4)', margin: 0 }}>
                JPG, PNG, WEBP · máx. 5MB
              </p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* URL fallback — solo visible cuando no hay imagen subida desde archivo */}
          {!uploadedFromFile && (
            <div className="form-group">
              <label className="label">O pegá una URL de imagen</label>
              <input
                type="url"
                className="input"
                placeholder="https://images.unsplash.com/..."
                value={form.coverUrl}
                onChange={e => { setForm(p => ({ ...p, coverUrl: e.target.value })); setPreviewError(false) }}
              />
              {previewError && form.coverUrl && (
                <p style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '0.35rem' }}>
                  No se pudo cargar la imagen. Verificá la URL.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Información del club */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#34252F', marginBottom: '1.25rem' }}>
            Información del club
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Nombre del club</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Descripción <span style={{ color: 'rgba(52,37,47,0.4)', fontWeight: 400 }}>(aparece en tu página pública)</span></label>
              <textarea
                className="input"
                rows={3}
                placeholder="Contale a los jugadores qué tiene de especial tu club..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: 'vertical', fontFamily: 'var(--font-inter)' }}
                maxLength={500}
              />
              <p style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.4)', marginTop: '0.3rem', textAlign: 'right' }}>
                {form.description.length}/500
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Dirección</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Av. Ejemplo 1234"
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+54 9 351 000 0000"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenidades */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800, fontSize: '1rem', color: '#34252F', marginBottom: '0.25rem' }}>
            Servicios e instalaciones
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(52,37,47,0.5)', marginBottom: '1.25rem' }}>
            Seleccioná lo que tiene tu club. Se muestran en tu página pública.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
            {AMENITY_OPTIONS.map(({ key, label, Icon: AmenityIcon }) => {
              const active = form.amenities.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAmenity(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.65rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                    border: active ? '1.5px solid #004740' : '1.5px solid rgba(52,37,47,0.12)',
                    background: active ? 'rgba(0,71,64,0.07)' : '#FFFFFF',
                    transition: 'all 0.15s',
                  }}
                >
                  <AmenityIcon
                    size={16}
                    weight={active ? 'fill' : 'regular'}
                    color={active ? '#004740' : 'rgba(52,37,47,0.4)'}
                  />
                  <span style={{
                    fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                    color: active ? '#004740' : 'rgba(52,37,47,0.6)',
                  }}>
                    {label}
                  </span>
                  {active && (
                    <span style={{ marginLeft: 'auto', color: '#004740', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link
            href={`/${club.slug}`}
            target="_blank"
            className="btn btn-ghost btn-sm"
          >
            Ver página pública →
          </Link>
        </div>
      </div>
    </form>
  )
}
