import React, { useEffect, useRef } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { refreshNetmap3DNodeMaterialsFromTheme } from '@netmap3d/netmap3DMaterials.js'
import { createSwitchGraphNode } from '@netmap3d/switchGraphNode.js'
import { createPhoneGraphNode } from '@netmap3d/phoneGraphNode.js'
import { createGatewayGraphNode } from '@netmap3d/gatewayGraphNode.js'
import { createPrinterGraphNode } from '@netmap3d/printerGraphNode.js'
import { createWorkstationGraphNode } from '@netmap3d/workstationGraphNode.js'
import { loadNetmap3DDataForScope } from '../data/LoadNetmap3DData.js'
import './Netmap3DPanel.css'

const LINK_NODE_INSET = 15

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

function Netmap3DPanel({ netmapScope = 'floor1', ariaLabel, fitViewRef }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const netmap3DData = loadNetmap3DDataForScope(netmapScope)

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

    return () => {
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
    <div
      ref={hostRef}
      className="netmap-3d-host"
      role="application"
      aria-label={ariaLabel || 'Interactive 3D Netmap. Drag to rotate, scroll to zoom.'}
    />
  )
}

export default Netmap3DPanel
