import * as THREE from 'three'
import { getMaterialForNodeStatus } from './netmap3DMaterials.js'

const SWITCH_DEPTH = 3.2
const SWITCH_HALF_DEPTH = SWITCH_DEPTH / 2
const SWITCH_HIT_RADIUS = 15

let frameGeometry = null
let ledGeometry = null
let hitSphereGeometry = null
let hitSphereMaterial = null

function addRoundedRectCCW(target, x0, y0, w, h, r) {
  const x1 = x0 + w
  const y1 = y0 + h
  const rad = Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5)
  target.moveTo(x0 + rad, y0)
  target.lineTo(x1 - rad, y0)
  target.quadraticCurveTo(x1, y0, x1, y0 + rad)
  target.lineTo(x1, y1 - rad)
  target.quadraticCurveTo(x1, y1, x1 - rad, y1)
  target.lineTo(x0 + rad, y1)
  target.quadraticCurveTo(x0, y1, x0, y1 - rad)
  target.lineTo(x0, y0 + rad)
  target.quadraticCurveTo(x0, y0, x0 + rad, y0)
}

function buildSwitchFrameGeometry() {
  const ow = 26
  const oh = 12
  const or = 1.8
  const iw = 19.5
  const ih = 6.8

  const shape = new THREE.Shape()
  addRoundedRectCCW(shape, -ow / 2, -oh / 2, ow, oh, or)

  const hole = new THREE.Path()
  const xi = -iw / 2
  const yi = -ih / 2
  hole.moveTo(xi, yi)
  hole.lineTo(xi + iw, yi)
  hole.lineTo(xi + iw, yi + ih)
  hole.lineTo(xi, yi + ih)
  hole.lineTo(xi, yi)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: SWITCH_DEPTH,
    bevelEnabled: false,
    curveSegments: 14
  })
  geo.translate(0, 0, -SWITCH_HALF_DEPTH)
  return geo
}

function getSharedSwitchGeometry() {
  if (!frameGeometry) {
    frameGeometry = buildSwitchFrameGeometry()
  }
  return { geometry: frameGeometry }
}

export function createSwitchGraphNode(node) {
  const { geometry } = getSharedSwitchGeometry()
  const material = getMaterialForNodeStatus(node?.status)
  const root = new THREE.Group()
  const visual = new THREE.Group()
  root.add(visual)
  root.userData.netmap3DVisual = visual

  const frame = new THREE.Mesh(geometry, material)
  visual.add(frame)

  if (!ledGeometry) {
    ledGeometry = new THREE.SphereGeometry(1.25, 18, 18)
  }

  const ledZ = SWITCH_HALF_DEPTH - 0.5
  for (const x of [-7.5, 0, 7.5]) {
    const dot = new THREE.Mesh(ledGeometry, material)
    dot.position.set(x, 0, ledZ)
    visual.add(dot)
  }

  if (!hitSphereGeometry) {
    hitSphereGeometry = new THREE.SphereGeometry(SWITCH_HIT_RADIUS, 12, 12)
  }
  if (!hitSphereMaterial) {
    hitSphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    })
  }
  const hitSphere = new THREE.Mesh(hitSphereGeometry, hitSphereMaterial)
  visual.add(hitSphere)

  return root
}
