'use client'

import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { useVisualData } from '@/hooks/use-visual-data'

import { Gallery } from './gallery'
import { TabSelector } from './tab-selector'

const LightboxViewer = dynamic(() => import('./lightbox-viewer').then((module) => module.LightboxViewer), {
  ssr: false
})

function VisualError({ error }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-title-2-semibold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-text-secondary">{error}</p>
      </div>
    </div>
  )
}

function VisualResults({ isLoading, items, mediaType, sourceType, showAll, onItemClick }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary animate-pulse">Loading your visual works...</div>
      </div>
    )
  }

  if (items.length > 0) return <Gallery items={items} onItemClick={onItemClick} />

  const sourceLabel = sourceType === 'photography' ? 'photography' : 'AI-generated'
  const mediaLabel = mediaType === 'image' ? 'images' : 'videos'

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h3 className="text-title-3-medium text-text-primary mb-2">No content available</h3>
        <p className="text-text-secondary">
          {showAll ? 'No visual works available yet.' : `No ${sourceLabel} ${mediaLabel} available yet.`}
        </p>
      </div>
    </div>
  )
}

export function VisualExplorer() {
  const [mediaType, setMediaType] = useState('image')
  const [sourceType, setSourceType] = useState('photography')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const { data: visualData, isLoading, error } = useVisualData()

  const filteredData = showAll
    ? visualData || []
    : visualData?.filter((item) => item.mediaType === mediaType && item.sourceType === sourceType) || []

  const handleMediaClick = (media, index) => {
    setSelectedMedia({ ...media, index })
  }

  const closeLightbox = () => {
    setSelectedMedia(null)
  }

  const handleFilterChange = (filterState) => {
    setShowAll(filterState.showAll)

    if (!filterState.showAll) {
      setMediaType(filterState.mediaType)
      setSourceType(filterState.sourceType)
    }
  }

  if (error) {
    return <VisualError error={error} />
  }

  return (
    <div className="w-full">
      <TabSelector
        mediaType={mediaType}
        sourceType={sourceType}
        showAll={showAll}
        onFilterChange={handleFilterChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={showAll ? 'all' : `${mediaType}-${sourceType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <VisualResults
            isLoading={isLoading}
            items={filteredData}
            mediaType={mediaType}
            sourceType={sourceType}
            showAll={showAll}
            onItemClick={handleMediaClick}
          />
        </motion.div>
      </AnimatePresence>

      {selectedMedia ? (
        <LightboxViewer
          media={selectedMedia}
          allMedia={filteredData}
          onClose={closeLightbox}
          onNavigate={setSelectedMedia}
        />
      ) : null}
    </div>
  )
}
