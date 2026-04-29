'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const CATEGORIEEN = ['Voeding & Snacks','Speelgoed','Verzorging','Kleding & Accessoires','Benches & Manden','Riemen & Tuigjes','Gezondheid','Overig']

export default function WordVerkoperPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bestaatAl, setBestaatAl] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [shopNaam, setShopNaam] = useState('')
  const [beschrijving, setBeschrijving] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [cats, setCats] = useState<string[]>([])
  const [akkoord, setAkkoord] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) { router.push('/auth?redirect=/word-verkoper'); return }
      setUser(user)
      // Check of al verkoper
      const { data } = await supabase.from('verkopers').select('id,status').eq('profile_id', user.id).single()
      if (data) {
        if (data.status === 'actief') { router.push('/verkoper/dashboard'); return }
        setBestaatAl(true)
      }
      setLoading(false)
    })
  }, [])

  const toggleCat = (c: string) => setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const generateSlug = (naam: string) =>
    naam.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async () => {
    if (!shopNaam.trim()) { setError('Shop naam is verplicht'); return }
    if (!beschrijving.trim()) { setError('Beschrijving is verplicht'); return }
    if (!akkoord) { setError('Je moet akkoord gaan met de voorwaarden'); return }
    if (!user) return

    setSubmitting(true); setError('')

    const slug = generateSlug(shopNaam)

    // Check slug uniek
    const { data: bestaand } = await supabase.from('verkopers').select('id').eq('slug', slug).single()
    const finalSlug = bestaand ? `${slug}-${Date.now().toString(36)}` : slug

    const { error: err } = await supabase.from('verkopers').insert({
      profile_id: user.id,
      shop_naam: shopNaam,
      slug: finalSlug,
      beschrijving,
      website: website || null,
      instagram: instagram || null,
      categorieen: cats,
      status: 'in_afwachting',
    })

    if (err) { setError(err.message); setSubmitting(false); return }

    // Update profile role naar verkoper_aanvraag
    await supabase.from('profiles').update({ role: 'verkoper_aanvraag' }).eq('id', user.id)

    // Notificatie email
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'verkoper_aanvraag',
        to: user.email,
        data: { firstName: user.user_metadata?.first_name || 'Baasje', shopNaam }
      })
    }).catch(() => {})

    setDone(true)
    setSubmitting(false)
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark)}
    h1,h2,h3{font-family:'Fredoka',sans-serif}
    .page{max-width:780px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 80px}
    .back{display:inline-flex;align-items:center;gap:6px;color:var(--text-mid);font-size:13px;font-weight:700;text-decoration:none;margin-bottom:32px;transition:color .2s}
    .back:hover{color:var(--green-main)}
    .hero{text-align:center;margin-bottom:48px}
    .hero-icon{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,var(--green-dark),var(--green-main));display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px}
    .hero h1{font-size:clamp(28px,4vw,40px);color:var(--green-dark);margin-bottom:10px}
    .hero p{color:var(--text-mid);font-size:16px;line-height:1.6;max-width:500px;margin:0 auto}
    .steps{display:flex;gap:16px;justify-content:center;margin:24px 0 0;flex-wrap:wrap}
    .step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--green-dark)}
    .step-num{width:24px;height:24px;border-radius:50%;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
    .step-sep{color:var(--text-mid);opacity:.4;font-size:18px}
    .card{background:var(--white);border-radius:20px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:20px;border:1.5px solid transparent;transition:border-color .2s}
    .card:focus-within{border-color:var(--green-pale)}
    .card h3{font-size:17px;color:var(--green-dark);margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .fg{margin-bottom:16px}
    .fg label{display:block;font-size:13px;font-weight:700;color:var(--text-mid);margin-bottom:6px}
    .fg input,.fg textarea{width:100%;padding:12px 14px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:14px;color:var(--text-dark);outline:none;transition:border-color .2s;background:var(--cream)}
    .fg input:focus,.fg textarea:focus{border-color:var(--green-main);background:white}
    .fg textarea{min-height:100px;resize:vertical}
    .fg .hint{font-size:11px;color:var(--text-mid);margin-top:4px;opacity:.7}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .cats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
    .cat-btn{padding:10px 14px;border-radius:10px;border:2px solid var(--cream-dark);background:var(--cream);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;text-align:left;color:var(--text-dark)}
    .cat-btn.active{border-color:var(--green-main);background:var(--green-pale);color:var(--green-dark)}
    .akkoord{display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:12px;background:var(--green-pale);cursor:pointer}
    .akkoord input{margin-top:2px;width:18px;height:18px;accent-color:var(--green-main);flex-shrink:0}
    .akkoord span{font-size:13px;font-weight:600;color:var(--green-dark);line-height:1.5}
    .akkoord a{color:var(--green-main)}
    .error-msg{background:#FFF0F0;border:1.5px solid #FFCDD2;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:700;color:#C62828;margin-bottom:16px}
    .btn-submit{width:100%;padding:16px;border-radius:50px;background:linear-gradient(135deg,var(--green-main),var(--green-dark));color:white;border:none;font-family:'Fredoka',sans-serif;font-size:17px;font-weight:600;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(74,124,63,.3)}
    .btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 28px rgba(74,124,63,.4)}
    .btn-submit:disabled{opacity:.6;cursor:not-allowed}
    .success-card{text-align:center;background:var(--white);border-radius:24px;padding:56px 40px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .success-icon{font-size:64px;margin-bottom:20px}
    .success-card h2{font-size:28px;color:var(--green-dark);margin-bottom:12px}
    .success-card p{color:var(--text-mid);font-size:15px;line-height:1.6;max-width:440px;margin:0 auto 24px}
    .bestaat-card{text-align:center;background:var(--white);border-radius:24px;padding:56px 40px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    @media(max-width:600px){.form-row{grid-template-columns:1fr}.cats-grid{grid-template-columns:1fr}}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🐾 Laden...</div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <a href="/verkoper" className="back">← Terug</a>

        {done ? (
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2>Aanvraag ingediend!</h2>
            <p>We bekijken je aanvraag zo snel mogelijk. Je krijgt een e-mail zodra je shop goedgekeurd is. Welkom bij Kwispelclub!</p>
            <a href="/" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 50, background: 'var(--green-main)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Terug naar home</a>
          </div>
        ) : bestaatAl ? (
          <div className="bestaat-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: 'var(--green-dark)', marginBottom: 10 }}>Je hebt al een aanvraag ingediend</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>Je aanvraag wordt verwerkt. We nemen contact op zodra je shop goedgekeurd is.</p>
          </div>
        ) : (
          <>
            <div className="hero">
              <div className="hero-icon">🏪</div>
              <h1>Word Verkoper</h1>
              <p>Open je eigen shop op Kwispelclub en bereik duizenden huisdiereigenaren in België en Nederland.</p>
              <div className="steps">
                <div className="step"><div className="step-num">1</div> Aanvraag invullen</div>
                <div className="step-sep">→</div>
                <div className="step"><div className="step-num">2</div> Admin goedkeuring</div>
                <div className="step-sep">→</div>
                <div className="step"><div className="step-num">3</div> Shop live!</div>
              </div>
            </div>

            <div className="card">
              <h3>🏪 Shop informatie</h3>
              <div className="fg">
                <label>Shop naam *</label>
                <input placeholder="Bijv. Nala's Petshop" value={shopNaam} onChange={e => setShopNaam(e.target.value)} />
                {shopNaam && <div className="hint">URL: kwispelclub.be/winkel/{generateSlug(shopNaam)}</div>}
              </div>
              <div className="fg">
                <label>Beschrijving *</label>
                <textarea placeholder="Vertel iets over je shop, wat je verkoopt en wie je bent..." value={beschrijving} onChange={e => setBeschrijving(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="fg">
                  <label>Website</label>
                  <input placeholder="https://jouwwebsite.be" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Instagram</label>
                  <input placeholder="@jouwshop" value={instagram} onChange={e => setInstagram(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card">
              <h3>🏷️ Categorieën <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-mid)' }}>(selecteer wat je verkoopt)</span></h3>
              <div className="cats-grid">
                {CATEGORIEEN.map(c => (
                  <button key={c} className={`cat-btn ${cats.includes(c) ? 'active' : ''}`} onClick={() => toggleCat(c)}>
                    {cats.includes(c) ? '✓ ' : ''}{c}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>📋 Voorwaarden</h3>
              <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-dark)' }}>Commissie:</strong> Kwispelclub rekent 15% commissie op elke verkoop.<br/>
                <strong style={{ color: 'var(--text-dark)' }}>Verzending:</strong> Je bent verantwoordelijk voor verzending binnen 2 werkdagen.<br/>
                <strong style={{ color: 'var(--text-dark)' }}>Kwaliteit:</strong> Producten moeten voldoen aan onze kwaliteitsrichtlijnen.<br/>
                <strong style={{ color: 'var(--text-dark)' }}>Goedkeuring:</strong> Je aanvraag wordt beoordeeld door ons team.
              </div>
              <label className="akkoord">
                <input type="checkbox" checked={akkoord} onChange={e => setAkkoord(e.target.checked)} />
                <span>Ik ga akkoord met de <a href="/privacy">algemene voorwaarden</a> en het commissiemodel van Kwispelclub.</span>
              </label>
            </div>

            {error && <div className="error-msg">⚠️ {error}</div>}
            <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Bezig...' : 'Aanvraag Indienen →'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
