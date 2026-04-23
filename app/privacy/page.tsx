'use client'

import { useState } from 'react'

type Tab = 'privacy' | 'terms' | 'cookies'

export default function PrivacyPage() {
  const [tab, setTab] = useState<Tab>('privacy')

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .layout{max-width:960px;margin:0 auto;padding:40px clamp(16px,4vw,48px) 80px;display:grid;grid-template-columns:220px 1fr;gap:40px}
    .side-nav{position:sticky;top:88px;align-self:start}.side-nav a{display:block;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600;color:var(--text-mid);text-decoration:none;transition:all .15s;margin-bottom:2px;cursor:pointer}.side-nav a:hover{background:var(--cream-dark);color:var(--text-dark)}.side-nav a.active{background:var(--green-pale);color:var(--green-dark)}.divider{height:1px;background:var(--cream-dark);margin:10px 14px}
    .content h1{font-size:32px;color:var(--green-dark);margin-bottom:8px}.updated{font-size:13px;color:var(--text-light);margin-bottom:32px}
    .tabs{display:flex;gap:8px;margin-bottom:28px}.tab{padding:10px 24px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-mid)}.tab.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}.tab:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
    .content h2{font-size:22px;color:var(--green-dark);margin:36px 0 14px;padding-top:24px;border-top:2px solid var(--cream-dark);scroll-margin-top:100px}.content h2:first-of-type{border-top:none;margin-top:0;padding-top:0}.content h3{font-size:17px;color:var(--text-dark);margin:20px 0 10px}.content p{font-size:15px;line-height:1.75;color:var(--text-mid);margin-bottom:14px}.content ul{margin:10px 0 14px 20px;font-size:15px;line-height:1.75;color:var(--text-mid)}.content li{margin-bottom:6px}.content strong{color:var(--text-dark)}.content a{color:var(--green-main);font-weight:600}
    .highlight{background:var(--green-pale);border-radius:20px;padding:20px 24px;margin:20px 0;font-size:14px;line-height:1.7;color:var(--green-dark)}.highlight strong{color:var(--green-dark)}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:960px;margin:0 auto;padding:32px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
    @media(max-width:768px){.layout{grid-template-columns:1fr}.side-nav{position:static;display:flex;overflow-x:auto;gap:4px;padding-bottom:8px}.side-nav a{white-space:nowrap;font-size:13px}.divider{display:none}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="layout">
        <nav className="side-nav">
          <a className={tab==='privacy'?'active':''} onClick={() => setTab('privacy')}>🔒 Privacybeleid</a>
          <a className={tab==='terms'?'active':''} onClick={() => setTab('terms')}>📋 Voorwaarden</a>
          <a className={tab==='cookies'?'active':''} onClick={() => setTab('cookies')}>🍪 Cookiebeleid</a>
          <div className="divider" />
          <a onClick={() => setTab('privacy')}>Jouw Rechten</a>
          <a onClick={() => setTab('privacy')}>Contact DPO</a>
        </nav>

        <div className="content">
          <div className="tabs">
            <button className={`tab ${tab==='privacy'?'active':''}`} onClick={() => setTab('privacy')}>🔒 Privacy</button>
            <button className={`tab ${tab==='terms'?'active':''}`} onClick={() => setTab('terms')}>📋 Voorwaarden</button>
            <button className={`tab ${tab==='cookies'?'active':''}`} onClick={() => setTab('cookies')}>🍪 Cookies</button>
          </div>

          {tab === 'privacy' && (
            <>
              <h1>Privacybeleid</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <div className="highlight"><strong>Samenvatting:</strong> Kwispelclub respecteert je privacy. We verzamelen alleen gegevens die nodig zijn voor het platform, delen ze nooit met derden voor marketing, en je hebt altijd het recht om je gegevens in te zien, te wijzigen of te verwijderen.</div>
              <h2>1. Wie zijn wij?</h2>
              <p><strong>Kwispelclub</strong> is een online platform voor huisdierliefhebbers in België en Nederland, gevestigd te Bree, Limburg, België. Als verwerkingsverantwoordelijke zijn wij verantwoordelijk voor de verwerking van je persoonsgegevens conform de AVG/GDPR.</p>
              <h2>2. Welke gegevens verzamelen wij?</h2>
              <h3>Bij registratie:</h3>
              <ul><li>Naam, e-mailadres, wachtwoord (versleuteld)</li><li>Rol (koper, verkoper, kapsalon)</li><li>Optioneel: telefoonnummer, adres, bedrijfsgegevens</li></ul>
              <h3>Huisdierprofiel:</h3>
              <ul><li>Naam, ras, leeftijd, gewicht, geslacht van je huisdier</li><li>Vaccinatieschema, allergieën, medische notities</li></ul>
              <h3>Bij gebruik:</h3>
              <ul><li>Bestelgeschiedenis, favorieten, zoekgedrag</li><li>Chatberichten, afspraakgegevens, 2de Hands listings, Academy voortgang</li></ul>
              <h2>3. Waarvoor gebruiken wij je gegevens?</h2>
              <ul><li><strong>Account & authenticatie</strong></li><li><strong>Dienstverlening:</strong> bestellingen, boekingen, 2de hands</li><li><strong>Personalisatie:</strong> aanbevelingen op basis van je huisdier</li><li><strong>Communicatie:</strong> bevestigingsmails, vaccinatieherinneringen</li><li><strong>Veiligheid:</strong> fraudepreventie, verificatie</li></ul>
              <h2>4. Delen wij je gegevens?</h2>
              <p>Wij delen je persoonsgegevens <strong>nooit</strong> met derden voor marketingdoeleinden. Enkel met: Mollie (betalingen), Vercel/Supabase (hosting), Resend (e-mail), Kapsalons/Verkopers (alleen noodzakelijke gegevens).</p>
              <h2>5. Jouw rechten (AVG/GDPR)</h2>
              <ul><li><strong>Inzage, rectificatie, verwijdering</strong></li><li><strong>Beperking, overdraagbaarheid, bezwaar</strong></li></ul>
              <p>Uitoefenen via je <a href="/account">accountinstellingen</a> of via onze DPO.</p>
              <h2>6. Beveiliging</h2>
              <p>Versleuteling van wachtwoorden, HTTPS-encryptie, beveiligde servers en regelmatige beveiligingsaudits.</p>
              <h2>7. Bewaartermijnen</h2>
              <ul><li><strong>Accountgegevens:</strong> zolang account actief + 30 dagen</li><li><strong>Bestelgeschiedenis:</strong> 7 jaar (wettelijke plicht)</li><li><strong>Chatberichten:</strong> 1 jaar na laatste bericht</li></ul>
              <h2>8. Contact</h2>
              <div className="highlight">
                <strong>Data Protection Officer (DPO)</strong><br />
                E-mail: <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a><br />
                Adres: Kwispelclub, Bree, Limburg, België<br /><br />
                Klacht indienen bij de <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank">Gegevensbeschermingsautoriteit (GBA)</a>.
              </div>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h1>Algemene Voorwaarden</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <h2>1. Definities</h2>
              <p><strong>"Kwispelclub"</strong>: het online platform op kwispelclub.be. <strong>"Gebruiker"</strong>: elke persoon met een account. <strong>"Koper/Verkoper/Kapsalon"</strong>: gebruikers per rol.</p>
              <h2>2. Account & Registratie</h2>
              <ul><li>Minimumleeftijd 18 jaar</li><li>Verantwoordelijkheid voor juistheid gegevens</li><li>Account is persoonlijk, niet deelbaar</li><li>Kwispelclub kan accounts opschorten bij misbruik</li></ul>
              <h2>3. Webshop & Bestellingen</h2>
              <ul><li>Prijzen inclusief BTW, exclusief verzendkosten</li><li>Gratis verzending vanaf €50</li><li>14 dagen herroepingsrecht (EU-recht)</li><li>Retourkosten voor de koper (tenzij defect)</li></ul>
              <h2>4. 2de Hands Marktplaats</h2>
              <ul><li>Aankoop in laatste 3 maanden vereist om te verkopen</li><li>Max. 2 actieve advertenties tegelijk</li><li>Max. 70% van de nieuwprijs</li><li>Alleen huisdierproducten — geen levende dieren</li></ul>
              <h2>5. Kapsalon Boekingen</h2>
              <ul><li>Kosteloos annuleren tot 24u voor de afspraak</li><li>Prijzen bepaald door het kapsalon</li><li>Kwispelclub is niet aansprakelijk voor de dienstverlening</li></ul>
              <h2>6. Academy</h2>
              <p>Content is informatief en vervangt geen professioneel advies van een dierenarts of gecertificeerd trainer.</p>
              <h2>7. Intellectueel Eigendom</h2>
              <p>Alle content op Kwispelclub is eigendom van Kwispelclub of haar licentiegevers. Gebruik zonder toestemming is niet toegestaan.</p>
              <h2>8. Toepasselijk Recht</h2>
              <p>Belgisch recht. Geschillen voor de rechtbanken te Hasselt, België.</p>
            </>
          )}

          {tab === 'cookies' && (
            <>
              <h1>Cookiebeleid</h1>
              <div className="updated">Laatst bijgewerkt: 14 april 2026</div>
              <h2>Wat zijn cookies?</h2>
              <p>Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je een website bezoekt.</p>
              <h2>Noodzakelijke cookies</h2>
              <ul><li><strong>sb-auth-token</strong> — Supabase authenticatie (sessieduur)</li><li><strong>kc_session</strong> — Sessie-identificatie (sessieduur)</li><li><strong>kc_cart</strong> — Winkelwagen data (30 dagen)</li></ul>
              <h2>Functionele cookies</h2>
              <ul><li><strong>kc_prefs</strong> — Gebruikersvoorkeuren (1 jaar)</li><li><strong>kc_seen</strong> — Launch popup getoond (sessie)</li></ul>
              <h2>Analytische cookies</h2>
              <p>Geanonimiseerde analytische cookies om het gebruik te begrijpen. Geen persoonlijke data wordt gedeeld.</p>
              <h2>Cookies beheren</h2>
              <p>Bij je eerste bezoek vragen wij toestemming voor niet-noodzakelijke cookies. Je kunt je voorkeuren op elk moment wijzigen.</p>
              <div className="highlight"><strong>Jouw keuze:</strong> Je kunt niet-noodzakelijke cookies altijd weigeren. Dit heeft geen invloed op de basisfunctionaliteit van Kwispelclub.</div>
            </>
          )}
        </div>
      </div>

      <footer>
        <div className="footer-inner">© 2026 Kwispelclub. Alle rechten voorbehouden.</div>
      </footer>
    </>
  )
}
