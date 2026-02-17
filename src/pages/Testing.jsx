import React, { useState, useEffect } from 'react'
import '../styles/PageLayout.css'
import './Testing.css'
import Netmap from './Netmap.jsx'
import { NETMAP_OPTIONS } from './Netmap.jsx'
import { supabaseLocal } from '../lib/supabaseClient.js'

function dbRowToNetmapDevice(row) {
  return {
    id: row.id,
    name: row.name ?? null,
    ipAddress: row.ip_address ?? null,
    type: row.type ?? null,
    status: row.status ?? 'offline',
    location: row.location ?? null,
    subnet: row.subnet ?? null,
    subnetLabel: row.subnet_label ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    connectedTo: Array.isArray(row.connected_to) ? row.connected_to : []
  }
}

function Testing() {
  const [selectedFloor, setSelectedFloor] = useState('floor1')
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseLocal) {
      setError('Local Supabase not configured')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const query = supabaseLocal.from('devices').select('*')
    const finalQuery = selectedFloor === 'all' ? query : query.eq('floor', selectedFloor)
    finalQuery.then(({ data, error: err }) => {
      setLoading(false)
      if (err) {
        setError(err.message)
        return
      }
      setDevices((data ?? []).map(dbRowToNetmapDevice))
    })
  }, [selectedFloor])

  return (
    <div className="page testing-page">
      <div className="page-content testing-page-content">
        <div className="page-section testing-intro-section">
          <div className="page-container testing-intro-container">
            <div className="page-body">
              <p>Use this page to run checks and experiments (e.g. DB vs JSON comparison, local/remote connectivity).</p>
              {loading && <p>Loading from local DB…</p>}
              {error && <p style={{ color: 'var(--color-error)' }}>Error: {error}</p>}
            </div>
          </div>
        </div>
        <div className="page-section testing-netmap-section">
          <div className="page-container">
            <div className="testing-netmap-header">
              <h2 className="page-section-title">Netmap widget</h2>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="testing-netmap-selector"
                aria-label="Select floor"
              >
                {NETMAP_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="testing-netmap-widget">
              <Netmap embedded devices={devices} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testing
