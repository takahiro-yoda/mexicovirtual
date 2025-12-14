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
  waypoints?: string[]
  className?: string
}

export default function FlightRouteMap({
  departureAirport,
  arrivalAirport,
  waypoints,
  className = '',
}: FlightRouteMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [departureData, setDepartureData] = useState<AirportData | null>(null)
  const [arrivalData, setArrivalData] = useState<AirportData | null>(null)
  const [waypointData, setWaypointData] = useState<AirportData[]>([])
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
    const validWaypoints = waypoints?.filter(w => w.trim().length === 4).map(w => w.trim().toUpperCase()) || []

    // Wait until both ICAO codes are 4 characters
    if (dep.length !== 4 || arr.length !== 4) {
      setLoading(false)
      setDepartureData(null)
      setArrivalData(null)
      setWaypointData([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    // Fetch airport data (prioritize static data, fallback to API if not found)
    const loadAirportData = async () => {
      try {
        // Fetch departure, arrival, and waypoint data in parallel
        const airportPromises = [
          fetchAirportDataFromAPI(dep),
          fetchAirportDataFromAPI(arr),
          ...validWaypoints.map(wp => fetchAirportDataFromAPI(wp))
        ]
        
        const airportData = await Promise.all(airportPromises)
        const depData = airportData[0]
        const arrData = airportData[1]
        const waypointDataArray = airportData.slice(2) as AirportData[]

        setDepartureData(depData)
        setArrivalData(arrData)
        setWaypointData(waypointDataArray.filter(d => d !== null))

        if (!depData) {
          setError(`Airport ${dep} not found`)
        } else if (!arrData) {
          setError(`Airport ${arr} not found`)
        } else if (waypointDataArray.some(d => d === null)) {
          const missingWaypoints = validWaypoints.filter((_, i) => airportData[i + 2] === null)
          setError(`Waypoint(s) not found: ${missingWaypoints.join(', ')}`)
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
  }, [departureAirport, arrivalAirport, waypoints, mapboxToken])

  // Function to display entire route
  const fitRouteBounds = useCallback(() => {
    if (!mapRef.current || !departureData || !arrivalData) return

    try {
      // Collect coordinates of all airports (departure, waypoints, arrival)
      const allAirportCoordinates: [number, number][] = [
        [departureData.longitude, departureData.latitude],
        ...waypointData.map(wp => [wp.longitude, wp.latitude] as [number, number]),
        [arrivalData.longitude, arrivalData.latitude],
      ]

      // Collect all coordinate points (including airport coordinates)
      const allCoordinates = [
        ...allAirportCoordinates,
      ]

      // Calculate latitude range
      const latitudes = allCoordinates.map(([, lat]) => lat)
      const minLat = Math.min(...latitudes)
      const maxLat = Math.max(...latitudes)
      const latRange = maxLat - minLat

      // Calculate longitude range (considering date line)
      const longitudes = allCoordinates.map(([lon]) => lon)
      const minLonRaw = Math.min(...longitudes)
      const maxLonRaw = Math.max(...longitudes)
      const directRange = maxLonRaw - minLonRaw

      let minLon: number
      let maxLon: number
      let lonRange: number

      if (directRange > 180) {
        // When crossing the date line
        // Normalize longitude to 0-360 for calculation
        const normalized = longitudes.map(lon => lon < 0 ? lon + 360 : lon)
        const minNorm = Math.min(...normalized)
        const maxNorm = Math.max(...normalized)
        const normalizedRange = maxNorm - minNorm

        if (normalizedRange > 180) {
          // When longitude spreads near 360 degrees
          // Actually need to take the shorter route
          // Calculate the opposite side range
          const wrappedRange = 360 - normalizedRange
          if (wrappedRange < normalizedRange) {
            // When the opposite side is shorter
            minLon = maxNorm - 360
            maxLon = minNorm
            lonRange = wrappedRange
          } else {
            // Use normalized range
            minLon = minNorm - 360
            maxLon = maxNorm - 360
            lonRange = normalizedRange
          }
        } else {
          // Use normalized range
          minLon = minNorm - 360
          maxLon = maxNorm - 360
          lonRange = normalizedRange
        }
      } else {
        // Normal case
        minLon = minLonRaw
        maxLon = maxLonRaw
        lonRange = directRange
      }

      // Calculate total distance (departure → waypoint1 → waypoint2 → ... → arrival)
      let totalDistance = 0
      for (let i = 0; i < allAirportCoordinates.length - 1; i++) {
        const start = { latitude: allAirportCoordinates[i][1], longitude: allAirportCoordinates[i][0] }
        const end = { latitude: allAirportCoordinates[i + 1][1], longitude: allAirportCoordinates[i + 1][0] }
        totalDistance += calculateDistance(start, end)
      }
      const distance = totalDistance

      // Padding ratio based on distance (larger for longer distances)
      let paddingRatio = 0.12
      if (distance > 12000) {
        paddingRatio = 0.25 // Ultra-long distance: 25%
      } else if (distance > 8000) {
        paddingRatio = 0.2 // Long distance: 20%
      } else if (distance > 5000) {
        paddingRatio = 0.15 // Medium distance: 15%
      }

      const lonPadding = Math.max(lonRange * paddingRatio, 2)
      const latPadding = Math.max(latRange * paddingRatio, 2)

      // Calculate bounds (limit to not exceed world edges)
      const bounds: [[number, number], [number, number]] = [
        [Math.max(minLon - lonPadding, -180), Math.max(minLat - latPadding, -85)],
        [Math.min(maxLon + lonPadding, 180), Math.min(maxLat + latPadding, 85)],
      ]

      // Adjust maxZoom based on distance (lower for longer distances)
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

      // Execute fitBounds
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
  }, [departureData, arrivalData, waypointData])

  // Update map view - adjust to show entire route
  useEffect(() => {
    if (!mapLoaded || !departureData || !arrivalData) return

    // Execute with slight delay (wait for map rendering)
    const timer = setTimeout(() => {
      fitRouteBounds()
    }, 300)

    return () => clearTimeout(timer)
  }, [departureData, arrivalData, waypointData, mapLoaded, fitRouteBounds])

  // Zoom in
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom()
    mapRef.current.zoomTo(currentZoom + 1, { duration: 300 })
  }, [])

  // Zoom out
  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom()
    mapRef.current.zoomTo(currentZoom - 1, { duration: 300 })
  }, [])

  // Calculate great circle route and generate route coordinate data (memoized for performance)
  // Hooks must always be called in the same order, so place before early return
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

    // If waypoints exist, connect each segment sequentially
    const allAirports = [
      { latitude: departureData.latitude, longitude: departureData.longitude },
      ...waypointData.map(wp => ({ latitude: wp.latitude, longitude: wp.longitude })),
      { latitude: arrivalData.latitude, longitude: arrivalData.longitude },
    ]

    // Combine coordinates of each segment
    const allCoords: [number, number][] = []
    for (let i = 0; i < allAirports.length - 1; i++) {
      const segmentCoords = calculateGreatCirclePath(allAirports[i], allAirports[i + 1])
      // Skip the first point for segments after the first (to avoid duplicates)
      if (i === 0) {
        allCoords.push(...segmentCoords)
      } else {
        allCoords.push(...segmentCoords.slice(1))
      }
    }
    
    // Handle date line crossing
    // When longitude crosses 180 degrees, split route into two LineStrings
    const crossesDateLine = allCoords.some((coord, i) => {
      if (i === 0) return false
      const prevLon = allCoords[i - 1][0]
      const currLon = coord[0]
      return Math.abs(currLon - prevLon) > 180
    })

    if (crossesDateLine) {
      // When crossing date line, treat as MultiLineString
      // Split at position where longitude jumps
      const segments: [number, number][][] = []
      let currentSegment: [number, number][] = [allCoords[0]]

      for (let i = 1; i < allCoords.length; i++) {
        const prevLon = allCoords[i - 1][0]
        const currLon = allCoords[i][0]
        
        if (Math.abs(currLon - prevLon) > 180) {
          // Split at position where date line is crossed
          segments.push(currentSegment)
          currentSegment = [allCoords[i]]
        } else {
          currentSegment.push(allCoords[i])
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
        coordinates: allCoords,
      },
    }
  }, [departureData, arrivalData, waypointData])

  // Calculate initial view state (temporary display until fitBounds is executed)
  const initialCenter: [number, number] = useMemo(() => {
    if (!departureData || !arrivalData) return [0, 0]
    
    // Collect coordinates of all airports
    const allAirports = [
      { latitude: departureData.latitude, longitude: departureData.longitude },
      ...waypointData.map(wp => ({ latitude: wp.latitude, longitude: wp.longitude })),
      { latitude: arrivalData.latitude, longitude: arrivalData.longitude },
    ]
    
    // Calculate center point (average of all airports)
    const avgLat = allAirports.reduce((sum, ap) => sum + ap.latitude, 0) / allAirports.length
    const avgLon = allAirports.reduce((sum, ap) => sum + ap.longitude, 0) / allAirports.length
    
    return [avgLon, avgLat]
  }, [departureData, arrivalData, waypointData])

  const initialZoom = useMemo(() => {
    if (!departureData || !arrivalData) return 2
    
    // Calculate total distance
    const allAirports = [
      { latitude: departureData.latitude, longitude: departureData.longitude },
      ...waypointData.map(wp => ({ latitude: wp.latitude, longitude: wp.longitude })),
      { latitude: arrivalData.latitude, longitude: arrivalData.longitude },
    ]
    
    let totalDistance = 0
    for (let i = 0; i < allAirports.length - 1; i++) {
      totalDistance += calculateDistance(allAirports[i], allAirports[i + 1])
    }
    
    // Set initial zoom low (fitBounds will adjust immediately)
    if (totalDistance > 10000) return 2
    if (totalDistance > 5000) return 3
    return 4
  }, [departureData, arrivalData, waypointData])

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

  // Don't display anything if both ICAO codes are not 4 characters
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
        {/* Route Line */}
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

        {/* Departure Airport Marker */}
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

        {/* Waypoint Markers */}
        {waypointData.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            longitude={waypoint.longitude}
            latitude={waypoint.latitude}
            anchor="bottom"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-blue-500 text-white text-xs rounded whitespace-nowrap">
                {waypoint.icao}
              </div>
            </div>
          </Marker>
        ))}

        {/* Arrival Airport Marker */}
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

      {/* Map Control Buttons */}
      {!loading && !error && departureData && arrivalData && (
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          {/* Fit route to view button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fitRouteBounds()
            }}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-md p-2 shadow-lg border border-gray-300 transition-colors"
            title="Fit route to view"
            aria-label="Fit route to view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          {/* Zoom in */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleZoomIn()
            }}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-md p-2 shadow-lg border border-gray-300 transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          {/* Zoom out */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleZoomOut()
            }}
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
