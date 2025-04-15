import axios from 'axios'

/** Kiểu trả về */
class RouteInfo {
  distances: number[] = []

  hasAnyOver(limit: number): boolean {
    return this.distances.some(d => d > limit)
  }

  get totalDistance(): number {
    return this.distances.reduce((a, b) => a + b, 0)
  }
}

/** Tính khoảng cách giữa 2 điểm [lng,lat] */
function calcDistPos(from: [number, number], to: [number, number]): number {
  const R = 6_371_000
  const φ1 = from[1] * Math.PI/180
  const φ2 = to[1]   * Math.PI/180
  const Δφ = (to[1] - from[1]) * Math.PI/180
  const Δλ = (to[0] - from[0]) * Math.PI/180

  const a =
    Math.sin(Δφ/2)**2 +
    Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2

  return R * 2 * Math.asin(Math.sqrt(a))
}

/**
 * Lọc các đoạn theo details, lưu từng đoạn vào mảng và kiểm tra điều kiện
 */
function getInfoFor(
  points?: { coordinates: [number, number][] },
  details?: [number, number, any][],
  fnc?: (val: any) => boolean
): RouteInfo {
  const info = new RouteInfo()
  if (
    !points ||
    !Array.isArray(points.coordinates) ||
    !details ||
    !fnc
  ) return info

  const coords = points.coordinates
  const maxIdx = coords.length - 1

  for (const [start, end, val] of details) {
    if (!fnc(val)) continue
    const safeEnd = Math.min(end, maxIdx)
    for (let i = start; i < safeEnd; i++) {
      const from = coords[i], to = coords[i + 1]
      if (!from || !to) continue
      const d = calcDistPos(from, to)
      info.distances.push(d === 0 ? 0.01 : d)
    }
  }

  return info
}

export async function fetchAndCalcFerryInfo(from: [number, number], to: [number, number]) {
  const url = [
    'https://graphhopper.com/api/1/route',
    `?point=${from[0]},${from[1]}`,
    `&point=${to[0]},${to[1]}`,
    '&vehicle=car',
    '&locale=en',
    '&key=b16b1d60-3c8c-4cd6-bae6-07493f23e589',
    '&details=road_environment',
    '&points_encoded=false'
  ].join('')

  const resp = await axios.get(url)
  const path = resp.data.paths?.[0]
  if (!path) {
    console.error('No path returned')
    return
  }

  const ferryInfo = getInfoFor(
    path.points,
    path.details?.road_environment,
    (s) => s === 'ferry'
  )

  const overLimit = ferryInfo.hasAnyOver(2000)
  // console.log(`Ferry segments:`, ferryInfo.distances.map(m => m.toFixed(1)))
  // console.log(`Total ferry distance: ${ferryInfo.totalDistance.toFixed(1)} m`)
  // console.log(`Any segment over 2km: ${overLimit ? 'YES' : 'NO'}`)

  return overLimit
}
