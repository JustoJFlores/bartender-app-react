"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Table } from "../components/ui/Table"
import { Modal } from "../components/ui/Modal"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import { Plus, Edit, Trash2, PlusCircle, MinusCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Ingredient {
  id: number
  name: string
  unit: string
}

interface RecipeIngredient {
  ingredient_id: number
  amount: number
  name?: string
  unit?: string
}

interface Drink {
  id: number
  name: string
  description: string
  image_url: string | null
  type: string
  ingredients: RecipeIngredient[]
}

// Definir el tipo TableColumn
interface TableColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
}

const Recipes = () => {
  const [drinks, setDrinks] = useState<Drink[]>([]) // Inicializa como array vacío
  const [ingredients, setIngredients] = useState<Ingredient[]>([]) // Inicializa como array vacío
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDrink, setCurrentDrink] = useState<Drink | null>(null)
  const [drinkToDelete, setDrinkToDelete] = useState<Drink | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    type: "standard",
  })

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const [drinksResponse, ingredientsResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/drinks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/api/ingredients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (drinksResponse.data.success) setDrinks(drinksResponse.data.data)
      if (ingredientsResponse.data.success) setIngredients(ingredientsResponse.data.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleIngredientChange = (index: number, field: string, value: string | number) => {
    const updatedIngredients = [...recipeIngredients]

    if (field === "ingredient_id") {
      const selected = ingredients.find((i) => i.id === parseInt(value as string))
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        ingredient_id: parseInt(value as string),
        name: selected?.name,
        unit: selected?.unit,
      }
    } else {
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: field === "amount" ? parseFloat(value as string) : value,
      }
    }

    setRecipeIngredients(updatedIngredients)
  }

  const addIngredientToRecipe = () => {
    if (ingredients.length === 0) {
      toast.error("No hay ingredientes disponibles")
      return
    }

    setRecipeIngredients([ 
      ...recipeIngredients, 
      { 
        ingredient_id: ingredients[0].id, 
        amount: 0, 
        name: ingredients[0].name, 
        unit: ingredients[0].unit 
      } 
    ])
  }

  const removeIngredientFromRecipe = (index: number) => {
    const updated = [...recipeIngredients]
    updated.splice(index, 1)
    setRecipeIngredients(updated)
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", image_url: "", type: "standard" })
    setRecipeIngredients([])
    setCurrentDrink(null)
  }

  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (drink: Drink) => {
    setCurrentDrink(drink)
    setFormData({
      name: drink.name,
      description: drink.description,
      image_url: drink.image_url || "",
      type: drink.type,
    })

    const formattedIngredients = drink.ingredients.map((ingredient) => {
      const details = ingredients.find((i) => i.id === ingredient.ingredient_id)
      return {
        ingredient_id: ingredient.ingredient_id,
        amount: ingredient.amount,
        name: details?.name,
        unit: details?.unit,
      }
    })

    setRecipeIngredients(formattedIngredients)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (recipeIngredients.length === 0) {
      toast.error("Debe agregar al menos un ingrediente")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const data = {
        ...formData,
        ingredients: recipeIngredients.map(({ ingredient_id, amount }) => ({
          ingredient_id,
          amount,
        })),
      }

      if (currentDrink) {
        await axios.put(`http://localhost:3000/api/drinks/${currentDrink.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Receta actualizada correctamente")
      } else {
        await axios.post("http://localhost:3000/api/drinks", data, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Receta creada correctamente")
      }

      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast.error("Error al guardar la receta")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3000/api/drinks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Receta eliminada correctamente")
      fetchData()
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast.error("Error al eliminar la receta")
    }
  }

  const columns: TableColumn<Drink>[] = [
    { header: "Nombre", accessor: "name" },
    { header: "Descripción", accessor: "description" },
    {
      header: "Tipo",
      accessor: (drink: Drink) => (drink.type === "standard" ? "Estándar" : "Personalizable"),
    },
    {
      header: "Ingredientes",
      accessor: (drink: Drink) => (
        <ul className="list-disc list-inside">
          {drink.ingredients && Array.isArray(drink.ingredients) && drink.ingredients.length > 0 ? (
            drink.ingredients.map((ing, i) => {
              const details = ingredients.find((i2) => i2.id === ing.ingredient_id)
              return (
                <li key={i}>
                  {details?.name}: {ing.amount} {details?.unit}
                </li>
              )
            })
          ) : (
            <li>No hay ingredientes disponibles</li>
          )}
        </ul>
      ),
    },
    {
      header: "Acciones",
      accessor: (drink: Drink) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openEditModal(drink)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDrinkToDelete(drink)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Recetas</h1>
        <Button onClick={openAddModal}>
          <Plus className="h-5 w-5 mr-2" />
          Crear Nueva Receta
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={drinks}
          keyExtractor={(drink) => drink.id.toString()}
          isLoading={isLoading}
          emptyMessage="No hay recetas disponibles"
        />
      </Card>

      {/* Modal Crear/Editar Receta */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentDrink ? "Editar Receta" : "Crear Nueva Receta"} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre de la bebida */}
            <div className="flex flex-col">
              <label htmlFor="name" className="font-medium">Nombre</label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej. Mojito"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
              <label htmlFor="description" className="font-medium">Descripción</label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Descripción de la bebida"
              />
            </div>

            {/* URL de la imagen */}
            <div className="flex flex-col">
              <label htmlFor="image_url" className="font-medium">Imagen URL</label>
              <Input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="URL de la imagen"
              />
            </div>

            {/* Tipo de bebida */}
            <div className="flex flex-col">
              <label htmlFor="type" className="font-medium">Tipo</label>
              <Select
                id="ingredient-select"
                name="ingredient_id"
                value={recipeIngredients[0]?.ingredient_id}
                onChange={(e) => handleIngredientChange(0, "ingredient_id", e.target.value)}
                required
                options={ingredients.map(ingredient => ({
                  value: ingredient.id,  // El valor de cada opción
                  label: ingredient.name  // El texto que se mostrará en el dropdown
                }))}
              />
            </div>
            {/* Ingredientes */}
            <div>
              <h3 className="text-lg font-semibold">Ingredientes</h3>
              <div className="space-y-2">
                {recipeIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Select
                      value={ingredient.ingredient_id}
                      onChange={(e) => handleIngredientChange(index, "ingredient_id", e.target.value)}
                      options={ingredients.map(ingredient => ({
                        value: ingredient.id,
                        label: ingredient.name,
                      }))}
                    />
                    <Input
                      type="number"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                      placeholder="Cantidad"
                      required
                    />

                    <span>{ingredient.unit}</span>

                    <Button variant="danger" size="sm" onClick={() => removeIngredientFromRecipe(index)}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="sm" onClick={addIngredientToRecipe}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Ingrediente
              </Button>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {currentDrink ? "Actualizar Receta" : "Crear Receta"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>


      {/* Modal Confirmación de Eliminación */}
      <Modal isOpen={drinkToDelete !== null} onClose={() => setDrinkToDelete(null)} title="Confirmar Eliminación">
        <p>
          ¿Está seguro de que desea eliminar la receta <strong>{drinkToDelete?.name}</strong>?
        </p>
        <div className="flex justify-end space-x-3 mt-4">
          <Button variant="secondary" onClick={() => setDrinkToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (drinkToDelete) {
                handleDelete(drinkToDelete.id)
                setDrinkToDelete(null)
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Recipes
