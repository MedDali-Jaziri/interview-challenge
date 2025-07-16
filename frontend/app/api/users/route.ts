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

function writeUsersFile(data: UsersData): void {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(USERS_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error writing users file:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    const data = readUsersFile()

    if (userId) {
      const user = data.users.find((u) => u.id === userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Remove password from response
      const { ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })
    }

    // Return all users without passwords
    const usersWithoutPasswords = data.users.map(({ ...user }) => user)
    return NextResponse.json({ users: usersWithoutPasswords })
  } catch (error) {
    return NextResponse.json({ error: "Failed to read users" + error}, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, department } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const data = readUsersFile()
    const userIndex = data.users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user information
    data.users[userIndex] = {
      ...data.users[userIndex],
      name: name || data.users[userIndex].name,
      email: email || data.users[userIndex].email,
      phone: phone || data.users[userIndex].phone,
      department: department || data.users[userIndex].department,
    }

    writeUsersFile(data)

    // Return updated user without password
    const { ...updatedUser } = data.users[userIndex]
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" + error}, { status: 500 })
  }
}
