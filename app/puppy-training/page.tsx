'use client'

import { useState, useEffect } from 'react'

const MODULES = [
  { id:1, title:'Welkom & Voorbereiding', dur:'15 min', lessons:[{type:'video',title:'Introductie: Wat je kunt verwachten',dur:'5 min',done:true},{type:'article',title:'Checklist: Puppy-proof je huis',dur:'4 min',done:true},{type:'video',title:'De eerste 48 uur met je puppy',dur:'6 min',done:false}] },
  { id:2, title:'Basiscommando\'s: Zit, Lig, Blijf', dur:'22 min', lessons:[{type:'video',title:'Het commando "Zit" aanleren',dur:'7 min',done:false},{type:'video',title:'Van "Zit" naar "Lig"',dur:'6 min',done:false},{type:'video',title:'"Blijf" — Geduld opbouwen',dur:'5 min',done:false},{type:'quiz',title:'Quiz: Test je kennis',dur:'4 min',done:false}] },
  { id:3, title:'Socialisatie & Andere Honden', dur:'18 min', lessons:[{type:'video',title:'Waarom socialisatie zo belangrijk is',dur:'6 min',done:false},{type:'video',title:'De eerste ontmoeting met andere honden',dur:'7 min',done:false},{type:'article',title:'Lichaamstaal lezen: signalen herkennen',dur:'5 min',done:false}] },
  { id:4, title:'Zindelijkheid & Nachtrust', dur:'20 min', lessons:[{type:'video',title:'Zindelijkheidstraining stap voor stap',dur:'8 min',done:false},{type:'video',title:'De bench als veilige plek',dur:'6 min',done:false},{type:'article',title:'Nachtschema voor je puppy',dur:'6 min',done:false}] },
  { id:5, title:'Aan de Lijn Lopen', dur:'16 min', lessons:[{type:'video',title:'Lijntraining: de basis',dur:'8 min',done:false},{type:'video',title:'Trekken afleren — positief bezig',dur:'8 min',done:false}] },
  { id:6, title:'Bijten & Kauwen Afleren', dur:'14 min', lessons:[{type:'video',title:'Waarom bijten normaal is (en wanneer niet)',dur:'5 min',done:false},{type:'video',title:'Bijtremming aanleren',dur:'5 min',done:false},{type:'article',title:'De beste kauwspeeltjes (aanbevolen)',dur:'4 min',done:false}] },
  { id:7, title:'Gevorderde Commando\'s', dur:'24 min', lessons:[{type:'video',title:'"Hier" — Terugroepen op afstand',dur:'8 min',done:false},{type:'video',title:'"Af" en "Laat" commando\'s',dur:'8 min',done:false},{type:'video',title:'Loslopen in het park — wanneer klaar?',dur:'8 min',done:false}] },
  { id:8, title:'Afsluiting & Certificaat', dur:'10 min', lessons:[{type:'video',title:'Samenvatting & volgende stappen',dur:'5 min',done:false},{type:'quiz',title:'Eindtoets',dur:'5 min',done:false}] },
]

const FAQS = [
  { q:'Is deze cursus gratis?', a:'Ja! Alle Academy content is gratis beschikbaar voor Kwispelclub leden. Je hebt alleen een gratis account nodig om je voortgang bij te houden.' },
  { q:'Vanaf welke leeftijd kan ik starten?', a:'Je kunt starten zodra je puppy bij je thuis is, meestal vanaf 8 weken. De eerste modules zijn speciaal gericht op deze vroege fase.' },
  { q:'Werkt dit voor elk ras?', a:'Absoluut! De basisprincipes werken voor elk ras. Bij sommige lessen geven we specifieke tips voor o.a. herders, retrievers en terriërs.' },
  { q:'Krijg ik een certificaat?', a:'Ja, na het voltooien van alle modules en de eindtoets ontvang je een digitaal Kwispelclub Puppy Training certificaat dat je kunt delen.' },
]

export default function PuppyTrainingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([1]))
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())
  const [lessons, setLessons] = useState(() => MODULES.map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l })) })))

  useEffect(() => { window.addEventListener('scroll', () => setScrolled(window.scrollY > 20)) }, [])

  const toggleModule = (id: number) => setOpenModules(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleFaq = (i: number) => setOpenFaqs(prev => { const n = new Set(prev); n.has(i)?n.delete(i):n.add(i); return n })
  const toggleLesson = (mIdx: number, lIdx: number) => {
    setLessons(prev => prev.map((m, mi) => mi===mIdx ? { ...m, lessons: m.lessons.map((l,li) => li===lIdx ? {...l,done:!l.done} : l) } : m))
  }

  const totalLessons = lessons.reduce((sum,m) => sum+m.lessons.length, 0)
  const doneLessons = lessons.reduce((sum,m) => sum+m.lessons.filter(l=>l.done).length, 0)
  const pct = Math.round(doneLessons/totalLessons*100)

  const lessonIcon = (type: string) => type==='video'?{bg:'var(--orange-pale)',color:'var(--orange-main)',icon:'▶'}:type==='quiz'?{bg:'#EDE8F5',color:'#6B4FA0',icon:'❓'}:{bg:'var(--green-pale)',color:'var(--green-dark)',icon:'📄'}

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .beta-bar{background:linear-gradient(90deg,var(--orange-main),#D4812E,var(--orange-main));background-size:200%;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600;animation:shimmer 3s ease infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .navbar{position:sticky;top:0;z-index:100;background:rgba(255,249,240,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:all .3s}.navbar.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:28px}.logo-paw{width:42px;height:42px;border-radius:12px;background:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:22px}.brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--green-dark)}.nav-links{display:flex;gap:2px;list-style:none}.nav-links a{text-decoration:none;color:var(--text-dark);font-weight:600;font-size:14px;padding:8px 16px;border-radius:10px;transition:all .2s}.nav-links a:hover,.nav-links a.active{background:var(--green-pale);color:var(--green-dark)}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--green-main);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;overflow:hidden;position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:400px}
    .hero-content{padding:56px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;width:fit-content}.hero-content h1{font-size:clamp(32px,4vw,48px);color:white;line-height:1.1;margin-bottom:16px}.accent{color:#F5A855}.hero-content p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:28px;max-width:420px}.hero-img{position:relative;overflow:hidden}.hero-img img{width:100%;height:100%;object-fit:cover;mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%);-webkit-mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%)}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}.btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .course-overview{display:grid;grid-template-columns:2fr 1fr;gap:32px;align-items:start}
    .module-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;margin-bottom:16px}.module-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .module-hdr{display:flex;align-items:center;gap:16px;padding:24px;cursor:pointer;transition:background .2s}.module-hdr:hover{background:var(--cream)}.module-num{width:48px;height:48px;border-radius:50%;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:var(--green-dark);flex-shrink:0}.module-hdr h3{font-size:17px;flex:1}.module-dur{font-size:13px;color:var(--text-light);font-weight:600;white-space:nowrap}.module-chev{font-size:18px;transition:transform .3s;color:var(--text-light)}.module-chev.open{transform:rotate(180deg)}
    .module-body{padding:0 24px 24px}.lesson-list{display:flex;flex-direction:column;gap:8px}.lesson-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:var(--cream);font-size:14px;transition:all .2s;cursor:pointer}.lesson-item:hover{background:var(--green-pale)}.lesson-ic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}.lesson-title{flex:1;font-weight:600}.lesson-dur{font-size:12px;color:var(--text-light)}.lesson-chk{width:24px;height:24px;border-radius:50%;border:2px solid var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;transition:all .2s;flex-shrink:0}.lesson-chk.done{background:var(--green-main);border-color:var(--green-main);color:white}
    .course-sidebar{position:sticky;top:96px}.sidebar-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:20px}.sidebar-card h3{font-size:18px;margin-bottom:16px;color:var(--green-dark)}.sidebar-stat{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--cream-dark);font-size:14px}.sidebar-stat:last-child{border-bottom:none}.stat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}.stat-green{background:var(--green-pale)}.stat-orange{background:var(--orange-pale)}.sidebar-stat strong{display:block;font-size:14px}.sidebar-stat span{font-size:12px;color:var(--text-light)}
    .progress-bar{width:100%;height:10px;background:var(--cream-dark);border-radius:50px;overflow:hidden;margin:12px 0 8px}.progress-fill{height:100%;background:linear-gradient(90deg,var(--green-main),var(--green-light));border-radius:50px;transition:width .5s ease}.progress-text{font-size:13px;color:var(--text-mid);font-weight:600}
    .trainer-card{display:flex;align-items:center;gap:14px;padding:16px;background:var(--cream);border-radius:12px;margin-top:16px}.trainer-av{width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0}.trainer-av img{width:100%;height:100%;object-fit:cover}.trainer-name{font-weight:700;font-size:15px}.trainer-role{font-size:12px;color:var(--text-light)}
    .tips-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.tip-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}.tip-card:hover{transform:translateY(-4px)}.tip-num{width:40px;height:40px;border-radius:50%;background:var(--orange-pale);display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--orange-main);margin-bottom:16px}.tip-card h4{font-size:16px;margin-bottom:8px}.tip-card p{font-size:14px;color:var(--text-mid);line-height:1.55}
    .faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.faq-item{background:var(--white);border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden}.faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;font-weight:700;font-size:15px;transition:background .2s}.faq-q:hover{background:var(--cream)}.faq-chev{font-size:16px;transition:transform .3s;color:var(--text-light)}.faq-chev.open{transform:rotate(180deg)}.faq-a{padding:0 24px 20px;font-size:14px;color:var(--text-mid);line-height:1.65}
    .cta-section{max-width:1320px;margin:0 auto;padding:0 clamp(16px,4vw,48px) 80px}.cta-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;padding:56px 48px;color:white;text-align:center}.cta-card h2{font-size:clamp(26px,3vw,38px);margin-bottom:14px;color:white}.cta-card p{font-size:16px;opacity:.82;max-width:460px;margin:0 auto 28px;line-height:1.6}.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}.footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:white}.footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px;transition:opacity .2s}.footer-links a:hover{opacity:1}.footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:1024px){.course-overview{grid-template-columns:1fr}.course-sidebar{position:static}.hero-card{grid-template-columns:1fr}.hero-img{display:none}.tips-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:768px){.nav-links{display:none}.tips-grid{grid-template-columns:1fr}.hero-content{padding:36px 24px}}
  `

  return (
    <>
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      

      <div className="breadcrumb"><a href="/">Home</a> › <a href="/#academy">Academy</a> › Puppy Training</div>

      <section className="page-hero">
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-tag">🎓 KWISPELCLUB ACADEMY</div>
            <h1>Puppy <span className="accent">Training</span> Basics</h1>
            <p>Leer je puppy de basisbegrippen van gehoorzaamheid, socialisatie en goede gewoontes. Van eerste commando's tot loslopen in het park.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="#modules" className="btn btn-primary">Start de cursus →</a>
              <a href="#tips" className="btn btn-white">Bekijk tips</a>
            </div>
          </div>
          <div className="hero-img">
            <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80" alt="Puppy training" />
          </div>
        </div>
      </section>

      <section className="section" id="modules">
        <div className="course-overview">
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{fontSize:'clamp(28px,3.5vw,42px)',color:'var(--green-dark)',marginBottom:8}}>Cursus Modules 📚</h2>
              <p style={{color:'var(--text-mid)',fontSize:16}}>8 modules, 24 lessen — van beginner tot baas</p>
            </div>
            {lessons.map((m, mIdx) => (
              <div key={m.id} className="module-card">
                <div className="module-hdr" onClick={() => toggleModule(m.id)}>
                  <div className="module-num">{m.id}</div>
                  <h3>{m.title}</h3>
                  <span className="module-dur">{m.dur}</span>
                  <span className={`module-chev ${openModules.has(m.id)?'open':''}`}>▼</span>
                </div>
                {openModules.has(m.id) && (
                  <div className="module-body">
                    <div className="lesson-list">
                      {m.lessons.map((l, lIdx) => {
                        const ic = lessonIcon(l.type)
                        return (
                          <div key={lIdx} className="lesson-item">
                            <div className="lesson-ic" style={{background:ic.bg,color:ic.color}}>{ic.icon}</div>
                            <div className="lesson-title">{l.title}</div>
                            <div className="lesson-dur">{l.dur}</div>
                            <div className={`lesson-chk ${l.done?'done':''}`} onClick={() => toggleLesson(mIdx, lIdx)}>{l.done?'✓':''}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="course-sidebar">
            <div className="sidebar-card">
              <h3>Jouw Voortgang</h3>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
              <div className="progress-text">{pct}% voltooid ({doneLessons}/{totalLessons} lessen)</div>
              <div className="sidebar-stat"><div className="stat-icon stat-green">📚</div><div><strong>8 Modules</strong><span>24 lessen totaal</span></div></div>
              <div className="sidebar-stat"><div className="stat-icon stat-orange">⏱️</div><div><strong>~2,5 uur</strong><span>Totale duur</span></div></div>
              <div className="sidebar-stat"><div className="stat-icon stat-green">🏆</div><div><strong>Certificaat</strong><span>Bij voltooiing</span></div></div>
              <div className="sidebar-stat"><div className="stat-icon stat-orange">📱</div><div><strong>Mobiel Vriendelijk</strong><span>Leer waar je wilt</span></div></div>
            </div>
            <div className="sidebar-card">
              <h3>Jouw Trainer</h3>
              <div className="trainer-card">
                <div className="trainer-av" style={{background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>👩‍🏫</div>
                <div><div className="trainer-name">Voorbeeldtrainer</div><div className="trainer-role">Gecertificeerd Hondentrainer · Illustratief profiel</div></div>
              </div>
              <p style={{fontSize:13,color:'var(--text-mid)',marginTop:14,lineHeight:1.55}}>⚠️ <em>Voorbeeldprofiel</em> — Echte trainers worden toegevoegd zodra de Academy live gaat.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="tips">
        <div className="section-header"><h2>5 Gouden Puppy Tips 💡</h2><p>De belangrijkste dingen om te onthouden bij de opvoeding van je puppy</p></div>
        <div className="tips-grid">
          {[['1','Wees consequent','Gebruik altijd dezelfde commando\'s en regels. Inconsequentie is de #1 fout bij puppy training.'],['2','Kort & positief trainen','Houd sessies kort (5-10 min) en eindig altijd op een positieve noot met een beloning.'],['3','Socialiseer vroeg','De eerste 16 weken zijn cruciaal. Laat je puppy zoveel mogelijk geluiden, mensen en dieren ervaren.'],['4','Geduld, geduld, geduld','Elke puppy leert in zijn eigen tempo. Straf nooit — beloon gewenst gedrag.'],['5','Maak het leuk!','Training moet een spel zijn. Een blije puppy leert 3x sneller dan een gestresste.']].map(([num,title,desc]) => (
            <div key={num} className="tip-card">
              <div className="tip-num">{num}</div>
              <h4>{title}</h4><p>{desc}</p>
            </div>
          ))}
          <div className="tip-card" style={{background:'var(--green-pale)',border:'2px dashed var(--green-main)'}}>
            <div className="tip-num" style={{background:'var(--green-main)',color:'white'}}>💬</div>
            <h4>Vraag het de community</h4>
            <p>Vastgelopen? Stel je vraag in het Kwispelclub forum en krijg advies van ervaren baasjes.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><h2>Veelgestelde Vragen ❓</h2></div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => toggleFaq(i)}>
                {f.q}<span className={`faq-chev ${openFaqs.has(i)?'open':''}`}>▼</span>
              </div>
              {openFaqs.has(i) && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <div className="cta-section">
        <div className="cta-card">
          <h2>Klaar om te beginnen? 🐾</h2>
          <p>Maak een gratis account aan en start vandaag nog met de puppy training cursus.</p>
          <div className="cta-btns">
            <a href="#modules" className="btn btn-primary">Start de cursus →</a>
            <a href="/#academy" className="btn btn-white">Meer Academy cursussen</a>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="b">Kwispelclub</span></a>
          <div className="footer-links"><a href="/">Home</a><a href="/#shop">Shop</a><a href="/#academy">Academy</a><a href="/kapsalons">Kapsalons</a></div>
          <div className="footer-copy">© 2026 Kwispelclub. Alle rechten voorbehouden. 🇧🇪 België & 🇳🇱 Nederland</div>
        </div>
      </footer>
    </>
  )
}
