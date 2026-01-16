import React, { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Main from './pages/Main.jsx'
import DataTable from './pages/DataTable.jsx'
import Netmap from './pages/Netmap.jsx'
import Disclaimer from './pages/Disclaimer.jsx'

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'dark'
  })

  const [currentPage, setCurrentPage] = useState('main')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    
    const updateFavicon = () => {
      let favicon = document.getElementById('favicon')
      
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.id = 'favicon'
        favicon.rel = 'icon'
        favicon.type = 'image/svg+xml'
        document.head.appendChild(favicon)
      }
      
      const svg = theme === 'dark' 
        ? `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
             <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
             <text x="16" y="22" font-family="Inter, sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="white" letter-spacing="1px">NIS</text>
             <defs>
               <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                 <stop offset="0%" stop-color="#60a5fa"/>
                 <stop offset="50%" stop-color="#93c5fd"/>
                 <stop offset="100%" stop-color="#818cf8"/>
               </linearGradient>
             </defs>
           </svg>`
        : `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
             <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
             <text x="16" y="22" font-family="Inter, sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="white" letter-spacing="1px">NIS</text>
             <defs>
               <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                 <stop offset="0%" stop-color="#3b82f6"/>
                 <stop offset="50%" stop-color="#60a5fa"/>
                 <stop offset="100%" stop-color="#6366f1"/>
               </linearGradient>
             </defs>
           </svg>`
      
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      
      if (favicon.href && favicon.href.startsWith('blob:')) {
        URL.revokeObjectURL(favicon.href)
      }
      
      favicon.href = url
    }
    
    updateFavicon()
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

  const renderPage = () => {
    switch (currentPage) {
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
      <TopBar theme={theme} setTheme={setTheme} />
      <Sidebar 
        onMainPageClick={handleMainPageClick}
        onDataTableClick={handleDataTableClick}
        onNetmapClick={handleNetmapClick}
        onDisclaimerClick={handleDisclaimerClick}
        currentPage={currentPage}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default App

