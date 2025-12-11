/**
 * 地理計算ユーティリティ
 * 大圏航路、距離計算などの地理的な計算を行う
 */

interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Haversine公式を使用して2点間の距離を計算（キロメートル）
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * ラジアンを度に変換
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * 大圏航路の経路を計算
 * 2点間の最短距離（大圏航路）に沿った中間点の座標を生成
 * 
 * @param point1 - 出発点の座標
 * @param point2 - 到着点の座標
 * @param numPoints - 生成する中間点の数（デフォルト: 自動計算）
 * @returns 座標の配列（[longitude, latitude]形式）
 */
export function calculateGreatCirclePath(
  point1: Coordinates,
  point2: Coordinates,
  numPoints?: number
): [number, number][] {
  const distance = calculateDistance(point1, point2)
  
  // 距離に基づいてポイント数を自動計算
  // 距離が長いほど多くのポイントを生成
  if (!numPoints) {
    if (distance < 100) {
      numPoints = 10
    } else if (distance < 1000) {
      numPoints = 20
    } else if (distance < 5000) {
      numPoints = 50
    } else {
      numPoints = 100
    }
  }
  
  const coordinates: [number, number][] = []
  
  const lat1 = toRadians(point1.latitude)
  const lat2 = toRadians(point2.latitude)
  const lon1 = toRadians(point1.longitude)
  const lon2 = toRadians(point2.longitude)
  
  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((lat2 - lat1) / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
    )
  )
  
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    
    const x =
      A * Math.cos(lat1) * Math.cos(lon1) +
      B * Math.cos(lat2) * Math.cos(lon2)
    const y =
      A * Math.cos(lat1) * Math.sin(lon1) +
      B * Math.cos(lat2) * Math.sin(lon2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y))
    const lon = Math.atan2(y, x)
    
    coordinates.push([toDegrees(lon), toDegrees(lat)])
  }
  
  return coordinates
}

/**
 * 距離に基づいて適切なズームレベルを計算
 * 
 * @param distanceKm - 距離（キロメートル）
 * @returns ズームレベル（0-18）
 */
export function calculateOptimalZoom(distanceKm: number): number {
  if (distanceKm < 50) {
    return 11
  } else if (distanceKm < 100) {
    return 10
  } else if (distanceKm < 250) {
    return 9
  } else if (distanceKm < 500) {
    return 8
  } else if (distanceKm < 1000) {
    return 7
  } else if (distanceKm < 2000) {
    return 6
  } else if (distanceKm < 5000) {
    return 5
  } else if (distanceKm < 10000) {
    return 4
  } else {
    return 3
  }
}
