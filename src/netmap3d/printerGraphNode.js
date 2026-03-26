import * as THREE from 'three'
import { getMaterialForNodeStatus } from './netmap3DMaterials.js'

const BODY_W = 16
const BODY_H = 9
const BODY_R = 1.5
const BODY_DEPTH = 3.8
const BODY_WALL = 1.55

const TRAY_W = 10
const TRAY_H = 4
const TRAY_R = 1
const TRAY_DEPTH = 2.6
const TRAY_WALL = 1.15

const OUT_DEPTH = 1.15
const OUT_WALL = 1.05
const BUTTON_R = 0.95

let printerGeometries = null

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

function buildBodyGeometry() {
  const shape = new THREE.Shape()
  addRoundedRectCCW(shape, -BODY_W / 2, -BODY_H / 2, BODY_W, BODY_H, BODY_R)

  const iw = BODY_W - 2 * BODY_WALL
  const ih = BODY_H - 2 * BODY_WALL
  const ir = Math.max(0.35, BODY_R - BODY_WALL * 0.9)
  const hole = new THREE.Path()
  addRoundedRectCCW(hole, -iw / 2, -ih / 2, iw, ih, ir)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: BODY_DEPTH,
    bevelEnabled: false,
    curveSegments: 14
  })
  geo.translate(0, 0, -BODY_DEPTH / 2)
  return geo
}

function buildTopTrayGeometry() {
  const shape = new THREE.Shape()
  addRoundedRectCCW(shape, -TRAY_W / 2, -TRAY_H / 2, TRAY_W, TRAY_H, TRAY_R)

  const iw = TRAY_W - 2 * TRAY_WALL
  const ih = TRAY_H - 2 * TRAY_WALL
  const ir = Math.max(0.2, TRAY_R - TRAY_WALL * 0.9)
  const hole = new THREE.Path()
  addRoundedRectCCW(hole, -iw / 2, -ih / 2, iw, ih, ir)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: TRAY_DEPTH,
    bevelEnabled: false,
    curveSegments: 12
  })
  geo.translate(0, 0, -TRAY_DEPTH / 2)
  return geo
}

function buildOutTrayGeometry() {
  const yTop = -BODY_H / 2
  const yBot = yTop - 3

  const shape = new THREE.Shape()
  shape.moveTo(-5, yTop)
  shape.lineTo(-4, yBot)
  shape.lineTo(4, yBot)
  shape.lineTo(5, yTop)
  shape.lineTo(-5, yTop)

  const hole = new THREE.Path()
  const yti = yTop - OUT_WALL
  const ybi = yBot + OUT_WALL
  const tInset = OUT_WALL * 0.95
  const bInset = OUT_WALL * 0.78
  hole.moveTo(-5 + tInset, yti)
  hole.lineTo(5 - tInset, yti)
  hole.lineTo(4 - bInset, ybi)
  hole.lineTo(-4 + bInset, ybi)
  hole.lineTo(-5 + tInset, yti)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: OUT_DEPTH,
    bevelEnabled: false,
    curveSegments: 10
  })
  geo.translate(0, 0, -OUT_DEPTH / 2)
  return geo
}

function getGeometries() {
  if (!printerGeometries) {
    printerGeometries = {
      body: buildBodyGeometry(),
      topTray: buildTopTrayGeometry(),
      outTray: buildOutTrayGeometry(),
      button: new THREE.SphereGeometry(BUTTON_R, 14, 14)
    }
  }
  return printerGeometries
}

export function createPrinterGraphNode(node) {
  const material = getMaterialForNodeStatus(node?.status)
  const g = getGeometries()
  const group = new THREE.Group()

  const body = new THREE.Mesh(g.body, material)
  group.add(body)

  const topTray = new THREE.Mesh(g.topTray, material)
  topTray.position.set(0, (BODY_H + TRAY_H) / 2, 0)
  group.add(topTray)

  const outTray = new THREE.Mesh(g.outTray, material)
  group.add(outTray)

  const btnZ = 0
  const button = new THREE.Mesh(g.button, material)
  button.position.set(BODY_W / 2 - 3.5, 0, btnZ)
  group.add(button)

  return group
}
