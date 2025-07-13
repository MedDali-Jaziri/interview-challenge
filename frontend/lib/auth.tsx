"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { User, AuthContextType } from "@/types/auth-interface"


const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const localUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@oxyera.com",
    password: "admin123",
    name: "Dr. Mohamed Ali (Dali)",
    role: "admin",
  },
  {
    id: "2",
    email: "doctor@oxyera.com",
    password: "doctor123",
    name: "Dr. Francesco",
    role: "doctor",
  },
  {
    id: "3",
    email: "nurse@oxyera.com",
    password: "nurse123",
    name: "Nurse Cristina",
    role: "nurse",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("healthflow_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = localUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("healthflow_user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("healthflow_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
