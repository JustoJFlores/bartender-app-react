"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Table, TableColumn } from "../components/ui/Table" // Asegúrate de importar TableColumn
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Select } from "../components/ui/Select"
import { Eye, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface OrderItem {
  id: number
  drink_id: number
  drink_name: string
  ingredients: Array<{
    ingredient_id: number
    name: string
    amount: number
    unit: string
  }>
}

interface Order {
  id: number
  user_id: number
  username: string
  status: string
  created_at: string
  items: OrderItem[]
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    fetchOrders()

    // Configurar WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket("ws://localhost:3000/ws")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "ORDER_UPDATE") {
        fetchOrders()
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:3000/api/orders/admin", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        // Transformar los datos de la API al formato que necesitamos
        const formattedOrders = response.data.data.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          username: order.user.username,
          status: order.status,
          created_at: order.created_at,
          items: order.items.map((item: any) => ({
            id: item.id,
            drink_id: item.drink_id,
            drink_name: item.drink.name,
            ingredients: item.ingredients.map((ing: any) => ({
              ingredient_id: ing.ingredient_id,
              name: ing.ingredient.name,
              amount: ing.amount,
              unit: ing.ingredient.unit,
            })),
          })),
        }))

        setOrders(formattedOrders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error al cargar los pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  const openDetailsModal = (order: Order) => {
    setCurrentOrder(order)
    setIsDetailsModalOpen(true)
  }

  const openStatusModal = (order: Order) => {
    setCurrentOrder(order)
    setNewStatus(order.status)
    setIsStatusModalOpen(true)
  }

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentOrder) return

    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:3000/api/orders/${currentOrder.id}/status`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      toast.success("Estado del pedido actualizado correctamente")
      setIsStatusModalOpen(false)
      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error al actualizar el estado del pedido")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "warning" | "info" | "success" | "danger" }> = {
      pending: { label: "Pendiente", variant: "warning" },
      preparing: { label: "En preparación", variant: "info" },
      completed: { label: "Completado", variant: "success" },
      cancelled: { label: "Cancelado", variant: "danger" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Definir las columnas correctamente con el tipo TableColumn<Order>
  const columns: TableColumn<Order>[] = [
    { header: "ID", accessor: "id" },
    { header: "Usuario", accessor: "username" },
    {
      header: "Bebida",
      accessor: (order: Order) => order.items.map((item) => item.drink_name).join(", "),
    },
    {
      header: "Estado",
      accessor: (order: Order) => getStatusBadge(order.status),
    },
    {
      header: "Fecha",
      accessor: (order: Order) => formatDate(order.created_at),
    },
    {
      header: "Acciones",
      accessor: (order: Order) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openDetailsModal(order)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => openStatusModal(order)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Control de Pedidos</h1>
        <Button onClick={fetchOrders}>
          <RefreshCw className="h-5 w-5 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={orders}
          keyExtractor={(order) => order.id.toString()}
          isLoading={isLoading}
          emptyMessage="No hay pedidos disponibles"
        />
      </Card>

      {/* Modal de detalles del pedido */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalles del Pedido"
        size="md"
      >
        {currentOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID del Pedido</p>
                <p className="font-medium">{currentOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuario</p>
                <p className="font-medium">{currentOrder.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <div>{getStatusBadge(currentOrder.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{formatDate(currentOrder.created_at)}</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Bebidas</h3>
              {currentOrder.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md mb-3">
                  <h4 className="font-medium">{item.drink_name}</h4>
                  <h5 className="text-sm text-gray-500 mt-2">Ingredientes:</h5>
                  <ul className="list-disc list-inside mt-1">
                    {item.ingredients.map((ingredient, i) => (
                      <li key={i} className="text-sm">
                        {ingredient.name}: {ingredient.amount} {ingredient.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsDetailsModalOpen(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para cambiar estado */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Actualizar Estado del Pedido"
        size="sm"
      >
        <form onSubmit={handleStatusChange} className="space-y-4">
          <Select
            label="Nuevo Estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: "pending", label: "Pendiente" },
              { value: "preparing", label: "En preparación" },
              { value: "completed", label: "Completado" },
              { value: "cancelled", label: "Cancelado" },
            ]}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Actualizar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Orders
