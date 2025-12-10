'use client'

import { Plane } from 'lucide-react'

export default function CodesharesPage() {
  const codeshares = [
    { name: 'Virtual Airlines Alliance', logo: 'VAA', description: 'Global partnership network' },
    { name: 'Sky Virtual', logo: 'SKY', description: 'Regional partnership' },
    { name: 'World Virtual Airlines', logo: 'WVA', description: 'International codeshare' },
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
            Codeshares
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
            We love codeshares, and we have plenty of them!
          </p>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-lg text-gray-100 mb-12">
              Our already large codeshare network is always expanding, allowing you to explore every part of the world virtually with MexicoVirtual.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {codeshares.map((partner, index) => (
                <div 
                  key={index} 
                  className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 text-center border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:border-cyan-400/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl"></div>
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Plane className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{partner.name}</h3>
                    <p className="text-gray-200">{partner.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Benefits of Codeshares
                </h2>
                <ul className="space-y-3 text-gray-200">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2 font-bold">✓</span>
                    <span>Access to expanded route networks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2 font-bold">✓</span>
                    <span>More destination options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2 font-bold">✓</span>
                    <span>Cross-airline recognition</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2 font-bold">✓</span>
                    <span>Joint events and challenges</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

