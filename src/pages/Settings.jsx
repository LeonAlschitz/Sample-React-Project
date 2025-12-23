import React from 'react'
import '../styles/PageLayout.css'
import './Settings.css'

function Settings({ theme, setTheme }) {
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div className="page-content">
        <div className="page-section">
          <h2 className="page-section-title">Theme</h2>
          <div className="toggle-list">
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="toggle-input"
                />
                <span className="toggle-custom"></span>
                <span className="toggle-text">Default Mode</span>
              </label>
            </div>
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="toggle-input"
                />
                <span className="toggle-custom"></span>
                <span className="toggle-text">Dark Mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

