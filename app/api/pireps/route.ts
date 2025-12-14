import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let userEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const {
      flightDate,
      flightNumber,
      flightTime,
      departureAirport,
      arrivalAirport,
      waypoints,
      liveryId,
      multiplierCode,
      comment,
      userEmail: bodyUserEmail,
    } = requestData
    
    // Use email from body if session doesn't have it
    if (!userEmail && bodyUserEmail) {
      userEmail = bodyUserEmail
    }
    
    if (!userEmail) {
      console.log('POST /api/pireps: No user email available')
      return NextResponse.json(
        { error: 'Unauthorized: No user email provided' },
        { status: 401 }
      )
    }

    // Find user in Prisma by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }


    // Validate required fields
    if (!flightDate || !flightNumber || !flightTime || !departureAirport || !arrivalAirport || !liveryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate waypoints if provided
    let waypointsString: string | null = null
    if (waypoints) {
      try {
        // If waypoints is already a JSON string, parse it; otherwise stringify it
        let waypointsArray: string[]
        if (typeof waypoints === 'string') {
          waypointsArray = JSON.parse(waypoints)
        } else {
          waypointsArray = waypoints
        }
        
        // Validate each waypoint is a 4-character ICAO code
        const invalidWaypoints = waypointsArray.filter(wp => typeof wp !== 'string' || wp.trim().length !== 4)
        if (invalidWaypoints.length > 0) {
          return NextResponse.json(
            { error: 'All waypoints must be valid 4-character ICAO codes' },
            { status: 400 }
          )
        }
        
        // Convert to uppercase and save as JSON string
        waypointsString = JSON.stringify(waypointsArray.map(wp => wp.trim().toUpperCase()))
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid waypoints format' },
          { status: 400 }
        )
      }
    }

    // Verify livery exists
    const livery = await prisma.livery.findUnique({
      where: { id: liveryId },
      include: {
        aircraftType: true,
      },
    })

    if (!livery) {
      return NextResponse.json(
        { error: 'Invalid livery selected' },
        { status: 400 }
      )
    }

    // Create PIREP
    const pirep = await prisma.pirep.create({
      data: {
        userId: user.id,
        flightDate: new Date(flightDate),
        flightNumber: flightNumber.trim(),
        flightTime: flightTime.trim(),
        departureAirport: departureAirport.toUpperCase().trim(),
        arrivalAirport: arrivalAirport.toUpperCase().trim(),
        waypoints: waypointsString,
        liveryId: liveryId,
        multiplierCode: multiplierCode?.trim() || null,
        comment: comment?.trim() || null,
        status: 'pending',
      },
      include: {
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      pirep: {
        id: pirep.id,
        status: pirep.status,
        createdAt: pirep.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error creating PIREP:', error)
    return NextResponse.json(
      { error: 'Failed to submit PIREP', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let userEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from query params (for Firebase auth)
    const { searchParams } = new URL(request.url)
    const queryUserEmail = searchParams.get('userEmail')
    const status = searchParams.get('status')
    
    // Use email from query if session doesn't have it
    if (!userEmail && queryUserEmail) {
      userEmail = queryUserEmail
    }
    
    if (!userEmail) {
      console.log('GET /api/pireps: No user email available')
      return NextResponse.json(
        { error: 'Unauthorized: No user email provided' },
        { status: 401 }
      )
    }

    // Find user in Prisma by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const where: { userId: string; status?: string } = {
      userId: user.id,
    }
    
    if (status) {
      where.status = status
    }

    const pireps = await prisma.pirep.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        livery: {
          include: {
            aircraftType: true,
          },
        },
      },
    })

    return NextResponse.json(pireps)
  } catch (error: any) {
    console.error('Error fetching PIREPs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PIREPs', details: error.message },
      { status: 500 }
    )
  }
}

