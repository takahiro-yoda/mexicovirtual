'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl'
import { getAirportData, fetchAirportDataFromAPI, type AirportData } from '@/lib/airport-data'
import { calculateGreatCirclePath, calculateOptimalZoom, calculateDistance } from '@/lib/geo-utils'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface FlightRouteMapProps {
  departureAirport: string
  arrivalAirport: string
  className?: string
}

export default function FlightRouteMap({
  departureAirport,
  arrivalAirport,
  className = '',
}: FlightRouteMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [departureData, setDepartureData] = useState<AirportData | null>(null)
  const [arrivalData, setArrivalData] = useState<AirportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  useEffect(() => {
    if (!mapboxToken) {
      setError('Mapbox token is not configured')
      setLoading(false)
      return
    }

    const dep = departureAirport.trim().toUpperCase()
    const arr = arrivalAirport.trim().toUpperCase()

    // 両方のICAOコードが4文字になるまで待つ
    if (dep.length !== 4 || arr.length !== 4) {
      setLoading(false)
      setDepartureData(null)
      setArrivalData(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    // 空港データを取得（静的データを優先、見つからない場合はAPIから取得）
    const loadAirportData = async () => {
      try {
        // 両方の空港データを並列で取得
        const [depData, arrData] = await Promise.all([
          fetchAirportDataFromAPI(dep),
          fetchAirportDataFromAPI(arr),
        ])

        setDepartureData(depData)
        setArrivalData(arrData)

        if (!depData) {
          setError(`Airport ${dep} not found`)
        } else if (!arrData) {
          setError(`Airport ${arr} not found`)
        } else {
          setError(null)
        }
      } catch (error: any) {
        console.error('Error loading airport data:', error)
        setError('Failed to load airport data')
      } finally {
        setLoading(false)
      }
    }

    loadAirportData()
  }, [departureAirport, arrivalAirport, mapboxToken])

  // ルート全体を表示する関数
  const fitRouteBounds = useCallback(() => {
    if (!mapRef.current || !departureData || !arrivalData) return

    try {
      // 大圏航路の座標を計算
      const routeCoordinates = calculateGreatCirclePath(
        { latitude: departureData.latitude, longitude: departureData.longitude },
        { latitude: arrivalData.latitude, longitude: arrivalData.longitude }
      )

      // すべての座標点を収集（空港の座標も含む）
      const allCoordinates = [
        ...routeCoordinates,
        [departureData.longitude, departureData.latitude] as [number, number],
        [arrivalData.longitude, arrivalData.latitude] as [number, number],
      ]

      // 緯度の範囲を計算
      const latitudes = allCoordinates.map(([, lat]) => lat)
      const minLat = Math.min(...latitudes)
      const maxLat = Math.max(...latitudes)
      const latRange = maxLat - minLat

      // 経度の範囲を計算（日付変更線を考慮）
      const longitudes = allCoordinates.map(([lon]) => lon)
      const minLonRaw = Math.min(...longitudes)
      const maxLonRaw = Math.max(...longitudes)
      const directRange = maxLonRaw - minLonRaw

      let minLon: number
      let maxLon: number
      let lonRange: number

      if (directRange > 180) {
        // 日付変更線をまたぐ場合
        // 経度を0-360に正規化して計算
        const normalized = longitudes.map(lon => lon < 0 ? lon + 360 : lon)
        const minNorm = Math.min(...normalized)
        const maxNorm = Math.max(...normalized)
        const normalizedRange = maxNorm - minNorm

        if (normalizedRange > 180) {
          // 経度が360度近くに広がっている場合
          // 実際には短い方の経路を取る必要がある
          // 反対側の範囲を計算
          const wrappedRange = 360 - normalizedRange
          if (wrappedRange < normalizedRange) {
            // 反対側の方が短い場合
            minLon = maxNorm - 360
            maxLon = minNorm
            lonRange = wrappedRange
          } else {
            // 正規化した範囲を使用
            minLon = minNorm - 360
            maxLon = maxNorm - 360
            lonRange = normalizedRange
          }
        } else {
          // 正規化した範囲を使用
          minLon = minNorm - 360
          maxLon = maxNorm - 360
          lonRange = normalizedRange
        }
      } else {
        // 通常の場合
        minLon = minLonRaw
        maxLon = maxLonRaw
        lonRange = directRange
      }

      // 距離を計算
      const distance = calculateDistance(
        { latitude: departureData.latitude, longitude: departureData.longitude },
        { latitude: arrivalData.latitude, longitude: arrivalData.longitude }
      )

      // 距離に応じたパディング率（長距離ほど大きく）
      let paddingRatio = 0.12
      if (distance > 12000) {
        paddingRatio = 0.25 // 超長距離は25%
      } else if (distance > 8000) {
        paddingRatio = 0.2 // 長距離は20%
      } else if (distance > 5000) {
        paddingRatio = 0.15 // 中距離は15%
      }

      const lonPadding = Math.max(lonRange * paddingRatio, 2)
      const latPadding = Math.max(latRange * paddingRatio, 2)

      // 境界を計算（世界の端を超えないように制限）
      const bounds: [[number, number], [number, number]] = [
        [Math.max(minLon - lonPadding, -180), Math.max(minLat - latPadding, -85)],
        [Math.min(maxLon + lonPadding, 180), Math.min(maxLat + latPadding, 85)],
      ]

      // 距離に基づいてmaxZoomを調整（長距離ほど低い）
      let maxZoomForDistance = 12
      if (distance > 15000) {
        maxZoomForDistance = 1
      } else if (distance > 12000) {
        maxZoomForDistance = 1.5
      } else if (distance > 10000) {
        maxZoomForDistance = 2
      } else if (distance > 8000) {
        maxZoomForDistance = 2.5
      } else if (distance > 5000) {
        maxZoomForDistance = 3
      } else if (distance > 2000) {
        maxZoomForDistance = 4
      } else if (distance > 1000) {
        maxZoomForDistance = 5
      }

      // fitBoundsを実行
      mapRef.current.fitBounds(bounds, {
        padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        duration: 1000,
        maxZoom: maxZoomForDistance,
        essential: true,
      })
    } catch (error) {
      console.error('Error in fitBounds:', error)
    }
  }, [departureData, arrivalData])

  // マップのビューを更新 - ルート全体が見えるように調整
  useEffect(() => {
    if (!mapLoaded || !departureData || !arrivalData) return

    // 少し遅延させて実行（マップの描画を待つ）
    const timer = setTimeout(() => {
      fitRouteBounds()
    }, 300)

    return () => clearTimeout(timer)
  }, [departureData, arrivalData, mapLoaded, fitRouteBounds])

  // ズームイン
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom()
    mapRef.current.zoomTo(currentZoom + 1, { duration: 300 })
  }, [])

  // ズームアウト
  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom()
    mapRef.current.zoomTo(currentZoom - 1, { duration: 300 })
  }, [])

  // 大圏航路を計算してルートの座標データを生成（メモ化してパフォーマンス向上）
  // フックは常に同じ順序で呼び出される必要があるため、早期リターンの前に配置
  const routeData = useMemo(() => {
    if (!departureData || !arrivalData) {
      return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [] as [number, number][],
        },
      }
    }
    
    const coords = calculateGreatCirclePath(
      { latitude: departureData.latitude, longitude: departureData.longitude },
      { latitude: arrivalData.latitude, longitude: arrivalData.longitude }
    )
    
    // 日付変更線をまたぐ場合の処理
    // 経度が180度をまたぐ場合、ルートを2つのLineStringに分割する必要がある
    const crossesDateLine = coords.some((coord, i) => {
      if (i === 0) return false
      const prevLon = coords[i - 1][0]
      const currLon = coord[0]
      return Math.abs(currLon - prevLon) > 180
    })

    if (crossesDateLine) {
      // 日付変更線をまたぐ場合、MultiLineStringとして扱う
      // 経度が跳ぶ位置で分割
      const segments: [number, number][][] = []
      let currentSegment: [number, number][] = [coords[0]]

      for (let i = 1; i < coords.length; i++) {
        const prevLon = coords[i - 1][0]
        const currLon = coords[i][0]
        
        if (Math.abs(currLon - prevLon) > 180) {
          // 日付変更線をまたいだ位置で分割
          segments.push(currentSegment)
          currentSegment = [coords[i]]
        } else {
          currentSegment.push(coords[i])
        }
      }
      
      if (currentSegment.length > 0) {
        segments.push(currentSegment)
      }

      return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'MultiLineString' as const,
          coordinates: segments,
        },
      }
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: coords,
      },
    }
  }, [departureData, arrivalData])

  // 初期ビュー状態を計算（fitBoundsが実行されるまでの一時的な表示）
  const initialCenter: [number, number] = useMemo(() => {
    if (!departureData || !arrivalData) return [0, 0]
    // 中心点を計算（日付変更線を考慮）
    let centerLon = (departureData.longitude + arrivalData.longitude) / 2
    // 日付変更線をまたぐ場合、中心点を調整
    if (Math.abs(departureData.longitude - arrivalData.longitude) > 180) {
      if (centerLon < 0) {
        centerLon += 180
      } else {
        centerLon -= 180
      }
    }
    return [
      centerLon,
      (departureData.latitude + arrivalData.latitude) / 2,
    ]
  }, [departureData, arrivalData])

  const initialZoom = useMemo(() => {
    if (!departureData || !arrivalData) return 2
    const distance = calculateDistance(
      { latitude: departureData.latitude, longitude: departureData.longitude },
      { latitude: arrivalData.latitude, longitude: arrivalData.longitude }
    )
    // 初期ズームは低めに設定（fitBoundsがすぐに調整する）
    if (distance > 10000) return 2
    if (distance > 5000) return 3
    return 4
  }, [departureData, arrivalData])

  if (!mapboxToken) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">Mapbox token is not configured</p>
      </div>
    )
  }

  const dep = departureAirport.trim().toUpperCase()
  const arr = arrivalAirport.trim().toUpperCase()
  const bothAirportsEntered = dep.length === 4 && arr.length === 4

  // 両方のICAOコードが4文字でない場合は何も表示しない
  if (!bothAirportsEntered) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error || !departureData || !arrivalData) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-300 ${className}`}>
        <div className="text-center px-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Unable to display map</p>
          <p className="text-gray-500 text-xs">{error || 'Airport data not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-64 rounded-lg overflow-hidden border border-gray-300 relative ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: initialZoom,
        }}
        onLoad={() => setMapLoaded(true)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        scrollZoom={false}
        boxZoom={false}
        dragRotate={false}
        touchZoomRotate={false}
      >
        {/* ルート線 */}
        <Source id="route" type="geojson" data={routeData}>
          <Layer
            id="route-layer"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': '#3b82f6',
              'line-width': 3,
            }}
          />
        </Source>

        {/* 出発空港マーカー */}
        <Marker
          longitude={departureData.longitude}
          latitude={departureData.latitude}
          anchor="bottom"
        >
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
              {departureData.icao}
            </div>
          </div>
        </Marker>

        {/* 到着空港マーカー */}
        <Marker
          longitude={arrivalData.longitude}
          latitude={arrivalData.latitude}
          anchor="bottom"
        >
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
              {arrivalData.icao}
            </div>
          </div>
        </Marker>
      </Map>

      {/* マップコントロールボタン */}
      {!loading && !error && departureData && arrivalData && (
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          {/* ルート全体を表示ボタン */}
          <button
            onClick={fitRouteBounds}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-md p-2 shadow-lg border border-gray-300 transition-colors"
            title="Fit route to view"
            aria-label="Fit route to view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          {/* ズームイン */}
          <button
            onClick={handleZoomIn}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-md p-2 shadow-lg border border-gray-300 transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          {/* ズームアウト */}
          <button
            onClick={handleZoomOut}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-md p-2 shadow-lg border border-gray-300 transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
