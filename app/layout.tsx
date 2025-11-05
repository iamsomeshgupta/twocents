import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Real-Time Order Book Visualizer',
  description: 'Live Binance order book and trades visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


