import type { Metadata } from 'next'
import TweedeHandsClient from './TweedeHandsClient'

export const metadata: Metadata = {
  title: '2de Hands Huisdierproducten — Duurzaam & Goedkoop',
  description: 'Koop en verkoop tweedehands huisdierproducten in België. Duurzaam shoppen voor jouw hond of kat tegen eerlijke prijzen.',
  keywords: ['tweedehands huisdierproducten', '2de hands hond', 'gebruikt dierenmateriaal', 'duurzaam huisdieren', 'marktplaats hond België'],
  openGraph: {
    title: 'Kwispelclub 2de Hands — Duurzame Huisdierproducten',
    description: 'Koop en verkoop tweedehands producten voor honden en katten.',
    url: 'https://kwispelclub.be/2dehands',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/2dehands',
  },
}

export default function TweedeHandsPage() {
  return <TweedeHandsClient />
}
