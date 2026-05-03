import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Kwispelclub <noreply@kwispelclub.be>'
// ✅ Gebruik NEXT_PUBLIC_SITE_URL als primaire, APP_URL als fallback
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://kwispelclub.be'

// ─── E-MAIL TEMPLATES ─────────────────────────────────────────

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwispelclub</title>
</head>
<body style="margin:0;padding:0;background:#FFF9F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2C2C2C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#2D5A27,#4A7C3F);border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">🐾</div>
          <div style="font-family:'Helvetica Neue',sans-serif;font-size:26px;font-weight:700;color:white;letter-spacing:.5px;">Kwispelclub</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Voor elke baas & elk huisdier</div>
        </td></tr>
        <tr><td style="background:white;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 4px 20px rgba(0,0,0,.08);">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="font-size:12px;color:#8A8A8A;line-height:1.6;">
            © 2026 Kwispelclub · Bree, Limburg, België<br>
            <a href="${APP_URL}/privacy" style="color:#4A7C3F;text-decoration:none;">Privacy</a> ·
            <a href="${APP_URL}/contact" style="color:#4A7C3F;text-decoration:none;">Contact</a> ·
            <a href="${APP_URL}/account" style="color:#4A7C3F;text-decoration:none;">Mijn Account</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#4A7C3F;color:white;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none;margin:20px 0;">${text}</a>`
}
function h1(text: string) {
  return `<h1 style="font-size:26px;font-weight:700;color:#2D5A27;margin:0 0 12px;font-family:'Helvetica Neue',sans-serif;">${text}</h1>`
}
function p(text: string) {
  return `<p style="font-size:15px;line-height:1.7;color:#5A5A5A;margin:0 0 14px;">${text}</p>`
}
function infoBox(rows: [string, string][]) {
  const cells = rows.map(([label, val]) => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#8A8A8A;width:140px;border-bottom:1px solid #F5EDE0;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #F5EDE0;">${val}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9F0;border-radius:12px;margin:20px 0;overflow:hidden;">${cells}</table>`
}

function welcomeEmail(firstName: string, role: string) {
  const roleLabels: Record<string, string> = { koper: 'Koper', verkoper: 'Verkoper', kapsalon: 'Kapsalon' }
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🎉</div>
      ${h1(`Welkom bij Kwispelclub, ${firstName}!`)}
      ${p('Je account is aangemaakt. We zijn blij je erbij te hebben in onze groeiende community van huisdiereigenaren in België en Nederland.')}
    </div>
    ${infoBox([['Account type', roleLabels[role] || 'Lid'], ['Platform', 'kwispelclub.be'], ['Status', '✅ Actief']])}
    ${p('Kwispelclub is momenteel in opbouw. Als early member word je als eerste op de hoogte gebracht wanneer de webshop, boekingen en community live gaan.')}
    <div style="text-align:center;">${btn('Bekijk je account →', `${APP_URL}/account`)}</div>
    <hr style="border:none;border-top:1px solid #F5EDE0;margin:28px 0;">
    ${p('Vragen? Stuur ons een berichtje via <a href="mailto:info@kwispelclub.be" style="color:#4A7C3F;">info@kwispelclub.be</a> of gebruik onze chatbot Kwispel op de website.')}
  `
  return { subject: `Welkom bij Kwispelclub, ${firstName}! 🐾`, html: baseTemplate(content) }
}

function kapsalonRegistratieEmail(salonNaam: string, email: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">✂️</div>
      ${h1('Aanvraag ontvangen!')}
      ${p(`We hebben de registratieaanvraag voor <strong>${salonNaam}</strong> ontvangen. We beoordelen je aanvraag en nemen binnen 2 werkdagen contact op.`)}
    </div>
    ${infoBox([['Salon', salonNaam], ['E-mail', email], ['Status', '⏳ In behandeling'], ['Verwachte reactie', 'Binnen 2 werkdagen']])}
    ${p('Na goedkeuring ontvang je een bevestigingsmail met instructies om je salonprofiel volledig in te stellen.')}
    <div style="background:#E8F0E4;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="font-size:14px;color:#2D5A27;font-weight:700;margin:0 0 8px;">✅ Wat je kunt verwachten:</p>
      <ul style="font-size:14px;color:#5A5A5A;line-height:1.8;margin:0;padding-left:20px;">
        <li>Online boekingssysteem</li><li>Klantreviews & ratings</li>
        <li>Bereik duizenden diereneigenaren</li><li>Eerste 3 maanden gratis</li>
      </ul>
    </div>
    <div style="text-align:center;">${btn('Bekijk je aanvraagstatus →', `${APP_URL}/account`)}</div>
  `
  return { subject: `Aanvraag ontvangen — ${salonNaam} 🐾`, html: baseTemplate(content) }
}

function kapsalonGoedgekeurdEmail(salonNaam: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🎊</div>
      ${h1('Je salon is goedgekeurd!')}
      ${p(`Geweldig nieuws! <strong>${salonNaam}</strong> is goedgekeurd en staat nu live op Kwispelclub.`)}
    </div>
    ${infoBox([['Salon', salonNaam], ['Status', '✅ Geverifieerd & Actief'], ['Zichtbaar op', 'kwispelclub.be/kapsalons']])}
    ${p('Diereneigenaren in jouw regio kunnen je salon nu vinden, je diensten bekijken en een afspraak boeken.')}
    <div style="text-align:center;">${btn('Bekijk je salonprofiel →', `${APP_URL}/kapsalons`)}</div>
    <hr style="border:none;border-top:1px solid #F5EDE0;margin:28px 0;">
    ${p('Wil je je profiel uitbreiden met foto\'s, diensten en tarieven? Ga naar je account en klik op "Salonbeheer".')}
  `
  return { subject: `✅ ${salonNaam} is live op Kwispelclub!`, html: baseTemplate(content) }
}

function boekingBevestigingEmail(data: {
  ownerName: string; petName: string; petBreed: string
  salonNaam: string; salonLocatie: string
  dienst: string; datum: string; tijdslot: string; prijs: number
}) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">📅</div>
      ${h1('Afspraak bevestigd!')}
      ${p(`Hoi ${data.ownerName}, je afspraak bij <strong>${data.salonNaam}</strong> is bevestigd.`)}
    </div>
    ${infoBox([
      ['Salon', data.salonNaam], ['Locatie', data.salonLocatie], ['Dienst', data.dienst],
      ['Datum', data.datum], ['Tijdslot', data.tijdslot],
      ['Huisdier', `${data.petName} (${data.petBreed})`], ['Prijs', `€${data.prijs.toFixed(2)}`],
    ])}
    <div style="background:#FFF3E0;border-radius:12px;padding:16px 20px;margin:20px 0;font-size:13px;color:#5C3D2E;font-weight:600;">
      ℹ️ Annuleren kan kosteloos tot 24 uur voor de afspraak. Neem contact op met het salon.
    </div>
    <div style="text-align:center;">${btn('Bekijk mijn afspraken →', `${APP_URL}/account`)}</div>
  `
  return { subject: `📅 Afspraak bevestigd — ${data.salonNaam} op ${data.datum}`, html: baseTemplate(content) }
}

function bestellingBevestigingEmail(data: {
  firstName: string; orderNummer: string
  items: { naam: string; aantal: number; prijs: number }[]
  totaal: number; leveradres?: string
}) {
  const itemRows: [string, string][] = data.items.map(i => [`${i.aantal}x ${i.naam}`, `€${(i.aantal * i.prijs).toFixed(2)}`])
  itemRows.push(['Totaal', `€${data.totaal.toFixed(2)}`])
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">📦</div>
      ${h1(`Bestelling ontvangen, ${data.firstName}!`)}
      ${p('Bedankt voor je bestelling. We verwerken je order zo snel mogelijk.')}
    </div>
    ${infoBox([['Order #', data.orderNummer], ['Status', '⏳ In behandeling'], ...(data.leveradres ? [['Leveradres', data.leveradres] as [string, string]] : [])])}
    <p style="font-size:14px;font-weight:700;color:#2D5A27;margin:20px 0 8px;">Bestelde producten:</p>
    ${infoBox(itemRows)}
    <div style="text-align:center;">${btn('Volg je bestelling →', `${APP_URL}/account`)}</div>
    <hr style="border:none;border-top:1px solid #F5EDE0;margin:28px 0;">
    ${p('Vragen over je bestelling? Neem contact op via <a href="mailto:info@kwispelclub.be" style="color:#4A7C3F;">info@kwispelclub.be</a>')}
  `
  return { subject: `📦 Bestelling #${data.orderNummer} ontvangen — Kwispelclub`, html: baseTemplate(content) }
}

function wachtwoordResetEmail(firstName: string, resetUrl: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🔑</div>
      ${h1('Wachtwoord resetten')}
      ${p(`Hoi ${firstName}, we hebben een verzoek ontvangen om je wachtwoord te resetten.`)}
    </div>
    ${p('Klik op de knop hieronder om een nieuw wachtwoord in te stellen. Deze link is 1 uur geldig.')}
    <div style="text-align:center;">${btn('Nieuw wachtwoord instellen →', resetUrl)}</div>
    <div style="background:#FFF0F0;border-radius:12px;padding:16px 20px;margin:20px 0;font-size:13px;color:#E84E4E;font-weight:600;">
      ⚠️ Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren. Je wachtwoord blijft ongewijzigd.
    </div>
  `
  return { subject: '🔑 Wachtwoord resetten — Kwispelclub', html: baseTemplate(content) }
}

function listingBevestigingEmail(data: { firstName: string; titel: string; prijs: number; locatie: string }) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">♻️</div>
      ${h1('Advertentie geplaatst!')}
      ${p(`Je 2de Hands advertentie staat live op Kwispelclub, ${data.firstName}!`)}
    </div>
    ${infoBox([['Product', data.titel], ['Vraagprijs', `€${data.prijs.toFixed(2)}`], ['Locatie', data.locatie], ['Status', '✅ Actief']])}
    ${p('Andere baasjes kunnen je advertentie nu zien en contact opnemen. We laten je weten als iemand reageert.')}
    <div style="text-align:center;">${btn('Bekijk mijn advertentie →', `${APP_URL}/2dehands`)}</div>
  `
  return { subject: `♻️ Advertentie "${data.titel}" is live!`, html: baseTemplate(content) }
}

// ✅ NIEUW: cursus aankoop bevestiging (werd gebruikt in cursus-webhook maar ontbrak hier)
function cursusAankoopEmail(data: { cursusTitel: string; cursusId: string }) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🎓</div>
      ${h1('Cursus gekocht!')}
      ${p(`Je hebt toegang tot <strong>${data.cursusTitel}</strong>. Veel leerplezier!`)}
    </div>
    ${infoBox([['Cursus', data.cursusTitel], ['Status', '✅ Toegang verleend'], ['Platform', 'kwispelclub.be/academy']])}
    ${p('Je kunt de cursus starten via je account of direct via de knop hieronder.')}
    <div style="text-align:center;">${btn('Start de cursus →', `${APP_URL}/cursus/${data.cursusId}`)}</div>
    <hr style="border:none;border-top:1px solid #F5EDE0;margin:28px 0;">
    ${p('Vragen? Stuur ons een berichtje via <a href="mailto:info@kwispelclub.be" style="color:#4A7C3F;">info@kwispelclub.be</a>')}
  `
  return { subject: `🎓 Cursus "${data.cursusTitel}" gekocht — Kwispelclub`, html: baseTemplate(content) }
}

// ─── API ROUTE HANDLER ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json({ error: 'type en to zijn verplicht' }, { status: 400 })
    }

    let emailContent: { subject: string; html: string } | null = null

    switch (type) {
      case 'welcome':
        emailContent = welcomeEmail(data.firstName, data.role)
        break
      case 'kapsalon_registratie':
        emailContent = kapsalonRegistratieEmail(data.salonNaam, data.email)
        break
      case 'kapsalon_goedgekeurd':
        emailContent = kapsalonGoedgekeurdEmail(data.salonNaam)
        break
      case 'boeking_bevestiging':
        emailContent = boekingBevestigingEmail(data)
        break
      case 'bestelling_bevestiging':
        emailContent = bestellingBevestigingEmail(data)
        break
      case 'wachtwoord_reset':
        emailContent = wachtwoordResetEmail(data.firstName, data.resetUrl)
        break
      case 'listing_bevestiging':
        emailContent = listingBevestigingEmail(data)
        break
      case 'cursus_aankoop':                    // ✅ was missing!
        emailContent = cursusAankoopEmail(data)
        break
      default:
        return NextResponse.json({ error: `Onbekend type: ${type}` }, { status: 400 })
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result?.id })
  } catch (err) {
    console.error('Email API error:', err)
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 })
  }
}
