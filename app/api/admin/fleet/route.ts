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

    const fleets = await prisma.fleet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(fleets)
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

    const newFleet = await prisma.fleet.create({
      data: {
        fleet: fleet.trim(),
        livery: livery.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      fleet: newFleet,
    })
  } catch (error: any) {
    console.error('Error creating fleet:', error)
    return NextResponse.json(
      { error: 'Failed to create fleet', details: error.message },
      { status: 500 }
    )
  }
}


