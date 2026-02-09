import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import '../styles/PageLayout.css'
import './Netmap.css'
import NetmapSidebar from '../components/NetmapSidebar.jsx'
import {
  getNodeRadius,
  getIconFilterUrl,
  ICON_SIZES,
  ICON_OFFSETS,
  ICON_FILTER_MATRIX,
  LABEL,
  isCoreNode,
  NODE_CLASS_CORE
} from '../config/netmapNodeStyle.js'
import {
  createNetmapSimulation,
  NETMAP_SIMULATION_MAIN,
  NETMAP_SIMULATION_SIDEBAR
} from '../config/netmapSimulation.js'
import floor1Devices from '../data/Floor1.json'
import floor2Devices from '../data/Floor2.json'
import floor3Devices from '../data/Floor3.json'

const netmapOptions = {
  all: 'All Floors',
  floor1: 'Floor 1',
  floor2: 'Floor 2',
  floor3: 'Floor 3'
}

export const NETMAP_OPTIONS = Object.entries(netmapOptions).map(([value, label]) => ({ value, label }))

function Netmap({ embedded = false, selectedNetmap: selectedNetmapProp, setSelectedNetmap, fitViewRef }) {
  const selectedNetmapState = useState(embedded ? 'floor1' : 'floor1')
  const effectiveSelectedNetmap = selectedNetmapProp !== undefined ? selectedNetmapProp : selectedNetmapState[0]
  const effectiveSetSelectedNetmap = setSelectedNetmap ?? selectedNetmapState[1]
  const [selectedNode, setSelectedNode] = useState(null)
  const [showSidebarNodeHint, setShowSidebarNodeHint] = useState(true)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const simulationRef = useRef(null)
  const sidebarNetmapRef = useRef(null)
  const zoomRef = useRef(null)
  const applyFitViewRef = useRef(null)

  const applyFitView = () => {
    const sim = simulationRef.current
    const container = containerRef.current
    const svgEl = svgRef.current
    const zoom = zoomRef.current
    if (!sim || !container || !svgEl || !zoom) return
    const nodes = sim.nodes()
    if (!nodes.length) return
    const width = container.offsetWidth || 800
    const height = container.offsetHeight || 600
    const padding = 60
    const minX = Math.min(...nodes.map(n => n.x)) - padding
    const maxX = Math.max(...nodes.map(n => n.x)) + padding
    const minY = Math.min(...nodes.map(n => n.y)) - padding
    const maxY = Math.max(...nodes.map(n => n.y)) + padding
    const w = maxX - minX
    const h = maxY - minY
    if (w <= 0 || h <= 0) return
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const scale = Math.min(width / w, height / h) * 0.9
    const scaleClamped = Math.max(0.1, Math.min(4, scale))
    const tx = width / 2 - cx * scaleClamped
    const ty = height / 2 - cy * scaleClamped
    const transform = d3.zoomIdentity.translate(tx, ty).scale(scaleClamped)
    d3.select(svgEl).call(zoom.transform, transform)
  }

  applyFitViewRef.current = applyFitView

  useEffect(() => {
    if (fitViewRef) fitViewRef.current = applyFitViewRef.current
  })

  useEffect(() => {
    if (effectiveSelectedNetmap === 'all') setSelectedNode(null)
  }, [effectiveSelectedNetmap])

  const handleNetmapChange = (e) => {
    const value = e.target.value
    effectiveSetSelectedNetmap(value)
    if (value === 'all') {
      setSelectedNode(null)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.offsetWidth || 800
    const height = container.offsetHeight || 600

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    svg.selectAll('*').remove()

    const defs = svg.append('defs')

    defs.append('filter').attr('id', 'netmap-icon-green')
      .append('feColorMatrix').attr('type', 'matrix')
      .attr('values', ICON_FILTER_MATRIX.green)
    defs.append('filter').attr('id', 'netmap-icon-red')
      .append('feColorMatrix').attr('type', 'matrix')
      .attr('values', ICON_FILTER_MATRIX.red)

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--netmap-edge-color, #666)')

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)
    zoomRef.current = zoom

    const initialTransform = d3.zoomIdentity.translate(50, 50).scale(0.8)
    svg.call(zoom.transform, initialTransform)

    const baseDeviceSource =
      effectiveSelectedNetmap === 'floor2'
        ? floor2Devices.data
        : effectiveSelectedNetmap === 'floor3'
          ? floor3Devices.data
          : effectiveSelectedNetmap === 'floor1'
            ? floor1Devices.data
            : [
                ...floor1Devices.data,
                ...floor2Devices.data,
                ...floor3Devices.data
              ]

    const deviceSource =
      effectiveSelectedNetmap === 'all'
        ? baseDeviceSource
        : baseDeviceSource.filter(device => !(
            Array.isArray(device.tags) && device.tags.includes('Core')
          ))

    const filteredDevices = [...deviceSource]

    const nodes = filteredDevices.map(device => ({
      id: device.id,
      name: device.name,
      ip: device.ipAddress,
      type: device.type,
      status: device.status,
      location: device.location,
      subnet: device.subnet,
      connectedTo: device.connectedTo || [],
      ...device
    }))

    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    const linkSet = new Set()
    let links = []

    nodes.forEach(node => {
      if (node.connectedTo && Array.isArray(node.connectedTo)) {
        node.connectedTo.forEach(targetId => {
          if (nodeMap.has(targetId)) {
            const linkKey1 = `${node.id}-${targetId}`
            const linkKey2 = `${targetId}-${node.id}`
            
            if (!linkSet.has(linkKey1) && !linkSet.has(linkKey2)) {
              linkSet.add(linkKey1)
              links.push({
                source: node.id,
                target: targetId,
                bidirectional: true
              })
            }
          }
        })
      }
    })


    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'var(--netmap-edge-color, #666)')
      .attr('stroke-width', 2)

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('fill', 'none')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    const getNodeColor = (d) => {
      return d.status === 'online'
        ? 'var(--netmap-node-online, #10b981)'
        : 'var(--netmap-node-offline, #ef4444)'
    }

    node
      .classed(NODE_CLASS_CORE, d => isCoreNode(d))

    node.append('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', 'var(--netmap-background)')
      .attr('stroke', 'none')

    const baseUrl = import.meta.env.BASE_URL
    const filterPrefix = 'netmap'
    node
      .filter(d => Array.isArray(d.tags) && (d.tags.includes('Device') || d.tags.includes('Printer') || d.tags.includes('Phone')))
      .each(function (d) {
        const tag = d.tags.includes('Device') ? 'Device' : d.tags.includes('Printer') ? 'Printer' : 'Phone'
        const icon = tag === 'Printer' ? 'printer.svg' : tag === 'Phone' ? 'smartphone.svg' : 'computer.svg'
        const size = ICON_SIZES[tag]
        const half = size / 2
        const ox = ICON_OFFSETS[tag].x
        const oy = ICON_OFFSETS[tag].y
        d3.select(this).append('image')
          .attr('xlink:href', `${baseUrl}assets/icons/${icon}`)
          .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
          .style('pointer-events', 'none')
          .style('filter', getIconFilterUrl(filterPrefix, d.status))
      })

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Switch'))
      .each(function (d) {
        const size = ICON_SIZES.Switch
        const half = size / 2
        const ox = ICON_OFFSETS.Switch.x
        const oy = ICON_OFFSETS.Switch.y
        d3.select(this).append('image')
          .attr('xlink:href', `${baseUrl}assets/icons/switch.svg`)
          .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
          .style('pointer-events', 'none')
          .style('filter', getIconFilterUrl(filterPrefix, d.status))
      })

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Gateway'))
      .each(function (d) {
        const size = ICON_SIZES.Gateway
        const half = size / 2
        const ox = ICON_OFFSETS.Gateway.x
        const oy = ICON_OFFSETS.Gateway.y
        d3.select(this).append('image')
          .attr('xlink:href', `${baseUrl}assets/icons/gateway.svg`)
          .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
          .style('pointer-events', 'none')
          .style('filter', getIconFilterUrl(filterPrefix, d.status))
      })

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
    const textColor = isDarkMode ? '#ffffff' : '#000000'

    node.append('title')
      .text(d => `${d.name}\n${d.ip}\nStatus: ${d.status}`)

    const labelGroup = g.append('g').attr('class', 'node-labels')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-label')
      .style('pointer-events', 'none')
    labelGroup.append('rect')
      .attr('class', 'label-bg')
      .attr('x', d => getNodeRadius(d) + LABEL.gap)
      .attr('y', LABEL.rectY)
      .attr('height', LABEL.rectHeight)
      .attr('fill', 'var(--netmap-text-background, rgba(255, 255, 255, 0.95))')
      .attr('stroke', 'var(--border-color, #e2e8f0)')
      .attr('stroke-width', 0.5)
      .attr('rx', 2)
    labelGroup.append('text')
      .attr('class', 'node-label-text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', LABEL.fontSize)
      .attr('font-weight', '400')
      .style('fill', textColor)
      .style('user-select', 'none')
      .text(d => d.name || d.id)
    labelGroup.select('text').each(function () {
      const d = d3.select(this.parentNode).datum()
      const bbox = this.getBBox()
      const rectX = getNodeRadius(d) + LABEL.gap
      const rectWidth = bbox.width + LABEL.rectWidthPadding
      d3.select(this.parentNode).select('.label-bg')
        .attr('width', rectWidth)
        .attr('x', rectX)
      d3.select(this).attr('x', rectX + rectWidth / 2)
    })

    const simulation = createNetmapSimulation(nodes, links, width, height, NETMAP_SIMULATION_MAIN)
    simulationRef.current = simulation

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
      labelGroup.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    let dragStartX = 0
    let dragStartY = 0
    let isDragging = false

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      const [x, y] = d3.pointer(event, g.node())
      dragStartX = x
      dragStartY = y
      isDragging = false
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      const [x, y] = d3.pointer(event, g.node())
      const dragDistance = Math.sqrt(
        Math.pow(x - dragStartX, 2) + 
        Math.pow(y - dragStartY, 2)
      )
      
      if (dragDistance > 3) {
        if (!isDragging) {
          isDragging = true
        }
        d.fx = x
        d.fy = y
      }
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      
      if (!isDragging) {
        d.fx = null
        d.fy = null
        setTimeout(() => {
          setSelectedNode(d)
        }, 0)
      } else {
        d.fx = null
        d.fy = null
      }
    }

    const handleResize = () => {
      const newWidth = container.offsetWidth || 800
      const newHeight = container.offsetHeight || 600
      svg.attr('width', newWidth).attr('height', newHeight)
      if (simulationRef.current) {
        simulationRef.current.force('center', d3.forceCenter(newWidth / 2, newHeight / 2).strength(NETMAP_SIMULATION_MAIN.centerStrength))
        simulationRef.current.alpha(0.3).restart()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [effectiveSelectedNetmap])

  useEffect(() => {
    if (!selectedNode) return

    let simulation = null
    const timeoutId = setTimeout(() => {
      if (!sidebarNetmapRef.current) return
      const svg = d3.select(sidebarNetmapRef.current)
      const container = sidebarNetmapRef.current.parentElement
      const width = container.offsetWidth || 360
      const height = container.offsetHeight || 300

      svg.attr('width', width).attr('height', height)
      svg.selectAll('*').remove()

      const sidebarDefs = svg.append('defs')
      sidebarDefs.append('filter').attr('id', 'sidebar-icon-green')
        .append('feColorMatrix').attr('type', 'matrix')
        .attr('values', ICON_FILTER_MATRIX.green)
      sidebarDefs.append('filter').attr('id', 'sidebar-icon-red')
        .append('feColorMatrix').attr('type', 'matrix')
        .attr('values', ICON_FILTER_MATRIX.red)

      const g = svg.append('g')

      const zoom = d3.zoom()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })

      svg.call(zoom)

      let sidebarDataSource =
        effectiveSelectedNetmap === 'floor2'
          ? floor2Devices.data
          : effectiveSelectedNetmap === 'floor3'
            ? floor3Devices.data
            : effectiveSelectedNetmap === 'all'
              ? [
                  ...floor1Devices.data,
                  ...floor2Devices.data,
                  ...floor3Devices.data
                ]
              : floor1Devices.data

      if (effectiveSelectedNetmap !== 'all') {
        sidebarDataSource = sidebarDataSource.filter(device => !(
          Array.isArray(device.tags) && device.tags.includes('Core')
        ))
      }
      const nodeMap = new Map(sidebarDataSource.map(device => [device.id, device]))

      const createSidebarNode = (originalNode, x, y) => {
        return {
          ...originalNode,
          x: x,
          y: y,
          fx: undefined,
          fy: undefined
        }
      }

      const sidebarNodes = [createSidebarNode(selectedNode, width / 2, height / 2)]
      const connectedNodeIds = selectedNode.connectedTo || []

      connectedNodeIds.forEach((nodeId, index) => {
        if (nodeMap.has(nodeId)) {
          const originalNode = nodeMap.get(nodeId)
          const x = width / 2 + (index % 2 === 0 ? -100 : 100)
          const y = height / 2 + (Math.floor(index / 2) * 80 - 80)
          sidebarNodes.push(createSidebarNode(originalNode, x, y))
        }
      })

      const sidebarLinks = connectedNodeIds
        .filter(nodeId => nodeMap.has(nodeId))
        .map(nodeId => ({
          source: selectedNode.id,
          target: nodeId
        }))

      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
      const textColor = isDarkMode ? '#ffffff' : '#000000'

      const linkGroup = g.append('g').attr('class', 'sidebar-links')
      const nodeGroup = g.append('g').attr('class', 'sidebar-nodes')

      const link = linkGroup
        .selectAll('line')
        .data(sidebarLinks)
        .enter()
        .append('line')
        .attr('stroke', 'var(--netmap-edge-color, #666)')
        .attr('stroke-width', 2)

      const node = nodeGroup
        .selectAll('g')
        .data(sidebarNodes)
        .enter()
        .append('g')
        .attr('class', 'sidebar-node')
        .classed(NODE_CLASS_CORE, d => isCoreNode(d))
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))

      let sidebarDragStartX = 0
      let sidebarDragStartY = 0
      let sidebarIsDragging = false

      function dragstarted(event, d) {
        event.sourceEvent.stopPropagation()
        if (!event.active) simulation.alphaTarget(0.3).restart()
        const [x, y] = d3.pointer(event, g.node())
        sidebarDragStartX = x
        sidebarDragStartY = y
        sidebarIsDragging = false
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(event, d) {
        event.sourceEvent.stopPropagation()
        const [x, y] = d3.pointer(event, g.node())
        const dragDistance = Math.sqrt(
          Math.pow(x - sidebarDragStartX, 2) +
          Math.pow(y - sidebarDragStartY, 2)
        )

        if (dragDistance > 3) {
          if (!sidebarIsDragging) {
            sidebarIsDragging = true
          }
          d.fx = x
          d.fy = y
        }
      }

      function dragended(event, d) {
        event.sourceEvent.stopPropagation()
        if (!event.active) simulation.alphaTarget(0)

        if (!sidebarIsDragging) {
          setShowSidebarNodeHint(false)
          if (d.id !== selectedNode.id) {
            const originalNode = sidebarDataSource.find(device => device.id === d.id)
            if (originalNode) {
              setSelectedNode(originalNode)
            }
          }
        } else {
          d.fx = null
          d.fy = null
        }
      }

      const sidebarFilterPrefix = 'sidebar'
      node.append('circle')
        .attr('r', d => getNodeRadius(d))
        .attr('data-selected', d => d.id === selectedNode.id ? 'true' : 'false')
        .attr('fill', 'var(--netmap-background)')
        .attr('stroke', 'none')

      const sidebarBaseUrl = import.meta.env.BASE_URL
      node
        .filter(d => Array.isArray(d.tags) && (d.tags.includes('Device') || d.tags.includes('Printer') || d.tags.includes('Phone')))
        .each(function (d) {
          const tag = d.tags.includes('Device') ? 'Device' : d.tags.includes('Printer') ? 'Printer' : 'Phone'
          const icon = tag === 'Printer' ? 'printer.svg' : tag === 'Phone' ? 'smartphone.svg' : 'computer.svg'
          const size = ICON_SIZES[tag]
          const half = size / 2
          const ox = ICON_OFFSETS[tag].x
          const oy = ICON_OFFSETS[tag].y
          d3.select(this).append('image')
            .attr('xlink:href', `${sidebarBaseUrl}assets/icons/${icon}`)
            .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
            .style('pointer-events', 'none')
            .style('filter', getIconFilterUrl(sidebarFilterPrefix, d.status))
        })

      node
        .filter(d => Array.isArray(d.tags) && d.tags.includes('Switch'))
        .each(function (d) {
          const size = ICON_SIZES.Switch
          const half = size / 2
          const ox = ICON_OFFSETS.Switch.x
          const oy = ICON_OFFSETS.Switch.y
          d3.select(this).append('image')
            .attr('xlink:href', `${sidebarBaseUrl}assets/icons/switch.svg`)
            .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
            .style('pointer-events', 'none')
            .style('filter', getIconFilterUrl(sidebarFilterPrefix, d.status))
        })

      node
        .filter(d => Array.isArray(d.tags) && d.tags.includes('Gateway'))
        .each(function (d) {
          const size = ICON_SIZES.Gateway
          const half = size / 2
          const ox = ICON_OFFSETS.Gateway.x
          const oy = ICON_OFFSETS.Gateway.y
          d3.select(this).append('image')
            .attr('xlink:href', `${sidebarBaseUrl}assets/icons/gateway.svg`)
            .attr('x', -half + ox).attr('y', -half + oy).attr('width', size).attr('height', size)
            .style('pointer-events', 'none')
            .style('filter', getIconFilterUrl(sidebarFilterPrefix, d.status))
        })

      node.append('title')
        .text(d => `${d.name}\n${d.ip || d.ipAddress || 'N/A'}\nStatus: ${d.status}`)

      const sidebarLabelGroup = g.append('g').attr('class', 'sidebar-node-labels')
        .selectAll('g')
        .data(sidebarNodes)
        .enter()
        .append('g')
        .attr('class', 'node-label')
        .style('pointer-events', 'none')
      sidebarLabelGroup.append('rect')
        .attr('class', 'sidebar-label-bg')
        .attr('x', d => getNodeRadius(d) + LABEL.gap)
        .attr('y', LABEL.rectYSidebar)
        .attr('height', LABEL.rectHeightSidebar)
        .attr('fill', 'var(--netmap-text-background, rgba(255, 255, 255, 0.95))')
        .attr('stroke', 'var(--border-color)')
        .attr('stroke-width', 0.5)
        .attr('rx', 2)
      sidebarLabelGroup.append('text')
        .attr('class', 'sidebar-node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', d => d.id === selectedNode.id ? LABEL.fontSizeSelected : LABEL.fontSize)
        .attr('font-weight', '400')
        .style('fill', textColor)
        .style('user-select', 'none')
        .text(d => d.name || d.id)
      sidebarLabelGroup.select('text').each(function () {
        const d = d3.select(this.parentNode).datum()
        const bbox = this.getBBox()
        const rectX = getNodeRadius(d) + LABEL.gap
        const rectWidth = bbox.width + LABEL.rectWidthPadding
        d3.select(this.parentNode).select('.sidebar-label-bg')
          .attr('width', rectWidth)
          .attr('x', rectX)
        d3.select(this).attr('x', rectX + rectWidth / 2)
      })

      simulation = createNetmapSimulation(sidebarNodes, sidebarLinks, width, height, NETMAP_SIMULATION_SIDEBAR)
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node.attr('transform', d => `translate(${d.x},${d.y})`)
        sidebarLabelGroup.attr('transform', d => `translate(${d.x},${d.y})`)
      })

      const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1)
      svg.call(zoom.transform, initialTransform)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (simulation) {
        simulation.stop()
      }
      if (sidebarNetmapRef.current) {
        d3.select(sidebarNetmapRef.current).selectAll('*').remove()
      }
    }
  }, [selectedNode, effectiveSelectedNetmap])

  if (embedded) {
    return (
      <div className="netmap-embed-wrapper">
        <p className={`netmap-subtitle ${selectedNode ? 'netmap-subtitle-faded' : ''}`}>Click a node to view details and navigate between nodes in the sidebar.</p>
        <div className="netmap-embed-content">
          <div className="netmap-container" ref={containerRef}>
            <svg ref={svgRef} className="netmap-svg"></svg>
          </div>
          <NetmapSidebar
            open={!!selectedNode}
            onClose={() => { setSelectedNode(null); setShowSidebarNodeHint(true) }}
            netmapSvgRef={sidebarNetmapRef}
            data={selectedNode}
            showNodeHint={showSidebarNodeHint}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-content">
        <p className={`netmap-subtitle ${selectedNode ? 'netmap-subtitle-faded' : ''}`}>Click a node to view details and navigate between nodes in the sidebar.</p>
        <div className="netmap-container" ref={containerRef}>
          <svg ref={svgRef} className="netmap-svg"></svg>
        </div>
        <NetmapSidebar
          open={!!selectedNode}
          onClose={() => { setSelectedNode(null); setShowSidebarNodeHint(true) }}
          netmapSvgRef={sidebarNetmapRef}
          data={selectedNode}
          showNodeHint={showSidebarNodeHint}
        />
      </div>
    </div>
  )
}

export default Netmap

