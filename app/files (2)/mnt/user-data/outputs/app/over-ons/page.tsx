'use client'

import Navbar from '@/components/Navbar'

export default function OverOnsPage() {
  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .hero{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));padding:72px clamp(16px,4vw,48px);text-align:center;color:white;position:relative;overflow:hidden}
        .hero h1{font-size:clamp(36px,5vw,56px);margin-bottom:14px;line-height:1.1}
        .hero h1 .accent{color:var(--orange-light)}
        .hero p{font-size:18px;opacity:.82;max-width:560px;margin:0 auto;line-height:1.65}
        .section{max-width:1320px;margin:0 auto;padding:64px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:44px}
        .section-header h2{font-size:clamp(26px,3.5vw,38px);color:var(--green-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
        .story-text h2{font-size:32px;color:var(--green-dark);margin-bottom:14px}
        .story-text p{font-size:16px;color:var(--text-mid);line-height:1.75;margin-bottom:12px}
        .story-img{border-radius:24px;overflow:hidden;height:380px}
        .story-img img{width:100%;height:100%;object-fit:cover}
        .values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .value-card{background:var(--white);border-radius:20px;padding:32px 24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}
        .value-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
        .value-icon{font-size:44px;margin-bottom:14px}
        .value-card h3{font-size:17px;color:var(--green-dark);margin-bottom:8px}
        .value-card p{font-size:14px;color:var(--text-mid);line-height:1.6}
        .team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .team-card{background:var(--white);border-radius:20px;padding:28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}
        .team-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .team-av{width:88px;height:88px;border-radius:50%;margin:0 auto 14px;overflow:hidden;border:4px solid var(--green-pale)}
        .team-av img{width:100%;height:100%;object-fit:cover}
        .team-av-placeholder{width:88px;height:88px;border-radius:50%;margin:0 auto 14px;border:4px solid var(--green-pale);background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:32px}
        .team-name{font-size:18px;font-weight:700;margin-bottom:4px}
        .team-role{font-size:13px;color:var(--orange-main);font-weight:700;margin-bottom:8px}
        .team-bio{font-size:13px;color:var(--text-mid);line-height:1.6}
        .timeline{max-width:620px;margin:0 auto;position:relative}
        .timeline::before{content:'';position:absolute;left:24px;top:0;bottom:0;width:3px;background:var(--green-pale)}
        .tl-item{display:flex;gap:20px;margin-bottom:28px}
        .tl-dot{width:50px;height:50px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1;box-shadow:0 2px 8px rgba(74,124,63,.3)}
        .tl-content{background:var(--white);border-radius:16px;padding:18px;flex:1;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .tl-date{font-size:12px;color:var(--text-light);font-weight:700;margin-bottom:4px}
        .tl-content h4{font-size:15px;margin-bottom:4px}
        .tl-content p{font-size:13px;color:var(--text-mid);line-height:1.5}
        .cta-banner{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:24px;padding:48px;text-align:center;color:white}
        .cta-banner h2{font-size:28px;margin-bottom:10px;color:white}
        .cta-banner p{opacity:.82;font-size:16px;margin-bottom:22px;max-width:440px;margin-left:auto;margin-right:auto}
        .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .btn-orange{padding:14px 28px;border-radius:50px;background:var(--orange-main);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(232,145,58,.4)}
        .btn-orange:hover{background:#D4812E;transform:translateY(-2px)}
        .btn-white{padding:14px 28px;border-radius:50px;background:rgba(255,255,255,.15);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:1.5px solid rgba(255,255,255,.3);transition:all .3s}
        .btn-white:hover{background:rgba(255,255,255,.25);transform:translateY(-2px)}
        footer{background:var(--green-dark);color:white;margin-top:0}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:768px){.story-grid,.values-grid,.team-grid{grid-template-columns:1fr}}
      `}</style>

      <Navbar />

      <div className="hero">
        <h1>Gebouwd met <span className="accent">passie</span> voor huisdieren</h1>
        <p>Kwispelclub is ontstaan uit een simpel idee: één plek waar elke huisdiereigenaar in België en Nederland terecht kan voor producten, advies en een warme community.</p>
      </div>

      {/* Verhaal */}
      <div className="section">
        <div className="story-grid">
          <div className="story-text">
            <h2>Ons Verhaal 📖</h2>
            <p>Kwispelclub is geboren in Limburg, België — uit de frustratie dat er geen betrouwbaar, alles-in-één platform bestond voor huisdiereigenaren in de Benelux.</p>
            <p>Te veel versnipperde webshops, onbetrouwbare marktplaatsen en een gebrek aan community. Wij wilden dat anders doen: een platform waar je niet alleen premium producten vindt, maar ook deskundig advies, betrouwbare verkopers en een plek om ervaringen te delen.</p>
            <p>Vandaag bouwen we stap voor stap aan dat platform — met de hulp van onze early adopters en de feedback van de community. Kwispelclub is nog jong, maar onze ambitie is groot.</p>
          </div>
          <div className="story-img">
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80" alt="Honden buiten" />
          </div>
        </div>
      </div>

      {/* Waarden */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header"><h2>Onze Waarden 💚</h2><p>Wat ons drijft bij alles wat we doen</p></div>
        <div className="values-grid">
          {[
            ['🐾', 'Dierenwelzijn Eerst', 'Elk product en elke verkoper wordt getoetst op dierenwelzijn. Geen massaproductie, geen schadelijke producten.'],
            ['🤝', 'Vertrouwen & Transparantie', 'Geverifieerde verkopers, eerlijke reviews en open communicatie. Je weet altijd waar je aan toe bent.'],
            ['🌱', 'Duurzaamheid', 'Van onze 2de Hands marktplaats tot biologische producten — we kiezen bewust voor een kleinere footprint.'],
            ['💛', 'Community', 'Kwispelclub is meer dan een webshop. Het is een plek waar baasjes elkaar helpen, tips delen en samen leren.'],
            ['🇧🇪', 'Lokaal & Benelux', 'Gebouwd in België, voor België en Nederland. We kennen de markt en spreken je taal.'],
            ['🚀', 'Constant Verbeteren', 'We luisteren naar feedback en bouwen elke week verder. Kwispelclub wordt samen met jou beter.'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="value-card">
              <div className="value-icon">{icon}</div>
              <h3>{title as string}</h3>
              <p>{desc as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header"><h2>Ons Team 👥</h2><p>De mensen achter Kwispelclub</p></div>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-av"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Marc" /></div>
            <div className="team-name">Marc</div>
            <div className="team-role">Oprichter & Developer</div>
            <div className="team-bio">Bouwt Kwispelclub van A tot Z. Combinatie van techniek en passie voor huisdieren, vanuit Bree, Limburg.</div>
          </div>
          {[
            { emoji: '🐕', name: 'Jij?', role: 'Community Manager', bio: 'We zoeken iemand die onze community mee wil opbouwen. Interesse? Neem contact op!' },
            { emoji: '🐱', name: 'Jij?', role: 'Content & Marketing', bio: 'Op zoek naar iemand met een passie voor huisdieren én content. Freelance of vast.' },
          ].map(m => (
            <div key={m.role} className="team-card" style={{ opacity: 0.5 }}>
              <div className="team-av-placeholder">{m.emoji}</div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
              <div className="team-bio">{m.bio}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header"><h2>Onze Roadmap 🗺️</h2><p>Waar we naartoe werken</p></div>
        <div className="timeline">
          {[
            { dot: '✅', date: 'Q1 2026', title: 'Platform Ontwerp & Prototype', desc: 'Website design, structuur en alle pagina\'s uitgewerkt.' },
            { dot: '🔧', date: 'Q2 2026 — Nu', title: 'Beta Launch op kwispelclub.be', desc: 'Early access registratie, kapsalon-aanmeldingen, community opbouw.' },
            { dot: '🛒', date: 'Q3 2026', title: 'Webshop & Betalingen Live', desc: 'Volledige webshop met Mollie-integratie, eerste verkopers online.' },
            { dot: '🤖', date: 'Q4 2026', title: 'AI Chatbot & Academy', desc: 'Kwispel wordt slim via AI. Volledige Academy met videocursussen.' },
            { dot: '🇳🇱', date: '2027', title: 'Expansie Nederland', desc: 'Volledige uitrol in Nederland met lokale verkopers en kapsalons.' },
          ].map(item => (
            <div key={item.date} className="tl-item">
              <div className="tl-dot">{item.dot}</div>
              <div className="tl-content">
                <div className="tl-date">{item.date}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="cta-banner">
          <h2>Word deel van Kwispelclub 🐾</h2>
          <p>Of je nu koper, verkoper of kapsalon bent — er is een plek voor jou.</p>
          <div className="cta-btns">
            <a href="/auth" className="btn-orange">Account Aanmaken →</a>
            <a href="/contact" className="btn-white">Neem Contact Op</a>
          </div>
        </div>
      </div>

      <footer><div className="footer-inner">© 2026 Kwispelclub. <a href="/">Home</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div></footer>
    </>
  )
}
