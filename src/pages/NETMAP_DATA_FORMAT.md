# Netmap data format and sources

## Where each netmap gets its data

| Place | Data source | Format |
|-------|-------------|--------|
| **Main page** (embedded) | `Floor1.json`, `Floor2.json`, `Floor3.json` via Netmap internal imports. No `devices` prop → uses `effectiveSelectedNetmap` ('floor1' | 'floor2' | 'floor3' | 'all') to pick `floor*Devices.data`. | Array of device objects (see below). |
| **Netmap full page** | Same as Main: internal `floor1Devices.data`, `floor2Devices.data`, `floor3Devices.data`. TopBar passes `selectedNetmap` / `setSelectedNetmap` to switch floor. | Array of device objects. |
| **Testing page** (widget) | `devices={[]}` prop → Netmap uses that array (empty), so no nodes/links. | Same device shape; empty array = no data. |
| **Netmap sidebar** (mini map when a node is selected) | Same floor JSON as the main graph. Builds a small graph: selected node + nodes in `selectedNode.connectedTo` that exist in the same floor data. | Same device objects; nodes are built from that data. |
| **DataTable sidebar** (row details + mini netmap) | `datasets[selectedDataset].data` (e.g. `floor1Devices` from DataTable’s import of Floor1/2/3 JSON). Selected row = one device; connected nodes from `selectedRow.connectedTo`. | Same device shape; comes from `currentDataset.data`. |

## Device object format (what Netmap expects)

Netmap expects an **array of device objects**. Each device must have at least:

| Field | Type | Required | Used for |
|-------|------|----------|----------|
| `id` | string | yes | Node id, linking, lookup. |
| `name` | string | no | Label and tooltip. |
| `ipAddress` | string | no | Tooltip (shown as `ip` on node). |
| `type` | string | no | e.g. Router, Switch, Workstation. |
| `status` | string | yes | `'online'` \| `'offline'` → node/icon color and filter. |
| `location` | string | no | Display. |
| `subnet` | string | no | Display. |
| `tags` | string[] | no | Icon type: `Gateway`, `Switch`, `Device`, `Printer`, `Phone`, `Core` (Core can be filtered out). |
| `connectedTo` | string[] | no | Array of device `id`s for links. |

Optional (from JSON, spread onto node but not required by Netmap): `subnetLabel`, `cpuUsage`, `memoryUsage`, `uptime`, `lastSeen`.

**Example (from Floor1.json):**

```json
{
  "id": "GW-F1",
  "name": "F1 Gateway",
  "type": "Router",
  "status": "online",
  "location": "Office Building - Floor 1 - Network Closet",
  "ipAddress": "192.168.10.1",
  "subnet": "192.168.10.0/24",
  "subnetLabel": "Floor 1",
  "tags": ["Gateway"],
  "connectedTo": ["F1-SW-CORE-01", "CORE-BLDG-01"]
}
```

## How Netmap uses the data

- **Main graph:** `baseDeviceSource` is either the `devices` prop (if provided) or the chosen floor(s) from the imported JSON. Devices are mapped to **nodes** with `id`, `name`, `ip` (from `ipAddress`), `type`, `status`, `location`, `subnet`, `connectedTo`, plus the rest spread from the device. **Links** are built from `connectedTo` when the target id exists in the node set.
- **Sidebar (Netmap page):** When a node is selected, the sidebar mini-netmap is built from the same floor data: selected node + devices whose `id` is in `selectedNode.connectedTo`. So sidebar data is the same device format, subset by selection.
- **NetmapSidebar component:** Receives `data={selectedNode}` — the **node object** (device + simulation fields like `x`, `y`). It renders `Object.entries(data)` as key/value rows, excluding `fx`, `fy`, `vx`, `vy`, `x`, `y`, `index`, `static-right-column`, `tags`.

## Passing custom data into Netmap

Use the **`devices`** prop: an array of device objects in the format above. Example:

```jsx
<Netmap embedded devices={myDeviceArray} />
```

- Omit `devices` → Netmap uses internal Floor1/2/3 JSON.
- `devices={[]}` → Empty graph (e.g. Testing page).
- `devices={[...]}` → Your data; each item must have `id`, `status`, and optionally `name`, `ipAddress`, `type`, `tags`, `connectedTo`, etc.
