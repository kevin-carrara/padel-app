/**
 * seed-admin.mjs
 * Crea un usuario admin en Supabase Auth y lo vincula al club en la DB.
 *
 * Uso:
 *   node prisma/seed-admin.mjs
 *
 * Variables requeridas en .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings > API > service_role)
 *   DATABASE_URL / DIRECT_URL
 */

import { createRequire } from 'module'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const require = createRequire(import.meta.url)
require('dotenv').config()

// ─── Configuración ───────────────────────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@montecristo.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'padelbook123'
const ADMIN_NAME     = process.env.ADMIN_NAME     ?? 'Admin Monte Cristo'
const CLUB_SLUG      = process.env.CLUB_SLUG      ?? 'club-monte-cristo'
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl         = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌  Faltan variables: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const prisma = new PrismaClient()

async function main() {
  console.log(`\n🏓  PadelBook — seed-admin\n`)

  // 1. Obtener el club
  const club = await prisma.club.findUnique({ where: { slug: CLUB_SLUG } })
  if (!club) {
    console.error(`❌  Club con slug "${CLUB_SLUG}" no encontrado. Corré primero: npm run db:seed`)
    process.exit(1)
  }
  console.log(`✓  Club encontrado: ${club.name} (${club.id})`)

  // 2. Crear o recuperar usuario en Supabase Auth
  let userId

  // Intentar buscar si ya existe
  const { data: listData } = await supabase.auth.admin.listUsers()
  const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL)

  if (existing) {
    userId = existing.id
    console.log(`✓  Usuario ya existe en Auth: ${ADMIN_EMAIL} (${userId})`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME },
    })

    if (error) {
      console.error('❌  Error al crear usuario en Supabase Auth:', error.message)
      process.exit(1)
    }

    userId = data.user.id
    console.log(`✓  Usuario creado en Auth: ${ADMIN_EMAIL} (${userId})`)
  }

  // 3. Crear o actualizar Profile en la DB
  await prisma.profile.upsert({
    where: { id: userId },
    update: {
      clubId:   club.id,
      role:     'club_admin',
      fullName: ADMIN_NAME,
    },
    create: {
      id:       userId,
      clubId:   club.id,
      role:     'club_admin',
      fullName: ADMIN_NAME,
    },
  })
  console.log(`✓  Perfil vinculado al club "${club.name}"`)

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Admin listo para usar

  URL:       http://localhost:3000/login
  Email:     ${ADMIN_EMAIL}
  Password:  ${ADMIN_PASSWORD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async err => {
    console.error('❌', err)
    await prisma.$disconnect()
    process.exit(1)
  })
