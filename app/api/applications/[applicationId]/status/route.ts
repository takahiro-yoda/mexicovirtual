import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateApplicationNotification } from '@/lib/discord'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { status, messageId } = await request.json()
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

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        // reviewedBy should be set from the authenticated user's ID
        // For now, we'll leave it as is
      },
    })

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

