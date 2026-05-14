'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

const CATEGORIES = ['Alle','Voeding & Snacks','Speelgoed','Verzorging','Kleding & Accessoires','Gezondheid','Overig']

export default function WinkelPage() {
  const supabase = useMemo(() => createClient(), [])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('Alle')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('nieuwst')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    loadProducts()
    updateCartCount()
    window.addEventListener('cart-updated', updateCartCount)
    return () => window.removeEventListener('cart-updated', updateCartCount)
  }, [])

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('kc_cart') || '[]')
      setCartCount(cart.reduce((s: number, i: any) => s + i.aantal, 0))
    } catch {}
  }

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'actief')
      .order('created_at', { ascending: false })
    const products = data || []
    // Laad verkopers info apart via profile_id = seller_id
    const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))]
    let verkopersMap: Record<string, any> = {}
    if (sellerIds.length > 0) {
      const { data: vData } = await supabase
        .from('verkopers')
        .select('profile_id, shop_naam, slug, logo_url')
        .in('profile_id', sellerIds)
      if (vData) vData.forEach((v: any) => { verkopersMap[v.profile_id] = v })
    }
    setProducts(products.map((p: any) => ({ ...p, verkopers: verkopersMap[p.seller_id] || null })))
    setLoading(false)
  }

  const addToCart = (p: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem('kc_cart') || '[]')
      const idx = cart.findIndex((i: any) => i.id === p.id)
      if (idx >= 0) cart[idx].aantal += 1
      else cart.push({
        id: p.id, naam: p.name, prijs: parseFloat(p.price),
        aantal: 1, emoji: '🐾', img: p.image_url || null,
        seller_id: p.seller_id,
      })
      localStorage.setItem('kc_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      setAddedIds(prev => new Set(prev).add(p.id))
      setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(p.id); return n }), 2000)
    } catch (e) { console.error(e) }
  }

  const filtered = products
    .filter(p => cat === 'Alle' || p.category === cat)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'prijs-laag') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'prijs-hoog') return parseFloat(b.price) - parseFloat(a.price)
      if (sortBy === 'naam') return (a.name || '').localeCompare(b.name || '')
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--text-dark)}h1,h2,h3,h4{font-family:Fredoka,sans-serif}
    .hero{background:linear-gradient(135deg,var(--green-dark),var(--green-main));padding:56px clamp(16px,4vw,48px);position:relative;overflow:hidden}
    .hero-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr auto;align-items:center;gap:24px}
    .hero h1{font-size:clamp(26px,4vw,40px);color:white;margin-bottom:8px}
    .hero p{font-size:15px;color:rgba(255,255,255,.82);max-width:480px;line-height:1.6}
    .cart-btn{display:flex;align-items:center;gap:10px;padding:14px 24px;border-radius:50px;background:var(--orange-main);color:white;font-family:Fredoka,sans-serif;font-size:15px;font-weight:700;text-decoration:none;transition:all .2s;flex-shrink:0;white-space:nowrap}
    .cart-btn:hover{background:#D4812E;transform:translateY(-2px)}
    .cart-badge{background:white;color:var(--orange-main);border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
    .blob{position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.05)}
    .b1{width:300px;height:300px;top:-100px;right:-50px}
    .b2{width:200px;height:200px;bottom:-80px;left:15%}
    .main{max-width:1320px;margin:0 auto;padding:32px clamp(16px,4vw,48px) 80px}
    .toolbar{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center}
    .search-wrap{flex:1;min-width:200px;position:relative}
    .search-wrap input{width:100%;padding:11px 16px 11px 42px;border:2px solid var(--cream-dark);border-radius:50px;font-family:Nunito,sans-serif;font-size:14px;background:white;outline:none;transition:all .2s}
    .search-wrap input:focus{border-color:var(--green-main)}
    .si{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.4}
    .sort-sel{padding:11px 18px;border:2px solid var(--cream-dark);border-radius:50px;font-family:Nunito,sans-serif;font-size:14px;background:white;outline:none;cursor:pointer}
    .cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
    .cat-btn{padding:8px 18px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}
    .cat-btn.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}
    .cat-btn:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
    .count{font-size:14px;color:var(--text-light);font-weight:600;margin-bottom:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}
    .card{background:white;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent;display:flex;flex-direction:column;text-decoration:none;color:inherit}
    .card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,0,0,.1);border-color:var(--green-pale)}
    .card-img{width:100%;height:200px;object-fit:cover;background:var(--cream)}
    .card-img-ph{width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(135deg,var(--cream),var(--cream-dark))}
    .card-body{padding:16px;flex:1;display:flex;flex-direction:column;gap:8px}
    .card-verkoper{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--green-main);margin-bottom:2px}
    .card-naam{font-weight:700;font-size:15px;color:var(--text-dark);line-height:1.3}
    .card-desc{font-size:12px;color:var(--text-mid);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}
    .card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--cream-dark);margin-top:auto}
    .card-prijs{font-family:Fredoka,sans-serif;font-size:22px;font-weight:700;color:var(--green-main)}
    .btn-cart{padding:8px 16px;border-radius:50px;border:none;font-family:Fredoka,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
    .btn-add{background:var(--green-main);color:white}.btn-add:hover{background:var(--green-dark)}
    .btn-added{background:var(--green-pale);color:var(--green-dark)}
    .badge-verzend{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:50px;background:var(--orange-pale);color:var(--orange-main)}
    .empty{text-align:center;padding:80px 20px;color:var(--text-light)}
    .empty .ei{font-size:48px;margin-bottom:16px;opacity:.4}
    .empty h3{font-family:Fredoka,sans-serif;font-size:22px;color:var(--text-dark);margin-bottom:8px}
    .verkoper-strip{background:white;border-radius:16px;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,.05);flex-wrap:wrap}
    .vs-left{display:flex;align-items:center;gap:12px}
    .vs-icon{width:40px;height:40px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
    .vs-text{font-size:14px;color:var(--text-mid)}.vs-text strong{color:var(--text-dark);display:block}
    .btn-small{padding:8px 16px;border-radius:50px;background:var(--green-main);color:white;font-family:Fredoka,sans-serif;font-size:13px;font-weight:700;text-decoration:none;transition:all .2s}
    .btn-small:hover{background:var(--green-dark)}
    @media(max-width:768px){.hero-inner{grid-template-columns:1fr}.cart-btn{width:100%;justify-content:center}.grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.grid{grid-template-columns:1fr}}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />

      <div className="hero">
        <div className="blob b1"/><div className="blob b2"/>
        <div className="hero-inner">
          <div>
            <h1>🐾 Kwispelclub Shop</h1>
            <p>Alles voor jouw hond of kat — van geverifieerde verkopers in België en Nederland.</p>
          </div>
          <a href="/checkout" className="cart-btn">
            🛒 Winkelwagen
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </a>
        </div>
      </div>

      <div className="main">
        <div className="verkoper-strip">
          <div className="vs-left">
            <div className="vs-icon">🏪</div>
            <div className="vs-text">
              <strong>Wil jij ook verkopen op Kwispelclub?</strong>
              Start gratis — geen maandkosten, alleen een kleine commissie per verkoop.
            </div>
          </div>
          <a href="/word-verkoper" className="btn-small">Word Verkoper →</a>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="si">🔍</span>
            <input placeholder="Zoek producten..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="nieuwst">Nieuwst eerst</option>
            <option value="prijs-laag">Prijs: laag → hoog</option>
            <option value="prijs-hoog">Prijs: hoog → laag</option>
            <option value="naam">Naam A-Z</option>
          </select>
        </div>

        <div className="cats">
          {CATEGORIES.map(c => (
            <button key={c} className={`cat-btn ${cat===c?'active':''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="empty"><div className="ei">⏳</div><h3>Producten laden...</h3></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="ei">📦</div>
            <h3>{search || cat !== 'Alle' ? 'Geen producten gevonden' : 'Nog geen producten'}</h3>
            <p>{search || cat !== 'Alle' ? 'Pas je zoekterm of filter aan.' : 'Verkopers voegen binnenkort producten toe.'}</p>
          </div>
        ) : (
          <>
            <div className="count">{filtered.length} product{filtered.length !== 1 ? 'en' : ''} gevonden</div>
            <div className="grid">
              {filtered.map(p => (
                <div key={p.id} className="card">
                  <a href={`/winkel/${p.verkopers?.slug}`} style={{textDecoration:'none',color:'inherit'}}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="card-img" />
                      : <div className="card-img-ph">🐾</div>}
                  </a>
                  <div className="card-body">
                    {p.verkopers && (
                      <div className="card-verkoper">
                        🏪 {p.verkopers.shop_naam}
                      </div>
                    )}
                    <div className="card-naam">{p.name}</div>
                    {p.description && <div className="card-desc">{p.description}</div>}
                    <div className="card-footer">
                      <div>
                        <div className="card-prijs">€{parseFloat(p.price).toFixed(2)}</div>
                        {p.stock !== null && p.stock <= 5 && p.stock > 0 && (
                          <div style={{fontSize:11,color:'var(--orange-main)',fontWeight:700}}>⚠️ Nog {p.stock} op voorraad</div>
                        )}
                        {p.stock === 0 && (
                          <div style={{fontSize:11,color:'var(--red)',fontWeight:700}}>Uitverkocht</div>
                        )}
                      </div>
                      <button
                        className={`btn-cart ${addedIds.has(p.id) ? 'btn-added' : 'btn-add'}`}
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                      >
                        {addedIds.has(p.id) ? '✓ Toegevoegd' : '🛒 Kopen'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
