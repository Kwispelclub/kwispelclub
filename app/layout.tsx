import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import KwispelChat from '@/components/KwispelChat'
import AnnounceBanner from '@/components/AnnounceBanner'

export const metadata: Metadata = {
  title: 'Kwispelclub — Voor elke baas & elk huisdier',
  description: 'Kwispelclub is het Belgische platform voor huisdiereigenaren. Shop, Academy, Kapsalons & 2de Hands marktplaats.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <AnnounceBanner />
        <Navbar />
        {children}
        <KwispelChat />
      </body>
    </html>
  )
}
