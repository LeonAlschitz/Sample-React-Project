import React from 'react'
import './Sidebar.css'
import { HomeIcon, TableIcon, DisclaimerIcon, NetmapIcon } from './Icons.jsx'

function Sidebar({
  onMainPageClick,
  onDataTableClick,
  onNetmapClick,
  onNetmap3DClick,
  onDisclaimerClick,
  currentPage
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={onMainPageClick}>
        <div className="logo-icon">VP</div>
        <span className="logo-text">Visualization Portfolio</span>
      </div>
      <div className="sidebar-buttons">
        <button onClick={onMainPageClick} className={currentPage === 'main' ? 'selected' : ''}>
          <span className="button-icon">
            <HomeIcon />
          </span>
          <span className="button-text">Main Page</span>
        </button>
        <button onClick={onDataTableClick} className={currentPage === 'datatable' ? 'selected' : ''}>
          <span className="button-icon">
            <TableIcon />
          </span>
          <span className="button-text">Data Table</span>
        </button>
        <button onClick={onNetmapClick} className={currentPage === 'netmap' ? 'selected' : ''}>
          <span className="button-icon">
            <NetmapIcon />
          </span>
          <span className="button-text">Netmap</span>
        </button>
        <button onClick={onNetmap3DClick} className={currentPage === 'netmap3d' ? 'selected' : ''} aria-label="3D Netmap">
          <span className="button-icon">
            <span className="sidebar-3d-mark" aria-hidden="true">
              3D
            </span>
          </span>
          <span className="button-text">3D Netmap</span>
        </button>
      </div>
      <button
        className={`disclaimer-button ${currentPage === 'disclaimer' ? 'selected' : ''}`}
        onClick={onDisclaimerClick}
      >
        <span className="button-icon">
          <DisclaimerIcon />
        </span>
        <span className="button-text">Disclaimer</span>
      </button>
    </div>
  )
}

export default Sidebar
