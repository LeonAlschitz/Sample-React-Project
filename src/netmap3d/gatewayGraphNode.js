import * as THREE from 'three'
import { getMaterialForNodeStatus } from './netmap3DMaterials.js'

const RING_DEPTH = 1.48

const R_OUTER = 8
const R_INNER = 6
const HUB_OUT = 3.0
const HUB_IN = 1.4

const R_SPOKE_OUT = 7
const R_SPOKE_IN = 4
const SPOKE_LEN = R_SPOKE_OUT - R_SPOKE_IN
const SPOKE_THICK = 1.4

let gatewayGeometries = null

function ringExtrudeGeometry(outerR, innerR, segments) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: RING_DEPTH,
    bevelEnabled: false,
    curveSegments: segments
  })
  geo.translate(0, 0, -RING_DEPTH / 2)
  return geo
}

function getGeometries() {
  if (!gatewayGeometries) {
    const spokeD = RING_DEPTH * 0.96
    gatewayGeometries = {
      outerRing: ringExtrudeGeometry(R_OUTER, R_INNER, 56),
      hubRing: ringExtrudeGeometry(HUB_OUT, HUB_IN, 40),
      spokeAlongY: new THREE.BoxGeometry(SPOKE_THICK, SPOKE_LEN, spokeD),
      spokeAlongX: new THREE.BoxGeometry(SPOKE_LEN, SPOKE_THICK, spokeD)
    }
  }
  return gatewayGeometries
}

export function createGatewayGraphNode(node) {
  const material = getMaterialForNodeStatus(node?.status)
  const g = getGeometries()
  const group = new THREE.Group()

  const outer = new THREE.Mesh(g.outerRing, material)
  group.add(outer)

  const hub = new THREE.Mesh(g.hubRing, material)
  hub.position.z = RING_DEPTH * 0.07
  group.add(hub)

  const spokeZ = RING_DEPTH * 0.04
  const cy = (R_SPOKE_OUT + R_SPOKE_IN) / 2

  const spokeN = new THREE.Mesh(g.spokeAlongY, material)
  spokeN.position.set(0, cy, spokeZ)
  group.add(spokeN)

  const spokeS = new THREE.Mesh(g.spokeAlongY, material)
  spokeS.position.set(0, -cy, spokeZ)
  group.add(spokeS)

  const spokeE = new THREE.Mesh(g.spokeAlongX, material)
  spokeE.position.set(cy, 0, spokeZ)
  group.add(spokeE)

  const spokeW = new THREE.Mesh(g.spokeAlongX, material)
  spokeW.position.set(-cy, 0, spokeZ)
  group.add(spokeW)

  return group
}
