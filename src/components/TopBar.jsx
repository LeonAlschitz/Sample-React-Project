import React from 'react'
import './TopBar.css'
import SelectMenu from './SelectMenu.jsx'
import TopBarActions from './TopBarActions.jsx'
import { DATASET_OPTIONS } from '../pages/DataTable.jsx'
import { NETMAP_OPTIONS } from '../pages/Netmap.jsx'

const PAGE_TITLES = {
  main: '',
  datatable: 'Data Table',
  netmap: 'Netmap',
  netmap3d: '3D Netmap',
  disclaimer: 'Disclaimer'
}

function TopBar({
  theme,
  setTheme,
  currentPage,
  selectedDataset,
  setSelectedDataset,
  selectedNetmap,
  setSelectedNetmap,
  selectedNetmap3D,
  setSelectedNetmap3D,
  fitViewRef,
  netmap3DFitViewRef
}) {
  const title = PAGE_TITLES[currentPage] ?? 'Main'
  return (
    <div className="top-bar">
      <h1 className="top-bar-title">{title}</h1>
      <div className="top-bar-actions">
        {currentPage === 'datatable' && (
          <SelectMenu
            value={selectedDataset}
            onChange={setSelectedDataset}
            options={DATASET_OPTIONS}
            ariaLabel="Select dataset"
          />
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
            <SelectMenu
              value={selectedNetmap}
              onChange={setSelectedNetmap}
              options={NETMAP_OPTIONS}
              ariaLabel="Select floor"
            />
          </>
        )}
        {currentPage === 'netmap3d' && (
          <>
            <button
              type="button"
              className="top-bar-fit-button"
              onClick={() => netmap3DFitViewRef?.current?.()}
              aria-label="Fit view"
            >
              Fit view
            </button>
            <SelectMenu
              value={selectedNetmap3D}
              onChange={setSelectedNetmap3D}
              options={NETMAP_OPTIONS}
              ariaLabel="Select floor"
            />
          </>
        )}
        <TopBarActions theme={theme} setTheme={setTheme} />
      </div>
    </div>
  )
}

export default TopBar
