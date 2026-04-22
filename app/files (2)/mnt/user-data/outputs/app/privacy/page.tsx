'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

type Tab = 'privacy' | 'terms' | 'cookies'

export default function PrivacyPage() {
  const [tab, setTab] = useState<Tab>('privacy')

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .layout{max-width:960px;margin:0 auto;padding:40px clamp(16px,4vw,48px) 80px}
        .tabs{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap}
        .tab{padding:10px 24px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-mid)}
        .tab.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}
        .tab:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
        .content h1{font-size:30px;color:var(--green-dark);margin-bottom:6px}
        .content .updated{font-size:13px;color:var(--text-light);margin-bottom:28px}
        .highlight-box{background:var(--green-pale);border-radius:16px;padding:18px 22px;margin:18px 0;font-size:14px;line-height:1.7;color:var(--green-dark)}
        .content h2{font-size:20px;color:var(--green-dark);margin:32px 0 12px;padding-top:22px;border-top:2px solid var(--cream-dark)}
        .content h2:first-of-type{border-top:none;margin-top:0;padding-top:0}
        .content h3{font-size:16px;color:var(--text-dark);margin:18px 0 8px}
        .content p{font-size:15px;line-height:1.75;color:var(--text-mid);margin-bottom:12px}
        .content ul{margin:8px 0 12px 20px;font-size:15px;line-height:1.75;color:var(--text-mid)}
        .content li{margin-bottom:5px}
        .content strong{color:var(--text-dark)}
        .content a{color:var(--green-main);font-weight:600}
        footer{background:var(--green-dark);color:white;margin-top:40px}
        .footer-inner{max-width:960px;margin:0 auto;padding:28px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
      `}</style>

      <Navbar />

      <div className="layout">
        <div className="tabs">
          {([['privacy','🔒 Privacy'],['terms','📋 Voorwaarden'],['cookies','🍪 Cookies']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        <div className="content">
          {tab === 'privacy' && (
            <>
              <h1 id="privacy">Privacybeleid</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <div className="highlight-box"><strong>Samenvatting:</strong> Kwispelclub respecteert je privacy. We verzamelen alleen gegevens die nodig zijn voor het platform, delen ze nooit met derden voor marketing, en je hebt altijd het recht om je gegevens in te zien, te wijzigen of te verwijderen.</div>
              <h2>1. Wie zijn wij?</h2>
              <p><strong>Kwispelclub</strong> is een online platform voor huisdierliefhebbers in België en Nederland, gevestigd te Bree, Limburg, België. Als verwerkingsverantwoordelijke zijn wij verantwoordelijk voor de verwerking van je persoonsgegevens conform de AVG/GDPR.</p>
              <h2>2. Welke gegevens verzamelen we?</h2>
              <ul>
                <li><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld)</li>
                <li><strong>Profielgegevens:</strong> foto, locatie, rol (koper/verkoper/kapsalon)</li>
                <li><strong>Huisdiergegevens:</strong> naam, ras, leeftijd, vaccinatiegegevens</li>
                <li><strong>Transactiegegevens:</strong> bestellingen, betalingen, 2de hands advertenties</li>
                <li><strong>Communicatiegegevens:</strong> contactformulierberichten</li>
              </ul>
              <h2>3. Waarvoor gebruiken we je gegevens?</h2>
              <ul>
                <li>Het beheren van je account en profiel</li>
                <li>Het verwerken van bestellingen en betalingen</li>
                <li>Het tonen van relevante producten en aanbevelingen</li>
                <li>Het versturen van e-mailnotificaties (indien ingesteld)</li>
                <li>Het verbeteren van ons platform</li>
              </ul>
              <h2>4. Delen we gegevens met derden?</h2>
              <p>We delen je gegevens <strong>nooit</strong> met derden voor marketingdoeleinden. We werken wel samen met:</p>
              <ul>
                <li><strong>Supabase</strong> — hosting en database</li>
                <li><strong>Vercel</strong> — websitehosting</li>
                <li><strong>Mollie</strong> — betalingsverwerking (later)</li>
                <li><strong>Resend</strong> — e-mailverzending (later)</li>
              </ul>
              <h2 id="rechten">5. Jouw rechten</h2>
              <p>Conform de AVG heb je de volgende rechten:</p>
              <ul>
                <li>Recht op inzage van je gegevens</li>
                <li>Recht op correctie van onjuiste gegevens</li>
                <li>Recht op verwijdering ("recht op vergetelheid")</li>
                <li>Recht op beperking van verwerking</li>
                <li>Recht op gegevensoverdraagbaarheid</li>
              </ul>
              <p>Je kunt je rechten uitoefenen via <a href="/account">je accountinstellingen</a> of door contact op te nemen met onze DPO.</p>
              <h2 id="contact">6. Contact DPO</h2>
              <p>Voor privacyvragen: <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a></p>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h1>Algemene Voorwaarden</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <h2>1. Toepassingsgebied</h2>
              <p>Deze voorwaarden zijn van toepassing op alle gebruik van het Kwispelclub platform (kwispelclub.be) en alle diensten die wij aanbieden.</p>
              <h2>2. Account</h2>
              <p>Je bent verantwoordelijk voor de veiligheid van je account en wachtwoord. Kwispelclub kan niet aansprakelijk worden gesteld voor verlies of schade als gevolg van het niet naleven van deze verplichting.</p>
              <h2>3. 2de Hands Marktplaats</h2>
              <ul>
                <li>Alleen gebruikers met een recente aankoop (laatste 3 maanden) mogen verkopen</li>
                <li>Maximum 2 actieve advertenties tegelijk</li>
                <li>Maximum 70% van de originele nieuwprijs</li>
                <li>Alleen huisdierproducten — geen levende dieren, voeding of medicatie</li>
              </ul>
              <h2>4. Betalingen</h2>
              <p>Betalingen verlopen via Mollie. Kwispelclub fungeert als tussenpersoon. Uitbetaling aan verkopers vindt plaats na bevestiging van ontvangst door de koper.</p>
              <h2>5. Aansprakelijkheid</h2>
              <p>Kwispelclub is een platform dat vraag en aanbod bij elkaar brengt. We zijn niet aansprakelijk voor de kwaliteit van producten of diensten aangeboden door derde verkopers of kapsalons.</p>
              <h2>6. Wijzigingen</h2>
              <p>Kwispelclub behoudt het recht deze voorwaarden te wijzigen. Gebruikers worden via e-mail op de hoogte gesteld van belangrijke wijzigingen.</p>
            </>
          )}

          {tab === 'cookies' && (
            <>
              <h1>Cookiebeleid</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <div className="highlight-box"><strong>Kort gezegd:</strong> We gebruiken alleen noodzakelijke cookies voor authenticatie. Geen tracking cookies, geen advertentiecookies.</div>
              <h2>Welke cookies gebruiken we?</h2>
              <h3>Noodzakelijke cookies</h3>
              <ul>
                <li><strong>Supabase auth cookies</strong> — voor het bijhouden van je ingelogde sessie</li>
                <li><strong>Voorkeurscookies</strong> — voor taalinstellingen en weergavevoorkeuren</li>
              </ul>
              <h3>Analytische cookies</h3>
              <p>We gebruiken momenteel geen analytische cookies van derden. In de toekomst kunnen we privacy-vriendelijke analytics toevoegen (bijv. Plausible).</p>
              <h3>Marketing cookies</h3>
              <p>We gebruiken <strong>geen</strong> marketing- of tracking cookies.</p>
              <h2>Cookies beheren</h2>
              <p>Je kunt cookies beheren via je browserinstellingen. Het uitschakelen van noodzakelijke cookies kan de werking van het platform beïnvloeden (je blijft bijvoorbeeld niet ingelogd).</p>
            </>
          )}
        </div>
      </div>

      <footer><div className="footer-inner">© 2026 Kwispelclub</div></footer>
    </>
  )
}
