export type UserRole = "admin" | "doctor" | "nurse"

export interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface RolePermissions {
  patients: Permission
  medications: Permission
  assignments: Permission
  settings: Permission
  userManagement: boolean
}