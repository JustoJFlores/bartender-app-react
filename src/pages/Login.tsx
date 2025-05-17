"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import toast from "react-hot-toast"
import { FaEye, FaEyeSlash, FaGlassCheers } from "react-icons/fa"
import "./Login.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  const [errorEmail, setErrorEmail] = useState(false)
  const [errorPassword, setErrorPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const validateFields = (): boolean => {
    let isValid = true
    setErrorEmail(false)
    setErrorPassword(false)

    if (!email) {
      toast.error("El campo de correo es obligatorio.")
      setErrorEmail(true)
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Por favor, ingrese un correo electrónico válido.")
      setErrorEmail(true)
      isValid = false
    }

    if (!password) {
      toast.error("El campo de contraseña es obligatorio.")
      setErrorPassword(true)
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields()) return

    setIsLoading(true)
    try {
      await login(email, password, remember)
      navigate("/dashboard")
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 401
          ? "Credenciales inválidas. Por favor, intente de nuevo."
          : "Ocurrió un error inesperado. Intente más tarde."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isDark = document.documentElement.classList.contains("dark")

  return (
    <div className="login-container">
      <div className={`login-box ${isDark ? "dark" : ""}`}>
        <div className="login-header">
          <FaGlassCheers className="mx-auto h-14 w-14" />
          <h2>Sistema de Bartender</h2>
          <p>Inicie sesión para acceder al panel de administración</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                id="email"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                aria-invalid={errorEmail}
                disabled={isLoading}
              />
              {errorEmail && (
                <p className="error-message">Ingrese un correo válido</p>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={errorPassword}
                disabled={isLoading}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </span>
              {errorPassword && (
                <p className="error-message">La contraseña es obligatoria</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Recordarme
              </label>
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} fullWidth size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Cargando...
                </div>
              ) : (
                <>
                  <FaGlassCheers className="inline mr-2" />
                  Iniciar sesión
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="login-footer">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{" "}
            <button onClick={() => navigate("/register")}>
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
