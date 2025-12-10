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

export async function POST(request: NextRequest) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const { aircraftTypeId, name, adminEmail: bodyAdminEmail } = requestData
    
    // Use email from body if session doesn't have it
    if (!adminEmail && bodyAdminEmail) {
      adminEmail = bodyAdminEmail
    }
    
    if (!adminEmail) {
      console.log('POST /api/admin/liveries: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`POST /api/admin/liveries: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    if (!aircraftTypeId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: aircraftTypeId and name' },
        { status: 400 }
      )
    }

    // Verify aircraft type exists
    const aircraftType = await prisma.aircraftType.findUnique({
      where: { id: aircraftTypeId },
    })

    if (!aircraftType) {
      return NextResponse.json(
        { error: 'Aircraft type not found' },
        { status: 404 }
      )
    }

    const trimmedName = name.trim()

    // Check for duplicate livery in the same aircraft type
    const existingLivery = await prisma.livery.findFirst({
      where: {
        aircraftTypeId: aircraftTypeId,
        name: trimmedName
      }
    })

    if (existingLivery) {
      return NextResponse.json(
        { error: `Livery "${trimmedName}" already exists for this aircraft type` },
        { status: 409 }
      )
    }

    const newLivery = await prisma.livery.create({
      data: {
        aircraftTypeId: aircraftTypeId,
        name: trimmedName,
      },
      include: {
        aircraftType: true,
      },
    })

    return NextResponse.json({
      success: true,
      livery: newLivery,
    })
  } catch (error: any) {
    console.error('Error creating livery:', error)
    return NextResponse.json(
      { error: 'Failed to create livery', details: error.message },
      { status: 500 }
    )
  }
}

