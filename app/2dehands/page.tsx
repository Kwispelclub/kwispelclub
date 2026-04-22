'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const DEMO_LISTINGS = [
  { id: 1, title: 'Kong Hondenbench XL', cat: 'bench', price: 45, original: 89.95, condition: 'Zo goed als nieuw', location: 'Bree', date: '2 dagen geleden', delivery: 'Ophalen of verzenden', seller: 'Sofie V.', rating: 4.9, reserved: false, img: 'https://images.unsplash.com/photo-1541599468348-e603c130e53d?w=500&q=80' },
  { id: 2, title: 'Ruffwear Anti-trek Tuigje M', cat: 'kleding', price: 22, original: 42, condition: 'Licht gebruikt', location: 'Hasselt', date: '5 dagen geleden', delivery: 'Verzenden', seller: 'Thomas D.', rating: 5.0, reserved: false, img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80' },
  { id: 3, title: 'Interactief Kattenspeeltje Pakket', cat: 'speelgoed', price: 12, original: 24.50, condition: 'Goed', location: 'Antwerpen', date: '1 week geleden', delivery: 'Verzenden', seller: 'Lisa M.', rating: 4.8, reserved: false, img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&q=80' },
  { id: 4, title: 'Curver Kattenmand Cozy', cat: 'bench', price: 18, original: 34.95, condition: 'Zo goed als nieuw', location: 'Gent', date: '3 dagen geleden', delivery: 'Ophalen', seller: 'Jan K.', rating: 4.7, reserved: false, img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80' },
  { id: 5, title: 'FURminator Onthaarder Large', cat: 'verzorging', price: 15, original: 29.95, condition: 'Licht gebruikt', location: 'Leuven', date: '1 dag geleden', delivery: 'Verzenden', seller: 'Emma B.', rating: 5.0, reserved: true, img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80' },
  { id: 6, title: 'Hondenjas Winter Maat L', cat: 'kleding', price: 20, original: 39.95, condition: 'Goed', location: 'Maastricht', date: '4 dagen geleden', delivery: 'Ophalen of verzenden', seller: 'Pieter V.', rating: 4.6, reserved: false, img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80' },
]

export default function TweedeHandsPage() {
  const supabase = createClient()
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [wishlist, setWishlist] = useState<number[]>([])

  // Sell form
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState('Benches & Manden')
  const [condition, setCondition] = useState('Zo goed als nieuw')
  const [originalPrice, setOriginalPrice] = useState('')
  const [askPrice, setAskPrice] = useState('')
  const [desc, setDesc] = useState('')
  const [location, setLocation] = useState('')
  const [delivery, setDelivery] = useState('Ophalen of verzenden')
  const [sellMsg, setSellMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const priceWarning = originalPrice && askPrice && parseFloat(askPrice) > parseFloat(originalPrice) * 0.7

  const filtered = DEMO_LISTINGS.filter(l => {
    const matchCat = catFilter === 'all' || l.cat === catFilter
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSell = async () => {
    if (!title || !askPrice || !desc || !location) {
      setSellMsg('⚠️ Vul alle verplichte velden in')
      setTimeout(() => setSellMsg(''), 3000)
      return
    }
    if (priceWarning) {
      setSellMsg('⚠️ Pas je prijs aan (max 70% van nieuwprijs)')
      setTimeout(() => setSellMsg(''), 3000)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('second_hand_listings').insert({
        seller_id: user.id,
        title,
        category: cat,
        condition,
        original_price: parseFloat(originalPrice) || null,
        price: parseFloat(askPrice),
        description: desc,
        location,
        delivery_method: delivery,
        status: 'active',
      })
    }
    setSubmitted(true)
  }

  const addPhoto = () => {
    if (photos.length >= 4) return
    const emojis = ['🐕', '🧶', '🦴', '📦']
    setPhotos(p => [...p, emojis[p.length]])
  }

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--teal:#2A9D8F;--teal-dark:#1E7A6E;--teal-pale:#E0F5F1;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .beta-bar{background:linear-gradient(90deg,var(--orange-main),#D4812E,var(--orange-main));animation:shimmer 3s ease infinite;background-size:200%;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}
        .breadcrumb a{color:var(--teal);text-decoration:none;font-weight:600}
        .hero-section{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}
        .hero-card{background:linear-gradient(135deg,var(--teal-dark),var(--teal),#3DB8A9);border-radius:36px;padding:56px clamp(32px,5vw,72px);min-height:320px;display:flex;align-items:center;position:relative;overflow:hidden}
        .hero-blob{position:absolute;border-radius:50%;pointer-events:none}
        .hb1{width:350px;height:350px;background:rgba(255,255,255,.06);top:-100px;right:-60px}
        .hb2{width:200px;height:200px;background:rgba(232,145,58,.08);bottom:-60px;left:20%}
        .hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:18px;border:1px solid rgba(255,255,255,.1)}
        .hero-h1{font-size:clamp(30px,4.5vw,48px);color:white;line-height:1.1;margin-bottom:14px}
        .hero-p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:24px;max-width:460px}
        .hero-emoji{position:absolute;right:48px;top:50%;transform:translateY(-50%);font-size:120px;opacity:.12}
        .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
        .btn-primary{padding:14px 28px;border-radius:50px;background:var(--orange-main);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(232,145,58,.4);transition:all .3s}
        .btn-primary:hover{background:#D4812E;transform:translateY(-2px)}
        .btn-white{padding:14px 28px;border-radius:50px;background:rgba(255,255,255,.15);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:1.5px solid rgba(255,255,255,.3);transition:all .3s}
        .btn-white:hover{background:rgba(255,255,255,.25);transform:translateY(-2px)}
        .section{max-width:1320px;margin:0 auto;padding:64px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:40px}
        .section-header h2{font-size:clamp(26px,3.5vw,40px);color:var(--teal-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .how-card{text-align:center;padding:28px 16px;border-radius:20px;background:var(--white);box-shadow:0 2px 8px rgba(0,0,0,.06);position:relative;transition:all .3s}
        .how-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .how-num{position:absolute;top:14px;left:14px;width:28px;height:28px;border-radius:50%;background:var(--teal);color:white;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
        .how-icon{font-size:40px;margin:8px 0 12px}
        .rules-wrap{background:var(--white);border-radius:28px;padding:48px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .rules-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:32px}
        .rule-card{padding:24px;border-radius:20px;background:var(--cream);text-align:center;transition:all .3s;border:2px solid transparent}
        .rule-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .rule-card.highlight{background:var(--teal-pale);border-color:var(--teal)}
        .rule-icon{font-size:36px;margin-bottom:10px}
        .rule-card h4{font-size:15px;color:var(--teal-dark);margin-bottom:6px}
        .rule-card p{font-size:13px;color:var(--text-mid);line-height:1.55}
        .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:var(--brown);margin-bottom:24px}
        .filters-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;align-items:center}
        .filter-btn{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}
        .filter-btn.active{background:var(--teal);color:white;border-color:var(--teal)}
        .filter-btn:hover:not(.active){border-color:var(--teal);color:var(--teal)}
        .search-wrap{flex:1;min-width:200px;position:relative}
        .search-wrap input{width:100%;padding:10px 16px 10px 38px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;background:var(--white);outline:none;transition:all .25s}
        .search-wrap input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(42,157,143,.1)}
        .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.35}
        .listings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .listing-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent;cursor:pointer}
        .listing-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--teal-pale)}
        .listing-img{height:220px;position:relative;overflow:hidden;background:var(--cream-dark)}
        .listing-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .listing-card:hover .listing-img img{transform:scale(1.05)}
        .badges{position:absolute;top:14px;left:14px;display:flex;gap:6px;flex-wrap:wrap}
        .badge{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white}
        .badge-teal{background:var(--teal)}
        .badge-dark{background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
        .badge-red{background:var(--red)}
        .wish-btn{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .2s}
        .wish-btn:hover{transform:scale(1.15)}
        .listing-info{padding:20px}
        .listing-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
        .listing-title{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:700;flex:1}
        .listing-price{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--teal-dark)}
        .listing-original{font-size:13px;color:var(--text-light);text-decoration:line-through;display:block;text-align:right}
        .listing-meta{display:flex;gap:14px;font-size:13px;color:var(--text-mid);margin-bottom:12px;flex-wrap:wrap}
        .listing-seller{display:flex;align-items:center;gap:10px;padding-top:14px;border-top:1px solid var(--cream-dark)}
        .seller-av{width:32px;height:32px;border-radius:50%;background:var(--teal-pale);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .seller-name{font-size:13px;font-weight:700}
        .seller-badge{font-size:10px;font-weight:700;color:var(--teal);background:var(--teal-pale);padding:2px 8px;border-radius:50px;margin-left:4px}
        .seller-rating{font-size:12px;color:var(--text-light);margin-left:auto}
        .sell-section{background:linear-gradient(135deg,var(--teal-dark),var(--teal));border-radius:28px;padding:48px;color:white;display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:start}
        .sell-section h2{color:white;font-size:28px;margin-bottom:12px}
        .sell-rules{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
        .sell-rule{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}
        .sell-rule-icon{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sell-form{background:rgba(255,255,255,.08);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,.1)}
        .form-field{margin-bottom:14px}
        .form-field label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;opacity:.85}
        .form-field input,.form-field select,.form-field textarea{width:100%;padding:11px 14px;border:2px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .form-field input::placeholder,.form-field textarea::placeholder{color:rgba(255,255,255,.35)}
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--orange-light)}
        .form-field select option{background:var(--teal-dark)}
        .form-field textarea{resize:vertical;min-height:70px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .photo-upload{border:2px dashed rgba(255,255,255,.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:14px}
        .photo-upload:hover{border-color:var(--orange-light);background:rgba(255,255,255,.05)}
        .photo-preview{display:flex;gap:8px;margin-bottom:14px}
        .photo-thumb{width:60px;height:60px;border-radius:10px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative}
        .photo-remove{position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:var(--red);color:white;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--teal-dark)}
        .eligibility{background:rgba(255,255,255,.06);border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid rgba(255,255,255,.1)}
        .eligibility h4{font-size:13px;margin-bottom:8px;opacity:.9}
        .elig-item{display:flex;align-items:center;gap:8px;font-size:13px;padding:3px 0}
        .elig-check{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;background:rgba(74,124,63,.3);color:#8FD97A}
        .price-warn{background:rgba(232,78,78,.15);border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:13px;font-weight:600;color:#FF8A8A}
        .btn-orange{padding:13px;width:100%;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:4px}
        .btn-orange:hover{background:#D4812E;transform:translateY(-1px)}
        .success-box{text-align:center;padding:24px 0}
        footer{background:var(--green-dark);color:white;margin-top:0}
        .footer-inner{max-width:1320px;margin:0 auto;padding:32px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:1024px){.listings-grid{grid-template-columns:repeat(2,1fr)}.rules-grid{grid-template-columns:repeat(2,1fr)}.how-grid{grid-template-columns:repeat(2,1fr)}.sell-section{grid-template-columns:1fr}}
        @media(max-width:768px){.listings-grid{grid-template-columns:1fr}.rules-grid,.how-grid{grid-template-columns:1fr}.sell-section{padding:28px 20px}}
        @media(max-width:480px){.form-row{grid-template-columns:1fr}}
      `}</style>

      <div className="beta-bar">🚀 Kwispelclub is in opbouw! De 2de Hands marktplaats is nog niet actief. Onderstaande items zijn ter illustratie.</div>
      <Navbar />

      <div className="breadcrumb"><a href="/">Home</a> › 2de Hands Marktplaats</div>

      {/* HERO */}
      <div className="hero-section">
        <div className="hero-card">
          <div className="hero-blob hb1" />
          <div className="hero-blob hb2" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-tag">♻️ KWISPELCLUB 2DE HANDS</div>
            <h1 className="hero-h1">Geef huisdierspullen een <span style={{ color: 'var(--orange-light)' }}>tweede leven</span></h1>
            <p className="hero-p">Verkoop je gebruikte huisdierproducten aan andere baasjes. Duurzaam, voordelig en binnen de Kwispelclub community.</p>
            <div className="hero-btns">
              <a href="#sell" className="btn-primary">Plaats een advertentie →</a>
              <a href="#listings" className="btn-white">Bekijk aanbod</a>
            </div>
          </div>
          <div className="hero-emoji">♻️</div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section">
        <div className="section-header">
          <h2>Hoe werkt het? 🔄</h2>
          <p>In 4 simpele stappen je spullen verkopen</p>
        </div>
        <div className="how-grid">
          {[
            { n: 1, icon: '🛒', title: 'Koop op Kwispelclub', desc: 'Je moet minstens 1 aankoop hebben gedaan in de laatste 3 maanden.' },
            { n: 2, icon: '📸', title: "Maak foto's", desc: 'Neem duidelijke foto\'s van je product. Eerlijk over de staat!' },
            { n: 3, icon: '📝', title: 'Plaats je advertentie', desc: 'Vul het formulier in. Max. 2 actieve advertenties tegelijk.' },
            { n: 4, icon: '🤝', title: 'Verkoop & Verstuur', desc: 'Koper betaalt veilig via Kwispelclub. Jij verstuurt het product.' },
          ].map(s => (
            <div key={s.n} className="how-card">
              <div className="how-num">{s.n}</div>
              <div className="how-icon">{s.icon}</div>
              <h4 style={{ fontSize: 15, color: 'var(--teal-dark)', marginBottom: 6 }}>{s.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RULES */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="rules-wrap">
          <div className="section-header">
            <h2>Spelregels ✅</h2>
            <p>Eerlijk en veilig handelen voor iedereen</p>
          </div>
          <div className="rules-grid">
            {[
              { icon: '🧾', title: 'Recente aankoop vereist', desc: 'Je moet minstens 1 aankoop hebben gedaan bij Kwispelclub in de laatste 3 maanden om te mogen verkopen.', highlight: true },
              { icon: '✌️', title: 'Max. 2 advertenties', desc: 'Je kunt maximaal 2 producten tegelijk te koop aanbieden. Verkocht = nieuw slot vrij.', highlight: true },
              { icon: '🐾', title: 'Alleen huisdierproducten', desc: 'Enkel producten gerelateerd aan huisdieren. Geen levende dieren, voeding of medicatie.', highlight: false },
              { icon: '📸', title: "Echte foto's", desc: 'Gebruik alleen eigen foto\'s van het product. Geen stockfoto\'s of afbeeldingen van derden.', highlight: false },
              { icon: '💰', title: 'Eerlijke prijzen', desc: 'Max. 70% van de originele nieuwprijs. We controleren op onredelijke prijzen.', highlight: false },
              { icon: '🔒', title: 'Veilige betaling', desc: 'Betalingen verlopen via Kwispelclub. Geld wordt uitbetaald na bevestiging van ontvangst.', highlight: false },
            ].map(r => (
              <div key={r.title} className={`rule-card ${r.highlight ? 'highlight' : ''}`}>
                <div className="rule-icon">{r.icon}</div>
                <h4>{r.title}</h4>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <div className="section" id="listings">
        <div className="section-header">
          <h2>Huidige Advertenties ♻️</h2>
          <p>Tweedehands huisdierproducten van onze community</p>
        </div>
        <div className="demo-notice">⚠️ <span style={{ color: 'var(--orange-main)' }}>Voorbeeldadvertenties</span> — Dit zijn fictieve listings ter illustratie van het platform.</div>
        <div className="filters-bar">
          {[['all','Alle'],['bench','Benches & Manden'],['speelgoed','Speelgoed'],['kleding','Kleding & Tuigjes'],['verzorging','Verzorging']].map(([val, label]) => (
            <button key={val} className={`filter-btn ${catFilter === val ? 'active' : ''}`} onClick={() => setCatFilter(val)}>{label}</button>
          ))}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Zoek op product..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="listings-grid">
          {filtered.map(l => (
            <div key={l.id} className="listing-card">
              <div className="listing-img">
                <img src={l.img} alt={l.title} />
                <div className="badges">
                  <span className="badge badge-teal">♻️ 2DE HANDS</span>
                  <span className="badge badge-dark">{l.condition}</span>
                  {l.reserved && <span className="badge badge-red">GERESERVEERD</span>}
                </div>
                <button className="wish-btn" onClick={() => setWishlist(w => w.includes(l.id) ? w.filter(x => x !== l.id) : [...w, l.id])} style={{ color: wishlist.includes(l.id) ? '#E84E4E' : undefined }}>
                  {wishlist.includes(l.id) ? '♥' : '♡'}
                </button>
              </div>
              <div className="listing-info">
                <div className="listing-head">
                  <div className="listing-title">{l.title}</div>
                  <div>
                    <div className="listing-original">€{l.original.toFixed(2)}</div>
                    <div className="listing-price">€{l.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="listing-meta">
                  <span>📍 {l.location}</span>
                  <span>📅 {l.date}</span>
                  <span>📦 {l.delivery}</span>
                </div>
                <div className="listing-seller">
                  <div className="seller-av">👤</div>
                  <div><span className="seller-name">{l.seller}</span><span className="seller-badge">✓ Koper</span></div>
                  <div className="seller-rating">⭐ {l.rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SELL FORM */}
      <div className="section" id="sell">
        <div className="sell-section">
          <div>
            <h2>Verkoop je huisdierspullen ♻️</h2>
            <p style={{ opacity: .82, fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>Geef je ongebruikte producten een tweede leven en verdien er nog wat aan.</p>
            <div className="sell-rules">
              {[['🧾','Recente aankoop vereist (laatste 3 maanden)'],['✌️','Max. 2 actieve advertenties tegelijk'],['📸',"Eigen foto's van het product"],['💰','Max. 70% van nieuwprijs'],['🔒','Veilige betaling via Kwispelclub'],['🚚','Verzenden of ophalen — jij kiest']].map(([icon, text]) => (
                <div key={text} className="sell-rule"><div className="sell-rule-icon">{icon}</div>{text}</div>
              ))}
            </div>
          </div>
          <div className="sell-form">
            {submitted ? (
              <div className="success-box">
                <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, marginBottom: 8 }}>Advertentie Geplaatst!</h3>
                <p style={{ opacity: .8, fontSize: 14 }}>Je advertentie is ingediend en wordt binnenkort zichtbaar.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, marginBottom: 4 }}>Nieuwe Advertentie</h3>
                <div style={{ fontSize: 13, opacity: .6, marginBottom: 18 }}>Vul alle velden in om je product te koop aan te bieden.</div>

                <div className="eligibility">
                  <h4>⚡ Verkoop-check</h4>
                  {['Kwispelclub account actief','Aankoop in laatste 3 maanden','Advertentieslots beschikbaar (2/2 vrij)'].map(t => (
                    <div key={t} className="elig-item"><div className="elig-check">✓</div>{t}</div>
                  ))}
                </div>

                <div className="photo-upload" onClick={addPhoto}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
                  <p style={{ fontSize: 13, opacity: .7 }}>Klik om foto's te uploaden ({photos.length}/4)</p>
                  <p style={{ fontSize: 11, opacity: .4, marginTop: 4 }}>Max. 4 foto's · JPG/PNG · Max. 5MB</p>
                </div>
                {photos.length > 0 && (
                  <div className="photo-preview">
                    {photos.map((p, i) => (
                      <div key={i} className="photo-thumb">
                        {p}
                        <div className="photo-remove" onClick={() => setPhotos(ph => ph.filter((_, j) => j !== i))}>✕</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-field"><label>Productnaam *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bijv. Kong Hondenbench XL" /></div>
                <div className="form-row">
                  <div className="form-field"><label>Categorie *</label>
                    <select value={cat} onChange={e => setCat(e.target.value)}>
                      {['Benches & Manden','Speelgoed','Kleding & Tuigjes','Verzorging','Voerbakken','Transport & Reizen','Overig'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label>Staat *</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)}>
                      {['Zo goed als nieuw','Licht gebruikt','Goed','Redelijk'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label>Nieuwprijs (€) *</label><input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="89.95" step="0.01" /></div>
                  <div className="form-field"><label>Vraagprijs (€) *</label><input type="number" value={askPrice} onChange={e => setAskPrice(e.target.value)} placeholder="45.00" step="0.01" /></div>
                </div>
                {priceWarning && <div className="price-warn">⚠️ Je vraagprijs is hoger dan 70% van de nieuwprijs. Pas je prijs aan.</div>}
                <div className="form-field"><label>Beschrijving *</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Beschrijf je product: maat, kleur, leeftijd, reden van verkoop..." /></div>
                <div className="form-row">
                  <div className="form-field"><label>Locatie *</label><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bijv. Bree, Limburg" /></div>
                  <div className="form-field"><label>Levering</label>
                    <select value={delivery} onChange={e => setDelivery(e.target.value)}>
                      {['Ophalen of verzenden','Alleen ophalen','Alleen verzenden'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                {sellMsg && <div className="price-warn">{sellMsg}</div>}
                <button className="btn-orange" onClick={handleSell}>Advertentie Plaatsen →</button>
              </>
            )}
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span>© 2026 Kwispelclub</span>
          <div><a href="/privacy">Privacy</a><a href="/contact">Contact</a><a href="/">Home</a></div>
        </div>
      </footer>
    </>
  )
}
