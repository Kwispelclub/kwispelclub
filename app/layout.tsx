import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://kwispelclub.be'),
  title: {
    default: 'Kwispelclub — Hondenshop, Kapsalons & Academy in België',
    template: '%s | Kwispelclub',
  },
  description: 'Kwispelclub is het Belgische platform voor huisdiereigenaren. Ontdek onze webshop, vind een hondenkapsalon bij jou in de buurt, en leer alles over de verzorging van je huisdier.',
  keywords: ['hondenshop België', 'hondenkapsalon', 'puppy training', 'huisdieren België', 'dierenwinkel', 'hond verzorging', 'kat verzorging'],
  authors: [{ name: 'Kwispelclub', url: 'https://kwispelclub.be' }],
  creator: 'Kwispelclub',
  publisher: 'Kwispelclub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    url: 'https://kwispelclub.be',
    siteName: 'Kwispelclub',
    title: 'Kwispelclub — Hondenshop, Kapsalons & Academy in België',
    description: 'Het Belgische platform voor huisdiereigenaren. Webshop, kapsalons, puppy training en meer.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kwispelclub — Voor jouw huisdier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kwispelclub — Hondenshop, Kapsalons & Academy in België',
    description: 'Het Belgische platform voor huisdiereigenaren.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://kwispelclub.be',
  },
  verification: {
    google: '', // Vul in na Google Search Console verificatie
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
