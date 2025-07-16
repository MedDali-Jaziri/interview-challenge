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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: "User ID, current password, and new password are required",
        },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "New password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    const data = readUsersFile()
    const userIndex = data.users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (data.users[userIndex].password !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    data.users[userIndex].password = newPassword

    writeUsersFile(data)

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to change password" + error }, { status: 500 })
  }
}
