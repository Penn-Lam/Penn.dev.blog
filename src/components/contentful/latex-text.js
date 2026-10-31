import { renderLatex } from '@/lib/latex'

export function LatexText({ text }) {
  return renderLatex(text).map((part, index) =>
    part.type === 'text' ? (
      part.text
    ) : (
      <span
        key={index}
        className={part.display ? 'block max-w-full overflow-x-auto py-2' : undefined}
        dangerouslySetInnerHTML={{ __html: part.html }}
      />
    )
  )
}
