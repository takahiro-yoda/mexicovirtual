import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'
import bcrypt from 'bcryptjs'

// For now, we'll use a simpler approach - verify admin status via email
// In production, you should verify Firebase ID token using Firebase Admin SDK
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
    const { displayName, email, password, adminEmail, targetUserEmail } = await request.json()

    // Verify admin status
    if (!adminEmail) {
      console.log('PATCH /api/admin/users/[userId]/profile: No adminEmail provided')
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }
    
    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      console.log(`PATCH /api/admin/users/[userId]/profile: User ${adminEmail} is not admin`)
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    const userIdParam = params.userId
    console.log(`PATCH /api/admin/users/[userId]/profile: userIdParam = ${userIdParam}, targetUserEmail = ${targetUserEmail}`)

    // Find user by email if provided (most reliable)
    let user = null
    
    if (targetUserEmail) {
      try {
        user = await prisma.user.findUnique({
          where: { email: targetUserEmail },
        })
        console.log(`PATCH /api/admin/users/[userId]/profile: Found user by targetUserEmail: ${user ? 'yes' : 'no'}`)
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
        console.log(`PATCH /api/admin/users/[userId]/profile: Found user by Prisma ID: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by Prisma ID:', error)
      }
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: `Could not find user with ID: ${userIdParam} or email: ${targetUserEmail}`
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: {
      displayName?: string
      email?: string
      passwordHash?: string
      infiniteFlightUsername?: string
    } = {}

    if (displayName !== undefined && displayName !== null) {
      updateData.displayName = displayName
      updateData.infiniteFlightUsername = displayName // Also update infiniteFlightUsername
    }

    if (email !== undefined && email !== null && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ 
          error: 'Email already in use',
          details: 'Another user is already using this email address'
        }, { status: 400 })
      }
      updateData.email = email
    }

    if (password !== undefined && password !== null && password !== '') {
      // Hash the new password
      const passwordHash = await bcrypt.hash(password, 10)
      updateData.passwordHash = passwordHash
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    // Return updated user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ 
      error: 'Failed to update user profile',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

