// Table.tsx

import { ReactNode } from "react"

export interface TableColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => ReactNode)
  className?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  isLoading?: boolean
  emptyMessage?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
}: TableProps<T>) {
  const renderCell = (item: T, column: TableColumn<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item)
    }
    return item[column.accessor] as ReactNode
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ""}`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
