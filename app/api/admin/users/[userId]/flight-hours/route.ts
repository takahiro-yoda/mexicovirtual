import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

// Initialize Firebase Admin SDK if available
let firebaseAdmin: any = null
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    firebaseAdmin = require('firebase-admin')
    if (firebaseAdmin.apps.length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      })
    }
  }
} catch (error) {
  console.warn('Firebase Admin SDK not available:', error)
}

async function getEmailFromFirebaseUID(uid: string): Promise<string | null> {
  if (!firebaseAdmin) {
    return null
  }
  
  try {
    const userRecord = await firebaseAdmin.auth().getUser(uid)
    return userRecord.email || null
  } catch (error) {
    console.error('Error getting user from Firebase:', error)
    return null
  }
}

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
      // If user doesn't exist in Prisma, check if it's the admin email
      // In production, you should sync Firebase users to Prisma
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
    const { minutes, adminEmail, targetUserEmail } = await request.json()

    if (typeof minutes !== 'number' || minutes < 0) {
      return NextResponse.json({ error: 'Invalid minutes value' }, { status: 400 })
    }

    // Verify admin status
    if (!adminEmail) {
      console.log('PATCH /api/admin/users/[userId]/flight-hours: No adminEmail provided')
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }
    
    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: User ${adminEmail} is not admin`)
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    const userIdParam = params.userId
    console.log(`PATCH /api/admin/users/[userId]/flight-hours: userIdParam = ${userIdParam}, targetUserEmail = ${targetUserEmail}`)

    // userIdParam could be either Prisma User ID or Firebase UID
    // targetUserEmail is the email of the target user (if provided from frontend)
    let user = null
    
    // First, try to find user by email if provided (most reliable)
    if (targetUserEmail) {
      try {
        user = await prisma.user.findUnique({
          where: { email: targetUserEmail },
        })
        console.log(`PATCH /api/admin/users/[userId]/flight-hours: Found user by targetUserEmail: ${user ? 'yes' : 'no'}`)
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
        console.log(`PATCH /api/admin/users/[userId]/flight-hours: Found user by ID: ${user ? 'yes' : 'no'}`)
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
        console.log(`PATCH /api/admin/users/[userId]/flight-hours: Found user by email: ${user ? 'yes' : 'no'}`)
      } catch (error) {
        console.error('Error finding user by email:', error)
      }
    }

    // If still not found, try to get email from Firebase UID and create user if needed
    if (!user) {
      try {
        let email = targetUserEmail
        let firebaseUser = null
        
        // Try to get email from Firebase UID if not provided
        if (!email && firebaseAdmin) {
          try {
            firebaseUser = await firebaseAdmin.auth().getUser(userIdParam)
            email = firebaseUser.email || null
            console.log(`PATCH /api/admin/users/[userId]/flight-hours: Got email from Firebase: ${email}`)
          } catch (firebaseError: any) {
            console.error('Error getting user from Firebase:', firebaseError)
            // If Firebase Admin SDK fails, we can't proceed
            if (firebaseError.code === 'auth/user-not-found') {
              console.log(`PATCH /api/admin/users/[userId]/flight-hours: Firebase user not found: ${userIdParam}`)
            }
          }
        }
        
        if (email) {
          console.log(`PATCH /api/admin/users/[userId]/flight-hours: Using email: ${email}`)
          user = await prisma.user.findUnique({
            where: { email },
          })
          console.log(`PATCH /api/admin/users/[userId]/flight-hours: Found user by email: ${user ? 'yes' : 'no'}`)
          
          // If user doesn't exist in Prisma, create it
          if (!user) {
            console.log(`PATCH /api/admin/users/[userId]/flight-hours: Creating new Prisma user for email: ${email}`)
            try {
              // Get Firebase user details if not already fetched
              if (!firebaseUser && firebaseAdmin) {
                try {
                  firebaseUser = await firebaseAdmin.auth().getUser(userIdParam)
                } catch (error) {
                  console.warn('Could not fetch Firebase user details, using defaults')
                }
              }
              
              // Create user in Prisma
              // Note: We need to generate a password hash, but for Firebase auth users,
              // we can use a placeholder since they authenticate via Firebase
              const bcrypt = require('bcryptjs')
              const placeholderPassword = await bcrypt.hash(`firebase-auth-${userIdParam}`, 10)
              
              user = await prisma.user.create({
                data: {
                  email: email,
                  infiniteFlightUsername: firebaseUser?.displayName || email.split('@')[0],
                  passwordHash: placeholderPassword, // Placeholder for Firebase auth users
                  displayName: firebaseUser?.displayName || null,
                  role: 'user', // Default role, can be updated later
                },
              })
              console.log(`PATCH /api/admin/users/[userId]/flight-hours: Created Prisma user with ID: ${user.id}`)
            } catch (createError: any) {
              console.error('Error creating Prisma user:', createError)
              // If user already exists (race condition), try to fetch it again
              if (createError.code === 'P2002') {
                user = await prisma.user.findUnique({
                  where: { email },
                })
                console.log(`PATCH /api/admin/users/[userId]/flight-hours: User was created by another request, found: ${user ? 'yes' : 'no'}`)
              } else {
                throw createError
              }
            }
          }
        } else {
          console.log(`PATCH /api/admin/users/[userId]/flight-hours: No email available for user creation`)
        }
      } catch (error) {
        console.error('Error in user creation process:', error)
      }
    }

    if (!user) {
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: User not found for ${userIdParam}`)
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: targetUserEmail was: ${targetUserEmail}`)
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: firebaseAdmin available: ${!!firebaseAdmin}`)
      
      // Provide more helpful error message
      let errorDetails = `No user found with ID, email, or Firebase UID: ${userIdParam}.`
      if (!targetUserEmail) {
        errorDetails += ` Email was not provided. Please ensure the user's email is passed as a query parameter.`
      }
      if (!firebaseAdmin) {
        errorDetails += ` Firebase Admin SDK is not available. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.`
      }
      errorDetails += ` The user may need to be created in the Prisma database.`
      
      return NextResponse.json({ 
        error: 'User not found',
        details: errorDetails,
        debug: {
          userIdParam,
          targetUserEmail,
          firebaseAdminAvailable: !!firebaseAdmin,
        }
      }, { status: 404 })
    }

    const userId = user.id
    console.log(`PATCH /api/admin/users/[userId]/flight-hours: Using Prisma User ID: ${userId}`)

    // Get or create user statistics
    let userStats = null
    try {
      userStats = await prisma.userStatistics.findUnique({
        where: { userId },
      })
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: Found user statistics: ${userStats ? 'yes' : 'no'}`)
    } catch (error) {
      console.error('Error finding user statistics:', error)
      throw error
    }

    if (!userStats) {
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: Creating new user statistics`)
      try {
              userStats = await prisma.userStatistics.create({
                data: {
                  userId,
                  totalFlightTimeMinutes: minutes,
                  totalFlights: 0,
                  totalDistanceKm: 0,
                  visitedAirports: "[]" as any, // JSON string for SQLite
                  aircraftTypes: "[]" as any, // JSON string for SQLite
                },
              })
        console.log(`PATCH /api/admin/users/[userId]/flight-hours: Created user statistics with ${minutes} minutes`)
      } catch (error) {
        console.error('Error creating user statistics:', error)
        throw error
      }
    } else {
      // Add minutes to existing flight time
      console.log(`PATCH /api/admin/users/[userId]/flight-hours: Updating user statistics, adding ${minutes} minutes`)
      try {
        userStats = await prisma.userStatistics.update({
          where: { userId },
          data: {
            totalFlightTimeMinutes: {
              increment: minutes,
            },
          },
        })
        console.log(`PATCH /api/admin/users/[userId]/flight-hours: Updated user statistics to ${userStats.totalFlightTimeMinutes} minutes`)
      } catch (error) {
        console.error('Error updating user statistics:', error)
        throw error
      }
    }

    return NextResponse.json({
      success: true,
      totalFlightTimeMinutes: userStats.totalFlightTimeMinutes,
    })
  } catch (error: any) {
    console.error('Error updating flight hours:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Internal server error'
    let errorDetails = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }
    
    // Check for Prisma errors
    if (error?.code) {
      errorDetails = {
        ...errorDetails,
        code: error.code,
        meta: error.meta,
      }
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        errorMessage = 'Unique constraint violation'
      } else if (error.code === 'P2025') {
        errorMessage = 'Record not found'
      } else if (error.code === 'P1001') {
        errorMessage = 'Database connection error'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}

