import React, { useEffect, useRef } from 'react'
import { Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '../styles/PageLayout.css'
import './DataTable.css'
import networkDevices from '../data/networkDevices.json'

function DataTable() {
  const tableRef = useRef(null)
  const tabulatorInstance = useRef(null)

  useEffect(() => {
    if (tableRef.current && !tabulatorInstance.current) {
      tabulatorInstance.current = new Tabulator(tableRef.current, {
        data: networkDevices,
        layout: 'fitColumns',
        height: '100%',
        maxHeight: '100%',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50, 100],
        movableColumns: true,
        resizableColumns: true,
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
      })
    }

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy()
        tabulatorInstance.current = null
      }
    }
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Network Devices</h1>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="card-body">
            <div ref={tableRef} className="tabulator-container"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTable

