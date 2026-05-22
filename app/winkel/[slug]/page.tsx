'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function WinkelPage() {
  const { slug } = useParams<{ slug: string }>()
  const supabase = useMemo(() => createClient(), [])
  const [verkoper, setVerkoper] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEigenaar, setIsEigenaar] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [modalAantal, setModalAantal] = useState(1)
  const [modalAdded, setModalAdded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [heeftGekocht, setHeeftGekocht] = useState<Record<string, boolean>>({})
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadVerkoper()
  }, [slug])


  const parseFotos = (fotos: any): string[] => {
    if (!fotos) return []
    if (Array.isArray(fotos)) return fotos
    try { const r = JSON.parse(fotos); return Array.isArray(r) ? r : [] } catch { return [] }
  }
  const getFotoUrl = (p: any): string | null =>
    p.image_url || (Array.isArray(p.images) && p.images[0]) || parseFotos(p.fotos)[0] || null

  const loadVerkoper = async () => {
    const { data: v } = await supabase
      .from('verkopers')
      .select(`*, profiles(first_name, last_name, avatar_url, location, created_at)`)
      .eq('slug', slug)
      .eq('status', 'actief')
      .single()

    if (!v) { setNotFound(true); setLoading(false); return }
    setVerkoper(v)

    const { data: p } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', v.profile_id)
      .eq('status', 'actief')
      .order('created_at', { ascending: false })

    setProducts(p || [])
    setLoading(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && v.profile_id === user.id) setIsEigenaar(true)

    await supabase.from('verkopers').update({ views: (v.views || 0) + 1 }).eq('id', v.id)

    // Laad reviews voor deze verkoper
    loadReviews(v.profile_id)

    // Check of user ingelogd is + heeft gekocht
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      // Check welke producten deze user gekocht heeft
      const { data: orders } = await supabase
        .from('orders')
        .select('order_items(product_id)')
        .eq('user_id', u.id)
        .in('status', ['paid', 'shipped', 'delivered', 'uitbetaald'])
      const gekochteIds: Record<string, boolean> = {}
      orders?.forEach((o: any) => {
        o.order_items?.forEach((i: any) => { if (i.product_id) gekochteIds[i.product_id] = true })
      })
      setHeeftGekocht(gekochteIds)
    }
  }


  const loadReviews = async (sellerId: string) => {
    setReviewsLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setReviewsLoading(false)
  }

  const submitReview = async (productId: string) => {
    if (!user || reviewSaving) return
    setReviewSaving(true)
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      product_id: productId,
      seller_id: verkoper?.profile_id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    })
    if (!error) {
      setReviewSuccess(productId)
      setShowReviewForm(null)
      setReviewComment('')
      setReviewRating(5)
      if (verkoper?.profile_id) loadReviews(verkoper.profile_id)
      setTimeout(() => setReviewSuccess(null), 3000)
    }
    setReviewSaving(false)
  }

  // ✅ Voeg product toe aan winkelwagen (localStorage)
  const addToCart = (p: any) => {
    try {
      const saved = localStorage.getItem('kc_cart')
      const cart = saved ? JSON.parse(saved) : []
      const existing = cart.findIndex((i: any) => i.id === p.id)
      if (existing >= 0) {
        cart[existing].aantal += 1
      } else {
        cart.push({
          id: p.id,
          naam: p.name,
          prijs: parseFloat(p.price),
          aantal: 1,
          emoji: '🐾',
          img: getFotoUrl(p),
        })
      }
      localStorage.setItem('kc_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))

      // Toon "Toegevoegd!" feedback
      setAddedIds(prev => new Set(prev).add(p.id))
      setTimeout(() => {
        setAddedIds(prev => { const n = new Set(prev); n.delete(p.id); return n })
      }, 2000)
    } catch (e) {
      console.error('Cart fout:', e)
    }
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark)}h1,h2,h3{font-family:'Fredoka',sans-serif}
    .back{display:inline-flex;align-items:center;gap:6px;color:var(--text-mid);font-size:13px;font-weight:700;text-decoration:none;padding:20px clamp(16px,4vw,48px);transition:color .2s}
    .back:hover{color:var(--green-main)}
    .banner{height:220px;background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));position:relative;overflow:hidden}
    .banner-img{width:100%;height:100%;object-fit:cover}
    .banner-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.4))}
    .shop-header{max-width:1100px;margin:0 auto;padding:0 clamp(16px,4vw,48px)}
    .shop-info{display:flex;align-items:flex-end;gap:20px;margin-top:-40px;margin-bottom:28px;position:relative;z-index:2}
    .shop-logo{width:88px;height:88px;border-radius:20px;border:4px solid white;overflow:hidden;background:white;box-shadow:0 4px 16px rgba(0,0,0,.12);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:36px}
    .shop-logo img{width:100%;height:100%;object-fit:cover}
    .shop-meta{flex:1;padding-bottom:4px}
    .shop-naam{font-family:'Fredoka',sans-serif;font-size:28px;font-weight:700;color:white;margin-bottom:4px;text-shadow:0 2px 8px rgba(0,0,0,.4)}
    .shop-badges{display:flex;gap:8px;flex-wrap:wrap}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:50px;font-size:11px;font-weight:700}
    .badge-green{background:var(--green-pale);color:var(--green-dark)}
    .badge-orange{background:var(--orange-pale);color:var(--orange-main)}
    .shop-body{max-width:1100px;margin:0 auto;padding:0 clamp(16px,4vw,48px) 80px;display:grid;grid-template-columns:280px 1fr;gap:28px}
    .sidebar{display:flex;flex-direction:column;gap:16px}
    .info-card{background:var(--white);border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
    .info-card h3{font-size:15px;color:var(--green-dark);margin-bottom:12px}
    .info-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-mid);margin-bottom:8px}
    .info-row:last-child{margin-bottom:0}
    .info-row a{color:var(--green-main);font-weight:700;text-decoration:none}
    .desc-text{font-size:14px;color:var(--text-mid);line-height:1.65}
    .cats-list{display:flex;flex-wrap:wrap;gap:6px}
    .cat-tag{padding:4px 10px;border-radius:50px;background:var(--green-pale);color:var(--green-dark);font-size:12px;font-weight:700}
    .products-section h2{font-size:22px;color:var(--text-dark);margin-bottom:20px}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
    .product-card{background:var(--white);border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);transition:all .3s;border:1.5px solid transparent;display:flex;flex-direction:column}
    .product-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,0,0,.1);border-color:var(--green-pale)}
    .product-img{width:100%;height:180px;object-fit:cover;background:var(--cream)}
    .product-img-placeholder{width:100%;height:180px;display:flex;align-items:center;justify-content:center;font-size:40px;background:var(--cream)}
    .product-body{padding:14px;flex:1;display:flex;flex-direction:column;gap:8px}
    .product-naam{font-weight:700;font-size:14px;color:var(--text-dark);flex:1}
    .product-desc{font-size:12px;color:var(--text-mid);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .product-prijs{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:var(--green-main)}
    .btn-cart{width:100%;padding:10px;border-radius:50px;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:4px}
    .btn-cart-add{background:var(--green-main);color:white}
    .btn-cart-add:hover{background:var(--green-dark)}
    .btn-cart-added{background:var(--green-pale);color:var(--green-dark)}
    .empty-products{text-align:center;padding:60px 20px;color:var(--text-light);background:var(--white);border-radius:16px}
    .empty-products .ei{font-size:40px;margin-bottom:12px;opacity:.4}
    .not-found{text-align:center;padding:80px 20px;max-width:400px;margin:0 auto}
    .not-found .ni{font-size:56px;margin-bottom:16px}

    .reviews-section{margin-top:40px;padding-top:32px;border-top:2px solid var(--cream-dark)}
    .review-card{background:var(--white);border-radius:14px;padding:16px 20px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.05)}
    .review-stars{color:#F5A623;font-size:18px;letter-spacing:2px;margin-bottom:6px}
    .review-text{font-size:14px;color:var(--text-mid);line-height:1.6;margin-bottom:8px}
    .review-meta{font-size:12px;color:var(--text-light);font-weight:600}
    .star-btn{background:none;border:none;font-size:28px;cursor:pointer;padding:2px;transition:transform .1s;line-height:1}
    .star-btn:hover{transform:scale(1.2)}
    .review-form{background:var(--cream);border-radius:14px;padding:20px;margin-top:12px;border:2px solid var(--green-pale)}
    @media(max-width:768px){.shop-body{grid-template-columns:1fr}}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
    .modal{background:white;border-radius:24px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.2);animation:slideUp .3s ease}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .modal-img{width:100%;height:280px;object-fit:cover;border-radius:24px 24px 0 0}
    .modal-img-ph{width:100%;height:280px;display:flex;align-items:center;justify-content:center;font-size:72px;background:var(--cream);border-radius:24px 24px 0 0}
    .modal-body{padding:28px}
    .modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.4);color:white;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .modal-close:hover{background:rgba(0,0,0,.6)}
    .modal-prijs{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:var(--green-main);margin-bottom:16px}
    .modal-desc{font-size:14px;color:var(--text-mid);line-height:1.7;margin-bottom:20px}
    .aantal-ctrl{display:flex;align-items:center;gap:12px;margin-bottom:20px}
    .aantal-btn{width:36px;height:36px;border-radius:50%;border:2px solid var(--cream-dark);background:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-weight:700}
    .aantal-btn:hover{border-color:var(--green-main);color:var(--green-main)}
    .aantal-val{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;min-width:32px;text-align:center}
    .modal-actions{display:flex;flex-direction:column;gap:10px}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🐾 Laden...</div>
    </>
  )

  if (notFound) return (
    <>
      <style>{CSS}</style>
      <div className="not-found">
        <div className="ni">🔍</div>
        <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: 'var(--text-dark)', marginBottom: 8 }}>Shop niet gevonden</h2>
        <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>Deze shop bestaat niet of is niet actief.</p>
        <a href="/" style={{ color: 'var(--green-main)', fontWeight: 700 }}>← Terug naar home</a>
      </div>
    </>
  )

  const profile = verkoper.profiles
  const lidSinds = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' }) : '—'

  return (
    <>
      <style>{CSS}</style>
      <a href="/" className="back">← Terug naar Kwispelclub</a>

      <div className="banner">
        {verkoper.banner_url
          ? <img src={verkoper.banner_url} alt="" className="banner-img" />
          : null}
        <div className="banner-overlay" />
      </div>

      <div className="shop-header">
        <div className="shop-info">
          <div className="shop-logo">
            {verkoper.logo_url ? <img src={verkoper.logo_url} alt={verkoper.shop_naam} /> : '🏪'}
          </div>
          <div className="shop-meta">
            <div className="shop-naam">{verkoper.shop_naam}</div>
            <div className="shop-badges">
              <span className="badge badge-green">✓ Geverifieerde verkoper</span>
              {verkoper.categorieen?.slice(0, 2).map((c: string) => (
                <span key={c} className="badge badge-orange">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEigenaar && (
        <a href="/verkoper/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 50,
          background: 'var(--green-main)', color: 'white',
          fontFamily: 'Fredoka, sans-serif', fontSize: 14, fontWeight: 600,
          textDecoration: 'none', margin: '0 clamp(16px,4vw,48px) 16px'
        }}>
          ⚙️ Beheer mijn shop →
        </a>
      )}

      <div className="shop-body">
        <aside className="sidebar">
          <div className="info-card">
            <h3>Over de shop</h3>
            <p className="desc-text">{verkoper.beschrijving}</p>
          </div>
          <div className="info-card">
            <h3>Info</h3>
            {profile?.location && <div className="info-row">📍 {profile.location}</div>}
            <div className="info-row">📅 Lid sinds {lidSinds}</div>
            {verkoper.website && <div className="info-row">🌐 <a href={verkoper.website} target="_blank" rel="noopener">Website</a></div>}
            {verkoper.instagram && <div className="info-row">📷 <a href={`https://instagram.com/${verkoper.instagram.replace('@', '')}`} target="_blank" rel="noopener">{verkoper.instagram}</a></div>}
          </div>
          {verkoper.categorieen?.length > 0 && (
            <div className="info-card">
              <h3>Categorieën</h3>
              <div className="cats-list">
                {verkoper.categorieen.map((c: string) => <span key={c} className="cat-tag">{c}</span>)}
              </div>
            </div>
          )}
          {/* ✅ Winkelwagen knop in sidebar */}
          <a href="/checkout" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 20px', borderRadius: 50,
            background: 'var(--orange-main)', color: 'white',
            fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600,
            textDecoration: 'none', textAlign: 'center'
          }}>
            🛒 Naar winkelwagen
          </a>
        </aside>

        <div className="products-section">
          <h2>Producten ({products.length})</h2>
          {products.length === 0 ? (
            <div className="empty-products">
              <div className="ei">📦</div>
              <p>Nog geen producten in deze shop.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card" style={{cursor:'pointer'}} onClick={() => { setSelectedProduct(p); setModalAantal(1); setModalAdded(false) }}>
                  {getFotoUrl(p)
                    ? <img src={getFotoUrl(p)!} alt={p.name} className="product-img" />
                    : <div className="product-img-placeholder">🐾</div>}
                  <div className="product-body">
                    <div className="product-naam">{p.name}</div>
                    {p.description && <div className="product-desc">{p.description}</div>}
                    <div className="product-prijs">€{parseFloat(p.price).toFixed(2)}</div>
                    <button
                      className={`btn-cart ${addedIds.has(p.id) ? 'btn-cart-added' : 'btn-cart-add'}`}
                      onClick={e => { e.stopPropagation(); addToCart(p) }}
                    >
                      {addedIds.has(p.id) ? '✓ Toegevoegd!' : '🛒 In winkelwagen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{position:'relative'}}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
            {getFotoUrl(selectedProduct)
              ? <img src={getFotoUrl(selectedProduct)!} alt={selectedProduct.name} className="modal-img" />
              : <div className="modal-img-ph">🐾</div>}
            <div className="modal-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <h2 style={{fontFamily:'Fredoka,sans-serif',fontSize:24,color:'var(--text-dark)',flex:1,paddingRight:16}}>{selectedProduct.name}</h2>
                {(selectedProduct.voorraad ?? selectedProduct.stock) !== null && (selectedProduct.voorraad ?? selectedProduct.stock) <= 5 && (selectedProduct.voorraad ?? selectedProduct.stock) > 0 && (
                  <span style={{fontSize:11,fontWeight:700,color:'var(--orange-main)',background:'var(--orange-pale)',padding:'4px 10px',borderRadius:50,flexShrink:0}}>⚠️ Nog {selectedProduct.voorraad ?? selectedProduct.stock} op voorraad</span>
                )}
              </div>
              <div className="modal-prijs">€{parseFloat(selectedProduct.price).toFixed(2)}</div>
              {selectedProduct.description && (
                <div className="modal-desc">{selectedProduct.description}</div>
              )}

              {/* Aantal */}
              <div style={{fontSize:13,fontWeight:700,color:'var(--text-mid)',marginBottom:8}}>Aantal:</div>
              <div className="aantal-ctrl">
                <button className="aantal-btn" onClick={() => setModalAantal(a => Math.max(1, a - 1))}>−</button>
                <span className="aantal-val">{modalAantal}</span>
                <button className="aantal-btn" onClick={() => setModalAantal(a => a + 1)}>+</button>
                <span style={{fontSize:13,color:'var(--text-light)',fontWeight:600}}>= €{(parseFloat(selectedProduct.price) * modalAantal).toFixed(2)}</span>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    for (let i = 0; i < modalAantal; i++) addToCart(selectedProduct)
                    setModalAdded(true)
                    setTimeout(() => setSelectedProduct(null), 1200)
                  }}
                  style={{width:'100%',padding:'14px',borderRadius:50,background: modalAdded ? 'var(--green-pale)' : 'var(--green-main)',color: modalAdded ? 'var(--green-dark)' : 'white',border:'none',fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,cursor:'pointer',transition:'all .2s'}}
                >
                  {modalAdded ? '✓ Toegevoegd aan winkelwagen!' : `🛒 In winkelwagen — €${(parseFloat(selectedProduct.price) * modalAantal).toFixed(2)}`}
                </button>
                <a href="/checkout" style={{width:'100%',padding:'14px',borderRadius:50,background:'var(--orange-main)',color:'white',border:'none',fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,cursor:'pointer',transition:'all .2s',textDecoration:'none',textAlign:'center',display:'block'}}>
                  💳 Direct afrekenen →
                </a>
              </div>

              {/* Verkoper info */}
              <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--cream-dark)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {verkoper?.logo_url ? <img src={verkoper.logo_url} style={{width:'100%',height:'100%',borderRadius:10,objectFit:'cover'}} /> : '🏪'}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--text-dark)'}}>{verkoper?.shop_naam}</div>
                  <div style={{fontSize:11,color:'var(--text-light)'}}>✓ Geverifieerde verkoper</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS SECTIE */}
      {!loading && !notFound && (
        <div style={{maxWidth:1320,margin:'0 auto',padding:'0 clamp(16px,4vw,48px) 60px'}}>
          <div className="reviews-section">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{fontFamily:'Fredoka,sans-serif',fontSize:26,color:'var(--text-dark)',marginBottom:4}}>
                  Reviews ⭐ {reviews.length > 0 && `(${reviews.length})`}
                </h2>
                {reviews.length > 0 && (
                  <div style={{fontSize:14,color:'var(--text-mid)'}}>
                    Gemiddeld: <strong style={{color:'var(--orange-main)',fontSize:18}}>
                      {(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    </strong> / 5
                  </div>
                )}
              </div>
            </div>

            {reviewsLoading ? (
              <div style={{color:'var(--text-light)',fontSize:14}}>⏳ Reviews laden...</div>
            ) : reviews.length === 0 ? (
              <div style={{background:'var(--cream)',borderRadius:14,padding:'24px',textAlign:'center',color:'var(--text-light)'}}>
                <div style={{fontSize:32,marginBottom:8}}>⭐</div>
                <div style={{fontWeight:700}}>Nog geen reviews</div>
                <div style={{fontSize:13,marginTop:4}}>Wees de eerste om een review achter te laten!</div>
              </div>
            ) : (
              <div>
                {reviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    {r.comment && <div className="review-text">{r.comment}</div>}
                    <div className="review-meta">
                      {r.profiles?.first_name || 'Klant'} · {new Date(r.created_at).toLocaleDateString('nl-BE')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Review schrijven — alleen voor kopers */}
            {user && products.some(p => heeftGekocht[p.id]) && (
              <div style={{marginTop:28}}>
                <h3 style={{fontFamily:'Fredoka,sans-serif',fontSize:18,color:'var(--green-dark)',marginBottom:16}}>
                  Jouw review schrijven ✏️
                </h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
                  {products.filter(p => heeftGekocht[p.id]).map(p => (
                    <div key={p.id} style={{background:'white',borderRadius:14,padding:16,border:'2px solid var(--cream-dark)'}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>{p.name}</div>
                      {reviewSuccess === p.id ? (
                        <div style={{color:'var(--green-main)',fontWeight:700,fontSize:13}}>✓ Review geplaatst!</div>
                      ) : showReviewForm === p.id ? (
                        <div className="review-form">
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:12,fontWeight:700,color:'var(--text-mid)',marginBottom:6}}>Beoordeling:</div>
                            <div style={{display:'flex',gap:2}}>
                              {[1,2,3,4,5].map(s => (
                                <button key={s} className="star-btn" onClick={() => setReviewRating(s)}>
                                  {s <= reviewRating ? '★' : '☆'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:12,fontWeight:700,color:'var(--text-mid)',marginBottom:6}}>Commentaar (optioneel):</div>
                            <textarea
                              value={reviewComment}
                              onChange={e => setReviewComment(e.target.value)}
                              placeholder="Vertel over je ervaring..."
                              rows={3}
                              style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'2px solid var(--cream-dark)',fontFamily:'Nunito,sans-serif',fontSize:13,outline:'none',resize:'vertical'}}
                            />
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={() => submitReview(p.id)} disabled={reviewSaving}
                              style={{flex:1,padding:'10px',borderRadius:50,background:'var(--green-main)',color:'white',border:'none',fontFamily:'Fredoka,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                              {reviewSaving ? '...' : '✓ Plaatsen'}
                            </button>
                            <button onClick={() => setShowReviewForm(null)}
                              style={{padding:'10px 14px',borderRadius:50,background:'var(--cream-dark)',color:'var(--text-mid)',border:'none',fontFamily:'Fredoka,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setShowReviewForm(p.id); setReviewRating(5); setReviewComment('') }}
                          style={{padding:'8px 16px',borderRadius:50,background:'var(--green-pale)',color:'var(--green-dark)',border:'2px solid var(--green-main)',fontFamily:'Fredoka,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                          ⭐ Review schrijven
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <div style={{marginTop:20,padding:16,background:'var(--cream)',borderRadius:12,fontSize:13,color:'var(--text-mid)',textAlign:'center'}}>
                <a href="/auth" style={{color:'var(--green-main)',fontWeight:700}}>Inloggen</a> om een review te schrijven.
              </div>
            )}
          </div>
        </div>
      )}

    </>
  )
}
