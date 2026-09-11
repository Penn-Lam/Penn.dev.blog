import { ShowInView } from '@/components/show-in-view'
import { cn } from '@/lib/utils'

export function Iframe({ embedUrl, title, className, ...rest }) {
  return (
    <ShowInView>
      <figure>
        <iframe
          src={embedUrl}
          title={title}
          allowFullScreen
          className={cn('w-full rounded-sm border-0 border-none shadow-lg', className)}
          {...rest}
        />
        <figcaption className="text-caption-1-regular text-text-tertiary mt-2 text-center break-words">
          {title}
        </figcaption>
      </figure>
    </ShowInView>
  )
}
