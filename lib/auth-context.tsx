'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from './firebase'
import { getUserRole, isAdminEmail } from './user-role'
import { getUserPermissions, type UserRole } from './permissions'

interface AuthContextType {
  user: User | null
  loading: boolean
  role: UserRole | null
  permissions: ReturnType<typeof getUserPermissions> | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  permissions: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<ReturnType<typeof getUserPermissions> | null>(null)

  useEffect(() => {
    // Fallback timeout: ensure loading is set to false after maximum 15 seconds
    const fallbackTimeout = setTimeout(() => {
      setLoading(false)
    }, 15000)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user)
        
        if (user && user.email) {
          // Sync user to Prisma database automatically
          try {
            const syncController = new AbortController()
            const syncTimeout = setTimeout(() => syncController.abort(), 8000)
            
            await fetch('/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                displayName: user.displayName,
                uid: user.uid,
              }),
              signal: syncController.signal,
            })
            clearTimeout(syncTimeout)
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Error syncing user to Prisma:', error)
            }
            // Don't block login if sync fails
          }
          
          // Check if user is admin email
          if (isAdminEmail(user.email)) {
            setRole('owner')
            setPermissions(getUserPermissions('owner'))
          } else {
            // Get role from database first (most reliable)
            try {
              const roleController = new AbortController()
              const roleTimeout = setTimeout(() => roleController.abort(), 8000)
              
              const response = await fetch(`/api/users/by-email/${encodeURIComponent(user.email)}`, {
                signal: roleController.signal,
              })
              clearTimeout(roleTimeout)
              
              if (response.ok) {
                const userData = await response.json()
                if (userData.role) {
                  const dbRole = userData.role as UserRole
                  setRole(dbRole)
                  setPermissions(getUserPermissions(dbRole))
                } else {
                  // Fallback to Firebase token if no role in database
                  try {
                    const userRole = await Promise.race([
                      getUserRole(),
                      new Promise<UserRole | null>((_, reject) =>
                        setTimeout(() => reject(new Error('getUserRole timeout')), 5000)
                      ),
                    ])
                    const finalRole = userRole || 'user'
                    setRole(finalRole as UserRole)
                    setPermissions(getUserPermissions(finalRole))
                  } catch (fallbackError) {
                    console.error('Error getting user role from Firebase:', fallbackError)
                    setRole('user')
                    setPermissions(getUserPermissions('user'))
                  }
                }
              } else {
                // Fallback to Firebase token if database fetch fails
                try {
                  const userRole = await Promise.race([
                    getUserRole(),
                    new Promise<UserRole | null>((_, reject) =>
                      setTimeout(() => reject(new Error('getUserRole timeout')), 5000)
                    ),
                  ])
                  const finalRole = userRole || 'user'
                  setRole(finalRole as UserRole)
                  setPermissions(getUserPermissions(finalRole))
                } catch (fallbackError) {
                  console.error('Error getting user role from Firebase:', fallbackError)
                  setRole('user')
                  setPermissions(getUserPermissions('user'))
                }
              }
            } catch (error: any) {
              if (error.name !== 'AbortError') {
                console.error('Error getting user role from database:', error)
              }
              // Fallback to Firebase token
              try {
                const userRole = await Promise.race([
                  getUserRole(),
                  new Promise<UserRole | null>((_, reject) =>
                    setTimeout(() => reject(new Error('getUserRole timeout')), 5000)
                  ),
                ])
                const finalRole = userRole || 'user'
                setRole(finalRole as UserRole)
                setPermissions(getUserPermissions(finalRole))
              } catch (fallbackError) {
                console.error('Error getting user role from Firebase:', fallbackError)
                setRole('user')
                setPermissions(getUserPermissions('user'))
              }
            }
          }
        } else {
          // User is null (logged out)
          setRole(null)
          setPermissions(null)
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        // Ensure loading is set to false even on error
        setRole(null)
        setPermissions(null)
      } finally {
        // Always set loading to false, even if there's an error
        clearTimeout(fallbackTimeout)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(fallbackTimeout)
      unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
    // Router navigation will be handled by the component that calls signOut
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, permissions, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
