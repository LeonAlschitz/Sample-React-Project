import React from 'react'
import '../styles/PageLayout.css'
import './Main.css'

function Main() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Nexus Infrastructure Solutions</h1>
      </div>
      <div className="page-content">
        <div className="page-section">
          <div className="page-container">
            <h2 className="page-section-title">Welcome to Nexus</h2>
            <div className="page-body">
              <p>
                Nexus Infrastructure Solutions is a leading provider of enterprise network management 
                and monitoring solutions. We help organizations maintain optimal network performance, 
                ensure security, and maximize uptime across their IT infrastructure.
              </p>
              <p>
                Our comprehensive platform provides real-time visibility into your network devices, 
                performance metrics, and system health, enabling proactive management and rapid 
                issue resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="page-grid page-grid-2">
          <div className="page-container">
            <h2 className="page-section-title">Network Monitoring</h2>
            <div className="page-body">
              <p>
                Monitor all your network devices in real-time. Track CPU usage, memory consumption, 
                uptime, and connection status across your entire infrastructure.
              </p>
            </div>
          </div>

          <div className="page-container">
            <h2 className="page-section-title">Performance Analytics</h2>
            <div className="page-body">
              <p>
                Gain insights into your network performance with detailed analytics and reporting. 
                Identify trends, optimize resource allocation, and plan for future growth.
              </p>
            </div>
          </div>
        </div>

        <div className="page-section">
          <div className="page-container">
            <h2 className="page-section-title">Key Features</h2>
            <div className="page-body">
              <ul className="feature-list">
                <li>Real-time device monitoring and status tracking</li>
                <li>Comprehensive performance metrics and analytics</li>
                <li>Intuitive data visualization and reporting</li>
                <li>Scalable architecture for enterprise deployments</li>
                <li>Secure and reliable infrastructure management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main

