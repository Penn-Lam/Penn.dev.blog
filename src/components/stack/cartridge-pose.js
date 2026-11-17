import { hashString } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 hashString
 * [OUTPUT]: 对外提供 CARTRIDGE 尺寸常量、pileHeight、cartridgeRestOffset、cartridgeTargetPose、cartridgeEntrancePose、createSpring、stepSpring、isSpringAtRest
 * [POS]: components/stack 的姿态与运动规则，纯函数，不依赖 three 和 DOM。
 *        长度单位是 CSS 像素，角度单位是弧度；场景里 1 个世界单位等于 1 个 CSS 像素，所以这里的数可以直接和页面布局对上。
 *        cartridge-scene.js 每帧读这里的目标姿态，用弹簧把当前姿态推过去；cartridge-pile.js 用 pileHeight 给画布占位。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const DEGREE = Math.PI / 180

// ==========================================================================
// 尺寸与一摞的排布
// ==========================================================================

export const CARTRIDGE = {
  width: 240,
  height: 176,
  depth: 28,
  // 叠放时相邻两盘卡带的纵向间距
  step: 84,
  // 选中一盘时，上下邻居各让开的距离
  spread: 58,
  // 一摞上下各留的空白
  padding: 20
}

// pitch 是绕水平轴的转角：0 时贴纸正对读者，正值时卡带顶面转向读者、贴纸朝下。
// 叠放：顶面朝前，贴纸斜着露在顶面下方，下半截被下面一盘挡住
const REST_PITCH = 62 * DEGREE

// 悬停：略微抬头
const PEEK_PITCH = 56 * DEGREE

// 选中：立起来，略微向后靠
const OPEN_PITCH = -7 * DEGREE

// 悬停时卡带朝清单一侧抽出、朝读者抬起的距离
const PEEK_SLIDE = 14

const PEEK_RISE = 16

/**
 * 一摞卡带在页面上占的高度
 * @param {number} count 卡带数量
 * @returns {number} CSS 像素
 */
export function pileHeight(count) {
  return (count - 1) * CARTRIDGE.step + CARTRIDGE.height + CARTRIDGE.padding * 2
}

/**
 * 由 slug 算出固定的静止偏角与错位。同一个 slug 每次结果一致，一摞卡带看起来是随手叠的，但不会每次刷新都换样子。
 * @param {string} slug
 * @returns {{ roll: number, dx: number }} roll 为弧度，dx 为像素
 */
export function cartridgeRestOffset(slug) {
  const seed = hashString(slug)

  return { roll: ((seed % 9) - 4) * DEGREE, dx: ((seed >> 4) % 21) - 10 }
}

/**
 * 一盘卡带此刻应该到达的姿态。
 * 没有选中项时所有卡带叠放；有选中项时，选中的那盘原地立起并靠近读者，它上方的卡带上移、下方的下移。
 * @param {{ index: number, count: number, selectedIndex: number, isPeek: boolean, offset: { roll: number, dx: number } }} slot
 * @returns {{ x: number, y: number, z: number, pitch: number, yaw: number, roll: number }}
 */
export function cartridgeTargetPose(slot) {
  const { index, count, selectedIndex, isPeek, offset } = slot
  const slotY = ((count - 1) / 2 - index) * CARTRIDGE.step

  if (index === selectedIndex) {
    return { x: 0, y: slotY, z: 60, pitch: OPEN_PITCH, yaw: 0, roll: 1.5 * DEGREE }
  }

  const shift = selectedIndex < 0 ? 0 : index < selectedIndex ? CARTRIDGE.spread : -CARTRIDGE.spread

  // 悬停或清单里指到对应工具：朝清单一侧抽出一点，同时抬起
  if (isPeek) {
    return {
      x: offset.dx - PEEK_SLIDE,
      y: slotY + shift,
      z: PEEK_RISE,
      pitch: PEEK_PITCH,
      yaw: 0,
      roll: offset.roll * 0.4
    }
  }

  return { x: offset.dx, y: slotY + shift, z: 0, pitch: REST_PITCH, yaw: 0, roll: offset.roll }
}

/**
 * 进入页面时卡带落下之前的起始姿态：在静止位置上方，立得更直，落下时向前扣进这一摞
 * @param {{ x: number, y: number, z: number, pitch: number, yaw: number, roll: number }} pose 静止姿态
 * @returns {{ x: number, y: number, z: number, pitch: number, yaw: number, roll: number }}
 */
export function cartridgeEntrancePose(pose) {
  return { ...pose, y: pose.y + 96, pitch: pose.pitch - 25 * DEGREE }
}

// ==========================================================================
// 弹簧
// ==========================================================================

// 位移的弹簧比转动的硬：让位先完成，立起来的卡带不会扫过邻居
export const SPRING_PRESETS = {
  position: { stiffness: 320, damping: 30 },
  rotation: { stiffness: 220, damping: 23 }
}

// 位移轴的静止阈值：离目标不到 0.1 像素，速度低于每秒 1 像素。角度轴按 scale 缩小
const REST_DISTANCE = 0.1

const REST_VELOCITY = 1

/**
 * @param {number} value 初始值
 * @param {{ stiffness: number, damping: number }} preset
 * @returns {{ value: number, velocity: number, stiffness: number, damping: number }}
 */
export function createSpring(value, preset) {
  return { value, velocity: 0, stiffness: preset.stiffness, damping: preset.damping }
}

/**
 * 把弹簧向目标推进一步（半隐式欧拉）。速度留在弹簧里，目标中途改变时运动不断开。
 * @param {{ value: number, velocity: number, stiffness: number, damping: number }} spring 会被原地修改
 * @param {number} target
 * @param {number} dt 秒
 */
export function stepSpring(spring, target, dt) {
  const acceleration = -spring.stiffness * (spring.value - target) - spring.damping * spring.velocity

  spring.velocity += acceleration * dt
  spring.value += spring.velocity * dt
}

/**
 * @param {{ value: number, velocity: number }} spring
 * @param {number} target
 * @param {number} scale 这根轴的量级：位移（像素）传 1，角度（弧度）传 0.01
 * @returns {boolean}
 */
export function isSpringAtRest(spring, target, scale) {
  return Math.abs(spring.value - target) < REST_DISTANCE * scale && Math.abs(spring.velocity) < REST_VELOCITY * scale
}
