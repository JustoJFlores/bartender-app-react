"use client"

import { NavLink } from "react-router-dom"
import { Home, Droplet, Coffee, ShoppingCart, BarChart2, X } from "lucide-react"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Ingredientes", href: "/ingredients", icon: Droplet },
    { name: "Recetas", href: "/recipes", icon: Coffee },
    { name: "Pedidos", href: "/orders", icon: ShoppingCart },
    { name: "Reportes", href: "/reports", icon: BarChart2 },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={() => setOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transition-transform duration-300 ease-in-out transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 lg:z-auto`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-white">Bartender</span>
          </div>
          <button className="text-gray-400 hover:text-white lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
