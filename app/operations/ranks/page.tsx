'use client'

import { Star, Award } from 'lucide-react'

export default function RanksPage() {
  const ranks = [
    {
      name: 'Trainee',
      level: 1,
      flightTime: 0,
      flights: 0,
      description: 'Starting your journey with MexicoVirtual',
    },
    {
      name: 'Second Officer',
      level: 2,
      flightTime: 10,
      flights: 5,
      description: 'Completed initial training and first flights',
    },
    {
      name: 'First Officer',
      level: 3,
      flightTime: 50,
      flights: 25,
      description: 'Gained experience and confidence',
    },
    {
      name: 'Senior First Officer',
      level: 4,
      flightTime: 200,
      flights: 100,
      description: 'Demonstrated consistent performance',
    },
    {
      name: 'Captain',
      level: 5,
      flightTime: 500,
      flights: 250,
      description: 'Achieved mastery in flight operations',
    },
    {
      name: 'Senior Captain',
      level: 6,
      flightTime: 1000,
      flights: 500,
      description: 'Elite status with extensive experience',
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
            <Award className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
            Ranks
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
            Our ranking system reflects the growth and experience of our virtual pilots
          </p>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-lg text-gray-100 mb-12">
              Promotions are earned through skill, dedication, and successful completion of flights. 
              Join us on the journey to reach the top ranks.
            </p>

            <div className="space-y-6">
              {ranks.map((rank, index) => (
                <div 
                  key={index} 
                  className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:border-cyan-400/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center">
                          <Award className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white">{rank.name}</h3>
                          <p className="text-cyan-300">Level {rank.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(rank.level)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-200 mb-4">{rank.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyan-500/30">
                      <div>
                        <span className="text-gray-300">Required Flight Time:</span>
                        <span className="font-semibold ml-2 text-white">{rank.flightTime} hours</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Required Flights:</span>
                        <span className="font-semibold ml-2 text-white">{rank.flights}</span>
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

