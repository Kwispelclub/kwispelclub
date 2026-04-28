'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const SPECIALISATIES = ['Puppy Training','Gehoorzaamheid','Gedragsproblemen','Agility','Klicker Training','Seniorhonden','Kattenbegeleiding','Overig']

export default function AcademyVerkoperPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [bestaatAl, setBestaatAl] = useState(false)
  const [aantalActief, setAantalActief] = useState(0)
  const [volzet, setVolzet] = useState(false)

  const [naam, setNaam] = useState('')
  const [bio, setBio] = useState('')
  const [specialisatie, setSpecialisatie] = useState('')
  const [ervaringJaren, setErvaringJaren] = useState('')
  const [certificaten, setCertificaten] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [akkoord, setAkkoord] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth?redirect=/academy-verkoper'); return }
      setUser(user)
      setNaam(`${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim())

      // Check bestaande aanvraag
      const { data: eigen } = await supabase
        .from('academy_verkopers')
        .select('id,status')
        .eq('profile_id', user.id)
        .single()
      if (eigen) { setBestaatAl(true); setLoading(false); return }

      // Check max 2
      const { count } = await supabase
        .from('academy_verkopers')
        .select('id', { count: 'exact' })
        .eq('status', 'actief')
      const actief = count || 0
      setAantalActief(actief)
      if (actief >= 2) setVolzet(true)
      setLoading(false)
    })
  }, [])

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `academy/${user.id}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('listings').upload(path, file)
    if (!error && data) {
      const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
      setFotoUrl(url.publicUrl)
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!naam.trim()) { setError('Naam is verplicht'); return }
    if (!bio.trim()) { setError('Bio is verplicht'); return }
    if (!specialisatie) { setError('Kies een specialisatie'); return }
    if (!akkoord) { setError('Je moet akkoord gaan met de voorwaarden'); return }

    setSubmitting(true); setError('')

    const { error: err } = await supabase.from('academy_verkopers').insert({
      profile_id: user.id,
      naam: naam.trim(),
      bio: bio.trim(),
      specialisatie,
      ervaring_jaren: ervaringJaren ? parseInt(ervaringJaren) : null,
      certificaten: certificaten ? certificaten.split('\n').map(c => c.trim()).filter(Boolean) : [],
      website: website || null,
      instagram: instagram || null,
      foto_url: fotoUrl || null,
      status: 'in_afwachting',
    })

    if (err) { setError(err.message); setSubmitting(false); return }

    // Email bevestiging
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'academy_aanvraag',
        to: user.email,
        data: { firstName: user.user_metadata?.first_name || naam, naam }
      })
    }).catch(() => {})

    setDone(true)
    setSubmitting(false)
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--white:#FFFFFF;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark)}h1,h2,h3{font-family:'Fredoka',sans-serif}
    .page{max-width:760px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 80px}
    .back{display:inline-flex;align-items:center;gap:6px;color:var(--text-mid);font-size:13px;font-weight:700;text-decoration:none;margin-bottom:32px;transition:color .2s}.back:hover{color:var(--green-main)}
    .hero{text-align:center;margin-bottom:48px}
    .hero-icon{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,var(--teal),#1a7a6e);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px}
    .hero h1{font-size:clamp(28px,4vw,40px);color:var(--green-dark);margin-bottom:10px}
    .hero p{color:var(--text-mid);font-size:16px;line-height:1.6;max-width:500px;margin:0 auto}
    .slots-banner{display:flex;align-items:center;justify-content:center;gap:12px;background:var(--teal-pale);border:1.5px solid var(--teal);border-radius:14px;padding:14px 20px;margin:24px 0 0;font-size:14px;font-weight:700;color:var(--teal)}
    .slot{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;border:2px solid var(--teal)}
    .slot.used{background:var(--teal);color:white}.slot.free{background:white;color:var(--teal)}
    .volzet-card{text-align:center;background:var(--white);border-radius:24px;padding:56px 40px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .card{background:var(--white);border-radius:20px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:20px;border:1.5px solid transparent;transition:border-color .2s}
    .card:focus-within{border-color:var(--green-pale)}
    .card h3{font-size:17px;color:var(--green-dark);margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .fg{margin-bottom:16px}
    .fg label{display:block;font-size:13px;font-weight:700;color:var(--text-mid);margin-bottom:6px}
    .fg input,.fg textarea,.fg select{width:100%;padding:12px 14px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:14px;color:var(--text-dark);outline:none;transition:border-color .2s;background:var(--cream)}
    .fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--green-main);background:white}
    .fg textarea{min-height:100px;resize:vertical}
    .fg .hint{font-size:11px;color:var(--text-mid);margin-top:4px;opacity:.7}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .specs-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
    .spec-btn{padding:10px 14px;border-radius:10px;border:2px solid var(--cream-dark);background:var(--cream);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;text-align:left;color:var(--text-dark)}
    .spec-btn.active{border-color:var(--teal);background:var(--teal-pale);color:var(--teal)}
    .foto-upload{border:2px dashed var(--cream-dark);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;font-size:14px;color:var(--text-mid);font-weight:600}
    .foto-upload:hover{border-color:var(--green-main);background:var(--green-pale);color:var(--green-dark)}
    .foto-preview{width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 12px;border:3px solid var(--green-pale)}
    .foto-preview img{width:100%;height:100%;object-fit:cover}
    .akkoord{display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:12px;background:var(--teal-pale);cursor:pointer}
    .akkoord input{margin-top:2px;width:18px;height:18px;accent-color:var(--teal);flex-shrink:0}
    .akkoord span{font-size:13px;font-weight:600;color:var(--teal);line-height:1.5}
    .error-msg{background:#FFF0F0;border:1.5px solid #FFCDD2;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:700;color:#C62828;margin-bottom:16px}
    .btn-submit{width:100%;padding:16px;border-radius:50px;background:linear-gradient(135deg,var(--teal),#1a7a6e);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:17px;font-weight:600;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(42,157,143,.3)}
    .btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 28px rgba(42,157,143,.4)}
    .btn-submit:disabled{opacity:.6;cursor:not-allowed}
    .success-card{text-align:center;background:var(--white);border-radius:24px;padding:56px 40px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .success-icon{font-size:64px;margin-bottom:20px}
    @media(max-width:600px){.form-row{grid-template-columns:1fr}.specs-grid{grid-template-columns:1fr}}
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
        <a href="/puppy-training" className="back">← Terug naar Academy</a>

        {done ? (
          <div className="success-card">
            <div className="success-icon">🎓</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 28, color: 'var(--green-dark)', marginBottom: 12 }}>Aanvraag ingediend!</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 24px' }}>
              We bekijken je aanvraag zo snel mogelijk. Je krijgt een e-mail zodra je trainer profiel goedgekeurd is.
            </p>
            <a href="/puppy-training" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 50, background: 'var(--teal)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Terug naar Academy
            </a>
          </div>
        ) : bestaatAl ? (
          <div className="success-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: 'var(--green-dark)', marginBottom: 10 }}>Je hebt al een aanvraag ingediend</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>Je aanvraag wordt verwerkt. We nemen contact op zodra je trainer profiel goedgekeurd is.</p>
          </div>
        ) : volzet ? (
          <div className="volzet-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: 'var(--green-dark)', marginBottom: 10 }}>Alle slots zijn bezet</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>
              De Academy heeft momenteel 2 actieve trainers. Schrijf je in voor de wachtlijst en we laten je weten wanneer er een slot vrijkomt.
            </p>
            <a href="/contact" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 50, background: 'var(--green-main)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Wachtlijst →
            </a>
          </div>
        ) : (
          <>
            <div className="hero">
              <div className="hero-icon">🎓</div>
              <h1>Word Academy Trainer</h1>
              <p>Deel jouw expertise met Kwispelclub leden. We hebben plaats voor maximaal 2 actieve trainers.</p>
              <div className="slots-banner">
                <span>Beschikbare slots:</span>
                {[0, 1].map(i => (
                  <div key={i} className={`slot ${i < aantalActief ? 'used' : 'free'}`}>
                    {i < aantalActief ? '✓' : (i + 1)}
                  </div>
                ))}
                <span style={{ opacity: .7 }}>{2 - aantalActief} van 2 vrij</span>
              </div>
            </div>

            <div className="card">
              <h3>👤 Persoonlijke info</h3>
              <div className="fg">
                <label>Volledige naam *</label>
                <input placeholder="Bijv. Sarah Janssen" value={naam} onChange={e => setNaam(e.target.value)} />
              </div>
              <div className="fg">
                <label>Bio *</label>
                <textarea placeholder="Vertel wie je bent, je achtergrond en waarom je hondentrainer bent geworden..." value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="fg">
                  <label>Jaren ervaring</label>
                  <input type="number" min="0" max="50" placeholder="Bijv. 5" value={ervaringJaren} onChange={e => setErvaringJaren(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Website</label>
                  <input placeholder="https://jouwwebsite.be" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <div className="fg">
                <label>Instagram</label>
                <input placeholder="@jouwprofiel" value={instagram} onChange={e => setInstagram(e.target.value)} />
              </div>
            </div>

            <div className="card">
              <h3>🎯 Specialisatie</h3>
              <div className="specs-grid">
                {SPECIALISATIES.map(s => (
                  <button key={s} className={`spec-btn ${specialisatie === s ? 'active' : ''}`} onClick={() => setSpecialisatie(s)}>
                    {specialisatie === s ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>🏅 Certificaten & Opleidingen</h3>
              <div className="fg">
                <label>Certificaten (één per lijn)</label>
                <textarea
                  placeholder={'VBAC Erkend Hondentrainer\nDipl. Gedragsconsulent\nPPG Member'}
                  value={certificaten}
                  onChange={e => setCertificaten(e.target.value)}
                  style={{ minHeight: 80 }}
                />
                <div className="hint">Voer elk certificaat op een aparte lijn in</div>
              </div>
            </div>

            <div className="card">
              <h3>📸 Profielfoto</h3>
              {fotoUrl && (
                <div className="foto-preview">
                  <img src={fotoUrl} alt="Profielfoto" />
                </div>
              )}
              <label style={{ cursor: 'pointer' }}>
                <div className="foto-upload">
                  {uploading ? '⏳ Uploaden...' : fotoUrl ? '✅ Foto geüpload — klik om te wijzigen' : '📸 Klik om een profielfoto te uploaden'}
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoUpload} />
              </label>
            </div>

            <div className="card">
              <h3>📋 Voorwaarden</h3>
              <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-dark)' }}>Exclusiviteit:</strong> Max. 2 trainers actief tegelijk op het platform.<br />
                <strong style={{ color: 'var(--text-dark)' }}>Kwaliteit:</strong> Cursusmateriaal moet origineel en professioneel zijn.<br />
                <strong style={{ color: 'var(--text-dark)' }}>Goedkeuring:</strong> Je aanvraag en content worden beoordeeld voor publicatie.<br />
                <strong style={{ color: 'var(--text-dark)' }}>Commissie:</strong> Kwispelclub ontvangt een commissie op betaalde cursussen.
              </div>
              <label className="akkoord">
                <input type="checkbox" checked={akkoord} onChange={e => setAkkoord(e.target.checked)} />
                <span>Ik ga akkoord met de voorwaarden voor Academy trainers op Kwispelclub.</span>
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
