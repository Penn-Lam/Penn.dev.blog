import { expect, test } from 'bun:test'

import { createRing, createSurfaceBuilder, roundedRectOutline, roundPolyline } from './cartridge-loft'

const CREASE_ANGLE = Math.PI / 6

const outlineOf = (halfWidth, halfHeight, radius) =>
  roundedRectOutline({
    left: -halfWidth,
    right: halfWidth,
    bottom: -halfHeight,
    top: halfHeight,
    topRadius: radius,
    bottomRadius: radius
  })

function outlineArea(outline) {
  return outline.reduce((sum, point, index) => {
    const next = outline[(index + 1) % outline.length]

    return sum + (point.x * next.y - next.x * point.y) / 2
  }, 0)
}

function readTriangles(geometry) {
  const position = geometry.getAttribute('position')
  const triangles = []

  for (let index = 0; index < position.count; index += 3) {
    triangles.push(
      [0, 1, 2].map((corner) => [
        position.getX(index + corner),
        position.getY(index + corner),
        position.getZ(index + corner)
      ])
    )
  }

  return triangles
}

// 法线全部朝外的封闭曲面，带符号体积为正，数值等于实体的体积
function signedVolume(triangles) {
  return triangles.reduce((sum, [a, b, c]) => {
    const cross = [b[1] * c[2] - b[2] * c[1], b[2] * c[0] - b[0] * c[2], b[0] * c[1] - b[1] * c[0]]

    return sum + (a[0] * cross[0] + a[1] * cross[1] + a[2] * cross[2]) / 6
  }, 0)
}

// 封闭曲面上每条有向边都有一条反向的边与它配对；配不上的边就是破洞或翻面
function unpairedEdges(triangles) {
  const key = (point) => point.map((value) => value.toFixed(3)).join(',')
  const edges = new Map()

  for (const triangle of triangles) {
    for (let corner = 0; corner < 3; corner++) {
      const edge = `${key(triangle[corner])}>${key(triangle[(corner + 1) % 3])}`

      edges.set(edge, (edges.get(edge) ?? 0) + 1)
    }
  }

  return [...edges].filter(([edge, count]) => {
    const [from, to] = edge.split('>')

    return edges.get(`${to}>${from}`) !== count
  }).length
}

test('roundedRectOutline runs counter-clockwise and keeps its point count across sizes', () => {
  const small = outlineOf(10, 6, 2)
  const large = outlineOf(40, 30, 5)

  expect(outlineArea(small)).toBeGreaterThan(0)
  expect(small.length).toBe(large.length)
})

test('roundPolyline replaces a marked corner with an arc that touches both edges', () => {
  const rounded = roundPolyline(
    [
      { x: 0, y: 0 },
      { x: 10, y: 0, radius: 2 },
      { x: 10, y: 10 }
    ],
    4
  )

  expect(rounded[0]).toEqual({ x: 0, y: 0 })
  expect(rounded.at(-1)).toEqual({ x: 10, y: 10 })
  expect(rounded[1].x).toBeCloseTo(8)
  expect(rounded[1].y).toBeCloseTo(0)
  expect(rounded.at(-2).x).toBeCloseTo(10)
  expect(rounded.at(-2).y).toBeCloseTo(2)

  // 圆弧上的点到圆心 (8, 2) 的距离都等于半径
  for (const point of rounded.slice(1, -1)) expect(Math.hypot(point.x - 8, point.y - 2)).toBeCloseTo(2)
})

test('rings lofted along increasing z give a closed surface that faces outwards', () => {
  const outline = outlineOf(20, 12, 3)
  const builder = createSurfaceBuilder()

  builder.cap(outline, { z: -5, facing: -1 })
  builder.loft([createRing(outline, { z: -5 }), createRing(outline, { z: 5 })])
  builder.cap(outline, { z: 5, facing: 1 })

  const triangles = readTriangles(builder.build(CREASE_ANGLE))

  expect(unpairedEdges(triangles)).toBe(0)
  expect(signedVolume(triangles)).toBeCloseTo(outlineArea(outline) * 10, 3)
})

test('rings lofted along decreasing z cut a pocket into the front cap', () => {
  const outline = outlineOf(20, 12, 3)
  const pocket = outlineOf(8, 5, 1)
  const builder = createSurfaceBuilder()

  builder.cap(outline, { z: -5, facing: -1 })
  builder.loft([createRing(outline, { z: -5 }), createRing(outline, { z: 5 })])
  builder.cap(outline, { z: 5, facing: 1, holes: [pocket] })
  builder.loft([createRing(pocket, { z: 5 }), createRing(pocket, { z: 2 })])
  builder.cap(pocket, { z: 2, facing: 1 })

  const triangles = readTriangles(builder.build(CREASE_ANGLE))

  expect(unpairedEdges(triangles)).toBe(0)
  expect(signedVolume(triangles)).toBeCloseTo(outlineArea(outline) * 10 - outlineArea(pocket) * 3, 3)
})

test('two rings at the same depth make a wall perpendicular to z', () => {
  const outer = outlineOf(20, 12, 3)
  const inner = outlineOf(16, 8, 3)
  const builder = createSurfaceBuilder()

  // 台阶：后半段宽，前半段窄，中间那一圈平面朝 +z
  builder.cap(outer, { z: 0, facing: -1 })
  builder.loft([
    createRing(outer, { z: 0 }),
    createRing(outer, { z: 4 }),
    createRing(inner, { z: 4 }),
    createRing(inner, { z: 8 })
  ])
  builder.cap(inner, { z: 8, facing: 1 })

  const triangles = readTriangles(builder.build(CREASE_ANGLE))

  expect(unpairedEdges(triangles)).toBe(0)
  expect(signedVolume(triangles)).toBeCloseTo(outlineArea(outer) * 4 + outlineArea(inner) * 4, 3)
})

test('vertex shade ends up in the colour attribute', () => {
  const outline = outlineOf(20, 12, 3)
  const builder = createSurfaceBuilder()

  builder.cap(outline, { z: 0, facing: 1, shade: 0.5 })

  const color = builder.build(CREASE_ANGLE).getAttribute('color')

  expect(color.getX(0)).toBeCloseTo(0.5)
  expect(color.getZ(color.count - 1)).toBeCloseTo(0.5)
})
