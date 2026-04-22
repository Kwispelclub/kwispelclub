'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const FAQS = [
  { cat: 'account', q: 'Hoe maak ik een account aan?', a: 'Ga naar de registratiepagina en kies je rol: koper, verkoper of kapsalon. Vul het formulier in en bevestig je e-mailadres.' },
  { cat: 'account', q: 'Hoe wijzig ik mijn gegevens?', a: 'Ga naar Mijn Account → Instellingen. Daar kun je je naam, e-mail, wachtwoord en notificatievoorkeuren aanpassen.' },
  { cat: 'account', q: 'Hoe verwijder ik mijn account?', a: 'Ga naar Mijn Account → Instellingen → Privacy & Beveiliging → "Account verwijderen". Je gegevens worden binnen 30 dagen volledig gewist conform de AVG.' },
  { cat: 'shop', q: 'Wanneer gaat de webshop live?', a: 'De webshop wordt verwacht in Q3 2026. Registreer je voor early access om als eerste te weten wanneer het zover is!' },
  { cat: 'shop', q: 'Hoe werkt verzending?', a: 'We leveren in heel België en Nederland. Gratis verzending bij bestellingen vanaf €50. Standaard levertijd is 2-3 werkdagen.' },
  { cat: 'shop', q: 'Wat is het retourbeleid?', a: 'Je hebt 14 dagen herroepingsrecht. Stuur het product ongebruikt terug in originele verpakking.' },
  { cat: 'kapsalon', q: 'Hoe boek ik een afspraak bij een kapsalon?', a: 'Ga naar de Kapsalons pagina, kies een salon en klik op "Bekijk & Boek". Kies een dienst, datum en tijdslot en bevestig.' },
  { cat: 'kapsalon', q: 'Hoe registreer ik mijn kapsalon?', a: 'Kies "Kapsalon" bij het aanmaken van je account, of gebruik het formulier op de kapsalon-pagina. De eerste 3 maanden zijn gratis.' },
  { cat: '2dehands', q: 'Wie mag er verkopen op 2de Hands?', a: 'Alleen gebruikers met minstens 1 aankoop in de laatste 3 maanden. Max. 2 producten tegelijk, voor max. 70% van de nieuwprijs.' },
  { cat: '2dehands', q: 'Hoe werkt de betaling bij 2de Hands?', a: 'De koper betaalt via Kwispelclub (Mollie). Het geld wordt uitbetaald aan de verkoper zodra de koper bevestigt dat het product is ontvangen.' },
  { cat: 'verkoper', q: 'Hoe word ik verkoper op Kwispelclub?', a: 'Maak een account aan als "Verkoper" via de registratiepagina. We reviewen je aanvraag binnen 48 uur.' },
  { cat: 'verkoper', q: 'Wat kost het om verkoper te zijn?', a: 'Details over commissies worden bekendgemaakt bij de lancering van de webshop. Early access verkopers krijgen speciale voorwaarden.' },
]

export default function ContactPage() {
  const supabase = createClient()
  const [faqCat, setFaqCat] = useState('all')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Algemene vraag')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const filteredFaqs = FAQS.filter(f => faqCat === 'all' || f.cat === faqCat)

  const handleSubmit = async () => {
    if (!name || !email || !message) { setError('Vul alle verplichte velden in'); return }
    setSending(true)
    await supabase.from('contact_messages').insert({ name, email, subject, message, status: 'new' })
    setSent(true)
    setSending(false)
  }

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .hero{background:linear-gradient(135deg,var(--green-dark),var(--green-main));padding:56px clamp(16px,4vw,48px);text-align:center;color:white}
        .hero h1{font-size:clamp(32px,4vw,48px);margin-bottom:10px}
        .hero p{font-size:17px;opacity:.82;max-width:460px;margin:0 auto}
        .section{max-width:1320px;margin:0 auto;padding:56px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:40px}
        .section-header h2{font-size:clamp(26px,3.5vw,38px);color:var(--green-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:15px;max-width:500px;margin:0 auto;line-height:1.6}
        .methods{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:48px}
        .method-card{background:var(--white);border-radius:20px;padding:28px 20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}
        .method-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08);border-color:var(--green-pale)}
        .method-icon{font-size:38px;margin-bottom:12px}
        .method-card h3{font-size:16px;margin-bottom:6px}
        .method-card p{font-size:14px;color:var(--text-mid);line-height:1.5;margin-bottom:8px}
        .method-card a{color:var(--green-main);font-weight:700;font-size:14px;text-decoration:none}
        .contact-layout{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:start}
        .contact-form{background:var(--white);border-radius:24px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .contact-form h2{font-size:22px;color:var(--green-dark);margin-bottom:20px}
        .field{margin-bottom:16px}
        .field label{display:block;font-size:13px;font-weight:700;margin-bottom:5px}
        .field input,.field select,.field textarea{width:100%;padding:12px 14px;border:2px solid var(--cream-dark);border-radius:10px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#6B9E5E;box-shadow:0 0 0 3px rgba(107,158,94,.1)}
        .field textarea{resize:vertical;min-height:110px}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .btn-submit{width:100%;padding:14px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s}
        .btn-submit:hover{background:var(--green-dark);transform:translateY(-1px)}
        .error-msg{color:#E84E4E;font-size:13px;font-weight:600;margin-bottom:12px}
        .success-box{text-align:center;padding:20px 0}
        .contact-info{display:flex;flex-direction:column;gap:18px}
        .info-card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .info-card h3{font-size:16px;color:var(--green-dark);margin-bottom:12px}
        .info-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--cream-dark);font-size:14px}
        .info-row:last-child{border-bottom:none}
        .info-icon{width:34px;height:34px;border-radius:9px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        .info-row a{color:var(--green-main);font-weight:600;text-decoration:none}
        .faq-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:28px;flex-wrap:wrap}
        .faq-tab{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-mid)}
        .faq-tab.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}
        .faq-tab:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
        .faq-list{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
        .faq-item{background:var(--white);border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden}
        .faq-q{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;cursor:pointer;font-weight:700;font-size:15px;transition:background .2s;gap:12px}
        .faq-q:hover{background:var(--cream)}
        .faq-chevron{transition:transform .3s;color:var(--text-light);flex-shrink:0;font-size:12px}
        .faq-a{padding:0 22px 18px;font-size:14px;color:var(--text-mid);line-height:1.7}
        footer{background:var(--green-dark);color:white;margin-top:48px}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:768px){.methods,.contact-layout{grid-template-columns:1fr}.field-row{grid-template-columns:1fr}}
      `}</style>

      <Navbar />

      <div className="hero">
        <h1>Hoe kunnen we helpen? 💬</h1>
        <p>Stel je vraag, geef feedback of neem contact op. We antwoorden meestal binnen 24 uur.</p>
      </div>

      <div className="section" style={{ paddingTop: 36 }}>
        <div className="methods">
          {[
            { icon: '📧', title: 'E-mail', desc: 'Voor algemene vragen en support', link: 'mailto:info@kwispelclub.be', linkLabel: 'info@kwispelclub.be' },
            { icon: '💬', title: 'Chat', desc: 'Praat met Kwispel, onze chatbot', link: '/', linkLabel: 'Open Chatbot →' },
            { icon: '📍', title: 'Locatie', desc: 'Bree, Limburg, België', link: '/over-ons', linkLabel: 'Over Ons →' },
          ].map(m => (
            <div key={m.title} className="method-card">
              <div className="method-icon">{m.icon}</div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              <a href={m.link}>{m.linkLabel}</a>
            </div>
          ))}
        </div>

        <div className="contact-layout">
          <div className="contact-form">
            <h2>Stuur ons een Bericht ✉️</h2>
            {sent ? (
              <div className="success-box">
                <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', color: 'var(--green-dark)', marginBottom: 8 }}>Bericht Verstuurd!</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: 14 }}>We antwoorden binnen 24-48 uur op {email}.</p>
              </div>
            ) : (
              <>
                <div className="field-row">
                  <div className="field"><label>Naam *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Jouw naam" /></div>
                  <div className="field"><label>E-mailadres *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@voorbeeld.be" /></div>
                </div>
                <div className="field">
                  <label>Onderwerp *</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}>
                    {['Algemene vraag','Probleem melden','Verkoper worden','Kapsalon registreren','Samenwerking / Partnership','Feedback & Suggesties','Privacy & Gegevens','Anders'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field"><label>Bericht *</label><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Vertel ons hoe we kunnen helpen..." /></div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <button className="btn-submit" onClick={handleSubmit} disabled={sending}>{sending ? 'Bezig...' : 'Verstuur Bericht →'}</button>
              </>
            )}
          </div>

          <div className="contact-info">
            <div className="info-card">
              <h3>📞 Contactgegevens</h3>
              <div className="info-row"><div className="info-icon">📧</div><div><strong>E-mail</strong><br /><a href="mailto:info@kwispelclub.be">info@kwispelclub.be</a></div></div>
              <div className="info-row"><div className="info-icon">🔒</div><div><strong>Privacy vragen</strong><br /><a href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a></div></div>
              <div className="info-row"><div className="info-icon">📍</div><div><strong>Adres</strong><br />Bree, Limburg, België</div></div>
            </div>
            <div className="info-card">
              <h3>⏰ Reactietijd</h3>
              <div className="info-row"><div className="info-icon">📧</div><div><strong>E-mail</strong><br />Binnen 24 uur</div></div>
              <div className="info-row"><div className="info-icon">💬</div><div><strong>Chatbot</strong><br />Direct (24/7)</div></div>
              <div className="info-row"><div className="info-icon">📝</div><div><strong>Contactformulier</strong><br />Binnen 48 uur</div></div>
            </div>
            <div className="info-card" style={{ background: 'var(--green-pale)', border: '2px solid var(--green-main)' }}>
              <h3 style={{ color: 'var(--green-dark)' }}>🏪 Verkoper of Kapsalon?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 10 }}>Wil je producten verkopen of je kapsalon registreren?</p>
              <a href="/verkoper" style={{ color: 'var(--green-dark)', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Word Verkoper →</a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2>Veelgestelde Vragen ❓</h2>
          <p>Vind snel een antwoord op je vraag</p>
        </div>
        <div className="faq-tabs">
          {[['all','Alle'],['account','Account'],['shop','Webshop'],['kapsalon','Kapsalons'],['2dehands','2de Hands'],['verkoper','Verkopers']].map(([val, label]) => (
            <button key={val} className={`faq-tab ${faqCat === val ? 'active' : ''}`} onClick={() => { setFaqCat(val); setOpenFaq(null) }}>{label}</button>
          ))}
        </div>
        <div className="faq-list">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className="faq-chevron" style={{ transform: openFaq === i ? 'rotate(180deg)' : undefined }}>▼</span>
              </div>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <footer><div className="footer-inner">© 2026 Kwispelclub. <a href="/">Home</a><a href="/privacy">Privacy</a><a href="/over-ons">Over Ons</a></div></footer>
    </>
  )
}
