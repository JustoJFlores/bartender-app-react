"use client"

import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { useState } from "react"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
