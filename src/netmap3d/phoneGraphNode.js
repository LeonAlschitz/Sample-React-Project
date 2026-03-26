import * as THREE from 'three'
import { getMaterialForNodeStatus } from './netmap3DMaterials.js'

const PHONE_DEPTH = 2.4
const PHONE_HALF_DEPTH = PHONE_DEPTH / 2

const HOME_BTN_R = 1.25
const HOME_BTN_CY = -7

let bodyGeometry = null

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

function buildPhoneBodyGeometry() {
  const ow = 11
  const oh = 19
  const or = 1.5
  const iw = 9
  const ih = 13
  const innerTop = 8.5
  const innerLeft = -iw / 2

  const shape = new THREE.Shape()
  addRoundedRectCCW(shape, -ow / 2, -oh / 2, ow, oh, or)

  const screenHole = new THREE.Path()
  addRoundedRectCCW(screenHole, innerLeft, innerTop - ih, iw, ih, 0.35)

  const homeHole = new THREE.Path()
  homeHole.absarc(0, HOME_BTN_CY, HOME_BTN_R, 0, Math.PI * 2, true)

  shape.holes.push(screenHole, homeHole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: PHONE_DEPTH,
    bevelEnabled: false,
    curveSegments: 16
  })
  geo.translate(0, 0, -PHONE_HALF_DEPTH)
  return geo
}

function getSharedBodyGeometry() {
  if (!bodyGeometry) {
    bodyGeometry = buildPhoneBodyGeometry()
  }
  return bodyGeometry
}

export function createPhoneGraphNode(node) {
  const material = getMaterialForNodeStatus(node?.status)
  const group = new THREE.Group()
  const body = new THREE.Mesh(getSharedBodyGeometry(), material)
  group.add(body)
  return group
}
