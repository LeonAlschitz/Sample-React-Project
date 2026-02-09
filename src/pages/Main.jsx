import React from 'react'
import '../styles/PageLayout.css'
import './Main.css'
import Netmap from './Netmap.jsx'

function Main() {
  return (
    <div className="page">
      <div className="page-content main-page-content">
        <section className="main-left">
          <h1 className="main-headline">Leon Alschitz</h1>
          <p className="main-tagline">Security-conscious Full-Stack Engineer and data visualization</p>
          <div className="main-about">
            <h2 className="main-section-title">About</h2>
            <p className="main-body">Add a short bio or summary here for visitors and recruiters.</p>
          </div>
          <div className="main-employment">
            <h2 className="main-section-title">Experience</h2>
            <p className="main-body">Highlight relevant roles, technologies, and achievements.</p>
          </div>
          <div className="main-skills">
            <h2 className="main-section-title">Skills</h2>
            <p className="main-body">List key technologies and areas of focus.</p>
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

