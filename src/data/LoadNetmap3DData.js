const netmap3DJsonModules = import.meta.glob('./*.json', { eager: true })

const FLOOR_FILES = ['Floor1.json', 'Floor2.json', 'Floor3.json']

function getFloorJsonModule(fileName) {
  const key = `./${fileName}`
  const mod = netmap3DJsonModules[key]
  if (!mod) {
    throw new Error(`loadNetmap3DDataForScope: missing "${fileName}"`)
  }
  return mod.default ?? mod
}

function mergeAllFloorRows() {
  const seenIds = new Set()
  const data = []
  for (const file of FLOOR_FILES) {
    const raw = getFloorJsonModule(file)
    if (!raw.data || !Array.isArray(raw.data)) continue
    for (const row of raw.data) {
      if (!row || typeof row.id !== 'string') continue
      if (seenIds.has(row.id)) continue
      seenIds.add(row.id)
      data.push(row)
    }
  }
  return data
}

function filterCoreTaggedDevices(rows) {
  return rows.filter(
    (device) => !(Array.isArray(device.tags) && device.tags.includes('Core'))
  )
}

function isNodesAndLinksShape(obj) {
  return obj && Array.isArray(obj.nodes) && Array.isArray(obj.links)
}

function isFloorDatasetShape(obj) {
  return obj && Array.isArray(obj.data)
}

function floorDatasetToNetmap3D(raw) {
  const rows = raw.data
  const nodeById = new Map()

  for (const row of rows) {
    if (!row || typeof row.id !== 'string') continue
    const { connectedTo: _c, ...rest } = row
    nodeById.set(row.id, { id: row.id, ...rest })
  }

  const linkKeys = new Set()
  const links = []

  for (const row of rows) {
    if (!row || typeof row.id !== 'string') continue
    const targets = Array.isArray(row.connectedTo) ? row.connectedTo : []
    for (const targetId of targets) {
      if (typeof targetId !== 'string' || targetId === row.id) continue
      if (!nodeById.has(targetId)) continue
      const a = row.id <= targetId ? row.id : targetId
      const b = row.id <= targetId ? targetId : row.id
      const key = `${a}\0${b}`
      if (linkKeys.has(key)) continue
      linkKeys.add(key)
      links.push({ source: a, target: b })
    }
  }

  return { nodes: [...nodeById.values()], links }
}

function normalizeLoadedJson(raw, normalizedFileName) {
  if (isNodesAndLinksShape(raw)) {
    return { nodes: raw.nodes, links: raw.links }
  }
  if (isFloorDatasetShape(raw)) {
    return floorDatasetToNetmap3D(raw)
  }
  throw new Error(
    `loadNetmap3DDataFromFile: Unrecognized shape in "${normalizedFileName}". ` +
      `Use { nodes, links } or { data: [{ id, connectedTo?, ... }] }.`
  )
}

export function loadNetmap3DDataFromFile(dataFile) {
  if (!dataFile) {
    throw new Error('loadNetmap3DDataFromFile: dataFile is required')
  }

  const normalized = String(dataFile)
    .split('/')
    .pop()
    .replace(/^\.\/+/, '')

  const key = `./${normalized}`
  const mod = netmap3DJsonModules[key]
  if (!mod) {
    const available = Object.keys(netmap3DJsonModules)
      .map((k) => k.replace('./', ''))
      .sort()
    throw new Error(
      `loadNetmap3DDataFromFile: Unknown data file "${dataFile}". Available: ${available.join(
        ', '
      )}`
    )
  }

  const raw = mod.default ?? mod
  return normalizeLoadedJson(raw, normalized)
}

export function loadNetmap3DDataForScope(scope) {
  let rows
  if (scope === 'all') {
    rows = mergeAllFloorRows()
  } else if (scope === 'floor2') {
    rows = getFloorJsonModule('Floor2.json').data ?? []
  } else if (scope === 'floor3') {
    rows = getFloorJsonModule('Floor3.json').data ?? []
  } else {
    rows = getFloorJsonModule('Floor1.json').data ?? []
  }

  const includeCore = scope === 'all'
  const filtered = includeCore ? rows : filterCoreTaggedDevices(rows)
  return floorDatasetToNetmap3D({ data: filtered })
}
