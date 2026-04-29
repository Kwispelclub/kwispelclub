'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const FAQS = [
  { q:'Is deze cursus gratis?', a:'Dat hangt af van de cursus. Sommige cursussen zijn gratis, andere zijn betalend. Bekijk de cursuspagina voor meer info.' },
  { q:'Vanaf welke leeftijd kan ik starten?', a:'Je kunt starten zodra je puppy bij je thuis is, meestal vanaf 8 weken. De eerste modules zijn speciaal gericht op deze vroege fase.' },
  { q:'Werkt dit voor elk ras?', a:'Absoluut! De basisprincipes werken voor elk ras. Bij sommige lessen geven we specifieke tips voor o.a. herders, retrievers en terriërs.' },
  { q:'Krijg ik een certificaat?', a:'Ja, na het voltooien van alle modules en de eindtoets ontvang je een digitaal Kwispelclub certificaat.' },
]

export default function PuppyTrainingPage() {
  const supabase = createClient()
  const [trainers, setTrainers] = useState<any[]>([])
  const [cursussen, setCursussen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      supabase.from('academy_verkopers').select('*').eq('status', 'actief').order('volgorde'),
      supabase.from('cursussen')
        .select('*, cursus_modules(*, cursus_lessen(*))')
        .eq('gepubliceerd', true)
        .order('volgorde'),
    ]).then(([{ data: t }, { data: c }]) => {
      setTrainers(t || [])
      setCursussen((c || []).map((cursus: any) => ({
        ...cursus,
        cursus_modules: (cursus.cursus_modules || [])
          .sort((a: any, b: any) => a.volgorde - b.volgorde)
          .map((m: any) => ({
            ...m,
            cursus_lessen: (m.cursus_lessen || []).sort((a: any, b: any) => a.volgorde - b.volgorde)
          }))
      })))
      setLoading(false)
    })
  }, [])

  const toggleFaq = (i: number) => setOpenFaqs(prev => { const n = new Set(prev); n.has(i)?n.delete(i):n.add(i); return n })

  const lessonIcon = (type: string) => type==='video'
    ? {bg:'var(--orange-pale)',color:'var(--orange-main)',icon:'▶'}
    : type==='quiz'
    ? {bg:'#EDE8F5',color:'#6B4FA0',icon:'❓'}
    : {bg:'var(--green-pale)',color:'var(--green-dark)',icon:'📄'}

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--green-main);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;overflow:hidden;position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:400px}
    .hero-content{padding:56px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;width:fit-content}.hero-content h1{font-size:clamp(32px,4vw,48px);color:white;line-height:1.1;margin-bottom:16px}.accent{color:#F5A855}.hero-content p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:28px;max-width:420px}.hero-img{position:relative;overflow:hidden}.hero-img img{width:100%;height:100%;object-fit:cover;mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%);-webkit-mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%)}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}.btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .cursussen-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px}
    .cursus-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer;text-decoration:none;display:block}
    .cursus-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
    .cursus-thumb{width:100%;aspect-ratio:16/9;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:48px;overflow:hidden}
    .cursus-thumb img{width:100%;height:100%;object-fit:cover}
    .cursus-body{padding:20px}
    .cursus-tags{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
    .cursus-tag{padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700}
    .tag-gratis{background:var(--teal-pale);color:var(--teal)}
    .tag-betaald{background:var(--orange-pale);color:var(--orange-main)}
    .cursus-titel{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--text-dark);margin-bottom:6px}
    .cursus-desc{font-size:13px;color:var(--text-mid);line-height:1.55;margin-bottom:14px}
    .cursus-meta{display:flex;gap:14px;font-size:12px;color:var(--text-light);font-weight:600}
    .cursus-prijs{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--green-dark);margin-top:10px}
    .cursus-prijs.gratis{color:var(--teal)}
    .trainers-section{background:var(--teal-pale);border-radius:28px;padding:48px;margin-bottom:0}
    .trainers-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:32px}
    .trainer-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;gap:18px;align-items:flex-start;transition:all .3s}
    .trainer-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,0,0,.1)}
    .trainer-av{width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:28px;border:3px solid var(--teal-pale)}
    .trainer-av img{width:100%;height:100%;object-fit:cover}
    .trainer-naam{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--text-dark);margin-bottom:2px}
    .trainer-spec{display:inline-flex;padding:3px 10px;border-radius:50px;background:var(--teal-pale);color:var(--teal);font-size:11px;font-weight:700;margin-bottom:10px}
    .trainer-bio{font-size:13px;color:var(--text-mid);line-height:1.6;margin-bottom:12px}
    .trainer-placeholder{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center;border:2px dashed rgba(42,157,143,.3)}
    .trainer-placeholder p{font-size:14px;color:var(--text-mid);margin-bottom:16px}
    .btn-trainer{display:inline-flex;padding:12px 24px;border-radius:50px;background:var(--teal);color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s}
    .btn-trainer:hover{background:#1a7a6e;transform:translateY(-2px)}
    .faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.faq-item{background:var(--white);border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden}.faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;font-weight:700;font-size:15px;transition:background .2s}.faq-q:hover{background:var(--cream)}.faq-chev{font-size:16px;transition:transform .3s;color:var(--text-light)}.faq-chev.open{transform:rotate(180deg)}.faq-a{padding:0 24px 20px;font-size:14px;color:var(--text-mid);line-height:1.65}
    .cta-section{max-width:1320px;margin:0 auto;padding:0 clamp(16px,4vw,48px) 80px}.cta-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;padding:56px 48px;color:white;text-align:center}.cta-card h2{font-size:clamp(26px,3vw,38px);margin-bottom:14px;color:white}.cta-card p{font-size:16px;opacity:.82;max-width:460px;margin:0 auto 28px;line-height:1.6}.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .empty-state{text-align:center;padding:48px;color:var(--text-light);font-size:15px}
    .empty-state .ei{font-size:40px;margin-bottom:12px;opacity:.4}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}.footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:white}.footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px;transition:opacity .2s}.footer-links a:hover{opacity:1}.footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:1024px){.hero-card{grid-template-columns:1fr}.hero-img{display:none}}
    @media(max-width:768px){.hero-content{padding:36px 24px}.trainers-grid{grid-template-columns:1fr}.cursussen-grid{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="breadcrumb"><a href="/">Home</a> › <a href="/#academy">Academy</a> › Overzicht</div>

      <section className="page-hero">
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-tag">🎓 KWISPELCLUB ACADEMY</div>
            <h1>Leer alles over je <span className="accent">huisdier</span></h1>
            <p>Van puppy training tot kattenverzorging — onze gecertificeerde trainers begeleiden jou en je huisdier stap voor stap.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="#cursussen" className="btn btn-primary">Bekijk cursussen →</a>
              <a href="#trainers" className="btn btn-white">Onze trainers</a>
            </div>
          </div>
          <div className="hero-img">
            <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80" alt="Puppy training" />
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="section" id="trainers" style={{ paddingBottom: 0 }}>
        <div className="trainers-section">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: 'var(--teal)', marginBottom: 8 }}>Onze Trainers 🎓</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Gecertificeerde professionals die je begeleiden doorheen de cursus</p>
          </div>
          <div className="trainers-grid">
            {trainers.map(t => (
              <div key={t.id} className="trainer-card">
                <div className="trainer-av">
                  {t.foto_url ? <img src={t.foto_url} alt={t.naam} /> : '👩‍🏫'}
                </div>
                <div>
                  <div className="trainer-naam">{t.naam}</div>
                  {t.specialisatie && <div className="trainer-spec">{t.specialisatie}</div>}
                  {t.bio && <div className="trainer-bio">{t.bio}</div>}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - trainers.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="trainer-placeholder">
                <div style={{ fontSize: 40, marginBottom: 12, opacity: .4 }}>👩‍🏫</div>
                <p>Ben jij een gecertificeerde hondentrainer? Sluit je aan als Academy trainer.</p>
                <a href="/academy-verkoper" className="btn-trainer">Word Trainer →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURSUSSEN */}
      <section className="section" id="cursussen">
        <div className="section-header">
          <h2>Beschikbare Cursussen 📚</h2>
          <p>Kies een cursus en start vandaag nog met leren</p>
        </div>
        {loading ? (
          <div className="empty-state"><div className="ei">⏳</div><p>Cursussen laden...</p></div>
        ) : cursussen.length === 0 ? (
          <div className="empty-state"><div className="ei">📚</div><p>Binnenkort beschikbaar — onze trainers werken aan de eerste cursussen!</p></div>
        ) : (
          <div className="cursussen-grid">
            {cursussen.map(c => {
              const totalLessen = c.cursus_modules.reduce((sum: number, m: any) => sum + (m.cursus_lessen?.length || 0), 0)
              return (
                <a key={c.id} href={`/cursus/${c.id}`} className="cursus-card">
                  <div className="cursus-thumb">
                    {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.titel} /> : '🎓'}
                  </div>
                  <div className="cursus-body">
                    <div className="cursus-tags">
                      <span className={`cursus-tag ${c.is_gratis ? 'tag-gratis' : 'tag-betaald'}`}>
                        {c.is_gratis ? 'Gratis' : 'Betaald'}
                      </span>
                    </div>
                    <div className="cursus-titel">{c.titel}</div>
                    {c.beschrijving && <div className="cursus-desc">{c.beschrijving}</div>}
                    <div className="cursus-meta">
                      <span>📚 {c.cursus_modules.length} modules</span>
                      <span>▶ {totalLessen} lessen</span>
                    </div>
                    <div className={`cursus-prijs ${c.is_gratis ? 'gratis' : ''}`}>
                      {c.is_gratis ? 'Gratis' : `€${parseFloat(c.prijs).toFixed(2)}`}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>

      {/* FAQ */}
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
          <p>Maak een gratis account aan en start vandaag nog met leren.</p>
          <div className="cta-btns">
            <a href="#cursussen" className="btn btn-primary">Bekijk cursussen →</a>
            <a href="/academy-verkoper" className="btn btn-white">Word Trainer</a>
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
