import React, { useState, useEffect } from 'react'
import { supabaseLocal } from '../lib/supabaseClient.js'

export default function FloorsDevicesDemo() {
  const [floors, setFloors] = useState([])
  const [deviceCounts, setDeviceCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseLocal) {
      setLoading(false)
      return
    }
    Promise.all([
      supabaseLocal.from('floors').select('id, name').order('id'),
      supabaseLocal.from('devices').select('floor')
    ]).then(([floorsRes, devicesRes]) => {
      setLoading(false)
      if (floorsRes.error) {
        const isMissingTable = floorsRes.error.code === '42P01' || floorsRes.error.message?.includes('does not exist') || String(floorsRes.error.message).includes('404')
        setError(isMissingTable ? null : floorsRes.error.message)
        setFloors(isMissingTable ? [] : [])
        if (!isMissingTable) return
      } else {
        setFloors(floorsRes.data ?? [])
      }
      if (!devicesRes.error) {
        const counts = {}
        ;(devicesRes.data ?? []).forEach((d) => {
          counts[d.floor] = (counts[d.floor] ?? 0) + 1
        })
        setDeviceCounts(counts)
      }
    })
  }, [])

  if (!supabaseLocal) return (
    <div>
      <h2 className="main-section-title">Local DB — Floors & devices</h2>
      <p className="main-body">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in .env and run <code>npx supabase start</code>.</p>
    </div>
  )
  if (loading) return <p className="main-body">Loading local floors…</p>
  if (error) return <p className="main-body" style={{ color: 'var(--color-error)' }}>Local DB error: {error}</p>
  if (floors.length === 0) return (
    <div>
      <h2 className="main-section-title">Local DB — Floors & devices</h2>
      <p className="main-body">No floors. Run <code>npx supabase db reset</code> to apply migrations and seed.</p>
    </div>
  )

  return (
    <div>
      <h2 className="main-section-title">Local DB — Floors & devices</h2>
      <ul className="main-body" style={{ listStyle: 'none', paddingLeft: 0 }}>
        {floors.map((floor) => (
          <li key={floor.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{floor.name ?? floor.id}</strong>
            {' — '}
            {deviceCounts[floor.id] ?? 0} device(s)
          </li>
        ))}
      </ul>
    </div>
  )
}
