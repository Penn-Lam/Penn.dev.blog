'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Carousel as CarouselBase,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

export function Carousel({ images = [] }) {
  const [api, setApi] = useState()
  const [currentCaption, setCurrentCaption] = useState('')

  const memoizedOpts = useMemo(
    () => ({
      align: 'start',
      loop: true
    }),
    []
  )

  const handleSelect = useCallback(() => {
    if (!api) return
    const nextCaption = images[api.selectedScrollSnap()].title
    setCurrentCaption(nextCaption)
  }, [api, images])

  useEffect(() => {
    if (!api) return

    // Set initial caption
    const initialCaption = images[api.selectedScrollSnap()].title
    setCurrentCaption(initialCaption)

    // Subscribe to the select event with the debounced handler
    api.on('select', handleSelect)

    // Cleanup the event listener on unmount or when dependencies change
    return () => {
      if (typeof api.off === 'function') {
        api.off('select', handleSelect)
      }
    }
  }, [api, handleSelect, images])

  // Memoize the list of CarouselItem components
  const memoizedCarouselItems = useMemo(
    () =>
      images.map((imageItem, imageItemIndex) => (
        <CarouselItem key={`carousel_image_item-${imageItemIndex}`}>
          <div className="p-1">
            <div className="border-border-button-default bg-background-primary-default overflow-hidden rounded-xl border shadow-sm">
              <div className="flex aspect-square items-center justify-center p-0">
                <img
                  src={imageItem.url}
                  alt={imageItem.title}
                  loading="lazy"
                  className="aspect-square border-none object-cover"
                />
              </div>
            </div>
          </div>
        </CarouselItem>
      )),
    [images]
  )

  if (!Array.isArray(images) || !images.length) return null

  return (
    <>
      <CarouselBase setApi={setApi} opts={memoizedOpts} className="w-full">
        <CarouselContent>{memoizedCarouselItems}</CarouselContent>
        <CarouselPrevious className="bg-background-primary-default -left-2.5 @4xl/writing:-left-12" />
        <CarouselNext className="bg-background-primary-default -right-2.5 @4xl/writing:-right-12" />
      </CarouselBase>
      <div className="text-caption-1-regular text-text-tertiary py-2 text-center">{currentCaption}</div>
    </>
  )
}
