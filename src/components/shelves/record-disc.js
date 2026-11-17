'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { useTurntable } from '@/components/vinyl-player/turntable-context'
import { VinylRecord } from '@/components/vinyl-player/vinyl-record'

import styles from './shelves.module.css'

/**
 * [INPUT]: 依赖 framer-motion 的 motion、useMotionValue、useTransform、animate；依赖 @/components/vinyl-player/turntable-context 的 useTurntable；依赖 @/components/vinyl-player/vinyl-record 的 VinylRecord
 * [OUTPUT]: 对外提供 RecordDisc 组件
 * [POS]: components/shelves 里封套中的那张黑胶。有音源的唱片可以拿起来：拖到页面顶部的转盘上松手，或者直接点一下，它会飞到转盘上并开始播放。
 *        松手时没对准转盘，就弹回封套。唱片在转盘上期间，封套里是空的；被换下或退出后，它从转盘飞回封套。
 *        没有音源的唱片只是摆着，不能拿起。
 *        播过一次、发现这位访客取不到音频的唱片会变灰，不能再拿起；封套上的外链照常可点，可以去网易云听。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const FLY_SPRING = { type: 'spring', stiffness: 240, damping: 24 }

const RETURN_SPRING = { type: 'spring', stiffness: 360, damping: 26 }

// 松手时唱片中心离转盘上那张唱片的中心在这个比例（相对其直径）以内，算放上去了。约等于整台唱机的范围
const DROP_REACH_RATIO = 0.95

// 取不到音频的唱片褪到这个不透明度。写在这里而不是样式表里：唱片的 opacity 由 framer-motion 的内联样式管
const UNPLAYABLE_OPACITY = 0.45

const centerOf = (bounds) => ({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })

export function RecordDisc({ record }) {
  const { platterRef, record: recordOnPlatter, placeRecord, setIsRecordHeld, unplayableIds } = useTurntable()
  const handleRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  // 拖着走时顺势滚一点
  const rotate = useTransform(x, (value) => value * 0.22)
  const [isLifted, setIsLifted] = useState(false)
  // 拖拽结束时指针仍在唱片上，framer-motion 会同时报一次 tap；用它区分“点了一下”和“拖完松手”
  const hasDraggedRef = useRef(false)
  const isOnPlatter = recordOnPlatter?.id === record.id
  const isUnplayable = unplayableIds.has(record.id)

  // 离开转盘（被换下或退出）时飞回封套；首次渲染时三个值本来就在原位，不会动
  useEffect(() => {
    if (isOnPlatter) return

    const flights = [animate(x, 0, FLY_SPRING), animate(y, 0, FLY_SPRING), animate(scale, 1, FLY_SPRING)]

    Promise.all(flights).then(() => setIsLifted(false))

    return () => flights.forEach((flight) => flight.stop())
  }, [isOnPlatter, x, y, scale])

  if (!record.audio) {
    return (
      <div className={styles.discSlot}>
        <VinylRecord coverUrl={record.cover} />
      </div>
    )
  }

  const offsetToPlatter = () => {
    const platter = platterRef.current?.getBoundingClientRect()
    const disc = handleRef.current?.getBoundingClientRect()

    if (!platter?.width || !disc) return null

    const from = centerOf(disc)
    const to = centerOf(platter)

    return { dx: to.x - from.x, dy: to.y - from.y, platterSize: platter.width }
  }

  const flyToPlatter = async () => {
    const offset = offsetToPlatter()

    if (!offset) return

    setIsLifted(true)
    await Promise.all([
      animate(x, x.get() + offset.dx, FLY_SPRING),
      animate(y, y.get() + offset.dy, FLY_SPRING),
      animate(scale, offset.platterSize / handleRef.current.offsetWidth, FLY_SPRING)
    ])
    placeRecord(record)
  }

  const handleDragStart = () => {
    hasDraggedRef.current = true
    setIsLifted(true)
    setIsRecordHeld(true)
    animate(scale, 1.06, RETURN_SPRING)
  }

  const handleDragEnd = async () => {
    setIsRecordHeld(false)

    const offset = offsetToPlatter()

    if (offset && Math.hypot(offset.dx, offset.dy) < offset.platterSize * DROP_REACH_RATIO) return flyToPlatter()

    await Promise.all([animate(x, 0, RETURN_SPRING), animate(y, 0, RETURN_SPRING), animate(scale, 1, RETURN_SPRING)])
    setIsLifted(false)
  }

  return (
    <div
      className={styles.discSlot}
      data-lifted={isLifted || isOnPlatter || undefined}
      data-unplayable={isUnplayable || undefined}
    >
      <motion.button
        ref={handleRef}
        type="button"
        className={styles.discHandle}
        style={{ x, y, scale, rotate, opacity: isOnPlatter ? 0 : isUnplayable ? UNPLAYABLE_OPACITY : 1 }}
        drag={!isUnplayable}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={() => (hasDraggedRef.current = false)}
        onTap={() => !hasDraggedRef.current && flyToPlatter()}
        disabled={isOnPlatter || isUnplayable}
        aria-label={
          isUnplayable ? `${record.title} is not available in your region` : `Play ${record.title} on the turntable`
        }
      >
        <VinylRecord coverUrl={record.cover} />
      </motion.button>
    </div>
  )
}
