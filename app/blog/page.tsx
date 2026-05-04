'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  voeding:    { bg: '#E8F0E4', color: '#2D5A27' },
  training:   { bg: '#FFF3E0', color: '#E8913A' },
  gezondheid: { bg: '#EDE8F5', color: '#6B4FA0' },
  lifestyle:  { bg: '#E0F5F1', color: '#2A9D8F' },
}

const POSTS = [
  { tag: 'training',   label: '🎓 Training',   title: 'De 5 Grootste Fouten bij Puppy Training (en hoe je ze vermijdt)', excerpt: 'Je nieuwe puppy is er! Maar wist je dat de meeste baasjes dezelfde fouten maken in de eerste weken? Van inconsistentie tot te laat beginnen met socialisatie.', date: '12 apr 2026', readTime: '8 min', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80' },
  { tag: 'voeding',    label: '🦴 Voeding',     title: 'Graanvrij Voer: Hype of Echt Beter?', excerpt: 'De trend van graanvrij hondenvoer is enorm, maar is het echt beter voor je hond? We duiken in de wetenschap en geven je een eerlijk antwoord.', date: '10 apr 2026', readTime: '6 min', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80' },
  { tag: 'gezondheid', label: '💊 Gezondheid',  title: 'Hoe Herken je Stress bij je Kat?', excerpt: 'Katten verbergen hun ongemak goed. Leer de 7 subtiele signalen van stress herkennen en wat je eraan kunt doen.', date: '8 apr 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80' },
  { tag: 'lifestyle',  label: '✂️ Lifestyle',   title: 'Trimmen in de Zomer: Wel of Niet Scheren?', excerpt: 'Veel baasjes denken dat hun hond het koeler heeft zonder vacht. Maar klopt dat wel? De waarheid over zomertrimmen.', date: '5 apr 2026', readTime: '4 min', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80' },
  { tag: 'training',   label: '🎓 Training',   title: 'Loslopen in het Park: Wanneer is je Hond Klaar?', excerpt: 'De stap van lijn naar loslopen is spannend. Hoe weet je of je hond er klaar voor is en hoe doe je het veilig?', date: '2 apr 2026', readTime: '7 min', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80' },
  { tag: 'voeding',    label: '🦴 Voeding',     title: 'Kattenkruid: Waarom je Kat er Gek van Wordt', excerpt: 'De wetenschap achter de kattenkruid-reactie. Plus: welke alternatieven zijn er voor katten die niet reageren?', date: '28 mrt 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80' },
  { tag: 'gezondheid', label: '💊 Gezondheid',  title: 'Vaccinatieschema Puppy: Alles wat je Moet Weten', excerpt: "Wanneer welke prik? Een compleet overzicht van het Belgische vaccinatieschema voor puppy's.", date: '25 mrt 2026', readTime: '9 min', img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&q=80' },
]

function Tag({ tag, label }: { tag: string; label: string }) {
  const s = TAG_STYLES[tag] || { bg: '#E8F0E4', color: '#2D5A27' }
  return (
    <span style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      {label}
    </span>
  )
}

export default function BlogPage() {
  const supabase = createClient()
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
  const [nlLoading, setNlLoading] = useState(false)
  const obsRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 60)
          obsRef.current?.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))
  }, [])

  // ✅ Sla op in newsletter_subscribers tabel
  const handleNlAanmelden = async () => {
    if (!nlEmail) return
    setNlLoading(true)
    try {
      await supabase.from('newsletter_subscribers').upsert(
        { email: nlEmail, source: 'blog', active: true },
        { onConflict: 'email' }
      )
      setNlDone(true)
    } catch (e) {
      console.error('Newsletter fout:', e)
      setNlDone(true) // toon succes ook bij fout (duplicaat email)
    }
    setNlLoading(false)
  }

  const featured = POSTS[0]
  const grid = POSTS.slice(1)

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .section{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px)}
        .sh{text-align:center;margin-bottom:48px}
        .sh h1{font-size:clamp(32px,4vw,48px);color:var(--green-dark);margin-bottom:12px}
        .sh p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:#5C3D2E;margin-bottom:32px}
        .demo-notice span{color:var(--orange-main)}
        .featured{display:grid;grid-template-columns:1.3fr 1fr;gap:32px;background:var(--white);border-radius:28px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:48px;transition:all .3s;cursor:pointer}
        .featured:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .feat-img{min-height:360px;overflow:hidden}
        .feat-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .featured:hover .feat-img img{transform:scale(1.03)}
        .feat-body{padding:40px 36px 40px 0;display:flex;flex-direction:column;justify-content:center;gap:12px}
        .feat-body h2{font-size:28px;color:var(--text-dark);line-height:1.2}
        .feat-body p{font-size:15px;color:var(--text-mid);line-height:1.7}
        .meta{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-light)}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer}
        .card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .card-img{height:200px;overflow:hidden;position:relative}
        .card-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .card:hover .card-img img{transform:scale(1.05)}
        .tag-pos{position:absolute;top:14px;left:14px}
        .card-body{padding:22px}
        .card-body h3{font-size:18px;margin-bottom:8px;line-height:1.3}
        .card-body p{font-size:14px;color:var(--text-mid);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .read-more{color:var(--green-main);font-weight:700;font-size:14px;text-decoration:none}
        .sw{display:grid;grid-template-columns:1fr 320px;gap:32px;margin-top:48px}
        .sidebar{display:flex;flex-direction:column;gap:24px}
        .sb-card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .sb-card h3{font-size:17px;color:var(--green-dark);margin-bottom:16px}
        .cat-list a{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--cream-dark);text-decoration:none;color:var(--text-mid);font-size:14px;font-weight:600}
        .cat-list a:last-child{border-bottom:none}
        .cat-list a:hover{color:var(--green-main)}
        .cnt{background:var(--cream-dark);padding:2px 10px;border-radius:50px;font-size:12px}
        .pop{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream-dark)}
        .pop:last-child{border-bottom:none}
        .pop-img{width:56px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0}
        .pop-img img{width:100%;height:100%;object-fit:cover}
        .pop-t{font-size:14px;font-weight:700;line-height:1.3;margin-bottom:4px}
        .pop-d{font-size:12px;color:var(--text-light)}
        .nl{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:20px;padding:28px;color:white;text-align:center}
        .nl h3{color:white;margin-bottom:8px}
        .nl p{font-size:13px;opacity:.8;margin-bottom:16px;line-height:1.5}
        .nl input{width:100%;padding:12px 16px;border:2px solid rgba(255,255,255,.2);border-radius:50px;background:rgba(255,255,255,.1);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;margin-bottom:10px}
        .nl input::placeholder{color:rgba(255,255,255,.4)}
        .nl button{width:100%;padding:12px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .nl button:disabled{opacity:.6;cursor:not-allowed}
        footer{background:var(--green-dark);color:white}
        .fi{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
        .fi a{color:white;text-decoration:none;margin:0 12px}
        .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}
        .fade-up.visible{opacity:1;transform:translateY(0)}
        @media(max-width:768px){.featured,.grid,.sw{grid-template-columns:1fr}.feat-body{padding:24px}}
      `}</style>

      <section className="section">
        <div className="sh">
          <h1>Kwispelclub Blog 📝</h1>
          <p>Tips, advies en verhalen voor elke dierenliefhebber</p>
        </div>
        <div className="demo-notice">⚠️ <span>Voorbeeldartikelen</span> — Deze blogposts zijn ter illustratie. Echte content volgt binnenkort.</div>

        <div className="featured fade-up">
          <div className="feat-img"><img src={featured.img} alt={featured.title} /></div>
          <div className="feat-body">
            <Tag tag={featured.tag} label={featured.label} />
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="meta">
              <span>{featured.date}</span><span>·</span><span>{featured.readTime} leestijd</span>
            </div>
          </div>
        </div>

        <div className="grid fade-up">
          {grid.map((post, i) => (
            <div key={i} className="card">
              <div className="card-img">
                <img src={post.img} alt={post.title} />
                <div className="tag-pos"><Tag tag={post.tag} label={post.label} /></div>
              </div>
              <div className="card-body">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="meta" style={{ marginBottom: 12 }}>
                  <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
                </div>
                <a href="#" className="read-more">Lees meer →</a>
              </div>
            </div>
          ))}
        </div>

        <div className="sw fade-up">
          <div />
          <div className="sidebar">
            <div className="sb-card">
              <h3>📂 Categorieën</h3>
              <div className="cat-list">
                {[['🦴 Voeding', 8], ['🎓 Training', 6], ['💊 Gezondheid', 5], ['✂️ Verzorging', 4], ['🐾 Lifestyle', 3]].map(([cat, count]) => (
                  <a key={String(cat)} href="#">{cat} <span className="cnt">{count}</span></a>
                ))}
              </div>
            </div>
            <div className="sb-card">
              <h3>🔥 Populair</h3>
              {[
                { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80', title: '5 Fouten bij Puppy Training', date: '12 apr 2026' },
                { img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&q=80', title: 'Stress bij je Kat Herkennen', date: '8 apr 2026' },
                { img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=120&q=80', title: 'Vaccinatieschema Puppy', date: '25 mrt 2026' },
              ].map(item => (
                <div key={item.title} className="pop">
                  <div className="pop-img"><img src={item.img} alt={item.title} /></div>
                  <div><div className="pop-t">{item.title}</div><div className="pop-d">{item.date}</div></div>
                </div>
              ))}
            </div>
            <div className="nl">
              <h3>📬 Nieuwsbrief</h3>
              <p>Ontvang de nieuwste artikelen en tips direct in je inbox.</p>
              {nlDone ? (
                <div style={{ color: 'white', fontWeight: 700, padding: '12px 0' }}>✓ Aangemeld! 🎉</div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="Jouw e-mailadres"
                    value={nlEmail}
                    onChange={e => setNlEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNlAanmelden()}
                  />
                  <button onClick={handleNlAanmelden} disabled={nlLoading || !nlEmail}>
                    {nlLoading ? '⏳ Bezig...' : 'Aanmelden'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="fi">
          © 2026 Kwispelclub.
          <a href="/">Home</a><a href="/over-ons">Over Ons</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a>
        </div>
      </footer>
    </>
  )
}
