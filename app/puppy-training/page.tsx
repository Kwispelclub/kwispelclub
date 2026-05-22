import type { Metadata } from 'next'
import PuppyTrainingClient from './PuppyTrainingClient'

export const metadata: Metadata = {
  title: 'Puppy Training & Academy — Leer je Hond op te Voeden',
  description: 'Professionele cursussen voor puppy training, gedragsproblemen en hondenverzorging. Van erkende trainers in België en Nederland.',
  keywords: ['puppy training België', 'hond opvoeden', 'hondentraining cursus', 'gedragsproblemen hond', 'hondenschool online'],
  openGraph: {
    title: 'Kwispelclub Academy — Puppy Training & Hondencursussen',
    description: 'Leer alles over de opvoeding en verzorging van je huisdier van erkende trainers.',
    url: 'https://kwispelclub.be/puppy-training',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/puppy-training',
  },
}

export default function PuppyTrainingPage() {
  return <PuppyTrainingClient />
}
