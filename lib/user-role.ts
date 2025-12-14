/**
 * User role management for Firebase Authentication
 * This file handles role assignment using Firebase Custom Claims
 */

import { auth } from './firebase'
import type { UserRole } from './permissions'

/**
 * Admin email that should have owner and admin roles
 */
export const ADMIN_EMAIL = 'admin@test.mxva'

/**
 * Check if current user is admin or owner
 */
export async function checkUserRole(): Promise<UserRole | null> {
  const user = auth.currentUser
  if (!user || !user.email) return null

  try {
    // First try to get role from database (more reliable)
    try {
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(user.email)}`)
      if (response.ok) {
        const userData = await response.json()
        if (userData.role) {
          return userData.role as UserRole
        }
      }
    } catch (error) {
      console.error('Error fetching role from database:', error)
    }

    // Fallback to Firebase token
    const idTokenResult = await user.getIdTokenResult()
    const role = idTokenResult.claims.role as string
    if (role === 'user' || role === 'admin' || role === 'owner' || role === 'staff') {
      return role as UserRole
    }
    return null
  } catch (error) {
    console.error('Error checking user role:', error)
    return null
  }
}

/**
 * Get user role from Firebase token or database
 */
export async function getUserRole(userId?: string): Promise<UserRole | null> {
  const user = userId ? null : auth.currentUser
  if (!user && !userId) return null

  try {
    if (user && user.email) {
      // First try to get role from database (more reliable)
      try {
        const response = await fetch(`/api/users/by-email/${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const userData = await response.json()
          if (userData.role) {
            return userData.role as UserRole
          }
        }
      } catch (error) {
        console.error('Error fetching role from database:', error)
      }

      // Fallback to Firebase token
      const idTokenResult = await user.getIdTokenResult(true) // Force refresh
      const role = idTokenResult.claims.role as string
      if (role === 'user' || role === 'admin' || role === 'owner' || role === 'staff') {
        return role as UserRole
      }
      return null
    }
    // If userId is provided, we'd need to use Admin SDK
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Check if email matches admin email
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

