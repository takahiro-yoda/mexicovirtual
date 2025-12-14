import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateApplicationNotification } from '@/lib/discord'
import bcrypt from 'bcryptjs'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { status, messageId, adminEmail } = await request.json()
    const { applicationId } = params

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    // Find application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Get reviewer user ID if adminEmail is provided
    let reviewedBy: string | null = null
    if (adminEmail) {
      const reviewer = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true },
      })
      if (reviewer) {
        reviewedBy = reviewer.id
      }
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || undefined,
      },
    })

    // If application is approved, create user account
    if (status === 'approved' && !application.userId) {
      try {
        // Check if user already exists in Prisma
        let prismaUser = await prisma.user.findUnique({
          where: { email: application.email },
        })

        // Check if user already exists in Firebase
        let firebaseUser = null
        if (firebaseAdmin) {
          try {
            firebaseUser = await firebaseAdmin.auth().getUserByEmail(application.email)
          } catch (error: any) {
            // User doesn't exist in Firebase, we'll create it
            if (error.code !== 'auth/user-not-found') {
              throw error
            }
          }
        }

        // Create Firebase user if it doesn't exist
        if (!firebaseUser && firebaseAdmin) {
          try {
            // Generate a random secure password (user won't need to know this)
            // Firebase requires a password, but user will use custom token for first login
            const crypto = require('crypto')
            const randomPassword = crypto.randomBytes(32).toString('hex')
            
            // Create user in Firebase with random password
            firebaseUser = await firebaseAdmin.auth().createUser({
              email: application.email,
              password: randomPassword, // Random secure password (user won't use this)
              displayName: application.infiniteFlightUsername || application.ifcUsername || null,
              emailVerified: false,
              disabled: false,
            })

            // Set custom claim to require password setup on first login
            await firebaseAdmin.auth().setCustomUserClaims(firebaseUser.uid, {
              mustSetPassword: true,
            })

            console.log(`✅ Created Firebase user for approved application: ${application.email}`)
          } catch (error: any) {
            console.error('Error creating Firebase user:', error)
            // Continue even if Firebase user creation fails
          }
        }

        // Create or update Prisma user
        if (!prismaUser) {
          // Generate placeholder password hash for Prisma
          const placeholderPassword = await bcrypt.hash(`firebase-auth-${firebaseUser?.uid || application.email}`, 10)
          
          prismaUser = await prisma.user.create({
            data: {
              email: application.email,
              infiniteFlightUsername: application.infiniteFlightUsername || application.ifcUsername || application.email.split('@')[0],
              passwordHash: placeholderPassword,
              displayName: application.infiniteFlightUsername || application.ifcUsername || null,
              role: 'user',
            },
          })

          // Link application to user
          await prisma.application.update({
            where: { id: applicationId },
            data: {
              userId: prismaUser.id,
            },
          })

          console.log(`✅ Created Prisma user for approved application: ${application.email}`)
        } else {
          // Link application to existing user
          await prisma.application.update({
            where: { id: applicationId },
            data: {
              userId: prismaUser.id,
            },
          })
        }
      } catch (error: any) {
        console.error('Error creating user account for approved application:', error)
        // Don't fail the request if user creation fails, but log the error
      }
    }

    // Use messageId from request or from database
    const discordMessageId = messageId || updatedApplication.discordMessageId

    // Update Discord message if messageId is available
    if (discordMessageId) {
      updateApplicationNotification(
        {
          id: updatedApplication.id,
          infiniteFlightUsername: updatedApplication.infiniteFlightUsername,
          email: updatedApplication.email,
          discordUsername: updatedApplication.discordUsername,
          ifcUsername: updatedApplication.ifcUsername,
          grade: updatedApplication.grade,
          status: updatedApplication.status,
          motivation: updatedApplication.motivation,
          createdAt: updatedApplication.createdAt,
        },
        discordMessageId
      ).catch((error) => {
        console.error('Failed to update Discord notification:', error)
      })
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    })
  } catch (error: any) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status', details: error.message },
      { status: 500 }
    )
  }
}

