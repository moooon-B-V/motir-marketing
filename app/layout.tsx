import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Motir',
  description:
    'The AI planning, project-management and agent orchestration platform.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
