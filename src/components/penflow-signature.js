'use client'

import { Penflow } from 'penflow/react'
import { useInView } from 'react-intersection-observer'

export function PenflowSignature() {
  const { ref, inView } = useInView({
    rootMargin: '0px 0px -15% 0px',
    triggerOnce: false
  })

  return (
    <section ref={ref} className="mt-14 border-t border-gray-200 pt-10">
      <div className="mx-auto flex max-w-xs justify-center">
        {inView ? (
          <Penflow
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
