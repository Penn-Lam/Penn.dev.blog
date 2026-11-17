import {
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  ShadowMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { createCartridge, createCartridgeParts, drawNameTexture } from './cartridge-model'
import {
  CARTRIDGE,
  cartridgeEntrancePose,
  cartridgeRestOffset,
  cartridgeTargetPose,
  createSpring,
  isSpringAtRest,
  SPRING_PRESETS,
  stepSpring
} from './cartridge-pose'

/**
 * [INPUT]: 依赖 three 的渲染器、相机、灯光、射线检测；依赖 three/examples 的 RoomEnvironment；依赖 ./cartridge-model 的卡带网格；依赖 ./cartridge-pose 的目标姿态与弹簧
 * [OUTPUT]: 对外提供 createCartridgeScene，返回 { setState, dispose }
 * [POS]: components/stack 的三维场景，一个分类一块画布。它不认识 React：cartridge-pile.js 把画布、命中区和回调交给它，再用 setState 告诉它选中和悬停的是哪一盘。
 *        场景里 1 个世界单位等于 1 个 CSS 像素，原点在画布中心，相机正对 -z。
 *        只在有东西在动时渲染：弹簧全部静止后停掉逐帧循环。
 *        进场之前先把会卡帧的活干完：贴纸一加载完就上传到显卡，着色器在不透明和半透明两种状态下各编译一遍，全部完成后卡带才开始落下。
 *        两盏方向光分工：主光从读者一侧照亮朝前的面并投阴影；补光从下方照上来，代替页面的反光，叠放时朝下的贴纸靠它照亮。
 *        环境光强度压在 0.25：竖直的面收到的环境光比朝下的面多，调高后立起来的卡带会比叠放时明显发白。
 *        指针命中用不随动画移动的隐形盒子判断，卡带抬起或抽出时不会从指针下面跑掉。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 画面参数
// ==========================================================================

// 相机离画布平面的距离。越远透视越弱，近似长焦镜头
const CAMERA_DISTANCE = 1800

// 接阴影的背板位置，贴在叠放卡带的远端后面
const BACKDROP_Z = -(CARTRIDGE.height / 2 + 14)

const MAX_PIXEL_RATIO = 2

// 主光：从读者一侧偏左上方照过来，照亮朝前的面，阴影落向右下
const KEY_LIGHT_DIRECTION = [-0.4, 0.9, 3.2]

const KEY_LIGHT_DISTANCE = 1200

const KEY_LIGHT_INTENSITY = 1.5

// 补光：从下方偏前照上来，相当于页面的反光。叠放时贴纸朝下，靠它照亮；不投阴影
const FILL_LIGHT_DIRECTION = [0, -1, 0.35]

const FILL_LIGHT_INTENSITY = 2

// ==========================================================================
// 运动参数
// ==========================================================================

// 单帧时间上限。标签页切回来时的长间隔不会让弹簧飞出去
const MAX_FRAME_SECONDS = 1 / 30

const SPRING_SUBSTEPS = 2

// 进场：最底下那盘先落，每盘间隔这么多毫秒
const ENTRANCE_STAGGER = 90

const ENTRANCE_FADE_SECONDS = 0.22

// 立起来的卡带跟随指针倾斜的最大角度（弧度）和跟随速率
const LEAN_YAW = 0.2

const LEAN_PITCH = 0.15

const LEAN_RATE = 12

const LEAN_REST = 0.0005

const POSE_AXES = [
  ['x', 'position', 1],
  ['y', 'position', 1],
  ['z', 'position', 1],
  ['pitch', 'rotation', 0.01],
  ['yaw', 'rotation', 0.01],
  ['roll', 'rotation', 0.01]
]

// ==========================================================================
// 场景搭建
// ==========================================================================

function createLights(scene) {
  const key = new DirectionalLight(0xffffff, KEY_LIGHT_INTENSITY)
  const fill = new DirectionalLight(0xffffff, FILL_LIGHT_INTENSITY)
  const [x, y, z] = KEY_LIGHT_DIRECTION
  const length = Math.hypot(x, y, z)

  key.position.set(x, y, z).multiplyScalar(KEY_LIGHT_DISTANCE / length)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 9
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.6
  key.shadow.camera.near = KEY_LIGHT_DISTANCE - 500
  key.shadow.camera.far = KEY_LIGHT_DISTANCE + 500

  fill.position.set(...FILL_LIGHT_DIRECTION)

  scene.add(key, fill, new HemisphereLight(0xffffff, 0xe8e4dc, 0.6))

  return key
}

function createEnvironment(renderer) {
  const generator = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const target = generator.fromScene(room, 0.04)

  room.dispose()
  generator.dispose()

  return target
}

/**
 * @param {{
 *   canvas: HTMLCanvasElement,
 *   hitArea: HTMLElement,
 *   tools: Array<{ slug: string, name: string, shell: string, label: string }>,
 *   fontFamily: string,
 *   isReducedMotion: boolean,
 *   canHover: boolean,
 *   onPeek: (slug: string | null) => void,
 *   onSelect: (slug: string) => void
 * }} options
 * @returns {{ setState: (state: { selectedSlug: string | null, peekSlug: string | null }) => void, dispose: () => void }}
 */
export function createCartridgeScene(options) {
  const { canvas, hitArea, tools, fontFamily, isReducedMotion, canHover, onPeek, onSelect } = options

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap

  const scene = new Scene()
  const environment = createEnvironment(renderer)

  scene.environment = environment.texture
  scene.environmentIntensity = 0.25

  const camera = new PerspectiveCamera(20, 1, CAMERA_DISTANCE - 500, CAMERA_DISTANCE + 500)

  camera.position.z = CAMERA_DISTANCE

  const keyLight = createLights(scene)
  const backdrop = new Mesh(new PlaneGeometry(1, 1), new ShadowMaterial({ opacity: 0.14 }))

  backdrop.position.z = BACKDROP_Z
  backdrop.receiveShadow = true
  scene.add(backdrop)

  // ------------------------------------------------------------------------
  // 卡带
  // ------------------------------------------------------------------------

  const parts = createCartridgeParts()
  const loader = new TextureLoader()
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
  const hitGeometry = new BoxGeometry(CARTRIDGE.width, CARTRIDGE.height, CARTRIDGE.depth)
  const hitMaterial = new MeshBasicMaterial()

  let selectedIndex = -1
  let peekSlug = null
  let frame = 0
  let lastTime = 0
  let hasEntered = false
  let isCompiling = false
  let isInView = false
  let isDisposed = false
  let pendingLabels = tools.length
  // 指针在画布里的位置（标准化设备坐标）。不在命中区内时为 null
  let pointer = null

  const invalidate = () => {
    if (frame || !hasEntered || isDisposed) return

    lastTime = performance.now()
    frame = requestAnimationFrame(tick)
  }

  // 贴纸图全部有了结果（加载完或失败）、画布也进了视口，才开始进场，卡带不会先露出没有贴纸的槽
  const settleLabel = () => {
    pendingLabels -= 1
    enterWhenReady()
  }

  // 图一到就传给显卡，不等到卡带第一次画出来的那一帧
  const uploadLabel = (texture) => {
    if (isDisposed) return

    renderer.initTexture(texture)
    settleLabel()
  }

  const items = tools.map((tool, index) => {
    const nameCanvas = document.createElement('canvas')

    drawNameTexture(nameCanvas, tool, fontFamily)

    const textures = {
      label: loader.load(tool.label, uploadLabel, undefined, settleLabel),
      name: new CanvasTexture(nameCanvas)
    }

    textures.label.anisotropy = maxAnisotropy
    textures.name.anisotropy = maxAnisotropy

    const cartridge = createCartridge(parts, tool, textures)
    const offset = cartridgeRestOffset(tool.slug)
    const target = cartridgeTargetPose({ index, count: tools.length, selectedIndex, isPeek: false, offset })
    const start = isReducedMotion ? target : cartridgeEntrancePose(target)

    const springs = Object.fromEntries(
      POSE_AXES.map(([axis, preset]) => [axis, createSpring(start[axis], SPRING_PRESETS[preset])])
    )

    // 命中盒不进渲染场景，只给射线检测用
    const hitBox = new Mesh(hitGeometry, hitMaterial)

    hitBox.userData.index = index
    cartridge.group.visible = false
    cartridge.setOpacity(isReducedMotion ? 1 : 0)
    scene.add(cartridge.group)

    return {
      tool,
      index,
      offset,
      cartridge,
      nameCanvas,
      textures,
      springs,
      target,
      hitBox,
      opacity: isReducedMotion ? 1 : 0,
      enterAt: 0,
      lean: { yaw: 0, pitch: 0 },
      leanTarget: { yaw: 0, pitch: 0 }
    }
  })

  // 等宽字体加载完后重画工具名
  document.fonts
    ?.load(`700 10px ${fontFamily}`)
    .then(() => {
      if (isDisposed) return

      for (const item of items) {
        drawNameTexture(item.nameCanvas, item.tool, fontFamily)
        item.textures.name.needsUpdate = true
      }

      invalidate()
    })
    .catch(() => {})

  // ------------------------------------------------------------------------
  // 姿态
  // ------------------------------------------------------------------------

  const placeHitBox = (item) => {
    const pose = cartridgeTargetPose({
      index: item.index,
      count: items.length,
      selectedIndex,
      isPeek: false,
      offset: item.offset
    })

    item.hitBox.position.set(pose.x, pose.y, pose.z)
    item.hitBox.rotation.set(pose.pitch, pose.yaw, pose.roll)
    item.hitBox.updateMatrixWorld()
  }

  const retarget = () => {
    for (const item of items) {
      item.target = cartridgeTargetPose({
        index: item.index,
        count: items.length,
        selectedIndex,
        isPeek: item.tool.slug === peekSlug,
        offset: item.offset
      })
      placeHitBox(item)

      if (item.index !== selectedIndex) item.leanTarget = { yaw: 0, pitch: 0 }
    }
  }

  const applyPose = (item) => {
    const { x, y, z, pitch, yaw, roll } = item.springs
    const { group } = item.cartridge

    group.position.set(x.value, y.value, z.value)
    // 欧拉顺序 XYZ：先在卡带自己的平面里转 roll，再左右转 yaw，最后前后转 pitch
    group.rotation.set(pitch.value + item.lean.pitch, yaw.value + item.lean.yaw, roll.value)
  }

  // 推进一盘卡带，返回它是否还在动
  const advance = (item, now, dt) => {
    if (now < item.enterAt) return true

    let isMoving = false

    item.cartridge.group.visible = true

    if (item.opacity < 1) {
      item.opacity = Math.min(1, item.opacity + dt / ENTRANCE_FADE_SECONDS)
      item.cartridge.setOpacity(item.opacity)
      isMoving = true
    }

    for (const [axis, , scale] of POSE_AXES) {
      const spring = item.springs[axis]
      const target = item.target[axis]

      if (isReducedMotion) {
        spring.value = target
        spring.velocity = 0
        continue
      }

      for (let step = 0; step < SPRING_SUBSTEPS; step++) stepSpring(spring, target, dt / SPRING_SUBSTEPS)

      if (isSpringAtRest(spring, target, scale)) {
        spring.value = target
        spring.velocity = 0
      } else {
        isMoving = true
      }
    }

    const follow = 1 - Math.exp(-LEAN_RATE * dt)

    for (const axis of ['yaw', 'pitch']) {
      const gap = item.leanTarget[axis] - item.lean[axis]

      if (Math.abs(gap) < LEAN_REST) {
        item.lean[axis] = item.leanTarget[axis]
      } else {
        item.lean[axis] += gap * follow
        isMoving = true
      }
    }

    applyPose(item)

    return isMoving
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS)
    let isMoving = false

    lastTime = now
    frame = 0

    for (const item of items) isMoving = advance(item, now, dt) || isMoving

    renderer.render(scene, camera)

    if (isMoving) frame = requestAnimationFrame(tick)
  }

  // ------------------------------------------------------------------------
  // 尺寸
  // ------------------------------------------------------------------------

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (!width || !height) return

    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // 视野按画布高度反推：z = 0 平面上 1 个世界单位正好是 1 个 CSS 像素
    camera.fov = (Math.atan(height / 2 / CAMERA_DISTANCE) * 360) / Math.PI
    camera.updateProjectionMatrix()

    const reach = Math.max(width, height) / 2 + 80
    const shadowCamera = keyLight.shadow.camera

    shadowCamera.left = -reach
    shadowCamera.right = reach
    shadowCamera.top = reach
    shadowCamera.bottom = -reach
    shadowCamera.updateProjectionMatrix()
    backdrop.scale.set(width * 1.5, height * 1.5, 1)

    invalidate()
  }

  const resizeObserver = new ResizeObserver(resize)

  resizeObserver.observe(canvas)

  // ------------------------------------------------------------------------
  // 指针
  // ------------------------------------------------------------------------

  const raycaster = new Raycaster()
  const hitBoxes = items.map((item) => item.hitBox)

  const toPointer = (event) => {
    const bounds = canvas.getBoundingClientRect()

    return new Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    )
  }

  // 返回指针下最靠前的那盘卡带，以及指针落在它正面上的位置（-1 到 1）
  const pick = (point) => {
    raycaster.setFromCamera(point, camera)

    const [hit] = raycaster.intersectObjects(hitBoxes, false)

    if (!hit) return null

    const local = hit.object.worldToLocal(hit.point.clone())

    return {
      item: items[hit.object.userData.index],
      x: Math.max(-1, Math.min(1, local.x / (CARTRIDGE.width / 2))),
      y: Math.max(-1, Math.min(1, local.y / (CARTRIDGE.height / 2)))
    }
  }

  const updateHover = () => {
    const hit = pointer && pick(pointer)
    const hoveredSlug = hit ? hit.item.tool.slug : null

    hitArea.style.cursor = hit ? 'pointer' : ''

    for (const item of items) {
      const isLeaning = hit?.item === item && item.index === selectedIndex && !isReducedMotion

      // 指针压在哪一侧，那一侧就向里沉
      item.leanTarget = isLeaning ? { yaw: hit.x * LEAN_YAW, pitch: -hit.y * LEAN_PITCH } : { yaw: 0, pitch: 0 }
    }

    if (hoveredSlug !== peekSlug) onPeek(hoveredSlug)

    invalidate()
  }

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch' || !canHover) return

    pointer = toPointer(event)
    updateHover()
  }

  const handlePointerLeave = () => {
    if (!pointer) return

    pointer = null
    updateHover()
  }

  const handleClick = (event) => {
    const hit = pick(toPointer(event))

    if (hit) onSelect(hit.item.tool.slug)
  }

  hitArea.addEventListener('pointermove', handlePointerMove)
  hitArea.addEventListener('pointerleave', handlePointerLeave)
  hitArea.addEventListener('click', handleClick)

  // ------------------------------------------------------------------------
  // 进场：画布第一次进入视口时，卡带从上方依次落进这一摞
  // ------------------------------------------------------------------------

  // 材质在淡入时半透明、淡入后不透明，两种状态各用一套着色器。两套都先编译好，动画中途不会因为编译停顿
  async function compileMaterials() {
    for (const opacity of [1, isReducedMotion ? 1 : 0]) {
      for (const item of items) item.cartridge.setOpacity(opacity)

      await renderer.compileAsync(scene, camera)
    }
  }

  function enterWhenReady() {
    if (hasEntered || isCompiling || isDisposed || !isInView || pendingLabels > 0) return

    isCompiling = true

    compileMaterials()
      .catch(() => {})
      .then(() => {
        if (isDisposed) return

        const now = performance.now()

        hasEntered = true

        for (const item of items) {
          item.enterAt = isReducedMotion ? 0 : now + (items.length - 1 - item.index) * ENTRANCE_STAGGER
        }

        invalidate()
      })
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return

      intersectionObserver.disconnect()
      isInView = true
      enterWhenReady()
    },
    { rootMargin: '0px 0px -10% 0px' }
  )

  retarget()
  resize()
  intersectionObserver.observe(canvas)

  return {
    setState(state) {
      selectedIndex = items.findIndex((item) => item.tool.slug === state.selectedSlug)
      peekSlug = state.peekSlug
      retarget()

      // 选中项变了，命中盒跟着换了位置：指针没动也要重新判断它压着谁
      if (pointer) updateHover()

      invalidate()
    },
    dispose() {
      isDisposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      hitArea.removeEventListener('pointermove', handlePointerMove)
      hitArea.removeEventListener('pointerleave', handlePointerLeave)
      hitArea.removeEventListener('click', handleClick)
      hitArea.style.cursor = ''

      for (const item of items) item.cartridge.dispose()

      parts.dispose()
      hitGeometry.dispose()
      hitMaterial.dispose()
      backdrop.geometry.dispose()
      backdrop.material.dispose()
      keyLight.shadow.dispose()
      environment.dispose()
      renderer.dispose()
    }
  }
}
