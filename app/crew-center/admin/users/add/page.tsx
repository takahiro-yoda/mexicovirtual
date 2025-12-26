'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Radio
} from 'lucide-react'

export default function AddUserPage() {
  const { user, loading, role } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [infiniteFlightUsername, setInfiniteFlightUsername] = useState('')
  const [callsign, setCallsign] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      // Check if user is admin
      if (!user) {
        router.replace('/crew-center/login')
        return
      }
      
      if (role !== 'admin' && role !== 'owner') {
        router.replace('/crew-center')
        return
      }
    }
  }, [user, loading, role, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: user?.email,
          email,
          password,
          infiniteFlightUsername: infiniteFlightUsername || null,
          callsign: callsign || null,
          role: userRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show detailed error message
        const errorMessage = data.details 
          ? `${data.error}\n\n${data.details}`
          : data.error || 'Failed to create user'
        throw new Error(errorMessage)
      }

      // Verify Firebase user was created
      if (!data.user?.firebaseUid) {
        console.warn('Warning: Firebase user was not created, but Prisma user was created')
      }

      setSuccess(true)
      
      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        router.push('/crew-center/admin?tab=users')
      }, 2000)
    } catch (error: any) {
      console.error('Error creating user:', error)
      setError(error.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (role !== 'admin' && role !== 'owner')) {
    return null
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/crew-center/admin?tab=users"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New User</h1>
            <p className="text-gray-600">Create a new user account</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm whitespace-pre-line font-mono text-xs bg-red-100 p-3 rounded border border-red-300 overflow-auto max-h-96">
                  {error}
                </div>
                {error.includes('FIREBASE_SERVICE_ACCOUNT_KEY') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
                    <strong>Quick Setup:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                      <li>Project Settings → Service Accounts → Generate new private key</li>
                      <li>Copy the JSON content</li>
                      <li>Add to <code className="bg-blue-100 px-1 rounded">.env.local</code>: <code className="bg-blue-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT_KEY=&apos;[JSON]&apos;</code></li>
                      <li>Restart the dev server</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start space-x-3 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm block">User created successfully! Redirecting to admin dashboard...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-400 focus:text-gray-900 focus:bg-white focus:outline-none"
                  placeholder="user@example.com"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-400 focus:text-gray-900 focus:bg-white focus:outline-none"
                  placeholder="At least 6 characters"
                  minLength={6}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-400 focus:text-gray-900 focus:bg-white focus:outline-none"
                  placeholder="Confirm your password"
                  minLength={6}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="infiniteFlightUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Infinite Flight Username (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="infiniteFlightUsername"
                  type="text"
                  value={infiniteFlightUsername}
                  onChange={(e) => setInfiniteFlightUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-400 focus:text-gray-900 focus:bg-white focus:outline-none"
                  placeholder="IFUsername"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="callsign" className="block text-sm font-medium text-gray-700 mb-2">
                Callsign (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Radio className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="callsign"
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-400 focus:text-gray-900 focus:bg-white focus:outline-none"
                  placeholder="ABC123"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-white focus:text-gray-900 focus:bg-white focus:outline-none"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  <option value="user">User</option>
                  {role === 'owner' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </>
                  )}
                </select>
              </div>
              {role !== 'owner' && userRole !== 'user' && (
                <p className="mt-1 text-sm text-yellow-600">
                  Only owners can create admin or owner accounts
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating user...' : success ? 'User created!' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


