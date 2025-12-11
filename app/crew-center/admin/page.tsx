'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  BarChart3,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  X,
  Clock,
  Plane,
  Calendar,
  User,
  Save,
  Plus,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { isAdmin, isOwner } from '@/lib/permissions'
import Link from 'next/link'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: string
  callsign?: string | null
  createdAt: string
  lastLogin: string | null
}

interface ApplicationData {
  id: string
  email: string
  status: string
  createdAt: string
  infiniteFlightUsername?: string
  ifcUsername?: string
  discordUsername?: string
  grade?: number
  totalFlightTime?: number | null
  yearsOfExperience?: number | null
  motivation?: string
}

interface AircraftTypeData {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  liveries: LiveryData[]
}

interface LiveryData {
  id: string
  name: string
  aircraftTypeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PirepData {
  id: string
  userId: string
  flightDate: string
  flightNumber: string
  flightTime: string
  departureAirport: string
  arrivalAirport: string
  liveryId: string
  multiplierCode: string | null
  comment: string | null
  adminComment: string | null
  status: string
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    displayName: string | null
    infiniteFlightUsername: string
  }
  livery: {
    id: string
    name: string
    aircraftType: {
      id: string
      name: string
    }
  }
}

export default function AdminPage() {
  const { user, loading, role, permissions } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<UserData[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    pendingApplications: 0,
  })
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [pilotCallsign, setPilotCallsign] = useState('')
  const [transferHours, setTransferHours] = useState(0)
  const [transferHoursInput, setTransferHoursInput] = useState('')
  const [transferMinutes, setTransferMinutes] = useState(0)
  const [transferMinutesInput, setTransferMinutesInput] = useState('')
  const [isSavingCallsign, setIsSavingCallsign] = useState(false)
  const [isAddingHours, setIsAddingHours] = useState(false)
  const [modalFlightTimeMinutes, setModalFlightTimeMinutes] = useState(0)
  const [aircraftTypes, setAircraftTypes] = useState<AircraftTypeData[]>([])
  const [isAircraftTypeModalOpen, setIsAircraftTypeModalOpen] = useState(false)
  const [isLiveryModalOpen, setIsLiveryModalOpen] = useState(false)
  const [editingAircraftType, setEditingAircraftType] = useState<AircraftTypeData | null>(null)
  const [editingLivery, setEditingLivery] = useState<LiveryData | null>(null)
  const [selectedAircraftTypeId, setSelectedAircraftTypeId] = useState<string>('')
  const [aircraftTypeFormData, setAircraftTypeFormData] = useState({ name: '' })
  const [liveryFormData, setLiveryFormData] = useState({ name: '' })
  const [isSavingAircraftType, setIsSavingAircraftType] = useState(false)
  const [isSavingLivery, setIsSavingLivery] = useState(false)
  const [pireps, setPireps] = useState<PirepData[]>([])
  const [selectedPirepStatus, setSelectedPirepStatus] = useState<string>('pending')
  const [selectedPirep, setSelectedPirep] = useState<PirepData | null>(null)
  const [isPirepModalOpen, setIsPirepModalOpen] = useState(false)
  const [adminComment, setAdminComment] = useState('')
  const [isUpdatingPirep, setIsUpdatingPirep] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [fleetSearchQuery, setFleetSearchQuery] = useState('')
  const [expandedAircraftTypes, setExpandedAircraftTypes] = useState<Set<string>>(new Set())
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    summary?: {
      aircraftTypesCreated: number
      aircraftTypesSkipped: number
      liveriesCreated: number
      liveriesSkipped: number
    }
    error?: string
  } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/crew-center/login')
      return
    }
    
    if (!loading && user && !isAdmin(role)) {
      router.push('/crew-center')
      return
    }
  }, [user, loading, role, router])

  const loadUsers = useCallback(async () => {
    setIsLoadingData(true)
    try {
      if (!user?.email) {
        console.error('Cannot load users: user email not available')
        setUsers([])
        setStats(prev => ({ ...prev, totalUsers: 0 }))
        return
      }

      // Fetch users from API
      const response = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        console.error('Failed to load users:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        setUsers([])
        setStats(prev => ({ ...prev, totalUsers: 0 }))
        return
      }

      const prismaUsers = await response.json()
      
      // Handle case where API returns empty array or null
      if (!Array.isArray(prismaUsers)) {
        console.error('Invalid response format:', prismaUsers)
        setUsers([])
        setStats(prev => ({ ...prev, totalUsers: 0 }))
        return
      }
      
      // Convert Prisma user format to UserData format
      const userDataList: UserData[] = prismaUsers.map((prismaUser: any) => ({
        uid: prismaUser.id || String(Math.random()), // Use Prisma ID as uid, fallback to random if missing
        email: prismaUser.email || null,
        displayName: prismaUser.displayName || prismaUser.infiniteFlightUsername || null,
        role: prismaUser.role || 'user',
        callsign: prismaUser.callsign || null,
        createdAt: prismaUser.createdAt || new Date().toISOString(),
        lastLogin: prismaUser.lastLoginAt || null,
      }))
      
      setUsers(userDataList)
      setStats(prev => ({ ...prev, totalUsers: userDataList.length }))
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setStats(prev => ({ ...prev, totalUsers: 0 }))
    } finally {
      setIsLoadingData(false)
    }
  }, [user?.email])

  const loadApplications = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch('/api/applications')
      
      if (!response.ok) {
        console.error('Failed to load applications:', response.status, response.statusText)
        setApplications([])
        setStats(prev => ({ ...prev, pendingApplications: 0 }))
        return
      }

      const applicationsData = await response.json()
      
      // Convert API response to ApplicationData format
      const applicationList: ApplicationData[] = applicationsData.map((app: any) => ({
        id: app.id,
        email: app.email,
        status: app.status,
        createdAt: app.createdAt,
        infiniteFlightUsername: app.ifcUsername || app.infiniteFlightUsername || '',
        ifcUsername: app.ifcUsername || app.infiniteFlightUsername || '',
        discordUsername: app.discordUsername || '',
        grade: app.grade || null,
        totalFlightTime: app.totalFlightTime || null,
        yearsOfExperience: app.yearsOfExperience || null,
        motivation: app.motivation || '',
      }))
      
      setApplications(applicationList)
      setStats(prev => ({ ...prev, pendingApplications: applicationList.filter(a => a.status === 'pending').length }))
    } catch (error) {
      console.error('Error loading applications:', error)
      setApplications([])
      setStats(prev => ({ ...prev, pendingApplications: 0 }))
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  const loadStatistics = useCallback(async () => {
    setIsLoadingData(true)
    try {
      // Mock data - replace with actual API call
      setStats({
        totalUsers: users.length || 0,
        totalFlights: 0,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setIsLoadingData(false)
    }
  }, [users, applications])

  const loadAircraftTypes = useCallback(async () => {
    setIsLoadingData(true)
    try {
      if (!user?.email) {
        console.error('Cannot load aircraft types: user email not available')
        setAircraftTypes([])
        return
      }

      const response = await fetch(`/api/admin/aircraft-types?adminEmail=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        console.error('Failed to load aircraft types:', response.status, response.statusText)
        setAircraftTypes([])
        return
      }

      const data = await response.json()
      
      // Natural sort function: alphabet first, then numbers
      const naturalSort = (a: string, b: string): number => {
        // Split strings into parts (alphabet and numbers)
        const regex = /(\d+|\D+)/g
        const aParts = a.match(regex) || []
        const bParts = b.match(regex) || []
        
        const minLength = Math.min(aParts.length, bParts.length)
        
        for (let i = 0; i < minLength; i++) {
          const aPart = aParts[i]
          const bPart = bParts[i]
          
          // Check if both parts are numbers
          const aNum = parseInt(aPart, 10)
          const bNum = parseInt(bPart, 10)
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            // Both are numbers, compare numerically
            if (aNum !== bNum) {
              return aNum - bNum
            }
          } else {
            // At least one is not a number, compare as strings
            const comparison = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' })
            if (comparison !== 0) {
              return comparison
            }
          }
        }
        
        // If all parts are equal, compare by length
        return aParts.length - bParts.length
      }
      
      // Sort aircraft types by name (natural sort), and sort liveries within each type
      const sortedData = data
        .map((aircraftType: AircraftTypeData) => ({
          ...aircraftType,
          liveries: [...aircraftType.liveries].sort((a, b) => naturalSort(a.name, b.name))
        }))
        .sort((a: AircraftTypeData, b: AircraftTypeData) => naturalSort(a.name, b.name))
      
      setAircraftTypes(sortedData)
    } catch (error) {
      console.error('Error loading aircraft types:', error)
      setAircraftTypes([])
    } finally {
      setIsLoadingData(false)
    }
  }, [user?.email])

  const handleAircraftTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingAircraftType(true)

    try {
      const url = editingAircraftType 
        ? `/api/admin/aircraft-types/${editingAircraftType.id}`
        : '/api/admin/aircraft-types'
      
      const method = editingAircraftType ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...aircraftTypeFormData,
          adminEmail: user?.email || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save aircraft type')
      }

      // Reload aircraft types
      await loadAircraftTypes()
      
      // Reset form and close modal
      setAircraftTypeFormData({ name: '' })
      setEditingAircraftType(null)
      setIsAircraftTypeModalOpen(false)
    } catch (error: any) {
      console.error('Error saving aircraft type:', error)
      alert(`Failed to save aircraft type: ${error.message}`)
    } finally {
      setIsSavingAircraftType(false)
    }
  }

  const handleAircraftTypeEdit = (aircraftType: AircraftTypeData) => {
    setEditingAircraftType(aircraftType)
    setAircraftTypeFormData({ name: aircraftType.name })
    setIsAircraftTypeModalOpen(true)
  }

  const handleAircraftTypeDelete = async (aircraftTypeId: string) => {
    if (!confirm('Are you sure you want to delete this aircraft type? All associated liveries will also be deleted. This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/aircraft-types/${aircraftTypeId}?adminEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete aircraft type')
      }

      // Reload aircraft types
      await loadAircraftTypes()
    } catch (error: any) {
      console.error('Error deleting aircraft type:', error)
      alert(`Failed to delete aircraft type: ${error.message}`)
    }
  }

  const handleLiverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!editingLivery && !selectedAircraftTypeId) {
      alert('Please select an Aircraft Type')
      return
    }
    
    if (!liveryFormData.name || !liveryFormData.name.trim()) {
      alert('Please enter a Livery Name')
      return
    }
    
    setIsSavingLivery(true)

    try {
      const url = editingLivery 
        ? `/api/admin/liveries/${editingLivery.id}`
        : '/api/admin/liveries'
      
      const method = editingLivery ? 'PATCH' : 'POST'

      const body = editingLivery
        ? { name: liveryFormData.name, adminEmail: user?.email || null }
        : { aircraftTypeId: selectedAircraftTypeId, name: liveryFormData.name, adminEmail: user?.email || null }
      
      console.log('Submitting livery:', body)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save livery')
      }

      // Reload aircraft types
      await loadAircraftTypes()
      
      // Reset form and close modal
      setLiveryFormData({ name: '' })
      setSelectedAircraftTypeId('')
      setEditingLivery(null)
      setIsLiveryModalOpen(false)
    } catch (error: any) {
      console.error('Error saving livery:', error)
      alert(`Failed to save livery: ${error.message}`)
    } finally {
      setIsSavingLivery(false)
    }
  }

  const handleLiveryEdit = (livery: LiveryData) => {
    setEditingLivery(livery)
    setLiveryFormData({ name: livery.name })
    setIsLiveryModalOpen(true)
  }

  const handleLiveryDelete = async (liveryId: string) => {
    if (!confirm('Are you sure you want to delete this livery? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/liveries/${liveryId}?adminEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete livery')
      }

      // Reload aircraft types
      await loadAircraftTypes()
    } catch (error: any) {
      console.error('Error deleting livery:', error)
      alert(`Failed to delete livery: ${error.message}`)
    }
  }

  const loadPireps = useCallback(async () => {
    setIsLoadingData(true)
    try {
      if (!user?.email) {
        console.error('Cannot load PIREPs: user email not available')
        setPireps([])
        return
      }

      // Fetch all PIREPs, filtering will be done on the frontend
      const response = await fetch(`/api/admin/pireps?adminEmail=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        console.error('Failed to load PIREPs:', response.status, response.statusText)
        setPireps([])
        return
      }

      const data = await response.json()
      setPireps(data)
    } catch (error) {
      console.error('Error loading PIREPs:', error)
      setPireps([])
    } finally {
      setIsLoadingData(false)
    }
  }, [user?.email])

  const handlePirepStatusChange = async (pirepId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'update'} this PIREP?`)) {
      return
    }

    setIsUpdatingPirep(true)
    try {
      const response = await fetch(`/api/admin/pireps/${pirepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminEmail: user?.email || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update PIREP status')
      }

      // Reload PIREPs
      await loadPireps()
      
      // Close modal if open
      if (selectedPirep?.id === pirepId) {
        setIsPirepModalOpen(false)
        setSelectedPirep(null)
      }
    } catch (error: any) {
      console.error('Error updating PIREP status:', error)
      alert(`Failed to update PIREP status: ${error.message}`)
    } finally {
      setIsUpdatingPirep(false)
    }
  }

  const handlePirepDelete = async (pirepId: string) => {
    if (!confirm('Are you sure you want to delete this PIREP? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pireps/${pirepId}?adminEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete PIREP')
      }

      // Reload PIREPs
      await loadPireps()
      
      // Close modal if open
      if (selectedPirep?.id === pirepId) {
        setIsPirepModalOpen(false)
        setSelectedPirep(null)
      }
    } catch (error: any) {
      console.error('Error deleting PIREP:', error)
      alert(`Failed to delete PIREP: ${error.message}`)
    }
  }

  const handleAdminCommentSubmit = async () => {
    if (!selectedPirep) return

    setIsUpdatingPirep(true)
    try {
      const response = await fetch(`/api/admin/pireps/${selectedPirep.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminComment: adminComment.trim() || null,
          adminEmail: user?.email || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save comment')
      }

      // Reload PIREPs to get updated data
      await loadPireps()
      
      // Update selected PIREP with new comment
      const updatedResponse = await fetch(`/api/admin/pireps/${selectedPirep.id}?adminEmail=${encodeURIComponent(user?.email || '')}`)
      if (updatedResponse.ok) {
        const updatedPirep = await updatedResponse.json()
        setSelectedPirep(updatedPirep)
      }
      
      // Clear comment input
      setAdminComment('')
    } catch (error: any) {
      console.error('Error saving admin comment:', error)
      alert(`Failed to save comment: ${error.message}`)
    } finally {
      setIsUpdatingPirep(false)
    }
  }

  useEffect(() => {
    if (isLoadingData) return // Prevent concurrent calls
    if (loading) return // Wait for auth to finish
    if (!user || !isAdmin(role)) return // Only load if admin
    
    if (activeTab === 'users') {
      loadUsers()
    } else if (activeTab === 'applications') {
      loadApplications()
    } else if (activeTab === 'statistics') {
      loadStatistics()
    } else if (activeTab === 'fleet') {
      loadAircraftTypes()
    } else if (activeTab === 'pireps') {
      loadPireps()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loading, role])

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(role)) {
    return null
  }

  const isOwnerUser = isOwner(role)

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                {isOwnerUser ? 'Owner Control Panel' : 'Administrator Panel'}
              </p>
            </div>
            <Link
              href="/crew-center"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="neon-card rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'users'
                    ? 'neon-tab-active border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                User Management
              </button>
              {isOwnerUser && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === 'admins'
                      ? 'neon-tab-active border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 inline mr-2" />
                  Admin Management
                </button>
              )}
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'applications'
                    ? 'neon-tab-active border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Applications
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'statistics'
                    ? 'neon-tab-active border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'fleet'
                    ? 'neon-tab-active border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plane className="w-5 h-5 inline mr-2" />
                Fleet Management
              </button>
              <button
                onClick={() => setActiveTab('pireps')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'pireps'
                    ? 'neon-tab-active border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                PIREP Administration
              </button>
              {isOwnerUser && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                    activeTab === 'settings'
                      ? 'neon-tab-active border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-5 h-5 inline mr-2" />
                  System Settings
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="neon-card rounded-lg p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push('/crew-center/register')}
                    className="neon-button px-4 py-2 rounded-md hover:bg-primary-dark flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="neon-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm"
                    placeholder="Search by name, email, or callsign..."
                  />
                </div>
              </div>
              
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(() => {
                    // Filter users based on search query
                    const filteredUsers = users.filter((user) => {
                      if (!userSearchQuery.trim()) return true
                      const query = userSearchQuery.toLowerCase()
                      const name = (user.displayName || '').toLowerCase()
                      const email = (user.email || '').toLowerCase()
                      const callsign = (user.callsign || '').toLowerCase()
                      return name.includes(query) || email.includes(query) || callsign.includes(query)
                    })
                    
                    if (filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {userSearchQuery.trim() ? 'No users found matching your search' : 'No users found'}
                          </p>
                          {userSearchQuery.trim() && (
                            <p className="text-sm text-gray-500 mt-2">Try adjusting your search query</p>
                          )}
                          {!userSearchQuery.trim() && (
                            <p className="text-sm text-gray-500 mt-2">Users will appear here once they register</p>
                          )}
                        </div>
                      )
                    }
                    
                    return (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Callsign
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((userItem) => {
                            const isStaff = userItem.role === 'admin' || userItem.role === 'owner'
                            const openModal = async () => {
                              // Load latest user data before opening modal
                              try {
                                if (userItem.email) {
                                  const userResponse = await fetch(`/api/users/by-email/${encodeURIComponent(userItem.email)}`)
                                  if (userResponse.ok) {
                                    const userData = await userResponse.json()
                                    const updatedUser: UserData = {
                                      uid: userData.id,
                                      email: userData.email,
                                      displayName: userData.displayName || userData.infiniteFlightUsername || null,
                                      role: userData.role || 'user',
                                      callsign: userData.callsign || null,
                                      createdAt: userData.createdAt || new Date().toISOString(),
                                      lastLogin: userData.lastLoginAt || null,
                                    }
                                    setEditingUser(updatedUser)
                                    setPilotCallsign(updatedUser.callsign || '')
                                  } else {
                                    // Fallback to existing data if API fails
                                    setEditingUser(userItem)
                                    setPilotCallsign(userItem.callsign || '')
                                  }
                                } else {
                                  setEditingUser(userItem)
                                  setPilotCallsign(userItem.callsign || '')
                                }
                              } catch (error) {
                                console.error('Error loading user data:', error)
                                // Fallback to existing data
                                setEditingUser(userItem)
                                setPilotCallsign(userItem.callsign || '')
                              }
                              setTransferHours(0)
                              setTransferMinutes(0)
                              setTransferHoursInput('')
                              setTransferMinutesInput('')
                              
                              // Load flight time for modal
                              if (userItem.email) {
                                try {
                                  const statsResponse = await fetch(`/api/users/by-email/${encodeURIComponent(userItem.email)}/statistics`)
                                  if (statsResponse.ok) {
                                    const statsData = await statsResponse.json()
                                    setModalFlightTimeMinutes(statsData.totalFlightTimeMinutes || 0)
                                  }
                                } catch (error) {
                                  console.error('Error loading flight time:', error)
                                }
                              }
                            }
                            
                            return (
                              <tr 
                                key={userItem.uid} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={openModal}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userItem.displayName || 'No name'}
                                  </div>
                                  <div className="text-sm text-gray-500">{userItem.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-mono text-gray-900">
                                    {userItem.callsign || '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    userItem.role === 'owner' 
                                      ? 'bg-purple-100 text-purple-800'
                                      : userItem.role === 'admin'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {userItem.role === 'owner' ? 'Owner' : userItem.role === 'admin' ? 'Admin' : 'User'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {isStaff ? (
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                      Staff
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(userItem.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {userItem.lastLogin 
                                    ? new Date(userItem.lastLogin).toLocaleDateString()
                                    : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Navigate to pilot details page
                                      if (userItem.uid && userItem.email) {
                                        const emailParam = `?email=${encodeURIComponent(userItem.email)}`
                                        const url = `/crew-center/admin/users/${userItem.uid}${emailParam}`
                                        window.location.href = url
                                      }
                                    }}
                                    className="text-primary hover:text-primary-dark mr-4 transition-colors"
                                    title="View full details"
                                  >
                                    <Edit className="w-4 h-4 inline" />
                                  </button>
                                  {userItem.uid !== user?.uid && (
                                    <button 
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Delete user"
                                    >
                                      <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'admins' && isOwnerUser && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Management</h2>
                  <button className="neon-button px-4 py-2 rounded-md hover:bg-primary-dark flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Promote to Admin
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Owner Only:</strong> You can manage administrator accounts here. Be careful when granting admin privileges.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.displayName || user?.email || 'Current User'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Owner
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No other administrators found</p>
                  <p className="text-sm text-gray-500">
                    Promote users to admin by selecting them from the User Management tab
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Application Management</h2>
                <div className="text-sm text-gray-600">
                  {applications.filter(a => a.status === 'pending').length} pending
                </div>
              </div>
              
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No applications found</p>
                    </div>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">{app.email}</p>
                            <div className="mt-2 space-y-1">
                              {app.ifcUsername && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">IFC Username:</span> {app.ifcUsername}
                                </p>
                              )}
                              {app.discordUsername && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Discord:</span> {app.discordUsername}
                                </p>
                              )}
                              {app.grade && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Grade:</span> {app.grade}
                                </p>
                              )}
                              {app.totalFlightTime !== null && app.totalFlightTime !== undefined && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Flight Time:</span> {app.totalFlightTime} hours
                                </p>
                              )}
                              {app.yearsOfExperience !== null && app.yearsOfExperience !== undefined && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Experience:</span> {app.yearsOfExperience} years
                                </p>
                              )}
                            </div>
                            {app.motivation && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">Motivation:</p>
                                <p className="text-sm text-gray-700 line-clamp-3">{app.motivation}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-3">
                              Applied on {new Date(app.createdAt).toLocaleDateString()} at {new Date(app.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-3 ml-4">
                            {app.status === 'pending' && (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {app.status === 'approved' && (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                            )}
                            {app.status === 'rejected' && (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Rejected
                              </span>
                            )}
                            {app.status === 'pending' && (
                              <div className="flex items-center space-x-2">
                                <button 
                                  className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">System Statistics</h2>
              
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading statistics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="neon-stats-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="neon-stats-card bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Flights</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalFlights}</p>
                  </div>
                  <div className="neon-stats-card bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Pending Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              )}
              
              <div className="neon-card border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <p className="text-gray-600 text-sm">Activity logs will be displayed here.</p>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Fleet Management</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsImportModalOpen(true)
                      setImportResult(null)
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Bulk Import
                  </button>
                  <button
                    onClick={() => {
                      setEditingAircraftType(null)
                      setAircraftTypeFormData({ name: '' })
                      setIsAircraftTypeModalOpen(true)
                    }}
                    className="neon-button px-4 py-2 rounded-md hover:bg-primary-dark flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Aircraft Type
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fleetSearchQuery}
                    onChange={(e) => setFleetSearchQuery(e.target.value)}
                    className="neon-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm"
                    placeholder="Search by aircraft type or livery name..."
                  />
                </div>
              </div>
              
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading aircraft types...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    // Natural sort function: alphabet first, then numbers
                    const naturalSort = (a: string, b: string): number => {
                      const regex = /(\d+|\D+)/g
                      const aParts = a.match(regex) || []
                      const bParts = b.match(regex) || []
                      
                      const minLength = Math.min(aParts.length, bParts.length)
                      
                      for (let i = 0; i < minLength; i++) {
                        const aPart = aParts[i]
                        const bPart = bParts[i]
                        
                        const aNum = parseInt(aPart, 10)
                        const bNum = parseInt(bPart, 10)
                        
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                          if (aNum !== bNum) {
                            return aNum - bNum
                          }
                        } else {
                          const comparison = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' })
                          if (comparison !== 0) {
                            return comparison
                          }
                        }
                      }
                      
                      return aParts.length - bParts.length
                    }
                    
                    // Filter aircraft types and liveries based on search query
                    const filteredAircraftTypes = aircraftTypes
                      .map((aircraftType) => {
                        if (!fleetSearchQuery.trim()) return aircraftType
                        const query = fleetSearchQuery.toLowerCase()
                        const aircraftName = aircraftType.name.toLowerCase()
                        const matchingLiveries = aircraftType.liveries.filter((livery) =>
                          livery.name.toLowerCase().includes(query)
                        )
                        // Include if aircraft name matches or has matching liveries
                        if (aircraftName.includes(query) || matchingLiveries.length > 0) {
                          return {
                            ...aircraftType,
                            liveries: (matchingLiveries.length > 0 ? matchingLiveries : aircraftType.liveries)
                              .sort((a, b) => naturalSort(a.name, b.name))
                          }
                        }
                        return null
                      })
                      .filter((at) => at !== null) as AircraftTypeData[]
                    
                    const sortedAircraftTypes = filteredAircraftTypes.sort((a, b) => naturalSort(a.name, b.name))
                    
                    if (sortedAircraftTypes.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {fleetSearchQuery.trim() ? 'No aircraft types or liveries found matching your search' : 'No aircraft types found'}
                          </p>
                          {fleetSearchQuery.trim() && (
                            <p className="text-sm text-gray-500 mt-2">Try adjusting your search query</p>
                          )}
                          {!fleetSearchQuery.trim() && (
                            <p className="text-sm text-gray-500 mt-2">Click "Add Aircraft Type" to create a new aircraft type</p>
                          )}
                        </div>
                      )
                    }
                    
                    return (
                      <>
                        {sortedAircraftTypes.map((aircraftType) => (
                      <div key={aircraftType.id} className="neon-border border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={aircraftType.isActive === true}
                                onChange={async (e) => {
                                  const newValue = e.target.checked
                                  // Optimistic update: update UI immediately
                                  setAircraftTypes(prev => prev.map(at => 
                                    at.id === aircraftType.id 
                                      ? { ...at, isActive: newValue }
                                      : at
                                  ))
                                  
                                  try {
                                    const response = await fetch(`/api/admin/aircraft-types/${aircraftType.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        isActive: newValue,
                                        adminEmail: user?.email || null,
                                      }),
                                    })
                                    if (response.ok) {
                                      // Don't reload - optimistic update is sufficient for checkbox changes
                                      // This prevents UI flickering
                                    } else {
                                      // Rollback on error
                                      setAircraftTypes(prev => prev.map(at => 
                                        at.id === aircraftType.id 
                                          ? { ...at, isActive: !newValue }
                                          : at
                                      ))
                                      const errorData = await response.json().catch(() => ({}))
                                      console.error('Failed to update aircraft type:', errorData)
                                      const errorMessage = errorData.details?.message || errorData.error || errorData.details || 'Unknown error'
                                      alert(`Failed to update aircraft type visibility: ${errorMessage}`)
                                    }
                                  } catch (error) {
                                    // Rollback on error
                                    setAircraftTypes(prev => prev.map(at => 
                                      at.id === aircraftType.id 
                                        ? { ...at, isActive: !newValue }
                                        : at
                                    ))
                                    console.error('Error updating aircraft type:', error)
                                    alert('Failed to update aircraft type visibility')
                                  }
                                }}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                              />
                              <span className="text-xs text-gray-500">Show in PIREP</span>
                            </label>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{aircraftType.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {aircraftType.liveries.length} {aircraftType.liveries.length === 1 ? 'livery' : 'liveries'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAircraftTypeId(aircraftType.id)
                                setLiveryFormData({ name: '' })
                                setEditingLivery(null)
                                setIsLiveryModalOpen(true)
                              }}
                              className="text-primary hover:text-primary-dark text-sm flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Livery
                            </button>
                            <button
                              onClick={() => handleAircraftTypeEdit(aircraftType)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAircraftTypeDelete(aircraftType.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {aircraftType.liveries.length > 0 ? (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedAircraftTypes)
                                if (newExpanded.has(aircraftType.id)) {
                                  newExpanded.delete(aircraftType.id)
                                } else {
                                  newExpanded.add(aircraftType.id)
                                }
                                setExpandedAircraftTypes(newExpanded)
                              }}
                              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
                            >
                              {expandedAircraftTypes.has(aircraftType.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              <span>
                                {aircraftType.liveries.length} {aircraftType.liveries.length === 1 ? 'livery' : 'liveries'}
                                {expandedAircraftTypes.has(aircraftType.id) ? ' (Click to collapse)' : ' (Click to expand)'}
                              </span>
                            </button>
                            {expandedAircraftTypes.has(aircraftType.id) && (
                              <div className="space-y-2">
                                {aircraftType.liveries.map((livery) => (
                                  <div key={livery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center space-x-3">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={livery.isActive === true}
                                          onChange={async (e) => {
                                            const newValue = e.target.checked
                                            // Optimistic update: update UI immediately
                                            setAircraftTypes(prev => prev.map(at => 
                                              at.id === livery.aircraftTypeId
                                                ? {
                                                    ...at,
                                                    liveries: at.liveries.map(l => 
                                                      l.id === livery.id 
                                                        ? { ...l, isActive: newValue }
                                                        : l
                                                    )
                                                  }
                                                : at
                                            ))
                                            
                                            try {
                                              const response = await fetch(`/api/admin/liveries/${livery.id}`, {
                                                method: 'PATCH',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                  isActive: newValue,
                                                  adminEmail: user?.email || null,
                                                }),
                                              })
                                              if (response.ok) {
                                                // Don't reload - optimistic update is sufficient for checkbox changes
                                                // This prevents UI flickering
                                              } else {
                                                // Rollback on error
                                                setAircraftTypes(prev => prev.map(at => 
                                                  at.id === livery.aircraftTypeId
                                                    ? {
                                                        ...at,
                                                        liveries: at.liveries.map(l => 
                                                          l.id === livery.id 
                                                            ? { ...l, isActive: !newValue }
                                                            : l
                                                        )
                                                      }
                                                    : at
                                                ))
                                                const errorData = await response.json().catch(() => ({}))
                                                console.error('Failed to update livery:', errorData)
                                                const errorMessage = errorData.details?.message || errorData.error || errorData.details || 'Unknown error'
                                                alert(`Failed to update livery visibility: ${errorMessage}`)
                                              }
                                            } catch (error) {
                                              // Rollback on error
                                              setAircraftTypes(prev => prev.map(at => 
                                                at.id === livery.aircraftTypeId
                                                  ? {
                                                      ...at,
                                                      liveries: at.liveries.map(l => 
                                                        l.id === livery.id 
                                                          ? { ...l, isActive: !newValue }
                                                          : l
                                                      )
                                                    }
                                                  : at
                                              ))
                                              console.error('Error updating livery:', error)
                                              alert('Failed to update livery visibility')
                                            }
                                          }}
                                          className="w-4 h-4 text-primary focus:ring-primary rounded"
                                        />
                                        <span className="text-xs text-gray-500">Show</span>
                                      </label>
                                      <span className="text-sm text-gray-700">{livery.name}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleLiveryEdit(livery)}
                                        className="text-primary hover:text-primary-dark"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleLiveryDelete(livery.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-4">No liveries added yet</p>
                        )}
                      </div>
                    ))}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pireps' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">PIREP Administration</h2>
              </div>
              
              {/* Status Filter */}
              <div className="mb-6 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedPirepStatus('pending')
                  }}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedPirepStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setSelectedPirepStatus('approved')
                  }}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedPirepStatus === 'approved'
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => {
                    setSelectedPirepStatus('rejected')
                  }}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedPirepStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rejected
                </button>
              </div>
              
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PIREPs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {pireps.filter(p => p.status === selectedPirepStatus).length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No {selectedPirepStatus} PIREPs found</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pilot
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aircraft
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pireps
                          .filter(p => p.status === selectedPirepStatus)
                          .map((pirep) => {
                            const openModal = () => {
                              setSelectedPirep(pirep)
                              setAdminComment(pirep.adminComment || '')
                              setIsPirepModalOpen(true)
                            }
                            
                            return (
                              <tr 
                                key={pirep.id} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={openModal}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    pirep.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : pirep.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {pirep.status === 'pending' ? 'Pending' : pirep.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {pirep.flightNumber}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {pirep.user.displayName || pirep.user.infiniteFlightUsername || pirep.user.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {pirep.departureAirport} → {pirep.arrivalAirport}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {pirep.livery.aircraftType.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pirep.livery.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(pirep.flightDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {pirep.flightTime}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(pirep.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end space-x-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openModal()
                                      }}
                                      className="text-primary hover:text-primary-dark transition-colors"
                                      title="View details"
                                    >
                                      <Edit className="w-4 h-4 inline" />
                                    </button>
                                    {pirep.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handlePirepStatusChange(pirep.id, 'approved')
                                          }}
                                          className="text-green-600 hover:text-green-800 transition-colors"
                                          title="Approve"
                                          disabled={isUpdatingPirep}
                                        >
                                          <CheckCircle className="w-4 h-4 inline" />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handlePirepStatusChange(pirep.id, 'rejected')
                                          }}
                                          className="text-red-600 hover:text-red-800 transition-colors"
                                          title="Reject"
                                          disabled={isUpdatingPirep}
                                        >
                                          <XCircle className="w-4 h-4 inline" />
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePirepDelete(pirep.id)
                                      }}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Delete"
                                      disabled={isUpdatingPirep}
                                    >
                                      <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && isOwnerUser && (
            <div>
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">
                      <strong>Owner Only:</strong> System settings allow you to configure core platform features. Changes here affect all users.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="neon-border border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        defaultValue="MexicoVirtual"
                        placeholder="Enter platform name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows={3}
                        placeholder="Enter platform description"
                      />
                    </div>
                  </div>
                </div>

                <div className="neon-border border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Maintenance Mode</p>
                        <p className="text-xs text-gray-500">Disable access for all non-admin users</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Registration</p>
                        <p className="text-xs text-gray-500">Allow new user registration</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="neon-border border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-red-900">Reset All Data</p>
                        <p className="text-xs text-red-700">This will delete all user data and cannot be undone</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pilot Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pilot Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">{editingUser.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (editingUser && editingUser.uid) {
                      // Pass email as query parameter so API can find the user
                      const emailParam = editingUser.email ? `?email=${encodeURIComponent(editingUser.email)}` : ''
                      const url = `/crew-center/admin/users/${editingUser.uid}${emailParam}`
                      console.log('Navigating to:', url)
                      console.log('User ID:', editingUser.uid)
                      // Use window.location for reliable navigation
                      window.location.href = url
                    } else {
                      console.error('editingUser or uid is missing:', editingUser)
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center space-x-2 text-sm font-medium shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setEditingUser(null)
                    setPilotCallsign('')
                    setTransferHours(0)
                    setTransferMinutes(0)
                    setTransferHoursInput('')
                    setTransferMinutesInput('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Flight Time</p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.floor(modalFlightTimeMinutes / 60)}:{(modalFlightTimeMinutes % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Plane className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase tracking-wide">PIREPs</p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">72</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Last PIREP</p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">Sep 1</p>
                </div>
              </div>

              {/* User Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Profile */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingUser.displayName || editingUser.email || 'Unknown User'}
                      </h3>
                      {pilotCallsign && (
                        <p className="text-sm font-mono text-gray-600 mt-1">{pilotCallsign}</p>
                      )}
                      {(editingUser.role === 'admin' || editingUser.role === 'owner') && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          Staff
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Infinite Flight Community
                      </label>
                      <p className="text-sm text-gray-900">@{editingUser.displayName || editingUser.email?.split('@')[0] || 'unknown'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Rank
                      </label>
                      <p className="text-sm text-gray-900 font-medium">Senior Captain</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Permissions
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {editingUser.role === 'owner' ? 'Owner' : editingUser.role === 'admin' ? 'Staff' : 'User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilot Callsign
                    </label>
                    <input
                      type="text"
                      value={pilotCallsign}
                      onChange={(e) => setPilotCallsign(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white font-mono"
                      placeholder="Enter callsign (e.g., MEXVO11)"
                    />
                  </div>

                  {(editingUser.role === 'admin' || editingUser.role === 'owner') && (
                    <button className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                      Revoke Staff
                    </button>
                  )}
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                    Revoke Access
                  </button>

                  <button 
                    onClick={async () => {
                      if (!editingUser || !editingUser.email) return
                      
                      setIsSavingCallsign(true)
                      try {
                        const targetUserId = editingUser.uid
                        const targetEmail = editingUser.email
                        
                        const response = await fetch(`/api/admin/users/${targetUserId}/callsign`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ 
                            callsign: pilotCallsign,
                            adminEmail: user?.email || null,
                            targetUserEmail: targetEmail,
                          }),
                        })

                        if (!response.ok) {
                          const errorData = await response.json()
                          throw new Error(errorData.error || 'Failed to save callsign')
                        }

                        const data = await response.json()
                        
                        // Update editingUser with new callsign
                        if (editingUser) {
                          setEditingUser({ ...editingUser, callsign: data.callsign || pilotCallsign })
                        }
                        
                        // Reload users list to reflect changes
                        await loadUsers()
                      } catch (error: any) {
                        console.error('Error saving callsign:', error)
                        alert(error.message || 'Failed to save callsign')
                      } finally {
                        setIsSavingCallsign(false)
                      }
                    }}
                    disabled={isSavingCallsign}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingCallsign ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>

              {/* Transfer Hours Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Transfer Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const hours = parseInt(transferHoursInput) || 0
                    const minutes = parseInt(transferMinutesInput) || 0
                    
                    if (!editingUser || !editingUser.email || (hours === 0 && minutes === 0)) return
                    
                    setIsAddingHours(true)
                    try {
                      const totalMinutesToAdd = hours * 60 + minutes
                      const targetUserId = editingUser.uid
                      const targetEmail = editingUser.email
                      
                      const response = await fetch(`/api/admin/users/${targetUserId}/flight-hours`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          minutes: totalMinutesToAdd,
                          adminEmail: user?.email || null,
                          targetUserEmail: targetEmail,
                        }),
                      })

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Failed to add flight hours' }))
                        throw new Error(errorData.error || 'Failed to add flight hours')
                      }

                      const data = await response.json()
                      
                      // Update modal flight time
                      if (data.totalFlightTimeMinutes !== undefined) {
                        setModalFlightTimeMinutes(data.totalFlightTimeMinutes)
                      } else {
                        // Reload from API
                        const statsResponse = await fetch(`/api/users/by-email/${encodeURIComponent(targetEmail)}/statistics`)
                        if (statsResponse.ok) {
                          const statsData = await statsResponse.json()
                          setModalFlightTimeMinutes(statsData.totalFlightTimeMinutes || 0)
                        }
                      }
                      
                      // Reset transfer inputs
                      setTransferHours(0)
                      setTransferMinutes(0)
                      setTransferHoursInput('')
                      setTransferMinutesInput('')
                      
                      // Reload users list to reflect changes
                      await loadUsers()
                    } catch (error: any) {
                      console.error('Error adding flight hours:', error)
                      alert(error.message || 'Failed to add flight hours')
                    } finally {
                      setIsAddingHours(false)
                    }
                  }}
                  disabled={isAddingHours || ((!transferHoursInput || transferHoursInput === '0') && (!transferMinutesInput || transferMinutesInput === '0'))}
                  className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingHours ? 'Adding...' : 'Add Hours'}
                </button>
              </div>

              {/* View Details Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (editingUser && editingUser.uid) {
                      const url = `/crew-center/admin/users/${editingUser.uid}`
                      console.log('Navigating to:', url)
                      console.log('User ID:', editingUser.uid)
                      // Use window.location for reliable navigation
                      window.location.href = url
                    } else {
                      console.error('editingUser or uid is missing:', editingUser)
                    }
                  }}
                  className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-sm"
                >
                  <User className="w-5 h-5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aircraft Type Modal */}
      {isAircraftTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAircraftType ? 'Edit Aircraft Type' : 'Add Aircraft Type'}
              </h2>
              <button
                onClick={() => {
                  setIsAircraftTypeModalOpen(false)
                  setEditingAircraftType(null)
                  setAircraftTypeFormData({ name: '' })
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAircraftTypeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aircraft Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aircraftTypeFormData.name}
                  onChange={(e) => setAircraftTypeFormData({ name: e.target.value })}
                  required
                  className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Boeing 777-300ER"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAircraftTypeModalOpen(false)
                    setEditingAircraftType(null)
                    setAircraftTypeFormData({ name: '' })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  disabled={isSavingAircraftType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 neon-button rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingAircraftType}
                >
                  {isSavingAircraftType ? 'Saving...' : editingAircraftType ? 'Update Aircraft Type' : 'Add Aircraft Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Livery Modal */}
      {isLiveryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingLivery ? 'Edit Livery' : 'Add Livery'}
              </h2>
              <button
                onClick={() => {
                  setIsLiveryModalOpen(false)
                  setEditingLivery(null)
                  setLiveryFormData({ name: '' })
                  setSelectedAircraftTypeId('')
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLiverySubmit} className="p-6 space-y-4">
              {!editingLivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aircraft Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedAircraftTypeId || ''}
                    onChange={(e) => {
                      const selectedValue = e.target.value
                      console.log('Aircraft Type selected:', selectedValue)
                      setSelectedAircraftTypeId(selectedValue)
                    }}
                    required={!editingLivery}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" className="text-gray-500">
                      Select Aircraft Type
                    </option>
                    {aircraftTypes.map((at) => (
                      <option key={at.id} value={at.id} className="text-gray-900">
                        {at.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livery Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={liveryFormData.name}
                  onChange={(e) => setLiveryFormData({ name: e.target.value })}
                  required
                  className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., MXVA Standard"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsLiveryModalOpen(false)
                    setEditingLivery(null)
                    setLiveryFormData({ name: '' })
                    setSelectedAircraftTypeId('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  disabled={isSavingLivery}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 neon-button rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingLivery}
                >
                  {isSavingLivery ? 'Saving...' : editingLivery ? 'Update Livery' : 'Add Livery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Bulk Import Fleet Data</h2>
              <button
                onClick={() => {
                  setIsImportModalOpen(false)
                  setImportResult(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition"
                disabled={isImporting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON File <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a JSON file with the following format:
                  <br />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {`{ "Aircraft Type": ["Livery1", "Livery2", ...] }`}
                  </code>
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    setIsImporting(true)
                    setImportResult(null)

                    try {
                      const text = await file.text()
                      const fleetData = JSON.parse(text)

                      // Validate JSON structure
                      if (typeof fleetData !== 'object' || Array.isArray(fleetData)) {
                        throw new Error('Invalid JSON format: Expected an object with aircraft types as keys')
                      }

                      // Call import API
                      const response = await fetch('/api/admin/fleet/import', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          fleetData,
                          adminEmail: user?.email || null,
                        }),
                      })

                      const result = await response.json()

                      if (!response.ok) {
                        // Format error message with details if available
                        let errorMessage = result.error || 'Failed to import fleet data'
                        if (result.details && Array.isArray(result.details)) {
                          errorMessage += '\n\n' + result.details.join('\n')
                        }
                        throw new Error(errorMessage)
                      }

                      setImportResult({
                        success: true,
                        summary: result.summary,
                      })

                      // Reload aircraft types
                      await loadAircraftTypes()
                    } catch (error: any) {
                      console.error('Import error:', error)
                      setImportResult({
                        success: false,
                        error: error.message || 'Failed to import fleet data',
                      })
                    } finally {
                      setIsImporting(false)
                    }
                  }}
                  disabled={isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {isImporting && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-600">Importing fleet data...</p>
                  </div>
                </div>
              )}

              {importResult && (
                <div className={`rounded-lg p-4 ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {importResult.success ? (
                    <div>
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-green-900">Import Successful!</h3>
                      </div>
                      {importResult.summary && (
                        <div className="text-sm text-green-800 space-y-1">
                          <p>
                            <strong>Aircraft Types:</strong> {importResult.summary.aircraftTypesCreated} created
                          </p>
                          <p>
                            <strong>Liveries:</strong> {importResult.summary.liveriesCreated} created
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center mb-2">
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="text-lg font-semibold text-red-900">Import Failed</h3>
                      </div>
                      <p className="text-sm text-red-800 whitespace-pre-line">{importResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false)
                    setImportResult(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  disabled={isImporting}
                >
                  {importResult?.success ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIREP Detail Modal */}
      {isPirepModalOpen && selectedPirep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">PIREP Details</h2>
              <button
                onClick={() => {
                  setIsPirepModalOpen(false)
                  setSelectedPirep(null)
                  setAdminComment('')
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-semibold rounded ${
                  selectedPirep.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedPirep.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedPirep.status.toUpperCase()}
                </span>
                <div className="text-sm text-gray-500">
                  Submitted: {new Date(selectedPirep.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Flight Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Date</label>
                  <p className="text-gray-900">{new Date(selectedPirep.flightDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                  <p className="text-gray-900">{selectedPirep.flightNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Time</label>
                  <p className="text-gray-900">{selectedPirep.flightTime}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <p className="text-gray-900">{selectedPirep.departureAirport} → {selectedPirep.arrivalAirport}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft Type</label>
                  <p className="text-gray-900">{selectedPirep.livery.aircraftType.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Livery</label>
                  <p className="text-gray-900">{selectedPirep.livery.name}</p>
                </div>
                {selectedPirep.multiplierCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier Code</label>
                    <p className="text-gray-900">{selectedPirep.multiplierCode}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilot</label>
                  <p className="text-gray-900">{selectedPirep.user.displayName || selectedPirep.user.infiniteFlightUsername || selectedPirep.user.email}</p>
                </div>
              </div>

              {/* User Comment */}
              {selectedPirep.comment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilot Comment</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedPirep.comment}</p>
                  </div>
                </div>
              )}

              {/* Admin Comment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Comment / Reply</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                  placeholder="Add a comment or reply to the pilot..."
                />
                <button
                  onClick={handleAdminCommentSubmit}
                  disabled={isUpdatingPirep}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isUpdatingPirep ? 'Saving...' : 'Save Comment'}
                </button>
              </div>

              {/* Existing Admin Comment */}
              {selectedPirep.adminComment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Admin Comment</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedPirep.adminComment}</p>
                  </div>
                </div>
              )}

              {/* Review Information */}
              {selectedPirep.reviewedBy && selectedPirep.reviewedAt && (
                <div className="text-sm text-gray-500">
                  Reviewed on {new Date(selectedPirep.reviewedAt).toLocaleString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePirepStatusChange(selectedPirep.id, 'approved')}
                  disabled={isUpdatingPirep || selectedPirep.status === 'approved'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handlePirepStatusChange(selectedPirep.id, 'rejected')}
                  disabled={isUpdatingPirep || selectedPirep.status === 'rejected'}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Deny</span>
                </button>
                <button
                  onClick={() => handlePirepDelete(selectedPirep.id)}
                  disabled={isUpdatingPirep}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

