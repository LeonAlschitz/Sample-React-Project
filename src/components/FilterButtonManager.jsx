import React, { useImperativeHandle, forwardRef, useState } from 'react'
import '../pages/DataTable.css'

const baseUrl = import.meta.env.BASE_URL

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
          <img 
            src={`${baseUrl}assets/icons/x-marks/x-mark-black.svg`}
            alt="Remove"
            className="x-mark"
          />
          <img 
            src={`${baseUrl}assets/icons/funnel.svg`}
            alt="Filter"
            className="funnel"
          />
        </button>
      )}
      {buttons.map((button, index) => (
        <button
          key={`${button.column}-${button.field}-${index}`}
          className="filter-button"
          onClick={() => handleRemoveFilter(button.field)}
          aria-label={`Remove filter: ${button.field}`}
        >
          <img 
            src={`${baseUrl}assets/icons/x-marks/x-mark-black.svg`}
            alt="Remove"
            className="x-mark"
          />
          {button.field}
        </button>
      ))}
    </div>
  )
})

FilterButtonManager.displayName = 'FilterButtonManager'

export default FilterButtonManager
