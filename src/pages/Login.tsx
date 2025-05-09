"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import toast from "react-hot-toast"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación de campos
    if (!email || !password) {
      toast.error("Por favor, complete todos los campos.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Por favor, ingrese un correo electrónico válido.")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.response?.status === 401) {
        toast.error("Credenciales inválidas. Por favor, intente de nuevo.")
      } else {
        toast.error("Ocurrió un error inesperado. Intente más tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sistema de Bartender</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicie sesión para acceder al panel de administración
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Input
                type="email"
                id="email"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                placeholder="correo@ejemplo.com"
                aria-label="Correo electrónico"
              />
            </div>
            <div className="mb-6">
              <Input
                type="password"
                id="password"
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                placeholder="••••••••"
                aria-label="Contraseña"
              />
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} fullWidth size="lg" disabled={isLoading}>
              {isLoading ? <span className="loader"></span> : "Iniciar sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
