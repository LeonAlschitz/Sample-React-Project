import React from 'react'
import '../styles/PageLayout.css'
import './Main.css'
import Netmap from './Netmap.jsx'

function Main() {
  return (
    <div className="page main-page">
      <div className="page-content main-page-content">
        <section className="main-left">
          <h1 className="main-headline">Leon Alschitz</h1>
          <p className="main-tagline">Security-conscious Full-Stack Engineer and <strong>Data Visualization</strong></p>
          <div className="main-about">
            <h2 className="main-section-title">About</h2>
            <p className="main-body">Full-Stack Engineer focused on data-driven apps and <strong>Data Visualization</strong>. Production-ready code with an emphasis on data integrity.</p>
          </div>
          <div className="main-employment">
            <h2 className="main-section-title">Experience</h2>
            <p className="main-body"><strong>SecurOT</strong> (2024–2025) — Frontend and Full-Stack Engineer. Delivered <strong>visualization tools</strong>, and took ownership of the app in a full-stack role.</p>
          </div>
          <div className="main-skills">
            <h2 className="main-section-title">Skills</h2>
            <p className="main-body">React, D3.js, Tabulator, JavaScript, Vite, HTML5/CSS3, Data visualization.</p>
          </div>
        </section>
        <section className="main-right">
          <Netmap embedded />
        </section>
      </div>
    </div>
  )
}

export default Main

