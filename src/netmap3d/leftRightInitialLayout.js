const STEP_X = 38
const YZ_SPREAD_RADIUS = 16
const COMPONENT_RING_RADIUS = 90

function linkEndpoints(link) {
  const s = typeof link.source === 'object' && link.source ? link.source.id : link.source
  const t = typeof link.target === 'object' && link.target ? link.target.id : link.target
  return { s: String(s), t: String(t) }
}

function hubPriority(node) {
  if (!node) return 0
  if (node.type === 'Router') return 3
  if (node.type === 'Switch') return 2
  return 1
}

function pickHubId(componentIds, adj, idToNode) {
  let bestId = null
  let bestDeg = -1
  let bestPri = -1
  for (const id of componentIds) {
    const node = idToNode.get(id)
    const deg = (adj.get(id) || []).length
    const pri = hubPriority(node)
    if (
      deg > bestDeg ||
      (deg === bestDeg && pri > bestPri) ||
      (deg === bestDeg && pri === bestPri && (bestId === null || id < bestId))
    ) {
      bestDeg = deg
      bestPri = pri
      bestId = id
    }
  }
  return bestId
}

function getComponents(nodeIds, adj) {
  const visited = new Set()
  const components = []
  for (const id of nodeIds) {
    if (visited.has(id)) continue
    const comp = []
    const stack = [id]
    visited.add(id)
    while (stack.length) {
      const u = stack.pop()
      comp.push(u)
      for (const v of adj.get(u) || []) {
        if (!visited.has(v)) {
          visited.add(v)
          stack.push(v)
        }
      }
    }
    components.push(comp)
  }
  return components
}

function yzRingOffsets(count, radius) {
  if (count <= 0) return []
  if (count === 1 || radius <= 0) return [{ y: 0, z: 0 }]
  const pts = []
  for (let i = 0; i < count; i++) {
    const a = (2 * Math.PI * i) / count
    pts.push({
      y: radius * Math.cos(a),
      z: radius * Math.sin(a)
    })
  }
  return pts
}

function assignXBilateral(hubId, compSet, adj) {
  const x = new Map()
  const parent = new Map()
  const queue = [hubId]
  const visited = new Set([hubId])
  x.set(hubId, 0)
  parent.set(hubId, null)

  while (queue.length) {
    const u = queue.shift()
    const xu = x.get(u)
    const p = parent.get(u)

    const forward = (adj.get(u) || [])
      .filter((v) => compSet.has(v) && v !== p)
      .sort((a, b) => a.localeCompare(b))

    const unvisited = forward.filter((v) => !visited.has(v))
    if (unvisited.length === 0) continue

    if (u === hubId) {
      unvisited.forEach((v, i) => {
        const alt = i % 2 === 0 ? -1 : 1
        const band = STEP_X * (1 + Math.floor(i / 2))
        x.set(v, xu + alt * band)
        parent.set(v, u)
        visited.add(v)
        queue.push(v)
      })
      continue
    }

    const deg = (adj.get(u) || []).length
    const branches = deg >= 2 && unvisited.length > 1

    if (!branches) {
      const v = unvisited[0]
      const sign = xu === 0 ? 1 : Math.sign(xu) || 1
      x.set(v, xu + sign * STEP_X)
      parent.set(v, u)
      visited.add(v)
      queue.push(v)
      continue
    }

    const mid = Math.ceil(unvisited.length / 2)
    const left = unvisited.slice(0, mid)
    const right = unvisited.slice(mid)
    left.forEach((v) => {
      x.set(v, xu - STEP_X)
      parent.set(v, u)
      visited.add(v)
      queue.push(v)
    })
    right.forEach((v) => {
      x.set(v, xu + STEP_X)
      parent.set(v, u)
      visited.add(v)
      queue.push(v)
    })
  }

  for (const id of compSet) {
    if (!x.has(id)) {
      x.set(id, STEP_X)
    }
  }

  return x
}

function componentCenters(n) {
  if (n <= 1) return [{ x: 0, y: 0, z: 0 }]
  const R = COMPONENT_RING_RADIUS * Math.max(1, Math.sqrt(n) * 0.65)
  const centers = []
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n
    centers.push({ x: R * Math.cos(a), y: 0, z: R * Math.sin(a) })
  }
  return centers
}

export function applyLeftRightInitialLayout(nodes, links) {
  if (!Array.isArray(nodes) || nodes.length === 0) return

  const idToNode = new Map(nodes.map((n) => [n.id, n]))
  const nodeIds = nodes.map((n) => n.id)

  const adj = new Map()
  for (const id of nodeIds) adj.set(id, [])

  for (const link of links || []) {
    const { s, t } = linkEndpoints(link)
    if (!idToNode.has(s) || !idToNode.has(t) || s === t) continue
    adj.get(s).push(t)
    adj.get(t).push(s)
  }

  const components = getComponents(nodeIds, adj)
  components.sort((a, b) => {
    const ma = a.reduce((m, id) => (id < m ? id : m), a[0])
    const mb = b.reduce((m, id) => (id < m ? id : m), b[0])
    return ma.localeCompare(mb)
  })

  const centers = componentCenters(components.length)

  for (let ci = 0; ci < components.length; ci++) {
    const comp = components[ci]
    const compSet = new Set(comp)
    const center = centers[ci]
    const hubId = pickHubId(comp, adj, idToNode)
    if (!hubId) continue

    const xById = assignXBilateral(hubId, compSet, adj)
    const byBucket = new Map()

    for (const id of comp) {
      const xv = xById.get(id) ?? 0
      const key = `${xv}`
      if (!byBucket.has(key)) byBucket.set(key, [])
      byBucket.get(key).push(id)
    }

    for (const ids of byBucket.values()) {
      ids.sort((a, b) => a.localeCompare(b))
      const yz = yzRingOffsets(ids.length, YZ_SPREAD_RADIUS)
      ids.forEach((id, i) => {
        const node = idToNode.get(id)
        const off = yz[i] || { y: 0, z: 0 }
        node.x = center.x + (xById.get(id) ?? 0)
        node.y = center.y + off.y
        node.z = center.z + off.z
      })
    }
  }
}
