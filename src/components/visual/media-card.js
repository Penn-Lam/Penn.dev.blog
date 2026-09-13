'use client'

import { motion } from 'framer-motion'
import { CldImage } from 'next-cloudinary'

import { EyeIcon, HeartIcon, PlayIcon, Share01Icon } from '@/components/icons'

const PREVIEW_WIDTH = 400

function getAspectRatio(item) {
  return (
    item.originalResource?.aspect_ratio ||
    item.aspect_ratio ||
    (item.originalResource?.width && item.originalResource?.height
      ? item.originalResource.width / item.originalResource.height
      : 1.33)
  )
}

function getThumbnailUrl(item, height) {
  if (item.mediaType !== 'video' || !item.cloudinaryId) return null

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dirgr1bkc'
  const transformations = `w_${PREVIEW_WIDTH},h_${height},c_fill,q_auto,f_jpg,so_0s`

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${item.cloudinaryId}.jpg`
}

function MediaPreview({ item, height, thumbnailUrl }) {
  if (item.mediaType === 'video') {
    return (
      <div className="relative" style={{ height: `${height}px` }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${item.sourceType} ${item.mediaType}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(event) => {
              console.error('Video thumbnail failed to load:', thumbnailUrl)
              event.currentTarget.style.display = 'none'
              const fallback = event.currentTarget.nextElementSibling

              if (fallback instanceof HTMLElement) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="bg-background-secondary-default absolute inset-0 flex items-center justify-center"
          style={{ display: thumbnailUrl ? 'none' : 'flex' }}
        >
          <div className="text-text-secondary text-center">
            <PlayIcon className="mx-auto mb-2 h-12 w-12" />
            <span className="text-body-regular">Video</span>
          </div>
        </div>
      </div>
    )
  }

  if (item.cloudinaryId) {
    return (
      <CldImage
        src={item.cloudinaryId}
        alt={`${item.sourceType} ${item.mediaType}`}
        width={PREVIEW_WIDTH}
        height={height}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        crop="fill"
        quality="auto"
        format="auto"
        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        priority={false}
      />
    )
  }

  return (
    <img
      src={item.imageUrl}
      alt={`${item.sourceType} ${item.mediaType}`}
      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      style={{ height: `${height}px` }}
      loading="lazy"
    />
  )
}

function MediaActions({ isHovered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-4 right-4 flex gap-2"
    >
      <span className="bg-background-primary-default/90 text-text-secondary hover:bg-background-primary-default rounded-full p-2 backdrop-blur-sm transition-[background-color,transform] hover:scale-110">
        <HeartIcon className="h-4 w-4" />
      </span>
      <span className="bg-background-primary-default/90 text-text-secondary hover:bg-background-primary-default rounded-full p-2 backdrop-blur-sm transition-[background-color,transform] hover:scale-110">
        <Share01Icon className="h-4 w-4" />
      </span>
      <span className="bg-background-primary-default/90 text-text-secondary hover:bg-background-primary-default rounded-full p-2 backdrop-blur-sm transition-[background-color,transform] hover:scale-110">
        <EyeIcon className="h-4 w-4" />
      </span>
    </motion.div>
  )
}

function MediaStats({ item, isHovered }) {
  if (!item.likes && !item.views) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-3 left-3 flex items-center gap-3 text-white"
    >
      {item.likes && (
        <div className="text-caption-1-regular flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-sm">
          <HeartIcon className="h-3 w-3" />
          <span>{item.likes}</span>
        </div>
      )}
      {item.views && (
        <div className="text-caption-1-regular flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-sm">
          <EyeIcon className="h-3 w-3" />
          <span>{item.views}</span>
        </div>
      )}
    </motion.div>
  )
}

export function MediaCard({ item, isHovered, onClick }) {
  const calculatedHeight = Math.round(PREVIEW_WIDTH / getAspectRatio(item))
  const thumbnailUrl = getThumbnailUrl(item, calculatedHeight)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title || `${item.sourceType} ${item.mediaType}`}`}
      className="bg-background-primary-default group relative cursor-pointer overflow-hidden rounded shadow-sm transition-shadow duration-300 hover:shadow-lg"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {/* Main Image/Video */}
      <div className="relative">
        <MediaPreview item={item} height={calculatedHeight} thumbnailUrl={thumbnailUrl} />

        {item.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/70 p-4 backdrop-blur-sm">
              <PlayIcon className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
        )}

        <MediaActions isHovered={isHovered} />
        <MediaStats item={item} isHovered={isHovered} />
      </div>
    </div>
  )
}
