// lib/email.ts
// Gebruik deze helper overal in je app om e-mails te versturen

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kwispelclub.be'

async function sendEmail(type: string, to: string, data: Record<string, any>) {
  try {
    const res = await fetch(`${APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    return { success: true, id: result.id }
  } catch (err) {
    console.error(`Email fout (${type}):`, err)
    return { success: false, error: err }
  }
}

// ─── EXPORTEER ALLE EMAIL FUNCTIES ─────────────────────────────

export const sendWelcomeEmail = (to: string, firstName: string, role: string) =>
  sendEmail('welcome', to, { firstName, role })

export const sendKapsalonRegistratieEmail = (to: string, salonNaam: string, email: string) =>
  sendEmail('kapsalon_registratie', to, { salonNaam, email })

export const sendKapsalonGoedgekeurdEmail = (to: string, salonNaam: string) =>
  sendEmail('kapsalon_goedgekeurd', to, { salonNaam })

export const sendBoekingBevestigingEmail = (to: string, data: {
  ownerName: string; petName: string; petBreed: string
  salonNaam: string; salonLocatie: string
  dienst: string; datum: string; tijdslot: string; prijs: number
}) => sendEmail('boeking_bevestiging', to, data)

export const sendBestellingBevestigingEmail = (to: string, data: {
  firstName: string; orderNummer: string
  items: { naam: string; aantal: number; prijs: number }[]
  totaal: number; leveradres?: string
}) => sendEmail('bestelling_bevestiging', to, data)

export const sendWachtwoordResetEmail = (to: string, firstName: string, resetUrl: string) =>
  sendEmail('wachtwoord_reset', to, { firstName, resetUrl })

export const sendListingBevestigingEmail = (to: string, data: {
  firstName: string; titel: string; prijs: number; locatie: string
}) => sendEmail('listing_bevestiging', to, data)
