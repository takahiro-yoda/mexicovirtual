import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNewApplication } from '@/lib/discord'

export async function POST(request: NextRequest) {
  try {
    const {
      ifcUsername,
      email,
      discordUsername,
      grade,
      totalFlightTime,
      yearsOfExperience,
      motivation,
    } = await request.json()

    // Validate required fields
    if (!ifcUsername || !email || !discordUsername || !grade || !motivation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if application with same email already exists and is pending
    const existingApplication = await prisma.application.findFirst({
      where: {
        email,
        status: 'pending',
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        infiniteFlightUsername: ifcUsername, // Use ifcUsername for infiniteFlightUsername
        ifcUsername,
        email,
        discordUsername,
        grade: parseInt(grade),
        totalFlightTime: totalFlightTime ? parseInt(totalFlightTime) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        motivation,
        status: 'pending',
      },
    })

    // Send Discord notification (non-blocking)
    // Store message ID for future updates
    notifyNewApplication({
      id: application.id,
      infiniteFlightUsername: application.infiniteFlightUsername,
      email: application.email,
      discordUsername: application.discordUsername,
      ifcUsername: application.ifcUsername,
      grade: application.grade,
      status: application.status,
      motivation: application.motivation,
      createdAt: application.createdAt,
    }).then((result) => {
      // Update application with Discord message ID if available
      if (result.success && result.messageId) {
        prisma.application.update({
          where: { id: application.id },
          data: { discordMessageId: result.messageId },
        }).catch((error) => {
          console.error('Failed to save Discord message ID:', error)
        })
      }
    }).catch((error) => {
      // Log error but don't fail the request
      console.error('Failed to send Discord notification:', error)
    })

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: { status?: string } = {}
    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    )
  }
}

