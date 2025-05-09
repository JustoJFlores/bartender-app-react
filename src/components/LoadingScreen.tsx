import { Spinner } from "./ui/Spinner"

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
