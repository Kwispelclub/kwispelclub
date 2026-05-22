import type { Metadata } from 'next'
import WinkelClient from './WinkelClient'

export const metadata: Metadata = {
  title: 'Webshop — Producten voor Honden & Katten',
  description: 'Ontdek producten voor jouw hond of kat van geverifieerde Belgische verkopers. Voeding, speelgoed, verzorging en meer.',
  keywords: ['hondenshop', 'kattenwinkel', 'huisdierproducten', 'België', 'dierenwinkel online'],
  openGraph: {
    title: 'Kwispelclub Webshop — Alles voor jouw Huisdier',
    description: 'Producten van Belgische verkopers voor honden en katten.',
    url: 'https://kwispelclub.be/winkel',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/winkel',
  },
}

export default function WinkelPage() {
  return <WinkelClient />
}
