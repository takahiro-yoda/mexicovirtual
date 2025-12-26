import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

async function verifyAdmin(email: string | null) {
  if (!email) {
    return false
  }
  
  if (isAdminEmail(email)) {
    return true
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return false
    }
    
    return isAdmin(user.role)
  } catch (error) {
    console.error('Error verifying admin:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pirepId: string } }
) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from query params (for Firebase auth)
    const { searchParams } = new URL(request.url)
    const queryAdminEmail = searchParams.get('adminEmail')
    
    // Use email from query if session doesn't have it
    if (!adminEmail && queryAdminEmail) {
      adminEmail = queryAdminEmail
    }
    
    if (!adminEmail) {
      console.log('GET /api/admin/pireps/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`GET /api/admin/pireps/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    const pirep = await prisma.pirep.findUnique({
      where: { id: params.pirepId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            infiniteFlightUsername: true,
          },
        },
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
    })

    if (!pirep) {
      return NextResponse.json(
        { error: 'PIREP not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(pirep)
  } catch (error: any) {
    console.error('Error fetching PIREP:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PIREP', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { pirepId: string } }
) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const { status, adminComment, adminEmail: bodyAdminEmail } = requestData
    
    // Use email from body if session doesn't have it
    if (!adminEmail && bodyAdminEmail) {
      adminEmail = bodyAdminEmail
    }
    
    if (!adminEmail) {
      console.log('PATCH /api/admin/pireps/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`PATCH /api/admin/pireps/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    // Find admin user in Prisma
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    const updateData: {
      status?: string
      reviewedBy?: string
      reviewedAt?: Date
      adminComment?: string | null
    } = {}

    if (status) {
      updateData.status = status
      updateData.reviewedBy = adminUser.id
      updateData.reviewedAt = new Date()
    }

    if (adminComment !== undefined) {
      updateData.adminComment = adminComment || null
    }

    // Get current PIREP to check status change
    const currentPirep = await prisma.pirep.findUnique({
      where: { id: params.pirepId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            infiniteFlightUsername: true,
          },
        },
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
    })

    if (!currentPirep) {
      return NextResponse.json(
        { error: 'PIREP not found' },
        { status: 404 }
      )
    }

    const updatedPirep = await prisma.pirep.update({
      where: { id: params.pirepId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            infiniteFlightUsername: true,
          },
        },
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
    })

    // Update user statistics if status changed to/from approved
    if (status && status !== currentPirep.status) {
      const userId = currentPirep.userId
      
      // Parse flight time from "XXhrXXmin" format to minutes
      const parseFlightTime = (flightTime: string): number => {
        const match = flightTime.match(/(\d+)hr(\d+)min/)
        if (match) {
          const hours = parseInt(match[1], 10)
          const minutes = parseInt(match[2], 10)
          return hours * 60 + minutes
        }
        return 0
      }

      const flightTimeMinutes = parseFlightTime(currentPirep.flightTime)

      // Get or create user statistics
      let userStats = await prisma.userStatistics.findUnique({
        where: { userId },
      })

      if (!userStats) {
        userStats = await prisma.userStatistics.create({
          data: {
            userId,
            totalFlightTimeMinutes: 0,
            totalFlights: 0,
            totalDistanceKm: 0,
            visitedAirports: "[]",
            aircraftTypes: "[]",
          },
        })
      }

      // Parse existing arrays
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
        visitedAirports = []
        aircraftTypes = []
      }

      if (status === 'approved' && currentPirep.status !== 'approved') {
        // Add flight statistics
        await prisma.userStatistics.update({
          where: { userId },
          data: {
            totalFlightTimeMinutes: {
              increment: flightTimeMinutes,
            },
            totalFlights: {
              increment: 1,
            },
            lastFlightDate: new Date(currentPirep.flightDate),
            // Update visited airports
            visitedAirports: JSON.stringify([
              ...new Set([
                ...visitedAirports,
                currentPirep.departureAirport,
                currentPirep.arrivalAirport,
                ...(currentPirep.waypoints ? (() => {
                  try {
                    return JSON.parse(currentPirep.waypoints) as string[]
                  } catch {
                    return []
                  }
                })() : []),
              ]),
            ]),
            // Update aircraft types
            aircraftTypes: JSON.stringify([
              ...new Set([
                ...aircraftTypes,
                currentPirep.livery.aircraftType.name,
              ]),
            ]),
          },
        })
      } else if (currentPirep.status === 'approved' && status !== 'approved') {
        // Remove flight statistics (if status changed from approved to something else)
        const newVisitedAirports = visitedAirports.filter(
          (airport) =>
            airport !== currentPirep.departureAirport &&
            airport !== currentPirep.arrivalAirport &&
            !(currentPirep.waypoints ? (() => {
              try {
                return JSON.parse(currentPirep.waypoints) as string[]
              } catch {
                return []
              }
            })() : []).includes(airport)
        )
        
        const newAircraftTypes = aircraftTypes.filter(
          (type) => type !== currentPirep.livery.aircraftType.name
        )

        await prisma.userStatistics.update({
          where: { userId },
          data: {
            totalFlightTimeMinutes: {
              decrement: flightTimeMinutes,
            },
            totalFlights: {
              decrement: 1,
            },
            visitedAirports: JSON.stringify(newVisitedAirports),
            aircraftTypes: JSON.stringify(newAircraftTypes),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      pirep: updatedPirep,
    })
  } catch (error: any) {
    console.error('Error updating PIREP:', error)
    return NextResponse.json(
      { error: 'Failed to update PIREP', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pirepId: string } }
) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from query params (for Firebase auth)
    const { searchParams } = new URL(request.url)
    const queryAdminEmail = searchParams.get('adminEmail')
    
    // Use email from query if session doesn't have it
    if (!adminEmail && queryAdminEmail) {
      adminEmail = queryAdminEmail
    }
    
    if (!adminEmail) {
      console.log('DELETE /api/admin/pireps/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`DELETE /api/admin/pireps/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    await prisma.pirep.delete({
      where: { id: params.pirepId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error deleting PIREP:', error)
    return NextResponse.json(
      { error: 'Failed to delete PIREP', details: error.message },
      { status: 500 }
    )
  }
}




