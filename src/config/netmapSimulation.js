import * as d3 from 'd3'

export const NETMAP_SIMULATION_MAIN = {
  linkDistance: 120,
  linkStrength: 0.3,
  charge: -300,
  centerStrength: 0.1,
  collisionRadius: 40,
  collisionStrength: 0.9,
  forceXStrength: 0.02,
  forceYStrength: 0.02,
  alpha: 1,
  alphaDecay: 0.008,
  alphaMin: 0.001
}

export const NETMAP_SIMULATION_SIDEBAR = {
  linkDistance: 80,
  linkStrength: 0.8,
  charge: -200,
  centerStrength: 1,
  collisionRadius: 25,
  collisionStrength: 0.8,
  forceXStrength: null,
  forceYStrength: null,
  alpha: 1,
  alphaDecay: 0.09,
  alphaMin: 0.001
}

export function createNetmapSimulation(nodes, links, width, height, preset) {
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(preset.linkDistance).strength(preset.linkStrength))
    .force('charge', d3.forceManyBody().strength(preset.charge))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(preset.centerStrength))
    .force('collision', d3.forceCollide().radius(preset.collisionRadius).strength(preset.collisionStrength))

  if (preset.forceXStrength != null && preset.forceYStrength != null) {
    sim.force('x', d3.forceX(width / 2).strength(preset.forceXStrength))
    sim.force('y', d3.forceY(height / 2).strength(preset.forceYStrength))
  }

  sim.alpha(preset.alpha).alphaDecay(preset.alphaDecay).alphaMin(preset.alphaMin)
  return sim
}
