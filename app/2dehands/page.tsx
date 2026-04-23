'use client'

import { useState, useEffect } from 'react'

const LISTINGS = [
  { id:1, cat:'bench', name:'kong hondenbench xl', title:'Kong Hondenbench XL', original:89.95, price:45, condition:'Zo goed als nieuw', location:'Bree', days:'2 dagen geleden', delivery:'Ophalen of verzenden', seller:'Lid ★', rating:4.9, img:'https://images.unsplash.com/photo-1541599468348-e603c130e53d?w=500&q=80', reserved:false },
  { id:2, cat:'kleding', name:'ruffwear anti-trek tuigje m', title:'Ruffwear Anti-trek Tuigje M', original:42, price:22, condition:'Licht gebruikt', location:'Hasselt', days:'5 dagen geleden', delivery:'Verzenden', seller:'Lid ★', rating:5.0, img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80', reserved:false },
  { id:3, cat:'speelgoed', name:'interactief kattenspeeltje pakket', title:'Interactief Kattenspeeltje Pakket', original:24.50, price:12, condition:'Goed', location:'Antwerpen', days:'1 week geleden', delivery:'Verzenden', seller:'Lid ★', rating:4.8, img:'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&q=80', reserved:false },
  { id:4, cat:'bench', name:'curver kattenmand cozy', title:'Curver Kattenmand Cozy', original:34.95, price:18, condition:'Zo goed als nieuw', location:'Gent', days:'3 dagen geleden', delivery:'Ophalen', seller:'Lid ★', rating:4.7, img:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80', reserved:false },
  { id:5, cat:'verzorging', name:'furminator onthaarder large', title:'FURminator Onthaarder Large', original:29.95, price:15, condition:'Licht gebruikt', location:'Leuven', days:'1 dag geleden', delivery:'Verzenden', seller:'Lid ★', rating:5.0, img:'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80', reserved:true },
  { id:6, cat:'kleding', name:'hondenjas winter maat l', title:'Hondenjas Winter Maat L', original:39.95, price:20, condition:'Goed', location:'Maastricht', days:'4 dagen geleden', delivery:'Ophalen of verzenden', seller:'Lid ★', rating:4.6, img:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80', reserved:false },
]

const CATS = [['all','Alle'],['bench','Benches & Manden'],['speelgoed','Speelgoed'],['kleding','Kleding & Tuigjes'],['verzorging','Verzorging']]

export default function TweedeHandsPage() {
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [origPrice, setOrigPrice] = useState('')
  const [askPrice, setAskPrice] = useState('')
  const [sellTitle, setSellTitle] = useState('')
  const [sellDesc, setSellDesc] = useState('')
  const [sellLoc, setSellLoc] = useState('')
  const [sellDone, setSellDone] = useState(false)
  const [sellErr, setSellErr] = useState(false)

  useEffect(() => { window.addEventListener('scroll', () => setScrolled(window.scrollY > 20)) }, [])

  const priceWarn = parseFloat(origPrice) > 0 && parseFloat(askPrice) > 0 && parseFloat(askPrice) > parseFloat(origPrice) * 0.7
  const filtered = LISTINGS.filter(l => (cat === 'all' || l.cat === cat) && l.name.includes(search.toLowerCase()))

  const handleSell = () => {
    if (!sellTitle || !askPrice || !sellDesc || !sellLoc || priceWarn) { setSellErr(true); return }
    setSellDone(true); setSellErr(false)
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1;--teal-dark:#1E7A6E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .beta-bar{background:linear-gradient(90deg,var(--orange-main),#D4812E,var(--orange-main));background-size:200%;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600;animation:shimmer 3s ease infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .navbar{position:sticky;top:0;z-index:100;background:rgba(255,249,240,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:all .3s}.navbar.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:28px}.logo-paw{width:42px;height:42px;border-radius:12px;background:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:22px}.brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--green-dark)}
    .nav-links{display:flex;gap:2px;list-style:none}.nav-links a{text-decoration:none;color:var(--text-dark);font-weight:600;font-size:14px;padding:8px 16px;border-radius:10px;transition:all .2s}.nav-links a:hover,.nav-links a.active{background:var(--teal-pale);color:var(--teal-dark)}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--teal);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--teal-dark),var(--teal),#3DB8A9);border-radius:36px;overflow:hidden;position:relative;padding:56px clamp(32px,5vw,72px);min-height:340px;display:flex;align-items:center}
    .hero-blob{position:absolute;border-radius:50%;pointer-events:none}.hb1{width:350px;height:350px;background:rgba(255,255,255,.06);top:-100px;right:-60px}.hb2{width:200px;height:200px;background:rgba(232,145,58,.08);bottom:-60px;left:20%}
    .hero-content{position:relative;z-index:2;max-width:600px}.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;backdrop-filter:blur(4px)}
    .hero-content h1{font-size:clamp(32px,4.5vw,50px);color:white;line-height:1.1;margin-bottom:16px}.accent{color:#F5A855}.hero-content p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:28px;max-width:460px}.hero-right{position:absolute;right:48px;top:50%;transform:translateY(-50%);font-size:120px;opacity:.15}
    .hero-btns{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}
    .btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--teal-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:var(--brown);margin-bottom:24px}.demo-notice span{color:var(--orange-main)}
    .how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.how-card{text-align:center;padding:28px 16px;border-radius:20px;background:var(--white);box-shadow:0 2px 8px rgba(0,0,0,.06);position:relative;transition:all .3s}.how-card:hover{transform:translateY(-4px)}.how-num{position:absolute;top:16px;left:16px;width:28px;height:28px;border-radius:50%;background:var(--teal);color:white;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}.how-icon{font-size:40px;margin-bottom:14px;margin-top:8px}.how-card h4{font-size:15px;color:var(--teal-dark);margin-bottom:6px}.how-card p{font-size:13px;color:var(--text-mid);line-height:1.5}
    .rules-box{background:var(--white);border-radius:28px;padding:48px}.rules-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:36px}.rule-card{padding:28px 24px;border-radius:20px;background:var(--cream);text-align:center;transition:all .3s;border:2px solid transparent}.rule-card:hover{transform:translateY(-4px)}.rule-card.hl{background:var(--teal-pale);border-color:var(--teal)}.rule-icon{font-size:40px;margin-bottom:14px}.rule-card h4{font-size:16px;color:var(--teal-dark);margin-bottom:8px}.rule-card p{font-size:13px;color:var(--text-mid);line-height:1.55}
    .filters-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;align-items:center}.filter-group{display:flex;gap:8px;flex-wrap:wrap}.filter-btn{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}.filter-btn.active{background:var(--teal);color:white;border-color:var(--teal)}.filter-btn:hover:not(.active){border-color:var(--teal);color:var(--teal)}
    .search-wrap{flex:1;min-width:200px;position:relative}.search-wrap input{width:100%;padding:10px 16px 10px 40px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;background:var(--white);outline:none;transition:all .25s}.search-wrap input:focus{border-color:var(--teal)}.search-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.35}
    .listings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.listing-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.listing-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--teal-pale)}
    .listing-img{height:220px;position:relative;overflow:hidden;background:var(--cream-dark)}.listing-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.listing-card:hover .listing-img img{transform:scale(1.05)}
    .badges{position:absolute;top:14px;left:14px;display:flex;gap:6px;flex-wrap:wrap;z-index:2}.badge{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white}.bt{background:var(--teal)}.bd{background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}.br{background:var(--red)}
    .wish-btn{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:all .2s;z-index:2}.wish-btn.liked{color:var(--red)}
    .listing-info{padding:20px}.listing-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}.listing-title{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:700;flex:1}.listing-prices{text-align:right}.orig-price{font-size:13px;color:var(--text-light);text-decoration:line-through}.listing-price{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--teal-dark)}
    .listing-meta{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text-mid);margin-bottom:12px;flex-wrap:wrap}.listing-seller{display:flex;align-items:center;gap:10px;padding-top:14px;border-top:1px solid var(--cream-dark)}.seller-av{width:32px;height:32px;border-radius:50%;background:var(--teal-pale);display:flex;align-items:center;justify-content:center;font-size:16px}.seller-name{font-size:13px;font-weight:700}.seller-badge{font-size:10px;font-weight:700;color:var(--teal);background:var(--teal-pale);padding:2px 8px;border-radius:50px;margin-left:4px}.seller-rating{font-size:12px;color:var(--text-light);margin-left:auto}
    .sell-section{background:linear-gradient(135deg,var(--teal-dark),var(--teal));border-radius:28px;padding:48px;color:white;display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:start}.sell-section h2{font-size:28px;margin-bottom:14px;color:white}.sell-desc{opacity:.82;font-size:15px;line-height:1.65;margin-bottom:24px}
    .sell-rules{display:flex;flex-direction:column;gap:12px;margin-bottom:28px}.sell-rule{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600}.sric{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .sell-form{background:rgba(255,255,255,.08);border-radius:20px;padding:32px;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1)}.sell-form h3{font-size:20px;margin-bottom:6px}.form-sub{font-size:13px;opacity:.6;margin-bottom:20px}
    .eligibility{background:rgba(255,255,255,.06);border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid rgba(255,255,255,.1)}.eligibility h4{font-size:14px;margin-bottom:10px;opacity:.9}.elig-item{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0}.chk{width:20px;height:20px;border-radius:50%;background:rgba(74,124,63,.3);color:#8FD97A;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
    .slots-info{background:rgba(255,255,255,.1);border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}.slots-dots{display:flex;gap:6px}.sdot{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px}
    .fg{margin-bottom:16px}.fg label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;opacity:.85}.fg input,.fg select,.fg textarea{width:100%;padding:12px 16px;border:2px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(255,255,255,.08);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}.fg input::placeholder,.fg textarea::placeholder{color:rgba(255,255,255,.35)}.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#F5A855;background:rgba(255,255,255,.12)}.fg select{-webkit-appearance:none;cursor:pointer}.fg select option{background:var(--teal-dark);color:white}.fg textarea{resize:vertical;min-height:70px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.price-warn,.sell-err{background:rgba(232,78,78,.15);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;font-weight:600;color:#FF8A8A}
    .sell-success{text-align:center;padding:24px 0}.sell-success .si{font-size:56px;margin-bottom:12px}.sell-success h3{color:white;font-size:20px;margin-bottom:8px}.sell-success p{opacity:.8;font-size:14px}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}.footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:white}.footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px;transition:opacity .2s}.footer-links a:hover{opacity:1}.footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:1024px){.listings-grid{grid-template-columns:repeat(2,1fr)}.rules-grid{grid-template-columns:repeat(2,1fr)}.how-grid{grid-template-columns:repeat(2,1fr)}.sell-section{grid-template-columns:1fr}}
    @media(max-width:768px){.nav-links{display:none}.listings-grid{grid-template-columns:1fr}.rules-grid,.how-grid{grid-template-columns:1fr}.hero-right{display:none}}
    @media(max-width:480px){.form-row{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="beta-bar">🚀 Kwispelclub is in opbouw! De 2de Hands marktplaats is nog niet actief. Onderstaande items zijn ter illustratie.</div>

      <nav className={`navbar ${scrolled?'scrolled':''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo"><div className="logo-paw">🐾</div><span className="brand">Kwispelclub</span></a>
          <ul className="nav-links">
            <li><a href="/#shop">Shop</a></li><li><a href="/2dehands" className="active">2de Hands</a></li><li><a href="/kapsalons">Kapsalons</a></li><li><a href="/#academy">Academy</a></li>
          </ul>
          <div style={{flex:1}} />
        </div>
      </nav>

      <div className="breadcrumb"><a href="/">Home</a> › 2de Hands Marktplaats</div>

      <section className="page-hero">
        <div className="hero-card">
          <div className="hero-blob hb1"/><div className="hero-blob hb2"/>
          <div className="hero-content">
            <div className="hero-tag">♻️ KWISPELCLUB 2DE HANDS</div>
            <h1>Geef huisdierspullen een <span className="accent">tweede leven</span></h1>
            <p>Verkoop je gebruikte huisdierproducten aan andere baasjes. Duurzaam, voordelig en binnen de Kwispelclub community.</p>
            <div className="hero-btns">
              <a href="#sell" className="btn btn-primary">Plaats een advertentie →</a>
              <a href="#listings" className="btn btn-white">Bekijk aanbod</a>
            </div>
          </div>
          <div className="hero-right">♻️</div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><h2>Hoe werkt het? 🔄</h2><p>In 4 simpele stappen je spullen verkopen</p></div>
        <div className="how-grid">
          {[['🛒','Koop op Kwispelclub','Je moet minstens 1 aankoop hebben gedaan in de laatste 3 maanden.'],['📸','Maak foto\'s','Neem duidelijke foto\'s van je product. Eerlijk over de staat!'],['📝','Plaats je advertentie','Vul het formulier in. Max. 2 actieve advertenties tegelijk.'],['🤝','Verkoop & Verstuur','Koper betaalt veilig via Kwispelclub. Jij verstuurt het product.']].map(([icon,title,desc],i) => (
            <div key={i} className="how-card"><div className="how-num">{i+1}</div><div className="how-icon">{icon}</div><h4>{title}</h4><p>{desc}</p></div>
          ))}
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="rules-box">
          <div className="section-header"><h2>Spelregels ✅</h2><p>Eerlijk en veilig handelen voor iedereen</p></div>
          <div className="rules-grid">
            {[{icon:'🧾',title:'Recente aankoop vereist',desc:'Je moet minstens 1 aankoop hebben gedaan bij Kwispelclub in de laatste 3 maanden om te mogen verkopen.',hl:true},{icon:'✌️',title:'Max. 2 advertenties',desc:'Je kunt maximaal 2 producten tegelijk te koop aanbieden. Verkocht = nieuw slot vrij.',hl:true},{icon:'🐾',title:'Alleen huisdierproducten',desc:'Enkel producten gerelateerd aan huisdieren. Geen levende dieren, voeding of medicatie.',hl:false},{icon:'📸',title:'Echte foto\'s',desc:'Gebruik alleen eigen foto\'s van het product. Geen stockfoto\'s of afbeeldingen van derden.',hl:false},{icon:'💰',title:'Eerlijke prijzen',desc:'Max. 70% van de originele nieuwprijs. We controleren op onredelijke prijzen.',hl:false},{icon:'🔒',title:'Veilige betaling',desc:'Betalingen verlopen via Kwispelclub. Geld wordt uitbetaald na bevestiging van ontvangst.',hl:false}].map(r => (
              <div key={r.title} className={`rule-card ${r.hl?'hl':''}`}><div className="rule-icon">{r.icon}</div><h4>{r.title}</h4><p>{r.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="listings">
        <div className="section-header"><h2>Huidige Advertenties ♻️</h2><p>Tweedehands huisdierproducten van onze community</p></div>
        <div className="demo-notice">⚠️ <span>Voorbeeldadvertenties</span> — Dit zijn fictieve listings ter illustratie van het platform. De vermelde verkopers zijn geen echte gebruikers.</div>
        <div className="filters-bar">
          <div className="filter-group">
            {CATS.map(([id,label]) => <button key={id} className={`filter-btn ${cat===id?'active':''}`} onClick={() => setCat(id)}>{label}</button>)}
          </div>
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
                <div className="badges"><span className="badge bt">♻️ 2DE HANDS</span><span className="badge bd">{l.condition}</span>{l.reserved && <span className="badge br">GERESERVEERD</span>}</div>
                <button className={`wish-btn ${liked.has(l.id)?'liked':''}`} onClick={() => { const n = new Set(liked); n.has(l.id)?n.delete(l.id):n.add(l.id); setLiked(n) }}>{liked.has(l.id)?'♥':'♡'}</button>
              </div>
              <div className="listing-info">
                <div className="listing-head">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-prices"><div className="orig-price">€{l.original.toFixed(2)}</div><div className="listing-price">€{l.price.toFixed(2)}</div></div>
                </div>
                <div className="listing-meta"><span>📍 {l.location}</span><span>📅 {l.days}</span><span>📦 {l.delivery}</span></div>
                <div className="listing-seller">
                  <div className="seller-av">👤</div>
                  <div><span className="seller-name">Kwispelclub lid</span><span className="seller-badge">✓ Voorbeeld</span></div>
                  <div className="seller-rating">⭐ {l.rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="sell">
        <div className="sell-section">
          <div>
            <h2>Verkoop je huisdierspullen ♻️</h2>
            <p className="sell-desc">Geef je ongebruikte producten een tweede leven en verdien er nog wat aan. Goed voor je portemonnee én het milieu.</p>
            <div className="sell-rules">
              {[['🧾','Recente aankoop vereist (laatste 3 maanden)'],['✌️','Max. 2 actieve advertenties tegelijk'],['📸','Eigen foto\'s van het product'],['💰','Max. 70% van nieuwprijs'],['🔒','Veilige betaling via Kwispelclub'],['🚚','Verzenden of ophalen — jij kiest']].map(([i,t]) => (
                <div key={t} className="sell-rule"><div className="sric">{i}</div>{t}</div>
              ))}
            </div>
          </div>
          <div className="sell-form">
            {sellDone ? (
              <div className="sell-success"><div className="si">✅</div><h3>Advertentie geplaatst!</h3><p>Je advertentie wordt beoordeeld en binnen 24u gepubliceerd.</p></div>
            ) : (
              <>
                <h3>Nieuwe Advertentie</h3>
                <div className="form-sub">Vul alle velden in om je product te koop aan te bieden.</div>
                <div className="eligibility">
                  <h4>⚡ Verkoop-check</h4>
                  <div className="elig-item"><div className="chk">✓</div>Kwispelclub account actief</div>
                  <div className="elig-item"><div className="chk">✓</div>Aankoop in laatste 3 maanden</div>
                  <div className="elig-item"><div className="chk">✓</div>Advertentieslots beschikbaar (2/2 vrij)</div>
                </div>
                <div className="slots-info">
                  <span>Jouw slots:</span>
                  <div className="slots-dots"><div className="sdot">1</div><div className="sdot">2</div></div>
                  <span style={{opacity:.7,marginLeft:'auto'}}>2 van 2 beschikbaar</span>
                </div>
                <div className="fg"><label>Productnaam *</label><input placeholder="Bijv. Kong Hondenbench XL" value={sellTitle} onChange={e => setSellTitle(e.target.value)} /></div>
                <div className="form-row">
                  <div className="fg"><label>Categorie *</label><select><option>Benches & Manden</option><option>Speelgoed</option><option>Kleding & Tuigjes</option><option>Verzorging</option><option>Overig</option></select></div>
                  <div className="fg"><label>Staat *</label><select><option>Zo goed als nieuw</option><option>Licht gebruikt</option><option>Goed</option><option>Redelijk</option></select></div>
                </div>
                <div className="form-row">
                  <div className="fg"><label>Nieuwprijs (€) *</label><input type="number" placeholder="89.95" value={origPrice} onChange={e => setOrigPrice(e.target.value)} /></div>
                  <div className="fg"><label>Vraagprijs (€) *</label><input type="number" placeholder="45.00" value={askPrice} onChange={e => setAskPrice(e.target.value)} /></div>
                </div>
                {priceWarn && <div className="price-warn">⚠️ Je vraagprijs is hoger dan 70% van de nieuwprijs. Pas je prijs aan.</div>}
                <div className="fg"><label>Beschrijving *</label><textarea placeholder="Beschrijf je product..." value={sellDesc} onChange={e => setSellDesc(e.target.value)} /></div>
                <div className="form-row">
                  <div className="fg"><label>Locatie *</label><input placeholder="Bijv. Bree, Limburg" value={sellLoc} onChange={e => setSellLoc(e.target.value)} /></div>
                  <div className="fg"><label>Levering</label><select><option>Ophalen of verzenden</option><option>Alleen ophalen</option><option>Alleen verzenden</option></select></div>
                </div>
                {sellErr && <div className="sell-err">⚠️ Vul alle verplichte velden in</div>}
                <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleSell}>Advertentie Plaatsen →</button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="b">Kwispelclub</span></a>
          <div className="footer-links"><a href="/">Home</a><a href="/#shop">Shop</a><a href="/2dehands">2de Hands</a><a href="/kapsalons">Kapsalons</a></div>
          <div className="footer-copy">© 2026 Kwispelclub. Alle rechten voorbehouden. 🇧🇪 België & 🇳🇱 Nederland</div>
        </div>
      </footer>
    </>
  )
}
