import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = process.cwd()
const srcRoot = join(__dirname, '..')

function loadEnv() {
  const envPath = join(root, '.env')
  try {
    const content = readFileSync(envPath, 'utf8')
    const env = {}
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx > 0) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
    }
    return env
  } catch {
    return {}
  }
}

function jsonToDbRow(d, floor) {
  return {
    id: d.id,
    floor,
    name: d.name ?? null,
    type: d.type ?? null,
    status: d.status ?? null,
    location: d.location ?? null,
    ip_address: d.ipAddress ?? null,
    subnet: d.subnet ?? null,
    subnet_label: d.subnetLabel ?? null,
    cpu_usage: d.cpuUsage != null ? Number(d.cpuUsage) : null,
    memory_usage: d.memoryUsage != null ? Number(d.memoryUsage) : null,
    uptime: d.uptime != null ? Number(d.uptime) : null,
    last_seen: d.lastSeen ?? null,
    tags: Array.isArray(d.tags) ? JSON.stringify(d.tags) : (d.tags ?? '[]'),
    connected_to: Array.isArray(d.connectedTo) ? JSON.stringify(d.connectedTo) : (d.connectedTo ?? '[]'),
  }
}

function normalizeForCompare(row) {
  const r = { ...row }
  if (Array.isArray(r.tags) || typeof r.tags === 'object') r.tags = JSON.stringify(r.tags)
  if (Array.isArray(r.connected_to) || typeof r.connected_to === 'object') r.connected_to = JSON.stringify(r.connected_to)
  return r
}

function compareRows(a, b) {
  const fields = ['id', 'floor', 'name', 'type', 'status', 'location', 'ip_address', 'subnet', 'subnet_label', 'cpu_usage', 'memory_usage', 'uptime', 'last_seen', 'tags', 'connected_to']
  const diffs = []
  for (const f of fields) {
    let va = a[f]
    let vb = b[f]
    if (f === 'last_seen' && va != null && vb != null) {
      va = va.replace('+00:00', 'Z')
      vb = vb.replace('+00:00', 'Z')
    }
    const same = va === vb || (va != null && vb != null && Number(va) === Number(vb))
    if (!same) diffs.push({ field: f, json: a[f], db: b[f] })
  }
  return diffs
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

const dataDir = join(root, 'src', 'data')
const f1 = JSON.parse(readFileSync(join(dataDir, 'Floor1.json'), 'utf8'))
const f2 = JSON.parse(readFileSync(join(dataDir, 'Floor2.json'), 'utf8'))
const f3 = JSON.parse(readFileSync(join(dataDir, 'Floor3.json'), 'utf8'))

const expected = [
  ...f1.data.map((d) => jsonToDbRow(d, 'floor1')),
  ...f2.data.map((d) => jsonToDbRow(d, 'floor2')),
  ...f3.data.map((d) => jsonToDbRow(d, 'floor3')),
]

const keyOf = (r) => `${r.floor}:${r.id}`
const expectedByKey = Object.fromEntries(expected.map((r) => [keyOf(r), r]))

const { data: dbRows, error } = await supabase.from('devices').select('*')
if (error) {
  console.error('Failed to fetch devices from local DB:', error.message)
  process.exit(1)
}

const dbByKey = Object.fromEntries((dbRows ?? []).map((r) => [keyOf(r), r]))

let missingInDb = []
let extraInDb = []
const valueDiffs = []

for (const k of Object.keys(expectedByKey)) {
  if (!dbByKey[k]) missingInDb.push(k)
  else {
    const exp = normalizeForCompare(expectedByKey[k])
    const db = normalizeForCompare(dbByKey[k])
    const diffs = compareRows(exp, db)
    if (diffs.length) valueDiffs.push({ key: k, diffs })
  }
}
for (const k of Object.keys(dbByKey)) {
  if (!expectedByKey[k]) extraInDb.push(k)
}

console.log('=== Compare: Local DB vs Floor1/2/3 JSON ===\n')
console.log('JSON total devices:', expected.length)
console.log('DB total devices:', dbRows?.length ?? 0)

if (missingInDb.length) {
  console.log('\n❌ In JSON but NOT in DB:', missingInDb.length)
  missingInDb.forEach((k) => console.log('  -', k))
}
if (extraInDb.length) {
  console.log('\n❌ In DB but NOT in JSON:', extraInDb.length)
  extraInDb.forEach((k) => console.log('  -', k))
}
if (valueDiffs.length) {
  console.log('\n❌ Same device but different values:', valueDiffs.length)
  valueDiffs.forEach(({ key, diffs }) => {
    console.log('  ', key)
    diffs.forEach(({ field, json, db }) => console.log('     ', field, '| JSON:', json, '| DB:', db))
  })
}

if (!missingInDb.length && !extraInDb.length && !valueDiffs.length) {
  console.log('\n✅ Local DB and the 3 JSON files contain the same data (same devices, same field values).')
} else {
  process.exit(1)
}
