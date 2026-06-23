/**
 * Returns a deterministic cover image URL for a club based on its slug.
 * Uses a simple hash so the same club always gets the same image,
 * regardless of its position in a list.
 *
 * Priority: local overrides → logoUrl (if provided) → Unsplash by hash
 */

const LOCAL_IMAGES: Record<string, string> = {
  'pochi-padel':  '/clubs/pochi-padel.png',
  'puente-padel': '/clubs/puente-padel.png',
}

const UNSPLASH_COVERS = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1622279488397-6fcfc3ee1c6a?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1602484864601-d21dd1b0c36e?auto=format&fit=crop&q=80&w=1200',
]

function slugHash(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0
  }
  return h
}

export function getClubCover(slug: string, logoUrl?: string | null): string {
  if (LOCAL_IMAGES[slug]) return LOCAL_IMAGES[slug]
  if (logoUrl) return logoUrl
  return UNSPLASH_COVERS[slugHash(slug) % UNSPLASH_COVERS.length]
}

export const CLUB_LOGO_STYLE: Record<string, { bg: string; fit: 'contain' | 'cover'; padding?: string }> = {
  'pochi-padel':  { bg: '#F97316', fit: 'contain', padding: '1.5rem' },
  'puente-padel': { bg: 'transparent', fit: 'cover' },
}
