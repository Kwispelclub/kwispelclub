'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Tab = 'overzicht' | 'producten' | 'bestellingen' | 'instellingen'

export default function VerkoperDashboard() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [verkoper, setVerkoper] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overzicht')
  const [mollieMode, setMollieMode] = useState('test')

  // Producten
  const [producten, setProducten] = useState<any[]>([])
  const [productenLoading, setProductenLoading] = useState(false)

  // Bestellingen
  const [bestellingen, setBestellingen] = useState<any[]>([])

  // Instellingen form
  const [shopNaam, setShopNaam] = useState('')
  const [beschrijving, setBeschrijving] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [saveMsg, setSaveMsg] = useState('Opslaan')
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  // Nieuw product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [pNaam, setPNaam] = useState('')
  const [pBeschrijving, setPBeschrijving] = useState('')
  const [pPrijs, setPPrijs] = useState('')
  const [pCategorie, setPCategorie] = useState('Voeding & Snacks')
  const [pFotos, setPFotos] = useState<string[]>([])
  const [pVoorraad, setPVoorraad] = useState('')
  const [pDier, setPDier] = useState('beide')
  const [pSaving, setPSaving] = useState(false)
  const [pErr, setPErr] = useState('')
  const fotoRef = useRef<HTMLInputElement>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push('/auth?redirect=/verkoper/dashboard'); return }
      setUser(session.user)

      // Laad verkoper profiel
      const { data: v } = await supabase
        .from('verkopers')
        .select('*')
        .eq('profile_id', session.user.id)
        .single()

      if (!v) { router.push('/word-verkoper'); return }
      if (v.status === 'in_afwachting') { setVerkoper(v); setLoading(false); return }
      if (v.status === 'geweigerd') { router.push('/word-verkoper'); return }

      setVerkoper(v)
      setShopNaam(v.shop_naam || '')
      setBeschrijving(v.beschrijving || '')
      setWebsite(v.website || '')
      setInstagram(v.instagram || '')
      setLogoUrl(v.logo_url || '')
      setBannerUrl(v.banner_url || '')

      // Laad Mollie mode
      fetch('/api/admin-settings').then(r => r.json()).then(d => {
        setMollieMode(d.settings?.mollie_mode || process.env.NEXT_PUBLIC_MOLLIE_MODE || 'test')
      })

      await loadProducten(v.id)
      setLoading(false)
    })
  }, [])

  const loadProducten = async (verkoperId: string) => {
    setProductenLoading(true)
    const { data } = await supabase.from('producten').select('*').eq('verkoper_id', verkoperId).order('created_at', { ascending: false })
    setProducten(data || [])
    setProductenLoading(false)
  }

  const handleSaveInstellingen = async () => {
    setSaveMsg('Bezig...')
    await supabase.from('verkopers').update({
      shop_naam: shopNaam,
      beschrijving,
      website: website || null,
      instagram: instagram || null,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      updated_at: new Date().toISOString(),
    }).eq('id', verkoper.id)
    setSaveMsg('✓ Opgeslagen!')
    setTimeout(() => setSaveMsg('Opslaan'), 2500)
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    if (type === 'logo') setUploadingLogo(true)
    else setUploadingBanner(true)
    const ext = file.name.split('.').pop()
    const path = `verkoper/${verkoper.id}-${type}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('listings').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
      if (type === 'logo') setLogoUrl(url.publicUrl)
      else setBannerUrl(url.publicUrl)
    }
    if (type === 'logo') setUploadingLogo(false)
    else setUploadingBanner(false)
  }

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !verkoper) return
    setUploadingFoto(true)
    const urls: string[] = []
    for (const file of Array.from(files).slice(0, 4)) {
      const ext = file.name.split('.').pop()
      const path = `producten/${verkoper.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('listings').upload(path, file)
      if (!error && data) {
        const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
        urls.push(url.publicUrl)
      }
    }
    setPFotos(prev => [...prev, ...urls].slice(0, 4))
    setUploadingFoto(false)
  }

  const handleSaveProduct = async () => {
    if (!pNaam || !pPrijs) { setPErr('Naam en prijs zijn verplicht'); return }
    setPSaving(true); setPErr('')
    const { error } = await supabase.from('producten').insert({
      verkoper_id: verkoper.id,
      naam: pNaam,
      beschrijving: pBeschrijving || null,
      prijs: parseFloat(pPrijs),
      categorie: pCategorie,
      img_url: pFotos[0] || null,
      voorraad: pVoorraad ? parseInt(pVoorraad) : null,
      actief: true,
      dier: pDier || null,
    })
    if (error) { setPErr(error.message); setPSaving(false); return }
    setPNaam(''); setPBeschrijving(''); setPPrijs(''); setPFotos([]); setPVoorraad('')
    setShowProductForm(false)
    await loadProducten(verkoper.id)
    setPSaving(false)
  }

  const toggleProductActief = async (id: string, actief: boolean) => {
    await supabase.from('producten').update({ actief: !actief }).eq('id', id)
    await loadProducten(verkoper.id)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Product verwijderen?')) return
    await supabase.from('producten').delete().eq('id', id)
    await loadProducten(verkoper.id)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:#F0F4F8;color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
    .sidebar{background:var(--green-dark);color:white;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
    .sb-logo{padding:22px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}
    .sb-logo .lp{width:36px;height:36px;border-radius:9px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.15);flex-shrink:0}
    .sb-logo img{width:100%;height:100%;object-fit:cover}
    .sb-logo .brand{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;line-height:1.2}
    .sb-logo .sub{font-size:10px;opacity:.5;font-weight:600}
    .sb-nav{flex:1;padding:14px 10px;overflow-y:auto}
    .sb-item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;color:rgba(255,255,255,.6);transition:all .2s;margin-bottom:2px;text-decoration:none}
    .sb-item:hover{background:rgba(255,255,255,.08);color:white}
    .sb-item.active{background:rgba(255,255,255,.12);color:white}
    .sb-item .si{font-size:16px;width:20px;text-align:center}
    .sb-footer{padding:14px 10px;border-top:1px solid rgba(255,255,255,.08)}
    .sb-footer a{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;color:rgba(255,255,255,.4);font-size:13px;font-weight:600;text-decoration:none;transition:all .2s}
    .sb-footer a:hover{color:white;background:rgba(255,255,255,.08)}
    .main{flex:1;overflow-y:auto}
    .top-bar{background:white;padding:18px 28px;border-bottom:1px solid #E5EAF0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
    .top-bar h1{font-size:20px;color:var(--text-dark)}
    .top-bar p{font-size:12px;color:var(--text-light);margin-top:2px}
    .content{padding:24px 28px}
    .mollie-warn{background:linear-gradient(135deg,#FFF8E1,#FFF3CD);border:2px solid #F9A825;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:24px;font-size:13px;font-weight:700;color:#5D4037}
    .mollie-warn .mw-icon{font-size:22px;flex-shrink:0}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
    .stat-card{background:white;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
    .stat-card .si{font-size:22px;margin-bottom:8px}
    .stat-card .val{font-family:'Fredoka',sans-serif;font-size:26px;font-weight:700;color:var(--text-dark)}
    .stat-card .lbl{font-size:12px;color:var(--text-light);font-weight:600;margin-top:2px}
    .stat-card.green{background:linear-gradient(135deg,var(--green-dark),var(--green-main))}.stat-card.green .val,.stat-card.green .lbl{color:white}
    .card{background:white;border-radius:14px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.05);margin-bottom:20px}
    .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
    .card-header h2{font-size:17px;color:var(--text-dark)}
    .shop-preview{display:flex;align-items:center;gap:16px;padding:16px;background:var(--cream);border-radius:12px;margin-bottom:16px}
    .shop-logo-prev{width:56px;height:56px;border-radius:14px;overflow:hidden;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
    .shop-logo-prev img{width:100%;height:100%;object-fit:cover}
    .badge{display:inline-flex;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700}
    .badge-green{background:var(--green-pale);color:var(--green-dark)}
    .badge-orange{background:var(--orange-pale);color:var(--orange-main)}
    .badge-gray{background:#F0F4F8;color:var(--text-light)}
    .badge-red{background:#FFF0F0;color:var(--red)}
    .table{width:100%;border-collapse:collapse}
    .table th{text-align:left;font-size:11px;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:.8px;padding:10px 12px;border-bottom:2px solid #F0F4F8}
    .table td{padding:12px 12px;border-bottom:1px solid #F0F4F8;font-size:14px}
    .table tr:last-child td{border-bottom:none}
    .table tr:hover td{background:#FAFBFC}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .2s;text-decoration:none}
    .btn-green{background:var(--green-main);color:white}.btn-green:hover{background:var(--green-dark)}
    .btn-sm{padding:5px 12px;font-size:12px;border-radius:6px}
    .btn-ghost{background:#F0F4F8;color:var(--text-mid)}.btn-ghost:hover{background:#E5EAF0}
    .btn-danger{background:#FFF0F0;color:var(--red)}.btn-danger:hover{background:var(--red);color:white}
    .fg{margin-bottom:14px}
    .fg label{display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px}
    .fg input,.fg textarea,.fg select{width:100%;padding:10px 12px;border:2px solid var(--cream-dark);border-radius:10px;font-family:'Nunito',sans-serif;font-size:13px;color:var(--text-dark);outline:none;transition:border-color .2s;background:var(--cream)}
    .fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--green-main);background:white}
    .fg textarea{min-height:90px;resize:vertical}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .upload-btn{border:2px dashed var(--cream-dark);border-radius:10px;padding:16px;text-align:center;cursor:pointer;font-size:13px;color:var(--text-mid);font-weight:600;transition:all .2s}
    .upload-btn:hover{border-color:var(--green-main);background:var(--green-pale);color:var(--green-dark)}
    .img-prev{width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px}
    .product-img{width:52px;height:52px;border-radius:8px;object-fit:cover;background:var(--cream)}
    .empty{text-align:center;padding:40px;color:var(--text-light)}
    .empty .ei{font-size:36px;margin-bottom:10px;opacity:.4}
    .foto-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .foto-thumb{width:60px;height:60px;border-radius:8px;object-fit:cover}
    .pending-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px}
    .pending-screen .pi{font-size:64px;margin-bottom:20px}
    @media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{display:none}.stats-row{grid-template-columns:repeat(2,1fr)}.form-row{grid-template-columns:1fr}}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8', fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🐾 Laden...</div>
    </>
  )

  // Wachtend op goedkeuring
  if (verkoper?.status === 'in_afwachting') return (
    <>
      <style>{CSS}</style>
      <div className="pending-screen">
        <div className="pi">⏳</div>
        <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 26, color: 'var(--green-dark)', marginBottom: 10 }}>Je aanvraag wordt beoordeeld</h2>
        <p style={{ color: 'var(--text-mid)', fontSize: 15, maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
          We bekijken je aanvraag voor <strong>{verkoper.shop_naam}</strong> zo snel mogelijk. Je krijgt een e-mail zodra je shop goedgekeurd is.
        </p>
        <a href="/" style={{ padding: '12px 28px', borderRadius: 50, background: 'var(--green-main)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Terug naar home</a>
      </div>
    </>
  )

  const actieveProducten = producten.filter(p => p.actief).length
  const shopUrl = `kwispelclub.be/winkel/${verkoper?.slug}`

  return (
    <>
      <style>{CSS}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-inner" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <div className="lp">
                {logoUrl ? <img src={logoUrl} alt={shopNaam} /> : '🏪'}
              </div>
              <div>
                <div className="brand">{shopNaam || 'Mijn Shop'}</div>
                <div className="sub">Verkoper Dashboard</div>
              </div>
            </div>
          </div>
          <nav className="sb-nav">
            {([
              ['overzicht', '📊', 'Overzicht'],
              ['producten', '📦', 'Producten'],
              ['bestellingen', '🛍️', 'Bestellingen'],
              ['instellingen', '⚙️', 'Instellingen'],
            ] as [Tab, string, string][]).map(([id, icon, label]) => (
              <div key={id} className={`sb-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <span className="si">{icon}</span>{label}
              </div>
            ))}
          </nav>
          <div className="sb-footer">
            <a href={`/winkel/${verkoper?.slug}`} target="_blank">🔗 Bekijk mijn shop</a>
            <a href="/">🏠 Terug naar site</a>
            <a href="#" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }} style={{ color: 'rgba(232,78,78,.7)' }}>🚪 Uitloggen</a>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="top-bar">
            <div>
              <h1>
                {tab === 'overzicht' && 'Dashboard'}
                {tab === 'producten' && 'Producten'}
                {tab === 'bestellingen' && 'Bestellingen'}
                {tab === 'instellingen' && 'Shop Instellingen'}
              </h1>
              <p>{shopUrl}</p>
            </div>
            {tab === 'producten' && (
              <button className="btn btn-green" onClick={() => setShowProductForm(true)}>+ Nieuw Product</button>
            )}
            {tab === 'instellingen' && (
              <button className="btn btn-green" onClick={handleSaveInstellingen}>{saveMsg}</button>
            )}
          </div>

          <div className="content">

            {/* MOLLIE TEST WARNING */}
            {mollieMode === 'test' && (
              <div className="mollie-warn">
                <span className="mw-icon">⚠️</span>
                <div>
                  <strong>Testmodus actief</strong> — Betalingen via Mollie zijn momenteel in testmodus. Echte betalingen worden nog niet verwerkt. Klanten die nu bestellen ontvangen een testbevestiging. Schakel over naar live mode via de admin instellingen voor echte transacties.
                </div>
              </div>
            )}

            {/* OVERZICHT */}
            {tab === 'overzicht' && (
              <>
                <div className="stats-row">
                  {[
                    { icon: '📦', val: producten.length, lbl: 'Producten', cls: '' },
                    { icon: '✅', val: actieveProducten, lbl: 'Actief', cls: 'green' },
                    { icon: '🛍️', val: bestellingen.length, lbl: 'Bestellingen', cls: '' },
                    { icon: '👁️', val: verkoper?.views || 0, lbl: 'Shop views', cls: '' },
                  ].map(s => (
                    <div key={s.lbl} className={`stat-card ${s.cls}`}>
                      <div className="si">{s.icon}</div>
                      <div className="val">{s.val}</div>
                      <div className="lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div className="card-header"><h2>Mijn Shop</h2><a href={`/winkel/${verkoper?.slug}`} target="_blank" className="btn btn-ghost btn-sm">🔗 Bekijken</a></div>
                  <div className="shop-preview">
                    <div className="shop-logo-prev">
                      {logoUrl ? <img src={logoUrl} alt={shopNaam} /> : '🏪'}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 17, fontWeight: 700 }}>{shopNaam}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 6 }}>kwispelclub.be/winkel/{verkoper?.slug}</div>
                      <span className="badge badge-green">✓ Actief</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-mid)' }}>{verkoper?.commissie_pct || 15}% commissie</span>
                    </div>
                  </div>
                  {beschrijving && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{beschrijving}</p>}
                </div>

                <div className="card">
                  <div className="card-header"><h2>Recente Producten</h2><button className="btn btn-ghost btn-sm" onClick={() => setTab('producten')}>Alle producten →</button></div>
                  {producten.length === 0 ? (
                    <div className="empty"><div className="ei">📦</div><p>Nog geen producten. Voeg je eerste product toe!</p></div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Product</th><th>Prijs</th><th>Status</th><th>Aangemaakt</th></tr></thead>
                      <tbody>
                        {producten.slice(0, 5).map(p => (
                          <tr key={p.id}>
                            <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {p.img_url ? <img src={p.img_url} className="product-img" alt={p.naam} /> : <div className="product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, borderRadius: 8 }}>📦</div>}
                              <strong>{p.naam}</strong>
                            </td>
                            <td style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--teal)' }}>€{parseFloat(p.prijs).toFixed(2)}</td>
                            <td><span className={`badge ${p.actief ? 'badge-green' : 'badge-gray'}`}>{p.actief ? 'Actief' : 'Inactief'}</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{formatDate(p.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* PRODUCTEN */}
            {tab === 'producten' && (
              <>
                {showProductForm && (
                  <div className="card" style={{ border: '2px solid var(--green-pale)' }}>
                    <div className="card-header">
                      <h2>Nieuw Product</h2>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowProductForm(false)}>✕ Annuleren</button>
                    </div>
                    <div className="form-row">
                      <div className="fg"><label>Productnaam *</label><input placeholder="Bijv. Hondensnoepjes Zalm 200g" value={pNaam} onChange={e => setPNaam(e.target.value)} /></div>
                      <div className="fg"><label>Prijs (€) *</label><input type="number" step="0.01" placeholder="9.95" value={pPrijs} onChange={e => setPPrijs(e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="fg">
                        <label>Categorie</label>
                        <select value={pCategorie} onChange={e => setPCategorie(e.target.value)}>
                          {['Voeding & Snacks','Speelgoed','Verzorging','Kleding & Accessoires','Benches & Manden','Gezondheid','Overig'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="fg"><label>Voorraad (optioneel)</label><input type="number" placeholder="50" value={pVoorraad} onChange={e => setPVoorraad(e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="fg">
                        <label>Voor welk dier</label>
                        <select value={pDier} onChange={e => setPDier(e.target.value)}>
                          <option value="beide">Hond & Kat</option>
                          <option value="hond">Hond</option>
                          <option value="kat">Kat</option>
                          <option value="overig">Overig</option>
                        </select>
                      </div>
                      <div className="fg"><label>&nbsp;</label></div>
                    </div>
                    <div className="fg"><label>Beschrijving</label><textarea placeholder="Beschrijf je product..." value={pBeschrijving} onChange={e => setPBeschrijving(e.target.value)} /></div>
                    <div className="fg">
                      <label>Foto's (max. 4)</label>
                      {pFotos[0] && <img src={pFotos[0]} className="foto-thumb" alt="" style={{ marginBottom: 8 }} />}
                      <label className="upload-btn" style={{ display: 'block', marginTop: 8 }}>
                        {uploadingFoto ? '⏳ Uploaden...' : '📸 Foto\'s toevoegen'}
                        <input ref={fotoRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFotoUpload} />
                      </label>
                    </div>
                    {pErr && <div style={{ background: '#FFF0F0', border: '1.5px solid #FFCDD2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C62828', marginBottom: 12 }}>⚠️ {pErr}</div>}
                    <button className="btn btn-green" onClick={handleSaveProduct} disabled={pSaving} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                      {pSaving ? 'Bezig...' : '✓ Product Opslaan'}
                    </button>
                  </div>
                )}

                <div className="card">
                  <div className="card-header">
                    <h2>Alle Producten ({producten.length})</h2>
                    {!showProductForm && <button className="btn btn-green btn-sm" onClick={() => setShowProductForm(true)}>+ Nieuw</button>}
                  </div>
                  {productenLoading ? <div className="empty">⏳ Laden...</div> : producten.length === 0 ? (
                    <div className="empty"><div className="ei">📦</div><p>Nog geen producten. Voeg je eerste product toe!</p></div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Product</th><th>Categorie</th><th>Prijs</th><th>Voorraad</th><th>Status</th><th>Actie</th></tr></thead>
                      <tbody>
                        {producten.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {p.img_url ? <img src={p.img_url} className="product-img" alt={p.naam} /> : <div className="product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, borderRadius: 8 }}>📦</div>}
                                <div>
                                  <strong style={{ fontSize: 13 }}>{p.naam}</strong>
                                  {p.beschrijving && <div style={{ fontSize: 11, color: 'var(--text-light)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.beschrijving}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{p.categorie || '—'}</td>
                            <td style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--teal)' }}>€{parseFloat(p.prijs).toFixed(2)}</td>
                            <td style={{ fontSize: 13 }}>{p.voorraad ?? '∞'}</td>
                            <td><span className={`badge ${p.actief ? 'badge-green' : 'badge-gray'}`}>{p.actief ? 'Actief' : 'Inactief'}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => toggleProductActief(p.id, p.actief)}>
                                  {p.actief ? '⏸ Pauzeer' : '▶ Activeer'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* BESTELLINGEN */}
            {tab === 'bestellingen' && (
              <div className="card">
                <div className="card-header"><h2>Bestellingen</h2></div>
                {mollieMode === 'test' && (
                  <div style={{ background: '#FFF8E1', border: '1.5px solid #F9A825', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#5D4037' }}>
                    ⚠️ Testmodus — Bestellingen via testbetalingen worden hier getoond maar zijn geen echte transacties.
                  </div>
                )}
                {bestellingen.length === 0 ? (
                  <div className="empty"><div className="ei">🛍️</div><p>Nog geen bestellingen ontvangen.</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Order</th><th>Klant</th><th>Totaal</th><th>Status</th><th>Datum</th></tr></thead>
                    <tbody>
                      {bestellingen.map(b => (
                        <tr key={b.id}>
                          <td><strong>#{b.order_nummer || b.id?.slice(0, 8)}</strong></td>
                          <td>{b.klant_naam || '—'}</td>
                          <td style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--green-dark)' }}>€{b.totaal?.toFixed(2) || '—'}</td>
                          <td><span className="badge badge-orange">{b.status}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{formatDate(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INSTELLINGEN */}
            {tab === 'instellingen' && (
              <>
                <div className="card">
                  <div className="card-header"><h2>🏪 Shop Uitstraling</h2></div>
                  <div className="form-row">
                    <div>
                      <div className="fg"><label>Logo</label>
                        {logoUrl && <img src={logoUrl} className="img-prev" alt="Logo" style={{ height: 80, width: 80, borderRadius: 12, objectFit: 'cover' }} />}
                        <label className="upload-btn" style={{ display: 'block' }}>
                          {uploadingLogo ? '⏳ Uploaden...' : logoUrl ? '🔄 Logo wijzigen' : '📸 Logo uploaden'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="fg"><label>Banner (aanbevolen: 1320×220px)</label>
                        {bannerUrl && <img src={bannerUrl} className="img-prev" alt="Banner" />}
                        <label className="upload-btn" style={{ display: 'block' }}>
                          {uploadingBanner ? '⏳ Uploaden...' : bannerUrl ? '🔄 Banner wijzigen' : '🖼️ Banner uploaden'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h2>📝 Shop Info</h2></div>
                  <div className="fg"><label>Shop naam *</label><input value={shopNaam} onChange={e => setShopNaam(e.target.value)} /></div>
                  <div className="fg"><label>Beschrijving</label><textarea value={beschrijving} onChange={e => setBeschrijving(e.target.value)} /></div>
                  <div className="form-row">
                    <div className="fg"><label>Website</label><input placeholder="https://" value={website} onChange={e => setWebsite(e.target.value)} /></div>
                    <div className="fg"><label>Instagram</label><input placeholder="@jouwshop" value={instagram} onChange={e => setInstagram(e.target.value)} /></div>
                  </div>
                  <div className="fg">
                    <label>Shop URL</label>
                    <div style={{ padding: '10px 12px', background: 'var(--cream)', borderRadius: 10, fontSize: 13, color: 'var(--text-mid)', fontWeight: 600 }}>
                      kwispelclub.be/winkel/<strong style={{ color: 'var(--green-dark)' }}>{verkoper?.slug}</strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h2>💰 Commissie</h2></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--green-pale)', borderRadius: 12 }}>
                    <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--green-dark)' }}>{verkoper?.commissie_pct || 15}%</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>Jouw commissietarief</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Stel dit in via de admin. Neem contact op voor aanpassing.</div>
                    </div>
                  </div>
                </div>

                <button className="btn btn-green" onClick={handleSaveInstellingen} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
                  {saveMsg}
                </button>
              </>
            )}

          </div>
        </main>
      </div>
    </>
  )
}
