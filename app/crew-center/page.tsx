'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Plane, 
  Clock, 
  MapPin, 
  Award, 
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  User,
  Shield,
  ArrowUpRight,
  Plus,
  X
} from 'lucide-react'
import { isAdmin } from '@/lib/permissions'
import Link from 'next/link'
import FlightRouteMap from '@/components/FlightRouteMap'

export default function CrewCenterPage() {
  const { user, loading, role, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [flightTimeMinutes, setFlightTimeMinutes] = useState(0)
  const [isPirepModalOpen, setIsPirepModalOpen] = useState(false)
  const [isSubmittingPirep, setIsSubmittingPirep] = useState(false)
  const [liveries, setLiveries] = useState<Array<{ id: string; name: string; aircraftType: { id: string; name: string } }>>([])
  const [groupedLiveries, setGroupedLiveries] = useState<Record<string, Array<{ id: string; name: string; aircraftType: { id: string; name: string } }>>>({})
  const [selectedAircraftTypeId, setSelectedAircraftTypeId] = useState<string>('')
  const [selectedLiveryId, setSelectedLiveryId] = useState<string>('')
  const [pirepFormData, setPirepFormData] = useState({
    flightDate: '',
    flightNumber: '',
    flightTimeHours: '',
    flightTimeMinutes: '',
    departureAirport: '',
    arrivalAirport: '',
    liveryId: '',
    multiplierCode: '',
    comment: '',
  })
  const [approvedFlights, setApprovedFlights] = useState<Array<{
    id: string
    flightDate: string
    flightNumber: string
    flightTime: string
    departureAirport: string
    arrivalAirport: string
    livery: {
      name: string
      aircraftType: {
        name: string
      }
    }
    comment?: string | null
    reviewedAt?: Date | null
    multiplierCode?: string | null
    adminComment?: string | null
    createdAt?: string
  }>>([])
  const [isLoadingFlights, setIsLoadingFlights] = useState(false)
  const [selectedFlightDetail, setSelectedFlightDetail] = useState<typeof approvedFlights[0] | null>(null)
  const [isFlightDetailModalOpen, setIsFlightDetailModalOpen] = useState(false)

  // Load flight time from API
  useEffect(() => {
    if (user?.email) {
      const loadFlightTime = async () => {
        try {
          // Find user in Prisma by email to get user ID
          const response = await fetch(`/api/users/by-email/${encodeURIComponent(user.email || '')}/statistics`)
          
          if (response.ok) {
            const data = await response.json()
            setFlightTimeMinutes(data.totalFlightTimeMinutes || 0)
          } else {
            console.error('Failed to load flight time:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Error loading flight time:', error)
        }
      }
      
      // Load initially
      loadFlightTime()
      
      // Reload when window gains focus (user returns from admin panel)
      const handleFocus = () => {
        loadFlightTime()
      }
      
      // Reload when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadFlightTime()
        }
      }
      
      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [user?.email])

  // Load approved flights when flights tab is active
  useEffect(() => {
    if (activeTab === 'flights' && user?.email) {
      const loadApprovedFlights = async () => {
        setIsLoadingFlights(true)
        try {
          const response = await fetch(`/api/pireps?userEmail=${encodeURIComponent(user.email || '')}&status=approved`)
          
          if (response.ok) {
            const data = await response.json()
            setApprovedFlights(data)
          } else {
            console.error('Failed to load approved flights:', response.status, response.statusText)
            setApprovedFlights([])
          }
        } catch (error) {
          console.error('Error loading approved flights:', error)
          setApprovedFlights([])
        } finally {
          setIsLoadingFlights(false)
        }
      }
      
      loadApprovedFlights()
    }
  }, [activeTab, user?.email])

  // Load liveries when modal opens
  useEffect(() => {
    if (isPirepModalOpen) {
      const loadLiveries = async () => {
        try {
          const response = await fetch('/api/fleet')
          if (response.ok) {
            const data = await response.json()
            // Data is already sorted by API, but ensure it's sorted here as well
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
            
            // Sort by aircraft type name, then by livery name
            const sortedData = data.sort((a: any, b: any) => {
              const aircraftTypeComparison = naturalSort(a.aircraftType.name, b.aircraftType.name)
              if (aircraftTypeComparison !== 0) {
                return aircraftTypeComparison
              }
              return naturalSort(a.name, b.name)
            })
            
            setLiveries(sortedData)
            
            // Group liveries by aircraft type
            const grouped: Record<string, Array<{ id: string; name: string; aircraftType: { id: string; name: string } }>> = {}
            sortedData.forEach((livery: any) => {
              const aircraftTypeName = livery.aircraftType.name
              if (!grouped[aircraftTypeName]) {
                grouped[aircraftTypeName] = []
              }
              grouped[aircraftTypeName].push(livery)
            })
            setGroupedLiveries(grouped)
          } else {
            console.error('Failed to load liveries:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Error loading liveries:', error)
        }
      }
      loadLiveries()
    }
  }, [isPirepModalOpen])

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isPirepModalOpen) {
      setSelectedAircraftTypeId('')
      setSelectedLiveryId('')
    } else {
      // Set default date to today when modal opens
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayString = `${year}-${month}-${day}`
      setPirepFormData(prev => ({
        ...prev,
        flightDate: prev.flightDate || todayString
      }))
    }
  }, [isPirepModalOpen])

  // Reset livery selection when aircraft type changes
  useEffect(() => {
    setSelectedLiveryId('')
  }, [selectedAircraftTypeId])

  // Get available aircraft types (unique list)
  const aircraftTypes = Array.from(new Set(liveries.map(l => l.aircraftType.id)))
    .map(id => {
      const livery = liveries.find(l => l.aircraftType.id === id)
      return livery ? livery.aircraftType : null
    })
    .filter((at): at is { id: string; name: string } => at !== null)
    .sort((a, b) => {
      // Natural sort
      const regex = /(\d+|\D+)/g
      const aParts = a.name.match(regex) || []
      const bParts = b.name.match(regex) || []
      const minLength = Math.min(aParts.length, bParts.length)
      for (let i = 0; i < minLength; i++) {
        const aPart = aParts[i]
        const bPart = bParts[i]
        const aNum = parseInt(aPart, 10)
        const bNum = parseInt(bPart, 10)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          if (aNum !== bNum) return aNum - bNum
        } else {
          const comparison = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' })
          if (comparison !== 0) return comparison
        }
      }
      return aParts.length - bParts.length
    })

  // Get liveries for selected aircraft type
  const availableLiveries = selectedAircraftTypeId
    ? liveries
        .filter(l => l.aircraftType.id === selectedAircraftTypeId)
        .sort((a, b) => {
          // Natural sort
          const regex = /(\d+|\D+)/g
          const aParts = a.name.match(regex) || []
          const bParts = b.name.match(regex) || []
          const minLength = Math.min(aParts.length, bParts.length)
          for (let i = 0; i < minLength; i++) {
            const aPart = aParts[i]
            const bPart = bParts[i]
            const aNum = parseInt(aPart, 10)
            const bNum = parseInt(bPart, 10)
            if (!isNaN(aNum) && !isNaN(bNum)) {
              if (aNum !== bNum) return aNum - bNum
            } else {
              const comparison = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' })
              if (comparison !== 0) return comparison
            }
          }
          return aParts.length - bParts.length
        })
    : []

  // Format flight time from minutes to hours
  const formatFlightTimeHours = (totalMinutes: number) => {
    return Math.floor(totalMinutes / 60)
  }

  // Mock data
  const stats = {
    totalFlightTime: flightTimeMinutes > 0 ? formatFlightTimeHours(flightTimeMinutes) : 245,
    totalFlights: 89,
    thisMonth: 12,
    visitedAirports: 34,
    currentRank: 'First Officer',
  }

  const recentFlights = [
    { id: 1, departure: 'KJFK', arrival: 'EGLL', aircraft: 'Boeing 777-300ER', date: '2024-01-15', time: 420 },
    { id: 2, departure: 'KLAX', arrival: 'RJTT', aircraft: 'Boeing 787-9', date: '2024-01-14', time: 660 },
    { id: 3, departure: 'EDDF', arrival: 'KJFK', aircraft: 'Airbus A350-900', date: '2024-01-13', time: 480 },
  ]

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handlePirepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!pirepFormData.flightDate || !pirepFormData.flightNumber || 
        !pirepFormData.flightTimeHours || !pirepFormData.flightTimeMinutes ||
        !pirepFormData.departureAirport || !pirepFormData.arrivalAirport || 
        !selectedAircraftTypeId || !selectedLiveryId) {
      alert('Please fill in all required fields and select an aircraft type and livery')
      return
    }

    // Validate flight time
    const hours = parseInt(pirepFormData.flightTimeHours) || 0
    const minutes = parseInt(pirepFormData.flightTimeMinutes) || 0
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      alert('Please enter valid flight time (hours >= 0, minutes 0-59)')
      return
    }

    // Format flight time as XXhrXXmin
    const flightTime = `${hours}hr${minutes}min`

    setIsSubmittingPirep(true)

    try {
      const response = await fetch('/api/pireps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pirepFormData,
          liveryId: selectedLiveryId,
          flightTime: `${parseInt(pirepFormData.flightTimeHours) || 0}hr${parseInt(pirepFormData.flightTimeMinutes) || 0}min`,
          userEmail: user?.email || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit PIREP')
      }

      // Reset form and close modal
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayString = `${year}-${month}-${day}`
      
      setPirepFormData({
        flightDate: todayString,
        flightNumber: '',
        flightTimeHours: '',
        flightTimeMinutes: '',
        departureAirport: '',
        arrivalAirport: '',
        liveryId: '',
        multiplierCode: '',
        comment: '',
      })
      setSelectedAircraftTypeId('')
      setSelectedLiveryId('')
      setIsPirepModalOpen(false)
      
      // Show success message (you can add a toast notification here)
      alert('PIREP submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting PIREP:', error)
      alert(`Failed to submit PIREP: ${error.message}`)
    } finally {
      setIsSubmittingPirep(false)
    }
  }

  const handlePirepFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPirepFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Additional check (layout handles main auth check, but this ensures user is available)
  if (loading || !user) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 neon-sidebar rounded-lg p-6 h-fit">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-primary">Crew Center</h2>
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.displayName || user.email}</span>
                </div>
              )}
            </div>
            <nav className="space-y-2 mb-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('flights')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'flights' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Flight Log
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'statistics' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('rankings')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'rankings' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  activeTab === 'settings' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
              {isAdmin(role) && (
                <Link
                  href="/crew-center/admin"
                  className="w-full text-left px-4 py-2 rounded-md transition flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <button
                    onClick={() => {
                      setSelectedAircraftTypeId('')
                      setSelectedLiveryId('')
                      setIsPirepModalOpen(true)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 neon-button rounded-md hover:bg-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                    <span>File PIREP</span>
                  </button>
                </div>

                {isAdmin(role) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/crew-center/admin"
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow transition"
                    >
                      <div>
                        <p className="text-sm text-blue-700 font-semibold">Admin Panel</p>
                        <p className="text-gray-700 text-sm">Manage users, applications, and settings</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-blue-700" />
                    </Link>
                  </div>
                )}
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="neon-stats-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-gray-900">{stats.totalFlightTime}</span>
                    </div>
                    <p className="text-gray-700">Total Flight Time (hours)</p>
                  </div>
                  
                  <div className="neon-stats-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Plane className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-gray-900">{stats.totalFlights}</span>
                    </div>
                    <p className="text-gray-700">Total Flights</p>
                  </div>
                  
                  <div className="neon-stats-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-gray-900">{stats.thisMonth}</span>
                    </div>
                    <p className="text-gray-700">This Month</p>
                  </div>
                  
                  <div className="neon-stats-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-gray-900">{stats.visitedAirports}</span>
                    </div>
                    <p className="text-gray-700">Visited Airports</p>
                  </div>
                </div>

                {/* Rank Card */}
                <div className="neon-card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Current Rank</p>
                      <h2 className="text-2xl font-bold text-primary">{stats.currentRank}</h2>
                    </div>
                    <Award className="w-12 h-12 text-primary" />
                  </div>
                </div>

                {/* Recent Flights */}
                <div className="neon-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                  <div className="space-y-4">
                    {recentFlights.map((flight) => (
                      <div key={flight.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {flight.departure} → {flight.arrival}
                            </p>
                            <p className="text-sm text-gray-600">{flight.aircraft}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{flight.date}</p>
                            <p className="text-sm text-gray-600">{flight.time} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link 
                    href="/crew-center/flights"
                    className="block text-center mt-4 text-primary hover:underline"
                  >
                    View All Flights →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'flights' && (
              <div className="neon-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Flight Log</h1>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
                
                {isLoadingFlights ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Loading flights...</span>
                  </div>
                ) : approvedFlights.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No approved flights yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your approved PIREPs will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Flight Number</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Aircraft</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Flight Time</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Livery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approvedFlights.map((flight) => (
                            <tr 
                              key={flight.id} 
                              className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                              onClick={() => {
                                setSelectedFlightDetail(flight)
                                setIsFlightDetailModalOpen(true)
                              }}
                            >
                              <td className="py-3 px-4 text-gray-700">
                                {new Date(flight.flightDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-4 text-gray-700 font-medium">{flight.flightNumber}</td>
                              <td className="py-3 px-4 text-gray-700">
                                <span className="font-semibold">{flight.departureAirport}</span>
                                <span className="mx-2 text-gray-400">→</span>
                                <span className="font-semibold">{flight.arrivalAirport}</span>
                              </td>
                              <td className="py-3 px-4 text-gray-700">{flight.livery.aircraftType.name}</td>
                              <td className="py-3 px-4 text-gray-700">{flight.flightTime}</td>
                              <td className="py-3 px-4 text-gray-600">{flight.livery.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Showing {approvedFlights.length} approved {approvedFlights.length === 1 ? 'flight' : 'flights'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="neon-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
                <p className="text-gray-600">Statistics and charts will be displayed here.</p>
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="neon-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Rankings</h1>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
                <p className="text-gray-600">Rankings will be displayed here.</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="neon-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
                <p className="text-gray-600">Profile management will be available here.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="neon-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
                <p className="text-gray-600">Settings will be available here.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* PIREP Modal */}
      {isPirepModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">File PIREP</h2>
              <button
                onClick={() => {
                  const today = new Date()
                  const year = today.getFullYear()
                  const month = String(today.getMonth() + 1).padStart(2, '0')
                  const day = String(today.getDate()).padStart(2, '0')
                  const todayString = `${year}-${month}-${day}`
                  
                  setPirepFormData(prev => ({
                    ...prev,
                    flightDate: todayString
                  }))
                  setSelectedAircraftTypeId('')
                  setSelectedLiveryId('')
                  setIsPirepModalOpen(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handlePirepSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="date"
                    name="flightDate"
                    value={pirepFormData.flightDate}
                    onChange={handlePirepFormChange}
                    required
                    lang="en-US"
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-900 text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                    style={{
                      colorScheme: 'light',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={pirepFormData.flightNumber}
                  onChange={handlePirepFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., MX123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="number"
                      name="flightTimeHours"
                      value={pirepFormData.flightTimeHours}
                      onChange={handlePirepFormChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      name="flightTimeMinutes"
                      value={pirepFormData.flightTimeMinutes}
                      onChange={handlePirepFormChange}
                      required
                      min="0"
                      max="59"
                      className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure ICAO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="departureAirport"
                    value={pirepFormData.departureAirport}
                    onChange={handlePirepFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    placeholder="e.g., KJFK"
                    maxLength={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival ICAO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="arrivalAirport"
                    value={pirepFormData.arrivalAirport}
                    onChange={handlePirepFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    placeholder="e.g., EGLL"
                    maxLength={4}
                  />
                </div>
              </div>

              {/* Flight Route Map Preview */}
              {pirepFormData.departureAirport.trim().length === 4 && pirepFormData.arrivalAirport.trim().length === 4 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Preview
                  </label>
                  <FlightRouteMap
                    departureAirport={pirepFormData.departureAirport}
                    arrivalAirport={pirepFormData.arrivalAirport}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aircraft Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="aircraftTypeId"
                  value={selectedAircraftTypeId}
                  onChange={(e) => setSelectedAircraftTypeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                >
                  <option value="">Select Aircraft Type</option>
                  {aircraftTypes.map((aircraftType) => (
                    <option key={aircraftType.id} value={aircraftType.id}>
                      {aircraftType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livery <span className="text-red-500">*</span>
                </label>
                <select
                  name="liveryId"
                  value={selectedLiveryId}
                  onChange={(e) => setSelectedLiveryId(e.target.value)}
                  required
                  disabled={!selectedAircraftTypeId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedAircraftTypeId ? 'Select Livery' : 'Please select Aircraft Type first'}
                  </option>
                  {availableLiveries.map((livery) => (
                    <option key={livery.id} value={livery.id}>
                      {livery.name}
                    </option>
                  ))}
                </select>
                {!selectedAircraftTypeId && (
                  <p className="text-xs text-gray-500 mt-1">Please select an Aircraft Type first</p>
                )}
                {selectedAircraftTypeId && !selectedLiveryId && (
                  <p className="text-xs text-red-500 mt-1">Please select a Livery</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multiplier Code (if applicable)
                </label>
                <input
                  type="text"
                  name="multiplierCode"
                  value={pirepFormData.multiplierCode}
                  onChange={handlePirepFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., X2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  name="comment"
                  value={pirepFormData.comment}
                  onChange={handlePirepFormChange}
                  rows={3}
                  className="w-full px-3 py-2 neon-input border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                  placeholder="Additional comments about the flight..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const year = today.getFullYear()
                    const month = String(today.getMonth() + 1).padStart(2, '0')
                    const day = String(today.getDate()).padStart(2, '0')
                    const todayString = `${year}-${month}-${day}`
                    
                    setPirepFormData(prev => ({
                      ...prev,
                      flightDate: todayString
                    }))
                    setSelectedAircraftTypeId('')
                    setSelectedLiveryId('')
                    setIsPirepModalOpen(false)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  disabled={isSubmittingPirep}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 neon-button rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingPirep}
                >
                  {isSubmittingPirep ? 'Submitting...' : 'Submit PIREP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flight Detail Modal */}
      {isFlightDetailModalOpen && selectedFlightDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neon-modal rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Flight Details</h2>
              <button
                onClick={() => {
                  setSelectedFlightDetail(null)
                  setIsFlightDetailModalOpen(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Flight Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Flight Date
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedFlightDetail.flightDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Flight Number
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedFlightDetail.flightNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Departure Airport
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{selectedFlightDetail.departureAirport}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Arrival Airport
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{selectedFlightDetail.arrivalAirport}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Aircraft Type
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedFlightDetail.livery.aircraftType.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Livery
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedFlightDetail.livery.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Flight Time
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedFlightDetail.flightTime}</p>
                </div>

                {selectedFlightDetail.multiplierCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Multiplier Code
                    </label>
                    <p className="text-gray-900 font-semibold">{selectedFlightDetail.multiplierCode}</p>
                  </div>
                )}
              </div>

              {/* Comment */}
              {selectedFlightDetail.comment && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Comment
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFlightDetail.comment}</p>
                  </div>
                </div>
              )}

              {/* Admin Comment */}
              {selectedFlightDetail.adminComment && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Admin Comment
                  </label>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFlightDetail.adminComment}</p>
                  </div>
                </div>
              )}

              {/* Status and Review Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                  {selectedFlightDetail.reviewedAt && (
                    <p className="text-sm text-gray-500">
                      Reviewed on {new Date(selectedFlightDetail.reviewedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedFlightDetail(null)
                  setIsFlightDetailModalOpen(false)
                }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
