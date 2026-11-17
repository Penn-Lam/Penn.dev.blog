import { expect, test } from 'bun:test'

import toolsData from '@/data/tools.json'

import {
  CARTRIDGE,
  cartridgeEntrancePose,
  cartridgeRestOffset,
  cartridgeTargetPose,
  createSpring,
  isSpringAtRest,
  pileHeight,
  SPRING_PRESETS,
  stepSpring
} from './cartridge-pose'

const DEGREE = Math.PI / 180

// 场景每帧最多推进 1/30 秒，再分成 2 小步
const LONGEST_STEP = 1 / 60

const restPose = (index, count) =>
  cartridgeTargetPose({ index, count, selectedIndex: -1, isPeek: false, offset: { roll: 0, dx: 0 } })

test('pileHeight reserves one step per extra cartridge plus the padding', () => {
  expect(pileHeight(1)).toBe(CARTRIDGE.height + CARTRIDGE.padding * 2)
  expect(pileHeight(5) - pileHeight(4)).toBe(CARTRIDGE.step)
})

test('cartridgeRestOffset is stable per slug and stays small', () => {
  const slugs = toolsData.categories.flatMap((category) => category.tools.map((tool) => tool.slug))

  expect(slugs.length).toBeGreaterThan(0)

  for (const slug of slugs) {
    const offset = cartridgeRestOffset(slug)

    expect(cartridgeRestOffset(slug)).toEqual(offset)
    expect(Math.abs(offset.roll)).toBeLessThanOrEqual(4 * DEGREE + 1e-9)
    expect(Math.abs(offset.dx)).toBeLessThanOrEqual(10)
  }
})

test('a resting pile is centred, evenly spaced and shows the top face', () => {
  const poses = [0, 1, 2, 3].map((index) => restPose(index, 4))

  expect(poses[0].y + poses[3].y).toBeCloseTo(0)
  expect(poses[0].y - poses[1].y).toBe(CARTRIDGE.step)

  // 顶面转向读者：pitch 为正，且不到 90 度（贴纸仍露出一截）
  for (const pose of poses) {
    expect(pose.pitch).toBeGreaterThan(45 * DEGREE)
    expect(pose.pitch).toBeLessThan(90 * DEGREE)
    expect(pose.z).toBe(0)
  }
})

test('the selected cartridge stands up in place and its neighbours move away from it', () => {
  const slot = { count: 5, selectedIndex: 2, isPeek: false, offset: { roll: 0.05, dx: 6 } }
  const selected = cartridgeTargetPose({ ...slot, index: 2 })
  const above = cartridgeTargetPose({ ...slot, index: 1 })
  const below = cartridgeTargetPose({ ...slot, index: 3 })

  expect(selected.y).toBe(restPose(2, 5).y)
  expect(Math.abs(selected.pitch)).toBeLessThan(15 * DEGREE)
  expect(selected.z).toBeGreaterThan(0)
  // 立起来的卡带摆正，不带静止时的错位
  expect(selected.x).toBe(0)

  expect(above.y - restPose(1, 5).y).toBe(CARTRIDGE.spread)
  expect(below.y - restPose(3, 5).y).toBe(-CARTRIDGE.spread)
})

test('peeking slides a cartridge out without changing its slot', () => {
  const slot = { index: 1, count: 4, selectedIndex: -1, offset: { roll: 0.05, dx: 6 } }
  const rest = cartridgeTargetPose({ ...slot, isPeek: false })
  const peek = cartridgeTargetPose({ ...slot, isPeek: true })

  expect(peek.y).toBe(rest.y)
  expect(peek.x).toBeLessThan(rest.x)
  expect(peek.z).toBeGreaterThan(rest.z)
  expect(peek.pitch).toBeLessThan(rest.pitch)
})

test('peeking the selected cartridge leaves it standing', () => {
  const slot = { index: 1, count: 4, selectedIndex: 1, offset: { roll: 0.05, dx: 6 } }

  expect(cartridgeTargetPose({ ...slot, isPeek: true })).toEqual(cartridgeTargetPose({ ...slot, isPeek: false }))
})

test('the entrance pose starts above the slot and more upright', () => {
  const rest = restPose(0, 3)
  const entrance = cartridgeEntrancePose(rest)

  expect(entrance.y).toBeGreaterThan(rest.y)
  expect(entrance.pitch).toBeLessThan(rest.pitch)
  expect(entrance.x).toBe(rest.x)
})

test.each(Object.entries(SPRING_PRESETS))(
  'the %s spring settles at the longest step with little overshoot',
  (_, preset) => {
    const spring = createSpring(0, preset)
    let peak = 0
    let steps = 0

    while (!isSpringAtRest(spring, 100, 1) && steps < 600) {
      stepSpring(spring, 100, LONGEST_STEP)
      peak = Math.max(peak, spring.value)
      steps++
    }

    expect(isSpringAtRest(spring, 100, 1)).toBe(true)
    // 一秒内停稳，过冲不超过行程的 5%
    expect(steps * LONGEST_STEP).toBeLessThan(1)
    expect(peak).toBeLessThan(105)
  }
)

test('retargeting a moving spring keeps its velocity', () => {
  const spring = createSpring(0, SPRING_PRESETS.position)

  for (let step = 0; step < 2; step++) stepSpring(spring, 100, LONGEST_STEP)

  const velocity = spring.velocity
  const value = spring.value

  expect(velocity).toBeGreaterThan(0)

  // 目标中途换成原点：下一步仍沿原方向前进，不从零速重新起步
  stepSpring(spring, 0, LONGEST_STEP)

  expect(spring.velocity).toBeGreaterThan(0)
  expect(spring.velocity).toBeLessThan(velocity)
  expect(spring.value).toBeGreaterThan(value)
})
