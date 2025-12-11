import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const firebaseUid = params.uid

    // For now, we don't have a direct mapping between Firebase UID and Prisma User ID
    // We'll need to use email to find the user
    // In production, you should add a firebaseUid field to the User model
    
    // Since we can't directly map Firebase UID to Prisma User ID without additional data,
    // we'll return an error suggesting to use email instead
    // Or you can add a firebaseUid field to the User model
    
    return NextResponse.json(
      { error: 'Firebase UID to Prisma User ID mapping not implemented. Please use email or Prisma User ID.' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error fetching Prisma User ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


