import React from 'react'
import './TopBar.css'
import TopBarActions from './TopBarActions.jsx'
import { DATASET_OPTIONS } from '../pages/DataTable.jsx'
import { NETMAP_OPTIONS } from '../pages/Netmap.jsx'

const PAGE_TITLES = {
  main: '',
  datatable: 'Data Table',
  netmap: 'Netmap',
  disclaimer: 'Disclaimer'
}

function TopBar({ theme, setTheme, currentPage, selectedDataset, setSelectedDataset, selectedNetmap, setSelectedNetmap, fitViewRef }) {
  const title = PAGE_TITLES[currentPage] ?? 'Main'
  return (
    <div className="top-bar">
      <h1 className="top-bar-title">{title}</h1>
      <div className="top-bar-actions">
        {currentPage === 'datatable' && (
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="top-bar-dataset-selector"
            aria-label="Select dataset"
          >
            {DATASET_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        {currentPage === 'netmap' && (
          <>
            <button
              type="button"
              className="top-bar-fit-button"
              onClick={() => fitViewRef?.current?.()}
              aria-label="Fit view"
            >
              Fit view
            </button>
            <select
              value={selectedNetmap}
              onChange={(e) => setSelectedNetmap(e.target.value)}
              className="top-bar-netmap-selector"
              aria-label="Select floor"
            >
              {NETMAP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </>
        )}
        <TopBarActions theme={theme} setTheme={setTheme} />
      </div>
    </div>
  )
}

export default TopBar
