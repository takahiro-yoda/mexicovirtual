import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
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
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


