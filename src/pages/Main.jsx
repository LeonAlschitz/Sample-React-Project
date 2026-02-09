import React from 'react'
import '../styles/PageLayout.css'
import './Main.css'
import Netmap from './Netmap.jsx'

function Main() {
  return (
    <div className="page">
      <div className="page-content">
        <div className="main-headline">Leon Alschitz</div>
        <p className="main-tagline">Security-conscious Full-Stack Engineer and data visualization</p>
        <Netmap embedded />
      </div>
    </div>
  )
}

export default Main

