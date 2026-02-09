import React, { useState, useEffect } from 'react'
import './TopBar.css'

function TopBar({ theme, setTheme }) {
  const [isInfoOverlayOpen, setIsInfoOverlayOpen] = useState(false)

  useEffect(() => {
    if (!isInfoOverlayOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsInfoOverlayOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isInfoOverlayOpen])

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const toggleInfoOverlay = () => {
    setIsInfoOverlayOpen(prev => !prev)
  }

  return (
    <>
      <div className="top-bar">
        <button
          type="button"
          className={`top-bar-icon-button info-button ${isInfoOverlayOpen ? 'active' : ''}`}
          onClick={toggleInfoOverlay}
          aria-label="Information"
          aria-expanded={isInfoOverlayOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 7v1M10 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="5" r="1.25" fill="currentColor" />
          </svg>
        </button>
        <button 
          className="theme-toggle-button top-bar-icon-button"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      {isInfoOverlayOpen && (
        <div
          className="info-overlay-backdrop"
          onClick={toggleInfoOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Information overlay"
        >
          <div className="info-overlay" onClick={(e) => e.stopPropagation()}>
            <h2 className="info-overlay-title">Information</h2>
            <div className="info-overlay-content">
              <h3 className="info-overlay-heading">Hotkeys</h3>
              <p className="info-overlay-hint">Close this overlay by pressing <kbd className="info-overlay-kbd">Escape</kbd>.</p>
              <h3 className="info-overlay-heading">General page navigation</h3>
              <p>Use the sidebar to switch between Main, Data Table, and Netmap. Click the info button again or press Escape to close this overlay.</p>
            </div>
            <button
              type="button"
              className="info-overlay-close"
              onClick={toggleInfoOverlay}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar
