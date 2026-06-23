import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: Record<string, string | undefined> = { ...parsed.data }
  if (parsed.data.name) {
    data.slug = slugify(parsed.data.name)
  }

  const club = await prisma.club.update({
    where: { id: clubId },
    data,
  })

  return NextResponse.json({ club })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params
  const club = await prisma.club.findUnique({ where: { id: clubId } })
  if (!club) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ club })
}