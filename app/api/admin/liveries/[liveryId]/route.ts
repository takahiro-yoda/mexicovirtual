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
  { params }: { params: { liveryId: string } }
) {
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
      console.log('PATCH /api/admin/liveries/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`PATCH /api/admin/liveries/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name.trim()
    }
    
    if (requestData.isActive !== undefined) {
      updateData.isActive = requestData.isActive
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedLivery = await prisma.livery.update({
      where: { id: params.liveryId },
      data: updateData,
      include: {
        aircraftType: true,
      },
    })

    return NextResponse.json({
      success: true,
      livery: updatedLivery,
    })
  } catch (error: any) {
    console.error('Error updating livery:', error)
    return NextResponse.json(
      { error: 'Failed to update livery', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { liveryId: string } }
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
      console.log('DELETE /api/admin/liveries/[id]: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`DELETE /api/admin/liveries/[id]: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    await prisma.livery.delete({
      where: { id: params.liveryId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error deleting livery:', error)
    return NextResponse.json(
      { error: 'Failed to delete livery', details: error.message },
      { status: 500 }
    )
  }
}

