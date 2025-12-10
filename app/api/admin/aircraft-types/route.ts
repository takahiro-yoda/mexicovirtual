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

export async function GET(request: NextRequest) {
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
      console.log('GET /api/admin/aircraft-types: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`GET /api/admin/aircraft-types: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    const aircraftTypes = await prisma.aircraftType.findMany({
      include: {
        liveries: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(aircraftTypes)
  } catch (error: any) {
    console.error('Error fetching aircraft types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aircraft types', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const { name, adminEmail: bodyAdminEmail } = requestData
    
    // Use email from body if session doesn't have it
    if (!adminEmail && bodyAdminEmail) {
      adminEmail = bodyAdminEmail
    }
    
    if (!adminEmail) {
      console.log('POST /api/admin/aircraft-types: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`POST /api/admin/aircraft-types: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check for duplicate aircraft type
    const existingAircraftType = await prisma.aircraftType.findFirst({
      where: { name: trimmedName }
    })

    if (existingAircraftType) {
      return NextResponse.json(
        { error: `Aircraft type "${trimmedName}" already exists` },
        { status: 409 }
      )
    }

    console.log(`POST /api/admin/aircraft-types: Creating aircraft type "${trimmedName}" for admin ${adminEmail}`)
    
    const newAircraftType = await prisma.aircraftType.create({
      data: {
        name: trimmedName,
      },
    })

    console.log(`POST /api/admin/aircraft-types: Successfully created aircraft type with id ${newAircraftType.id}`)

    return NextResponse.json({
      success: true,
      aircraftType: newAircraftType,
    })
  } catch (error: any) {
    console.error('Error creating aircraft type:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      { 
        error: 'Failed to create aircraft type', 
        details: error.message || 'Unknown error',
        code: error.code,
      },
      { status: 500 }
    )
  }
}

