import React from 'react'
import '../styles/PageLayout.css'
import './Disclaimer.css'

function Disclaimer() {
  return (
    <div className="page">
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
        </div>
      </div>
    </div>
  )
}

export default Disclaimer

