import { type SelectHTMLAttributes, forwardRef } from "react"

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = false, className = "", ...props }, ref) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
          ref={ref}
          className={`
            block px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm
            ${error ? "border-red-300" : "border-gray-300"}
            ${fullWidth ? "w-full" : ""}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  },
)

Select.displayName = "Select"
