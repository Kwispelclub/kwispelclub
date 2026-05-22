import type { Metadata } from 'next'
import OverOnsClient from './OverOnsClient'

export const metadata: Metadata = {
  title: 'Over Ons — Het Verhaal van Kwispelclub',
  description: 'Kwispelclub is het Belgische platform voor huisdiereigenaren, gebouwd met passie in Limburg. Ontdek ons verhaal, ons team en onze waarden.',
  keywords: ['over kwispelclub', 'belgisch huisdierenplatform', 'kwispelclub team', 'huisdieren community België'],
  openGraph: {
    title: 'Over Kwispelclub — Gebouwd met Passie voor Huisdieren',
    description: 'Het verhaal achter het Belgische huisdierenplatform. Ontdek ons team en onze missie.',
    url: 'https://kwispelclub.be/over-ons',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/over-ons',
  },
}

export default function OverOnsPage() {
  return <OverOnsClient />
}
