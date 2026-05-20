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
    .warning{background:#FFF3E0;border-radius:20px;padding:20px 24px;margin:20px 0;font-size:14px;line-height:1.7;color:#7D4E00;border-left:4px solid var(--orange-main)}
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
          <a href="mailto:privacy@kwispelclub.be">Contact DPO</a>
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
              <div className="updated">Laatst bijgewerkt: 20 mei 2026</div>
              <div className="highlight">
                <strong>Samenvatting:</strong> Kwispelclub respecteert je privacy volledig. We verzamelen alleen gegevens die strikt noodzakelijk zijn, delen ze nooit met derden voor marketing, en je hebt altijd het recht om je gegevens in te zien, te wijzigen of volledig te verwijderen. Wij zijn gebonden aan de Europese AVG/GDPR-wetgeving.
              </div>

              <h2>1. Identiteit van de verwerkingsverantwoordelijke</h2>
              <p><strong>Kwispelclub</strong> is een online platform voor huisdierliefhebbers in België en Nederland.</p>
              <ul>
                <li><strong>Handelsnaam:</strong> Kwispelclub</li>
                <li><strong>Adres:</strong> Bree, Limburg, België</li>
                <li><strong>E-mail:</strong> <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a></li>
                <li><strong>DPO:</strong> <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a></li>
              </ul>

              <h2>2. Welke persoonsgegevens verzamelen wij?</h2>
              <h3>2.1 Bij registratie en accountbeheer:</h3>
              <ul>
                <li>Naam, e-mailadres, wachtwoord (versleuteld via bcrypt)</li>
                <li>Rol op het platform (koper, verkoper, kapsalon)</li>
                <li>Optioneel: telefoonnummer, adres, profielfoto, bedrijfsgegevens</li>
              </ul>
              <h3>2.2 Huisdierprofielen:</h3>
              <ul>
                <li>Naam, soort, ras, geboortedatum, gewicht, geslacht</li>
                <li>Allergieën, medische notities, chipnummer, verzekeringsinformatie</li>
                <li>Profielfoto van het huisdier</li>
              </ul>
              <h3>2.3 Bij gebruik van het platform:</h3>
              <ul>
                <li>Bestelgeschiedenis en betalingsstatus (geen betaalkaartgegevens — verwerkt door Mollie)</li>
                <li>Favorieten, zoekgedrag en productinteracties</li>
                <li>Chatberichten en communicatie tussen gebruikers</li>
                <li>Kapsalonafspraken en boekingshistoriek</li>
                <li>2de Hands advertenties</li>
                <li>Academy voortgang en cursusdeelname</li>
              </ul>
              <h3>2.4 Technische gegevens:</h3>
              <ul>
                <li>IP-adres, browsertype, apparaatinformatie</li>
                <li>Sessiegegevens en inloghistoriek</li>
                <li>Geanonimiseerde gebruiksstatistieken</li>
              </ul>

              <h2>3. Rechtsgronden voor verwerking</h2>
              <ul>
                <li><strong>Uitvoering van overeenkomst (art. 6.1.b AVG):</strong> accountbeheer, bestellingen, boekingen</li>
                <li><strong>Wettelijke verplichting (art. 6.1.c AVG):</strong> facturatie, boekhouding (7 jaar)</li>
                <li><strong>Gerechtvaardigd belang (art. 6.1.f AVG):</strong> fraudepreventie, platformbeveiliging</li>
                <li><strong>Toestemming (art. 6.1.a AVG):</strong> marketing e-mails, analytische cookies (intrekbaar)</li>
              </ul>

              <h2>4. Doeleinden van verwerking</h2>
              <ul>
                <li><strong>Account & authenticatie:</strong> inloggen, beveiliging, herstel wachtwoord</li>
                <li><strong>Dienstverlening:</strong> bestellingen verwerken, boekingen beheren, berichten bezorgen</li>
                <li><strong>Personalisatie:</strong> productaanbevelingen op basis van jouw huisdier(s)</li>
                <li><strong>Communicatie:</strong> bevestigingsmails, herinneringen, servicemeldingen</li>
                <li><strong>Veiligheid:</strong> fraudepreventie, misbruikdetectie, verificatie van verkopers</li>
                <li><strong>Wettelijke verplichtingen:</strong> fiscale en boekhoudkundige bewaring</li>
              </ul>

              <h2>5. Doorgifte aan derden</h2>
              <p>Wij delen je persoonsgegevens <strong>nooit</strong> met derden voor marketingdoeleinden. Wij werken uitsluitend met de volgende verwerkers:</p>
              <ul>
                <li><strong>Mollie B.V.</strong> (Amsterdam) — betalingsverwerking. <a href="https://www.mollie.com/be/privacy" target="_blank">Privacybeleid Mollie</a></li>
                <li><strong>Supabase Inc.</strong> (VS) — databasehosting en authenticatie. Beschermd via Standard Contractual Clauses (SCC).</li>
                <li><strong>Vercel Inc.</strong> (VS) — webhosting. Beschermd via Standard Contractual Clauses (SCC).</li>
                <li><strong>Resend Inc.</strong> (VS) — transactionele e-mails. Beschermd via Standard Contractual Clauses (SCC).</li>
                <li><strong>Kapsalons & Verkopers:</strong> enkel naam en contactgegevens noodzakelijk voor de uitvoering van jouw boeking of bestelling.</li>
              </ul>
              <div className="warning">
                <strong>Doorgifte buiten de EU:</strong> Supabase, Vercel en Resend zijn gevestigd in de Verenigde Staten. De doorgifte is beschermd via Standard Contractual Clauses (SCC) conform art. 46 AVG. Op verzoek bezorgen wij je een kopie van deze clausules.
              </div>

              <h2>6. Jouw rechten (AVG/GDPR)</h2>
              <p>Als betrokkene heb je de volgende rechten, die je kosteloos kunt uitoefenen:</p>
              <ul>
                <li><strong>Recht op inzage (art. 15):</strong> opvragen welke gegevens wij van jou bewaren</li>
                <li><strong>Recht op rectificatie (art. 16):</strong> onjuiste gegevens laten corrigeren</li>
                <li><strong>Recht op verwijdering (art. 17):</strong> je account en gegevens laten wissen ("recht op vergetelheid")</li>
                <li><strong>Recht op beperking (art. 18):</strong> verwerking tijdelijk stopzetten</li>
                <li><strong>Recht op overdraagbaarheid (art. 20):</strong> je gegevens in leesbaar formaat ontvangen</li>
                <li><strong>Recht van bezwaar (art. 21):</strong> bezwaar maken tegen verwerking op basis van gerechtvaardigd belang</li>
                <li><strong>Recht om toestemming in te trekken:</strong> eerder gegeven toestemming op elk moment intrekken</li>
                <li><strong>Recht om niet onderworpen te worden aan geautomatiseerde besluitvorming (art. 22)</strong></li>
              </ul>
              <p>Rechten uitoefenen via je <a href="/account?panel=settings">accountinstellingen</a> of via <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a>. Wij reageren binnen <strong>30 dagen</strong>.</p>

              <h2>7. Bewaartermijnen</h2>
              <ul>
                <li><strong>Accountgegevens:</strong> zolang je account actief is + 30 dagen na verwijdering</li>
                <li><strong>Bestelhistoriek & facturatie:</strong> 7 jaar (wettelijke boekhoudplicht)</li>
                <li><strong>Chatberichten:</strong> 1 jaar na het laatste bericht</li>
                <li><strong>Huisdierprofielen:</strong> tot verwijdering door de gebruiker</li>
                <li><strong>Inloghistoriek & beveiligingslogs:</strong> 90 dagen</li>
                <li><strong>Analytische gegevens:</strong> geanonimiseerd, maximaal 2 jaar</li>
              </ul>

              <h2>8. Beveiliging</h2>
              <ul>
                <li>Wachtwoorden versleuteld via bcrypt (nooit leesbaar opgeslagen)</li>
                <li>HTTPS-encryptie voor alle communicatie (TLS 1.3)</li>
                <li>Row Level Security (RLS) op databaseniveau — gebruikers zien enkel hun eigen data</li>
                <li>Regelmatige beveiligingsaudits en updates</li>
                <li>Beperkte toegang tot persoonsgegevens — enkel noodzakelijk personeel</li>
              </ul>

              <h2>9. Cookies</h2>
              <p>Voor informatie over ons gebruik van cookies verwijzen wij naar ons <button style={{background:'none',border:'none',color:'var(--green-main)',fontWeight:700,cursor:'pointer',fontSize:15}} onClick={() => setTab('cookies')}>Cookiebeleid</button>.</p>

              <h2>10. Minderjarigen</h2>
              <p>Kwispelclub is niet gericht op minderjarigen onder de 16 jaar. Wij verzamelen niet bewust gegevens van minderjarigen. Indien je vermoedt dat wij onbedoeld gegevens van een minderjarige verwerken, neem dan contact op via <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a>.</p>

              <h2>11. Wijzigingen aan dit beleid</h2>
              <p>Wij kunnen dit privacybeleid periodiek bijwerken. Bij ingrijpende wijzigingen ontvang je een melding per e-mail of via het platform. De datum van de laatste wijziging staat steeds bovenaan vermeld.</p>

              <h2>12. Contact & klachten</h2>
              <div className="highlight">
                <strong>Data Protection Officer (DPO)</strong><br />
                E-mail: <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a><br />
                Adres: Kwispelclub, Bree, Limburg, België<br /><br />
                Je hebt ook het recht een klacht in te dienen bij de toezichthoudende autoriteit:<br />
                <strong>Gegevensbeschermingsautoriteit (GBA)</strong><br />
                Drukpersstraat 35, 1000 Brussel<br />
                <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank">www.gegevensbeschermingsautoriteit.be</a>
              </div>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h1>Algemene Voorwaarden</h1>
              <div className="updated">Laatst bijgewerkt: 20 mei 2026</div>
              <div className="highlight">
                <strong>Samenvatting:</strong> Deze voorwaarden zijn van toepassing op al het gebruik van kwispelclub.be. Door een account aan te maken aanvaard je deze voorwaarden. Belgisch recht is van toepassing.
              </div>

              <h2>1. Identiteit & toepassingsgebied</h2>
              <p><strong>Kwispelclub</strong> (hierna "Kwispelclub", "wij", "ons") exploiteert het online platform op <strong>kwispelclub.be</strong>, gevestigd te Bree, Limburg, België.</p>
              <p>Deze Algemene Voorwaarden zijn van toepassing op alle gebruik van het platform, inclusief de webshop, 2de Hands marktplaats, kapsalonboekingen en Academy. Door een account aan te maken of het platform te gebruiken, aanvaard je deze voorwaarden uitdrukkelijk.</p>

              <h2>2. Account & registratie</h2>
              <ul>
                <li>Minimumleeftijd: <strong>18 jaar</strong></li>
                <li>Je bent verantwoordelijk voor de juistheid van je gegevens</li>
                <li>Je account is strikt persoonlijk en niet overdraagbaar</li>
                <li>Je bent verantwoordelijk voor de vertrouwelijkheid van je wachtwoord</li>
                <li>Kwispelclub kan accounts opschorten of permanent verwijderen bij misbruik, fraude of schending van deze voorwaarden, zonder voorafgaande kennisgeving</li>
                <li>Bij vermoeden van ongeautoriseerd gebruik dien je ons onmiddellijk te informeren</li>
              </ul>

              <h2>3. Webshop & bestellingen</h2>
              <ul>
                <li>Alle prijzen zijn inclusief BTW, exclusief verzendkosten (tenzij anders vermeld)</li>
                <li>Gratis verzending vanaf €50 aankoop (Belgium & Nederland)</li>
                <li>Bestellingen worden pas verwerkt na succesvolle betaling via Mollie</li>
                <li>Kwispelclub behoudt zich het recht voor bestellingen te weigeren bij technische fouten in de prijs</li>
              </ul>
              <h3>3.1 Herroepingsrecht (EU-consumentenrecht)</h3>
              <p>Als consument heb je het recht om binnen <strong>14 kalenderdagen</strong> na ontvangst van je bestelling, zonder opgave van reden, van de aankoop af te zien.</p>
              <p><strong>Uitzonderingen op het herroepingsrecht:</strong></p>
              <ul>
                <li>Producten die omwille van hygiëne niet retourneerbaar zijn (geopende verpakking)</li>
                <li>Op maat gemaakte of gepersonaliseerde producten</li>
                <li>Digitale content die al gedownload of bekeken is</li>
                <li>Verderfelijke producten (voeding, snacks)</li>
              </ul>
              <p>Retourkosten zijn voor rekening van de koper, tenzij het product defect of verkeerd geleverd is. Terugbetaling gebeurt binnen <strong>14 dagen</strong> na ontvangst van het retour.</p>

              <h2>4. Verkopers op het platform</h2>
              <ul>
                <li>Verkopers zijn verantwoordelijk voor de juistheid van hun productinformatie en prijzen</li>
                <li>Verkopers garanderen dat producten voldoen aan de geldende wet- en regelgeving</li>
                <li>Kwispelclub hanteert een commissie op elke verkoop (tarief gecommuniceerd bij registratie als verkoper)</li>
                <li>Uitbetaling aan verkopers gebeurt na succesvolle levering en het verstrijken van de herroepingstermijn</li>
                <li>Kwispelclub behoudt zich het recht voor verkopersaccounts te schorsen bij klachten, fraude of schending van de gedragscode</li>
                <li>Kwispelclub is <strong>niet aansprakelijk</strong> voor de inhoud, kwaliteit of levering van producten door derden-verkopers</li>
              </ul>

              <h2>5. 2de Hands Marktplaats</h2>
              <ul>
                <li>Enkel huisdierproducten — het aanbieden van levende dieren is <strong>uitdrukkelijk verboden</strong></li>
                <li>Maximum 2 actieve advertenties tegelijkertijd per account</li>
                <li>Vraagprijs maximaal 70% van de originele nieuwprijs</li>
                <li>Kwispelclub treedt op als <strong>tussenpersoon</strong> en is niet aansprakelijk voor de kwaliteit van 2de Hands producten of geschillen tussen kopers en verkopers</li>
                <li>Bij geschillen kan Kwispelclub bemiddelen maar is niet verplicht dat te doen</li>
              </ul>

              <h2>6. Kapsalon Boekingen</h2>
              <ul>
                <li>Boekingen kunnen kosteloos worden geannuleerd tot <strong>24 uur voor de afspraak</strong></li>
                <li>Bij laattijdige annulering kan het kapsalon een vergoeding aanrekenen</li>
                <li>Prijzen worden uitsluitend bepaald door het kapsalon zelf</li>
                <li>Kwispelclub is <strong>niet aansprakelijk</strong> voor de dienstverlening van het kapsalon, letsels aan het dier of schade tijdens de behandeling</li>
                <li>Klachten over kapsalons dienen eerst rechtstreeks aan het kapsalon gericht te worden</li>
              </ul>

              <h2>7. Academy</h2>
              <ul>
                <li>De inhoud van de Academy is uitsluitend <strong>informatief</strong> van aard</li>
                <li>Academy-content vervangt <strong>geen professioneel advies</strong> van een dierenarts of gecertificeerd gedragstherapeut</li>
                <li>Bij gezondheidsproblemen van je huisdier raadpleeg je steeds een erkende dierenarts</li>
                <li>Kwispelclub is niet aansprakelijk voor schade voortvloeiend uit het toepassen van Academy-inhoud</li>
              </ul>

              <h2>8. Aansprakelijkheidsbeperking</h2>
              <p>Kwispelclub is een <strong>tussenpersoon</strong> die verkopers, kapsalons en kopers met elkaar in contact brengt. Voor zover wettelijk toegestaan:</p>
              <ul>
                <li>Is Kwispelclub niet aansprakelijk voor indirecte schade, gevolgschade of winstderving</li>
                <li>Is de aansprakelijkheid van Kwispelclub beperkt tot het bedrag dat jij in de voorgaande 3 maanden via het platform hebt betaald</li>
                <li>Is Kwispelclub niet aansprakelijk voor schade veroorzaakt door derden-verkopers of kapsalons</li>
                <li>Is Kwispelclub niet aansprakelijk voor technische storingen, onderbrekingen of tijdelijke onbeschikbaarheid van het platform</li>
              </ul>

              <h2>9. Force Majeure</h2>
              <p>Kwispelclub is niet aansprakelijk voor tekortkomingen die het gevolg zijn van overmacht, waaronder maar niet beperkt tot: natuurrampen, pandemieën, cyberaanvallen, stakingen, storingen bij derde partijen (zoals Supabase, Vercel, Mollie) of overheidsmaatregelen. Bij langdurige overmacht hebben beide partijen het recht de overeenkomst te ontbinden.</p>

              <h2>10. Intellectueel eigendom</h2>
              <ul>
                <li>Alle content op Kwispelclub (logo, teksten, afbeeldingen, code) is eigendom van Kwispelclub of haar licentiegevers</li>
                <li>Gebruik, kopiëren of verspreiden zonder uitdrukkelijke toestemming is verboden</li>
                <li>Door content te uploaden (foto's, beschrijvingen) geef je Kwispelclub een niet-exclusieve licentie om deze te gebruiken voor platformdoeleinden</li>
              </ul>

              <h2>11. Verboden gebruik</h2>
              <p>Het is verboden het platform te gebruiken voor:</p>
              <ul>
                <li>Het verspreiden van valse, misleidende of frauduleuze informatie</li>
                <li>Het aanbieden van illegale, gevaarlijke of dierenwelzijn-schadende producten</li>
                <li>Spam, phishing of ongewenste commerciële communicatie</li>
                <li>Het omzeilen van beveiligingsmaatregelen of het hacken van het platform</li>
                <li>Het aanmaken van valse accounts of reviews</li>
              </ul>

              <h2>12. Klachtenprocedure</h2>
              <p>Bij klachten of geschillen:</p>
              <ul>
                <li><strong>Stap 1:</strong> Neem contact op via <a href="mailto:info@kwispelclub.be">info@kwispelclub.be</a> — wij reageren binnen 5 werkdagen</li>
                <li><strong>Stap 2:</strong> Bij geen oplossing kan je terecht bij het <a href="https://www.belmed.fgov.be" target="_blank">BELMed bemiddelingsplatform</a></li>
                <li><strong>Stap 3:</strong> Online geschillenbeslechting via het <a href="https://ec.europa.eu/consumers/odr" target="_blank">EU ODR-platform</a></li>
              </ul>

              <h2>13. Toepasselijk recht & bevoegde rechtbank</h2>
              <p>Deze voorwaarden worden beheerst door het <strong>Belgisch recht</strong>. Bij geschillen zijn uitsluitend de <strong>rechtbanken van het arrondissement Hasselt</strong> bevoegd, tenzij dwingende wettelijke bepalingen anders voorschrijven.</p>

              <h2>14. Wijzigingen aan de voorwaarden</h2>
              <p>Kwispelclub behoudt zich het recht voor deze voorwaarden te wijzigen. Bij ingrijpende wijzigingen ontvang je een melding per e-mail minimaal <strong>30 dagen op voorhand</strong>. Voortgezet gebruik na de ingangsdatum geldt als aanvaarding van de nieuwe voorwaarden.</p>

              <div className="highlight">
                <strong>Contact:</strong> info@kwispelclub.be · Kwispelclub, Bree, Limburg, België
              </div>
            </>
          )}

          {tab === 'cookies' && (
            <>
              <h1>Cookiebeleid</h1>
              <div className="updated">Laatst bijgewerkt: 20 mei 2026</div>
              <div className="highlight">
                <strong>Samenvatting:</strong> Wij gebruiken enkel strikt noodzakelijke cookies en functionele cookies. Voor analytische cookies vragen wij je toestemming. Je kunt je voorkeuren op elk moment wijzigen.
              </div>

              <h2>1. Wat zijn cookies?</h2>
              <p>Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je een website bezoekt. Ze helpen ons de website correct te laten werken en je ervaring te verbeteren.</p>

              <h2>2. Welke cookies gebruiken wij?</h2>

              <h3>2.1 Strikt noodzakelijke cookies (geen toestemming vereist)</h3>
              <p>Deze cookies zijn essentieel voor het functioneren van het platform en kunnen niet worden uitgeschakeld.</p>
              <ul>
                <li><strong>sb-auth-token</strong> — Supabase authenticatiesessie (duur: sessie / 7 dagen bij "onthoud mij")</li>
                <li><strong>kc_cart</strong> — Inhoud van je winkelwagen (duur: 30 dagen)</li>
                <li><strong>kc_session</strong> — Sessie-identificatie (duur: sessie)</li>
              </ul>

              <h3>2.2 Functionele cookies (geen toestemming vereist)</h3>
              <p>Deze cookies onthouden je voorkeuren voor een betere gebruikerservaring.</p>
              <ul>
                <li><strong>kc_prefs</strong> — Taal- en weergavevoorkeuren (duur: 1 jaar)</li>
                <li><strong>kc_cookie_consent</strong> — Jouw cookietoestemming (duur: 1 jaar)</li>
                <li><strong>kc_seen</strong> — Welkomstpopup al getoond (duur: sessie)</li>
              </ul>

              <h3>2.3 Analytische cookies (toestemming vereist)</h3>
              <p>Wij gebruiken geanonimiseerde analytische data om het gebruik van het platform te begrijpen en te verbeteren. Er worden geen persoonlijke gegevens gedeeld met advertentienetwerken.</p>
              <ul>
                <li><strong>Vercel Analytics</strong> — geanonimiseerde paginaweergaven en prestatiemeting. Privacy-vriendelijk, geen cross-site tracking. <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank">Meer info</a></li>
              </ul>

              <h3>2.4 Cookies van derden</h3>
              <p>Bij gebruik van de betalingsfunctie worden tijdelijke cookies geplaatst door <strong>Mollie</strong> voor fraudepreventie. Deze zijn noodzakelijk voor de betaalverwerking. <a href="https://www.mollie.com/be/privacy" target="_blank">Cookiebeleid Mollie</a>.</p>

              <h2>3. Cookies van sociale media</h2>
              <p>Kwispelclub plaatst <strong>geen</strong> cookies van sociale medianetwerken (Facebook, Google, etc.) zonder jouw uitdrukkelijke toestemming.</p>

              <h2>4. Bewaartermijnen</h2>
              <p>Alle cookietermijnen staan vermeld in bovenstaande overzichten. Sessiecookies worden automatisch verwijderd bij het sluiten van je browser.</p>

              <h2>5. Cookies beheren en verwijderen</h2>
              <p>Je kunt cookies op de volgende manieren beheren:</p>
              <ul>
                <li><strong>Via onze cookiebanner:</strong> bij je eerste bezoek kun je analytische cookies accepteren of weigeren</li>
                <li><strong>Via je browserinstellingen:</strong> cookies blokkeren of verwijderen</li>
              </ul>
              <p>Let op: het uitschakelen van noodzakelijke cookies kan de werking van het platform beïnvloeden (bv. uitloggen, lege winkelwagen).</p>

              <h3>Instructies per browser:</h3>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites" target="_blank">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/nl-be/guide/safari/sfri11471/mac" target="_blank">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge" target="_blank">Microsoft Edge</a></li>
              </ul>

              <h2>6. Meer informatie</h2>
              <div className="highlight">
                <strong>Vragen over ons cookiebeleid?</strong><br />
                E-mail: <a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a><br /><br />
                Meer info over cookies: <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank">Gegevensbeschermingsautoriteit (GBA)</a>
              </div>
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
