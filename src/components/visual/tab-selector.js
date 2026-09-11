'use client'

import { motion } from 'framer-motion'
import { CameraIcon, GridIcon, ImageIcon, SparklesIcon, VideoIcon } from 'lucide-react'

export function TabSelector({ mediaType, sourceType, showAll, onFilterChange }) {
  // 合并标签系统，提供更简洁的选项
  const filterOptions = [
    {
      value: 'all',
      label: 'All',
      icon: GridIcon,
      showAll: true
    },
    {
      value: 'photography-image',
      label: 'Photography',
      icon: CameraIcon,
      mediaType: 'image',
      sourceType: 'photography'
    },
    {
      value: 'aigc-image',
      label: 'AI Images',
      icon: SparklesIcon,
      mediaType: 'image',
      sourceType: 'aigc'
    },
    {
      value: 'photography-video',
      label: 'Video',
      icon: VideoIcon,
      mediaType: 'video',
      sourceType: 'photography'
    },
    {
      value: 'aigc-video',
      label: 'AI Video',
      icon: ImageIcon,
      mediaType: 'video',
      sourceType: 'aigc'
    }
  ]

  // 获取当前选中的过滤器
  const getCurrentFilter = () => {
    if (showAll) return 'all'
    return `${sourceType}-${mediaType}`
  }

  const currentFilter = getCurrentFilter()

  const handleFilterClick = (option) => {
    if (option.showAll) {
      onFilterChange({ showAll: true })
    } else {
      onFilterChange({
        showAll: false,
        mediaType: option.mediaType,
        sourceType: option.sourceType
      })
    }
  }

  return (
    <div className="mb-6">
      <div className="bg-background-secondary-default flex flex-wrap items-center gap-2 rounded-xl p-2">
        {filterOptions.map((option) => {
          const isActive = currentFilter === option.value
          const Icon = option.icon

          return (
            <button
              key={option.value}
              onClick={() => handleFilterClick(option)}
              className={`text-body-medium relative flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-200 ${
                isActive ? 'text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-filter-bg"
                  className="bg-background-primary-default absolute inset-0 rounded-lg shadow-sm"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    duration: 0.2
                  }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
