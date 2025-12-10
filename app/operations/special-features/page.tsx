'use client'

import { Award, Package, Crown } from 'lucide-react'

export default function SpecialFeaturesPage() {
  const features = [
    {
      icon: Package,
      title: 'Community Cargo System',
      description: 'Our state-of-the-art Community Cargo System allows pilots to participate in cargo operations, adding an extra layer of realism and engagement to your flight experience.',
      details: [
        'Track cargo deliveries across routes',
        'Earn rewards for successful cargo flights',
        'Compete in cargo delivery challenges',
        'Contribute to community goals',
      ],
    },
    {
      icon: Crown,
      title: 'Amiri Royal Flights',
      description: 'Experience the prestige of operating special royal flights. These exclusive routes offer unique challenges and rewards for our most dedicated pilots.',
      details: [
        'Exclusive route access',
        'Special recognition and badges',
        'Priority support',
        'Invitation to special events',
      ],
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
            Special Features
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100 font-light">
            We offer many unique features to make your experience truly special and unforgettable!
          </p>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div 
                    key={index} 
                    className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:border-cyan-400/60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl"></div>
                    <div className="flex items-start space-x-6 relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-semibold mb-4 text-white">{feature.title}</h2>
                        <p className="text-lg text-gray-200 mb-6">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.details.map((detail, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-cyan-400 mr-2 font-bold">✓</span>
                              <span className="text-gray-200">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-2xl font-semibold mb-4 text-white">More Features Coming Soon</h2>
                <p className="text-gray-200">
                  We are constantly working on new features and improvements to enhance your experience. 
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

