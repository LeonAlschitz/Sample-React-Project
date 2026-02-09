export const RADII_BY_TAG = {
  Core: 36,
  Gateway: 26,
  Switch: 25,
  Device: 16,
  default: 28
}

export function getNodeRadius(d) {
  if (!Array.isArray(d?.tags)) return RADII_BY_TAG.default
  if (d.tags.includes('Core')) return RADII_BY_TAG.Core
  if (d.tags.includes('Gateway')) return RADII_BY_TAG.Gateway
  if (d.tags.includes('Switch')) return RADII_BY_TAG.Switch
  if (d.tags.includes('Device')) return RADII_BY_TAG.Device
  return RADII_BY_TAG.default
}

export const ICON_SIZES = {
  Device: 20,
  Switch: 30,
  Gateway: 40
}

export const ICON_OFFSETS = {
  Device: { x: 0, y: 0 },
  Switch: { x: 1, y: 0 },
  Gateway: { x: 0, y: 0 }
}

export const STATUS_COLORS = {
  online: { dark: '#34d399', light: '#10b981' },
  offline: { dark: '#f87171', light: '#ef4444' }
}

export function getStatusColor(status, isDark) {
  const key = status === 'online' ? 'online' : 'offline'
  return STATUS_COLORS[key][isDark ? 'dark' : 'light']
}

export const ICON_FILTER_MATRIX = {
  green: '0 0 0 0.063 0  0 0 0 0.725 0  0 0 0 0.506 0  0 0 0 1 0',
  red: '0 0 0 0.937 0  0 0 0 0.267 0  0 0 0 0.267 0  0 0 0 1 0'
}

export function getIconFilterUrl(filterIdPrefix, status) {
  const suffix = status === 'online' ? 'green' : 'red'
  return `url(#${filterIdPrefix}-icon-${suffix})`
}

export const LABEL = {
  gap: 4,
  padding: 2,
  rectHeight: 12,
  rectHeightSidebar: 16,
  rectY: -6,
  rectYSidebar: -8,
  fontSize: '10px',
  fontSizeSelected: '12px',
  rectWidthPadding: 4
}

export const NODE_CLASS_CORE = 'core-node'

export function isCoreNode(d) {
  return Array.isArray(d?.tags) && d.tags.includes('Core')
}

export function hasTag(d, tag) {
  return Array.isArray(d?.tags) && d.tags.includes(tag)
}
