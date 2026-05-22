'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

export default function OverOnsClient() {
  const obsRef = useRef<IntersectionObserver | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const [teamleden, setTeamleden] = useState<any[]>([])

  useEffect(() => {
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); obsRef.current?.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))

    // Laad team
    supabase.from('team_members').select('*').eq('actief', true).order('volgorde').then(({ data }) => {
      setTeamleden(data || [])
    })
  }, [])

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .hero-wrap{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;padding:72px clamp(32px,5vw,80px);text-align:center;color:white;position:relative;overflow:hidden}.hero-card h1{font-size:clamp(36px,5vw,56px);margin-bottom:16px;line-height:1.1}.accent{color:var(--orange-light)}.hero-card p{font-size:18px;opacity:.82;max-width:560px;margin:0 auto;line-height:1.65}.blob{position:absolute;border-radius:50%;pointer-events:none}.b1{width:300px;height:300px;background:rgba(232,145,58,.1);top:-100px;right:-60px}.b2{width:200px;height:200px;background:rgba(255,255,255,.05);bottom:-60px;left:15%}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}.story-text h2{font-size:32px;color:var(--green-dark);margin-bottom:16px}.story-text p{font-size:16px;color:var(--text-mid);line-height:1.75;margin-bottom:14px}.story-img{border-radius:28px;overflow:hidden;height:400px}.story-img img{width:100%;height:100%;object-fit:cover}
    .values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.val-card{background:var(--white);border-radius:20px;padding:36px 28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.val-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}.val-icon{font-size:48px;margin-bottom:16px}.val-card h3{font-size:18px;color:var(--green-dark);margin-bottom:10px}.val-card p{font-size:14px;color:var(--text-mid);line-height:1.6}
    .team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .team-card{background:var(--white);border-radius:20px;padding:32px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}.team-card:hover{transform:translateY(-4px)}
    .team-card.placeholder{opacity:.5}
    .team-av{width:90px;height:90px;border-radius:50%;margin:0 auto 16px;overflow:hidden;border:4px solid var(--green-pale);background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:36px}
    .team-av img{width:100%;height:100%;object-fit:cover}
    .team-name{font-size:18px;font-weight:700;margin-bottom:4px}.team-role{font-size:13px;color:var(--orange-main);font-weight:700;margin-bottom:10px}.team-bio{font-size:13px;color:var(--text-mid);line-height:1.6}
    .timeline{max-width:640px;margin:0 auto;position:relative}.timeline::before{content:'';position:absolute;left:24px;top:0;bottom:0;width:3px;background:var(--green-pale)}.tl-item{display:flex;gap:20px;margin-bottom:32px;position:relative}.tl-dot{width:50px;height:50px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;z-index:1;box-shadow:0 2px 8px rgba(74,124,63,.3)}.tl-content{background:var(--white);border-radius:20px;padding:20px;flex:1;box-shadow:0 2px 8px rgba(0,0,0,.06)}.tl-date{font-size:12px;color:var(--text-light);font-weight:700;margin-bottom:6px}.tl-content h4{font-size:16px;margin-bottom:4px}.tl-content p{font-size:14px;color:var(--text-mid);line-height:1.5}
    .cta-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:28px;padding:48px;text-align:center;color:white}.cta-card h2{font-size:28px;margin-bottom:12px;color:white}.cta-card p{opacity:.82;font-size:16px;margin-bottom:24px;max-width:460px;margin-left:auto;margin-right:auto}.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}.btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}.footer-inner a{color:white;text-decoration:none;margin:0 12px}
    .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}.fade-up.visible{opacity:1;transform:translateY(0)}
    @media(max-width:768px){.story-grid,.values-grid,.team-grid{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="hero-wrap">
        <div className="hero-card">
          <div className="blob b1" /><div className="blob b2" />
          <h1>Gebouwd met <span className="accent">passie</span> voor huisdieren</h1>
          <p>Kwispelclub is ontstaan uit een simpel idee: één plek waar elke huisdiereigenaar in België en Nederland terecht kan voor producten, advies en een warme community.</p>
        </div>
      </div>

      <section className="section">
        <div className="story-grid fade-up">
          <div className="story-text">
            <h2>Ons Verhaal 📖</h2>
            <p>Kwispelclub is geboren in Limburg, België — uit de frustratie dat er geen betrouwbaar, alles-in-één platform bestond voor huisdiereigenaren in de Benelux.</p>
            <p>Te veel versnipperde webshops, onbetrouwbare marktplaatsen en een gebrek aan community. Wij wilden dat anders doen: een platform waar je niet alleen premium producten vindt, maar ook deskundig advies, betrouwbare verkopers en een plek om ervaringen te delen.</p>
            <p>Vandaag bouwen we stap voor stap aan dat platform — met de hulp van onze early adopters en de feedback van de community.</p>
          </div>
          <div className="story-img">
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80" alt="Honden samen buiten" />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header fade-up"><h2>Onze Waarden 💚</h2><p>Wat ons drijft bij alles wat we doen</p></div>
        <div className="values-grid fade-up">
          {[
            ['🐾','Dierenwelzijn Eerst','Elk product en elke verkoper wordt getoetst op dierenwelzijn. Geen massaproductie, geen schadelijke producten.'],
            ['🤝','Vertrouwen & Transparantie','Geverifieerde verkopers, eerlijke reviews en open communicatie. Je weet altijd waar je aan toe bent.'],
            ['🌱','Duurzaamheid','Van onze 2de Hands marktplaats tot biologische producten — we kiezen bewust voor een kleinere footprint.'],
            ['💛','Community','Kwispelclub is meer dan een webshop. Het is een plek waar baasjes elkaar helpen, tips delen en samen leren.'],
            ['🇧🇪','Lokaal & Benelux','Gebouwd in België, voor België en Nederland. We kennen de markt en spreken je taal.'],
            ['🚀','Constant Verbeteren','We luisteren naar feedback en bouwen elke week verder. Kwispelclub wordt samen met jou beter.'],
          ].map(([icon,title,desc]) => (
            <div key={title} className="val-card"><div className="val-icon">{icon}</div><h3>{title}</h3><p>{desc}</p></div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header fade-up"><h2>Ons Team 👥</h2><p>De mensen achter Kwispelclub</p></div>
        <div className="team-grid fade-up">
          {teamleden.map(lid => (
            <div key={lid.id} className={`team-card ${lid.is_placeholder ? 'placeholder' : ''}`}>
              <div className="team-av">
                {lid.foto_url
                  ? <img src={lid.foto_url} alt={lid.naam} />
                  : <span>{lid.is_placeholder ? (lid.rol.includes('Community') ? '🐕' : '🐱') : '👤'}</span>
                }
              </div>
              <div className="team-name">{lid.naam}</div>
              <div className="team-role">{lid.rol}</div>
              <div className="team-bio">{lid.bio}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header fade-up"><h2>Onze Roadmap 🗺️</h2><p>Waar we naartoe werken</p></div>
        <div className="timeline fade-up">
          {[
            ['✅','Q1 2026','Platform Ontwerp & Prototype','Website design, structuur en alle pagina\'s uitgewerkt.'],
            ['🔧','Q2 2026 — Nu','Beta Launch op kwispelclub.be','Early access registratie, kapsalon-aanmeldingen, community opbouw.'],
            ['🛒','Q3 2026','Webshop & Betalingen Live','Volledige webshop met Mollie-integratie, eerste verkopers online.'],
            ['🤖','Q4 2026','AI Chatbot & Academy','Kwispel wordt slim via AI. Volledige Academy met videocursussen.'],
            ['🇳🇱','2027','Expansie Nederland','Volledige uitrol in Nederland met lokale verkopers en kapsalons.'],
          ].map(([dot,date,title,desc]) => (
            <div key={title} className="tl-item">
              <div className="tl-dot">{dot}</div>
              <div className="tl-content"><div className="tl-date">{date}</div><h4>{title}</h4><p>{desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-card fade-up">
          <h2>Word deel van Kwispelclub 🐾</h2>
          <p>Of je nu koper, verkoper of kapsalon bent — er is een plek voor jou.</p>
          <div className="cta-btns">
            <a href="/auth" className="btn btn-primary">Account Aanmaken →</a>
            <a href="/contact" className="btn btn-white">Neem Contact Op</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          © 2026 Kwispelclub. Alle rechten voorbehouden.
          <a href="/">Home</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a>
        </div>
      </footer>
    </>
  )
}
