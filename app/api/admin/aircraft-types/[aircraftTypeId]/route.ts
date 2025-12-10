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
  { params }: { params: { aircraftTypeId: string } }
) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const { name, isActive, adminEmail: bodyAdminEmail } = requestData
    
    // Use email from body if session doesn't have it
    if (!adminEmail && bodyAdminEmail) {
      adminEmail = bodyAdminEmail
    }
    
    if (!adminEmail) {
      console.log('PATCH /api/admin/aircraft-types/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`PATCH /api/admin/aircraft-types/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name.trim()
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedAircraftType = await prisma.aircraftType.update({
      where: { id: params.aircraftTypeId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      aircraftType: updatedAircraftType,
    })
  } catch (error: any) {
    console.error('Error updating aircraft type:', error)
    return NextResponse.json(
      { error: 'Failed to update aircraft type', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { aircraftTypeId: string } }
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
      console.log('DELETE /api/admin/aircraft-types/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`DELETE /api/admin/aircraft-types/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    await prisma.aircraftType.delete({
      where: { id: params.aircraftTypeId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error deleting aircraft type:', error)
    return NextResponse.json(
      { error: 'Failed to delete aircraft type', details: error.message },
      { status: 500 }
    )
  }
}

