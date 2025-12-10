import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const userStats = await prisma.userStatistics.findUnique({
      where: { userId: prismaUserId },
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

