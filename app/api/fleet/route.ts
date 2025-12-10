import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Natural sort function: alphabet first, then numbers
function naturalSort(a: string, b: string): number {
  // Split strings into parts (alphabet and numbers)
  const regex = /(\d+|\D+)/g
  const aParts = a.match(regex) || []
  const bParts = b.match(regex) || []
  
  const minLength = Math.min(aParts.length, bParts.length)
  
  for (let i = 0; i < minLength; i++) {
    const aPart = aParts[i]
    const bPart = bParts[i]
    
    // Check if both parts are numbers
    const aNum = parseInt(aPart, 10)
    const bNum = parseInt(bPart, 10)
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      // Both are numbers, compare numerically
      if (aNum !== bNum) {
        return aNum - bNum
      }
    } else {
      // At least one is not a number, compare as strings
      const comparison = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' })
      if (comparison !== 0) {
        return comparison
      }
    }
  }
  
  // If all parts are equal, compare by length
  return aParts.length - bParts.length
}

// Public endpoint to get all active liveries (for dropdown in PIREP form)
export async function GET(request: NextRequest) {
  try {
    const liveries = await prisma.livery.findMany({
      where: {
        isActive: true,
        aircraftType: {
          isActive: true,
        },
      },
      include: {
        aircraftType: true,
      },
    })

    // Sort by aircraft type name (natural sort), then by livery name (natural sort)
    const sortedLiveries = liveries.sort((a, b) => {
      const aircraftTypeComparison = naturalSort(a.aircraftType.name, b.aircraftType.name)
      if (aircraftTypeComparison !== 0) {
        return aircraftTypeComparison
      }
      return naturalSort(a.name, b.name)
    })

    return NextResponse.json(sortedLiveries)
  } catch (error: any) {
    console.error('Error fetching liveries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch liveries', details: error.message },
      { status: 500 }
    )
  }
}

