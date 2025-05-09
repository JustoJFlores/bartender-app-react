"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingScreen from "./LoadingScreen"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
