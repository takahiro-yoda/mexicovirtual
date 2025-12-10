import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Firebase認証のユーザーをPrismaに同期するAPIエンドポイント
 * ログイン時に自動的に呼び出される
 */
export async function POST(request: NextRequest) {
  let requestData: { email?: string; displayName?: string; uid?: string } = {}
  
  try {
    requestData = await request.json()
    const { email, displayName, uid } = requestData

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // User exists, update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        userId: user.id 
      })
    }

    // Create new user in Prisma
    const placeholderPassword = await bcrypt.hash(`firebase-auth-${uid || email}`, 10)
    
    user = await prisma.user.create({
      data: {
        email: email,
        infiniteFlightUsername: displayName || email.split('@')[0],
        passwordHash: placeholderPassword,
        displayName: displayName || null,
        role: 'user',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: user.id 
    })
  } catch (error: any) {
    console.error('Error syncing user to Prisma:', error)
    
    // If user already exists (race condition), return success
    if (error.code === 'P2002') {
      try {
        const email = requestData.email
        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
          })
          return NextResponse.json({ 
            success: true, 
            message: 'User already exists',
            userId: user?.id 
          })
        }
      } catch (lookupError) {
        // If we can't look up, just return success
      }
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists' 
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to sync user', details: error.message },
      { status: 500 }
    )
  }
}

