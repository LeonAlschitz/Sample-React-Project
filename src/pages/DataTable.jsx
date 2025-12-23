import React, { useEffect, useRef, useState } from 'react'
import { Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '../styles/PageLayout.css'
import './DataTable.css'
import networkDevices from '../data/networkDevices.json'
import serverInventory from '../data/serverInventory.json'
import networkConnections from '../data/networkConnections.json'
import securityEvents from '../data/securityEvents.json'

const datasets = {
  networkDevices: {
    name: 'Network Devices',
    data: networkDevices,
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
  },
  serverInventory: {
    name: 'Server Inventory',
    data: serverInventory,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Hostname', field: 'hostname', width: 180 },
      { title: 'OS', field: 'os', width: 150 },
      { title: 'CPU Cores', field: 'cpuCores', width: 100, sorter: 'number' },
      { title: 'RAM (GB)', field: 'ram', width: 100, sorter: 'number' },
      { title: 'Storage (GB)', field: 'storage', width: 120, sorter: 'number' },
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
      {
        title: 'Uptime',
        field: 'uptime',
        width: 100,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'CPU Usage',
        field: 'cpuUsage',
        width: 100,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      {
        title: 'Memory Usage',
        field: 'memoryUsage',
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      { title: 'Last Maintenance', field: 'lastMaintenance', width: 150 }
    ]
  },
  networkConnections: {
    name: 'Network Connections',
    data: networkConnections,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Source Device', field: 'sourceDevice', width: 180 },
      { title: 'Target Device', field: 'targetDevice', width: 180 },
      { title: 'Connection Type', field: 'connectionType', width: 140 },
      { title: 'Bandwidth', field: 'bandwidth', width: 120 },
      {
        title: 'Status',
        field: 'status',
        width: 100,
        formatter: (cell) => {
          const status = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          let color
          if (status === 'active') {
            color = isDark ? '#34d399' : '#10b981'
          } else if (status === 'degraded') {
            color = isDark ? '#fbbf24' : '#f59e0b'
          } else {
            color = isDark ? '#f87171' : '#ef4444'
          }
          return `<span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>`
        }
      },
      { title: 'Source Port', field: 'portSource', width: 150 },
      { title: 'Target Port', field: 'portTarget', width: 150 },
      { title: 'VLAN', field: 'vlan', width: 80, sorter: 'number' },
      {
        title: 'Latency (ms)',
        field: 'latency',
        width: 110,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value} ms`
        },
        sorter: 'number'
      },
      {
        title: 'Packet Loss (%)',
        field: 'packetLoss',
        width: 130,
        formatter: (cell) => {
          const value = cell.getValue()
          return `${value}%`
        },
        sorter: 'number'
      },
      { title: 'Last Updated', field: 'lastUpdated', width: 180 }
    ]
  },
  securityEvents: {
    name: 'Security Events',
    data: securityEvents,
    columns: [
      { title: 'ID', field: 'id', width: 120, frozen: true },
      { title: 'Event Type', field: 'eventType', width: 180 },
      {
        title: 'Severity',
        field: 'severity',
        width: 100,
        formatter: (cell) => {
          const severity = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          let color
          if (severity === 'critical') {
            color = isDark ? '#f87171' : '#ef4444'
          } else if (severity === 'high') {
            color = isDark ? '#fb923c' : '#f97316'
          } else if (severity === 'medium') {
            color = isDark ? '#fbbf24' : '#f59e0b'
          } else {
            color = isDark ? '#60a5fa' : '#3b82f6'
          }
          return `<span style="color: ${color}; font-weight: bold;">${severity.toUpperCase()}</span>`
        }
      },
      { title: 'Source IP', field: 'sourceIP', width: 140 },
      { title: 'Target Device', field: 'targetDevice', width: 180 },
      { title: 'User', field: 'user', width: 150 },
      { title: 'Timestamp', field: 'timestamp', width: 180 },
      {
        title: 'Status',
        field: 'status',
        width: 120,
        formatter: (cell) => {
          const status = cell.getValue()
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
          const color = status === 'resolved' 
            ? (isDark ? '#34d399' : '#10b981')
            : (isDark ? '#fbbf24' : '#f59e0b')
          return `<span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>`
        }
      },
      { title: 'Description', field: 'description', width: 300 },
      { title: 'Action', field: 'action', width: 250 }
    ]
  }
}

function DataTable() {
  const tableRef = useRef(null)
  const tabulatorInstance = useRef(null)
  const [selectedDataset, setSelectedDataset] = useState('networkDevices')

  useEffect(() => {
    const currentDataset = datasets[selectedDataset]
    
    if (tableRef.current) {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy()
        tabulatorInstance.current = null
      }

      tabulatorInstance.current = new Tabulator(tableRef.current, {
        data: currentDataset.data,
        layout: 'fitColumns',
        height: '100%',
        maxHeight: '100%',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50, 100],
        movableColumns: true,
        resizableColumns: true,
        columns: currentDataset.columns
      })
    }

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy()
        tabulatorInstance.current = null
      }
    }
  }, [selectedDataset])

  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value)
  }

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

