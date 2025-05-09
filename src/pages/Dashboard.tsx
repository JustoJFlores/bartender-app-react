import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/Card"
import { Spinner } from "../components/ui/Spinner"
import { Table, TableColumn } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardData {
  totalOrders: number
  lowStockCount: number
  popularDrinks: Array<{
    id: number
    name: string
    count: number
  }>
}

interface Order {
  id: number
  user: string
  drink: string
  status: "Pendiente" | "En preparación" | "Completado" | "Cancelado"
  createdAt: string
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    lowStockCount: 0,
    popularDrinks: [],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const [dashboardResponse, ordersResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/reports/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/orders/admin", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (dashboardResponse.data.success) {
          setDashboardData(dashboardResponse.data.data)
        }

        if (ordersResponse.data.success) {
          const formattedOrders = ordersResponse.data.data.map((order: any) => ({
            id: order.id,
            user: order.user.username,
            drink: order.items[0].drink.name,
            status: mapOrderStatus(order.status),
            createdAt: new Date(order.created_at).toLocaleString(),
          }))
          setOrders(formattedOrders)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    const ws = new WebSocket("ws://localhost:3000/ws")
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "ORDER_UPDATE") {
        fetchDashboardData()
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const mapOrderStatus = (status: string): Order["status"] => {
    const statusMap: Record<string, Order["status"]> = {
      pending: "Pendiente",
      preparing: "En preparación",
      completed: "Completado",
      cancelled: "Cancelado",
    }
    return statusMap[status] || "Pendiente"
  }

  const getStatusBadge = (status: Order["status"]) => {
    const variantMap: Record<Order["status"], "warning" | "info" | "success" | "danger"> = {
      Pendiente: "warning",
      "En preparación": "info",
      Completado: "success",
      Cancelado: "danger",
    }

    return <Badge variant={variantMap[status]}>{status}</Badge>
  }

  const orderColumns: TableColumn<Order>[] = [
    { header: "ID", accessor: "id" },
    { header: "Usuario", accessor: "user" },
    { header: "Bebida", accessor: "drink" },
    { header: "Estado", accessor: (order) => getStatusBadge(order.status) },
    { header: "Fecha", accessor: "createdAt" },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="text-center">
            <h2 className="text-lg font-medium">Pedidos del día</h2>
            <p className="text-4xl font-bold mt-2">{dashboardData.totalOrders}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="text-center">
            <h2 className="text-lg font-medium">Ingredientes bajos en stock</h2>
            <p className="text-4xl font-bold mt-2">{dashboardData.lowStockCount}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <h2 className="text-lg font-medium">Bebidas populares</h2>
            <p className="text-4xl font-bold mt-2">
              {Array.isArray(dashboardData.popularDrinks) ? dashboardData.popularDrinks.length : 0}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Bebidas más pedidas">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.popularDrinks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Pedidos en tiempo real">
        <Table
          columns={orderColumns}
          data={orders}
          keyExtractor={(order) => order.id.toString()}
          emptyMessage="No hay pedidos disponibles"
        />
      </Card>
    </div>
  )
}

export default Dashboard
