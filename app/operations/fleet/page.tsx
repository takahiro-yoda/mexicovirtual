'use client'

import { Plane } from 'lucide-react'

export default function FleetPage() {
  const aircraft = [
    {
      name: 'Boeing 737-800',
      type: 'Narrow-body',
      manufacturer: 'Boeing',
      seats: 189,
      range: 5765,
      speed: 840,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
    {
      name: 'Airbus A320',
      type: 'Narrow-body',
      manufacturer: 'Airbus',
      seats: 180,
      range: 6150,
      speed: 840,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
    {
      name: 'Boeing 777-300ER',
      type: 'Wide-body',
      manufacturer: 'Boeing',
      seats: 396,
      range: 14694,
      speed: 905,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
    {
      name: 'Airbus A350-900',
      type: 'Wide-body',
      manufacturer: 'Airbus',
      seats: 325,
      range: 15000,
      speed: 903,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
    {
      name: 'Boeing 787-9',
      type: 'Wide-body',
      manufacturer: 'Boeing',
      seats: 290,
      range: 14140,
      speed: 903,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
    {
      name: 'Airbus A380',
      type: 'Wide-body',
      manufacturer: 'Airbus',
      seats: 555,
      range: 15200,
      speed: 903,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    },
  ]

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <section className="relative py-32 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center justify-center mb-6">
            <Plane className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
            Our Fleet
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
            Our fleet features a diverse range of aircraft, from small to large, including <span className="text-cyan-300 font-semibold">{aircraft.length} types</span> of aircraft.
          </p>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-lg text-gray-100 mb-12">
              Whether it&apos;s a short or long haul flight, we have a plane to accommodate every virtual journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aircraft.map((aircraft, index) => (
                <div 
                  key={index} 
                  className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:border-cyan-400/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
                  <div className="h-48 bg-gray-900/50 relative flex items-center justify-center">
                    <Plane className="w-24 h-24 text-cyan-400/50" />
                  </div>
                  <div className="p-6 relative">
                    <h3 className="text-2xl font-semibold mb-2 text-white">{aircraft.name}</h3>
                    <p className="text-cyan-300 mb-4 font-medium">{aircraft.manufacturer} • {aircraft.type}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Seats:</span>
                        <span className="font-semibold text-white">{aircraft.seats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Range:</span>
                        <span className="font-semibold text-white">{aircraft.range.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cruise Speed:</span>
                        <span className="font-semibold text-white">{aircraft.speed} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

