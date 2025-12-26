import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!firebaseAdmin) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not available' },
        { status: 500 }
      )
    }

    // Get user by email
    let userRecord
    try {
      userRecord = await firebaseAdmin.auth().getUserByEmail(email)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Check if user has mustSetPassword custom claim
    const customClaims = userRecord.customClaims || {}
    if (customClaims.mustSetPassword !== true) {
      return NextResponse.json(
        { error: 'This user is not eligible for first login. Please use regular login.' },
        { status: 403 }
      )
    }

    // Generate custom token
    const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid)

    return NextResponse.json({
      success: true,
      customToken,
    })
  } catch (error: any) {
    console.error('Error generating custom token for first login:', error)
    return NextResponse.json(
      { error: 'Failed to generate login token', details: error.message },
      { status: 500 }
    )
  }
}


