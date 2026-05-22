import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact — Stel je Vraag aan Kwispelclub',
  description: 'Neem contact op met Kwispelclub. We antwoorden binnen 24 uur via e-mail of chat. Voor vragen over bestellingen, verkopers of kapsalons.',
  keywords: ['contact kwispelclub', 'klantenservice huisdieren', 'helpdesk kwispelclub'],
  openGraph: {
    title: 'Contact | Kwispelclub',
    description: 'Neem contact op met ons team. We antwoorden binnen 24 uur.',
    url: 'https://kwispelclub.be/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kwispelclub.be/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
