'use client'

import { CldImage } from 'next-cloudinary'

export function DeskSetupImage() {
  return (
    <CldImage
      src="IMG_0282_kitech"
      alt="My Desk Setup"
      width={1200}
      height={750}
      quality="auto"
      format="auto"
      sizes="(max-width: 768px) 100vw, 800px"
      className="h-full w-full object-cover"
      crop="fill"
      gravity="center"
    />
  )
}
