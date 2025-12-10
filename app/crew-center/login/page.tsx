'use client'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Paintbrush } from 'lucide-react'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Firebase config check (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }
      const hasConfig = config.apiKey && config.authDomain && config.projectId
      if (!hasConfig) {
        console.warn('⚠️ Firebase configuration is incomplete. Please check your environment variables.')
        console.warn('Missing:', {
          apiKey: !config.apiKey,
          authDomain: !config.authDomain,
          projectId: !config.projectId,
        })
      } else {
        console.log('✅ Firebase configuration loaded:', {
          authDomain: config.authDomain,
          projectId: config.projectId,
          apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
        })
        console.log('📋 To create a user:')
        console.log('   1. Go to Firebase Console > Authentication > Users > Add user')
        console.log('   2. Or use the registration page: /crew-center/register')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('Attempting to sign in with email:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful:', userCredential.user.email)
      
      // Wait for auth state to be updated in the context
      // This ensures the AuthProvider has processed the auth state change
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && user.uid === userCredential.user.uid) {
            unsubscribe()
            // Additional small delay to ensure context state is updated
            setTimeout(() => {
              resolve()
            }, 200)
          }
        })
      })
      
      // Success - redirect to crew center
      router.push('/crew-center')
    } catch (error: any) {
      console.error('❌ Login error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Attempted email:', email)
      
      // Additional debugging for invalid-credential
      if (error.code === 'auth/invalid-credential') {
        console.error('🔍 Troubleshooting steps:')
        console.error('   1. Check if user exists in Firebase Console > Authentication > Users')
        console.error('   2. Verify Email/Password is enabled in Firebase Authentication settings')
        console.error('   3. Make sure the password is correct')
        console.error('   4. Try creating a new account at /crew-center/register')
      }
      setIsLoading(false)
      
      // Error handling with more detailed messages
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please register first or check your email.')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please check your password and try again.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format. Please enter a valid email.')
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.')
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.')
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled. Please check Firebase Authentication settings.')
      } else if (error.code === 'auth/configuration-not-found') {
        setError('Firebase configuration error. Please check your environment variables.')
      } else if (error.code === 'auth/app-not-authorized') {
        setError('Firebase app is not authorized. Please check your Firebase configuration.')
      } else {
        setError(`Login failed: ${error.message || error.code || 'An unknown error occurred. Please check the console for details.'}`)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#003366' }}>
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Section - Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="mb-6">
                <Image
                  src="/AMVA-Logo.png"
                  alt="MexicoVirtual Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8">
              Not registered yet?{' '}
              <button
                type="button"
                onClick={() => router.push('/crew-center/register')}
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>

            {error && (
              <div className="mb-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm block">{error}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-900 bg-transparent placeholder:text-gray-400 focus:outline-none"
                  placeholder="Email Address"
                  style={{ color: '#111827' }}
                />
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-900 bg-transparent placeholder:text-gray-400 focus:outline-none"
                  placeholder="Password"
                  style={{ color: '#111827' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Forgotten your password?{' '}
                <Link href="/crew-center/forgot-password" className="text-primary font-semibold hover:underline">
                  Get help
                </Link>
              </p>
            </div>
          </div>

          {/* Right Section - Decorative Panel */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden p-8 md:p-12 flex flex-col items-center justify-center">
            {/* Abstract Shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-indigo-300 rounded-full opacity-40"></div>
              <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-400 rounded-full opacity-50"></div>
              <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-200 rounded-full opacity-30"></div>
              <div className="absolute bottom-32 right-1/4 w-14 h-14 bg-blue-300 rounded-full opacity-40"></div>
              
              {/* Triangles */}
              <div className="absolute top-20 right-1/3 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-blue-300 opacity-30"></div>
              <div className="absolute bottom-40 left-1/4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-indigo-300 opacity-40"></div>
              
              {/* Squares */}
              <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-blue-200 rotate-45 opacity-30"></div>
              <div className="absolute bottom-1/4 right-1/3 w-12 h-12 bg-indigo-300 rotate-45 opacity-40"></div>
            </div>

            {/* Paintbrush Icon */}
            <div className="relative z-10 mb-6">
              <Paintbrush className="w-24 h-24 text-blue-900" />
            </div>

            {/* Message */}
            <p className="text-xl font-semibold text-blue-900 relative z-10">
              Customize it as you like
            </p>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
