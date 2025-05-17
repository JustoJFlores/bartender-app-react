"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"

const Register = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [errorUsername, setErrorUsername] = useState(false)
  const [errorEmail, setErrorEmail] = useState(false)
  const [errorPassword, setErrorPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const validateFields = (): boolean => {
    let isValid = true
    setErrorUsername(false)
    setErrorEmail(false)
    setErrorPassword(false)

    if (!username) {
      toast.error("El nombre de usuario es obligatorio.")
      setErrorUsername(true)
      isValid = false
    }

    if (!email) {
      toast.error("El correo electrónico es obligatorio.")
      setErrorEmail(true)
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Ingrese un correo electrónico válido.")
      setErrorEmail(true)
      isValid = false
    }

    if (!password) {
      toast.error("La contraseña es obligatoria.")
      setErrorPassword(true)
      isValid = false
    }

    return isValid
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "operator",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Ocurrió un error durante el registro.")
      }

      await login(email, password, true)
      toast.success("Registro exitoso. Bienvenido.")
      navigate("/dashboard")
    } catch (error: any) {
      console.error("Registro error:", error)
      toast.error(error.message || "Ocurrió un error durante el registro.")
      navigate("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <FaUserPlus className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Crear una cuenta</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Regístrese para acceder al sistema de bartender
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <Input
              id="username"
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: bartender123"
              required
              fullWidth
              disabled={isLoading}
              aria-invalid={errorUsername}
            />
            {errorUsername && (
              <p className="text-sm text-red-600 mt-1">Ingrese un nombre de usuario válido</p>
            )}
          </div>

          <div>
            <Input
              type="email"
              id="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              fullWidth
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={errorEmail}
            />
            {errorEmail && (
              <p className="text-sm text-red-600 mt-1">Ingrese un correo válido</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              className="pr-10"
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={errorPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
            {errorPassword && (
              <p className="text-sm text-red-600 mt-1">La contraseña es obligatoria</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} fullWidth size="lg" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
