'use client'

import { Penflow } from 'penflow/react'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { SCROLL_AREA_ID } from '@/lib/constants'

export function PenflowSignature() {
  const [root, setRoot] = useState(null)
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    setRoot(document.getElementById(SCROLL_AREA_ID))
  }, [])

  const { ref, inView } = useInView({
    root,
    rootMargin: '0px',
    triggerOnce: false,
    fallbackInView: true
  })

  useEffect(() => {
    if (inView) {
      setPlayCount((count) => count + 1)
    }
  }, [inView])

  return (
    <section ref={ref} className="mt-14 pt-10">
      <div className="mx-auto flex max-w-xs justify-center">
        {inView ? (
          <Penflow
            key={playCount}
            text="Penn Lam"
            fontUrl="/fonts/BrittanySignature.ttf"
            color="#222222"
            size={32}
            lineHeight={1.1}
            speed={1}
            className="w-36 max-w-full"
          />
        ) : (
          <div className="h-12 w-36 max-w-full" />
        )}
      </div>
    </section>
  )
}
