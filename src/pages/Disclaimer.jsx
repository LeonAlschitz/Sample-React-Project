import React from 'react'
import '../styles/PageLayout.css'
import './Disclaimer.css'

function Disclaimer() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Disclaimer</h1>
      </div>
      <div className="page-content">
        <div className="page-section">
          <div className="page-container">
            <div className="page-body">
              <h2 className="page-section-title">About This Project</h2>
              <p>
                This application is a personal React project created for portfolio and demonstration purposes. 
                It is not affiliated with any real company or organization.
              </p>
              <p>
                All data, company names, and information displayed in this application are fictional and used 
                solely for demonstration purposes.
              </p>
            </div>
          </div>
          
          <div className="page-container">
            <div className="page-body">
              <h2 className="page-section-title">Contact Information</h2>
              <div className="contact-info">
                <p><strong>Email:</strong> [Your Email Address]</p>
                <p><strong>LinkedIn:</strong> [Your LinkedIn Profile]</p>
                <p><strong>GitHub:</strong> [Your GitHub Profile]</p>
                <p><strong>Portfolio:</strong> [Your Portfolio Website]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Disclaimer

