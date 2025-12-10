'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Menu, X, User, LogOut } from 'lucide-react'
import Logo from './Logo'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition">
              Home
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary transition flex items-center">
                About
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  About Us
                </Link>
                <Link href="/about/staff" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Staff
                </Link>
              </div>
            </div>
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary transition flex items-center">
                Operations
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/operations/fleet" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Fleet
                </Link>
                <Link href="/operations/routes" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Routes
                </Link>
                <Link href="/operations/ranks" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Ranks
                </Link>
                <Link href="/operations/special-features" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Special Features
                </Link>
                <Link href="/operations/codeshares" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Codeshares
                </Link>
              </div>
            </div>
            <Link href="/crew-center" className="text-gray-700 hover:text-primary transition">
              Crew Center
            </Link>
            {mounted && !loading && (
              <>
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary transition">
                      <User className="w-5 h-5" />
                      <span>{user.displayName || user.email}</span>
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link href="/crew-center" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut()
                          router.push('/')
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/crew-center/login" className="text-gray-700 hover:text-primary transition">
                    Login
                  </Link>
                )}
              </>
            )}
            <Link href="/apply" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition">
              Apply
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-700">Home</Link>
            <Link href="/about" className="block py-2 text-gray-700">About Us</Link>
            <Link href="/about/staff" className="block py-2 text-gray-700">Staff</Link>
            <Link href="/operations/fleet" className="block py-2 text-gray-700">Fleet</Link>
            <Link href="/operations/routes" className="block py-2 text-gray-700">Routes</Link>
            <Link href="/operations/ranks" className="block py-2 text-gray-700">Ranks</Link>
            <Link href="/crew-center" className="block py-2 text-gray-700">Crew Center</Link>
            <Link href="/apply" className="block py-2 bg-primary text-white rounded-md text-center">Apply</Link>
          </div>
        )}
      </nav>
    </header>
  )
}

