export interface AirportData {
  icao: string
  name: string
  latitude: number
  longitude: number
  city?: string
  country?: string
}

// 主要空港の位置情報（静的データ）
// 主要な国際空港と人気のある空港を含む
export const airportDatabase: Record<string, AirportData> = {
  // 北米
  'KJFK': { icao: 'KJFK', name: 'John F. Kennedy International Airport', latitude: 40.6398, longitude: -73.7789, city: 'New York', country: 'USA' },
  'KLAX': { icao: 'KLAX', name: 'Los Angeles International Airport', latitude: 33.9425, longitude: -118.4081, city: 'Los Angeles', country: 'USA' },
  'KORD': { icao: 'KORD', name: "Chicago O'Hare International Airport", latitude: 41.9786, longitude: -87.9048, city: 'Chicago', country: 'USA' },
  'KMIA': { icao: 'KMIA', name: 'Miami International Airport', latitude: 25.7933, longitude: -80.2906, city: 'Miami', country: 'USA' },
  'KSFO': { icao: 'KSFO', name: 'San Francisco International Airport', latitude: 37.6213, longitude: -122.3790, city: 'San Francisco', country: 'USA' },
  'KSEA': { icao: 'KSEA', name: 'Seattle-Tacoma International Airport', latitude: 47.4502, longitude: -122.3088, city: 'Seattle', country: 'USA' },
  'KDFW': { icao: 'KDFW', name: 'Dallas/Fort Worth International Airport', latitude: 32.8969, longitude: -97.0378, city: 'Dallas', country: 'USA' },
  'KATL': { icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', latitude: 33.6407, longitude: -84.4277, city: 'Atlanta', country: 'USA' },
  'KBOS': { icao: 'KBOS', name: 'Logan International Airport', latitude: 42.3656, longitude: -71.0096, city: 'Boston', country: 'USA' },
  'KIAD': { icao: 'KIAD', name: 'Washington Dulles International Airport', latitude: 38.9531, longitude: -77.4565, city: 'Washington', country: 'USA' },
  'CYYZ': { icao: 'CYYZ', name: 'Toronto Pearson International Airport', latitude: 43.6772, longitude: -79.6306, city: 'Toronto', country: 'Canada' },
  'CYVR': { icao: 'CYVR', name: 'Vancouver International Airport', latitude: 49.1947, longitude: -123.1792, city: 'Vancouver', country: 'Canada' },
  
  // ヨーロッパ
  'EGLL': { icao: 'EGLL', name: 'London Heathrow Airport', latitude: 51.4700, longitude: -0.4543, city: 'London', country: 'UK' },
  'EGKK': { icao: 'EGKK', name: 'London Gatwick Airport', latitude: 51.1537, longitude: -0.1821, city: 'London', country: 'UK' },
  'LFPG': { icao: 'LFPG', name: 'Paris Charles de Gaulle Airport', latitude: 49.0097, longitude: 2.5479, city: 'Paris', country: 'France' },
  'EDDF': { icao: 'EDDF', name: 'Frankfurt am Main Airport', latitude: 50.0379, longitude: 8.5622, city: 'Frankfurt', country: 'Germany' },
  'EHAM': { icao: 'EHAM', name: 'Amsterdam Airport Schiphol', latitude: 52.3105, longitude: 4.7683, city: 'Amsterdam', country: 'Netherlands' },
  'LEMD': { icao: 'LEMD', name: 'Madrid-Barajas Airport', latitude: 40.4839, longitude: -3.5680, city: 'Madrid', country: 'Spain' },
  'LIRF': { icao: 'LIRF', name: 'Rome Fiumicino Airport', latitude: 41.8045, longitude: 12.2510, city: 'Rome', country: 'Italy' },
  'LSZH': { icao: 'LSZH', name: 'Zurich Airport', latitude: 47.4647, longitude: 8.5492, city: 'Zurich', country: 'Switzerland' },
  'LOWW': { icao: 'LOWW', name: 'Vienna International Airport', latitude: 48.1103, longitude: 16.5697, city: 'Vienna', country: 'Austria' },
  'EKCH': { icao: 'EKCH', name: 'Copenhagen Airport', latitude: 55.6180, longitude: 12.6560, city: 'Copenhagen', country: 'Denmark' },
  
  // アジア
  'RJTT': { icao: 'RJTT', name: 'Tokyo Haneda Airport', latitude: 35.5494, longitude: 139.7798, city: 'Tokyo', country: 'Japan' },
  'RJAA': { icao: 'RJAA', name: 'Narita International Airport', latitude: 35.7647, longitude: 140.3863, city: 'Tokyo', country: 'Japan' },
  'RKSI': { icao: 'RKSI', name: 'Incheon International Airport', latitude: 37.4602, longitude: 126.4407, city: 'Seoul', country: 'South Korea' },
  'ZSPD': { icao: 'ZSPD', name: 'Shanghai Pudong International Airport', latitude: 31.1434, longitude: 121.8052, city: 'Shanghai', country: 'China' },
  'ZBAA': { icao: 'ZBAA', name: 'Beijing Capital International Airport', latitude: 40.0801, longitude: 116.5846, city: 'Beijing', country: 'China' },
  'WSSS': { icao: 'WSSS', name: 'Singapore Changi Airport', latitude: 1.3644, longitude: 103.9915, city: 'Singapore', country: 'Singapore' },
  'VTBS': { icao: 'VTBS', name: 'Suvarnabhumi Airport', latitude: 13.6811, longitude: 100.7473, city: 'Bangkok', country: 'Thailand' },
  'VHHH': { icao: 'VHHH', name: 'Hong Kong International Airport', latitude: 22.3080, longitude: 113.9185, city: 'Hong Kong', country: 'Hong Kong' },
  'VIDP': { icao: 'VIDP', name: 'Indira Gandhi International Airport', latitude: 28.5562, longitude: 77.1003, city: 'New Delhi', country: 'India' },
  'OMDB': { icao: 'OMDB', name: 'Dubai International Airport', latitude: 25.2532, longitude: 55.3657, city: 'Dubai', country: 'UAE' },
  
  // オセアニア
  'YSSY': { icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', latitude: -33.9399, longitude: 151.1753, city: 'Sydney', country: 'Australia' },
  'YMML': { icao: 'YMML', name: 'Melbourne Airport', latitude: -37.6733, longitude: 144.8433, city: 'Melbourne', country: 'Australia' },
  'NZAA': { icao: 'NZAA', name: 'Auckland Airport', latitude: -37.0082, longitude: 174.7850, city: 'Auckland', country: 'New Zealand' },
  
  // 南米
  'SBGR': { icao: 'SBGR', name: 'São Paulo/Guarulhos International Airport', latitude: -23.4321, longitude: -46.4695, city: 'São Paulo', country: 'Brazil' },
  'SCEL': { icao: 'SCEL', name: 'Arturo Merino Benítez International Airport', latitude: -33.3930, longitude: -70.7858, city: 'Santiago', country: 'Chile' },
}

/**
 * ICAOコードから空港情報を取得
 * まず静的データベースを検索し、見つからない場合はnullを返す
 * @param icao - ICAO空港コード（大文字推奨）
 * @returns 空港情報またはnull
 */
export function getAirportData(icao: string): AirportData | null {
  const upperIcao = icao.toUpperCase().trim()
  return airportDatabase[upperIcao] || null
}

/**
 * 複数のICAOコードから空港情報を取得
 * @param icaos - ICAO空港コードの配列
 * @returns 空港情報の配列（見つからないものはnull）
 */
export function getMultipleAirportData(icaos: string[]): (AirportData | null)[] {
  return icaos.map(icao => getAirportData(icao))
}

/**
 * 空港情報が存在するかチェック
 * @param icao - ICAO空港コード
 * @returns 存在する場合はtrue
 */
export function hasAirportData(icao: string): boolean {
  return getAirportData(icao) !== null
}

/**
 * APIから空港情報を非同期で取得
 * まず静的データベースをチェックし、見つからない場合はAPIを呼び出す
 * @param icao - ICAO空港コード（大文字推奨）
 * @returns 空港情報またはnull（Promise）
 */
export async function fetchAirportDataFromAPI(icao: string): Promise<AirportData | null> {
  const upperIcao = icao.toUpperCase().trim()
  
  // まず静的データベースをチェック
  const staticData = getAirportData(upperIcao)
  if (staticData) {
    return staticData
  }

  // 静的データにない場合、APIから取得
  try {
    const response = await fetch(`/api/airports/${upperIcao}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: AirportData = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching airport data for ${upperIcao}:`, error)
    return null
  }
}


