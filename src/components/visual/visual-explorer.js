'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { useVisualData } from '@/hooks/use-visual-data'

import { Gallery } from './gallery'
import { LightboxViewer } from './lightbox-viewer'
import { TabSelector } from './tab-selector'

export function VisualExplorer() {
  const [mediaType, setMediaType] = useState('image')
  const [sourceType, setSourceType] = useState('photography')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const { data: visualData, isLoading, error } = useVisualData()

  const filteredData = showAll
    ? visualData || []
    : visualData?.filter((item) => item.mediaType === mediaType && item.sourceType === sourceType) || []

  const handleMediaClick = (media, index) => {
    setSelectedMedia({ ...media, index })
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
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
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-title-2-semibold text-text-primary mb-2">Something went wrong</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    )
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-text-secondary animate-pulse">Loading your visual works...</div>
            </div>
          ) : filteredData.length > 0 ? (
            <Gallery items={filteredData} onItemClick={handleMediaClick} />
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h3 className="text-title-3-medium text-text-primary mb-2">No content available</h3>
                <p className="text-text-secondary">
                  {showAll
                    ? 'No visual works available yet.'
                    : `No ${sourceType === 'photography' ? 'photography' : 'AI-generated'} ${
                        mediaType === 'image' ? 'images' : 'videos'
                      } available yet.`}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <LightboxViewer
        isOpen={isLightboxOpen}
        media={selectedMedia}
        allMedia={filteredData}
        onClose={closeLightbox}
        onNavigate={setSelectedMedia}
      />
    </div>
  )
}
