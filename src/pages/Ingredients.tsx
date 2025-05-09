"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Ingredient {
  id: number;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
  pump_id: number | null;
}

const Ingredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    current_stock: 0,
    min_stock_level: 0,
    unit: "ml",
    pump_id: "",
  });
  const [restockAmount, setRestockAmount] = useState(0);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/ingredients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setIngredients(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      toast.error("Error al cargar los ingredientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "current_stock" || name === "min_stock_level" ? parseFloat(value) : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      current_stock: 0,
      min_stock_level: 0,
      unit: "ml",
      pump_id: "",
    });
    setCurrentIngredient(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      current_stock: ingredient.current_stock,
      min_stock_level: ingredient.min_stock_level,
      unit: ingredient.unit,
      pump_id: ingredient.pump_id?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const openRestockModal = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setRestockAmount(0);
    setIsRestockModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const data = {
        ...formData,
        pump_id: formData.pump_id ? parseInt(formData.pump_id) : null,
      };

      if (currentIngredient) {
        await axios.put(`http://localhost:3000/api/ingredients/${currentIngredient.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ingrediente actualizado correctamente");
      } else {
        await axios.post("http://localhost:3000/api/ingredients", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ingrediente creado correctamente");
      }

      setIsModalOpen(false);
      fetchIngredients();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Error al guardar el ingrediente");
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIngredient) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/ingredients/${currentIngredient.id}/restock`,
        { amount: restockAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Ingrediente reabastecido correctamente");
      setIsRestockModalOpen(false);
      fetchIngredients();
    } catch (error) {
      console.error("Error restocking ingredient:", error);
      toast.error("Error al reabastecer el ingrediente");
    }
  };

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("¿Está seguro de que desea eliminar este ingrediente?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/ingredients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ingrediente eliminado correctamente");
      fetchIngredients();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error("Error al eliminar el ingrediente");
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.current_stock <= 0) {
      return <Badge variant="danger">Sin stock</Badge>;
    } else if (ingredient.current_stock < ingredient.min_stock_level) {
      return <Badge variant="warning">Bajo</Badge>;
    } else {
      return <Badge variant="success">Normal</Badge>;
    }
  };

  const columns: {
    header: string;
    accessor: keyof Ingredient | ((ingredient: Ingredient) => React.ReactNode | string);
  }[] = [
    { header: "Nombre", accessor: "name" },
    {
      header: "Stock Actual",
      accessor: (ingredient: Ingredient) => `${ingredient.current_stock} ${ingredient.unit}`,
    },
    {
      header: "Nivel Mínimo",
      accessor: (ingredient: Ingredient) => `${ingredient.min_stock_level} ${ingredient.unit}`,
    },
    {
      header: "Estado",
      accessor: (ingredient: Ingredient) => getStockStatus(ingredient),
    },
    {
      header: "Acciones",
      accessor: (ingredient: Ingredient) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openRestockModal(ingredient)}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reabastecer
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openEditModal(ingredient)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(ingredient.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Ingredientes</h1>
        <Button onClick={openAddModal}>
          <Plus className="h-5 w-5 mr-2" />
          Agregar Ingrediente
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={ingredients}
          keyExtractor={(ingredient) => ingredient.id.toString()}
          isLoading={isLoading}
          emptyMessage="No hay ingredientes disponibles"
        />
      </Card>

      {/* Modal Agregar/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentIngredient ? "Editar Ingrediente" : "Agregar Ingrediente"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" name="name" value={formData.name} onChange={handleInputChange} required fullWidth />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Actual"
              name="current_stock"
              type="number"
              min="0"
              step="0.01"
              value={formData.current_stock}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <Input
              label="Nivel Mínimo"
              name="min_stock_level"
              type="number"
              min="0"
              step="0.01"
              value={formData.min_stock_level}
              onChange={handleInputChange}
              required
              fullWidth
            />
          </div>

          <Select
            label="Unidad de Medida"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            options={[
              { value: "ml", label: "Mililitros (ml)" },
              { value: "g", label: "Gramos (g)" },
              { value: "oz", label: "Onzas (oz)" },
              { value: "unidad", label: "Unidades" },
            ]}
            fullWidth
          />

          <Input
            label="ID de Bomba (opcional)"
            name="pump_id"
            type="number"
            value={formData.pump_id}
            onChange={handleInputChange}
            fullWidth
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{currentIngredient ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reabastecer */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Reabastecer Ingrediente"
        size="sm"
      >
        <form onSubmit={handleRestock} className="space-y-4">
          <p className="text-gray-700">
            Ingrediente: <strong>{currentIngredient?.name}</strong>
          </p>
          <p className="text-gray-700">
            Stock actual:{" "}
            <strong>
              {currentIngredient?.current_stock} {currentIngredient?.unit}
            </strong>
          </p>

          <Input
            label={`Cantidad a agregar (${currentIngredient?.unit})`}
            name="restockAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={restockAmount}
            onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
            required
            fullWidth
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsRestockModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Reabastecer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Ingredients;
