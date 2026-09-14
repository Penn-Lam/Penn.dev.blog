'use client'

import { motion } from 'framer-motion'
import { CldImage, getCldVideoUrl } from 'next-cloudinary'
import { useCallback, useEffect } from 'react'

import { CloseButton } from '@/components/base/buttons/close-button'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@/components/icons'
import { formatCapturedDate, formatUploadedDate } from '@/components/visual/format-media-date'

function getVideoUrl(media) {
  if (media.mediaType === 'video' && media.cloudinaryId) {
    return getCldVideoUrl({ src: media.cloudinaryId, quality: 'auto' })
  }

  return media.videoUrl || media.url
}

function NavigationButtons({ allMedia, onPrevious, onNext }) {
  if (!allMedia || allMedia.length <= 1) return null

  return (
    <>
      <button
        onClick={(event) => {
          event.stopPropagation()
          onPrevious()
        }}
        className="bg-background-primary-default/90 text-text-primary hover:bg-background-primary-default absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
      >
        <ArrowLeft01Icon className="h-6 w-6" />
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation()
          onNext()
        }}
        className="bg-background-primary-default/90 text-text-primary hover:bg-background-primary-default absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
      >
        <ArrowRight01Icon className="h-6 w-6" />
      </button>
    </>
  )
}

function LightboxMedia({ media, videoUrl }) {
  if (media.mediaType === 'video') {
    return (
      <video
        src={videoUrl}
        controls
        autoPlay
        className="max-h-full max-w-full rounded-lg"
        onError={(event) => {
          console.error('Video load error:', event)
          console.info('Trying to load video from:', videoUrl)
        }}
      />
    )
  }

  if (media.cloudinaryId) {
    return (
      <CldImage
        src={media.cloudinaryId}
        alt={media.title || 'Image'}
        width={1200}
        height={800}
        quality="auto"
        format="auto"
        className="max-h-full max-w-full rounded-lg object-contain"
      />
    )
  }

  return (
    <img
      src={media.imageUrl}
      alt={media.title || 'Image'}
      className="max-h-full max-w-full rounded-lg object-contain"
    />
  )
}

function MediaInfo({ media }) {
  const isVideo = media.mediaType === 'video'

  return (
    <div className="bg-background-primary-default/90 text-text-primary absolute right-4 bottom-4 left-4 rounded-lg p-4 shadow-lg">
      <h2 className="text-title-3-semibold text-text-primary mb-2">{media.title || 'Untitled'}</h2>

      {media.description && <p className="text-body-regular text-text-secondary mb-3">{media.description}</p>}

      <div className="text-body-regular text-text-secondary flex flex-wrap items-center gap-4">
        {isVideo && media.duration && <span>Duration: {Math.round(media.duration)}s</span>}
        {media.camera && <span>Camera: {media.camera}</span>}
        {media.location && <span>Location: {media.location}</span>}
        {media.capturedAt && <span>Captured: {formatCapturedDate(media.capturedAt)}</span>}
        {media.timestamp && !media.capturedAt && <span>Uploaded: {formatUploadedDate(media.timestamp)}</span>}
      </div>

      {media.tags && media.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.tags.map((tag) => (
            <span
              key={tag}
              className="bg-background-tertiary-default text-caption-1-regular text-text-secondary rounded-full px-3 py-1"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function LightboxViewer({ media, allMedia, onClose, onNavigate }) {
  const navigatePrevious = useCallback(() => {
    if (!media || !allMedia) return
    const currentIndex = allMedia.findIndex((item) => item.id === media.id)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : allMedia.length - 1
    onNavigate({ ...allMedia[previousIndex], index: previousIndex })
  }, [media, allMedia, onNavigate])

  const navigateNext = useCallback(() => {
    if (!media || !allMedia) return
    const currentIndex = allMedia.findIndex((item) => item.id === media.id)
    const nextIndex = currentIndex < allMedia.length - 1 ? currentIndex + 1 : 0
    onNavigate({ ...allMedia[nextIndex], index: nextIndex })
  }, [media, allMedia, onNavigate])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        navigatePrevious()
      } else if (e.key === 'ArrowRight') {
        navigateNext()
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onClose, navigateNext, navigatePrevious])

  const videoUrl = getVideoUrl(media)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-background-primary-default/95 fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <CloseButton size="md" aria-label="Close" onClick={onClose} className="absolute top-4 right-4 z-10 shadow-lg" />

      <NavigationButtons allMedia={allMedia} onPrevious={navigatePrevious} onNext={navigateNext} />

      {/* Media Content */}
      <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <LightboxMedia media={media} videoUrl={videoUrl} />
      </div>

      <MediaInfo media={media} />
    </motion.div>
  )
}
