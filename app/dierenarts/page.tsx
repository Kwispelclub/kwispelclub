'use client'

import { useState } from 'react'

const TIPS = [
  { icon: '🚨', title: 'Spoed?', desc: 'Bel eerst! Veel klinieken hebben een spoedlijn. Vermeld altijd het ras, gewicht en symptomen.' },
  { icon: '📋', title: 'Voorbereiding', desc: 'Breng vaccinatieboekje, medicijnenlijst en beschrijf symptomen zo precies mogelijk.' },
  { icon: '⏰', title: 'Buiten kantooruren', desc: 'Zoek op "spoedkliniek dieren [jouw stad]" voor nachtelijke hulp of weekendwacht.' },
  { icon: '💊', title: 'Giftige stoffen', desc: 'Chocolade, druiven, uien en xylitol zijn giftig voor honden. Bel direct bij inname.' },
]

const LINKS = [
  { icon: '🏛️', title: 'Orde der Dierenartsen', desc: 'Officiële orde van Belgische dierenartsen', href: 'https://www.ordev.be/nl' },
  { icon: '🇧🇪', title: 'FAVV België', desc: 'Federaal Agentschap voor Voedselveiligheid', href: 'https://www.favv-afsca.be' },
  { icon: '🇳🇱', title: 'KNMvD Nederland', desc: 'Koninklijke Nederlandse Maatschappij voor Diergeneeskunde', href: 'https://www.knmvd.nl' },
  { icon: '💉', title: 'Vergiftiging Hond', desc: 'Info over vergiftiging bij honden', href: 'https://www.antigifcentrum.be/natuur/dieren/vergiftiging-van-dieren' },
  { icon: '🐱', title: 'Vergiftiging Kat', desc: 'Giftige stoffen voor katten', href: 'https://www.antigifcentrum.be/natuur/dieren/vergiftiging-van-dieren' },
  { icon: '☎️', title: 'Antigifcentrum', desc: 'Bij vergiftiging: 070 245 245 (BE)', href: 'tel:070245245' },
]

export default function DierenartsPagina() {
  const [stad, setStad] = useState('')
  const [zoekStad, setZoekStad] = useState('België')

  const handleZoek = () => {
    if (stad.trim()) setZoekStad(stad.trim())
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--green-main);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px) 0}
    .hero-card{background:linear-gradient(135deg,#1a5276,#2471a3,var(--teal));border-radius:36px;overflow:hidden;position:relative;padding:56px clamp(24px,5vw,80px);display:flex;flex-direction:column;align-items:center;text-align:center}
    .blob{position:absolute;border-radius:50%;pointer-events:none}
    .b1{width:350px;height:350px;background:rgba(255,255,255,.06);top:-100px;right:-60px}
    .b2{width:200px;height:200px;background:rgba(42,157,143,.15);bottom:-60px;left:10%}
    .hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;position:relative;z-index:2}
    .hero-card h1{font-size:clamp(32px,4vw,52px);color:white;line-height:1.1;margin-bottom:16px;position:relative;z-index:2}
    .hero-card p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;max-width:520px;margin-bottom:32px;position:relative;z-index:2}
    .search-box{display:flex;gap:10px;max-width:540px;width:100%;position:relative;z-index:2}
    .search-box input{flex:1;padding:16px 20px;border-radius:50px;border:none;font-family:'Nunito',sans-serif;font-size:15px;outline:none;box-shadow:0 4px 20px rgba(0,0,0,.15)}
    .search-box button{padding:16px 28px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
    .search-box button:hover{background:#D4812E;transform:translateY(-2px)}
    .spoed-banner{max-width:1320px;margin:20px auto 0;padding:0 clamp(16px,4vw,48px)}
    .spoed-inner{background:linear-gradient(135deg,#922b21,#c0392b);border-radius:16px;padding:16px 24px;display:flex;align-items:center;gap:16px;color:white;flex-wrap:wrap}
    .spoed-icon{font-size:28px;flex-shrink:0}
    .spoed-inner strong{font-size:15px;display:block;margin-bottom:2px}
    .spoed-inner span{font-size:13px;opacity:.85}
    .spoed-tel{margin-left:auto;padding:10px 20px;border-radius:50px;background:rgba(255,255,255,.15);color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;border:1.5px solid rgba(255,255,255,.3);white-space:nowrap;transition:all .2s}
    .spoed-tel:hover{background:rgba(255,255,255,.25)}
    .map-section{max-width:1320px;margin:28px auto 0;padding:0 clamp(16px,4vw,48px)}
    .map-card{background:var(--white);border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .map-header{padding:20px 24px;border-bottom:2px solid var(--cream-dark);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
    .map-header h2{font-size:18px;color:var(--text-dark)}
    .map-header p{font-size:13px;color:var(--text-light)}
    .map-tag{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:50px;background:var(--teal-pale);color:var(--teal);font-size:12px;font-weight:700}
    .map-iframe{width:100%;height:520px;border:none;display:block}
    .map-notice{padding:12px 24px;background:var(--cream);font-size:12px;color:var(--text-light);font-weight:600;text-align:center}
    .section{max-width:1320px;margin:0 auto;padding:56px clamp(16px,4vw,48px)}
    .tips-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    .tip-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}
    .tip-card:hover{transform:translateY(-4px);box-shadow:0 6px 24px rgba(0,0,0,.1)}
    .tip-icon{font-size:36px;margin-bottom:14px}
    .tip-card h4{font-size:16px;margin-bottom:8px;color:var(--text-dark)}
    .tip-card p{font-size:13px;color:var(--text-mid);line-height:1.6}
    .links-section{background:var(--green-pale);border-radius:28px;padding:40px 48px;margin:0 auto 56px;max-width:1320px}
    .links-section h2{font-size:24px;color:var(--green-dark);margin-bottom:6px}
    .links-section p{font-size:14px;color:var(--text-mid);margin-bottom:24px}
    .links-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .link-card{background:var(--white);border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:12px;text-decoration:none;transition:all .2s;box-shadow:0 1px 4px rgba(0,0,0,.04)}
    .link-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.08);background:var(--green-pale)}
    .link-icon{width:40px;height:40px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .link-info strong{display:block;font-size:14px;color:var(--text-dark);margin-bottom:2px}
    .link-info span{font-size:12px;color:var(--text-light)}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}.footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:white}.footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px;transition:opacity .2s}.footer-links a:hover{opacity:1}.footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:1024px){.tips-grid{grid-template-columns:repeat(2,1fr)}.links-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:768px){.tips-grid{grid-template-columns:1fr}.links-grid{grid-template-columns:1fr}.search-box{flex-direction:column}.spoed-tel{margin-left:0;width:100%;text-align:center}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="breadcrumb"><a href="/">Home</a> &rsaquo; Dierenarts Zoeken</div>

      <div className="page-hero">
        <div className="hero-card">
          <div className="blob b1"/><div className="blob b2"/>
          <div className="hero-tag">🏥 KWISPELCLUB DIERENARTS FINDER</div>
          <h1>Vind een Dierenarts<br/>bij jou in de buurt</h1>
          <p>Zoek gecertificeerde dierenartsen en dierenkliniken in België en Nederland. Snel, makkelijk en betrouwbaar.</p>
          <div className="search-box">
            <input
              placeholder="Vul je stad of gemeente in..."
              value={stad}
              onChange={e => setStad(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleZoek()}
            />
            <button onClick={handleZoek}>🔍 Zoeken</button>
          </div>
        </div>
      </div>

      <div className="spoed-banner">
        <div className="spoed-inner">
          <div className="spoed-icon">🚨</div>
          <div>
            <strong>Spoedgeval? Bel de spoedlijn!</strong>
            <span>Bij levensgevaar: zoek de dichtstbijzijnde spoedkliniek of bel de wachtdienst dierenartsen.</span>
          </div>
          <a href="tel:070245245" className="spoed-tel">📞 070 245 245 (BE)</a>
        </div>
      </div>

      <div className="map-section">
        <div className="map-card">
          <div className="map-header">
            <div>
              <h2>Dierenartsen in {zoekStad} 📍</h2>
              <p>Klik op een locatie voor adres, telefoonnummer en openingsuren</p>
            </div>
            <span className="map-tag">🗺️ Via Google Maps</span>
          </div>
          <iframe
            className="map-iframe"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyB-mTCsAuoGU76UVEM-mDz2BKmB5pHUL7A&q=dierenarts+${encodeURIComponent(zoekStad)}&language=nl&region=BE`}
          />
          <div className="map-notice">
            💡 Tip: Klik op "Bekijk grotere kaart" voor routebeschrijving en extra info
          </div>
        </div>
      </div>

      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: 'var(--green-dark)', marginBottom: 8 }}>Handige Tips 💡</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Wat je moet weten voor je naar de dierenarts gaat</p>
        </div>
        <div className="tips-grid">
          {TIPS.map(t => (
            <div key={t.title} className="tip-card">
              <div className="tip-icon">{t.icon}</div>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="links-section">
        <h2>Nuttige Links 🔗</h2>
        <p>Officiële organisaties en informatie over dierengezondheid in België en Nederland</p>
        <div className="links-grid">
          {LINKS.map(l => (
            <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card">
              <div className="link-icon">{l.icon}</div>
              <div className="link-info">
                <strong>{l.title}</strong>
                <span>{l.desc}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="b">Kwispelclub</span></a>
          <div className="footer-links"><a href="/">Home</a><a href="/kapsalons">Kapsalons</a><a href="/puppy-training">Academy</a><a href="/2dehands">2de Hands</a></div>
          <div className="footer-copy">© 2026 Kwispelclub. Alle rechten voorbehouden. 🇧🇪 België &amp; 🇳🇱 Nederland</div>
        </div>
      </footer>
    </>
  )
}
