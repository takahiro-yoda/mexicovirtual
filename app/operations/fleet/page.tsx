'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plane, ChevronDown, ChevronUp } from 'lucide-react'

export default function FleetPage() {
  const [expandedAircraft, setExpandedAircraft] = useState<string | null>(null)

  // Dreamliner aircraft (display on top)
  const dreamlinerAircraft = [
    {
      name: 'Boeing 787-9 Dreamliner',
      type: 'Wide-body',
      manufacturer: 'Boeing',
      fleetCount: 14,
      seats: 274,
      range: 14140,
      speed: 903,
      machSpeed: 0.85, // Typical cruise speed at altitude
      image: '/fleet/787-9 Lateral.avif',
      description: 'The flagship of Aeromexico\'s long-haul fleet, the 787-9 Dreamliner offers the ultimate in comfort and technology for intercontinental travel.',
      features: [
        '36 Clase Premier seats with flat-bed reclining (60" pitch, 20" width)',
        'Espacio Premier self-service bar',
        '238 Economy seats (35-36" pitch, 17.2" width)',
        'Larger windows with push-button dimmers',
        'Wider seatback touchscreens',
        'Dynamic LED lighting',
        'Espacio Premier lounge area',
      ],
    },
    {
      name: 'Boeing 787-8 Dreamliner',
      type: 'Wide-body',
      manufacturer: 'Boeing',
      fleetCount: 8,
      seats: 243,
      range: 13621,
      speed: 903,
      machSpeed: 0.85, // Typical cruise speed at altitude
      image: '/fleet/787-8 Lateral.avif',
      description: 'The Boeing 787-8 Dreamliner brings long-haul comfort to Aeromexico\'s international routes with advanced technology and passenger-focused design.',
      features: [
        '32 Business Class seats (60" pitch, 20" width)',
        '211 Economy seats (31-34" pitch, 17.2" width)',
        'Larger windows with electronic dimming',
        'Improved cabin pressure and humidity',
        'Dynamic LED lighting',
        'Advanced air filtration system',
      ],
    },
  ]

  // Other aircraft (display on bottom)
  const otherAircraft = [
    {
      name: 'Boeing 737 MAX 8',
      type: 'Narrow-body',
      manufacturer: 'Boeing',
      fleetCount: 45,
      seats: 172,
      range: 6570,
      speed: 840,
      machSpeed: 0.79, // Typical cruise speed at altitude
      image: '/fleet/737-8 MAX Lateral.avif',
      description: 'The Boeing 737 MAX 8 represents the latest in narrow-body aircraft technology, offering improved fuel efficiency and passenger comfort.',
      features: [
        '16 Business Class seats (38" pitch, 21" width)',
        '18 Premium Economy seats (34" pitch)',
        '138 Economy seats (30-31" pitch, 17" width)',
        'Enhanced fuel efficiency',
        'Quieter cabin with advanced sound dampening',
        'Larger overhead bins',
      ],
    },
    {
      name: 'Boeing 737-800',
      type: 'Narrow-body',
      manufacturer: 'Boeing',
      fleetCount: 34,
      seats: 172,
      range: 5575,
      speed: 840,
      machSpeed: 0.785, // Typical cruise speed at altitude (similar to 737 MAX 8)
      image: '/fleet/737-8 MAX Lateral.avif',
      description: 'The Boeing 737-800 is a workhorse of Aeromexico\'s fleet, serving both domestic and international routes with proven reliability and efficiency.',
      features: [
        '16 Business Class seats (38" pitch)',
        '18 Premium Economy seats (34" pitch)',
        '138 Economy seats (30-32" pitch)',
        'Wide-body comfort in a narrow-body aircraft',
        'Advanced avionics and fuel efficiency',
        'Proven reliability on short and medium-haul routes',
      ],
    },
    {
      name: 'Embraer 190',
      type: 'Regional Jet',
      manufacturer: 'Embraer',
      fleetCount: 35,
      seats: 99,
      range: 4445,
      speed: 890,
      machSpeed: 0.82, // Maximum cruise speed at altitude
      image: '/fleet/Aeromexico E190 Lateral.avif',
      description: 'Aeromexico Connect operates the Embraer 190 on short to medium-haul domestic and regional routes, serving as feeders to Aeromexico\'s main hubs.',
      features: [
        '11 Clase Premier seats',
        '88 Economy seats',
        'Viasat Wi-Fi connectivity (retrofit program in progress)',
        'Optimized for regional routes',
      ],
    },
  ]

  const allAircraft = [...dreamlinerAircraft, ...otherAircraft]
  const totalAircraft = allAircraft.reduce((sum, a) => sum + a.fleetCount, 0)

  const toggleExpand = (aircraftName: string) => {
    setExpandedAircraft(expandedAircraft === aircraftName ? null : aircraftName)
  }

  const AircraftCard = ({ aircraftItem, index }: { aircraftItem: typeof allAircraft[0], index: number }) => (
    <div 
      className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:border-blue-500/50 hover:-translate-y-1"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Aircraft Image - Transparent background */}
      <div className="h-56 md:h-64 relative overflow-visible bg-transparent">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative" style={{ width: '60%', height: '60%', minHeight: '200px' }}>
            <Image
              src={aircraftItem.image}
              alt={`${aircraftItem.name} aircraft - Aeromexico fleet`}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 60vw, 30vw"
              priority={index < 2}
              quality={95}
              unoptimized={false}
            />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 md:p-8 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1 text-white">{aircraftItem.name}</h3>
            <p className="text-blue-400 mb-2 font-medium text-sm md:text-base">{aircraftItem.manufacturer} • {aircraftItem.type}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-700/50">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{aircraftItem.seats}</div>
            <div className="text-xs text-gray-400">Seats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{(aircraftItem.range / 1000).toFixed(1)}k</div>
            <div className="text-xs text-gray-400">Range (km)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{aircraftItem.machSpeed.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Mach</div>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => toggleExpand(aircraftItem.name)}
          className="w-full flex items-center justify-between text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium mb-2 py-2"
        >
          <span>{expandedAircraft === aircraftItem.name ? 'Hide Details' : 'Show Details'}</span>
          {expandedAircraft === aircraftItem.name ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedAircraft === aircraftItem.name && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 animate-fadeIn">
            <p className="text-sm text-gray-300 leading-relaxed">
              {aircraftItem.description}
            </p>
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {aircraftItem.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center justify-center mb-6">
            <Plane className="w-14 h-14 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Our Fleet
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-gray-200 font-light">
            Our fleet features a diverse range of aircraft, from regional jets to long-haul wide-bodies, including <span className="text-blue-400 font-semibold">{allAircraft.length} types</span> of aircraft.
          </p>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-base md:text-lg text-gray-300 mb-12">
              Whether it&apos;s a short regional flight or a long-haul international journey, we have the perfect aircraft for every route.
            </p>

            {/* Dreamliner Section (Top) */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {dreamlinerAircraft.map((aircraftItem, index) => (
                  <AircraftCard key={index} aircraftItem={aircraftItem} index={index} />
                ))}
              </div>
            </div>

            {/* Other Aircraft Section (Bottom) */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {otherAircraft.map((aircraftItem, index) => (
                  <AircraftCard key={index} aircraftItem={aircraftItem} index={index + dreamlinerAircraft.length} />
                ))}
              </div>
            </div>

            {/* Copyright Notice */}
            <div className="mt-12 pt-8 border-t border-slate-700/30">
              <p className="text-xs text-gray-500 text-center">
                Aircraft images © Aeromexico. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
