import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  clubName: z.string().min(2),
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
    return NextResponse.json({ error: messages || 'Datos inválidos' }, { status: 400 })
  }

  const { name, email, password, clubName } = parsed.data

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError || !authData.user) {
    const msg = authError?.message ?? 'Error al crear el usuario'
    const status = msg.toLowerCase().includes('already') ? 409 : 400
    return NextResponse.json({ error: msg }, { status })
  }

  const userId = authData.user.id

  // Generate unique slug for club
  let baseSlug = slugify(clubName)
  let slug = baseSlug
  let attempt = 0
  while (await prisma.club.findUnique({ where: { slug } })) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  // Create club + profile in a transaction
  await prisma.$transaction(async (tx) => {
    const club = await tx.club.create({
      data: {
        name: clubName,
        slug,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    await tx.profile.upsert({
      where: { id: userId },
      update: { clubId: club.id, fullName: name, role: 'club_admin' },
      create: { id: userId, clubId: club.id, fullName: name, role: 'club_admin' },
    })
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
