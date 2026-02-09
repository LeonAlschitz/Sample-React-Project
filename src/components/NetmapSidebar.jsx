import React, { useEffect } from 'react'
import '../styles/NetmapSidebar.css'

const SIDEBAR_KEY_BLACKLIST = ['fx', 'fy', 'vx', 'vy', 'x', 'y', 'index', 'static-right-column', 'tags']

function NetmapSidebar({
  open,
  onClose,
  netmapSvgRef,
  data,
  dataTitle,
  dataKeyFilter = () => true,
  showNodeHint = true
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const entries = data
    ? Object.entries(data).filter(([key]) => !SIDEBAR_KEY_BLACKLIST.includes(key) && dataKeyFilter(key))
    : []

  return (
    <>
      {open && (
        <div
          className="netmap-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div className={`netmap-sidebar ${open ? 'open' : ''}`}>
        <button
          type="button"
          className="netmap-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
        {open && data && (
          <>
            <div className="sidebar-netmap-container">
              <svg ref={netmapSvgRef} className="sidebar-netmap-svg" />
            </div>
            <div className="sidebar-node-hint-slot">
              {showNodeHint && (
                <p className="sidebar-node-hint">Click a node in the map above to update the sidebar with that node and its connections.</p>
              )}
            </div>
            <div className="sidebar-data-container">
              {dataTitle && <h2 className="sidebar-title">{dataTitle}</h2>}
              {entries.map(([key, value]) => (
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
    </>
  )
}

export default NetmapSidebar
