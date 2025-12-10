'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plane, Users, Clock, Award, Route, Star } from 'lucide-react'

export default function Home() {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const [heroAnimated, setHeroAnimated] = useState(false)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    // Hero section animation on mount
    const timer = setTimeout(() => {
      setHeroAnimated(true)
    }, 100)

    const observers: IntersectionObserver[] = []

    Object.keys(sectionRefs.current).forEach((key) => {
      const element = sectionRefs.current[key]
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [key]: true }))
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      clearTimeout(timer)
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const setRef = (key: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[key] = el
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <Image
            src="/hero-background.jpg"
            alt="Hero background"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span 
              className={`inline-block transition-all duration-1000 ease-out ${
                heroAnimated
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: '200ms',
              }}
            >
              The Home of
            </span>
            <br />
            <span 
              className={`inline-block text-white transition-all duration-1000 ease-out ${
                heroAnimated
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-12 scale-90'
              }`}
              style={{
                transitionDelay: '600ms',
                textShadow: heroAnimated 
                  ? '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3), 0 0 40px rgba(147, 51, 234, 0.2)' 
                  : 'none',
                filter: heroAnimated ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
              }}
            >
              Excellence
            </span>
          </h1>
          <p 
            className={`text-2xl md:text-3xl mb-8 font-light tracking-wider transition-all duration-1500 ease-out ${
              heroAnimated
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
            style={{
              transitionDelay: '1000ms',
              letterSpacing: '0.15em',
            }}
          >
            YOUR JOURNEY STARTS HERE
          </p>
          <div 
            className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1500 ease-out ${
              heroAnimated
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
            style={{
              transitionDelay: '1000ms',
            }}
          >
            <Link 
              href="/apply"
              className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-5 rounded-lg text-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-[1.05] flex items-center justify-center space-x-2 group"
            >
              <span>Apply Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/crew-center"
              className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-lg text-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-[1.05] flex items-center justify-center space-x-2 group"
            >
              <span>Crew Center</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            ref={setRef('why-join-title')}
            className={`transition-all duration-1000 ${
              isVisible['why-join-title']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Why Join Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              ref={setRef('why-join-1')}
              className={`bg-white p-6 rounded-lg shadow-md text-center transition-all duration-1000 delay-100 ${
                isVisible['why-join-1']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Supportive Community</h3>
              <p className="text-gray-700">
                Join a community of aviation enthusiasts who are always ready to help and share their passion.
              </p>
            </div>
            <div
              ref={setRef('why-join-2')}
              className={`bg-white p-6 rounded-lg shadow-md text-center transition-all duration-1000 delay-200 ${
                isVisible['why-join-2']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Skill Development</h3>
              <p className="text-gray-700">
                Develop your flying skills through our comprehensive training programs and structured progression system.
              </p>
            </div>
            <div
              ref={setRef('why-join-3')}
              className={`bg-white p-6 rounded-lg shadow-md text-center transition-all duration-1000 delay-300 ${
                isVisible['why-join-3']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Route className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Expansive Routes</h3>
              <p className="text-gray-700">
                Explore the world virtually through our extensive route network covering destinations worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div
            ref={setRef('features-title')}
            className={`transition-all duration-1000 ${
              isVisible['features-title']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              What We Offer
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Fleet */}
            <div
              ref={setRef('feature-1')}
              className={`transition-all duration-1000 delay-100 flex ${
                isVisible['feature-1']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Link href="/operations/fleet" className="group block w-full flex flex-col">
                <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/60 shadow-lg shadow-cyan-200/20 hover:shadow-cyan-300/30 transition-all duration-300 hover:border-cyan-400/80 flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
                  <div className="relative flex-1 flex flex-col">
                    <Plane className="w-16 h-16 text-cyan-600 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Fleet</h3>
                    <p className="text-gray-700 mb-4 flex-1">
                      Our fleet features a diverse range of aircraft, from small to large, including 9 types of aircraft. 
                      Whether it&apos;s a short or long haul flight, we have a plane to accommodate every virtual journey.
                    </p>
                    <span className="text-cyan-600 font-semibold group-hover:text-cyan-700 group-hover:underline transition-colors">View Fleet →</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Ranks */}
            <div
              ref={setRef('feature-2')}
              className={`transition-all duration-1000 delay-200 flex ${
                isVisible['feature-2']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Link href="/operations/ranks" className="group block w-full flex flex-col">
                <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/60 shadow-lg shadow-cyan-200/20 hover:shadow-cyan-300/30 transition-all duration-300 hover:border-cyan-400/80 flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
                  <div className="relative flex-1 flex flex-col">
                    <Star className="w-16 h-16 text-cyan-600 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Ranks</h3>
                    <p className="text-gray-700 mb-4 flex-1">
                  Our ranking system reflects the growth and experience of our virtual pilots, with promotions earned 
                  through skill, dedication, and successful completion of flights.
                </p>
                    <span className="text-cyan-600 font-semibold group-hover:text-cyan-700 group-hover:underline transition-colors">View Ranks →</span>
                  </div>
              </div>
            </Link>
            </div>

            {/* Routes */}
            <div
              ref={setRef('feature-3')}
              className={`transition-all duration-1000 delay-300 flex ${
                isVisible['feature-3']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Link href="/operations/routes" className="group block w-full flex flex-col">
                <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/60 shadow-lg shadow-cyan-200/20 hover:shadow-cyan-300/30 transition-all duration-300 hover:border-cyan-400/80 flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
                  <div className="relative flex-1 flex flex-col">
                    <Route className="w-16 h-16 text-cyan-600 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Routes</h3>
                    <p className="text-gray-700 mb-4 flex-1">
                  Explore our extensive route network connecting destinations around the world. 
                  From short domestic flights to long-haul international routes.
                </p>
                    <span className="text-cyan-600 font-semibold group-hover:text-cyan-700 group-hover:underline transition-colors">View Routes →</span>
                  </div>
              </div>
            </Link>
            </div>

            {/* Special Features */}
            <div
              ref={setRef('feature-4')}
              className={`transition-all duration-1000 delay-400 flex ${
                isVisible['feature-4']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Link href="/operations/special-features" className="group block w-full flex flex-col">
                <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/60 shadow-lg shadow-cyan-200/20 hover:shadow-cyan-300/30 transition-all duration-300 hover:border-cyan-400/80 flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
                  <div className="relative flex-1 flex flex-col">
                    <Award className="w-16 h-16 text-cyan-600 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Special Features</h3>
                    <p className="text-gray-700 mb-4 flex-1">
                  We offer many unique features to make your experience truly special and unforgettable! 
                  Including our state-of-the-art Community Cargo System and Amiri Royal Flights.
                </p>
                    <span className="text-cyan-600 font-semibold group-hover:text-cyan-700 group-hover:underline transition-colors">Learn More →</span>
                  </div>
              </div>
            </Link>
            </div>

            {/* Codeshares */}
            <div
              ref={setRef('feature-5')}
              className={`transition-all duration-1000 delay-500 flex ${
                isVisible['feature-5']
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Link href="/operations/codeshares" className="group block w-full flex flex-col">
                <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-cyan-300/60 shadow-lg shadow-cyan-200/20 hover:shadow-cyan-300/30 transition-all duration-300 hover:border-cyan-400/80 flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-purple-100/30 rounded-2xl"></div>
                  <div className="relative flex-1 flex flex-col">
                    <Plane className="w-16 h-16 text-cyan-600 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Codeshares</h3>
                    <p className="text-gray-700 mb-4 flex-1">
                  We love codeshares, and we have plenty of them! Our already large codeshare network is always expanding, 
                  allowing you to explore every part of the world virtually.
                </p>
                    <span className="text-cyan-600 font-semibold group-hover:text-cyan-700 group-hover:underline transition-colors">View Codeshares →</span>
                  </div>
              </div>
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div
            ref={setRef('stats-title')}
            className={`transition-all duration-1000 ${
              isVisible['stats-title']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
          <h2 className="text-4xl font-bold text-center mb-12">Our Statistics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div
              ref={setRef('stat-1')}
              className={`text-center transition-all duration-1000 delay-100 ${
                isVisible['stat-1']
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">1,234</div>
              <div className="text-gray-300">Total Pilots</div>
            </div>
            <div
              ref={setRef('stat-2')}
              className={`text-center transition-all duration-1000 delay-200 ${
                isVisible['stat-2']
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Plane className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">56,789</div>
              <div className="text-gray-300">Total Flights</div>
            </div>
            <div
              ref={setRef('stat-3')}
              className={`text-center transition-all duration-1000 delay-300 ${
                isVisible['stat-3']
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">123,456</div>
              <div className="text-gray-300">Flight Hours</div>
            </div>
            <div
              ref={setRef('stat-4')}
              className={`text-center transition-all duration-1000 delay-400 ${
                isVisible['stat-4']
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">456</div>
              <div className="text-gray-300">Active Pilots</div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Today Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div
            ref={setRef('apply-title')}
            className={`transition-all duration-1000 ${
              isVisible['apply-title']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to start your journey?</h2>
          </div>
          <div
            ref={setRef('apply-requirements')}
            className={`max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-200 ${
              isVisible['apply-requirements']
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Requirements:</h3>
            <ul className="text-left space-y-2 text-gray-800">
              <li className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                Be at least 13 years old
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                Be able to communicate in English
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                Be at least Grade 3 in Infinite Flight
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                Have a Discord and an Infinite Flight Community account
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                Not blacklisted by IFVARB
              </li>
            </ul>
          </div>
          <div
            ref={setRef('apply-button')}
            className={`transition-all duration-1000 delay-400 ${
              isVisible['apply-button']
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
          <Link 
            href="/apply"
              className="inline-block relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transform hover:scale-[1.05]"
          >
            Apply Today
          </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

