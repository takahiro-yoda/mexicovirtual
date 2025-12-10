import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

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

