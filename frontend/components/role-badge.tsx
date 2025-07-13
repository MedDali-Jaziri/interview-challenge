"use client"

import { Badge } from "@/components/ui/badge"
import { type UserRole } from "@/types/permissions-interface"
import { Shield, UserCheck, Heart } from "lucide-react"

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
  variant?: "default" | "secondary" | "outline"
}

export function RoleBadge({ role, showIcon = false, variant = "default" }: RoleBadgeProps) {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          label: "Administrator",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Shield,
        }
      case "doctor":
        return {
          label: "Doctor",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: UserCheck,
        }
      case "nurse":
        return {
          label: "Nurse",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Heart,
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  return (
    <Badge className={variant === "default" ? config.color : ""} variant={variant}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
