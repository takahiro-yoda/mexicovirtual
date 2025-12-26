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
    const currentUser = await getCurrentUser()
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(currentUser.email)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const liveries = await prisma.livery.findMany({
      include: {
        aircraftType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(liveries)
  } catch (error: any) {
    console.error('Error fetching fleets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fleets', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(currentUser.email)
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { fleet, livery } = await request.json()

    if (!fleet || !livery) {
      return NextResponse.json(
        { error: 'Missing required fields: fleet and livery' },
        { status: 400 }
      )
    }

    // Find or create aircraft type
    let aircraftType = await prisma.aircraftType.findFirst({
      where: { name: fleet.trim() },
    })

    if (!aircraftType) {
      aircraftType = await prisma.aircraftType.create({
        data: { name: fleet.trim() },
      })
    }

    // Create livery
    const newLivery = await prisma.livery.create({
      data: {
        aircraftTypeId: aircraftType.id,
        name: livery.trim(),
      },
      include: {
        aircraftType: true,
      },
    })

    return NextResponse.json({
      success: true,
      fleet: newLivery,
    })
  } catch (error: any) {
    console.error('Error creating fleet:', error)
    return NextResponse.json(
      { error: 'Failed to create fleet', details: error.message },
      { status: 500 }
    )
  }
}




