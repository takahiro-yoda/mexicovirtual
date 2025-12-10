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
  if (!user) return null

  try {
    const idTokenResult = await user.getIdTokenResult()
    const role = idTokenResult.claims.role as string
    if (role === 'user' || role === 'admin' || role === 'owner') {
      return role as UserRole
    }
    return null
  } catch (error) {
    console.error('Error checking user role:', error)
    return null
  }
}

/**
 * Get user role from Firebase token
 */
export async function getUserRole(userId?: string): Promise<UserRole | null> {
  const user = userId ? null : auth.currentUser
  if (!user && !userId) return null

  try {
    if (user) {
      const idTokenResult = await user.getIdTokenResult(true) // Force refresh
      const role = idTokenResult.claims.role as string
      if (role === 'user' || role === 'admin' || role === 'owner') {
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

