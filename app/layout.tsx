import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import KwispelChat from '@/components/KwispelChat'
import AnnounceBanner from '@/components/AnnounceBanner'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Kwispelclub — Voor elke baas & elk huisdier',
  description: 'Kwispelclub is het Belgische platform voor huisdiereigenaren. Shop, Academy, Kapsalons & 2de Hands marktplaats.',
  openGraph: {
    title: 'Kwispelclub — Voor elke baas & elk huisdier',
    description: 'Voor elke baas & elk huisdier 🐾',
    url: 'https://www.kwispelclub.be',
    siteName: 'Kwispelclub',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AnnounceBanner />
        <Navbar />
        {children}
        <KwispelChat />
        <CookieBanner />
      </body>
    </html>
  )
}