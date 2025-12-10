'use client'

import { Route as RouteIcon, MapPin } from 'lucide-react'

export default function RoutesPage() {
  const popularRoutes = [
    { departure: 'KJFK', arrival: 'EGLL', distance: 5547, time: 420 },
    { departure: 'KLAX', arrival: 'RJTT', distance: 8800, time: 660 },
    { departure: 'EDDF', arrival: 'KJFK', distance: 6200, time: 480 },
    { departure: 'OMDB', arrival: 'EGLL', distance: 5500, time: 420 },
    { departure: 'KJFK', arrival: 'LFPG', distance: 5835, time: 450 },
    { departure: 'KLAX', arrival: 'EGLL', distance: 8750, time: 660 },
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
            <RouteIcon className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
            Our Routes
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
            Explore our extensive route network connecting destinations around the world
          </p>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Popular Routes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularRoutes.map((route, index) => (
                    <div 
                      key={index} 
                      className="relative bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-cyan-400" />
                          <span className="font-semibold text-lg text-white">{route.departure}</span>
                        </div>
                        <RouteIcon className="w-5 h-5 text-cyan-400/50" />
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-cyan-400" />
                          <span className="font-semibold text-lg text-white">{route.arrival}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300 mt-2">
                        <span>Distance: <span className="text-white font-semibold">{route.distance.toLocaleString()} km</span></span>
                        <span>Est. Time: <span className="text-white font-semibold">{route.time} min</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Route Network
                </h2>
                <p className="text-gray-200 mb-6">
                  Our route network spans across continents, connecting major hubs and regional airports worldwide. 
                  From short domestic flights to long-haul international routes, we offer a diverse selection of destinations.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">150+</div>
                    <div className="text-gray-300">Destinations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">50+</div>
                    <div className="text-gray-300">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">300+</div>
                    <div className="text-gray-300">Routes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
                    <div className="text-gray-300">Operations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

