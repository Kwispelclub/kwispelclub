'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function VerkoperPage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [type, setType] = useState('Eigenaar / kleine webshop')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email) return
    setLoading(true)
    await supabase.from('early_access').insert({ name, email, type: 'verkoper', notes: `${company} — ${type}` })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .hero{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));padding:72px clamp(16px,4vw,48px);display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center;position:relative;overflow:hidden}
        .hero-content{color:white;position:relative;z-index:2}
        .hero-tag{display:inline-flex;padding:6px 16px;border-radius:50px;background:rgba(255,255,255,.15);font-size:12px;font-weight:700;margin-bottom:18px;color:rgba(255,255,255,.9)}
        .hero-content h1{font-size:clamp(32px,4.5vw,50px);line-height:1.08;margin-bottom:16px}
        .hero-content h1 .accent{color:var(--orange-light)}
        .hero-content p{font-size:17px;opacity:.82;line-height:1.65;margin-bottom:24px;max-width:440px}
        .hero-stats{display:flex;gap:24px;margin-top:20px}
        .hero-stat .num{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:var(--orange-light)}
        .hero-stat .lbl{font-size:12px;opacity:.7}
        .hero-visual{position:relative;z-index:2;display:flex;flex-direction:column;gap:14px}
        .vc{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px;display:flex;align-items:center;gap:14px;transition:all .3s}
        .vc:hover{background:rgba(255,255,255,.15);transform:translateX(4px)}
        .vc-icon{width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .vc-text{color:white}
        .vc-text strong{display:block;font-size:14px;margin-bottom:2px}
        .vc-text span{font-size:12px;opacity:.7}
        .section{max-width:1320px;margin:0 auto;padding:64px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:44px}
        .section-header h2{font-size:clamp(26px,3.5vw,40px);color:var(--green-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .benefit-card{background:var(--white);border-radius:20px;padding:32px 24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}
        .benefit-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
        .benefit-icon{font-size:42px;margin-bottom:14px}
        .benefit-card h3{font-size:17px;color:var(--green-dark);margin-bottom:8px}
        .benefit-card p{font-size:14px;color:var(--text-mid);line-height:1.55}
        .types-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .type-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}
        .type-card:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
        .type-head{padding:28px;text-align:center;background:var(--cream)}
        .type-emoji{font-size:44px;margin-bottom:10px}
        .type-card h3{font-size:18px;margin-bottom:6px}
        .type-desc{font-size:14px;color:var(--text-mid)}
        .type-feats{padding:20px 24px;display:flex;flex-direction:column;gap:8px}
        .type-feat{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-mid)}
        .type-check{color:var(--green-main);font-weight:700}
        .type-cta{padding:0 24px 24px;text-align:center}
        .btn-green{padding:11px 28px;border-radius:50px;background:var(--green-main);color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .2s;box-shadow:0 2px 12px rgba(74,124,63,.2)}
        .btn-green:hover{background:var(--green-dark);transform:translateY(-1px)}
        .how-wrap{background:var(--green-pale);border-radius:24px;padding:48px}
        .how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:32px}
        .how-step{text-align:center;position:relative}
        .how-step::after{content:'→';position:absolute;right:-14px;top:24px;font-size:22px;color:var(--green-light)}
        .how-step:last-child::after{display:none}
        .step-num{width:52px;height:52px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;margin:0 auto 12px;box-shadow:0 4px 12px rgba(74,124,63,.3)}
        .how-step h4{font-size:14px;color:var(--green-dark);margin-bottom:4px}
        .how-step p{font-size:12px;color:var(--text-mid)}
        .cta-section{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:24px;padding:48px;display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:center;color:white}
        .cta-section h2{color:white;font-size:28px;margin-bottom:12px}
        .cta-section > div > p{opacity:.82;font-size:15px;line-height:1.65;margin-bottom:20px}
        .cta-benefits{display:flex;flex-direction:column;gap:10px}
        .cta-benefit{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}
        .cta-b-icon{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .cta-form{background:rgba(255,255,255,.08);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,.1)}
        .form-field{margin-bottom:14px}
        .form-field label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;opacity:.85}
        .form-field input,.form-field select{width:100%;padding:11px 14px;border:2px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .form-field input::placeholder{color:rgba(255,255,255,.35)}
        .form-field input:focus,.form-field select:focus{border-color:var(--orange-light)}
        .form-field select option{background:var(--green-dark)}
        .btn-orange{width:100%;padding:13px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:6px}
        .btn-orange:hover{background:#D4812E;transform:translateY(-1px)}
        .success-box{text-align:center;padding:20px 0}
        footer{background:var(--green-dark);color:white;margin-top:0}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:1024px){.hero,.cta-section{grid-template-columns:1fr}.benefits-grid,.types-grid{grid-template-columns:1fr 1fr}.how-steps{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.benefits-grid,.types-grid{grid-template-columns:1fr}}
      `}</style>

      <Navbar />

      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag">🏪 KWISPELCLUB VERKOPERS</div>
          <h1>Verkoop je <span className="accent">huisdierproducten</span> aan duizenden baasjes</h1>
          <p>Word verkoper op Kwispelclub en bereik een gepassioneerde community van huisdiereigenaren in België en Nederland.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <a href="#aanmelden" style={{ padding: '14px 28px', borderRadius: 50, background: 'var(--orange-main)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(232,145,58,.4)' }}>Start als Verkoper →</a>
          </div>
          <div className="hero-stats">
            {[['12.500+','Geregistreerde leden'],['3','Landen: BE, NL'],['0%','Commissie bij lancering']].map(([num, lbl]) => (
              <div key={lbl} className="hero-stat"><div className="num">{num}</div><div className="lbl">{lbl}</div></div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          {[['📦','Eenvoudig producten uploaden','Foto\'s, beschrijving, prijs — klaar'],['💳','Veilige betalingen via Mollie','Automatisch uitbetaald na levering'],['📊','Inzicht in je statistieken','Verkopen, bezoeken, conversies']].map(([icon, title, desc]) => (
            <div key={title as string} className="vc">
              <div className="vc-icon">{icon}</div>
              <div className="vc-text"><strong>{title as string}</strong><span>{desc as string}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* VOORDELEN */}
      <div className="section">
        <div className="section-header"><h2>Waarom verkopen via Kwispelclub? 🐾</h2><p>Alles wat je nodig hebt om succesvol te verkopen</p></div>
        <div className="benefits-grid">
          {[
            ['👥', 'Bereik je doelgroep', 'Rechtstreeks toegang tot duizenden huisdiereigenaren die actief op zoek zijn naar producten.'],
            ['🔒', 'Veilige betalingen', 'Mollie-integratie zorgt voor veilige betalingen. Jij hoeft je daar niet mee bezig te houden.'],
            ['📊', 'Verkoper Dashboard', 'Beheer je producten, volg je verkopen en communiceer met kopers via jouw persoonlijk dashboard.'],
            ['⭐', 'Reviews & Reputatie', 'Bouw een betrouwbaar profiel op met echte klantreviews. Goed verkopers worden uitgelicht.'],
            ['🇧🇪', 'Lokale focus', 'Kwispelclub richt zich specifiek op België en Nederland — jouw thuismarkt.'],
            ['🆓', 'Gratis te starten', 'Bij lancering betaal je geen maandelijkse kosten. Alleen een kleine commissie per verkoop.'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="benefit-card">
              <div className="benefit-icon">{icon}</div>
              <h3>{title as string}</h3>
              <p>{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TYPES */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header"><h2>Voor welk type verkoper ben jij? 🏪</h2><p>Kwispelclub verwelkomt verkopers van alle groottes</p></div>
        <div className="types-grid">
          {[
            { emoji: '🏠', title: 'Particulier', desc: 'Hobbyist of maker', feats: ['Zelfgemaakte producten', 'Max. 20 producten', 'Geen BTW-verplichting', 'Eenvoudig instappen'], href: '/auth' },
            { emoji: '🏪', title: 'Kleine Webshop', desc: 'Eigenaar met eigen merk', feats: ['Onbeperkt producten', 'Eigen merksectie', 'Prioriteitsondersteuning', 'Analytics dashboard'], href: '/auth' },
            { emoji: '🏭', title: 'Groothandel / Merk', desc: 'B2B of groot assortiment', feats: ['Wholesale prijzen', 'API-integratie', 'Accountmanager', 'Custom contracten'], href: '/contact' },
          ].map(t => (
            <div key={t.title} className="type-card">
              <div className="type-head">
                <div className="type-emoji">{t.emoji}</div>
                <h3>{t.title}</h3>
                <div className="type-desc">{t.desc}</div>
              </div>
              <div className="type-feats">
                {t.feats.map(f => <div key={f} className="type-feat"><span className="type-check">✓</span>{f}</div>)}
              </div>
              <div className="type-cta">
                <a href={t.href} className="btn-green">Aanmelden →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="how-wrap">
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 'clamp(24px,3vw,36px)', color: 'var(--green-dark)', marginBottom: 8 }}>Hoe start je als verkoper? 🚀</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>In 4 stappen live op Kwispelclub</p>
          </div>
          <div className="how-steps">
            {[
              ['1', '📝', 'Aanmelden', 'Vul het formulier in en kies "Verkoper" als rol.'],
              ['2', '✅', 'Review', 'Wij controleren je aanvraag binnen 48 uur.'],
              ['3', '📦', 'Producten Uploaden', 'Voeg je producten toe via je dashboard.'],
              ['4', '💰', 'Verkopen!', 'Je producten zijn live en je begint te verkopen.'],
            ].map(([n, icon, title, desc]) => (
              <div key={n} className="how-step">
                <div className="step-num">{n}</div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                <h4>{title as string}</h4>
                <p>{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA FORM */}
      <div className="section" id="aanmelden" style={{ paddingTop: 0 }}>
        <div className="cta-section">
          <div>
            <h2>Klaar om te starten? 🐾</h2>
            <p>Schrijf je in als early access verkoper en wees er als eerste bij bij de lancering.</p>
            <div className="cta-benefits">
              {[['🆓','Gratis te starten — geen maandelijkse kosten'],['⚡','Early access verkopers krijgen speciale voorwaarden'],['📧','We houden je op de hoogte van de lancering'],['🏆','Jouw merk prominent zichtbaar op het platform']].map(([icon, text]) => (
                <div key={text as string} className="cta-benefit"><div className="cta-b-icon">{icon}</div>{text as string}</div>
              ))}
            </div>
          </div>
          <div className="cta-form">
            {submitted ? (
              <div className="success-box">
                <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, marginBottom: 8 }}>Aanmelding Ontvangen!</h3>
                <p style={{ opacity: .8, fontSize: 14 }}>We nemen contact op via {email}.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, marginBottom: 4, color: 'white' }}>Aanmelden als Verkoper</h3>
                <div style={{ fontSize: 13, opacity: .6, marginBottom: 18, color: 'white' }}>We reviewen je aanvraag binnen 48 uur.</div>
                <div className="form-field"><label>Jouw naam *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Jan Peeters" /></div>
                <div className="form-field"><label>E-mailadres *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@jouwshop.be" /></div>
                <div className="form-field"><label>Bedrijfs- / Winkelnaam</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Jouw winkel" /></div>
                <div className="form-field">
                  <label>Type verkoper</label>
                  <select value={type} onChange={e => setType(e.target.value)}>
                    {['Eigenaar / kleine webshop','Particulier / hobbyist','Groothandel / importeur','Dierenkliniek / dierenwinkel','Andere'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button className="btn-orange" onClick={handleSubmit} disabled={loading || !name || !email}>{loading ? 'Bezig...' : 'Aanmelden als Verkoper →'}</button>
              </>
            )}
          </div>
        </div>
      </div>

      <footer><div className="footer-inner">© 2026 Kwispelclub. <a href="/">Home</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div></footer>
    </>
  )
}
