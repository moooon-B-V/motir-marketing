import type { MetadataRoute } from 'next'

// A placeholder that keeps the scaffold OUT of the index while it says nothing.
// MOTIR-1154 (8.3.7) owns the real robots/sitemap/JSON-LD entity signal and
// replaces this wholesale — including flipping `disallow` off.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
