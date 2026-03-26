import * as THREE from 'three'

const CSS_ONLINE = '--netmap-node-online'
const CSS_OFFLINE = '--netmap-node-offline'

function readCssColor(varName, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

const cache = {
  online: null,
  offline: null
}

export function getMaterialForNodeStatus(status) {
  const key = status === 'online' ? 'online' : 'offline'
  if (!cache[key]) {
    const varName = key === 'online' ? CSS_ONLINE : CSS_OFFLINE
    const fallback = key === 'online' ? '#15803d' : '#b91c1c'
    const color = readCssColor(varName, fallback)
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.42,
      metalness: 0.16,
      side: THREE.DoubleSide
    })
    if (key === 'offline') {
      mat.emissive = new THREE.Color(color)
      mat.emissiveIntensity = 0.45
    }
    cache[key] = mat
  }
  return cache[key]
}

export function refreshNetmap3DNodeMaterialsFromTheme() {
  if (cache.online) {
    cache.online.color.set(readCssColor(CSS_ONLINE, '#15803d'))
  }
  if (cache.offline) {
    const c = readCssColor(CSS_OFFLINE, '#b91c1c')
    cache.offline.color.set(c)
    cache.offline.emissive.set(c)
  }
}
