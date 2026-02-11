import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function SampleDbDemo() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('sample_items')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setRows(data ?? [])
      })
  }, [])

  if (loading) return <p className="main-body">Loading sample data…</p>
  if (error) return <p className="main-body" style={{ color: 'var(--color-error)' }}>Error: {error}</p>
  if (rows.length === 0) return <p className="main-body">No rows. Run supabase-sample-setup.sql in the Supabase SQL Editor.</p>

  return (
    <div>
      <h2 className="main-section-title">Sample DB (Supabase)</h2>
      <ul className="main-body" style={{ listStyle: 'none', paddingLeft: 0 }}>
        {rows.map((row) => (
          <li key={row.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{row.name}</strong>
            {row.description && ` — ${row.description}`}
          </li>
        ))}
      </ul>
    </div>
  )
}
