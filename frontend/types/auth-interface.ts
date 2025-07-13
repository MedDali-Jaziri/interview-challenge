export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "doctor" | "nurse"
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}
