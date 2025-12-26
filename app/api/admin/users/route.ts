import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin, isOwner } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'
import bcrypt from 'bcryptjs'

// Initialize Firebase Admin SDK if available
let firebaseAdmin: any = null
let firebaseAdminError: string | null = null

function initializeFirebaseAdmin() {
  if (firebaseAdmin && firebaseAdmin.apps.length > 0) {
    return firebaseAdmin
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    
    if (!serviceAccountKey) {
      firebaseAdminError = 'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set'
      return null
    }

    if (!firebaseAdmin) {
      firebaseAdmin = require('firebase-admin')
    }
    
    if (firebaseAdmin.apps.length === 0) {
      try {
        // Clean the key - remove surrounding quotes if present
        let cleanedKey = serviceAccountKey.trim()
        if ((cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) || 
            (cleanedKey.startsWith('"') && cleanedKey.endsWith('"'))) {
          cleanedKey = cleanedKey.slice(1, -1)
        }
        
        // Parse JSON
        const serviceAccount = JSON.parse(cleanedKey)
        
        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email', 'type']
        const missingFields = requiredFields.filter(field => !serviceAccount[field])
        
        if (missingFields.length > 0) {
          throw new Error(`Service account JSON is missing required fields: ${missingFields.join(', ')}`)
        }
        
        // Validate type
        if (serviceAccount.type !== 'service_account') {
          throw new Error(`Invalid service account type: ${serviceAccount.type}. Expected 'service_account'`)
        }
        
        // Initialize Firebase Admin SDK
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount),
        })
        
        console.log(`✅ Firebase Admin SDK initialized for project: ${serviceAccount.project_id}`)
        firebaseAdminError = null
      } catch (parseError: any) {
        firebaseAdminError = `Failed to initialize Firebase Admin SDK: ${parseError.message}`
        console.error('❌ Firebase Admin SDK initialization error:', parseError)
        console.error('Service account key preview:', serviceAccountKey.substring(0, 50) + '...')
        firebaseAdmin = null
      }
    }
    
    return firebaseAdmin
  } catch (error: any) {
    firebaseAdminError = `Firebase Admin SDK error: ${error.message}`
    console.error('❌ Firebase Admin SDK error:', error)
    firebaseAdmin = null
    return null
  }
}

// Initialize on module load
initializeFirebaseAdmin()

async function verifyAdmin(email: string | null) {
  if (!email) {
    return false
  }
  
  // First check if email matches admin email pattern (for Firebase auth users)
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
    // Get admin email from query parameter
    const searchParams = request.nextUrl.searchParams
    const adminEmail = searchParams.get('adminEmail')

    if (!adminEmail) {
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }
    
    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    // Get all users from Prisma
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        infiniteFlightUsername: true,
        displayName: true,
        avatarUrl: true,
        rank: true,
        bio: true,
        callsign: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminEmail, email, password, infiniteFlightUsername, callsign, role } = body

    // Verify admin
    if (!adminEmail) {
      return NextResponse.json({ error: 'Forbidden: No admin email provided' }, { status: 403 })
    }

    const isAdminUser = await verifyAdmin(adminEmail)
    if (!isAdminUser) {
      return NextResponse.json({ 
        error: 'Forbidden: User is not an admin',
        details: `Email: ${adminEmail} is not registered as admin in database`
      }, { status: 403 })
    }

    // Check if admin is owner (for role validation)
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })
    const adminUserRole = adminUser?.role || (isAdminEmail(adminEmail) ? 'admin' : null)

    // Validate role assignment permissions
    const requestedRole = role || 'user'
    if (requestedRole === 'admin' || requestedRole === 'owner') {
      if (!isOwner(adminUserRole)) {
        return NextResponse.json(
          { error: 'Forbidden: Only owners can create admin or owner accounts' },
          { status: 403 }
        )
      }
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    let firebaseUid: string | null = null

    // Initialize Firebase Admin SDK (re-initialize if needed)
    const admin = initializeFirebaseAdmin()
    
    // Create user in Firebase - REQUIRED for login to work
    if (!admin) {
      const errorDetails = firebaseAdminError || 'Firebase Admin SDK is not configured'
      return NextResponse.json(
        { 
          error: 'Firebase Admin SDK is not configured. Cannot create user for login.',
          details: `${errorDetails}

Quick Setup:
1. Go to https://console.firebase.google.com/
2. Select your project → Project Settings → Service Accounts
3. Click "Generate new private key" and download the JSON file
4. Open the JSON file and copy its entire contents
5. Create or edit .env.local file in your project root
6. Add: FIREBASE_SERVICE_ACCOUNT_KEY='[paste JSON content here]'
   (Wrap the JSON in single quotes)
7. Restart your development server (npm run dev)

For detailed instructions, see: FIREBASE_ADMIN_SETUP.md

Troubleshooting:
- Run: node scripts/check-firebase-admin-setup.js
- Check that JSON is properly formatted
- Ensure all required fields are present (project_id, private_key, client_email)

Example:
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'`
        },
        { status: 500 }
      )
    }

    try {
      // Check if user already exists in Firebase
      let existingFirebaseUser = null
      try {
        existingFirebaseUser = await admin.auth().getUserByEmail(email)
        firebaseUid = existingFirebaseUser.uid
        
        // Update password for existing user
        await admin.auth().updateUser(existingFirebaseUser.uid, {
          password: password,
          displayName: infiniteFlightUsername || email.split('@')[0],
        })
        console.log(`Updated existing Firebase user: ${email}`)
      } catch (error: any) {
        // User doesn't exist in Firebase, create it
        if (error.code === 'auth/user-not-found') {
          const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: infiniteFlightUsername || email.split('@')[0],
            emailVerified: false,
            disabled: false,
          })
          firebaseUid = userRecord.uid
          console.log(`Created new Firebase user: ${email}`)
        } else {
          throw error
        }
      }
    } catch (error: any) {
      console.error('Error creating/updating Firebase user:', error)
      
      // Provide more detailed error messages
      let errorMessage = `Failed to create Firebase user: ${error.message}`
      let errorDetails = ''
      
      if (error.code === 'app/no-app') {
        errorMessage = 'Firebase Admin SDK is not properly initialized'
        errorDetails = 'The Firebase Admin SDK configuration is invalid. Please check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Firebase service account credentials'
        errorDetails = 'The service account key is invalid or expired. Please generate a new key from Firebase Console.'
      } else if (error.message?.includes('configuration')) {
        errorMessage = 'Firebase configuration error'
        errorDetails = 'The service account JSON is missing required fields or is incorrectly formatted. Please verify your FIREBASE_SERVICE_ACCOUNT_KEY.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails || `Error code: ${error.code || 'unknown'}. Please check your Firebase Admin SDK configuration.`
        },
        { status: 500 }
      )
    }

    // Create password hash for Prisma
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: null,
        infiniteFlightUsername: infiniteFlightUsername || email.split('@')[0],
        callsign: callsign || null,
        role: role || 'user',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        infiniteFlightUsername: user.infiniteFlightUsername,
        role: user.role,
        firebaseUid,
      },
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}



