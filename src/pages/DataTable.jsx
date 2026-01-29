import React, { useEffect, useRef, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import * as d3 from 'd3'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '../styles/PageLayout.css'
import './DataTable.css'
import FilterButtonManager from '../components/FilterButtonManager'
import floor1Devices from '../data/Floor1.json'
import floor2Devices from '../data/Floor2.json'
import floor3Devices from '../data/Floor3.json'

const datasets = {
  floor1Devices: {
    name: 'Floor 1 Devices',
    data: floor1Devices.data,
    defaultFields: floor1Devices.default_fields,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Name', field: 'name', width: 200 },
      { title: 'Type', field: 'type', width: 130 },
      {
        title: 'Status',
        field: 'status',
        width: 100,
        formatter: (cell) => {
          const status = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          const color = status === 'online' 
            ? (isDark ? '#34d399' : '#10b981')
            : (isDark ? '#f87171' : '#ef4444')
          return `<span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>`
        }
      },
      { title: 'Location', field: 'location', width: 250 },
      { title: 'IP Address', field: 'ipAddress', width: 140 },
      { title: 'Subnet', field: 'subnet', width: 150 },
      { title: 'Tags', field: 'tags', width: 160 },
      {
        title: 'CPU Usage',
        field: 'cpuUsage',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Memory Usage',
        field: 'memoryUsage',
        width: 140,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Uptime',
        field: 'uptime',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      { title: 'Last Seen', field: 'lastSeen', width: 180 }
    ]
  },
  floor2Devices: {
    name: 'Floor 2 Devices',
    data: floor2Devices.data,
    defaultFields: floor2Devices.default_fields,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Name', field: 'name', width: 200 },
      { title: 'Type', field: 'type', width: 130 },
      {
        title: 'Status',
        field: 'status',
        width: 100,
        formatter: (cell) => {
          const status = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          const color = status === 'online' 
            ? (isDark ? '#34d399' : '#10b981')
            : (isDark ? '#f87171' : '#ef4444')
          return `<span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>`
        }
      },
      { title: 'Location', field: 'location', width: 250 },
      { title: 'IP Address', field: 'ipAddress', width: 140 },
      { title: 'Subnet', field: 'subnet', width: 150 },
      { title: 'Tags', field: 'tags', width: 160 },
      {
        title: 'CPU Usage',
        field: 'cpuUsage',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Memory Usage',
        field: 'memoryUsage',
        width: 140,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Uptime',
        field: 'uptime',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      { title: 'Last Seen', field: 'lastSeen', width: 180 }
    ]
  },
  floor3Devices: {
    name: 'Floor 3 Devices',
    data: floor3Devices.data,
    defaultFields: floor3Devices.default_fields,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Name', field: 'name', width: 200 },
      { title: 'Type', field: 'type', width: 130 },
      {
        title: 'Status',
        field: 'status',
        width: 100,
        formatter: (cell) => {
          const status = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          const color = status === 'online' 
            ? (isDark ? '#34d399' : '#10b981')
            : (isDark ? '#f87171' : '#ef4444')
          return `<span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>`
        }
      },
      { title: 'Location', field: 'location', width: 250 },
      { title: 'IP Address', field: 'ipAddress', width: 140 },
      { title: 'Subnet', field: 'subnet', width: 150 },
      { title: 'Tags', field: 'tags', width: 160 },
      {
        title: 'CPU Usage',
        field: 'cpuUsage',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Memory Usage',
        field: 'memoryUsage',
        width: 140,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Uptime',
        field: 'uptime',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      { title: 'Last Seen', field: 'lastSeen', width: 180 }
    ]
  }
}

function DataTable() {
  const tableRef = useRef(null)
  const tabulatorInstance = useRef(null)
  const [selectedDataset, setSelectedDataset] = useState('floor1Devices')
  const [searchInput, setSearchInput] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [gearPopupOpen, setGearPopupOpen] = useState(false)
  const [gearPopupPosition, setGearPopupPosition] = useState({ top: 0, right: 0 })
  const [visibleColumns, setVisibleColumns] = useState([])
  const allColumnsRef = useRef([])
  const searchFilterRef = useRef([])
  const cellFiltersRef = useRef([])
  const filterButtonManagerRef = useRef(null)
  const sidebarNetmapRef = useRef(null)
  const gearPopupRef = useRef(null)
  const tableReadyRef = useRef(false)

  const addCellFilterButton = (originalFormatter) => {
    return (cell) => {
      const cellValue = cell.getValue()
      const columnField = cell.getColumn().getField()
      
      if (columnField === 'static-right-column') {
        return originalFormatter ? originalFormatter(cell) : (cellValue || '')
      }

      const cellDiv = document.createElement('div')
      cellDiv.className = 'cell-filter-button-container'

      const contentDiv = document.createElement('div')
      contentDiv.className = 'cell-filter-content'
      
      if (originalFormatter) {
        const formattedContent = originalFormatter(cell)
        if (typeof formattedContent === 'string') {
          contentDiv.innerHTML = formattedContent
        } else if (formattedContent instanceof HTMLElement) {
          contentDiv.appendChild(formattedContent)
        } else {
          contentDiv.textContent = cellValue || ''
        }
      } else {
        contentDiv.textContent = cellValue || ''
      }

      const filterButton = document.createElement('button')
      filterButton.className = 'cell-filter-button'
      filterButton.type = 'button'
      filterButton.setAttribute('aria-label', `Filter by ${cellValue}`)
      filterButton.onclick = (e) => {
        e.stopPropagation()
        handleAddCellFilter(columnField, cellValue)
      }

      const filterIcon = document.createElement('img')
      filterIcon.src = `${import.meta.env.BASE_URL}assets/icons/funnel.svg`
      filterIcon.alt = 'Filter'
      filterIcon.className = 'cell-filter-icon'
      filterButton.appendChild(filterIcon)

      cellDiv.appendChild(contentDiv)
      cellDiv.appendChild(filterButton)

      return cellDiv
    }
  }

  const handleAddCellFilter = (column, field) => {
    const exists = cellFiltersRef.current.some(
      filter => filter.field === column && filter.value === field
    )
    
    if (!exists) {
      cellFiltersRef.current.push({
        field: column,
        type: '=',
        value: field
      })
      
      if (filterButtonManagerRef.current) {
        filterButtonManagerRef.current.createButton(column, field)
      }
      
      updateTableFilters()
    }
  }

  const updateTableFilters = () => {
    if (!tabulatorInstance.current) return
    
    const searchFilters = searchFilterRef.current
    const cellFilters = cellFiltersRef.current

    try {
      if (searchFilters.length === 0 && cellFilters.length === 0) {
        if (tabulatorInstance.current.clearFilter) {
          tabulatorInstance.current.clearFilter()
        }
        return
      }
    } catch (error) {
      console.warn('Table not ready for filter update:', error)
      return
    }

    const customFilter = (data) => {
      let matchesSearch = true
      let matchesCellFilters = true

      if (searchFilters.length > 0) {
        matchesSearch = searchFilters.some(filter => {
          const cellValue = data[filter.field]
          if (cellValue === null || cellValue === undefined) return false
          const searchValue = String(filter.value).toLowerCase()
          const cellValueStr = String(cellValue).toLowerCase()
          return cellValueStr.includes(searchValue)
        })
      }

      if (cellFilters.length > 0) {
        matchesCellFilters = cellFilters.every(filter => {
          const cellValue = data[filter.field]
          if (cellValue === null || cellValue === undefined) return false
          if (filter.type === '=') {
            const matches = String(cellValue) === String(filter.value)
            return matches
          }
          return true
        })
      }

      const result = matchesSearch && matchesCellFilters
      return result
    }

    const table = tabulatorInstance.current
    
    if (table.setFilter && typeof table.setFilter === 'function') {
      table.setFilter(customFilter)
    } else {
      table.setFilter(customFilter)
    }
  }

  // Function to update table columns based on visible columns
  const updateTableColumns = (newVisibleColumns) => {
    if (!tabulatorInstance.current || !tableReadyRef.current) return

    const currentDataset = datasets[selectedDataset]
    const filteredColumns = currentDataset.columns.filter(column => 
      newVisibleColumns.includes(column.field)
    )

    const columnsWithFilters = filteredColumns.map(column => {
      const originalFormatter = column.formatter
      return {
        ...column,
        hozAlign: 'left',
        formatter: addCellFilterButton(originalFormatter)
      }
    })

    const baseUrl = import.meta.env.BASE_URL
    const staticRightColumn = {
      title: `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><img src="${baseUrl}assets/icons/menu_icons/cog-6-tooth.svg" alt="Column Filter" style="width: 15px; cursor: pointer;"></div>`,
      field: 'static-right-column',
      headerSort: false,
      frozen: true,
      resizable: false,
      minWidth: 35,
      maxWidth: 35,
      width: 35,
      cssClass: 'static-right-column',
      mutator: () => '',
      formatter: (cell) => {
        return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
          <img src="${baseUrl}assets/icons/menu_icons/ellipsis-horizontal.svg" alt="Row Info" style="width: 20px; cursor: pointer; position: center;">
        </div>`
      },
      cellClick: (e, cell) => {
        try {
          const row = cell.getRow()
          if (row) {
            const rowData = row.getData()
            setSelectedRow(rowData)
          }
        } catch (error) {
          console.warn('Error accessing row data:', error)
        }
      }
    }

    const allColumns = [...columnsWithFilters, staticRightColumn]
    allColumnsRef.current = allColumns
    
    try {
      tabulatorInstance.current.setColumns(allColumns)
    } catch (error) {
      console.warn('Error updating columns:', error)
    }
  }

  // Handle column toggle
  const handleColumnToggle = (columnField) => {
    const newVisibleColumns = visibleColumns.includes(columnField)
      ? visibleColumns.filter(field => field !== columnField)
      : [...visibleColumns, columnField]
    
    setVisibleColumns(newVisibleColumns)
    updateTableColumns(newVisibleColumns)
  }

  useEffect(() => {
    const currentDataset = datasets[selectedDataset]
    
    if (tableRef.current) {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy()
        tabulatorInstance.current = null
      }

      const baseUrl = import.meta.env.BASE_URL
      const staticRightColumn = {
        title: `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><img src="${baseUrl}assets/icons/menu_icons/cog-6-tooth.svg" alt="Column Filter" style="width: 15px; cursor: pointer;"></div>`,
        field: 'static-right-column',
        headerSort: false,
        frozen: true,
        resizable: false,
        minWidth: 35,
        maxWidth: 35,
        width: 35,
        cssClass: 'static-right-column',
        mutator: () => '',
        formatter: (cell) => {
          return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <img src="${baseUrl}assets/icons/menu_icons/ellipsis-horizontal.svg" alt="Row Info" style="width: 20px; cursor: pointer; position: center;">
          </div>`
        },
        cellClick: (e, cell) => {
          try {
            const row = cell.getRow()
            if (row) {
              const rowData = row.getData()
              setSelectedRow(rowData)
            }
          } catch (error) {
            console.warn('Error accessing row data:', error)
          }
        }
      }

      // Calculate visible columns directly from current dataset's defaultFields
      // This ensures we always use the correct fields for the current dataset
      const defaultFields = currentDataset.defaultFields || []
      const allColumnFields = currentDataset.columns.map(col => col.field)
      
      let columnsToShow = []
      if (defaultFields.length > 0) {
        // Ensure at least 6 columns are visible
        if (defaultFields.length < 6) {
          const additionalFields = allColumnFields
            .filter(field => !defaultFields.includes(field))
            .slice(0, 6 - defaultFields.length)
          columnsToShow = [...defaultFields, ...additionalFields]
        } else {
          columnsToShow = defaultFields
        }
      } else {
        columnsToShow = allColumnFields.slice(0, Math.max(6, allColumnFields.length))
      }
      
      // Update visibleColumns state to match
      setVisibleColumns(columnsToShow)

      // Filter columns based on calculated columnsToShow
      const filteredColumns = currentDataset.columns.filter(column => 
        columnsToShow.includes(column.field)
      )

      const columnsWithFilters = filteredColumns.map(column => {
        if (column.field === 'static-right-column') {
          return column
        }
        const originalFormatter = column.formatter
        return {
          ...column,
          hozAlign: 'left',
          formatter: addCellFilterButton(originalFormatter)
        }
      })

      const allColumns = [...columnsWithFilters, staticRightColumn]
      allColumnsRef.current = allColumns

      tabulatorInstance.current = new Tabulator(tableRef.current, {
        data: currentDataset.data,
        layout: 'fitColumns',
        height: '100%',
        maxHeight: '100%',
        pagination: false,
        movableColumns: true,
        resizableColumns: true,
        columns: allColumns
      })

      tabulatorInstance.current.on('cellClick', (e, cell) => {
        try {
          const row = cell.getRow()
          if (!row) {
            return
          }
        } catch (error) {
          console.warn('Error in cell click handler:', error)
        }
      })

      tabulatorInstance.current.on('headerClick', (e, column) => {
        if (column.getField() === 'static-right-column') {
          e.stopPropagation()
          const headerElement = column.getElement()
          if (headerElement) {
            const rect = headerElement.getBoundingClientRect()
            const cardBody = tableRef.current.closest('.card-body')
            if (cardBody) {
              const cardBodyRect = cardBody.getBoundingClientRect()
              const scrollTop = cardBody.scrollTop || 0
              setGearPopupPosition({
                top: rect.top - cardBodyRect.top + scrollTop,
                right: cardBodyRect.right - rect.right
              })
              setGearPopupOpen(true)
            }
          }
        }
      })

      tabulatorInstance.current.on('tableBuilt', () => {
        tableReadyRef.current = true
        // After table is built, ensure visibleColumns state matches what we just set
        // This prevents the visibleColumns useEffect from trying to update columns unnecessarily
        setTimeout(() => {
          if (tabulatorInstance.current) {
            updateTableFilters()
          }
        }, 100)
      })
    }

    return () => {
      tableReadyRef.current = false
      if (tabulatorInstance.current) {
        try {
          tabulatorInstance.current.destroy()
        } catch (error) {
          console.warn('Error destroying table:', error)
        }
        tabulatorInstance.current = null
      }
    }
  }, [selectedDataset])

  // Update columns when visibleColumns changes (but table already exists and is ready)
  // This handles user toggles, not initial table creation
  useEffect(() => {
    if (tabulatorInstance.current && tableReadyRef.current && visibleColumns.length > 0) {
      // Only update if this is a user-initiated change (not during table initialization)
      // Check if the current table columns match what we expect
      const currentTableColumns = tabulatorInstance.current.getColumns()
        .map(col => col.getField())
        .filter(field => field !== 'static-right-column')
      
      const expectedColumns = visibleColumns
      
      // Only update if columns don't match (user toggled something)
      if (currentTableColumns.length !== expectedColumns.length ||
          !currentTableColumns.every(field => expectedColumns.includes(field))) {
        updateTableColumns(visibleColumns)
      }
    }
  }, [visibleColumns])

  useEffect(() => {
    if (!selectedRow || !sidebarNetmapRef.current) return

    const svg = d3.select(sidebarNetmapRef.current)
    const container = sidebarNetmapRef.current.parentElement
    const width = container.offsetWidth || 360
    const height = container.offsetHeight || 300

    svg.attr('width', width).attr('height', height)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const currentDataset = datasets[selectedDataset]
    const nodeMap = new Map(currentDataset.data.map(item => [item.id, item]))

    const createSidebarNode = (originalNode, x, y) => {
      return {
        ...originalNode,
        x: x,
        y: y,
        fx: undefined,
        fy: undefined
      }
    }

    const sidebarNodes = [createSidebarNode(selectedRow, width / 2, height / 2)]
    const connectedNodeIds = selectedRow.connectedTo || []

    connectedNodeIds.forEach((nodeId, index) => {
      if (nodeMap.has(nodeId)) {
        const originalNode = nodeMap.get(nodeId)
        const x = width / 2 + (index % 2 === 0 ? -100 : 100)
        const y = height / 2 + (Math.floor(index / 2) * 80 - 80)
        sidebarNodes.push(createSidebarNode(originalNode, x, y))
      }
    })

    const sidebarLinks = connectedNodeIds.map(nodeId => ({
      source: selectedRow.id,
      target: nodeId
    }))

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
    const textColor = isDarkMode ? '#ffffff' : '#000000'

    const linkGroup = g.append('g').attr('class', 'sidebar-links')
    const nodeGroup = g.append('g').attr('class', 'sidebar-nodes')

    const link = linkGroup
      .selectAll('line')
      .data(sidebarLinks)
      .enter()
      .append('line')
      .attr('stroke', 'var(--netmap-edge-color, #666)')
      .attr('stroke-width', 2)

    const simulation = d3.forceSimulation(sidebarNodes)
      .force('link', d3.forceLink(sidebarLinks).id(d => d.id).distance(80).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25))
      .alphaDecay(0.09)
      .alphaMin(0.001)

    let sidebarDragStartX = 0
    let sidebarDragStartY = 0
    let sidebarIsDragging = false

    function dragstarted(event, d) {
      event.sourceEvent.stopPropagation()
      if (!event.active) simulation.alphaTarget(0.3).restart()
      const [x, y] = d3.pointer(event, g.node())
      sidebarDragStartX = x
      sidebarDragStartY = y
      sidebarIsDragging = false
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      event.sourceEvent.stopPropagation()
      const [x, y] = d3.pointer(event, g.node())
      const dragDistance = Math.sqrt(
        Math.pow(x - sidebarDragStartX, 2) + 
        Math.pow(y - sidebarDragStartY, 2)
      )
      
      if (dragDistance > 3) {
        if (!sidebarIsDragging) {
          sidebarIsDragging = true
        }
        d.fx = x
        d.fy = y
      }
    }

    function dragended(event, d) {
      event.sourceEvent.stopPropagation()
      if (!event.active) simulation.alphaTarget(0)
      
      if (!sidebarIsDragging) {
        // Click detected - change selected node if different
        if (d.id !== selectedRow.id) {
          const originalNode = currentDataset.data.find(item => item.id === d.id)
          if (originalNode) {
            setSelectedRow(originalNode)
          }
        }
        // Keep position fixed for clicks
      } else {
        d.fx = null
        d.fy = null
      }
    }

    const node = nodeGroup
      .selectAll('g')
      .data(sidebarNodes)
      .enter()
      .append('g')
      .attr('class', 'sidebar-node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    node.append('circle')
      .attr('r', d => {
        const isSelected = d.id === selectedRow.id
        const isCore = Array.isArray(d.tags) && d.tags.includes('Core')

        if (isCore && isSelected) return 18
        if (isCore) return 14
        return isSelected ? 15 : 10
      })
      .attr('data-selected', d => d.id === selectedRow.id ? 'true' : 'false')
      .attr('fill', d => {
        const isSelected = d.id === selectedRow.id
        const status = d.status
        return status === 'online' 
          ? (isDarkMode ? '#34d399' : '#10b981')
          : (isDarkMode ? '#f87171' : '#ef4444')
      })
      .attr('stroke', isDarkMode ? '#1e293b' : '#ffffff')
      .attr('stroke-width', d => d.id === selectedRow.id ? 3 : 2)

    const sidebarBaseUrl = import.meta.env.BASE_URL
    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Device'))
      .append('image')
      .attr('xlink:href', `${sidebarBaseUrl}assets/icons/computer.svg`)
      .attr('x', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('y', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('width', d => d.id === selectedRow.id ? 15 : 12)
      .attr('height', d => d.id === selectedRow.id ? 15 : 12)
      .style('pointer-events', 'none')

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Switch'))
      .append('image')
      .attr('xlink:href', `${sidebarBaseUrl}assets/icons/switch.svg`)
      .attr('x', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('y', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('width', d => d.id === selectedRow.id ? 15 : 12)
      .attr('height', d => d.id === selectedRow.id ? 15 : 12)
      .style('pointer-events', 'none')

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Gateway'))
      .append('image')
      .attr('xlink:href', `${sidebarBaseUrl}assets/icons/gateway.svg`)
      .attr('x', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('y', d => d.id === selectedRow.id ? -7.5 : -6)
      .attr('width', d => d.id === selectedRow.id ? 15 : 12)
      .attr('height', d => d.id === selectedRow.id ? 15 : 12)
      .style('pointer-events', 'none')

    node.each(function(d) {
      const nodeElement = d3.select(this)
      const isSelected = d.id === selectedRow.id
      const labelBg = nodeElement.append('rect')
        .attr('class', 'sidebar-label-bg')
        .attr('x', isSelected ? 20 : 15)
        .attr('y', -8)
        .attr('height', 16)
        .attr('fill', 'var(--netmap-text-background, rgba(255, 255, 255, 0.95))')
        .attr('stroke', 'var(--border-color)')
        .attr('stroke-width', 0.5)
        .attr('rx', 2)

      const text = nodeElement.append('text')
        .attr('class', 'sidebar-node-label')
        .attr('dx', isSelected ? 20 : 15)
        .attr('dy', 4)
        .attr('font-size', isSelected ? '12px' : '10px')
        .attr('font-weight', '400')
        .style('fill', textColor)
        .style('user-select', 'none')
        .text(d.name || d.id || 'Node')

      const bbox = text.node().getBBox()
      labelBg
        .attr('width', bbox.width + 4)
        .attr('x', isSelected ? 20 : 15)
    })

    node.append('title')
      .text(d => {
        const name = d.name || d.id || 'Node'
        const ip = d.ip || d.ipAddress || 'N/A'
        const status = d.status || 'N/A'
        return `${name}\n${ip}\nStatus: ${status}`
      })

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1)
    svg.call(zoom.transform, initialTransform)

    return () => {
      if (simulation) {
        simulation.stop()
      }
      svg.selectAll('*').remove()
    }
  }, [selectedRow, selectedDataset])

  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value)
    setSearchInput('')
    searchFilterRef.current = []
    cellFiltersRef.current = []
    if (filterButtonManagerRef.current) {
      filterButtonManagerRef.current.clearButtons()
    }
  }

  const handleRemoveFilter = (fieldValue) => {
    cellFiltersRef.current = cellFiltersRef.current.filter(
      filter => filter.value !== fieldValue
    )
    updateTableFilters()
  }

  const handleRemoveAllFilters = () => {
    cellFiltersRef.current = []
    updateTableFilters()
  }

  const handleAddFilterButton = (column, field) => {
    if (filterButtonManagerRef.current) {
      filterButtonManagerRef.current.createButton(column, field)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchInput(value)

    searchFilterRef.current = []
    
    if (value.trim() !== '') {
      for (let i = 0; i < allColumnsRef.current.length; i++) {
        const column = allColumnsRef.current[i]
        if (column.field) {
          searchFilterRef.current.push({
            field: column.field,
            type: 'like',
            value: value
          })
        }
      }
    }

    if (tabulatorInstance.current) {
      updateTableFilters()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gearPopupRef.current && !gearPopupRef.current.contains(event.target)) {
        const gearIcon = event.target.closest('.tabulator-col[data-field="static-right-column"]')
        if (!gearIcon) {
          setGearPopupOpen(false)
        }
      }
    }

    if (gearPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [gearPopupOpen])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Data Table</h1>
        <div className="page-header-actions">
          <select 
            value={selectedDataset} 
            onChange={handleDatasetChange}
            className="dataset-selector"
          >
            {Object.keys(datasets).map(key => (
              <option key={key} value={key}>
                {datasets[key].name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="page-content">
        <div className="filter-container">
          <div className="filter-container-label">Search</div>
          <div className="filter-container-row">
            <div className="search-field-container">
              <img 
                src={`${import.meta.env.BASE_URL}assets/icons/magnifying-glass.svg`}
                alt="Search"
                className="magnifying-glass"
              />
              <input
                type="text"
                className="search-field"
                value={searchInput}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="filter-button-row">
            <FilterButtonManager
              ref={filterButtonManagerRef}
              onRemoveFilter={handleRemoveFilter}
              onRemoveAllFilters={handleRemoveAllFilters}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ position: 'relative' }}>
            <div ref={tableRef} className="tabulator-container"></div>
            {gearPopupOpen && (
              <div 
                ref={gearPopupRef}
                className="gear-popup"
                style={{
                  top: `${gearPopupPosition.top}px`,
                  right: `${gearPopupPosition.right}px`
                }}
              >
                <div className="gear-popup-content">
                  <h3 className="gear-popup-title">Columns</h3>
                  <div className="gear-popup-columns-list">
                    {datasets[selectedDataset].columns.map(column => {
                      const isVisible = visibleColumns.includes(column.field)
                      return (
                        <div 
                          key={column.field} 
                          className={`gear-popup-column-item ${isVisible ? 'visible' : 'hidden'}`}
                        >
                          <span className="gear-popup-column-title">{column.title}</span>
                          <label className="gear-popup-checkbox">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => handleColumnToggle(column.field)}
                              className="gear-popup-checkbox-input"
                            />
                            <span className="gear-popup-checkbox-custom"></span>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={`datatable-sidebar ${selectedRow ? 'open' : ''}`}>
          <button 
            className="datatable-sidebar-close"
            onClick={() => setSelectedRow(null)}
          >
            ×
          </button>
          {selectedRow && (
            <>
              <div className="sidebar-netmap-container">
                <svg ref={sidebarNetmapRef} className="sidebar-netmap-svg"></svg>
              </div>
              <div className="sidebar-data-container">
                <h2 className="sidebar-title">Row Details</h2>
                {Object.entries(selectedRow)
                  .filter(([key]) => key !== 'static-right-column')
                  .map(([key, value]) => (
                    <div key={key} className="sidebar-data-row">
                      <div className="sidebar-data-key">{key}:</div>
                      <div className="sidebar-data-value">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataTable

