import type { Metadata } from 'next'
import KapsalonsClient from './KapsalonsClient'

export const metadata: Metadata = {
  title: 'Hondenkapsalons in België — Boek een Afspraak',
  description: 'Vind een erkend hondenkapsalon bij jou in de buurt. Bekijk foto\'s, diensten en prijzen. Boek direct online via Kwispelclub.',
  keywords: ['hondenkapsalon', 'trimsalon hond', 'hond knippen België', 'hondenverzorging', 'trimsalon België'],
  openGraph: {
    title: 'Hondenkapsalons in België | Kwispelclub',
    description: 'Vind en boek een hondenkapsalon bij jou in de buurt.',
    url: 'https://kwispelclub.be/kapsalons',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/kapsalons',
  },
}

export default function KapsalonsPage() {
  return <KapsalonsClient />
}
