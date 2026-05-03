'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function WinkelPage() {
  const { slug } = useParams<{ slug: string }>()
  const supabase = createClient()
  const [verkoper, setVerkoper] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEigenaar, setIsEigenaar] = useState(false)

  useEffect(() => {
    loadVerkoper()
  }, [slug])

  const loadVerkoper = async () => {
    const { data: v } = await supabase
      .from('verkopers')
      .select(`*, profiles(first_name, last_name, avatar_url, location, created_at)`)
      .eq('slug', slug)
      .eq('status', 'actief')
      .single()

    if (!v) { setNotFound(true); setLoading(false); return }
    setVerkoper(v)

    // Laad products van deze verkoper
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

    // Views teller
    await supabase.from('verkopers').update({ views: (v.views || 0) + 1 }).eq('id', v.id)
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
    .shop-naam{font-family:'Fredoka',sans-serif;font-size:28px;font-weight:700;color:white;margin-bottom:4px;text-shadow:0 2px 8px rgba(0,0,0,.4)} .shop-badges{display:flex;gap:8px;flex-wrap:wrap}
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
    .product-card{background:var(--white);border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);transition:all .3s;border:1.5px solid transparent}
    .product-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,0,0,.1);border-color:var(--green-pale)}
    .product-img{width:100%;height:180px;object-fit:cover;background:var(--cream)}
    .product-img-placeholder{width:100%;height:180px;display:flex;align-items:center;justify-content:center;font-size:40px;background:var(--cream)}
    .product-body{padding:14px}
    .product-naam{font-weight:700;font-size:14px;margin-bottom:4px;color:var(--text-dark)}
    .product-prijs{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:var(--green-main)}
    .empty-products{text-align:center;padding:60px 20px;color:var(--text-light);background:var(--white);border-radius:16px}
    .empty-products .ei{font-size:40px;margin-bottom:12px;opacity:.4}
    .not-found{text-align:center;padding:80px 20px;max-width:400px;margin:0 auto}
    .not-found .ni{font-size:56px;margin-bottom:16px}
    @media(max-width:768px){.shop-body{grid-template-columns:1fr}}
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
            {verkoper.instagram && <div className="info-row">📷 <a href={`https://instagram.com/${verkoper.instagram.replace('@','')}`} target="_blank" rel="noopener">{verkoper.instagram}</a></div>}
          </div>

          {verkoper.categorieen?.length > 0 && (
            <div className="info-card">
              <h3>Categorieën</h3>
              <div className="cats-list">
                {verkoper.categorieen.map((c: string) => <span key={c} className="cat-tag">{c}</span>)}
              </div>
            </div>
          )}
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
                <div key={p.id} className="product-card">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="product-img" />
                    : <div className="product-img-placeholder">🐾</div>}
                  <div className="product-body">
                    <div className="product-naam">{p.name}</div>
                    <div className="product-prijs">€{parseFloat(p.price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
