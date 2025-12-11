import { NextRequest, NextResponse } from 'next/server'
import { getAirportData, type AirportData } from '@/lib/airport-data'

// GitHub Airports JSONのキャッシュ（メモリ内）
let airportsCache: Record<string, any> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1時間

/**
 * GitHub Airports JSONから空港データを取得
 * データはメモリ内にキャッシュされる
 */
async function fetchAirportsFromGitHub(): Promise<Record<string, any>> {
  const now = Date.now()
  
  // キャッシュが有効な場合はそれを使用
  if (airportsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return airportsCache
  }

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json',
      {
        headers: {
          'Accept': 'application/json',
        },
        // タイムアウト設定（10秒）
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch airports data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    airportsCache = data
    cacheTimestamp = now
    return data
  } catch (error: any) {
    console.error('Error fetching airports from GitHub:', error)
    
    // エラーが発生した場合でも、古いキャッシュがあれば返す
    if (airportsCache) {
      console.warn('Using stale cache due to fetch error')
      return airportsCache
    }
    
    throw error
  }
}

/**
 * GitHub Airports JSONのデータ形式をAirportDataに変換
 */
function convertGitHubDataToAirportData(icao: string, data: any): AirportData | null {
  if (!data || !data.icao) {
    return null
  }

  // lat/lonが存在することを確認
  if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
    return null
  }

  return {
    icao: data.icao.toUpperCase(),
    name: data.name || 'Unknown Airport',
    latitude: data.lat,
    longitude: data.lon,
    city: data.city || undefined,
    country: data.country || undefined,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { icao: string } }
) {
  try {
    const icao = params.icao?.toUpperCase().trim()

    if (!icao || icao.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid ICAO code. Must be 4 characters.' },
        { status: 400 }
      )
    }

    // まず静的データベースをチェック
    const staticData = getAirportData(icao)
    if (staticData) {
      return NextResponse.json(staticData)
    }

    // 静的データにない場合、GitHubから取得
    try {
      const airportsData = await fetchAirportsFromGitHub()
      const airportData = airportsData[icao]

      if (!airportData) {
        return NextResponse.json(
          { error: `Airport ${icao} not found` },
          { status: 404 }
        )
      }

      const convertedData = convertGitHubDataToAirportData(icao, airportData)
      
      if (!convertedData) {
        return NextResponse.json(
          { error: `Invalid airport data for ${icao}` },
          { status: 500 }
        )
      }

      return NextResponse.json(convertedData)
    } catch (error: any) {
      console.error('Error fetching airport from GitHub:', error)
      return NextResponse.json(
        { error: 'Failed to fetch airport data from external source', details: error.message },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('Error in airport API route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
