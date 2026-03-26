import * as THREE from 'three'
import { getMaterialForNodeStatus } from './netmap3DMaterials.js'

const WORKSTATION_SCALE = 0.7

const STAND_WIDTH_X = 13
const STAND_DEPTH_Z = 6
const STAND_HEIGHT_Y = 3.2
const STAND_HALF_W = STAND_WIDTH_X / 2
const STAND_HALF_D = STAND_DEPTH_Z / 2
const STAND_SIDE_BULGE_X = 3
const STAND_SIDE_CP_Z = 1.2

let workstationFrameGeometry = null
let workstationStandGeometry = null

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

function buildWorkstationFrameGeometry() {
  const ow = 24
  const oh = 17
  const or = 1.8
  const iw = 17
  const ih = 11
  const depth = 3.4

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
    depth,
    bevelEnabled: false,
    curveSegments: 16
  })
  geo.translate(0, 0, -depth / 2)
  return geo
}

function buildWorkstationStandGeometry() {
  const xh = STAND_HALF_W
  const zh = STAND_HALF_D
  const bx = STAND_SIDE_BULGE_X
  const cz = STAND_SIDE_CP_Z
  const shape = new THREE.Shape()
  shape.moveTo(xh, zh)
  shape.lineTo(-xh, zh)
  shape.bezierCurveTo(-xh - bx, cz, -xh - bx, -cz, -xh, -zh)
  shape.lineTo(xh, -zh)
  shape.bezierCurveTo(xh + bx, -cz, xh + bx, cz, xh, zh)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: STAND_HEIGHT_Y,
    bevelEnabled: false,
    curveSegments: 24
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, -STAND_HEIGHT_Y / 2, 0)
  return geo
}

function getSharedWorkstationGeometries() {
  if (!workstationFrameGeometry) {
    workstationFrameGeometry = buildWorkstationFrameGeometry()
    workstationStandGeometry = buildWorkstationStandGeometry()
  }
  return {
    frameGeometry: workstationFrameGeometry,
    standGeometry: workstationStandGeometry,
    frameHalfHeight: 17 / 2,
    standHeight: 3.2
  }
}

export function createWorkstationGraphNode(node) {
  const { frameGeometry, standGeometry, frameHalfHeight, standHeight } = getSharedWorkstationGeometries()
  const material = getMaterialForNodeStatus(node?.status)

  const group = new THREE.Group()
  const frame = new THREE.Mesh(frameGeometry, material)
  const stand = new THREE.Mesh(standGeometry, material)
  stand.position.y = -(frameHalfHeight + standHeight / 2)

  group.add(frame)
  group.add(stand)
  group.scale.setScalar(WORKSTATION_SCALE)
  return group
}
