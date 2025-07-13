"use client"

import { UserRole, RolePermissions, Permission} from "@/types/permissions-interface"

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    patients: { create: true, read: true, update: true, delete: true },
    medications: { create: true, read: true, update: true, delete: true },
    assignments: { create: true, read: true, update: true, delete: true },
    settings: { create: true, read: true, update: true, delete: true },
    userManagement: true,
  },
  doctor: {
    patients: { create: true, read: true, update: true, delete: true },
    medications: { create: true, read: true, update: true, delete: true },
    assignments: { create: true, read: true, update: true, delete: true },
    settings: { create: false, read: true, update: true, delete: false },
    userManagement: false,
  },
  nurse: {
    patients: { create: false, read: true, update: false, delete: false },
    medications: { create: false, read: true, update: false, delete: false },
    assignments: { create: false, read: true, update: true, delete: false },
    settings: { create: false, read: true, update: true, delete: false },
    userManagement: false,
  },
}

// Helper functions to check permissions
export function hasPermission(
  userRole: UserRole,
  resource: keyof Omit<RolePermissions, "userManagement">,
  action: keyof Permission,
): boolean {
  return ROLE_PERMISSIONS[userRole][resource][action]
}

export function canManageUsers(userRole: UserRole): boolean {
  return ROLE_PERMISSIONS[userRole].userManagement
}

export function getResourcePermissions(
  userRole: UserRole,
  resource: keyof Omit<RolePermissions, "userManagement">,
): Permission {
  return ROLE_PERMISSIONS[userRole][resource]
}

// Custom hook for permissions
export function usePermissions() {
  return {
    hasPermission,
    canManageUsers,
    getResourcePermissions,
    ROLE_PERMISSIONS,
  }
}
