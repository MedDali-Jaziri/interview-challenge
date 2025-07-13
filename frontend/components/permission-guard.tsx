"use client"

import type React from "react"
import { useAuth } from "@/lib/auth"
import { hasPermission, canManageUsers } from "@/lib/permissions"
import { type UserRole } from "@/types/permissions-interface"

interface PermissionGuardProps {
  children: React.ReactNode
  resource?: "patients" | "medications" | "assignments" | "settings"
  action?: "create" | "read" | "update" | "delete"
  requireUserManagement?: boolean
  fallback?: React.ReactNode
  allowedRoles?: UserRole[]
}

export function PermissionGuard({
  children,
  resource,
  action,
  requireUserManagement = false,
  fallback = null,
  allowedRoles,
}: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  // Check if user role is in allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  // Check user management permission
  if (requireUserManagement && !canManageUsers(user.role)) {
    return <>{fallback}</>
  }

  // Check resource-specific permission
  if (resource && action && !hasPermission(user.role, resource, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
