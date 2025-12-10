import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

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
    // Get email from request body (sent from client)
    // In production, verify Firebase ID token instead
    const { callsign, adminEmail, targetUserEmail } = await request.json()

    if (typeof callsign !== 'string') {
      return NextResponse.json({ error: 'Invalid callsign value' }, { status: 400 })
    }

    // Verify admin status
    if (!adminEmail) {
      console.log('PATCH /api/admin/users/[userId]/callsign: No adminEmail provided')
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }
    
    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      console.log(`PATCH /api/admin/users/[userId]/callsign: User ${adminEmail} is not admin`)
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    const userIdParam = params.userId
    console.log(`PATCH /api/admin/users/[userId]/callsign: userIdParam = ${userIdParam}, targetUserEmail = ${targetUserEmail}`)

    // userIdParam could be either Prisma User ID or Firebase UID
    // targetUserEmail is the email of the target user (if provided from frontend)
    let user = null
    
    // First, try to find user by email if provided (most reliable)
    if (targetUserEmail) {
      try {
        user = await prisma.user.findUnique({
          where: { email: targetUserEmail },
        })
        console.log(`PATCH /api/admin/users/[userId]/callsign: Found user by targetUserEmail: ${user ? 'yes' : 'no'}`)
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
        console.log(`PATCH /api/admin/users/[userId]/callsign: Found user by ID: ${user ? 'yes' : 'no'}`)
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
        console.log(`PATCH /api/admin/users/[userId]/callsign: Found user by email: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by email:', error)
      }
    }

    if (!user) {
      console.log(`PATCH /api/admin/users/[userId]/callsign: User not found for ${userIdParam}`)
      console.log(`PATCH /api/admin/users/[userId]/callsign: targetUserEmail was: ${targetUserEmail}`)
      
      let errorDetails = `No user found with ID or email: ${userIdParam}.`
      if (!targetUserEmail) {
        errorDetails += ` Email was not provided. Please ensure the user's email is passed as a query parameter.`
      }
      errorDetails += ` The user may need to be created in the Prisma database.`
      
      return NextResponse.json({ 
        error: 'User not found',
        details: errorDetails,
        debug: {
          userIdParam,
          targetUserEmail,
        }
      }, { status: 404 })
    }

    const userId = user.id

    // Update user's callsign
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        callsign: callsign || null,
      },
    })

    return NextResponse.json({
      success: true,
      callsign: updatedUser.callsign,
    })
  } catch (error: any) {
    console.error('Error updating callsign:', error)
    
    // If the error is about missing field, provide helpful message
    if (error.code === 'P2009' || error.message?.includes('Unknown arg')) {
      return NextResponse.json(
        { error: 'Callsign field not found in database schema. Please add it to the User model.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

