"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import toast from "react-hot-toast"
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa"
import "./Login.css" // Reutilizamos los estilos del login

const Register = () => {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !email || !password || !confirmPassword) {
      toast.error("Todos los campos son obligatorios.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Correo electrónico inválido.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.")
      return
    }

    try {
      setIsLoading(true)
      // Aquí iría tu lógica de registro (ej: API)
      // await registerUser({ nombre, email, password })
      toast.success("Cuenta creada exitosamente.")
      navigate("/login")
    } catch (error: any) {
      toast.error("Error al registrar. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const isDark = document.documentElement.classList.contains("dark")

  return (
    <div className="login-container">
      <div className={`login-box ${isDark ? "dark" : ""}`}>
        <div className="login-header">
          <FaUserPlus className="mx-auto h-14 w-14" />
          <h2>Crear cuenta</h2>
          <p>Regístrese para comenzar a usar el sistema</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              type="text"
              id="nombre"
              label="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              fullWidth
              disabled={isLoading}
            />

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
            />

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
                disabled={isLoading}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </span>
            </div>

            <Input
              type="password"
              id="confirmPassword"
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              disabled={isLoading}
            />
          </div>

          <Button type="submit" isLoading={isLoading} fullWidth size="lg" disabled={isLoading}>
            {isLoading ? "Registrando..." : (
              <>
                <FaUserPlus className="inline mr-2" />
                Registrarse
              </>
            )}
          </Button>
        </form>

        <div className="login-footer">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <button onClick={() => navigate("/login")}>
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
