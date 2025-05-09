"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import { Table, TableColumn } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Download } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import toast from "react-hot-toast"

interface PopularDrink {
  id: number
  name: string
  count: number
}

interface InventoryAlert {
  id: number
  name: string
  current_stock: number
  min_stock_level: number
  unit: string
}

interface MonthlyConsumption {
  month: string
  value: number
}

const Reports = () => {
  const [popularDrinks, setPopularDrinks] = useState<PopularDrink[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [monthlyConsumption, setMonthlyConsumption] = useState<MonthlyConsumption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exportType, setExportType] = useState("popular-drinks")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    fetchReportData()
  }, [selectedYear])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const [popularResponse, alertsResponse, consumptionResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/reports/popular-drinks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/api/reports/inventory-alerts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:3000/api/reports/monthly-consumption?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (popularResponse.data.success) {
        setPopularDrinks(popularResponse.data.data)
      }

      if (alertsResponse.data.success) {
        setInventoryAlerts(alertsResponse.data.data)
      }

      if (consumptionResponse.data.success) {
        const monthNames = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ]

        const formattedData = consumptionResponse.data.data.map((item: any) => ({
          month: monthNames[item.month - 1],
          value: item.count,
        }))

        setMonthlyConsumption(formattedData)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast.error("Error al cargar los datos de reportes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:3000/api/reports/export",
        {
          type: exportType,
          format: exportFormat,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `reporte-${exportType}.${exportFormat}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Reporte exportado correctamente")
    } catch (error) {
      console.error("Error exporting report:", error)
      toast.error("Error al exportar el reporte")
    }
  }

  const getStockStatus = (alert: InventoryAlert) => {
    if (alert.current_stock <= 0) {
      return <Badge variant="danger">Sin stock</Badge>
    } else if (alert.current_stock < alert.min_stock_level) {
      return <Badge variant="warning">Bajo</Badge>
    } else {
      return <Badge variant="success">Normal</Badge>
    }
  }

  const alertColumns: TableColumn<InventoryAlert>[] = [
    { header: "Ingrediente", accessor: "name" },
    {
      header: "Stock Actual",
      accessor: (alert: InventoryAlert) => `${alert.current_stock} ${alert.unit}`,
    },
    {
      header: "Nivel Mínimo",
      accessor: (alert: InventoryAlert) => `${alert.min_stock_level} ${alert.unit}`,
    },
    {
      header: "Estado",
      accessor: (alert: InventoryAlert) => getStockStatus(alert),
    },
  ]

  const popularColumns: TableColumn<PopularDrink>[] = [
    { header: "Bebida", accessor: "name" },
    { header: "Cantidad", accessor: "count" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { value: year.toString(), label: year.toString() }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bebidas más populares">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularDrinks} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Cantidad" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Consumo mensual">
          <div className="mb-4">
            <Select
              label="Año"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={years}
            />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyConsumption} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Bebidas" stroke="#10b981" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Alertas de Inventario">
        <Table
          columns={alertColumns}
          data={inventoryAlerts}
          keyExtractor={(alert) => alert.id.toString()}
          isLoading={isLoading}
          emptyMessage="No hay alertas de inventario"
        />
      </Card>

      <Card title="Bebidas Populares">
        <Table
          columns={popularColumns}
          data={popularDrinks}
          keyExtractor={(drink) => drink.id.toString()}
          isLoading={isLoading}
          emptyMessage="No hay datos disponibles"
        />
      </Card>

      <Card title="Exportar Reportes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Reporte"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            options={[
              { value: "popular-drinks", label: "Bebidas Populares" },
              { value: "inventory", label: "Inventario" },
              { value: "orders", label: "Pedidos" },
              { value: "monthly", label: "Consumo Mensual" },
            ]}
            fullWidth
          />

          <Select
            label="Formato"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            options={[
              { value: "pdf", label: "PDF" },
              { value: "csv", label: "CSV" },
              { value: "excel", label: "Excel" },
            ]}
            fullWidth
          />

          <Input
            label="Fecha Inicio"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            fullWidth
          />

          <Input
            label="Fecha Fin"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            fullWidth
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleExport}>
            <Download className="h-5 w-5 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Reports
