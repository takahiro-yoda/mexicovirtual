import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

async function verifyAdmin(email: string | null) {
  if (!email) {
    console.log('verifyAdmin: No email provided')
    return false
  }
  
  // First check if email matches admin email pattern (for Firebase auth users)
  if (isAdminEmail(email)) {
    console.log(`verifyAdmin: Email ${email} matches admin email pattern`)
    return true
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      console.log(`verifyAdmin: User not found in database for email: ${email}`)
      return false
    }
    
    const isUserAdmin = isAdmin(user.role)
    console.log(`verifyAdmin: User ${email} has role ${user.role}, isAdmin: ${isUserAdmin}`)
    return isUserAdmin
  } catch (error) {
    console.error('Error verifying admin:', error)
    return false
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { rank, adminEmail, targetUserEmail } = await request.json()

    if (typeof rank !== 'string') {
      return NextResponse.json({ error: 'Invalid rank value' }, { status: 400 })
    }

    // Verify admin status
    if (!adminEmail) {
      console.log('PATCH /api/admin/users/[userId]/rank: No adminEmail provided')
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }
    
    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      console.log(`PATCH /api/admin/users/[userId]/rank: User ${adminEmail} is not admin`)
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    const userIdParam = params.userId
    console.log(`PATCH /api/admin/users/[userId]/rank: userIdParam = ${userIdParam}, targetUserEmail = ${targetUserEmail}`)

    // Find user
    let user = null
    
    // First, try to find user by email if provided (most reliable)
    if (targetUserEmail) {
      try {
        user = await prisma.user.findUnique({
          where: { email: targetUserEmail },
        })
        console.log(`PATCH /api/admin/users/[userId]/rank: Found user by targetUserEmail: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by targetUserEmail:', error)
      }
    }
    
    // If not found, try to find user by Prisma ID
    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { id: userIdParam },
        })
        console.log(`PATCH /api/admin/users/[userId]/rank: Found user by ID: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by ID:', error)
      }
    }

    // If not found, try to find by email (userIdParam might be an email)
    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { email: userIdParam },
        })
        console.log(`PATCH /api/admin/users/[userId]/rank: Found user by email: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by email:', error)
      }
    }

    if (!user) {
      console.log(`PATCH /api/admin/users/[userId]/rank: User not found for ${userIdParam}`)
      return NextResponse.json({ 
        error: 'User not found',
        details: `No user found with ID or email: ${userIdParam}`
      }, { status: 404 })
    }

    // Update user's rank
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        rank: rank || null,
      },
    })

    return NextResponse.json({
      success: true,
      rank: updatedUser.rank,
    })
  } catch (error: any) {
    console.error('Error updating rank:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}


