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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fleetId: string } }
) {
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

    const updatedFleet = await prisma.fleet.update({
      where: { id: params.fleetId },
      data: {
        fleet: fleet.trim(),
        livery: livery.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      fleet: updatedFleet,
    })
  } catch (error: any) {
    console.error('Error updating fleet:', error)
    return NextResponse.json(
      { error: 'Failed to update fleet', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fleetId: string } }
) {
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

    await prisma.fleet.delete({
      where: { id: params.fleetId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error deleting fleet:', error)
    return NextResponse.json(
      { error: 'Failed to delete fleet', details: error.message },
      { status: 500 }
    )
  }
}

