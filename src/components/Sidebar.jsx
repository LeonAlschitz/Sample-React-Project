import React from 'react'
import './Sidebar.css'
import { HomeIcon, SettingsIcon, TableIcon, DisclaimerIcon, NetmapIcon } from './Icons.jsx'

function Sidebar({ onMainPageClick, onDataTableClick, onNetmapClick, onSettingsClick, onDisclaimerClick, currentPage }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={onMainPageClick}>
        <div className="logo-icon">NIS</div>
        <span className="logo-text">Nexus Infrastructure Solutions</span>
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
      <button 
        className={`settings-button ${currentPage === 'settings' ? 'selected' : ''}`}
        onClick={onSettingsClick}
      >
        <span className="button-icon"><SettingsIcon /></span>
        <span className="button-text">Settings</span>
      </button>
    </div>
  )
}

export default Sidebar

