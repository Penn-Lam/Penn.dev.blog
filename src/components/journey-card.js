import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { memo } from 'react'

export const JourneyCard = memo(({ title, description, image, index }) => {
  return (
    <div className="word-break-word flex flex-col">
      <span className="mb-px font-semibold tracking-tight">{title}</span>
      {description?.json && (
        <div className="text-sm rich-text-journey">{documentToReactComponents(description.json)}</div>
      )}
      {image?.url && (
        <div className="mt-2.5 overflow-hidden rounded-xl bg-white">
          <img
            src={image.url}
            alt={image.title || image.description}
            width={image.width}
            height={image.height}
            loading={index < 1 ? 'eager' : 'lazy'}
            className="animate-reveal"
            // eslint-disable-next-line react/no-unknown-property
            nopin="nopin"
          />
        </div>
      )}
    </div>
  )
})
JourneyCard.displayName = 'JourneyCard'
