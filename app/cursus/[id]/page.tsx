'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function getVideoEmbed(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  if (url.endsWith('.mp4') || url.includes('.mp4')) return url
  return null
}

export default function CursusPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [cursus, setCursus] = useState<any>(null)
  const [trainer, setTrainer] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [heeftToegang, setHeeftToegang] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())
  const [activeLes, setActiveLes] = useState<any>(null)
  const [betalenLoading, setBetalenLoading] = useState(false)
  const [voortgang, setVoortgang] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    const [{ data: { session } }, { data: c }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('cursussen').select('*, academy_verkopers(naam, foto_url, bio, specialisatie)').eq('id', id).eq('gepubliceerd', true).single()
    ])

    if (!c) { router.push('/puppy-training'); return }
    setCursus(c)
    setTrainer(c.academy_verkopers)
    setUser(session?.user || null)

    // Laad modules + lessen
    const { data: mods } = await supabase
      .from('cursus_modules')
      .select('*, cursus_lessen(*)')
      .eq('cursus_id', id)
      .order('volgorde')

    const modsWithLessen = (mods || []).map(m => ({
      ...m,
      cursus_lessen: (m.cursus_lessen || []).sort((a: any, b: any) => a.volgorde - b.volgorde)
    }))
    setModules(modsWithLessen)

    // Open eerste module
    if (modsWithLessen.length > 0) {
      setOpenModules(new Set([modsWithLessen[0].id]))
    }

    // Check toegang
    if (session?.user) {
      if (c.is_gratis) {
        setHeeftToegang(true)
      } else {
        const { data: aankoop } = await supabase
          .from('cursus_aankopen')
          .select('id,status')
          .eq('user_id', session.user.id)
          .eq('cursus_id', id)
          .eq('status', 'paid')
          .single()
        setHeeftToegang(!!aankoop)
      }

      // Laad voortgang
      const { data: prog } = await supabase
        .from('cursus_voortgang')
        .select('les_id')
        .eq('user_id', session.user.id)
        .eq('cursus_id', id)
      setVoortgang(new Set((prog || []).map((p: any) => p.les_id)))
    } else if (c.is_gratis) {
      setHeeftToegang(true)
    }

    setLoading(false)
  }

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const markeerVoltooid = async (lesId: string) => {
    if (!user || !heeftToegang) return
    if (voortgang.has(lesId)) return
    await supabase.from('cursus_voortgang').upsert({ user_id: user.id, cursus_id: id, les_id: lesId })
    setVoortgang(prev => new Set([...prev, lesId]))
  }

  const startBetaling = async () => {
    if (!user) { router.push(`/auth?redirect=/cursus/${id}`); return }
    setBetalenLoading(true)
    const res = await fetch('/api/cursus-betaling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursus_id: id, user_id: user.id, bedrag: cursus.prijs }),
    })
    const data = await res.json()
    if (data.checkout_url) {
      window.location.href = data.checkout_url
    } else {
      alert('Fout bij aanmaken betaling: ' + (data.error || 'Onbekende fout'))
      setBetalenLoading(false)
    }
  }

  const totalLessen = modules.reduce((sum, m) => sum + (m.cursus_lessen?.length || 0), 0)
  const voltooidLessen = voortgang.size
  const pct = totalLessen > 0 ? Math.round(voltooidLessen / totalLessen * 100) : 0

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark)}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .back{display:inline-flex;align-items:center;gap:6px;color:var(--text-mid);font-size:13px;font-weight:700;text-decoration:none;padding:20px clamp(16px,4vw,48px);transition:color .2s}.back:hover{color:var(--green-main)}
    .hero{background:linear-gradient(135deg,var(--green-dark),var(--green-main));padding:40px clamp(16px,4vw,48px);color:white}
    .hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:40px;align-items:center}
    .hero-tag{display:inline-flex;padding:4px 14px;border-radius:50px;background:rgba(255,255,255,.15);font-size:12px;font-weight:700;margin-bottom:14px}
    .hero h1{font-size:clamp(28px,4vw,42px);margin-bottom:12px;line-height:1.15}
    .hero p{font-size:15px;opacity:.82;line-height:1.65;max-width:480px;margin-bottom:20px}
    .hero-meta{display:flex;gap:20px;flex-wrap:wrap;font-size:13px;opacity:.75}
    .hero-meta span{display:flex;align-items:center;gap:5px}
    .hero-card{background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.2)}
    .hero-thumb{width:100%;aspect-ratio:16/9;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:48px;overflow:hidden}
    .hero-thumb img{width:100%;height:100%;object-fit:cover}
    .hero-card-body{padding:20px}
    .price-tag{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:var(--green-dark);margin-bottom:12px}
    .price-tag.gratis{color:var(--teal)}
    .btn-koop{width:100%;padding:15px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(232,145,58,.3)}
    .btn-koop:hover{background:#D4812E;transform:translateY(-2px)}
    .btn-koop:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .btn-start{width:100%;padding:15px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s}
    .btn-start:hover{background:var(--green-dark)}
    .includes{margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text-mid)}
    .includes span{display:flex;align-items:center;gap:8px}
    .body{max-width:1100px;margin:0 auto;padding:40px clamp(16px,4vw,48px);display:grid;grid-template-columns:1fr 380px;gap:40px;align-items:start}
    .modules-section h2{font-size:22px;color:var(--text-dark);margin-bottom:20px}
    .module-card{background:white;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);margin-bottom:12px}
    .module-hdr{display:flex;align-items:center;gap:14px;padding:18px 20px;cursor:pointer;transition:background .2s}.module-hdr:hover{background:var(--cream)}
    .module-num{width:36px;height:36px;border-radius:50%;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:700;color:var(--green-dark);flex-shrink:0}
    .module-hdr h3{font-size:15px;flex:1}.module-chev{transition:transform .3s;color:var(--text-light)}.module-chev.open{transform:rotate(180deg)}
    .les-list{padding:0 20px 16px}
    .les-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:all .2s;font-size:13px}
    .les-item:hover,.les-item.active{background:var(--green-pale)}
    .les-item.locked{opacity:.5;cursor:default}.les-item.locked:hover{background:transparent}
    .les-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
    .les-icon.video{background:var(--orange-pale)}.les-icon.artikel{background:var(--green-pale)}.les-icon.quiz{background:#EDE8F5}
    .les-title{flex:1;font-weight:600}.les-dur{font-size:11px;color:var(--text-light)}
    .les-check{width:20px;height:20px;border-radius:50%;border:2px solid var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
    .les-check.done{background:var(--green-main);border-color:var(--green-main);color:white}
    .preview-badge{font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:var(--teal-pale);color:var(--teal)}
    .video-player{background:black;border-radius:14px;overflow:hidden;margin-bottom:20px;aspect-ratio:16/9}
    .video-player iframe,.video-player video{width:100%;height:100%;border:none}
    .video-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;gap:12px}
    .les-content{background:white;border-radius:14px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.05);margin-bottom:20px}
    .les-content h2{font-size:20px;margin-bottom:14px}
    .les-content p{font-size:14px;color:var(--text-mid);line-height:1.7}
    .btn-done{padding:12px 28px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer}
    .btn-done.done{background:var(--green-pale);color:var(--green-dark);cursor:default}
    .sidebar-card{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);margin-bottom:16px;position:sticky;top:20px}
    .progress-bar{width:100%;height:8px;background:var(--cream-dark);border-radius:50px;overflow:hidden;margin:8px 0}
    .progress-fill{height:100%;background:linear-gradient(90deg,var(--green-main),var(--green-light));border-radius:50px;transition:width .5s}
    .trainer-row{display:flex;align-items:center;gap:12px}
    .trainer-av{width:48px;height:48px;border-radius:50%;overflow:hidden;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
    .trainer-av img{width:100%;height:100%;object-fit:cover}
    .paywall{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:14px;padding:28px;text-align:center;color:white}
    .paywall h3{font-size:20px;margin-bottom:8px;color:white}
    .paywall p{font-size:13px;opacity:.82;margin-bottom:20px}
    @media(max-width:900px){.hero-inner,.body{grid-template-columns:1fr}.hero-card{max-width:400px}}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🎓 Laden...</div>
    </>
  )

  if (!cursus) return null

  return (
    <>
      <style>{CSS}</style>
      <a href="/puppy-training" className="back">← Terug naar Academy</a>

      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-tag">🎓 KWISPELCLUB ACADEMY</div>
            <h1>{cursus.titel}</h1>
            {cursus.beschrijving && <p>{cursus.beschrijving}</p>}
            <div className="hero-meta">
              <span>📚 {modules.length} modules</span>
              <span>▶ {totalLessen} lessen</span>
              {cursus.is_gratis ? <span>🆓 Gratis</span> : <span>💰 €{cursus.prijs}</span>}
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-thumb">
              {cursus.thumbnail_url ? <img src={cursus.thumbnail_url} alt={cursus.titel} /> : '🎓'}
            </div>
            <div className="hero-card-body">
              <div className={`price-tag ${cursus.is_gratis ? 'gratis' : ''}`}>
                {cursus.is_gratis ? 'Gratis' : `€${parseFloat(cursus.prijs).toFixed(2)}`}
              </div>
              {heeftToegang ? (
                <button className="btn-start" onClick={() => {
                  const firstLes = modules[0]?.cursus_lessen?.[0]
                  if (firstLes) setActiveLes(firstLes)
                  document.getElementById('cursus-body')?.scrollIntoView({ behavior: 'smooth' })
                }}>▶ Start Cursus</button>
              ) : (
                <>
                  <button className="btn-koop" onClick={startBetaling} disabled={betalenLoading}>
                    {betalenLoading ? '⏳ Bezig...' : cursus.is_gratis ? '▶ Start Gratis' : `🔒 Koop voor €${parseFloat(cursus.prijs).toFixed(2)}`}
                  </button>
                  {!user && <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 8, textAlign: 'center' }}>Je hebt een account nodig om te starten</p>}
                </>
              )}
              <div className="includes">
                <span>✅ Levenslange toegang</span>
                <span>📱 Op elk apparaat</span>
                <span>🏆 Certificaat bij voltooiing</span>
                {!cursus.is_gratis && <span>💳 Veilige betaling via Mollie</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="body" id="cursus-body">
        <div>
          {/* Video player */}
          {activeLes && heeftToegang && (
            <div>
              {activeLes.type === 'video' && activeLes.video_url && (
                <div className="video-player">
                  {activeLes.video_url.includes('.mp4') ? (
                    <video controls autoPlay src={activeLes.video_url} />
                  ) : (
                    <iframe src={getVideoEmbed(activeLes.video_url) || ''} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  )}
                </div>
              )}
              <div className="les-content">
                <h2>{activeLes.titel}</h2>
                {activeLes.inhoud && <p>{activeLes.inhoud}</p>}
                <div style={{ marginTop: 16 }}>
                  <button className={`btn-done ${voortgang.has(activeLes.id) ? 'done' : ''}`} onClick={() => markeerVoltooid(activeLes.id)}>
                    {voortgang.has(activeLes.id) ? '✓ Voltooid' : 'Markeer als voltooid'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="modules-section">
            <h2>Cursus Inhoud</h2>
            {modules.map((m, mIdx) => (
              <div key={m.id} className="module-card">
                <div className="module-hdr" onClick={() => toggleModule(m.id)}>
                  <div className="module-num">{mIdx + 1}</div>
                  <h3>{m.titel}</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', marginRight: 8 }}>{m.cursus_lessen?.length || 0} lessen</span>
                  <span className={`module-chev ${openModules.has(m.id) ? 'open' : ''}`}>▼</span>
                </div>
                {openModules.has(m.id) && (
                  <div className="les-list">
                    {(m.cursus_lessen || []).map((l: any) => {
                      const isLocked = !heeftToegang && !l.is_gratis_preview
                      return (
                        <div key={l.id} className={`les-item ${activeLes?.id === l.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                          onClick={() => !isLocked && setActiveLes(l)}>
                          <div className={`les-icon ${l.type}`}>
                            {l.type === 'video' ? '▶' : l.type === 'quiz' ? '❓' : '📄'}
                          </div>
                          <div className="les-title">{l.titel}</div>
                          {l.is_gratis_preview && <span className="preview-badge">Gratis</span>}
                          {l.duur_minuten && <span className="les-dur">{l.duur_minuten} min</span>}
                          {isLocked ? <span style={{ fontSize: 14 }}>🔒</span> : (
                            <div className={`les-check ${voortgang.has(l.id) ? 'done' : ''}`}>{voortgang.has(l.id) ? '✓' : ''}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Voortgang */}
          {heeftToegang && (
            <div className="sidebar-card">
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Jouw Voortgang</h3>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 600 }}>{pct}% voltooid ({voltooidLessen}/{totalLessen} lessen)</p>
            </div>
          )}

          {/* Betaalmuur sidebar */}
          {!heeftToegang && !cursus.is_gratis && (
            <div className="paywall">
              <h3>🔒 Volledige Toegang</h3>
              <p>Koop deze cursus voor levenslange toegang tot alle {totalLessen} lessen.</p>
              <button className="btn-koop" onClick={startBetaling} disabled={betalenLoading}>
                {betalenLoading ? '⏳...' : `Koop voor €${parseFloat(cursus.prijs).toFixed(2)}`}
              </button>
            </div>
          )}

          {/* Trainer info */}
          {trainer && (
            <div className="sidebar-card">
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Jouw Trainer</h3>
              <div className="trainer-row">
                <div className="trainer-av">
                  {trainer.foto_url ? <img src={trainer.foto_url} alt={trainer.naam} /> : '👩‍🏫'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{trainer.naam}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{trainer.specialisatie}</div>
                </div>
              </div>
              {trainer.bio && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 12, lineHeight: 1.6 }}>{trainer.bio}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
