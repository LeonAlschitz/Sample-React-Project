import React, { useState } from 'react'
import '../styles/PageLayout.css'
import './Netmap.css'

const netmapOptions = {
  networkTopology: 'Network Topology',
  physicalLayout: 'Physical Layout',
  logicalLayout: 'Logical Layout',
  securityZones: 'Security Zones'
}

function Netmap() {
  const [selectedNetmap, setSelectedNetmap] = useState('networkTopology')

  const handleNetmapChange = (e) => {
    setSelectedNetmap(e.target.value)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Netmap</h1>
        <div className="page-header-actions">
          <select 
            value={selectedNetmap} 
            onChange={handleNetmapChange}
            className="netmap-selector"
          >
            {Object.keys(netmapOptions).map(key => (
              <option key={key} value={key}>
                {netmapOptions[key]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="page-content">
        <div className="page-section">
          <div className="page-container">
            <div className="page-body">
              <p>Network map visualization will be displayed here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Netmap

