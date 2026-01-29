import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import '../styles/PageLayout.css'
import './Netmap.css'
import floor1Devices from '../data/Floor1.json'
import floor2Devices from '../data/Floor2.json'
import floor3Devices from '../data/Floor3.json'

const netmapOptions = {
  all: 'All Floors',
  floor1: 'Floor 1',
  floor2: 'Floor 2',
  floor3: 'Floor 3'
}

function Netmap() {
  const [selectedNetmap, setSelectedNetmap] = useState('floor1')
  const [selectedNode, setSelectedNode] = useState(null)
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

  const handleNetmapChange = (e) => {
    const value = e.target.value
    setSelectedNetmap(value)
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
      selectedNetmap === 'floor2'
        ? floor2Devices.data
        : selectedNetmap === 'floor3'
          ? floor3Devices.data
          : selectedNetmap === 'floor1'
            ? floor1Devices.data
            : [
                ...floor1Devices.data,
                ...floor2Devices.data,
                ...floor3Devices.data
              ]

    const deviceSource =
      selectedNetmap === 'all'
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

    const getNodeRadius = (d) => {
      if (Array.isArray(d.tags) && d.tags.includes('Core')) {
        return 16
      }
      return 10
    }

    node
      .classed('core-node', d => Array.isArray(d.tags) && d.tags.includes('Core'))

    node.append('circle')
      .attr('r', getNodeRadius)
      .attr('fill', getNodeColor)
      .attr('stroke', 'var(--netmap-node-stroke, #fff)')
      .attr('stroke-width', 2)

    const baseUrl = import.meta.env.BASE_URL
    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Device'))
      .append('image')
      .attr('xlink:href', `${baseUrl}assets/icons/computer.svg`)
      .attr('x', -6)
      .attr('y', -6)
      .attr('width', 12)
      .attr('height', 12)
      .style('pointer-events', 'none')

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Switch'))
      .append('image')
      .attr('xlink:href', `${baseUrl}assets/icons/switch.svg`)
      .attr('x', -6)
      .attr('y', -6)
      .attr('width', 12)
      .attr('height', 12)
      .style('pointer-events', 'none')

    node
      .filter(d => Array.isArray(d.tags) && d.tags.includes('Gateway'))
      .append('image')
      .attr('xlink:href', `${baseUrl}assets/icons/gateway.svg`)
      .attr('x', -6)
      .attr('y', -6)
      .attr('width', 12)
      .attr('height', 12)
      .style('pointer-events', 'none')

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
    const textColor = isDarkMode ? '#ffffff' : '#000000'

    const labelBackground = node.append('rect')
      .attr('class', 'label-bg')
      .attr('x', 12)
      .attr('y', -6)
      .attr('height', 12)
      .attr('fill', 'var(--netmap-text-background, rgba(255, 255, 255, 0.95))')
      .attr('stroke', 'var(--border-color, #e2e8f0)')
      .attr('stroke-width', 0.5)
      .attr('rx', 2)
      .style('pointer-events', 'none')

    node.each(function(d) {
      d3.select(this).append('text')
        .attr('class', 'node-label-text')
        .attr('dx', 15)
        .attr('dy', 4)
        .attr('font-size', '10px')
        .attr('font-weight', '400')
        .style('fill', textColor)
        .style('opacity', '1')
        .style('user-select', 'none')
        .text(d.name || d.id)
    })

    node.select('text').each(function() {
      const bbox = this.getBBox()
      d3.select(this.parentNode).select('.label-bg')
        .attr('width', bbox.width + 4)
        .attr('x', 12)
      
      d3.select(this)
        .style('fill', textColor)
        .style('opacity', '1')
    })

    node.append('title')
      .text(d => `${d.name}\n${d.ip}\nStatus: ${d.status}`)

    const linkDistance = 120
    const chargeStrength = -300
    const centerForceStrength = 0.1

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance).strength(0.3))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(centerForceStrength))
      .force('collision', d3.forceCollide().radius(40).strength(0.9))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alpha(1.0)
      .alphaDecay(0.008)
      .alphaMin(0.001)

    simulationRef.current = simulation

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
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
        simulationRef.current.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
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
  }, [selectedNetmap])

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

      const g = svg.append('g')

      const zoom = d3.zoom()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })

      svg.call(zoom)

      let sidebarDataSource =
        selectedNetmap === 'floor2'
          ? floor2Devices.data
          : selectedNetmap === 'floor3'
            ? floor3Devices.data
            : selectedNetmap === 'all'
              ? [
                  ...floor1Devices.data,
                  ...floor2Devices.data,
                  ...floor3Devices.data
                ]
              : floor1Devices.data

      if (selectedNetmap !== 'all') {
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

      node.append('circle')
        .attr('r', d => d.id === selectedNode.id ? 15 : 10)
        .attr('data-selected', d => d.id === selectedNode.id ? 'true' : 'false')
        .attr('fill', d => {
          const isSelected = d.id === selectedNode.id
          return d.status === 'online'
            ? (isDarkMode ? '#34d399' : '#10b981')
            : (isDarkMode ? '#f87171' : '#ef4444')
        })
        .attr('stroke', isDarkMode ? '#1e293b' : '#ffffff')
        .attr('stroke-width', d => d.id === selectedNode.id ? 3 : 2)

      const sidebarBaseUrl = import.meta.env.BASE_URL
      node
        .filter(d => Array.isArray(d.tags) && d.tags.includes('Device'))
        .append('image')
        .attr('xlink:href', `${sidebarBaseUrl}assets/icons/computer.svg`)
        .attr('x', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('y', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('width', d => d.id === selectedNode.id ? 15 : 12)
        .attr('height', d => d.id === selectedNode.id ? 15 : 12)
        .style('pointer-events', 'none')

      node
        .filter(d => Array.isArray(d.tags) && d.tags.includes('Switch'))
        .append('image')
        .attr('xlink:href', `${sidebarBaseUrl}assets/icons/switch.svg`)
        .attr('x', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('y', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('width', d => d.id === selectedNode.id ? 15 : 12)
        .attr('height', d => d.id === selectedNode.id ? 15 : 12)
        .style('pointer-events', 'none')

      node
        .filter(d => Array.isArray(d.tags) && d.tags.includes('Gateway'))
        .append('image')
        .attr('xlink:href', `${sidebarBaseUrl}assets/icons/gateway.svg`)
        .attr('x', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('y', d => d.id === selectedNode.id ? -7.5 : -6)
        .attr('width', d => d.id === selectedNode.id ? 15 : 12)
        .attr('height', d => d.id === selectedNode.id ? 15 : 12)
        .style('pointer-events', 'none')

      node.each(function (d) {
        const nodeElement = d3.select(this)
        const labelBg = nodeElement.append('rect')
          .attr('class', 'sidebar-label-bg')
          .attr('x', d.id === selectedNode.id ? 20 : 15)
          .attr('y', -8)
          .attr('height', 16)
          .attr('fill', 'var(--netmap-text-background, rgba(255, 255, 255, 0.95))')
          .attr('stroke', 'var(--border-color)')
          .attr('stroke-width', 0.5)
          .attr('rx', 2)

        const text = nodeElement.append('text')
          .attr('class', 'sidebar-node-label')
          .attr('dx', d.id === selectedNode.id ? 20 : 15)
          .attr('dy', 4)
          .attr('font-size', d.id === selectedNode.id ? '12px' : '10px')
          .attr('font-weight', '400')
          .style('fill', textColor)
          .style('user-select', 'none')
          .text(d.name || d.id)

        const bbox = text.node().getBBox()
        labelBg
          .attr('width', bbox.width + 4)
          .attr('x', d.id === selectedNode.id ? 20 : 15)
      })

      node.append('title')
        .text(d => `${d.name}\n${d.ip || d.ipAddress || 'N/A'}\nStatus: ${d.status}`)

      simulation = d3.forceSimulation(sidebarNodes)
        .force('link', d3.forceLink(sidebarLinks).id(d => d.id).distance(80).strength(0.8))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(25))
        .alphaDecay(0.09)
        .alphaMin(0.001)

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node.attr('transform', d => `translate(${d.x},${d.y})`)
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
  }, [selectedNode, selectedNetmap])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Netmap</h1>
        <div className="page-header-actions">
          <button
            type="button"
            className="netmap-fit-button"
            onClick={() => applyFitViewRef.current?.()}
          >
            Fit view
          </button>
          <select 
            value={selectedNetmap} 
            onChange={handleNetmapChange}
            className="netmap-selector"
          >
            {Object.keys(netmapOptions).map(key => (
              <option key={key} value={key}>
                {netmapOptions[key]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="page-content">
        <div className="netmap-container" ref={containerRef}>
          <svg ref={svgRef} className="netmap-svg"></svg>
        </div>
        <div className={`netmap-sidebar ${selectedNode ? 'open' : ''}`}>
          <button 
            className="netmap-sidebar-close"
            onClick={() => setSelectedNode(null)}
          >
            ×
          </button>
          {selectedNode && (
            <>
              <div className="sidebar-netmap-container">
                <svg ref={sidebarNetmapRef} className="sidebar-netmap-svg"></svg>
              </div>
              <div className="sidebar-data-container">
                {Object.entries(selectedNode).map(([key, value]) => (
                  <div key={key} className="sidebar-data-row">
                    <div className="sidebar-data-key">{key}:</div>
                    <div className="sidebar-data-value">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Netmap

