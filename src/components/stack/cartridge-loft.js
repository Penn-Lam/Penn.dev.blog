// oxlint-disable-next-line anti-slop/no-shape-in-symbol-names -- ShapeUtils 是 three 自己的导出名，这里按用途改叫 PolygonTriangulator
import { BufferGeometry, Float32BufferAttribute, ShapeUtils as PolygonTriangulator, Vector2 } from 'three'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * [INPUT]: 依赖 three 的 BufferGeometry、Float32BufferAttribute、ShapeUtils（多边形三角剖分，本文件里叫 PolygonTriangulator）、Vector2；依赖 three/examples 的 toCreasedNormals
 * [OUTPUT]: 对外提供 roundedRectOutline（圆角矩形轮廓）、roundPolyline（给折线的拐角倒圆）、createRing（把轮廓放到某个深度上）、createSurfaceBuilder（放样、封盖、合成几何体）
 * [POS]: components/stack 的放样工具，只懂几何，不认识卡带。cartridge-model.js 用它把一串截面轮廓连成外壳。
 *        约定：轮廓在 xy 平面内逆时针排列，沿 z 轴放样。相邻两圈的点数必须相等，点与点一一对应。
 *        圈按 z 递增排列时曲面法线朝外，按 z 递减排列时法线朝内（用来挖孔）。两圈可以在同一个 z 上：轮廓收缩处得到一面垂直于 z 轴的壁。
 *        顶点带一个 shade 值，写进顶点色，材质开 vertexColors 后乘到底色上，用来压暗凹坑深处。
 *        法线不由调用方给：build 时按夹角阈值自动判断哪些棱保持硬边、哪些面平滑过渡。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 面积小于这个值的三角形不写入几何体（轮廓上重合的点会产生这种三角形）
const MIN_TRIANGLE_AREA = 1e-6

// 两点距离小于这个值视为同一点
const SAME_POINT = 1e-6

// ==========================================================================
// 轮廓
// ==========================================================================

function pushArc(points, center, radius, from, segments) {
  for (let step = 0; step <= segments; step++) {
    const angle = from + (step / segments) * (Math.PI / 2)

    points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius })
  }
}

/**
 * 圆角矩形轮廓，逆时针，从右下角开始。上面两个角和下面两个角的半径分开给。
 * 点数只由 segments 和 topEdge 的长度决定，与尺寸无关：同一组参数下不同大小的轮廓可以直接放样。
 * @param {{ left: number, right: number, bottom: number, top: number, topRadius: number, bottomRadius: number, segments?: number, topEdge?: Array<{ x: number, y: number }> }} box
 *        topEdge 是顶边上额外插入的点，按从右到左的顺序给
 * @returns {Array<{ x: number, y: number }>}
 */
export function roundedRectOutline(box) {
  const { left, right, bottom, top, topRadius, bottomRadius, segments = 6, topEdge = [] } = box
  const points = []

  pushArc(points, { x: right - bottomRadius, y: bottom + bottomRadius }, bottomRadius, -Math.PI / 2, segments)
  pushArc(points, { x: right - topRadius, y: top - topRadius }, topRadius, 0, segments)
  points.push(...topEdge)
  pushArc(points, { x: left + topRadius, y: top - topRadius }, topRadius, Math.PI / 2, segments)
  pushArc(points, { x: left + bottomRadius, y: bottom + bottomRadius }, bottomRadius, Math.PI, segments)

  return points
}

/**
 * 给一条不闭合折线的拐角倒圆。带 radius 的拐点换成一段圆弧，其余的点原样保留（连同它们的附加字段）。
 * @param {Array<{ x: number, y: number, radius?: number }>} points
 * @param {number} segments 每段圆弧分成几段
 * @returns {Array<{ x: number, y: number }>}
 */
export function roundPolyline(points, segments = 4) {
  const rounded = points.flatMap((point, index) => {
    const previous = points[index - 1]
    const next = points[index + 1]

    if (!point.radius || !previous || !next) return [point]

    const toPrevious = unit(previous.x - point.x, previous.y - point.y)
    const toNext = unit(next.x - point.x, next.y - point.y)
    // 两条边的夹角。切点离拐点 radius / tan(夹角 / 2)，圆心在角平分线上
    const corner = Math.acos(Math.max(-1, Math.min(1, toPrevious.x * toNext.x + toPrevious.y * toNext.y)))
    const reach = point.radius / Math.tan(corner / 2)
    const bisector = unit(toPrevious.x + toNext.x, toPrevious.y + toNext.y)
    const distance = point.radius / Math.sin(corner / 2)
    const center = { x: point.x + bisector.x * distance, y: point.y + bisector.y * distance }
    const start = Math.atan2(point.y + toPrevious.y * reach - center.y, point.x + toPrevious.x * reach - center.x)
    const end = Math.atan2(point.y + toNext.y * reach - center.y, point.x + toNext.x * reach - center.x)
    // 走较短的那一侧
    const sweep = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI

    return Array.from({ length: segments + 1 }, (_, step) => {
      const angle = start + (step / segments) * sweep

      return { x: center.x + Math.cos(angle) * point.radius, y: center.y + Math.sin(angle) * point.radius }
    })
  })

  // 圆弧的端点正好落在相邻的点上时，只留一个
  return rounded.filter((point, index) => {
    const previous = rounded[index - 1]

    return !previous || Math.hypot(point.x - previous.x, point.y - previous.y) > SAME_POINT
  })
}

function unit(x, y) {
  const length = Math.hypot(x, y) || 1

  return { x: x / length, y: y / length }
}

/**
 * 把一条轮廓放到深度 z 上，得到放样用的一圈顶点。
 * @param {Array<{ x: number, y: number }>} outline
 * @param {{ z: number, v?: number, shade?: number, shadeAt?: (point: { x: number, y: number }) => number }} placement
 *        shade 是整圈统一的明暗；给了 shadeAt 时逐点取值，shade 不再生效。
 *        v 是贴图坐标的第二个分量，取沿放样方向累计的长度；不给时用 z。贴图坐标的第一个分量是沿轮廓累计的长度。
 * @returns {Array<{ x: number, y: number, z: number, u: number, v: number, shade: number }>}
 */
export function createRing(outline, placement) {
  const { z, v = z, shade = 1, shadeAt = () => shade } = placement
  let length = 0

  return outline.map((point, index) => {
    const previous = outline[index - 1]

    if (previous) length += Math.hypot(point.x - previous.x, point.y - previous.y)

    return { x: point.x, y: point.y, z, u: length, v, shade: shadeAt(point) }
  })
}

// ==========================================================================
// 曲面
// ==========================================================================

function removeRepeatedPoints(points) {
  const kept = points.filter((point, index) => {
    const previous = points[index - 1]

    return !previous || Math.hypot(point.x - previous.x, point.y - previous.y) > SAME_POINT
  })

  const first = kept[0]
  const last = kept.at(-1)

  if (kept.length > 1 && Math.hypot(first.x - last.x, first.y - last.y) <= SAME_POINT) kept.pop()

  return kept
}

/**
 * 累积三角形，最后合成一个几何体。
 * @returns {{
 *   loft: (rings: Array<ReturnType<typeof createRing>>) => void,
 *   cap: (contour: Array<{ x: number, y: number }>, options: { z: number, facing: 1 | -1, holes?: Array<Array<{ x: number, y: number }>>, shade?: number, uv?: (point: { x: number, y: number }) => [number, number] }) => void,
 *   build: (creaseAngle: number) => BufferGeometry
 * }}
 */
export function createSurfaceBuilder() {
  const positions = []
  const uvs = []
  const colors = []

  const pushTriangle = (a, b, c) => {
    const ux = b.x - a.x
    const uy = b.y - a.y
    const uz = b.z - a.z
    const vx = c.x - a.x
    const vy = c.y - a.y
    const vz = c.z - a.z
    const area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2

    if (area < MIN_TRIANGLE_AREA) return

    for (const vertex of [a, b, c]) {
      positions.push(vertex.x, vertex.y, vertex.z)
      uvs.push(vertex.u, vertex.v)
      colors.push(vertex.shade, vertex.shade, vertex.shade)
    }
  }

  return {
    // 把相邻的圈两两连成壁面
    loft(rings) {
      for (let index = 1; index < rings.length; index++) {
        const lower = rings[index - 1]
        const upper = rings[index]

        for (let i = 0; i < lower.length; i++) {
          const j = (i + 1) % lower.length

          pushTriangle(lower[i], lower[j], upper[j])
          pushTriangle(lower[i], upper[j], upper[i])
        }
      }
    },

    // 用一个平面封住轮廓，可以带孔。facing 为 1 时法线朝 +z，为 -1 时朝 -z
    cap(contour, options) {
      const { z, facing, holes = [], shade = 1, uv = (point) => [point.x, point.y] } = options

      const loops = [contour, ...holes].map((loop) =>
        removeRepeatedPoints(loop).map((point) => new Vector2(point.x, point.y))
      )

      // triangulateShape 会改动传入的数组，顶点表要先于它取好
      const vertices = loops.flat().map((point) => {
        const [u, v] = uv(point)

        return { x: point.x, y: point.y, z, u, v, shade }
      })

      const faces = PolygonTriangulator.triangulateShape(
        loops[0].slice(),
        loops.slice(1).map((loop) => loop.slice())
      )

      for (const [ia, ib, ic] of faces) {
        const a = vertices[ia]
        const b = vertices[ib]
        const c = vertices[ic]
        const winding = Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x))

        if (winding === facing) pushTriangle(a, b, c)
        else pushTriangle(a, c, b)
      }
    },

    // 相邻两面的夹角小于 creaseAngle 时法线平滑过渡，大于时保留硬边
    build(creaseAngle) {
      const geometry = new BufferGeometry()

      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
      geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

      return toCreasedNormals(geometry, creaseAngle)
    }
  }
}
