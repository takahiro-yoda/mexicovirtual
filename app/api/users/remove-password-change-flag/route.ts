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
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      )
    }

    const idToken = authHeader.substring(7)

    if (!firebaseAdmin) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not available' },
        { status: 500 }
      )
    }

    // Verify ID token and get user
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get current custom claims
    const userRecord = await firebaseAdmin.auth().getUser(uid)
    const currentClaims = userRecord.customClaims || {}

    // Remove mustChangePassword claim
    const updatedClaims = { ...currentClaims }
    delete updatedClaims.mustChangePassword

    // Update custom claims
    await firebaseAdmin.auth().setCustomUserClaims(uid, updatedClaims)

    return NextResponse.json({
      success: true,
      message: 'Password change flag removed',
    })
  } catch (error: any) {
    console.error('Error removing password change flag:', error)
    return NextResponse.json(
      { error: 'Failed to remove password change flag', details: error.message },
      { status: 500 }
    )
  }
}
