'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import ContacteerVerkoper from '@/components/ContacteerVerkoper'

const DEMO_LISTINGS = [
  { id: 'd1', demo: true, titel: 'Kong Hondenbench XL', beschrijving: 'Nauwelijks gebruikt, ideaal voor grote honden.', categorie: 'bench', staat: 'zo_goed_als_nieuw', nieuwprijs: 89.95, vraagprijs: 45, locatie: 'Bree', levering: 'ophalen_of_verzenden', foto_urls: ['https://images.unsplash.com/photo-1541599468348-e603c130e53d?w=500&q=80'], status: 'actief', seller_name: 'Kwispelclub lid', created_at: new Date().toISOString() },
  { id: 'd2', demo: true, titel: 'Ruffwear Anti-trek Tuigje M', beschrijving: 'Licht gebruikt, goede staat.', categorie: 'kleding', staat: 'licht_gebruikt', nieuwprijs: 42, vraagprijs: 22, locatie: 'Hasselt', levering: 'verzenden', foto_urls: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80'], status: 'actief', seller_name: 'Kwispelclub lid', created_at: new Date().toISOString() },
  { id: 'd3', demo: true, titel: 'Interactief Kattenspeeltje Pakket', beschrijving: 'Veer, laser en tunnel, amper gebruikt.', categorie: 'speelgoed', staat: 'goed', nieuwprijs: 24.50, vraagprijs: 12, locatie: 'Antwerpen', levering: 'verzenden', foto_urls: ['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&q=80'], status: 'actief', seller_name: 'Kwispelclub lid', created_at: new Date().toISOString() },
]

const CATS = [['all','Alle'],['bench','Benches & Manden'],['speelgoed','Speelgoed'],['kleding','Kleding & Tuigjes'],['verzorging','Verzorging'],['overig','Overig']]
const STAAT_LABELS: Record<string, string> = { zo_goed_als_nieuw: 'Zo goed als nieuw', licht_gebruikt: 'Licht gebruikt', goed: 'Goed', redelijk: 'Redelijk' }

export default function TweedeHandsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [listings, setListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [showDemo, setShowDemo] = useState(false)

  const [sellTitel, setSellTitel] = useState('')
  const [sellDesc, setSellDesc] = useState('')
  const [sellCat, setSellCat] = useState('bench')
  const [sellStaat, setSellStaat] = useState('zo_goed_als_nieuw')
  const [sellNieuw, setSellNieuw] = useState('')
  const [sellPrijs, setSellPrijs] = useState('')
  const [sellLoc, setSellLoc] = useState('')
  const [sellLevering, setSellLevering] = useState('ophalen_of_verzenden')
  const [sellFotos, setSellFotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [sellLoading, setSellLoading] = useState(false)
  const [sellDone, setSellDone] = useState(false)
  const [sellErr, setSellErr] = useState('')
  const [eigenListings, setEigenListings] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const priceWarn = parseFloat(sellNieuw) > 0 && parseFloat(sellPrijs) > 0 && parseFloat(sellPrijs) > parseFloat(sellNieuw) * 0.7
  const activeEigen = eigenListings.filter(l => l.status === 'actief').length

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadEigenListings(session.user.id)
    })
    loadListings()
    fetch('/api/admin-settings').then(r => r.json()).then(d => {
      setShowDemo(d.settings?.demo_2dehands !== false)
    })
  }, [])

  const loadListings = async () => {
    setLoadingListings(true)
    const params = new URLSearchParams()
    if (cat !== 'all') params.set('categorie', cat)
    if (search) params.set('search', search)
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings || [])
    setLoadingListings(false)
  }

  const loadEigenListings = async (userId: string) => {
    const res = await fetch(`/api/listings?seller_id=${userId}`)
    const data = await res.json()
    setEigenListings(data.listings || [])
  }

  useEffect(() => { loadListings() }, [cat, search])

  const resizeImage = (file: File, maxPx = 1000, quality = 0.82): Promise<Blob> =>
    new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality)
      }
      img.src = url
    })

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files).slice(0, 4)) {
      const blob = await resizeImage(file)
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { data, error } = await supabase.storage.from('listings').upload(path, blob, { contentType: 'image/jpeg' })
      if (!error && data) {
        const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
        urls.push(url.publicUrl)
      }
    }
    setSellFotos(prev => [...prev, ...urls].slice(0, 4))
    setUploading(false)
  }

  const handleSell = async () => {
    if (!user) { setSellErr('Je moet ingelogd zijn om een advertentie te plaatsen'); return }
    if (!sellTitel || !sellPrijs || !sellDesc || !sellLoc) { setSellErr('Vul alle verplichte velden in'); return }
    if (priceWarn) { setSellErr('Vraagprijs mag max. 70% van de nieuwprijs zijn'); return }
    if (activeEigen >= 2) { setSellErr('Je hebt al 2 actieve advertenties (maximum bereikt)'); return }

    setSellLoading(true); setSellErr('')
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller_id: user.id,
        titel: sellTitel,
        beschrijving: sellDesc,
        categorie: sellCat,
        staat: sellStaat,
        nieuwprijs: sellNieuw || null,
        vraagprijs: sellPrijs,
        locatie: sellLoc,
        levering: sellLevering,
        foto_urls: sellFotos,
      })
    })
    const data = await res.json()
    if (data.error) { setSellErr(data.error); setSellLoading(false); return }

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'listing_bevestiging',
        to: user.email,
        data: {
          firstName: user.user_metadata?.first_name || 'Baasje',
          titel: sellTitel,
          prijs: parseFloat(sellPrijs),
          locatie: sellLoc,
        }
      })
    })

    setSellDone(true)
    loadListings()
    if (user) loadEigenListings(user.id)
    setSellLoading(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await fetch('/api/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, seller_id: user?.id })
    })
    loadEigenListings(user?.id)
    loadListings()
  }

  const filtered = listings.filter(l =>
    (cat === 'all' || l.categorie === cat) &&
    (!search || l.titel?.toLowerCase().includes(search.toLowerCase()))
  )

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1;--teal-dark:#1E7A6E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--teal);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--teal-dark),var(--teal),#3DB8A9);border-radius:36px;overflow:hidden;position:relative;padding:56px clamp(32px,5vw,72px);min-height:340px;display:flex;align-items:center}
    .blob{position:absolute;border-radius:50%;pointer-events:none}.b1{width:350px;height:350px;background:rgba(255,255,255,.06);top:-100px;right:-60px}.b2{width:200px;height:200px;background:rgba(232,145,58,.08);bottom:-60px;left:20%}
    .hero-content{position:relative;z-index:2;max-width:600px}.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;backdrop-filter:blur(4px)}
    .hero-content h1{font-size:clamp(32px,4.5vw,50px);color:white;line-height:1.1;margin-bottom:16px}.accent{color:#F5A855}.hero-content p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:28px;max-width:460px}.hero-right{position:absolute;right:48px;top:50%;transform:translateY(-50%);font-size:120px;opacity:.15}
    .hero-btns{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}
    .btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--teal-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .filters-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;align-items:center}
    .filter-group{display:flex;gap:8px;flex-wrap:wrap}.filter-btn{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}.filter-btn.active{background:var(--teal);color:white;border-color:var(--teal)}.filter-btn:hover:not(.active){border-color:var(--teal);color:var(--teal)}
    .search-wrap{flex:1;min-width:200px;position:relative}.search-wrap input{width:100%;padding:10px 16px 10px 40px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;background:var(--white);outline:none;transition:all .25s}.search-wrap input:focus{border-color:var(--teal)}.search-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.35}
    .listings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .listing-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.listing-card:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--teal-pale)}
    .listing-img{height:220px;position:relative;overflow:hidden;background:var(--cream-dark)}.listing-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.listing-card:hover .listing-img img{transform:scale(1.05)}
    .badges{position:absolute;top:14px;left:14px;display:flex;gap:6px;z-index:2}.lbadge{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white}.bt{background:var(--teal)}.bd{background:rgba(0,0,0,.5)}.demo-badge{background:rgba(232,145,58,.9)}
    .wish-btn{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:all .2s;z-index:2}.wish-btn.liked{color:var(--red)}
    .listing-info{padding:20px}.listing-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
    .listing-title{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:700;flex:1}.listing-prices{text-align:right}.orig-price{font-size:13px;color:var(--text-light);text-decoration:line-through}.listing-price{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--teal-dark)}
    .listing-meta{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text-mid);margin-bottom:12px;flex-wrap:wrap}
    .listing-seller{display:flex;align-items:center;gap:10px;padding-top:14px;border-top:1px solid var(--cream-dark)}.seller-av{width:32px;height:32px;border-radius:50%;background:var(--teal-pale);display:flex;align-items:center;justify-content:center;font-size:16px}.seller-name{font-size:13px;font-weight:700}.seller-badge{font-size:10px;font-weight:700;color:var(--teal);background:var(--teal-pale);padding:2px 8px;border-radius:50px;margin-left:4px}
    .empty-listings{text-align:center;padding:48px;color:var(--text-light)}.empty-listings .ei{font-size:48px;margin-bottom:12px;opacity:.4}
    .sell-section{background:linear-gradient(135deg,var(--teal-dark),var(--teal));border-radius:28px;padding:48px;color:white;display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:start}
    .sell-section h2{font-size:28px;margin-bottom:14px;color:white}.sell-desc{opacity:.82;font-size:15px;line-height:1.65;margin-bottom:24px}
    .sell-rules{display:flex;flex-direction:column;gap:12px;margin-bottom:28px}.sell-rule{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600}.sric{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .sell-form{background:rgba(255,255,255,.08);border-radius:20px;padding:32px;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1)}.sell-form h3{font-size:20px;margin-bottom:6px;color:white}.form-sub{font-size:13px;opacity:.6;margin-bottom:20px}
    .slots-info{background:rgba(255,255,255,.1);border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}
    .sdot{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px}
    .sdot.used{background:var(--orange-main);border-color:var(--orange-main)}
    .fg{margin-bottom:16px}.fg label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;opacity:.85}
    .fg input,.fg select,.fg textarea{width:100%;padding:12px 16px;border:2px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(255,255,255,.08);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
    .fg input::placeholder,.fg textarea::placeholder{color:rgba(255,255,255,.35)}.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#F5A855;background:rgba(255,255,255,.12)}.fg select{-webkit-appearance:none;cursor:pointer}.fg select option{background:var(--teal-dark);color:white}.fg textarea{resize:vertical;min-height:70px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .foto-upload{border:2px dashed rgba(255,255,255,.3);border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:16px}.foto-upload:hover{border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.05)}
    .foto-preview{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .foto-thumb{width:60px;height:60px;border-radius:8px;object-fit:cover;border:2px solid rgba(255,255,255,.2)}
    .price-warn,.sell-err{background:rgba(232,78,78,.15);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;font-weight:600;color:#FF8A8A}
    .sell-success{text-align:center;padding:24px 0}.sell-success .si{font-size:56px;margin-bottom:12px}.sell-success h3{color:white;font-size:20px;margin-bottom:8px}.sell-success p{opacity:.8;font-size:14px}
    .login-prompt{background:rgba(255,255,255,.08);border-radius:12px;padding:24px;text-align:center;color:white}.login-prompt p{opacity:.8;margin-bottom:16px;font-size:15px}.login-prompt a{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:50px;background:var(--orange-main);color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none}
    .eigen-btn{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;border:none;cursor:pointer;font-family:'Nunito',sans-serif;transition:all .2s}
    .eb-verkocht{background:rgba(42,157,143,.4);color:white}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
    .footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:white}
    .footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px}.footer-links a:hover{opacity:1}
    .footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:1024px){.listings-grid{grid-template-columns:repeat(2,1fr)}.sell-section{grid-template-columns:1fr}}
    @media(max-width:768px){.listings-grid{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="breadcrumb"><a href="/">Home</a> › 2de Hands Marktplaats</div>

      <section className="page-hero">
        <div className="hero-card">
          <div className="blob b1"/><div className="blob b2"/>
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

      <section className="section" id="listings">
        <div className="section-header">
          <h2>Huidige Advertenties ♻️</h2>
          <p>{listings.length > 0 ? `${listings.length} advertentie${listings.length !== 1 ? 's' : ''} beschikbaar` : 'Tweedehands huisdierproducten van onze community'}</p>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            {CATS.map(([id, label]) => (
              <button key={id} className={`filter-btn ${cat === id ? 'active' : ''}`} onClick={() => setCat(id)}>{label}</button>
            ))}
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Zoek op product..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loadingListings ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-listings">
            <div className="ei">♻️</div>
            <p>Geen advertenties gevonden</p>
            <a href="#sell" style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 8, display: 'block' }}>Wees de eerste! Plaats een advertentie →</a>
          </div>
        ) : (
          <div className="listings-grid">
            {filtered.map((l: any) => (
              <div key={l.id} className="listing-card">
                <div className="listing-img">
                  <img src={l.foto_urls?.[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80'} alt={l.titel} />
                  <div className="badges">
                    <span className="lbadge bt">♻️ 2DE HANDS</span>
                    <span className="lbadge bd">{STAAT_LABELS[l.staat] || l.staat}</span>
                    {l.demo && <span className="lbadge demo-badge">VOORBEELD</span>}
                  </div>
                  <button
                    className={`wish-btn ${liked.has(l.id) ? 'liked' : ''}`}
                    onClick={() => { const n = new Set(liked); n.has(l.id) ? n.delete(l.id) : n.add(l.id); setLiked(n) }}
                  >
                    {liked.has(l.id) ? '♥' : '♡'}
                  </button>
                </div>
                <div className="listing-info">
                  <div className="listing-head">
                    <div className="listing-title">{l.titel}</div>
                    <div className="listing-prices">
                      {l.nieuwprijs && <div className="orig-price">€{parseFloat(l.nieuwprijs).toFixed(2)}</div>}
                      <div className="listing-price">€{parseFloat(l.vraagprijs).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="listing-meta">
                    <span>📍 {l.locatie}</span>
                    <span>📦 {l.levering?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="listing-seller">
                    <div className="seller-av">👤</div>
                    <div>
                      <span className="seller-name">
                        {l.demo ? 'Kwispelclub lid' : `${l.profiles?.first_name || ''} ${l.profiles?.last_name?.[0] || ''}.`.trim()}
                      </span>
                      <span className="seller-badge">{l.demo ? '✓ Voorbeeld' : '✓ Lid'}</span>
                    </div>
                  </div>
                  {/* ✅ Contacteer verkoper knop — alleen voor echte listings */}
                  {!l.demo && (
                    <div style={{ marginTop: 12 }}>
                      <ContacteerVerkoper
                        receiverId={l.seller_id}
                        listingId={l.id}
                        productNaam={l.titel}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section" id="sell">
        <div className="sell-section">
          <div>
            <h2>Verkoop je huisdierspullen ♻️</h2>
            <p className="sell-desc">Geef je ongebruikte producten een tweede leven. Goed voor je portemonnee én het milieu.</p>
            <div className="sell-rules">
              {[['🧾','Kwispelclub account vereist'],['✌️','Max. 2 actieve advertenties tegelijk'],['📸','Eigen foto\'s van het product'],['💰','Max. 70% van nieuwprijs'],['🔒','Veilig via Kwispelclub']].map(([i, t]) => (
                <div key={t} className="sell-rule"><div className="sric">{i}</div>{t}</div>
              ))}
            </div>
          </div>

          <div className="sell-form">
            {!user ? (
              <div className="login-prompt">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <p>Je moet ingelogd zijn om een advertentie te plaatsen.</p>
                <a href="/auth">Inloggen / Registreren →</a>
              </div>
            ) : sellDone ? (
              <div className="sell-success">
                <div className="si">✅</div>
                <h3>Advertentie geplaatst!</h3>
                <p>Je advertentie staat nu live op de marktplaats. Je ontvangt een bevestiging per e-mail.</p>
                <button className="btn btn-white" style={{ margin: '16px auto 0', display: 'flex' }} onClick={() => { setSellDone(false); setSellTitel(''); setSellDesc(''); setSellPrijs(''); setSellNieuw(''); setSellLoc(''); setSellFotos([]) }}>
                  Nog een advertentie plaatsen
                </button>
              </div>
            ) : (
              <>
                <h3>Nieuwe Advertentie</h3>
                <div className="form-sub">Vul alle velden in om je product aan te bieden.</div>
                <div className="slots-info">
                  <span>Jouw slots:</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div className={`sdot ${activeEigen >= 1 ? 'used' : ''}`}>{activeEigen >= 1 ? '✓' : '1'}</div>
                    <div className={`sdot ${activeEigen >= 2 ? 'used' : ''}`}>{activeEigen >= 2 ? '✓' : '2'}</div>
                  </div>
                  <span style={{ opacity: .7, marginLeft: 'auto' }}>{2 - activeEigen} van 2 beschikbaar</span>
                </div>
                {eigenListings.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <h3 style={{ color: 'white', fontSize: 14, marginBottom: 10 }}>Jouw advertenties:</h3>
                    {eigenListings.map(l => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.1)', fontSize: 13, color: 'white' }}>
                        <span style={{ flex: 1 }}>{l.titel}</span>
                        <span style={{ opacity: .7 }}>€{parseFloat(l.vraagprijs).toFixed(2)}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 50, background: l.status === 'actief' ? 'rgba(74,124,63,.4)' : 'rgba(255,255,255,.1)', fontSize: 11 }}>{l.status}</span>
                        {l.status === 'actief' && (
                          <button className="eigen-btn eb-verkocht" onClick={() => handleStatusUpdate(l.id, 'verkocht')}>Verkocht</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="fg"><label>Productnaam *</label><input placeholder="Bijv. Kong Hondenbench XL" value={sellTitel} onChange={e => setSellTitel(e.target.value)} /></div>
                <div className="form-row">
                  <div className="fg"><label>Categorie</label>
                    <select value={sellCat} onChange={e => setSellCat(e.target.value)}>
                      <option value="bench">Benches & Manden</option>
                      <option value="speelgoed">Speelgoed</option>
                      <option value="kleding">Kleding & Tuigjes</option>
                      <option value="verzorging">Verzorging</option>
                      <option value="overig">Overig</option>
                    </select>
                  </div>
                  <div className="fg"><label>Staat</label>
                    <select value={sellStaat} onChange={e => setSellStaat(e.target.value)}>
                      <option value="zo_goed_als_nieuw">Zo goed als nieuw</option>
                      <option value="licht_gebruikt">Licht gebruikt</option>
                      <option value="goed">Goed</option>
                      <option value="redelijk">Redelijk</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg"><label>Nieuwprijs (€)</label><input type="number" placeholder="89.95" value={sellNieuw} onChange={e => setSellNieuw(e.target.value)} /></div>
                  <div className="fg"><label>Vraagprijs (€) *</label><input type="number" placeholder="45.00" value={sellPrijs} onChange={e => setSellPrijs(e.target.value)} /></div>
                </div>
                {priceWarn && <div className="price-warn">⚠️ Vraagprijs mag max. 70% van de nieuwprijs zijn.</div>}
                <div className="fg"><label>Beschrijving *</label><textarea placeholder="Beschrijf je product: maat, kleur, reden van verkoop..." value={sellDesc} onChange={e => setSellDesc(e.target.value)} /></div>
                <div className="form-row">
                  <div className="fg"><label>Locatie *</label><input placeholder="Bijv. Bree, Limburg" value={sellLoc} onChange={e => setSellLoc(e.target.value)} /></div>
                  <div className="fg"><label>Levering</label>
                    <select value={sellLevering} onChange={e => setSellLevering(e.target.value)}>
                      <option value="ophalen_of_verzenden">Ophalen of verzenden</option>
                      <option value="alleen_ophalen">Alleen ophalen</option>
                      <option value="alleen_verzenden">Alleen verzenden</option>
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <label>Foto's (max. 4) — automatisch verkleind</label>
                  {sellFotos.length > 0 && (
                    <div className="foto-preview">
                      {sellFotos.map((url, i) => <img key={i} src={url} className="foto-thumb" alt={`foto ${i+1}`} />)}
                    </div>
                  )}
                  <div className="foto-upload" onClick={() => fileRef.current?.click()}>
                    {uploading ? '⏳ Uploaden & verkleinen...' : '📸 Klik om foto\'s toe te voegen'}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFotoUpload} />
                </div>
                {sellErr && <div className="sell-err">⚠️ {sellErr}</div>}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', opacity: sellLoading ? .6 : 1 }}
                  onClick={handleSell}
                  disabled={sellLoading || activeEigen >= 2}
                >
                  {sellLoading ? 'Bezig...' : activeEigen >= 2 ? 'Maximaal 2 advertenties bereikt' : 'Advertentie Plaatsen →'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="b">Kwispelclub</span></a>
          <div className="footer-links"><a href="/">Home</a><a href="/#shop">Shop</a><a href="/2dehands">2de Hands</a><a href="/kapsalons">Kapsalons</a></div>
          <div className="footer-copy">© 2026 Kwispelclub. Alle rechten voorbehouden.</div>
        </div>
      </footer>
    </>
  )
}
