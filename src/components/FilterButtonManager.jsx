import React, { useImperativeHandle, forwardRef, useState } from 'react'
import '../pages/DataTable.css'

const FilterButtonManager = forwardRef(({ onRemoveFilter, onRemoveAllFilters }, ref) => {
  const [buttons, setButtons] = useState([])

  useImperativeHandle(ref, () => ({
    createButton: (column, field) => {
      setButtons(prev => {
        const exists = prev.some(btn => btn.column === column && btn.field === field)
        if (exists) return prev
        return [...prev, { column, field }]
      })
    },
    clearButtons: () => {
      setButtons([])
    }
  }))

  const handleRemoveFilter = (field) => {
    setButtons(prev => prev.filter(btn => btn.field !== field))
    if (onRemoveFilter) {
      onRemoveFilter(field)
    }
  }

  const handleRemoveAllFilters = () => {
    setButtons([])
    if (onRemoveAllFilters) {
      onRemoveAllFilters()
    }
  }

  return (
    <div className="filter-button-manager" style={{ minHeight: '35px' }}>
      {buttons.length > 0 && (
        <button
          className="remove-all-button"
          onClick={handleRemoveAllFilters}
          aria-label="Remove all filters"
        >
          <div className="x-mark"></div>
          <div className="funnel"></div>
        </button>
      )}
      {buttons.map((button, index) => (
        <button
          key={`${button.column}-${button.field}-${index}`}
          className="filter-button"
          onClick={() => handleRemoveFilter(button.field)}
          aria-label={`Remove filter: ${button.field}`}
        >
          <div className="x-mark"></div>
          {button.field}
        </button>
      ))}
    </div>
  )
})

FilterButtonManager.displayName = 'FilterButtonManager'

export default FilterButtonManager
