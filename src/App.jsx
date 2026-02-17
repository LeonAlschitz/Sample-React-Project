import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient.js'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Main from './pages/Main.jsx'
import DataTable from './pages/DataTable.jsx'
import Netmap from './pages/Netmap.jsx'
import Disclaimer from './pages/Disclaimer.jsx'
import Testing from './pages/Testing.jsx'

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'dark'
  })

  const [currentPage, setCurrentPage] = useState('main')
  const [selectedDataset, setSelectedDataset] = useState('floor1Devices')
  const [selectedNetmap, setSelectedNetmap] = useState('floor1')
  const fitViewRef = useRef(null)

  const supabaseCheckDone = useRef(false)
  useEffect(() => {
    if (supabaseCheckDone.current) return
    supabaseCheckDone.current = true
    if (supabase) {
      supabase.auth.getSession().then(({ error }) => {
        if (error) console.error('Supabase connection check failed:', error.message)
        else console.log('Supabase connected')
      })
    }
  }, [])

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
      
      const gradient = theme === 'dark'
        ? '<linearGradient id="fg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#10b981"/><stop offset="50%" stop-color="#34d399"/><stop offset="100%" stop-color="#6ee7b7"/></linearGradient>'
        : '<linearGradient id="fg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#14532d"/><stop offset="50%" stop-color="#166534"/><stop offset="100%" stop-color="#15803d"/></linearGradient>'
      const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>${gradient}</defs>
        <rect width="32" height="32" rx="6" fill="url(#fg)"/>
        <text x="16" y="21" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="white" letter-spacing="0.5px">VP</text>
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

  const handleTestingClick = () => {
    setCurrentPage('testing')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'disclaimer':
        return <Disclaimer />
      case 'testing':
        return <Testing />
      case 'netmap':
        return <Netmap selectedNetmap={selectedNetmap} setSelectedNetmap={setSelectedNetmap} fitViewRef={fitViewRef} />
      case 'datatable':
        return <DataTable selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
      case 'main':
      default:
        return <Main />
    }
  }

  return (
    <div className="app-container">
      <TopBar theme={theme} setTheme={setTheme} currentPage={currentPage} selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} selectedNetmap={selectedNetmap} setSelectedNetmap={setSelectedNetmap} fitViewRef={fitViewRef} />
      <Sidebar 
        onMainPageClick={handleMainPageClick}
        onDataTableClick={handleDataTableClick}
        onNetmapClick={handleNetmapClick}
        onDisclaimerClick={handleDisclaimerClick}
        onTestingClick={handleTestingClick}
        currentPage={currentPage}
      />
      <div className={`main-content ${currentPage === 'main' ? 'main-page-active' : ''} ${currentPage === 'datatable' ? 'datatable-page-active' : ''} ${currentPage === 'netmap' ? 'netmap-page-active' : ''} ${currentPage === 'disclaimer' ? 'disclaimer-page-active' : ''} ${currentPage === 'testing' ? 'testing-page-active' : ''}`}>
        {renderPage()}
      </div>
    </div>
  )
}

export default App

