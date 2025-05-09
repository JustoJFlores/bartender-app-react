"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get("http://localhost:3000/api/auth/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          setUser(response.data.data)
        } else {
          localStorage.removeItem("token")
          setToken(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        localStorage.removeItem("token")
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/admin/login", {
        email,
        password,
      })

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data
        localStorage.setItem("token", newToken)
        setToken(newToken)
        setUser(userData)
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
