'use client'

import { useState, useEffect, useRef } from 'react'

const POSTS = [
  { tag: 'training', tagLabel: '🎓 Training', title: 'De 5 Grootste Fouten bij Puppy Training (en hoe je ze vermijdt)', excerpt: 'Je nieuwe puppy is er! Maar wist je dat de meeste baasjes dezelfde fouten maken in de eerste weken? Van inconsistentie tot te laat beginnen met socialisatie.', date: '12 apr 2026', readTime: '8 min', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80', featured: true },
  { tag: 'voeding', tagLabel: '🦴 Voeding', title: 'Graanvrij Voer: Hype of Echt Beter?', excerpt: 'De trend van graanvrij hondenvoer is enorm, maar is het echt beter voor je hond? We duiken in de wetenschap en geven je een eerlijk antwoord.', date: '10 apr 2026', readTime: '6 min', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80' },
  { tag: 'gezondheid', tagLabel: '💊 Gezondheid', title: 'Hoe Herken je Stress bij je Kat?', excerpt: 'Katten verbergen hun ongemak goed. Leer de 7 subtiele signalen van stress herkennen en wat je eraan kunt doen.', date: '8 apr 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80' },
  { tag: 'lifestyle', tagLabel: '✂️ Lifestyle', title: 'Trimmen in de Zomer: Wel of Niet Scheren?', excerpt: 'Veel baasjes denken dat hun hond het koeler heeft zonder vacht. Maar klopt dat wel? De waarheid over zomertrimmen.', date: '5 apr 2026', readTime: '4 min', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80' },
  { tag: 'training', tagLabel: '🎓 Training', title: 'Loslopen in het Park: Wanneer is je Hond Klaar?', excerpt: 'De stap van lijn naar loslopen is spannend. Hoe weet je of je hond er klaar voor is en hoe doe je het veilig?', date: '2 apr 2026', readTime: '7 min', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80' },
  { tag: 'voeding', tagLabel: '🦴 Voeding', title: 'Kattenkruid: Waarom je Kat er Gek van Wordt', excerpt: 'De wetenschap achter de kattenkruid-reactie. Plus: welke alternatieven zijn er voor katten die niet reageren?', date: '28 mrt 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80' },
  { tag: 'gezondheid', tagLabel: '💊 Gezondheid', title: 'Vaccinatieschema Puppy: Alles wat je Moet Weten', excerpt: 'Wanneer welke prik? Wat zijn de risico\'s? Een compleet overzicht van het Belgische vaccinatieschema voor puppy\'s.', date: '25 mrt 2026', readTime: '9 min', img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&q=80' },
]

const TAG_COLORS: Record<string, string> = {
  voeding: 'background:#E8F0E4;color:#2D5A27',
  training: 'background:#FFF3E0;color:#E8913A',
  gezondheid: 'background:#EDE8F5;color:#6B4FA0',
  lifestyle: 'background:#E0F5F1;color:#2A9D8F',
}

export default function BlogPage() {
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
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

  const featured = POSTS[0]
  const grid = POSTS.slice(1)

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .section{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px)}
    .section-header{text-align:center;margin-bottom:48px}.section-header h1{font-size:clamp(32px,4vw,48px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
    .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:#5C3D2E;margin-bottom:32px}.demo-notice span{color:var(--orange-main)}
    .featured-post{display:grid;grid-template-columns:1.3fr 1fr;gap:32px;background:var(--white);border-radius:28px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:48px;transition:all .3s;cursor:pointer}.featured-post:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
    .feat-img{min-height:360px;overflow:hidden}.feat-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.featured-post:hover .feat-img img{transform:scale(1.03)}
    .feat-content{padding:40px 36px 40px 0;display:flex;flex-direction:column;justify-content:center}
    .post-tag{display:inline-flex;padding:5px 14px;border-radius:50px;font-size:11px;font-weight:700;margin-bottom:14px;width:fit-content}
    .feat-content h2{font-size:28px;color:var(--text-dark);margin-bottom:12px;line-height:1.2}
    .feat-content p{font-size:15px;color:var(--text-mid);line-height:1.7;margin-bottom:20px}
    .post-meta{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-light)}
    .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .blog-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer}.blog-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
    .blog-img{height:200px;overflow:hidden;position:relative}.blog-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.blog-card:hover .blog-img img{transform:scale(1.05)}.blog-img .post-tag{position:absolute;top:14px;left:14px}
    .blog-content{padding:22px}.blog-content h3{font-size:18px;margin-bottom:8px;line-height:1.3}.blog-content p{font-size:14px;color:var(--text-mid);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .read-more{color:var(--green-main);font-weight:700;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:gap .2s}.read-more:hover{gap:8px}
    .sidebar{display:flex;flex-direction:column;gap:24px;margin-top:48px}
    .sidebar-card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}.sidebar-card h3{font-size:17px;color:var(--green-dark);margin-bottom:16px}
    .cat-list a{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--cream-dark);text-decoration:none;color:var(--text-mid);font-size:14px;font-weight:600;transition:color .2s}.cat-list a:last-child{border-bottom:none}.cat-list a:hover{color:var(--green-main)}.cat-count{background:var(--cream-dark);padding:2px 10px;border-radius:50px;font-size:12px}
    .pop-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream-dark)}.pop-item:last-child{border-bottom:none}.pop-thumb{width:56px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0}.pop-thumb img{width:100%;height:100%;object-fit:cover}.pop-title{font-size:14px;font-weight:700;line-height:1.3;margin-bottom:4px}.pop-date{font-size:12px;color:var(--text-light)}
    .nl-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:20px;padding:28px;color:white;text-align:center}.nl-card h3{color:white;margin-bottom:8px}.nl-card p{font-size:13px;opacity:.8;margin-bottom:16px;line-height:1.5}.nl-card input{width:100%;padding:12px 16px;border:2px solid rgba(255,255,255,.2);border-radius:50px;background:rgba(255,255,255,.1);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;margin-bottom:10px}.nl-card input::placeholder{color:rgba(255,255,255,.4)}.nl-card button{width:100%;padding:12px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}.nl-card button:hover{background:#D4812E}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}.footer-inner a{color:white;text-decoration:none;margin:0 12px}
    .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}.fade-up.visible{opacity:1;transform:translateY(0)}
    @media(max-width:768px){.featured-post,.blog-grid{grid-template-columns:1fr}.feat-content{padding:24px}}
  `

  return (
    <>
      <style>{CSS}</style>

      <section className="section">
        <div className="section-header">
          <h1>Kwispelclub Blog 📝</h1>
          <p>Tips, advies en verhalen voor elke dierenliefhebber</p>
        </div>
        <div className="demo-notice">⚠️ <span>Voorbeeldartikelen</span> — Deze blogposts zijn ter illustratie. Echte content volgt binnenkort.</div>

        {/* Featured */}
        <div className="featured-post fade-up">
          <div className="feat-img"><img src={featured.img} alt={featured.title} /></div>
          <div className="feat-content">
            <div className="post-tag" style={{ [TAG_COLORS[featured.tag]?.split(';')[0].split(':')[0]?.trim() || 'background']: TAG_COLORS[featured.tag]?.split(';')[0].split(':')[1]?.trim() }}
              dangerouslySetInnerHTML={{ __html: '' }}>
              <span style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: '50px', fontSize: 11, fontWeight: 700, background: '#FFF3E0', color: '#E8913A' }}>
                {featured.tagLabel}
              </span>
            </div>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="post-meta">
              <span>{featured.date}</span><span>·</span><span>{featured.readTime} leestijd</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="blog-grid fade-up">
          {grid.map((post, i) => (
            <div key={i} className="blog-card">
              <div className="blog-img">
                <img src={post.img} alt={post.title} />
                <span className="post-tag" style={{ background: TAG_COLORS[post.tag]?.split(';')[0].split(':')[1]?.trim(), color: TAG_COLORS[post.tag]?.split(';')[1].split(':')[1]?.trim() }}>
                  {post.tagLabel}
                </span>
              </div>
              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-meta" style={{ marginBottom: 12 }}>
                  <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
                </div>
                <a href="#" className="read-more">Lees meer →</a>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, marginTop: 48 }} className="fade-up">
          <div />
          <div className="sidebar">
            <div className="sidebar-card">
              <h3>📂 Categorieën</h3>
              <div className="cat-list">
                {[['🦴 Voeding', 8], ['🎓 Training', 6], ['💊 Gezondheid', 5], ['✂️ Verzorging', 4], ['🐾 Lifestyle', 3]].map(([cat, count]) => (
                  <a key={cat} href="#">{cat} <span className="cat-count">{count}</span></a>
                ))}
              </div>
            </div>
            <div className="sidebar-card">
              <h3>🔥 Populair</h3>
              {[
                ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80', '5 Fouten bij Puppy Training', '12 apr 2026'],
                ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&q=80', 'Stress bij je Kat Herkennen', '8 apr 2026'],
                ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=120&q=80', 'Vaccinatieschema Puppy', '25 mrt 2026'],
              ].map(([img, title, date]) => (
                <div key={title} className="pop-item">
                  <div className="pop-thumb"><img src={img} alt={title} /></div>
                  <div><div className="pop-title">{title}</div><div className="pop-date">{date}</div></div>
                </div>
              ))}
            </div>
            <div className="nl-card">
              <h3>📬 Nieuwsbrief</h3>
              <p>Ontvang de nieuwste artikelen en tips direct in je inbox.</p>
              {nlDone ? (
                <div style={{ color: 'white', fontWeight: 700, padding: '12px 0' }}>✓ Aangemeld! 🎉</div>
              ) : (
                <>
                  <input type="email" placeholder="Jouw e-mailadres" value={nlEmail} onChange={e => setNlEmail(e.target.value)} />
                  <button onClick={() => nlEmail && setNlDone(true)}>Aanmelden</button>
                </>
              )}
            </div>
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
