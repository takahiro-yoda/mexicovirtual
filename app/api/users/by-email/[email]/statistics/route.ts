import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const userStats = await prisma.userStatistics.findUnique({
      where: { userId: user.id },
    })

    if (!userStats) {
      // Return default statistics if not found
      return NextResponse.json({
        totalFlightTimeMinutes: 0,
        totalFlights: 0,
        totalDistanceKm: 0,
        visitedAirports: [],
        aircraftTypes: [],
        lastFlightDate: null,
      })
    }

    // Parse JSON strings to arrays for SQLite compatibility
    let visitedAirports: string[] = []
    let aircraftTypes: string[] = []
    try {
      visitedAirports = typeof userStats.visitedAirports === 'string' 
        ? JSON.parse(userStats.visitedAirports) 
        : userStats.visitedAirports || []
      aircraftTypes = typeof userStats.aircraftTypes === 'string'
        ? JSON.parse(userStats.aircraftTypes)
        : userStats.aircraftTypes || []
    } catch (error) {
      console.error('Error parsing JSON arrays:', error)
    }

    return NextResponse.json({
      totalFlightTimeMinutes: userStats.totalFlightTimeMinutes,
      totalFlights: userStats.totalFlights,
      totalDistanceKm: userStats.totalDistanceKm,
      visitedAirports,
      aircraftTypes,
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

