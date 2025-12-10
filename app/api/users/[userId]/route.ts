import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userIdParam = params.userId

    // Try to find user by Prisma ID first
    let user = await prisma.user.findUnique({
      where: { id: userIdParam },
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

    // If not found, try to find by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: userIdParam },
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
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

