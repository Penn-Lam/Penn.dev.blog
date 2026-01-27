'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 framer-motion 的 motion 组件
 * [OUTPUT]: 对外提供 PageEntrance 组件，页面入口动画包装器
 * [POS]: components/ 页面入口动画组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 页面入口动画策略:
// 1. Hero 元素 - 第一个出现，带有 scale 效果
// 2. 文本段落 - 依次 fade-in + slide-up
// 3. 章节标题 - 带底部边框划入效果
// 4. 列表内容 - stagger 动画
// ==========================================================================

// 容器变体 - 协调的 stagger 动画
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

// 单元素变体
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] // smooth quart easing
    }
  }
}

// Hero 变体 - 带有 scale 效果
const heroVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// 划入变体
const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// 边框线动画
const borderVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

/**
 * 页面入口容器 - 为子元素添加协调动画
 */
export const PageEntrance = memo(({ children, className, delay = 0 }) => {
  return (
    <motion.div
      className={cn('page-entrance', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  )
})
PageEntrance.displayName = 'PageEntrance'

/**
 * Hero 元素 - 第一眼看到的核心内容
 */
export const HeroEntrance = memo(({ children, className }) => {
  return (
    <motion.div className={cn('hero-entrance', className)} variants={heroVariants}>
      {children}
    </motion.div>
  )
})
HeroEntrance.displayName = 'HeroEntrance'

/**
 * 段落文本动画
 */
export const TextEntrance = memo(({ children, className, delay = 0 }) => {
  return (
    <motion.div
      className={cn('text-entrance', className)}
      variants={itemVariants}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  )
})
TextEntrance.displayName = 'TextEntrance'

/**
 * 标题动画 - 带底部边框划入
 */
export const TitleEntrance = memo(({ children, className, showBorder = false }) => {
  return (
    <motion.div className={cn('title-entrance relative', className)} variants={slideInVariants}>
      {children}
      {showBorder && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gray-900"
          variants={borderVariants}
        />
      )}
    </motion.div>
  )
})
TitleEntrance.displayName = 'TitleEntrance'

/**
 * 列表项 stagger 动画容器
 */
export const ListEntrance = memo(({ children, className, staggerDelay = 0.08 }) => {
  return (
    <motion.div
      className={cn('list-entance', className)}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
})
ListEntrance.displayName = 'ListEntrance'

/**
 * 单个列表项动画
 */
export const ListItemEntrance = memo(({ children, className }) => {
  return (
    <motion.div
      className={cn('list-item-entance', className)}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
})
ListItemEntrance.displayName = 'ListItemEntrance'

/**
 * 缩放进入效果 - 用于装饰性元素
 */
export const ScaleEntrance = memo(({ children, className, delay = 0, scale = 0.9 }) => {
  return (
    <motion.div
      className={cn('scale-entance', className)}
      variants={{
        hidden: { opacity: 0, scale },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  )
})
ScaleEntrance.displayName = 'ScaleEntrance'

/**
 * 淡入效果 - 最简单的基础动画
 */
export const FadeEntrance = memo(({ children, className, delay = 0, duration = 0.4 }) => {
  return (
    <motion.div
      className={cn('fade-entance', className)}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration,
            ease: 'easeOut',
            delay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
})
FadeEntrance.displayName = 'FadeEntrance'
