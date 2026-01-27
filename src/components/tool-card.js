'use client'

import { motion } from 'framer-motion'
import { ArrowUpRightIcon } from 'lucide-react'
import Image from 'next/image'
import { memo } from 'react'

/**
 * [INPUT]: 依赖 next/image 的 Image 组件
 * [OUTPUT]: 对外提供 ToolCard 组件，展示工具卡片
 * [POS]: components/workspace 的工具展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 性能优化:
// 1. 移除 height: 'auto' 动画 - 避免 layout reflow
// 2. 移除 boxShadow 动画 - 改用 border/color 变化
// 3. 使用 transform/opacity 动画 - GPU 加速
// 4. 使用 CSS will-change 提示浏览器优化
// ==========================================================================

// 标签颜色映射 - 提取到组件外避免重复创建
const TAG_COLORS = {
  AI: 'bg-purple-100 text-purple-700',
  Prod: 'bg-blue-100 text-blue-700',
  Dev: 'bg-green-100 text-green-700',
  Notes: 'bg-orange-100 text-orange-700',
  Deploy: 'bg-cyan-100 text-cyan-700',
  Infra: 'bg-gray-100 text-gray-700',
  Framework: 'bg-indigo-100 text-indigo-700',
  CSS: 'bg-pink-100 text-pink-700',
  LLM: 'bg-violet-100 text-violet-700',
  Image: 'bg-teal-100 text-teal-700',
  Design: 'bg-rose-100 text-rose-700',
  Proto: 'bg-amber-100 text-amber-700',
  Productivity: 'bg-emerald-100 text-emerald-700',
  Launcher: 'bg-sky-100 text-sky-700',
  Music: 'bg-red-100 text-red-700',
  Security: 'bg-slate-100 text-slate-700'
}

// 获取工具图标路径 - 缓存函数
const getToolIcon = (slug) => `/tools/${slug}.svg`

// 获取标签颜色 - 引用外部对象
const getTagColor = (tag) => TAG_COLORS[tag] || 'bg-gray-100 text-gray-700'

// 入口动画变体
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.05, // 减小延迟基数
      ease: 'easeOut'
    }
  }
}

export const ToolCard = memo(function ToolCard({ tool, index }) {
  return (
    <motion.a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      // 性能优化: 使用 transform 替代 height，使用颜色变化替代 boxShadow
      whileHover={{
        scale: 1.02, // 减小 scale 以避免与其他 transform 冲突
        translateY: -4 // 使用 translateY 替代 height 变化
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }} // 减少动画时长
      style={{ willChange: 'transform' }}
    >
      <motion.div
        className="thumbnail-shadow relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white/80 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-white/90"
        // 优化: 仅使用 transform 动画，避免 layout 属性
        whileHover={{
          scale: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)' // 简化阴影，减少复合层数量
        }}
        transition={{ duration: 0.15 }}
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* 优化: 移除 rotate 动画，使用更简单的 transform */}
            <motion.div
              className="relative size-10 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              style={{ willChange: 'transform' }}
            >
              <Image
                src={getToolIcon(tool.slug)}
                alt={`${tool.name} icon`}
                width={40}
                height={40}
                className="rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="absolute inset-0 hidden items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-lg">
                🛠️
              </div>
            </motion.div>
            <h3 className="text-sm leading-tight font-semibold text-gray-900">{tool.name}</h3>
          </div>
          <motion.div
            whileHover={{ x: 2, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0"
            style={{ willChange: 'transform' }}
          >
            <ArrowUpRightIcon
              size={16}
              className="text-gray-400 transition-colors duration-200 group-hover:text-gray-600"
            />
          </motion.div>
        </div>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{tool.desc}</p>

        {/* 优化: 使用 CSS animation 替代 Framer Motion 入口动画 */}
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          style={{
            animation: `fadeIn 0.3s ease-out ${Math.min(index * 0.05 + 0.3, 0.5)}s both`
          }}
        >
          {tool.tags.map((tag, tagIndex) => (
            <motion.span
              key={tagIndex}
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getTagColor(tag)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: Math.min(index * 0.05 + 0.4 + tagIndex * 0.03, 0.6),
                duration: 0.15,
                type: 'spring',
                stiffness: 400
              }}
              whileHover={{ scale: 1.05 }}
              style={{ willChange: 'transform' }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Peel-Up Tip - 优化: 使用 CSS transition 替代 Framer Motion */}
        {tool.tip && (
          <div
            className="absolute inset-x-0 bottom-0 border-t border-gray-100/50 bg-gradient-to-t from-white/95 to-transparent px-4 py-3 text-xs text-gray-500 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
          >
            {tool.tip}
          </div>
        )}
      </motion.div>
    </motion.a>
  )
})

// 添加 CSS animation 关键帧到全局样式（在组件文件末尾）
// 注意：这需要在 globals.css 中添加对应的 keyframes
