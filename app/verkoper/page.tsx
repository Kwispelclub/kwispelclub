'use client'

import { useEffect, useRef } from 'react'

export default function VerkoperPage() {
  const obsRef = useRef<IntersectionObserver | null>(null)
  useEffect(() => {
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); obsRef.current?.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))
  }, [])

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .hero-wrap{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;padding:72px clamp(32px,5vw,80px);display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center;position:relative;overflow:hidden;min-height:440px}
    .hero-content{position:relative;z-index:2;color:white}.hero-tag{display:inline-flex;padding:6px 16px;border-radius:50px;background:rgba(255,255,255,.15);font-size:12px;font-weight:700;margin-bottom:20px;color:rgba(255,255,255,.9)}.hero-content h1{font-size:clamp(34px,4.5vw,52px);line-height:1.08;margin-bottom:18px}.accent{color:var(--orange-light)}.hero-content p{font-size:17px;opacity:.82;line-height:1.65;margin-bottom:28px;max-width:440px}
    .hero-stats{display:flex;gap:24px;margin-top:28px}.stat{text-align:center}.stat .num{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:var(--orange-light)}.stat .lbl{font-size:12px;opacity:.7}
    .blob{position:absolute;border-radius:50%;pointer-events:none}.b1{width:350px;height:350px;background:rgba(232,145,58,.1);top:-100px;right:-50px}.b2{width:200px;height:200px;background:rgba(255,255,255,.05);bottom:-60px;left:20%}
    .hero-visual{position:relative;z-index:2;display:flex;flex-direction:column;gap:16px}.vc{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:20px;backdrop-filter:blur(4px);display:flex;align-items:center;gap:14px;transition:all .3s}.vc:hover{background:rgba(255,255,255,.15);transform:translateX(4px)}.vc-icon{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}.vc-text{color:white}.vc-text strong{display:block;font-size:15px;margin-bottom:2px}.vc-text span{font-size:12px;opacity:.7}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.ben-card{background:var(--white);border-radius:20px;padding:36px 28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.ben-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}.ben-icon{font-size:44px;margin-bottom:16px}.ben-card h3{font-size:18px;color:var(--green-dark);margin-bottom:8px}.ben-card p{font-size:14px;color:var(--text-mid);line-height:1.55}
    .types-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.type-card{background:var(--white);border-radius:28px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.type-card:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}.type-hdr{padding:28px;text-align:center}.type-emoji{font-size:48px;margin-bottom:12px}.type-card h3{font-size:20px;margin-bottom:6px}.type-desc{font-size:14px;color:var(--text-mid)}.type-feats{padding:0 28px 28px;display:flex;flex-direction:column;gap:8px}.feat{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-mid)}.feat .chk{color:var(--green-main);font-weight:700}.type-cta{padding:0 28px 28px;text-align:center}
    .how-section{background:var(--green-pale);border-radius:28px;padding:48px}.how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:36px}.how-step{text-align:center;position:relative}.how-step::after{content:'→';position:absolute;right:-14px;top:28px;font-size:24px;color:var(--green-light)}.how-step:last-child::after{display:none}.step-num{width:56px;height:56px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;margin:0 auto 14px;box-shadow:0 4px 12px rgba(74,124,63,.3)}.how-step h4{font-size:15px;color:var(--green-dark);margin-bottom:6px}.how-step p{font-size:13px;color:var(--text-mid)}
    .cta-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:28px;padding:56px;text-align:center;color:white}.cta-card h2{font-size:32px;margin-bottom:14px;color:white}.cta-card p{opacity:.82;font-size:17px;max-width:480px;margin:0 auto 28px;line-height:1.6}.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:16px 34px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}.btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-outline{background:transparent;border:2px solid var(--green-dark);color:var(--green-dark)}.btn-outline:hover{background:var(--green-dark);color:white}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}.footer-inner a{color:white;text-decoration:none;margin:0 12px}
    .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}.fade-up.visible{opacity:1;transform:translateY(0)}
    @media(max-width:1024px){.hero-card{grid-template-columns:1fr}.hero-visual{display:none}}
    @media(max-width:768px){.benefits-grid,.types-grid,.how-steps{grid-template-columns:1fr}.how-step::after{display:none}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="hero-wrap">
        <div className="hero-card">
          <div className="blob b1"/><div className="blob b2"/>
          <div className="hero-content">
            <div className="hero-tag">🏪 VERKOPEN OP KWISPELCLUB</div>
            <h1>Bereik duizenden <span className="accent">dierenliefhebbers</span></h1>
            <p>Verkoop je huisdierproducten op hét groeiende platform voor België en Nederland. Gratis starten, geen risico.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/auth" className="btn btn-primary">Start Gratis →</a>
              <a href="#how" className="btn btn-white">Hoe werkt het?</a>
            </div>
            <div className="hero-stats">
              {[['12.500+','Doelgroep (gepland)'],['0%','Startkosten'],['BE+NL','Marktgebied']].map(([num,lbl]) => (
                <div key={lbl} className="stat"><div className="num">{num}</div><div className="lbl">{lbl}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            {[['📊','Verkoper Dashboard','Realtime inzicht in verkopen, reviews & stats'],
              ['💬','Beveiligde Chat','Communiceer direct met kopers via het platform'],
              ['💰','Veilige Betalingen','Mollie-integratie — snel en betrouwbaar uitbetaald'],
              ['🔒','Geverifieerd Profiel','Bouw vertrouwen op met een ✓ verified badge']].map(([icon,title,desc]) => (
              <div key={title} className="vc">
                <div className="vc-icon">{icon}</div>
                <div className="vc-text"><strong>{title}</strong><span>{desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-header fade-up"><h2>Waarom Kwispelclub? 💚</h2><p>De voordelen van verkopen op ons platform</p></div>
        <div className="benefits-grid fade-up">
          {[['🎯','Gerichte Doelgroep','Bereik alleen mensen die actief op zoek zijn naar huisdierproducten.'],
            ['🆓','Gratis Starten','Geen vaste maandkosten. Je betaalt alleen een kleine commissie per verkoop.'],
            ['⭐','Bouw Reputatie','Verzamel reviews en verdien je verified badge. Klanten kiezen vertrouwde verkopers.'],
            ['📱','Eigen Dashboard','Beheer producten, bestellingen, berichten en statistieken vanuit één panel.'],
            ['🔒','Veilig Betalen','Mollie verwerkt alle betalingen. Snelle uitbetaling gegarandeerd.'],
            ['📈','Groei Mee','Early adopters krijgen premium positionering en lagere commissie.']].map(([icon,title,desc]) => (
            <div key={title} className="ben-card"><div className="ben-icon">{icon}</div><h3>{title}</h3><p>{desc}</p></div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header fade-up"><h2>Voor Wie? 🤔</h2><p>Kies het type dat bij jou past</p></div>
        <div className="types-grid fade-up">
          {[
            { emoji:'🏪', title:'Webshop / Merk', desc:'Je hebt een bestaand assortiment', feats:['Eigen producten of merken','Bulkupload producten','Branded verkoperspagina','Eigen verzending of dropship'], cta:'Registreer als Verkoper →', ctaHref:'/auth', ctaStyle:{} },
            { emoji:'✂️', title:'Kapsalon / Groomer', desc:'Je biedt trimdiensten aan', feats:['Online boekingssysteem','Klantreviews & ratings','Dienstenbeheer & prijzen','Eerste 3 maanden gratis'], cta:'Registreer als Kapsalon →', ctaHref:'/kapsalons#register', ctaStyle:{background:'var(--green-main)'} },
            { emoji:'🐕‍🦺', title:'Fokker / Kennel', desc:'Je fokt rashonden of -katten', feats:['Geverifieerd fokkersprofiel','Gezondheidscertificaten uploaden','Beveiligde communicatie','Wachtlijst-functionaliteit'], cta:'Binnenkort Beschikbaar', ctaHref:'#', ctaStyle:{background:'transparent',border:'2px solid var(--green-dark)',color:'var(--green-dark)'} },
          ].map(t => (
            <div key={t.title} className="type-card">
              <div className="type-hdr"><div className="type-emoji">{t.emoji}</div><h3>{t.title}</h3><div className="type-desc">{t.desc}</div></div>
              <div className="type-feats">{t.feats.map(f => <div key={f} className="feat"><span className="chk">✓</span>{f}</div>)}</div>
              <div className="type-cta"><a href={t.ctaHref} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:14, padding:'12px', ...t.ctaStyle }}>{t.cta}</a></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="how">
        <div className="how-section fade-up">
          <div className="section-header"><h2>In 4 Stappen Online 🚀</h2></div>
          <div className="how-steps">
            {[['1','Registreer','Maak gratis een verkopersaccount aan op Kwispelclub'],
              ['2','Profiel Opzetten','Voeg je bedrijfsinfo, logo en beschrijving toe'],
              ['3','Producten Toevoegen','Upload foto\'s, prijzen en beschrijvingen'],
              ['4','Verkoop!','Ontvang bestellingen en word uitbetaald via Mollie']].map(([num,title,desc]) => (
              <div key={num} className="how-step"><div className="step-num">{num}</div><h4>{title}</h4><p>{desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-card fade-up">
          <h2>Klaar om te groeien? 🌱</h2>
          <p>Sluit je aan bij de eerste verkopers op Kwispelclub. Early adopters krijgen speciale voorwaarden en premium positionering.</p>
          <div className="cta-btns">
            <a href="/auth" className="btn btn-primary" style={{ fontSize: 17, padding: '16px 36px' }}>Gratis Registreren →</a>
            <a href="/contact" className="btn btn-white">Neem Contact Op</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          © 2026 Kwispelclub.
          <a href="/">Home</a><a href="/over-ons">Over Ons</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a>
        </div>
      </footer>
    </>
  )
}
