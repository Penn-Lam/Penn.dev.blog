'use client'

import { Clock01Icon } from '@/components/icons'

export function NowTag({ projects }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="border-accent-100 from-accent-50 to-accent-100 relative overflow-hidden rounded-xl border bg-gradient-to-r p-6 shadow-sm">
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-accent-100 flex h-8 w-8 items-center justify-center rounded-full">
            <Clock01Icon className="text-accent-600 h-4 w-4" />
          </div>
          <span className="text-body-medium text-accent-600 tracking-wide uppercase">Currently Working On</span>
        </div>

        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className={index > 0 ? 'border-accent-100 border-t pt-4' : ''}>
              <h2 className="text-title-2-bold text-text-primary mb-2">{project.project}</h2>

              {project.description && <p className="text-text-secondary mb-3 max-w-2xl">{project.description}</p>}

              <div className="text-body-regular text-text-secondary flex items-center">
                <span>Since {formatDate(project.since)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="bg-accent-100/30 absolute top-0 right-0 h-32 w-32 translate-x-4 -translate-y-4 rounded-full" />
      <div className="bg-accent-100/40 absolute right-8 bottom-0 h-20 w-20 translate-y-4 rounded-full" />
    </div>
  )
}
