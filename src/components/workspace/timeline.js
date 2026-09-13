'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { ArrowDown01Icon, ArrowUp01Icon } from '@/components/icons'

export function Timeline({ entries }) {
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems)

    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }

    setExpandedItems(newExpanded)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'development':
        return 'bg-status-cyan-background text-status-cyan-text'
      case 'deployment':
        return 'bg-status-lime-background text-status-lime-text'
      case 'research':
        return 'bg-status-purple-background text-status-purple-text'
      case 'optimization':
        return 'bg-status-yellow-background text-status-yellow-text'
      case 'bugfix':
        return 'bg-status-rose-background text-status-rose-text'
      case 'enhancement':
        return 'bg-status-blue-background text-status-blue-text'
      case 'content':
        return 'bg-background-tertiary-default text-text-secondary'
      case 'documentation':
      default:
        return 'bg-background-secondary-default text-text-primary'
    }
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="bg-border-button-default absolute top-6 bottom-6 left-6 w-0.5" />

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const isExpanded = expandedItems.has(index)
          const hasDetails = entry.details && entry.details.trim().length > 0

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div className="border-background-primary-default bg-accent-500 absolute top-2 left-4 h-4 w-4 rounded-full border-4 shadow-sm" />

              <div className="border-separator-border bg-background-primary-default rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <time className="text-body-medium text-text-primary">{formatDate(entry.date)}</time>
                      {entry.category && (
                        <span
                          className={`text-caption-1-medium inline-flex rounded-full px-2 py-0.5 ${getCategoryColor(entry.category)}`}
                        >
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-text-primary font-semibold">{entry.title}</h3>
                  </div>

                  {hasDetails && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-text-placeholder hover:bg-background-secondary-default hover:text-text-secondary ml-2 flex h-6 w-6 items-center justify-center rounded-full"
                    >
                      {isExpanded ? <ArrowUp01Icon className="h-4 w-4" /> : <ArrowDown01Icon className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && hasDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 overflow-hidden"
                    >
                      <p className="text-body-regular text-text-secondary">{entry.details}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
