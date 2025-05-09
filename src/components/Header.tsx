"use client"

import { Menu, Bell, User } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-3 text-xl font-semibold text-gray-800">Sistema de Bartender</h1>
          </div>
          <div className="flex items-center">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Bell className="h-6 w-6" />
            </button>

            <div className="ml-3 relative" ref={menuRef}>
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-gray-700">{user?.username}</span>
                </button>
              </div>
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-xs text-gray-500">{user?.email}</div>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
