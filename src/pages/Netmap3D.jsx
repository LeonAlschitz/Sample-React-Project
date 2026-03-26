import React from 'react'
import '../styles/PageLayout.css'
import './Netmap.css'
import './Netmap3D.css'
import Netmap3DPanel from '../components/Netmap3DPanel.jsx'

function Netmap3D({ selectedNetmap3D, fitViewRef }) {
  return (
    <div className="page netmap-3d-page">
      <div className="page-content netmap-3d-content">
        <p className="netmap-subtitle">
          Left click + drag a node to reposition it. Left click + drag the background to rotate the view. Right click + drag pans the view; scroll to zoom.
        </p>
        <div className="card netmap-3d-viewport-card">
          <Netmap3DPanel netmapScope={selectedNetmap3D} fitViewRef={fitViewRef} />
        </div>
      </div>
    </div>
  )
}

export default Netmap3D
