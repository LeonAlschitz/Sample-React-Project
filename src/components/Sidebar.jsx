import React from 'react'
import './Sidebar.css'
import { HomeIcon, TableIcon, DisclaimerIcon, NetmapIcon } from './Icons.jsx'

function Sidebar({ onMainPageClick, onDataTableClick, onNetmapClick, onDisclaimerClick, currentPage }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={onMainPageClick}>
        <div className="logo-icon">VP</div>
        <span className="logo-text">Visualization Portfolio</span>
      </div>
      <div className="sidebar-buttons">
        <button 
          onClick={onMainPageClick}
          className={currentPage === 'main' ? 'selected' : ''}
        >
          <span className="button-icon"><HomeIcon /></span>
          <span className="button-text">Main Page</span>
        </button>
        <button 
          onClick={onDataTableClick}
          className={currentPage === 'datatable' ? 'selected' : ''}
        >
          <span className="button-icon"><TableIcon /></span>
          <span className="button-text">Data Table</span>
        </button>
        <button 
          onClick={onNetmapClick}
          className={currentPage === 'netmap' ? 'selected' : ''}
        >
          <span className="button-icon"><NetmapIcon /></span>
          <span className="button-text">Netmap</span>
        </button>
      </div>
      <button 
        className={`disclaimer-button ${currentPage === 'disclaimer' ? 'selected' : ''}`}
        onClick={onDisclaimerClick}
      >
        <span className="button-icon"><DisclaimerIcon /></span>
        <span className="button-text">Disclaimer</span>
      </button>
    </div>
  )
}

export default Sidebar

