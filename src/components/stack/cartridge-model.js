import {
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace
} from 'three'

import { createRing, createSurfaceBuilder, roundedRectOutline, roundPolyline } from './cartridge-loft'
import { CARTRIDGE } from './cartridge-pose'

/**
 * [INPUT]: 依赖 three 的材质、贴图与网格类；依赖 ./cartridge-loft 的轮廓与放样工具；依赖 ./cartridge-pose 的 CARTRIDGE 尺寸
 * [OUTPUT]: 对外提供 createCartridgeParts（一个场景里所有卡带共用的几何体与颗粒贴图）、createCartridge（单盘卡带的网格组）、drawNameTexture（把工具名画成贴图）
 * [POS]: components/stack 的卡带模型，自己用放样搭出来，不加载外部模型文件。
 *        外形是红白机卡带那一类：上面一块宽的壳身，下面一条窄一圈、正面略微退后的插脚。
 *        壳身正面的上、左、右三条边是一圈宽斜边，顶面靠两端各有一个方形凹坑，两侧靠上有一排防滑纹，前后壳之间有一道合模线。
 *        贴纸槽是正面上真实的孔，贴纸就是槽底；槽沿、凹坑的明暗来自光照和顶点色，不靠画。
 *        一盘卡带三个网格：外壳（壳身、插脚、防滑纹合成一个几何体）、贴纸、顶面上的工具名。
 *        本文件只管形状和材质。姿态、光照和交互在 cartridge-scene.js。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 尺寸（CSS 像素，原点在卡带中心，+y 朝卡带顶部，+z 朝贴纸一面）
// ==========================================================================

const { width: W, height: H, depth: D } = CARTRIDGE

const RIGHT = W / 2

const TOP = H / 2

const FRONT = D / 2

const BACK = -D / 2

// 插脚：比壳身每边窄 inset，正面比壳身退后 recess，向上伸进壳身 overlap（两个体相交，不留共面）
const TONGUE = { height: 16, inset: 18, recess: 3, overlap: 8, radius: 3, edge: 1.5 }

const BODY_BOTTOM = -TOP + TONGUE.height

// 壳身四角的半径。轮廓向内收时半径跟着减小，但不小于 min
const BODY_RADIUS = { top: 7, bottom: 3, minTop: 2, minBottom: 0.5 }

// 背面棱边的圆角
const BACK_FILLET = 2.5

// 正面斜边：上、左、右三边向内收 width、沿厚度占 depth；底边只收 width 的 bottomRatio 倍
const BEZEL = { width: 9, depth: 6, bottomRatio: 0.3, outerRadius: 2, innerRadius: 3 }

// 合模线：一圈 V 形浅槽
const SEAM = { z: 2.5, halfWidth: 0.7, depth: 0.7, shade: 0.55 }

// 顶面的两个方形凹坑，x 是凹坑中心离卡带中线的距离
const NOTCH = { x: 96, width: 10, back: -5, front: 1, depth: 7, shade: 0.1 }

// 两侧的防滑纹：一排凸出 proud 的细条
const RIBS = { count: 15, pitch: 3.4, top: 70, height: 1.6, back: -7.5, front: 1, proud: 1, sink: 1 }

// 圆弧之后留一小段平面，让后面的大平面不被圆弧的法线带歪
const LAND = 0.5

// 贴纸：和贴纸图一样是 3:2
const LABEL = { width: 192, height: 128, x: 0, y: 5, radius: 4 }

const LABEL_IMAGE_ASPECT = 3 / 2

// 贴纸槽的深度、槽沿的圆角、槽壁底部的压暗
const WELL = { depth: 2.6, lip: 0.8, shade: 0.65 }

// 工具名印在顶面，两个凹坑之间
const NAME = { width: 160, height: 13, z: -2 }

// 工具名贴图相对 CSS 像素的放大倍数
const NAME_TEXTURE_SCALE = 4

// 颗粒贴图铺满多少像素见一次重复
const GRAIN_TILE = 96

const GRAIN_TEXELS = 256

// 相邻两面夹角小于这个值时平滑过渡，大于时保留硬边
const CREASE_ANGLE = Math.PI / 6

// ==========================================================================
// 壳身
// ==========================================================================

// 壳身在某个深度上的截面。inset 是轮廓向内收的量，notchDepth 是顶边两个凹坑的深度
function bodyOutline(inset, notchDepth) {
  const top = TOP - inset.side

  // 顶边从右走到左：先经过右边的凹坑，再经过左边的
  const topEdge = [1, -1].flatMap((side) => {
    const from = side * NOTCH.x + NOTCH.width / 2
    const to = side * NOTCH.x - NOTCH.width / 2

    return [
      { x: from, y: top },
      { x: from, y: top - notchDepth },
      { x: to, y: top - notchDepth },
      { x: to, y: top }
    ]
  })

  return roundedRectOutline({
    left: -RIGHT + inset.side,
    right: RIGHT - inset.side,
    bottom: BODY_BOTTOM + inset.bottom,
    top,
    topRadius: Math.max(BODY_RADIUS.top - inset.side, BODY_RADIUS.minTop),
    bottomRadius: Math.max(BODY_RADIUS.bottom - Math.max(inset.side, inset.bottom), BODY_RADIUS.minBottom),
    topEdge
  })
}

function isNotchFloor(point, inset, notchDepth) {
  const isInNotch = Math.abs(Math.abs(point.x) - NOTCH.x) <= NOTCH.width / 2 + 0.01

  return notchDepth > 0 && isInNotch && Math.abs(point.y - (TOP - inset.side - notchDepth)) < 0.01
}

// 壳身沿厚度方向的剖面，从背面到正面。折线的 x 是深度 z，y 是轮廓向内收的量
function bodyStations() {
  // 斜边在剖面上转过的角度，用来算圆角占掉的长度
  const bezelAngle = Math.atan2(BEZEL.width, BEZEL.depth)
  const outerReach = BEZEL.outerRadius * Math.tan(bezelAngle / 2)
  const innerReach = BEZEL.innerRadius * Math.tan((Math.PI / 2 - bezelAngle) / 2)

  const rear = roundPolyline([
    { x: BACK, y: BACK_FILLET },
    { x: BACK, y: 0, radius: BACK_FILLET },
    { x: BACK + BACK_FILLET + LAND, y: 0 },
    { x: NOTCH.back, y: 0 }
  ])

  const fore = roundPolyline([
    { x: NOTCH.front, y: 0 },
    { x: SEAM.z - SEAM.halfWidth, y: 0 },
    { x: SEAM.z, y: SEAM.depth, shade: SEAM.shade },
    { x: SEAM.z + SEAM.halfWidth, y: 0 },
    { x: FRONT - BEZEL.depth - outerReach - LAND, y: 0 },
    { x: FRONT - BEZEL.depth, y: 0, radius: BEZEL.outerRadius },
    { x: FRONT, y: BEZEL.width, radius: BEZEL.innerRadius },
    { x: FRONT, y: BEZEL.width + innerReach + LAND }
  ])

  // 凹坑：在同一个深度上放两圈，一圈没有凹坑、一圈有，两圈之间就是凹坑的前壁或后壁
  return [
    ...rear.map((point) => ({ ...point, notch: 0 })),
    { x: NOTCH.back, y: 0, notch: NOTCH.depth },
    { x: NOTCH.front, y: 0, notch: NOTCH.depth },
    ...fore.map((point) => ({ ...point, notch: 0 }))
  ]
}

function addBody(builder) {
  // 合模线之前四边收得一样多，之后是斜边：底边只收一小部分
  const bezelStart = SEAM.z + SEAM.halfWidth
  let travelled = 0

  const rings = bodyStations().map((station, index, stations) => {
    const previous = stations[index - 1]
    const inset = { side: station.y, bottom: station.x > bezelStart ? station.y * BEZEL.bottomRatio : station.y }

    // 贴图坐标沿剖面累计长度，颗粒在圆角和斜边上不被拉伸
    if (previous) {
      travelled += Math.hypot(station.x - previous.x, station.y - previous.y) + Math.abs(station.notch - previous.notch)
    }

    return createRing(bodyOutline(inset, station.notch), {
      z: station.x,
      v: travelled,
      shadeAt: (point) => (station.shade ?? 1) * (isNotchFloor(point, inset, station.notch) ? NOTCH.shade : 1)
    })
  })

  builder.cap(rings[0], { z: BACK, facing: -1 })
  builder.loft(rings)

  return rings.at(-1)
}

// ==========================================================================
// 贴纸槽
// ==========================================================================

function wellOutline(grow) {
  return roundedRectOutline({
    left: LABEL.x - LABEL.width / 2 - grow,
    right: LABEL.x + LABEL.width / 2 + grow,
    bottom: LABEL.y - LABEL.height / 2 - grow,
    top: LABEL.y + LABEL.height / 2 + grow,
    topRadius: LABEL.radius + grow,
    bottomRadius: LABEL.radius + grow
  })
}

// 从正面向里挖：一小段平面、一圈圆角槽沿、直壁到槽底。圈按 z 递减排列，壁面朝向槽内
function addWell(builder, frontContour) {
  const lipSteps = 4

  const lip = Array.from({ length: lipSteps + 1 }, (_, step) => {
    const angle = (step / lipSteps) * (Math.PI / 2)

    return createRing(wellOutline(WELL.lip * (1 - Math.sin(angle))), { z: FRONT - WELL.lip * (1 - Math.cos(angle)) })
  })

  const rings = [
    createRing(wellOutline(WELL.lip + LAND), { z: FRONT }),
    ...lip,
    createRing(wellOutline(0), { z: FRONT - WELL.depth, shade: WELL.shade })
  ]

  builder.loft(rings)
  builder.cap(frontContour, { z: FRONT, facing: 1, holes: [rings[0]] })
}

// ==========================================================================
// 插脚与防滑纹
// ==========================================================================

function addTongue(builder) {
  const front = FRONT - TONGUE.recess

  const profile = roundPolyline([
    { x: BACK, y: BACK_FILLET },
    { x: BACK, y: 0, radius: BACK_FILLET },
    { x: front, y: 0, radius: TONGUE.edge },
    { x: front, y: TONGUE.edge + LAND }
  ])

  const rings = profile.map((point) =>
    createRing(
      roundedRectOutline({
        left: -RIGHT + TONGUE.inset + point.y,
        right: RIGHT - TONGUE.inset - point.y,
        bottom: -TOP + point.y,
        // 顶端藏在壳身里，不用收
        top: BODY_BOTTOM + TONGUE.overlap,
        topRadius: 0.5,
        bottomRadius: Math.max(TONGUE.radius - point.y, 0.5)
      }),
      { z: point.x }
    )
  )

  builder.cap(rings[0], { z: BACK, facing: -1 })
  builder.loft(rings)
  builder.cap(rings.at(-1), { z: front, facing: 1 })
}

function addRibs(builder) {
  for (const side of [1, -1]) {
    const inner = side * (RIGHT - RIBS.sink)
    const outer = side * (RIGHT + RIBS.proud)

    for (let index = 0; index < RIBS.count; index++) {
      const top = RIBS.top - index * RIBS.pitch

      const outline = roundedRectOutline({
        left: Math.min(inner, outer),
        right: Math.max(inner, outer),
        bottom: top - RIBS.height,
        top,
        topRadius: 0,
        bottomRadius: 0,
        segments: 1
      })

      builder.cap(outline, { z: RIBS.back, facing: -1 })
      builder.loft([createRing(outline, { z: RIBS.back }), createRing(outline, { z: RIBS.front })])
      builder.cap(outline, { z: RIBS.front, facing: 1 })
    }
  }
}

// ==========================================================================
// 共用的几何体与贴图
// ==========================================================================

function createShellGeometry() {
  const builder = createSurfaceBuilder()

  addWell(builder, addBody(builder))
  addTongue(builder)
  addRibs(builder)

  return builder.build(CREASE_ANGLE)
}

// 贴纸就是槽底：轮廓和槽底那一圈完全一样，贴图坐标换算成 0–1
function createLabelGeometry() {
  const builder = createSurfaceBuilder()

  builder.cap(wellOutline(0), {
    z: FRONT - WELL.depth,
    facing: 1,
    uv: (point) => [(point.x - LABEL.x) / LABEL.width + 0.5, (point.y - LABEL.y) / LABEL.height + 0.5]
  })

  return builder.build(CREASE_ANGLE)
}

// 细密的随机起伏，当凹凸贴图用：磨砂塑料在掠射光下的细小明暗
function createGrainTexture() {
  const canvas = document.createElement('canvas')

  canvas.width = GRAIN_TEXELS
  canvas.height = GRAIN_TEXELS

  const context = canvas.getContext('2d')
  const image = context.createImageData(GRAIN_TEXELS, GRAIN_TEXELS)

  for (let i = 0; i < image.data.length; i += 4) {
    const value = 96 + Math.random() * 64

    image.data[i] = value
    image.data[i + 1] = value
    image.data[i + 2] = value
    image.data[i + 3] = 255
  }

  context.putImageData(image, 0, 0)

  const texture = new CanvasTexture(canvas)

  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  // 外壳的贴图坐标以像素为单位，用 repeat 换算成铺贴次数
  texture.repeat.set(1 / GRAIN_TILE, 1 / GRAIN_TILE)

  return texture
}

/**
 * 一个场景里所有卡带共用的几何体和颗粒贴图
 * @returns {{ shell: import('three').BufferGeometry, label: import('three').BufferGeometry, name: PlaneGeometry, grain: CanvasTexture, dispose: () => void }}
 */
export function createCartridgeParts() {
  const parts = {
    shell: createShellGeometry(),
    label: createLabelGeometry(),
    // 平面转到顶面上：字的上方朝卡带背面，卡带顶面朝读者时字是正的
    name: new PlaneGeometry(NAME.width, NAME.height).rotateX(-Math.PI / 2).translate(0, TOP + 0.06, NAME.z),
    grain: createGrainTexture()
  }

  return {
    ...parts,
    dispose() {
      for (const part of Object.values(parts)) part.dispose()
    }
  }
}

// ==========================================================================
// 工具名
// ==========================================================================

// 外壳亮度决定模压字用深色还是浅色
function isLightShell(hex) {
  const value = parseInt(hex.slice(1), 16)
  const luminance = (0.299 * (value >> 16) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255

  return luminance > 0.55
}

/**
 * 把工具名画到画布上，居中：字本身加一道错开 1 像素的亮边或暗边，读起来像压进塑料里。
 * @param {HTMLCanvasElement} canvas
 * @param {{ name: string, shell: string }} tool
 * @param {string} fontFamily 页面等宽字体的 font-family
 */
export function drawNameTexture(canvas, tool, fontFamily) {
  const scale = NAME_TEXTURE_SCALE
  const context = canvas.getContext('2d')
  const isLight = isLightShell(tool.shell)
  const text = tool.name.toUpperCase()
  const center = (NAME.width / 2) * scale
  const baseline = (NAME.height / 2) * scale

  canvas.width = NAME.width * scale
  canvas.height = NAME.height * scale
  context.font = `700 ${10 * scale}px ${fontFamily}`
  context.letterSpacing = `${1.4 * scale}px`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // 浅色外壳：深字，下方一道亮边。深色外壳：浅字，上方一道暗边
  context.fillStyle = isLight ? 'rgb(255 255 255 / 0.4)' : 'rgb(0 0 0 / 0.5)'
  context.fillText(text, center, baseline + (isLight ? scale : -scale), canvas.width)
  // 先设一个保底色：浏览器不认 color-mix 时，下一次赋值会被忽略
  context.fillStyle = isLight ? '#333333' : '#dddddd'
  context.fillStyle = isLight
    ? `color-mix(in oklab, ${tool.shell} 38%, black)`
    : `color-mix(in oklab, ${tool.shell} 30%, white)`
  context.fillText(text, center, baseline, canvas.width)
}

// ==========================================================================
// 单盘卡带
// ==========================================================================

/**
 * @param {ReturnType<typeof createCartridgeParts>} parts
 * @param {{ name: string, shell: string }} tool
 * @param {{ label: import('three').Texture, name: import('three').Texture }} textures
 * @returns {{ group: Group, setOpacity: (opacity: number) => void, dispose: () => void }}
 */
export function createCartridge(parts, tool, textures) {
  // 模压 ABS 塑料：不反金属光，高光宽而克制。顶点色把凹坑和槽壁深处压暗
  const shell = new MeshStandardMaterial({
    color: new Color(tool.shell),
    roughness: 0.58,
    metalness: 0,
    bumpMap: parts.grain,
    bumpScale: 0.9,
    vertexColors: true
  })

  // 覆膜纸：底层偏哑，上面一层薄清漆
  const label = new MeshPhysicalMaterial({
    map: textures.label,
    roughness: 0.64,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4
  })

  const name = new MeshStandardMaterial({ map: textures.name, roughness: 0.7, metalness: 0, transparent: true })

  // 贴纸和贴纸图的比例不一致时，贴图在竖直方向只取中间一段
  textures.label.colorSpace = SRGBColorSpace
  textures.label.repeat.set(1, Math.min(1, LABEL.height / (LABEL.width / LABEL_IMAGE_ASPECT)))
  textures.label.offset.set(0, (1 - textures.label.repeat.y) / 2)
  textures.name.colorSpace = SRGBColorSpace

  const group = new Group()
  const meshes = [new Mesh(parts.shell, shell), new Mesh(parts.label, label), new Mesh(parts.name, name)]

  for (const mesh of meshes) {
    mesh.castShadow = mesh.material !== name
    mesh.receiveShadow = true
    group.add(mesh)
  }

  const materials = [shell, label, name]

  return {
    group,
    // 进场淡入用。完全不透明后关掉 transparent，卡带回到按深度排序的不透明队列
    setOpacity(opacity) {
      for (const material of materials) {
        const isTransparent = opacity < 1 || material === name

        if (material.transparent !== isTransparent) {
          material.transparent = isTransparent
          material.needsUpdate = true
        }

        material.opacity = opacity
      }
    },
    dispose() {
      for (const material of materials) material.dispose()

      textures.label.dispose()
      textures.name.dispose()
    }
  }
}
