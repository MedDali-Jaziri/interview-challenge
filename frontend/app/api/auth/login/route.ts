import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json")

interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "doctor" | "nurse"
  phone?: string
  department?: string
  joinDate?: string
  lastLogin?: string
}

interface UsersData {
  users: User[]
}

function readUsersFile(): UsersData {
  try {
    const fileContent = fs.readFileSync(USERS_FILE_PATH, "utf8")
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Error reading users file:", error)
    return { users: [] }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const data = readUsersFile()
    const user = data.users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Remove password from response
    const { ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" +error}, { status: 500 })
  }
}
