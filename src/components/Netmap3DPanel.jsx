import React, { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { refreshNetmap3DNodeMaterialsFromTheme } from '@netmap3d/netmap3DMaterials.js'
import { createSwitchGraphNode } from '@netmap3d/switchGraphNode.js'
import { createPhoneGraphNode } from '@netmap3d/phoneGraphNode.js'
import { createGatewayGraphNode } from '@netmap3d/gatewayGraphNode.js'
import { createPrinterGraphNode } from '@netmap3d/printerGraphNode.js'
import { createWorkstationGraphNode } from '@netmap3d/workstationGraphNode.js'
import { applyLeftRightInitialLayout } from '@netmap3d/leftRightInitialLayout.js'
import { loadNetmap3DDataForScope } from '../data/LoadNetmap3DData.js'
import './Netmap3DPanel.css'

const LINK_NODE_INSET = 15
const HOVER_VISUAL_SCALE = 1.3

const OFFLINE_PULSE_HZ = 1 / 1.5
const OFFLINE_PULSE_INTENSITY_MIN = 0.12
const OFFLINE_PULSE_INTENSITY_MAX = 0.95
const OFFLINE_PULSE_HOVER_EXTRA = 0.2

function isNodeOffline(node) {
  return node && node.status !== 'online'
}

function applyOfflinePulse(nodeObjectsById, graphNodes, timeSec) {
  const w = 0.5 + 0.5 * Math.sin(timeSec * Math.PI * 2 * OFFLINE_PULSE_HZ)
  const pulse = OFFLINE_PULSE_INTENSITY_MIN + w * (OFFLINE_PULSE_INTENSITY_MAX - OFFLINE_PULSE_INTENSITY_MIN)

  for (const node of graphNodes) {
    if (!isNodeOffline(node)) continue
    const root = nodeObjectsById.get(node.id)
    if (!root) continue
    const visual = root.userData.netmap3DVisual || root
    visual.traverse((child) => {
      if (!child.isMesh || !child.material) return
      const m = child.material
      if (m.type === 'MeshBasicMaterial' || !('emissive' in m) || !('emissiveIntensity' in m)) return
      m.emissive.copy(m.color)
      let intensity = pulse
      if (root.userData._hoverActive) {
        intensity += OFFLINE_PULSE_HOVER_EXTRA
      }
      m.emissiveIntensity = intensity
    })
  }
}

function linkPositionUpdate(linkObject, { start, end }) {
  const mesh = linkObject.type === 'Mesh' ? linkObject : linkObject.children[0]
  if (!mesh || mesh.type !== 'Mesh') return false

  const vStart = new THREE.Vector3(start.x, start.y ?? 0, start.z ?? 0)
  const vEnd = new THREE.Vector3(end.x, end.y ?? 0, end.z ?? 0)
  const dir = new THREE.Vector3().subVectors(vEnd, vStart)
  const dist = dir.length()
  if (dist < 1e-6) return true

  dir.multiplyScalar(1 / dist)
  const inset = Math.min(LINK_NODE_INSET, dist * 0.48)
  const vS = new THREE.Vector3().copy(vStart).addScaledVector(dir, inset)
  const vE = new THREE.Vector3().copy(vEnd).addScaledVector(dir, -inset)
  const newDist = vS.distanceTo(vE)
  if (newDist < 1e-6) return true

  mesh.position.copy(vS)
  mesh.scale.z = newDist

  const target = vE.clone()
  mesh.parent.localToWorld(target)
  mesh.lookAt(target)

  return true
}

function isPhoneNode(node) {
  if (!node) return false
  if (node.type === 'IP Phone') return true
  return Array.isArray(node.tags) && node.tags.includes('Phone')
}

function isPrinterNode(node) {
  if (!node) return false
  if (node.type === 'Printer') return true
  return Array.isArray(node.tags) && node.tags.includes('Printer')
}

function nodeThreeObjectFromData(node) {
  if (node && node.type === 'Switch') {
    return createSwitchGraphNode(node)
  }
  if (isPhoneNode(node)) {
    return createPhoneGraphNode(node)
  }
  if (isPrinterNode(node)) {
    return createPrinterGraphNode(node)
  }
  if (node && node.type === 'Router') {
    return createGatewayGraphNode(node)
  }
  return createWorkstationGraphNode(node)
}

const POPUP_Z_BASE = 900
const VIEW_MARGIN = 8

function clampPopupToViewport(x, y, width, height) {
  const w = width > 0 ? width : 280
  const h = height > 0 ? height : 56
  const maxX = Math.max(VIEW_MARGIN, window.innerWidth - w - VIEW_MARGIN)
  const maxY = Math.max(VIEW_MARGIN, window.innerHeight - h - VIEW_MARGIN)
  return {
    x: Math.min(Math.max(VIEW_MARGIN, x), maxX),
    y: Math.min(Math.max(VIEW_MARGIN, y), maxY)
  }
}

function normalizeStatusKey(node) {
  const s = node && typeof node.status === 'string' ? node.status.toLowerCase() : ''
  if (s === 'online') return 'online'
  if (s === 'offline') return 'offline'
  return 'unknown'
}

function statusLabelFor(key) {
  if (key === 'online') return 'Online'
  if (key === 'offline') return 'Offline'
  return 'Unknown'
}

function buildNeighborEntries(node, catalog) {
  const ids = Array.isArray(node?.connectedTo) ? node.connectedTo : []
  const out = []
  for (const nid of ids) {
    if (typeof nid !== 'string') continue
    const other = catalog.get(nid)
    out.push({
      id: nid,
      label: other && other.name != null ? String(other.name) : nid
    })
  }
  out.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  return out
}

function buildPopupRecord(node, catalog) {
  const name = String(node?.name ?? node?.id ?? '')
  const statusKey = normalizeStatusKey(node)
  const deviceType = node?.type != null ? String(node.type) : null
  const ipAddress = node?.ipAddress != null ? String(node.ipAddress) : null
  const location = node?.location != null ? String(node.location) : null
  const subnetLabel = node?.subnetLabel != null ? String(node.subnetLabel) : null
  const neighbors = buildNeighborEntries(node, catalog)
  return {
    id: node.id,
    name,
    statusKey,
    statusLabel: statusLabelFor(statusKey),
    deviceType,
    ipAddress,
    location,
    subnetLabel,
    neighbors
  }
}

function Netmap3DPanel({ netmapScope = 'floor1', ariaLabel, fitViewRef }) {
  const hostRef = useRef(null)
  const wrapRef = useRef(null)
  const popupsRef = useRef([])
  const popupBoxRefs = useRef(new Map())
  const nextZRef = useRef(POPUP_Z_BASE)
  const nodeCatalogRef = useRef(new Map())
  const [popups, setPopups] = useState([])
  const openNodePopupRef = useRef(() => {})

  const setPopupBoxRef = useCallback((id, el) => {
    if (el) {
      popupBoxRefs.current.set(id, el)
    } else {
      popupBoxRefs.current.delete(id)
    }
  }, [])

  useEffect(() => {
    popupsRef.current = popups
  }, [popups])

  const focusPopup = useCallback((id) => {
    setPopups((prev) => {
      if (!prev.some((p) => p.id === id)) return prev
      const z = ++nextZRef.current
      return prev.map((p) => (p.id === id ? { ...p, z } : p))
    })
  }, [])

  const openNodePopup = useCallback((node) => {
    if (!node || node.id == null) return
    setPopups((prev) => {
      if (prev.some((p) => p.id === node.id)) return prev
      const catalog = nodeCatalogRef.current
      const detail = buildPopupRecord(node, catalog)
      const rect = wrapRef.current?.getBoundingClientRect()
      const n = prev.length
      let x = (rect?.left ?? 24) + 12 + (n % 6) * 24
      let y = (rect?.top ?? 24) + 12 + (n % 6) * 24
      const z = ++nextZRef.current
      ;({ x, y } = clampPopupToViewport(x, y, 360, 220))
      return [...prev, { ...detail, x, y, z }]
    })
  }, [])

  openNodePopupRef.current = openNodePopup

  const closePopup = useCallback((id) => {
    popupBoxRefs.current.delete(id)
    setPopups((prev) => prev.filter((p) => p.id !== id))
  }, [])

  useEffect(() => {
    setPopups([])
    nextZRef.current = POPUP_Z_BASE
    popupBoxRefs.current.clear()
    nodeCatalogRef.current = new Map()
  }, [netmapScope])

  useEffect(() => {
    const onResize = () => {
      setPopups((prev) =>
        prev.map((p) => {
          const el = popupBoxRefs.current.get(p.id)
          const box = el?.getBoundingClientRect()
          const { x, y } = clampPopupToViewport(p.x, p.y, box?.width ?? 280, box?.height ?? 56)
          return { ...p, x, y }
        })
      )
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPopupHeaderPointerDown = useCallback((e, id) => {
    if (e.button !== 0) return
    if (e.target.closest('button')) return
    e.preventDefault()
    const p = popupsRef.current.find((x) => x.id === id)
    if (!p) return
    const el = popupBoxRefs.current.get(id)
    const box = el?.getBoundingClientRect()
    const pw = box?.width ?? 280
    const ph = box?.height ?? 56
    const startX = e.clientX
    const startY = e.clientY
    const origX = p.x
    const origY = p.y
    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let nx = origX + dx
      let ny = origY + dy
      ;({ x: nx, y: ny } = clampPopupToViewport(nx, ny, pw, ph))
      setPopups((pr) =>
        pr.map((pp) => (pp.id === id ? { ...pp, x: nx, y: ny } : pp))
      )
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const netmap3DData = loadNetmap3DDataForScope(netmapScope)
    nodeCatalogRef.current = new Map(netmap3DData.nodes.map((n) => [n.id, n]))
    applyLeftRightInitialLayout(netmap3DData.nodes, netmap3DData.links)
    const nodeObjectsById = new Map()

    const setNodeHoverState = (nodeId, hovering) => {
      if (!nodeId) return
      const obj = nodeObjectsById.get(nodeId)
      if (!obj) return

      obj.userData._hoverActive = hovering

      const visual = obj.userData.netmap3DVisual
      if (visual) {
        if (hovering) {
          if (!visual.userData._hoverBaseScale) {
            visual.userData._hoverBaseScale = visual.scale.clone()
          }
          visual.scale.copy(visual.userData._hoverBaseScale).multiplyScalar(HOVER_VISUAL_SCALE)
        } else if (visual.userData._hoverBaseScale) {
          visual.scale.copy(visual.userData._hoverBaseScale)
          delete visual.userData._hoverBaseScale
        }
      }
    }

    const getBgColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--netmap-background').trim() ||
      '#fafbfc'

    const bg = getBgColor()

    const netmap3DView = new ForceGraph3D(el, {
      controlType: 'orbit',
      rendererConfig: { antialias: true, alpha: true }
    })
      .graphData(netmap3DData)
      .warmupTicks(120)
      .backgroundColor(bg)
      .showNavInfo(false)
      .nodeThreeObject(nodeThreeObjectFromData)
      .nodePositionUpdate((nodeObject, coords, node) => {
        if (node && node.id) {
          nodeObjectsById.set(node.id, nodeObject)
        }
      })
      .onNodeHover((node, prevNode) => {
        if (prevNode && prevNode.id) {
          setNodeHoverState(prevNode.id, false)
        }
        if (node && node.id) {
          setNodeHoverState(node.id, true)
        }
      })
      .onNodeClick((node) => {
        openNodePopupRef.current(node)
      })
      .linkOpacity(0.5)
      .linkWidth(1)
      .linkPositionUpdate(linkPositionUpdate)

    const syncTheme = () => {
      netmap3DView.backgroundColor(getBgColor())
      refreshNetmap3DNodeMaterialsFromTheme()
    }

    const themeObserver = new MutationObserver(() => syncTheme())
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    const layout = () => {
      const w = Math.max(200, el.clientWidth)
      const h = Math.max(200, el.clientHeight)
      netmap3DView.width(w).height(h)
    }

    const ro = new ResizeObserver(layout)
    ro.observe(el)
    layout()

    let didInitialFit = false
    const runInitialFit = () => {
      if (didInitialFit) return
      didInitialFit = true
      netmap3DView.zoomToFit(600, -150)
    }

    netmap3DView.onEngineStop(runInitialFit)

    const fitFallbackId = window.setTimeout(runInitialFit, 250)

    if (fitViewRef) {
      fitViewRef.current = () => {
        netmap3DView.zoomToFit(600, -150)
      }
    }

    let pulseRafId = null
    const pulseLoop = () => {
      const { nodes } = netmap3DView.graphData() || { nodes: [] }
      applyOfflinePulse(nodeObjectsById, nodes, performance.now() * 0.001)
      pulseRafId = requestAnimationFrame(pulseLoop)
    }
    pulseRafId = requestAnimationFrame(pulseLoop)

    return () => {
      if (pulseRafId !== null) {
        cancelAnimationFrame(pulseRafId)
      }
      if (fitViewRef) {
        fitViewRef.current = null
      }
      window.clearTimeout(fitFallbackId)
      ro.disconnect()
      themeObserver.disconnect()
      netmap3DView._destructor()
    }
  }, [netmapScope, fitViewRef])

  return (
    <div ref={wrapRef} className="netmap-3d-panel-wrap">
      <div
        ref={hostRef}
        className="netmap-3d-host"
        role="application"
        aria-label={ariaLabel || 'Interactive 3D Netmap. Drag to rotate, scroll to zoom.'}
      />
      {popups.map((p) => (
        <div
          key={p.id}
          ref={(el) => setPopupBoxRef(p.id, el)}
          className="netmap-3d-node-popup"
          style={{ left: p.x, top: p.y, zIndex: p.z ?? POPUP_Z_BASE }}
          role="dialog"
          aria-label={`Node ${p.name}`}
          onPointerDownCapture={() => focusPopup(p.id)}
        >
          <div
            className="netmap-3d-node-popup-header"
            onPointerDown={(e) => onPopupHeaderPointerDown(e, p.id)}
          >
            <p className="netmap-3d-node-popup-name">{p.name}</p>
          </div>
          <div className="netmap-3d-node-popup-body">
            <div className="netmap-3d-popup-row">
              <span className="netmap-3d-popup-k">Status</span>
              <span
                className={`netmap-3d-popup-status netmap-3d-popup-status--${p.statusKey ?? 'unknown'}`}
              >
                {p.statusLabel ?? 'Unknown'}
              </span>
            </div>
            {p.deviceType ? (
              <div className="netmap-3d-popup-row">
                <span className="netmap-3d-popup-k">Type</span>
                <span className="netmap-3d-popup-v">{p.deviceType}</span>
              </div>
            ) : null}
            {p.ipAddress ? (
              <div className="netmap-3d-popup-row">
                <span className="netmap-3d-popup-k">IP</span>
                <span className="netmap-3d-popup-v netmap-3d-popup-mono">{p.ipAddress}</span>
              </div>
            ) : null}
            {p.subnetLabel ? (
              <div className="netmap-3d-popup-row">
                <span className="netmap-3d-popup-k">Subnet</span>
                <span className="netmap-3d-popup-v">{p.subnetLabel}</span>
              </div>
            ) : null}
            {p.location ? (
              <div className="netmap-3d-popup-row netmap-3d-popup-row--block">
                <span className="netmap-3d-popup-k">Location</span>
                <span className="netmap-3d-popup-v">{p.location}</span>
              </div>
            ) : null}
            <div className="netmap-3d-popup-row netmap-3d-popup-row--block netmap-3d-popup-row--neighbors">
              <span className="netmap-3d-popup-k">Connected to</span>
              {p.neighbors && p.neighbors.length > 0 ? (
                <ul className="netmap-3d-popup-neighbors" aria-label="Neighbor devices">
                  {p.neighbors.map((nb) => (
                    <li key={nb.id} className="netmap-3d-popup-neighbor">
                      <span className="netmap-3d-popup-neighbor-name">{nb.label}</span>
                      {nb.label !== nb.id ? (
                        <span className="netmap-3d-popup-neighbor-id netmap-3d-popup-mono">
                          {nb.id}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="netmap-3d-popup-v netmap-3d-popup-muted">No links in this view</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="netmap-3d-node-popup-close"
            aria-label="Close"
            onClick={() => closePopup(p.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Netmap3DPanel
