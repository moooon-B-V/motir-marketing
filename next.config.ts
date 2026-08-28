import type { NextConfig } from 'next'

// `output: 'standalone'` is not a preference here — it is what the host implies.
// `docs/decisions/marketing-site-hosting.md` (motir-core) Q1 puts motir.co on
// Fly as a long-running Node process built from a Dockerfile, the same shape
// motir-core uses. A static export would not serve from this image.
const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
