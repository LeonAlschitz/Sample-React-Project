import React, { useState, useEffect } from 'react'
import { supabaseRemote } from '../lib/supabaseClient.js'

export default function SampleDbDemo() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseRemote) {
      setLoading(false)
      return
    }
    supabaseRemote
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

  if (!supabaseRemote) return (
    <div>
      <h2 className="main-section-title">Remote DB — Sample items</h2>
      <p className="main-body">Set <code>VITE_SUPABASE_REMOTE_URL</code> and <code>VITE_SUPABASE_REMOTE_ANON_KEY</code> in .env.</p>
    </div>
  )
  if (loading) return <p className="main-body">Loading remote sample data…</p>
  if (error) return <p className="main-body" style={{ color: 'var(--color-error)' }}>Remote DB error: {error}</p>
  if (rows.length === 0) return (
    <div>
      <h2 className="main-section-title">Remote DB — Sample items</h2>
      <p className="main-body">No rows. Run supabase-sample-setup.sql in the remote project’s SQL Editor.</p>
    </div>
  )

  return (
    <div>
      <h2 className="main-section-title">Remote DB — Sample items</h2>
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
