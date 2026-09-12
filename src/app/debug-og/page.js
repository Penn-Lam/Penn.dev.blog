import { sharedMetadata } from '@/app/shared-metadata'

export default function DebugOG() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pennlam.com'

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-title-1-bold mb-6">Open Graph Debug Information</h1>

      <div className="grid gap-6">
        <div className="bg-background-secondary-default rounded-lg p-4">
          <h2 className="text-title-3-semibold mb-3">Current Configuration</h2>
          <div className="text-body-regular space-y-2">
            <p>
              <strong>Site URL:</strong> {siteUrl}
            </p>
            <p>
              <strong>Title:</strong> {sharedMetadata.title}
            </p>
            <p>
              <strong>Description:</strong> {sharedMetadata.description}
            </p>
            <p>
              <strong>OG Image Size:</strong> {sharedMetadata.ogImage.width}x{sharedMetadata.ogImage.height}
            </p>
          </div>
        </div>

        <div className="bg-accent-50 rounded-lg p-4">
          <h2 className="text-title-3-semibold mb-3">Generated URLs</h2>
          <div className="text-body-regular space-y-2 break-all">
            <p>
              <strong>OG Image URL:</strong> {siteUrl}/opengraph-image
            </p>
            <p>
              <strong>Visual OG Image:</strong> {siteUrl}/visual/opengraph-image
            </p>
          </div>
        </div>

        <div className="bg-status-lime-background rounded-lg p-4">
          <h2 className="text-title-3-semibold mb-3">Test Tools</h2>
          <div className="space-y-2">
            <a
              href={`https://cards-dev.twitter.com/validator?url=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-500 text-text-white hover:bg-accent-600 inline-block rounded px-4 py-2"
            >
              Test with Twitter Card Validator
            </a>
            <br />
            <a
              href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-500 text-text-white hover:bg-accent-600 inline-block rounded px-4 py-2"
            >
              Test with Facebook Debugger
            </a>
          </div>
        </div>

        <div className="bg-status-yellow-background rounded-lg p-4">
          <h2 className="text-title-3-semibold mb-3">Preview</h2>
          <img src="/opengraph-image" alt="OG Image Preview" className="max-w-md rounded border" />
        </div>
      </div>
    </div>
  )
}
