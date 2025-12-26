'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft,
  User,
  Clock,
  Plane,
  Calendar,
  MapPin,
  Award,
  Shield,
  Mail,
  Save,
  Edit
} from 'lucide-react'
import { isAdmin } from '@/lib/permissions'
import Link from 'next/link'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: string
  callsign?: string | null
  rank?: string | null
  createdAt: string
  lastLogin: string | null
}

export default function PilotDetailPage() {
  const { user: currentUser, loading, role } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.userId as string
  const userEmail = searchParams.get('email')
  
  const [pilotData, setPilotData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pilotCallsign, setPilotCallsign] = useState('')
  const [transferHours, setTransferHours] = useState(0)
  const [transferHoursInput, setTransferHoursInput] = useState('')
  const [transferMinutes, setTransferMinutes] = useState(0)
  const [transferMinutesInput, setTransferMinutesInput] = useState('')
  const [flightTimeMinutes, setFlightTimeMinutes] = useState(0)
  const [isStaff, setIsStaff] = useState(false)
  const [hasOwnerPermission, setHasOwnerPermission] = useState(false)
  const [isExecutive, setIsExecutive] = useState(false)
  const [isSavingCallsign, setIsSavingCallsign] = useState(false)
  const [isAddingHours, setIsAddingHours] = useState(false)
  const [pilotEmail, setPilotEmail] = useState<string | null>(null) // Store pilot email separately
  const [staffRole, setStaffRole] = useState('') // Staff role/title
  const [isSavingRole, setIsSavingRole] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const loadPilotData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use email from query parameter if available, otherwise use currentUser email or generate one
      const email = userEmail || (userId === currentUser?.uid ? currentUser.email : null) || `user-${userId.substring(0, 8)}@example.com`
      
      // Try to load user data from Prisma by email or userId
      let userDataFromPrisma = null
      try {
        // First try by email
        if (email) {
          const userResponse = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`)
          if (userResponse.ok) {
            userDataFromPrisma = await userResponse.json()
          }
        }
        
        // If not found by email, try by userId (might be Prisma ID)
        if (!userDataFromPrisma) {
          try {
            const userResponse = await fetch(`/api/users/${userId}`)
            if (userResponse.ok) {
              userDataFromPrisma = await userResponse.json()
            }
          } catch (error) {
            // Ignore error, userId might be Firebase UID
          }
        }
      } catch (error) {
        console.error('Error loading user from Prisma:', error)
      }
      
      // Use Prisma data if available, otherwise use mock data
      const userData: UserData = userDataFromPrisma ? {
        uid: userId,
        email: userDataFromPrisma.email || email,
        displayName: userDataFromPrisma.displayName || userDataFromPrisma.infiniteFlightUsername || (userId === currentUser?.uid ? currentUser.displayName : `User ${userId.substring(0, 8)}`),
        role: userDataFromPrisma.role || (userId === currentUser?.uid ? (role || 'user') : 'user'),
        callsign: userDataFromPrisma.callsign || null,
        rank: userDataFromPrisma.rank || null,
        createdAt: userDataFromPrisma.createdAt || (userId === currentUser?.uid 
          ? (currentUser.metadata.creationTime || new Date().toISOString())
          : new Date().toISOString()),
        lastLogin: userDataFromPrisma.lastLoginAt || (userId === currentUser?.uid 
          ? (currentUser.metadata.lastSignInTime || null)
          : null),
      } : {
        uid: userId,
        email: email,
        displayName: userId === currentUser?.uid ? currentUser.displayName : `User ${userId.substring(0, 8)}`,
        role: userId === currentUser?.uid ? (role || 'user') : 'user',
        callsign: null,
        rank: null,
        createdAt: userId === currentUser?.uid 
          ? (currentUser.metadata.creationTime || new Date().toISOString())
          : new Date().toISOString(),
        lastLogin: userId === currentUser?.uid 
          ? (currentUser.metadata.lastSignInTime || null)
          : null,
      }
      
      setPilotData(userData)
      setPilotEmail(userData.email) // Store email separately for API calls
      setPilotCallsign(userData.callsign || '')
      setDisplayName(userData.displayName || '')
      setEmail(userData.email || '')
      setIsStaff(userData.role === 'admin' || userData.role === 'owner')
      setHasOwnerPermission(userData.role === 'owner')
      setIsExecutive(false) // TODO: Load from actual data source
      setStaffRole(userData.rank || '') // Load staff role from rank field
      
      // Load flight time from API
      // userId could be Firebase UID or Prisma User ID
      // If we have email, use it to find the user; otherwise try userId directly
      try {
        const apiUrl = userData.email 
          ? `/api/users/by-email/${encodeURIComponent(userData.email)}/statistics`
          : `/api/users/${userId}/statistics`
        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          setFlightTimeMinutes(data.totalFlightTimeMinutes || 0)
        } else {
          console.error('Failed to load flight time:', response.status, response.statusText)
          setFlightTimeMinutes(0)
        }
      } catch (error) {
        console.error('Error loading flight time:', error)
        setFlightTimeMinutes(0)
      }
    } catch (error) {
      console.error('Error loading pilot data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userEmail, userId, currentUser, role])

  useEffect(() => {
    console.log('PilotDetailPage - userId:', userId)
    console.log('PilotDetailPage - params:', params)
    console.log('PilotDetailPage - userEmail from query:', userEmail)
    console.log('PilotDetailPage - currentUser email:', currentUser?.email)
  }, [userId, params, userEmail, currentUser])

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/crew-center/login')
      return
    }
    
    if (!loading && currentUser && !isAdmin(role)) {
      router.push('/crew-center')
      return
    }

    // Load pilot data
    if (currentUser && userId && isAdmin(role)) {
      loadPilotData()
    }
  }, [currentUser, loading, role, router, userId, loadPilotData])

  const updatePermission = async (permissionType: 'staff' | 'owner' | 'executive', value: boolean) => {
    try {
      const targetUserId = userEmail || userId
      const targetEmail = userEmail || pilotEmail || pilotData?.email || currentUser?.email || null
      
      // Prepare permission object
      const permissions: { staff?: boolean; owner?: boolean; executive?: boolean } = {}
      if (permissionType === 'staff') {
        permissions.staff = value
        permissions.owner = false // Staff and owner are mutually exclusive
      } else if (permissionType === 'owner') {
        permissions.owner = value
        permissions.staff = false // Owner includes staff, so set staff to false
      } else if (permissionType === 'executive') {
        permissions.executive = value
      }
      
      const response = await fetch(`/api/admin/users/${targetUserId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...permissions,
          adminEmail: currentUser?.email || null,
          targetUserEmail: targetEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update permissions' }))
        throw new Error(errorData.error || 'Failed to update permissions')
      }

      const data = await response.json()
      
      // Update local state based on new role
      if (data.role === 'owner') {
        setHasOwnerPermission(true)
        setIsStaff(true) // Owner includes staff
        setIsExecutive(false)
      } else if (data.role === 'admin') {
        setHasOwnerPermission(false)
        setIsStaff(true)
        setIsExecutive(false)
      } else {
        setHasOwnerPermission(false)
        setIsStaff(false)
        setIsExecutive(false)
        // When staff is disabled, clear the role but don't delete it from database
        // setStaffRole('') // Don't clear - let user keep the role text
      }
      
      // Update pilotData with new role (without reloading all data to prevent flickering)
      if (pilotData) {
        setPilotData({ ...pilotData, role: data.role })
      }
      
      // Don't reload all data - just update the state to prevent screen flickering
      // This prevents the screen from flickering and losing input values
    } catch (error: any) {
      console.error(`Error updating ${permissionType} permission:`, error)
      alert(error.message || `Failed to update ${permissionType} permission`)
      // Revert the state change on error
      if (permissionType === 'staff') setIsStaff(!value)
      if (permissionType === 'owner') setHasOwnerPermission(!value)
      if (permissionType === 'executive') setIsExecutive(!value)
    }
  }

  const saveCallsign = async () => {
    setIsSavingCallsign(true)
    try {
      // Call API to save callsign
      // Use email if available, otherwise use userId
      const targetUserId = userEmail || userId
      const targetEmail = userEmail || pilotEmail || pilotData?.email || currentUser?.email || null
      
      console.log('Saving callsign:', {
        userId,
        userEmail,
        pilotEmail,
        pilotDataEmail: pilotData?.email,
        targetEmail,
        targetUserId,
        currentUserEmail: currentUser?.email,
      })
      
      const response = await fetch(`/api/admin/users/${targetUserId}/callsign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          callsign: pilotCallsign,
          adminEmail: currentUser?.email || null,
          targetUserEmail: targetEmail, // Send email to help find user
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save callsign')
      }

      const data = await response.json()
      
      // Update local state with new callsign
      setPilotCallsign(data.callsign || pilotCallsign)
      
      // Update pilotData with new callsign
      if (pilotData) {
        setPilotData({ ...pilotData, callsign: data.callsign || pilotCallsign })
      }
      
      // Reload pilot data to ensure everything is in sync
      await loadPilotData()
    } catch (error: any) {
      console.error('Error saving callsign:', error)
      // Could show an error message to the user here
      alert(error.message || 'Failed to save callsign')
    } finally {
      setIsSavingCallsign(false)
    }
  }

  const addFlightHours = async () => {
    const hours = parseInt(transferHoursInput) || 0
    const minutes = parseInt(transferMinutesInput) || 0
    
    if (hours === 0 && minutes === 0) {
      return // Don't add if both are 0
    }
    
    setIsAddingHours(true)
    try {
      const totalMinutesToAdd = hours * 60 + minutes
      const newFlightTimeMinutes = flightTimeMinutes + totalMinutesToAdd
      
      // TODO: Replace with actual API call to add flight hours
      // Example: await fetch(`/api/admin/users/${userId}/flight-hours`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ minutes: totalMinutesToAdd })
      // })
      
      // Call API to add flight hours
      // Send both userId and email to help API find the user
      // Use email from query parameter, stored pilotEmail, or currentUser
      const targetEmail = userEmail || pilotEmail || pilotData?.email || currentUser?.email || null
      
      console.log('Adding flight hours:', {
        userId,
        userEmail,
        pilotEmail,
        pilotDataEmail: pilotData?.email,
        targetEmail,
        currentUserEmail: currentUser?.email,
        minutes: totalMinutesToAdd,
      })
      
      if (!targetEmail) {
        throw new Error('Cannot determine target user email. Please ensure email is provided.')
      }
      
      const response = await fetch(`/api/admin/users/${userId}/flight-hours`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          minutes: totalMinutesToAdd,
          adminEmail: currentUser?.email || null,
          targetUserEmail: targetEmail, // Send email to help find user
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add flight hours' }))
        const errorMessage = errorData.error || 'Failed to add flight hours'
        const errorDetails = errorData.details ? `\nDetails: ${JSON.stringify(errorData.details, null, 2)}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const data = await response.json()
      
      // Update local state with server response
      if (data.totalFlightTimeMinutes !== undefined) {
        setFlightTimeMinutes(data.totalFlightTimeMinutes)
      } else {
        // If response doesn't include totalFlightTimeMinutes, reload from API
        const targetEmail = userEmail || pilotEmail || pilotData?.email
        const statsUrl = targetEmail 
          ? `/api/users/by-email/${encodeURIComponent(targetEmail)}/statistics`
          : `/api/users/${userId}/statistics`
        const statsResponse = await fetch(statsUrl)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setFlightTimeMinutes(statsData.totalFlightTimeMinutes || 0)
        }
      }
      
      // Reset transfer inputs
      setTransferHours(0)
      setTransferMinutes(0)
      setTransferHoursInput('')
      setTransferMinutesInput('')
    } catch (error: any) {
      console.error('Error adding flight hours:', error)
      
      // Show detailed error message
      let errorMessage = 'Failed to add flight hours'
      if (error.message) {
        errorMessage = error.message
      }
      
      // Try to parse error details if available
      try {
        if (error.message && error.message.includes('Details:')) {
          const detailsMatch = error.message.match(/Details: (.+)/)
          if (detailsMatch) {
            const details = JSON.parse(detailsMatch[1])
            if (details.code) {
              errorMessage += `\n\nError Code: ${details.code}`
            }
            if (details.meta) {
              errorMessage += `\n\nMeta: ${JSON.stringify(details.meta, null, 2)}`
            }
          }
        }
      } catch (parseError) {
        // Ignore parse errors
      }
      
      alert(errorMessage)
    } finally {
      setIsAddingHours(false)
    }
  }

  const formatFlightTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const saveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const targetUserId = userEmail || userId
      const targetEmail = userEmail || pilotEmail || pilotData?.email || currentUser?.email || null
      
      if (!targetEmail) {
        throw new Error('Cannot determine target user email. Please ensure email is provided.')
      }

      const response = await fetch(`/api/admin/users/${targetUserId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          displayName: displayName || undefined,
          email: email || undefined,
          password: password || undefined,
          adminEmail: currentUser?.email || null,
          targetUserEmail: targetEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }))
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      
      // Update local state with new data
      if (pilotData) {
        setPilotData({ 
          ...pilotData, 
          displayName: data.user.displayName || pilotData.displayName,
          email: data.user.email || pilotData.email,
        })
      }
      setPilotEmail(data.user.email || pilotEmail)
      setPassword('') // Clear password field after successful save
      
      // Reload pilot data to ensure everything is in sync
      await loadPilotData()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(error.message || 'Failed to save profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || !isAdmin(role) || !pilotData) {
    return null
  }


  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/crew-center/admin"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Admin</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pilot Details</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="neon-stats-card p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wide">Flight Time</p>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{formatFlightTime(flightTimeMinutes)}</p>
          </div>
          <div className="neon-stats-card p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Plane className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total PIREPs</p>
            </div>
            <p className="text-3xl font-semibold text-gray-900">72</p>
          </div>
          <div className="neon-stats-card p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wide">Last PIREP</p>
            </div>
            <p className="text-3xl font-semibold text-gray-900">Sep 1</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <div className="neon-card border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
                  {pilotData.displayName || pilotData.email || 'Unknown User'}
                </h2>
                {pilotCallsign && (
                  <p className="text-sm font-mono text-gray-600 mb-2">{pilotCallsign}</p>
                )}
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    pilotData.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800'
                      : pilotData.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pilotData.role === 'owner' ? 'Owner' : pilotData.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  {isStaff && (
                    <>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        Staff
                      </span>
                      {pilotData.rank && pilotData.rank.split(',').map((role, index) => {
                        const trimmedRole = role.trim()
                        return trimmedRole ? (
                          <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {trimmedRole}
                          </span>
                        ) : null
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                {/* Profile Edit Section */}
                <div className="space-y-4 pb-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Display Name / Username
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white text-sm"
                      placeholder="Enter display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white text-sm"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <button 
                    onClick={saveProfile}
                    disabled={isSavingProfile}
                    className="w-full px-4 py-2 neon-button rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Infinite Flight Community
                  </label>
                  <p className="text-sm text-gray-900">@{pilotData.displayName || pilotData.email?.split('@')[0] || 'unknown'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Rank
                  </label>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">
                      {pilotData.rank || 'Senior Captain'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Member Since
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(pilotData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900">
                    {pilotData.lastLogin 
                      ? new Date(pilotData.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pilot Callsign */}
            <div className="neon-card border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilot Callsign</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Callsign
                  </label>
                  <input
                    type="text"
                    value={pilotCallsign}
                    onChange={(e) => setPilotCallsign(e.target.value)}
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white font-mono"
                    placeholder="Enter callsign (e.g., MEXVO11)"
                  />
                </div>
                <button 
                  onClick={saveCallsign}
                  disabled={isSavingCallsign}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingCallsign ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Transfer Hours */}
            <div className="neon-card border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Hours</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flight Hours
                    </label>
                    <input
                      type="number"
                      value={transferHoursInput}
                      onChange={(e) => {
                        const value = e.target.value
                        setTransferHoursInput(value)
                        setTransferHours(value === '' ? 0 : parseInt(value) || 0)
                      }}
                      onFocus={(e) => {
                        // Clear only if the value is "0", otherwise select all for editing
                        if (transferHoursInput === '0' || transferHoursInput === '') {
                          setTransferHoursInput('')
                        } else {
                          e.target.select()
                        }
                      }}
                      onClick={(e) => {
                        // Select all text when clicked
                        e.currentTarget.select()
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setTransferHoursInput('')
                          setTransferHours(0)
                        }
                      }}
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flight Minutes
                    </label>
                    <input
                      type="number"
                      value={transferMinutesInput}
                      onChange={(e) => {
                        const value = e.target.value
                        setTransferMinutesInput(value)
                        setTransferMinutes(value === '' ? 0 : parseInt(value) || 0)
                      }}
                      onFocus={(e) => {
                        // Clear only if the value is "0", otherwise select all for editing
                        if (transferMinutesInput === '0' || transferMinutesInput === '') {
                          setTransferMinutesInput('')
                        } else {
                          e.target.select()
                        }
                      }}
                      onClick={(e) => {
                        // Select all text when clicked
                        e.currentTarget.select()
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setTransferMinutesInput('')
                          setTransferMinutes(0)
                        }
                      }}
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
                <button 
                  onClick={addFlightHours}
                  disabled={isAddingHours || ((!transferHoursInput || transferHoursInput === '0') && (!transferMinutesInput || transferMinutesInput === '0'))}
                  className="px-4 py-2 neon-button rounded-md hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingHours ? 'Adding...' : 'Add Hours'}
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="neon-card border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
              <div className="space-y-4">
                {/* Staff Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Staff</p>
                        <p className="text-xs text-gray-500">Grant staff permissions</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const newValue = !isStaff
                        setIsStaff(newValue)
                        await updatePermission('staff', newValue)
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isStaff ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isStaff ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Staff Role Input - Show when Staff is enabled */}
                  {isStaff && (
                    <div className="pl-4 pr-4 pb-4 bg-gray-50 rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff Role / Title
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value)}
                          className="flex-1 px-3 py-2 neon-input border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                          placeholder="e.g., Operations Manager, Flight Coordinator (カンマ区切りで複数入力可)"
                        />
                        <button
                          onClick={async () => {
                            setIsSavingRole(true)
                            try {
                              const targetUserId = userEmail || userId
                              const targetEmail = userEmail || pilotEmail || pilotData?.email || currentUser?.email || null
                              
                              const response = await fetch(`/api/admin/users/${targetUserId}/rank`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                  rank: staffRole,
                                  adminEmail: currentUser?.email || null,
                                  targetUserEmail: targetEmail,
                                }),
                              })

                              if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ error: 'Failed to save role' }))
                                throw new Error(errorData.error || 'Failed to save role')
                              }

                              const data = await response.json()
                              
                              // Update pilotData with new rank without reloading
                              if (pilotData) {
                                setPilotData({ ...pilotData, rank: data.rank || staffRole })
                              }
                            } catch (error: any) {
                              console.error('Error saving role:', error)
                              alert(error.message || 'Failed to save role')
                            } finally {
                              setIsSavingRole(false)
                            }
                          }}
                          disabled={isSavingRole}
                          className="px-4 py-2 neon-button rounded-md hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSavingRole ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Owner Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Owner</p>
                      <p className="text-xs text-gray-500">Grant owner permissions</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !hasOwnerPermission
                      setHasOwnerPermission(newValue)
                      await updatePermission('owner', newValue)
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      hasOwnerPermission ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hasOwnerPermission ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Executive Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Executive</p>
                      <p className="text-xs text-gray-500">Grant executive permissions</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !isExecutive
                      setIsExecutive(newValue)
                      await updatePermission('executive', newValue)
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isExecutive ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isExecutive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Flights */}
            <div className="neon-card border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Flights</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">KJFK → EGLL</p>
                        <p className="text-xs text-gray-500">Boeing 777-300ER • Sep 1, 2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">7:00</p>
                      <p className="text-xs text-gray-500">Flight Time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

