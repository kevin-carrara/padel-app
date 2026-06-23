import { createRequire } from 'module'
import { PrismaClient } from '@prisma/client'

const require = createRequire(import.meta.url)
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const club = await prisma.club.upsert({
    where: { slug: 'club-monte-cristo' },
    update: {},
    create: {
      name: 'Club Monte Cristo',
      slug: 'club-monte-cristo',
      address: 'Monte Cristo, Cordoba',
      phone: '+54 9 351 000 0000',
      subscriptionStatus: 'active',
    },
  })

  const courts = await Promise.all([
    prisma.court.upsert({
      where: { id: 'court-monte-cristo-1' },
      update: {},
      create: {
        id: 'court-monte-cristo-1',
        clubId: club.id,
        name: 'Cancha 1',
        surface: 'cristal',
        isIndoor: true,
        pricePerHour: 10000,
      },
    }),
    prisma.court.upsert({
      where: { id: 'court-monte-cristo-2' },
      update: {},
      create: {
        id: 'court-monte-cristo-2',
        clubId: club.id,
        name: 'Cancha 2',
        surface: 'moqueta',
        isIndoor: false,
        pricePerHour: 9000,
      },
    }),
  ])

  for (const court of courts) {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      await prisma.courtSchedule.upsert({
        where: { id: `${court.id}-day-${day}` },
        update: {},
        create: {
          id: `${court.id}-day-${day}`,
          courtId: court.id,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '23:00',
          slotDuration: 60,
        },
      })
    }
  }

  const today = new Date()
  const start = new Date(today)
  start.setHours(19, 0, 0, 0)
  const end = new Date(today)
  end.setHours(20, 0, 0, 0)

  const existingBooking = await prisma.booking.findFirst({
    where: {
      clubId: club.id,
      courtId: courts[0].id,
      startTime: start,
      endTime: end,
    },
    select: { id: true },
  })

  if (!existingBooking) {
    await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: courts[0].id,
        playerName: 'Jugador Demo',
        playerPhone: '+54 9 351 111 1111',
        startTime: start,
        endTime: end,
        durationMin: 60,
        amount: 10000,
        status: 'confirmed',
        paymentStatus: 'pending',
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
