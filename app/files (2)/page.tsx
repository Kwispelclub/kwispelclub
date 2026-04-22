'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

const POSTS = [
  { id: 1, tag: 'Training', tagColor: '#FFF3E0', tagText: '#E8913A', title: 'De 5 Grootste Fouten bij Puppy Training', excerpt: 'Je nieuwe puppy is er! Maar wist je dat de meeste baasjes dezelfde fouten maken in de eerste weken? Van inconsistentie tot te laat beginnen met socialisatie.', author: 'Trainer Lisa', date: '12 apr 2026', readTime: '8 min', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80', featured: true },
  { id: 2, tag: 'Voeding', tagColor: '#E8F0E4', tagText: '#2D5A27', title: 'Graanvrij Voer: Hype of Echt Beter?', excerpt: 'De trend van graanvrij hondenvoer is enorm, maar is het echt beter voor je hond? We duiken in de wetenschap.', author: 'Dr. Peeters', date: '10 apr 2026', readTime: '6 min', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80' },
  { id: 3, tag: 'Gezondheid', tagColor: '#EDE8F5', tagText: '#6B4FA0', title: 'Hoe Herken je Stress bij je Kat?', excerpt: 'Katten verbergen hun ongemak goed. Leer de 7 subtiele signalen van stress herkennen en wat je eraan kunt doen.', author: 'Dierenarts Van', date: '8 apr 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80' },
  { id: 4, tag: 'Lifestyle', tagColor: '#E0F5F1', tagText: '#2A9D8F', title: 'Trimmen in de Zomer: Wel of Niet Scheren?', excerpt: 'Veel baasjes denken dat hun hond het koeler heeft zonder vacht. Maar klopt dat wel? De waarheid over zomertrimmen.', author: 'Groomer Sara', date: '5 apr 2026', readTime: '4 min', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80' },
  { id: 5, tag: 'Training', tagColor: '#FFF3E0', tagText: '#E8913A', title: 'Loslopen in het Park: Wanneer is je Hond Klaar?', excerpt: 'De stap van lijn naar loslopen is spannend. Hoe weet je of je hond er klaar voor is en hoe doe je het veilig?', author: 'Trainer Lisa', date: '2 apr 2026', readTime: '7 min', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80' },
  { id: 6, tag: 'Voeding', tagColor: '#E8F0E4', tagText: '#2D5A27', title: 'Kattenkruid: Waarom je Kat er Gek van Wordt', excerpt: 'De wetenschap achter de kattenkruid-reactie. Plus: welke alternatieven zijn er voor katten die niet reageren?', author: 'Dr. Peeters', date: '28 mrt 2026', readTime: '5 min', img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80' },
  { id: 7, tag: 'Gezondheid', tagColor: '#EDE8F5', tagText: '#6B4FA0', title: 'Vaccinatieschema Puppy: Alles wat je Moet Weten', excerpt: 'Wanneer welke prik? Wat zijn de risico\'s? Een compleet overzicht van het Belgische vaccinatieschema voor puppy\'s.', author: 'Dierenarts Van', date: '25 mrt 2026', readTime: '9 min', img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&q=80' },
]

export default function BlogPage() {
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
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
        .section-header{text-align:center;margin-bottom:40px}
        .section-header h1{font-size:clamp(32px,4vw,48px);color:var(--green-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:#5C3D2E;margin-bottom:32px}
        .featured{display:grid;grid-template-columns:1.3fr 1fr;background:var(--white);border-radius:28px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:48px;cursor:pointer;transition:all .3s}
        .featured:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .feat-img{min-height:360px;overflow:hidden}
        .feat-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .featured:hover .feat-img img{transform:scale(1.03)}
        .feat-content{padding:40px 36px 40px 0;display:flex;flex-direction:column;justify-content:center}
        .post-tag{display:inline-flex;padding:5px 14px;border-radius:50px;font-size:11px;font-weight:700;margin-bottom:14px;width:fit-content}
        .feat-content h2{font-size:26px;margin-bottom:12px;line-height:1.25}
        .feat-content p{font-size:15px;color:var(--text-mid);line-height:1.7;margin-bottom:18px}
        .post-meta{display:flex;align-items:center;gap:12px;font-size:13px;color:var(--text-light)}
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px}
        .blog-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer}
        .blog-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .blog-img{height:200px;overflow:hidden;position:relative}
        .blog-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .blog-card:hover .blog-img img{transform:scale(1.05)}
        .blog-tag{position:absolute;top:14px;left:14px}
        .blog-content{padding:22px}
        .blog-content h3{font-size:17px;margin-bottom:8px;line-height:1.3}
        .blog-content p{font-size:14px;color:var(--text-mid);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .read-more{color:var(--green-main);font-weight:700;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:gap .2s;background:none;border:none;cursor:pointer}
        .read-more:hover{gap:8px}
        .sidebar-layout{display:grid;grid-template-columns:1fr 300px;gap:32px}
        .sidebar{display:flex;flex-direction:column;gap:20px}
        .sidebar-card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .sidebar-card h3{font-size:17px;color:var(--green-dark);margin-bottom:14px}
        .cat-link{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--cream-dark);text-decoration:none;color:var(--text-mid);font-size:14px;font-weight:600;transition:color .2s}
        .cat-link:last-child{border-bottom:none}
        .cat-link:hover{color:var(--green-main)}
        .cat-count{background:var(--cream);padding:2px 10px;border-radius:50px;font-size:12px}
        .pop-item{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--cream-dark)}
        .pop-item:last-child{border-bottom:none}
        .pop-thumb{width:52px;height:52px;border-radius:10px;overflow:hidden;flex-shrink:0}
        .pop-thumb img{width:100%;height:100%;object-fit:cover}
        .pop-title{font-size:14px;font-weight:700;line-height:1.3;margin-bottom:3px}
        .pop-date{font-size:12px;color:var(--text-light)}
        .nl-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:20px;padding:28px;color:white;text-align:center}
        .nl-card h3{color:white;margin-bottom:8px}
        .nl-card p{font-size:13px;opacity:.8;margin-bottom:14px;line-height:1.5}
        .nl-input{width:100%;padding:11px 16px;border:2px solid rgba(255,255,255,.2);border-radius:50px;background:rgba(255,255,255,.1);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;margin-bottom:10px}
        .nl-input::placeholder{color:rgba(255,255,255,.4)}
        .nl-btn{width:100%;padding:11px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .nl-btn:hover{background:#D4812E}
        footer{background:var(--green-dark);color:white;margin-top:48px}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:1024px){.sidebar-layout{grid-template-columns:1fr}}
        @media(max-width:768px){.featured,.blog-grid{grid-template-columns:1fr}.feat-content{padding:24px}}
      `}</style>

      <Navbar />

      <div className="section">
        <div className="section-header">
          <h1>Kwispelclub Blog 📝</h1>
          <p>Tips, advies en verhalen voor elke dierenliefhebber</p>
        </div>
        <div className="demo-notice">⚠️ <span style={{ color: 'var(--orange-main)' }}>Voorbeeldartikelen</span> — Echte content volgt binnenkort.</div>

        {/* Featured */}
        <div className="featured">
          <div className="feat-img"><img src={featured.img} alt={featured.title} /></div>
          <div className="feat-content">
            <div className="post-tag" style={{ background: featured.tagColor, color: featured.tagText }}>🎓 {featured.tag}</div>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="post-meta"><span>{featured.author}</span><span>·</span><span>{featured.date}</span><span>·</span><span>{featured.readTime}</span></div>
          </div>
        </div>

        {/* Grid */}
        <div className="blog-grid">
          {grid.map(post => (
            <div key={post.id} className="blog-card">
              <div className="blog-img">
                <img src={post.img} alt={post.title} />
                <div className="blog-tag post-tag" style={{ background: post.tagColor, color: post.tagText }}>{post.tag}</div>
              </div>
              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-meta" style={{ marginBottom: 12 }}><span>{post.date}</span><span>·</span><span>{post.readTime}</span></div>
                <button className="read-more">Lees meer →</button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="sidebar-layout">
          <div />
          <div className="sidebar">
            <div className="sidebar-card">
              <h3>📂 Categorieën</h3>
              {[['🦴 Voeding', 8], ['🎓 Training', 6], ['💊 Gezondheid', 5], ['✂️ Verzorging', 4], ['🐾 Lifestyle', 3]].map(([label, count]) => (
                <a key={label as string} href="#" className="cat-link">{label as string} <span className="cat-count">{count as number}</span></a>
              ))}
            </div>
            <div className="sidebar-card">
              <h3>🔥 Populair</h3>
              {[
                { title: '5 Fouten bij Puppy Training', date: '12 apr 2026', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80' },
                { title: 'Stress bij je Kat Herkennen', date: '8 apr 2026', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&q=80' },
                { title: 'Vaccinatieschema Puppy', date: '25 mrt 2026', img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=120&q=80' },
              ].map(p => (
                <div key={p.title} className="pop-item">
                  <div className="pop-thumb"><img src={p.img} alt="" /></div>
                  <div><div className="pop-title">{p.title}</div><div className="pop-date">{p.date}</div></div>
                </div>
              ))}
            </div>
            <div className="nl-card">
              <h3>📬 Nieuwsbrief</h3>
              <p>Ontvang de nieuwste artikelen en tips direct in je inbox.</p>
              {nlDone ? (
                <div style={{ padding: '12px 0', fontWeight: 700 }}>✓ Aangemeld!</div>
              ) : (
                <>
                  <input className="nl-input" type="email" placeholder="Jouw e-mailadres" value={nlEmail} onChange={e => setNlEmail(e.target.value)} />
                  <button className="nl-btn" onClick={() => nlEmail && setNlDone(true)}>Aanmelden</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer><div className="footer-inner">© 2026 Kwispelclub. <a href="/">Home</a><a href="/over-ons">Over Ons</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div></footer>
    </>
  )
}
