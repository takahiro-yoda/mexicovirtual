/**
 * Permission and role management utilities
 */

export type UserRole = 'user' | 'admin' | 'owner' | 'staff'

export interface UserPermissions {
  role: UserRole
  isOwner: boolean
  isAdmin: boolean
  isUser: boolean
}

/**
 * Check if user has owner role
 */
export function isOwner(role?: string | null): boolean {
  return role === 'owner'
}

/**
 * Check if user has admin role (includes owner and staff)
 */
export function isAdmin(role?: string | null): boolean {
  return role === 'admin' || role === 'owner' || role === 'staff'
}

/**
 * Check if user has specific role
 */
export function hasRole(userRole?: string | null, requiredRole: UserRole = 'user'): boolean {
  if (!userRole) return false
  
  if (requiredRole === 'owner') {
    return userRole === 'owner'
  }
  if (requiredRole === 'admin') {
    return userRole === 'admin' || userRole === 'owner' || userRole === 'staff'
  }
  return true // user role - everyone has it
}

/**
 * Get user permissions object
 */
export function getUserPermissions(role?: string | null): UserPermissions {
  const userRole = (role as UserRole) || 'user'
  
  return {
    role: userRole,
    isOwner: isOwner(role),
    isAdmin: isAdmin(role),
    isUser: true,
  }
}

/**
 * Owner permissions
 * - Full system access
 * - Can manage all users (including other owners and admins)
 * - Can modify system settings
 * - Can delete any content
 */
export const OWNER_PERMISSIONS = {
  manageUsers: true,
  manageAdmins: true,
  manageOwners: true,
  manageApplications: true,
  manageSystemSettings: true,
  viewAllStatistics: true,
  deleteAnyContent: true,
}

/**
 * Admin permissions
 * - Can manage regular users
 * - Can manage applications
 * - Can view all statistics
 * - Cannot manage other admins or owners
 * - Cannot modify system settings
 */
export const ADMIN_PERMISSIONS = {
  manageUsers: true,
  manageAdmins: false,
  manageOwners: false,
  manageApplications: true,
  manageSystemSettings: false,
  viewAllStatistics: true,
  deleteAnyContent: false,
}

/**
 * Get permissions for a role
 */
export function getPermissions(role?: string | null) {
  if (isOwner(role)) {
    return OWNER_PERMISSIONS
  }
  if (isAdmin(role)) {
    return ADMIN_PERMISSIONS
  }
  return {
    manageUsers: false,
    manageAdmins: false,
    manageOwners: false,
    manageApplications: false,
    manageSystemSettings: false,
    viewAllStatistics: false,
    deleteAnyContent: false,
  }
}


