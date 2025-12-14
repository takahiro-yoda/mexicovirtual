'use client'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

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
      let userCredential

      if (isFirstLogin) {
        // First login flow: get custom token and sign in
        console.log('Attempting first login with email:', email)
        
        // Get custom token from API
        const response = await fetch('/api/auth/first-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get login token')
        }

        const { customToken } = await response.json()
        
        // Sign in with custom token
        userCredential = await signInWithCustomToken(auth, customToken)
        console.log('✅ First login successful:', userCredential.user.email)
      } else {
        // Regular login flow
        console.log('Attempting to sign in with email:', email)
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log('✅ Login successful:', userCredential.user.email)
      }
      
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
      
      // Check if password setup or change is required
      try {
        const idTokenResult = await userCredential.user.getIdTokenResult()
        if (idTokenResult.claims.mustSetPassword === true) {
          // Redirect to password setup page
          router.push('/crew-center/set-password')
          return
        } else if (idTokenResult.claims.mustChangePassword === true) {
          // Redirect to password change page
          router.push('/crew-center/change-password')
          return
        }
      } catch (error) {
        console.error('Error checking custom claims:', error)
        // Continue to normal redirect if check fails
      }
      
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
      if (error.message && error.message.includes('not eligible for first login')) {
        setError('This account is not eligible for first login. Please use regular login with your password.')
      } else if (error.message && error.message.includes('User not found')) {
        setError('No account found with this email address. Please check your email or contact support.')
      } else if (error.code === 'auth/user-not-found') {
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#003366' }}>
      {/* Neon background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 p-8 md:p-12">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-block">
              <Image
                src="/AMVA-Logo.png"
                alt="MexicoVirtual Logo"
                width={100}
                height={100}
                className="object-contain mx-auto"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Not registered yet?{' '}
            <button
              type="button"
              onClick={() => router.push('/crew-center/register')}
              className="text-cyan-500 font-semibold hover:text-cyan-400 transition-colors"
            >
              Sign up
            </button>
          </p>

          {/* First Login Toggle */}
          <div className="mb-6 flex items-center justify-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFirstLogin}
                onChange={(e) => {
                  setIsFirstLogin(e.target.checked)
                  setPassword('') // Clear password when switching modes
                  setError('') // Clear errors
                }}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-400 focus:ring-2"
              />
              <span className="text-sm text-gray-600 flex items-center">
                <UserPlus className="w-4 h-4 mr-1" />
                First time login (password not set yet)
              </span>
            </label>
          </div>

          {error && (
            <div className="mb-6">
              <div className="p-4 bg-red-50/80 border border-red-300/50 rounded-lg flex items-start space-x-3 text-red-700 shadow-lg shadow-red-500/10">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm block">{error}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-400 focus:ring-0 text-gray-900 bg-white/50 placeholder:text-gray-400 focus:outline-none transition-all neon-input"
                  placeholder="Email Address"
                  style={{ 
                    color: '#111827',
                    boxShadow: email ? '0 0 8px rgba(6, 182, 212, 0.1)' : 'none'
                  }}
                />
              </div>
            </div>

            {!isFirstLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-400 focus:ring-0 text-gray-900 bg-white/50 placeholder:text-gray-400 focus:outline-none transition-all neon-input"
                  placeholder="Password"
                  style={{ 
                    color: '#111827',
                    boxShadow: password ? '0 0 8px rgba(6, 182, 212, 0.1)' : 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {isFirstLogin && (
              <div className="bg-blue-50/80 border border-blue-200/50 rounded-lg p-4 text-sm text-blue-700">
                <p className="flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Enter your email address to log in for the first time. You will be asked to set a password after logging in.</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-cyan-500 disabled:hover:to-blue-500"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isFirstLogin ? 'Logging in...' : 'Signing in...'}
                </span>
              ) : (
                isFirstLogin ? 'Log In (First Time)' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Forgotten your password?{' '}
              <Link href="/crew-center/forgot-password" className="text-cyan-500 font-semibold hover:text-cyan-400 transition-colors">
                Get help
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
