# PadelBook MVP

SaaS de reservas para clubes de pádel (Next.js + Prisma + Supabase).

## Requisitos

1. Node.js 20.9+
2. PostgreSQL (local o Supabase)

## Setup local

1. Copiar variables de entorno:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Completar `.env` con tus credenciales reales de DB y Supabase.
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Generar cliente Prisma y aplicar migraciones:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
5. Seed inicial:
   ```bash
   npm run db:seed
   ```
6. Levantar la app:
   ```bash
   npm run dev
   ```

## Superficies MVP incluidas

- Landing pública con directorio de clubes activos.
- Página pública de club: `/{clubSlug}`.
- Flujo público de reserva: `/{clubSlug}/book`.
- Dashboard con módulos de hoy, canchas, reservas y caja.
- API routes base para clubes, canchas, disponibilidad y reservas.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
