'use client'

import { createContext } from 'react'

export type InputSize = 'medium' | 'small'

export interface TextFieldContextValue {
  size?: InputSize
  fieldClassName?: string
  inputClassName?: string
}

export const TextFieldContext = createContext<TextFieldContextValue>({})
