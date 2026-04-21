import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Kwispelclub — Alles voor je beste vriend',
    template: '%s — Kwispelclub',
  },
  description: 'Kwispelclub is hét huisdierplatform voor België en Nederland. Premium producten, expert advies, hondenkapsalons en een warme community.',
  keywords: ['huisdieren', 'honden', 'katten', 'voeding', 'kapsalon', 'training', 'België', 'Nederland'],
  openGraph: {
    title: 'Kwispelclub — Alles voor je beste vriend',
    description: 'Hét huisdierplatform voor België en Nederland.',
    url: 'https://kwispelclub.be',
    siteName: 'Kwispelclub',
    type: 'website',
    locale: 'nl_BE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kwispelclub',
    description: 'Hét huisdierplatform voor België en Nederland.',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>",
  },
  metadataBase: new URL('https://kwispelclub.be'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
