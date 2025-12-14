import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Parse flight time from "XXhrXXmin" format to minutes
function parseFlightTime(flightTime: string): number {
  const match = flightTime.match(/(\d+)hr(\d+)min/)
  if (match) {
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    return hours * 60 + minutes
  }
  return 0
}

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate statistics from all approved PIREPs
    const approvedPireps = await prisma.pirep.findMany({
      where: {
        userId: user.id,
        status: 'approved',
      },
      include: {
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
      orderBy: {
        flightDate: 'desc',
      },
    })

    // Calculate statistics from approved PIREPs
    let totalFlightTimeMinutes = 0
    let totalFlights = approvedPireps.length
    const visitedAirportsSet = new Set<string>()
    const aircraftTypesSet = new Set<string>()
    let lastFlightDate: Date | null = null

    for (const pirep of approvedPireps) {
      // Add flight time
      totalFlightTimeMinutes += parseFlightTime(pirep.flightTime)

      // Add airports
      visitedAirportsSet.add(pirep.departureAirport)
      visitedAirportsSet.add(pirep.arrivalAirport)
      
      // Add waypoints if they exist
      if (pirep.waypoints) {
        try {
          const waypoints = JSON.parse(pirep.waypoints) as string[]
          waypoints.forEach(wp => visitedAirportsSet.add(wp))
        } catch (error) {
          console.error('Error parsing waypoints:', error)
        }
      }

      // Add aircraft type
      aircraftTypesSet.add(pirep.livery.aircraftType.name)

      // Track last flight date
      const flightDate = new Date(pirep.flightDate)
      if (!lastFlightDate || flightDate > lastFlightDate) {
        lastFlightDate = flightDate
      }
    }

    // Update or create user statistics
    const userStats = await prisma.userStatistics.upsert({
      where: { userId: user.id },
      update: {
        totalFlightTimeMinutes,
        totalFlights,
        visitedAirports: JSON.stringify(Array.from(visitedAirportsSet)),
        aircraftTypes: JSON.stringify(Array.from(aircraftTypesSet)),
        lastFlightDate,
      },
      create: {
        userId: user.id,
        totalFlightTimeMinutes,
        totalFlights,
        totalDistanceKm: 0,
        visitedAirports: JSON.stringify(Array.from(visitedAirportsSet)),
        aircraftTypes: JSON.stringify(Array.from(aircraftTypesSet)),
        lastFlightDate,
      },
    })

    return NextResponse.json({
      totalFlightTimeMinutes: userStats.totalFlightTimeMinutes,
      totalFlights: userStats.totalFlights,
      totalDistanceKm: userStats.totalDistanceKm,
      visitedAirports: Array.from(visitedAirportsSet),
      aircraftTypes: Array.from(aircraftTypesSet),
      lastFlightDate: userStats.lastFlightDate,
    })
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

