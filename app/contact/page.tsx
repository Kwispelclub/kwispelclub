'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const FAQS = [
  { cat: 'account', q: 'Hoe maak ik een account aan?', a: 'Ga naar de registratiepagina en kies je rol: koper, verkoper of kapsalon. Vul het formulier in en bevestig je e-mailadres. Je kunt ook registreren via Google.' },
  { cat: 'account', q: 'Hoe wijzig ik mijn gegevens?', a: 'Ga naar Mijn Account → Instellingen. Daar kun je je naam, e-mail, wachtwoord en notificatievoorkeuren aanpassen.' },
  { cat: 'account', q: 'Hoe verwijder ik mijn account?', a: 'Ga naar Mijn Account → Instellingen → Privacy & Beveiliging → "Account verwijderen". Je gegevens worden binnen 30 dagen volledig gewist conform de AVG.' },
  { cat: 'shop', q: 'Wanneer gaat de webshop live?', a: 'De webshop wordt verwacht in Q3 2026. Registreer je voor early access om als eerste te weten wanneer het zover is!' },
  { cat: 'shop', q: 'Hoe werkt verzending?', a: 'We leveren in heel België en Nederland. Gratis verzending bij bestellingen vanaf €50. Standaard levertijd is 2-3 werkdagen.' },
  { cat: 'shop', q: 'Wat is het retourbeleid?', a: 'Je hebt 14 dagen herroepingsrecht. Stuur het product ongebruikt terug in originele verpakking. Retourkosten zijn voor de koper, tenzij het product defect is.' },
  { cat: 'kapsalon', q: 'Hoe boek ik een afspraak bij een kapsalon?', a: 'Ga naar de Kapsalons pagina, kies een salon en klik op "Bekijk & Boek". Kies een dienst, datum en tijdslot, vul je gegevens in en bevestig. Let op: het boekingssysteem is nog in opbouw.' },
  { cat: 'kapsalon', q: 'Hoe registreer ik mijn kapsalon?', a: 'Ga naar de kapsalon registratiepagina of kies "Kapsalon" bij het aanmaken van je account. De eerste 3 maanden zijn gratis.' },
  { cat: '2dehands', q: 'Wie mag er verkopen op 2de Hands?', a: 'Alleen gebruikers met minstens 1 aankoop in de laatste 3 maanden mogen verkopen. Je mag maximaal 2 producten tegelijk aanbieden, voor maximaal 70% van de nieuwprijs.' },
  { cat: '2dehands', q: 'Hoe werkt de betaling bij 2de Hands?', a: 'De koper betaalt via Kwispelclub (Mollie). Het geld wordt uitbetaald aan de verkoper zodra de koper bevestigt dat het product in goede staat is ontvangen.' },
  { cat: 'verkoper', q: 'Hoe word ik verkoper op Kwispelclub?', a: 'Maak een account aan als "Verkoper" via de registratiepagina, of bekijk onze verkoperspagina voor meer info. We reviewen je aanvraag binnen 48 uur.' },
  { cat: 'verkoper', q: 'Wat kost het om verkoper te zijn?', a: 'Details over commissies en kosten worden bekendgemaakt bij de lancering van de webshop. Early access verkopers krijgen speciale voorwaarden.' },
]

export default function ContactPage() {
  const [faqCat, setFaqCat] = useState('all')
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('Algemene vraag')
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState(false)
  const [sending, setSending] = useState(false)
  const obsRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); obsRef.current?.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))
  }, [])

  const toggleFaq = (i: number) => setOpenFaqs(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  const filtered = FAQS.filter(f => faqCat === 'all' || f.cat === faqCat)

  // ✅ Sla bericht op in Supabase contact_messages tabel
  const handleSubmit = async () => {
    if (!name || !email || !message) { setErr(true); return }
    setSending(true)
    setErr(false)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('contact_messages').insert({
        name,
        email,
        subject,
        message,
        status: 'nieuw',
      })
      if (error) throw error

      // ✅ Stuur notificatie naar info@kwispelclub.be
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_bericht',
          to: 'info@kwispelclub.be',
          data: { name, email, subject, message }
        })
      }).catch(() => {}) // niet blokkeren als email faalt

      setSubmitted(true)
    } catch (e) {
      console.error('Contact fout:', e)
      setErr(true)
    } finally {
      setSending(false)
    }
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .hero-wrap{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:36px;padding:56px;text-align:center;color:white}.hero-card h1{font-size:clamp(32px,4vw,48px);margin-bottom:12px}.hero-card p{font-size:17px;opacity:.82;max-width:480px;margin:0 auto}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .methods{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:48px}.method-card{background:var(--white);border-radius:20px;padding:32px 24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.method-card:hover{transform:translateY(-4px);border-color:var(--green-pale)}.method-card .icon{font-size:40px;margin-bottom:14px}.method-card h3{font-size:17px;margin-bottom:6px}.method-card p{font-size:14px;color:var(--text-mid);line-height:1.5;margin-bottom:10px}.method-card a{color:var(--green-main);font-weight:700;font-size:14px;text-decoration:none}
    .contact-layout{display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:start}
    .form-card{background:var(--white);border-radius:28px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,.08)}.form-card h2{font-size:24px;color:var(--green-dark);margin-bottom:24px}
    .field{margin-bottom:18px}.field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:var(--text-dark)}.field input,.field select,.field textarea{width:100%;padding:13px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s;background:var(--white)}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.1)}.field textarea{resize:vertical;min-height:120px}
    .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;border:none;cursor:pointer;transition:all .3s;width:100%}.btn-primary{background:var(--green-main);color:white;box-shadow:0 4px 16px rgba(74,124,63,.3)}.btn-primary:hover{background:var(--green-dark);transform:translateY(-2px)}.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .form-err{background:#FFF0F0;border:1px solid var(--red);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:16px;font-weight:600}
    .form-success{text-align:center;padding:20px 0}.form-success .si{font-size:56px;margin-bottom:12px}.form-success h3{font-size:20px;color:var(--green-dark);margin-bottom:8px}.form-success p{font-size:14px;color:var(--text-mid)}
    .info-cards{display:flex;flex-direction:column;gap:20px}
    .info-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06)}.info-card h3{font-size:17px;color:var(--green-dark);margin-bottom:14px}
    .info-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream-dark);font-size:14px}.info-row:last-child{border-bottom:none}.info-icon{width:36px;height:36px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}.info-row a{color:var(--green-main);font-weight:600;text-decoration:none}
    .faq-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:32px;flex-wrap:wrap}.faq-tab{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-mid)}.faq-tab.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}.faq-tab:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
    .faq-list{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:10px}.faq-item{background:var(--white);border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden}.faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;font-weight:700;font-size:15px;transition:background .2s;gap:12px}.faq-q:hover{background:var(--cream)}.faq-chev{transition:transform .3s;color:var(--text-light);flex-shrink:0}.faq-chev.open{transform:rotate(180deg)}.faq-a{padding:0 24px 20px;font-size:14px;color:var(--text-mid);line-height:1.7}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}.footer-inner a{color:white;text-decoration:none;margin:0 12px}
    .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}.fade-up.visible{opacity:1;transform:translateY(0)}
    @media(max-width:768px){.methods,.contact-layout{grid-template-columns:1fr}.field-row{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="hero-wrap">
        <div className="hero-card">
          <h1>Hoe kunnen we helpen? 💬</h1>
          <p>Stel je vraag, geef feedback of neem contact op. We antwoorden meestal binnen 24 uur.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="methods fade-up">
          {[['📧', 'E-mail', 'Voor algemene vragen en support', 'info@kwispelclub.be', 'mailto:info@kwispelclub.be'],
            ['💬', 'Chat', 'Praat met Kwispel, onze chatbot', 'Open Chatbot →', '/'],
            ['📍', 'Locatie', 'Bree, Limburg, België', 'Over Ons →', '/over-ons']].map(([icon, title, desc, link, href]) => (
            <div key={title} className="method-card">
              <div className="icon">{icon}</div>
              <h3>{title}</h3><p>{desc}</p>
              <a href={href}>{link}</a>
            </div>
          ))}
        </div>

        <div className="contact-layout fade-up">
          <div className="form-card">
            <h2>Stuur ons een Bericht ✉️</h2>
            {submitted ? (
              <div className="form-success">
                <div className="si">✅</div>
                <h3>Bericht Verstuurd!</h3>
                <p>We antwoorden zo snel mogelijk, meestal binnen 24 uur.</p>
              </div>
            ) : (
              <>
                {err && <div className="form-err">⚠️ Vul alle verplichte velden in of probeer opnieuw</div>}
                <div className="field-row">
                  <div className="field"><label>Naam *</label><input placeholder="Jouw naam" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div className="field"><label>E-mailadres *</label><input type="email" placeholder="jan@voorbeeld.be" value={email} onChange={e => setEmail(e.target.value)} /></div>
                </div>
                <div className="field">
                  <label>Onderwerp *</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}>
                    {['Algemene vraag','Probleem melden','Verkoper worden','Kapsalon registreren','Samenwerking / Partnership','Feedback & Suggesties','Privacy & Gegevens','Anders'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field"><label>Bericht *</label><textarea placeholder="Vertel ons hoe we kunnen helpen..." value={message} onChange={e => setMessage(e.target.value)} /></div>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={sending}>
                  {sending ? 'Versturen...' : 'Verstuur Bericht →'}
                </button>
              </>
            )}
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h3>📞 Contactgegevens</h3>
              {[['📧', 'E-mail', <a key="e" href="mailto:info@kwispelclub.be">info@kwispelclub.be</a>],
                ['🔒', 'Privacy vragen', <a key="p" href="mailto:privacy@kwispelclub.be">privacy@kwispelclub.be</a>],
                ['📍', 'Adres', 'Bree, Limburg, België']].map(([icon, label, val]) => (
                <div key={label as string} className="info-row">
                  <div className="info-icon">{icon}</div>
                  <div><strong>{label}</strong><br />{val}</div>
                </div>
              ))}
            </div>
            <div className="info-card">
              <h3>⏰ Reactietijd</h3>
              {[['📧', 'E-mail', 'Binnen 24 uur'],['💬', 'Chatbot', 'Direct (24/7)'],['📝', 'Contactformulier', 'Binnen 48 uur']].map(([icon, label, val]) => (
                <div key={label as string} className="info-row">
                  <div className="info-icon">{icon}</div>
                  <div><strong>{label}</strong><br />{val}</div>
                </div>
              ))}
            </div>
            <div className="info-card" style={{ background: 'var(--green-pale)', border: '2px solid var(--green-main)' }}>
              <h3 style={{ color: 'var(--green-dark)' }}>🏪 Verkoper of Kapsalon?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 12 }}>Wil je producten verkopen of je kapsalon registreren? Bekijk onze speciale pagina.</p>
              <a href="/verkoper" style={{ color: 'var(--green-dark)', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Word Verkoper →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="section-header fade-up"><h2>Veelgestelde Vragen ❓</h2><p>Vind snel een antwoord op je vraag</p></div>
        <div className="faq-tabs fade-up">
          {[['all','Alle'],['account','Account'],['shop','Webshop'],['kapsalon','Kapsalons'],['2dehands','2de Hands'],['verkoper','Verkopers']].map(([id,label]) => (
            <button key={id} className={`faq-tab ${faqCat===id?'active':''}`} onClick={() => setFaqCat(id)}>{label}</button>
          ))}
        </div>
        <div className="faq-list fade-up">
          {filtered.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => toggleFaq(i)}>
                {f.q}<span className={`faq-chev ${openFaqs.has(i)?'open':''}`}>▼</span>
              </div>
              {openFaqs.has(i) && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          © 2026 Kwispelclub. Alle rechten voorbehouden.
          <a href="/">Home</a><a href="/privacy">Privacy</a><a href="/over-ons">Over Ons</a>
        </div>
      </footer>
    </>
  )
}
