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
  { params }: { params: { userId: string } }
) {
  try {
    const userIdParam = params.userId

    // userIdParam could be either Prisma User ID or Firebase UID
    // First, try to find user by Prisma ID
    let user = await prisma.user.findUnique({
      where: { id: userIdParam },
    })

    // If not found, try to find by email (assuming userIdParam might be email)
    // Or if it's a Firebase UID, we need to map it to Prisma User ID
    // For now, if it's not a Prisma ID, we'll return default stats
    // In production, you should have a mapping between Firebase UID and Prisma User ID
    
    let prismaUserId = userIdParam
    
    if (!user) {
      // Try to find by email (in case userIdParam is an email)
      user = await prisma.user.findUnique({
        where: { email: userIdParam },
      })
      if (user) {
        prismaUserId = user.id
      } else {
        // If still not found, return default stats
        // This handles the case where userIdParam is a Firebase UID
        // and we don't have a mapping yet
        return NextResponse.json({
          totalFlightTimeMinutes: 0,
          totalFlights: 0,
          totalDistanceKm: 0,
          visitedAirports: [],
          aircraftTypes: [],
          lastFlightDate: null,
        })
      }
    }

    // Calculate statistics from all approved PIREPs
    const approvedPireps = await prisma.pirep.findMany({
      where: {
        userId: prismaUserId,
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
      where: { userId: prismaUserId },
      update: {
        totalFlightTimeMinutes,
        totalFlights,
        visitedAirports: JSON.stringify(Array.from(visitedAirportsSet)),
        aircraftTypes: JSON.stringify(Array.from(aircraftTypesSet)),
        lastFlightDate,
      },
      create: {
        userId: prismaUserId,
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

