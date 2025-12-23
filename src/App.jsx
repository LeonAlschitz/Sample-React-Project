import React, { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
import Main from './pages/Main.jsx'
import DataTable from './pages/DataTable.jsx'
import Netmap from './pages/Netmap.jsx'
import Settings from './pages/Settings.jsx'
import Disclaimer from './pages/Disclaimer.jsx'

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  })

  const [currentPage, setCurrentPage] = useState('main')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleMainPageClick = () => {
    setCurrentPage('main')
  }

  const handleDataTableClick = () => {
    setCurrentPage('datatable')
  }

  const handleNetmapClick = () => {
    setCurrentPage('netmap')
  }

  const handleDisclaimerClick = () => {
    setCurrentPage('disclaimer')
  }

  const handleSettingsClick = () => {
    setCurrentPage('settings')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return (
          <Settings 
            theme={theme} 
            setTheme={setTheme}
          />
        )
      case 'disclaimer':
        return <Disclaimer />
      case 'netmap':
        return <Netmap />
      case 'datatable':
        return <DataTable />
      case 'main':
      default:
        return <Main />
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        onMainPageClick={handleMainPageClick}
        onDataTableClick={handleDataTableClick}
        onNetmapClick={handleNetmapClick}
        onDisclaimerClick={handleDisclaimerClick}
        onSettingsClick={handleSettingsClick}
        currentPage={currentPage}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default App

