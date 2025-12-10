import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { isAdmin } from '@/lib/permissions'
import { isAdminEmail } from '@/lib/user-role'

async function verifyAdmin(email: string | null) {
  if (!email) {
    return false
  }
  
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

export async function POST(request: NextRequest) {
  try {
    // Try to get user from session first
    const currentUser = await getCurrentUser()
    let adminEmail = currentUser?.email || null
    
    // If session doesn't have email, try to get from request body (for Firebase auth)
    const requestData = await request.json()
    const { fleetData, adminEmail: bodyAdminEmail } = requestData
    
    // Use email from body if session doesn't have it
    if (!adminEmail && bodyAdminEmail) {
      adminEmail = bodyAdminEmail
    }
    
    if (!adminEmail) {
      console.log('POST /api/admin/fleet/import: No admin email available')
      return NextResponse.json(
        { error: 'Unauthorized: No admin email provided' },
        { status: 401 }
      )
    }

    const isUserAdmin = await verifyAdmin(adminEmail)
    if (!isUserAdmin) {
      console.log(`POST /api/admin/fleet/import: User ${adminEmail} is not admin`)
      return NextResponse.json(
        { error: 'Forbidden: User is not an admin' },
        { status: 403 }
      )
    }

    if (!fleetData || typeof fleetData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid fleet data: Expected an object with aircraft types and liveries' },
        { status: 400 }
      )
    }

    console.log(`POST /api/admin/fleet/import: Starting import for admin ${adminEmail}`)
    
    // First, check for duplicates before creating anything
    const duplicateAircraftTypes: string[] = []
    const duplicateLiveries: Array<{ aircraftType: string; livery: string }> = []
    
    // Check for duplicates
    for (const [aircraftTypeName, liveries] of Object.entries(fleetData)) {
      // Validate liveries array
      if (!Array.isArray(liveries)) {
        return NextResponse.json(
          { error: `Invalid data: "${aircraftTypeName}" must have an array of liveries` },
          { status: 400 }
        )
      }

      // Remove (PRO), (Free), (LEGACY) tags from aircraft type name
      const cleanAircraftTypeName = aircraftTypeName
        .replace(/\s*\(PRO\)\s*/gi, ' ')
        .replace(/\s*\(Free\)\s*/gi, ' ')
        .replace(/\s*\(LEGACY\)\s*/gi, ' ')
        .trim()
      
      if (!cleanAircraftTypeName) {
        return NextResponse.json(
          { error: `Invalid aircraft type name: "${aircraftTypeName}"` },
          { status: 400 }
        )
      }
      
      // Check if aircraft type already exists
      const existingAircraftType = await prisma.aircraftType.findFirst({
        where: { name: cleanAircraftTypeName }
      })
      
      if (existingAircraftType) {
        duplicateAircraftTypes.push(cleanAircraftTypeName)
        
        // Check for duplicate liveries in this aircraft type
        for (const liveryName of liveries) {
          if (typeof liveryName !== 'string' || !liveryName.trim()) {
            continue
          }

          const trimmedLiveryName = liveryName.trim()
          
          const existingLivery = await prisma.livery.findFirst({
            where: {
              aircraftTypeId: existingAircraftType.id,
              name: trimmedLiveryName
            }
          })
          
          if (existingLivery) {
            duplicateLiveries.push({
              aircraftType: cleanAircraftTypeName,
              livery: trimmedLiveryName
            })
          }
        }
      } else {
        // For new aircraft types, check if any liveries would be duplicates
        // (This is a pre-check, we'll create the aircraft type later)
        // Actually, for new aircraft types, liveries can't be duplicates since the aircraft type doesn't exist yet
      }
    }
    
    // If there are any duplicates, return error
    if (duplicateAircraftTypes.length > 0 || duplicateLiveries.length > 0) {
      const errorMessages: string[] = []
      
      if (duplicateAircraftTypes.length > 0) {
        errorMessages.push(`Duplicate aircraft types: ${duplicateAircraftTypes.join(', ')}`)
      }
      
      if (duplicateLiveries.length > 0) {
        const liveryMessages = duplicateLiveries.map(
          d => `"${d.livery}" in "${d.aircraftType}"`
        )
        errorMessages.push(`Duplicate liveries: ${liveryMessages.join(', ')}`)
      }
      
      return NextResponse.json(
        { 
          error: 'Duplicate entries found. Please remove duplicates before importing.',
          details: errorMessages
        },
        { status: 409 }
      )
    }
    
    // No duplicates found, proceed with import
    let aircraftTypesCreated = 0
    let liveriesCreated = 0
    
    // Process each aircraft type
    for (const [aircraftTypeName, liveries] of Object.entries(fleetData)) {
      // Remove (PRO), (Free), (LEGACY) tags from aircraft type name
      const cleanAircraftTypeName = aircraftTypeName
        .replace(/\s*\(PRO\)\s*/gi, ' ')
        .replace(/\s*\(Free\)\s*/gi, ' ')
        .replace(/\s*\(LEGACY\)\s*/gi, ' ')
        .trim()
      
      // Create aircraft type (we already checked for duplicates)
      const aircraftType = await prisma.aircraftType.create({
        data: {
          name: cleanAircraftTypeName
        }
      })
      console.log(`Created aircraft type: ${cleanAircraftTypeName}`)
      aircraftTypesCreated++
      
      // Process liveries
      for (const liveryName of liveries) {
        if (typeof liveryName !== 'string' || !liveryName.trim()) {
          console.warn(`Skipping invalid livery name: "${liveryName}"`)
          continue
        }

        const trimmedLiveryName = liveryName.trim()
        
        // Create livery (we already checked for duplicates)
        await prisma.livery.create({
          data: {
            aircraftTypeId: aircraftType.id,
            name: trimmedLiveryName
          }
        })
        console.log(`  Created livery: ${trimmedLiveryName}`)
        liveriesCreated++
      }
    }
    
    console.log(`POST /api/admin/fleet/import: Import completed for admin ${adminEmail}`)
    console.log(`  Aircraft types: ${aircraftTypesCreated} created`)
    console.log(`  Liveries: ${liveriesCreated} created`)
    
    return NextResponse.json({
      success: true,
      summary: {
        aircraftTypesCreated,
        liveriesCreated
      }
    })
  } catch (error: any) {
    console.error('Error importing fleet data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import fleet data', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

