'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type View = 'cursussen' | 'modules' | 'lessen'

export default function TrainerAcademyPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [trainer, setTrainer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Data
  const [cursussen, setCursussen] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [lessen, setLessen] = useState<any[]>([])

  // Navigation
  const [view, setView] = useState<View>('cursussen')
  const [activeCursus, setActiveCursus] = useState<any>(null)
  const [activeModule, setActiveModule] = useState<any>(null)

  // Forms
  const [showCursusForm, setShowCursusForm] = useState(false)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [showLesForm, setShowLesForm] = useState(false)

  const [cTitel, setCTitel] = useState('')
  const [cBeschrijving, setCBeschrijving] = useState('')
  const [cPrijs, setCPrijs] = useState('0')
  const [cGratis, setCGratis] = useState(true)
  const [cGepubliceerd, setCGepubliceerd] = useState(false)
  const [cThumb, setCThumb] = useState('')
  const [cSaving, setCSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const [mTitel, setMTitel] = useState('')
  const [mSaving, setMSaving] = useState(false)

  const [lTitel, setLTitel] = useState('')
  const [lType, setLType] = useState('video')
  const [lVideoUrl, setLVideoUrl] = useState('')
  const [lInhoud, setLInhoud] = useState('')
  const [lDuur, setLDuur] = useState('')
  const [lGratisPreview, setLGratisPreview] = useState(false)
  const [lSaving, setLSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push('/auth'); return }
      const { data: t } = await supabase.from('academy_verkopers').select('*').eq('profile_id', session.user.id).eq('status', 'actief').single()
      if (!t) { router.push('/academy-verkoper'); return }
      setTrainer(t)
      await loadCursussen(t.id)
      setLoading(false)
    })
  }, [])

  const loadCursussen = async (trainerId: string) => {
    const { data } = await supabase.from('cursussen').select('*').eq('trainer_id', trainerId).order('volgorde')
    setCursussen(data || [])
  }

  const loadModules = async (cursusId: string) => {
    const { data } = await supabase.from('cursus_modules').select('*').eq('cursus_id', cursusId).order('volgorde')
    setModules(data || [])
  }

  const loadLessen = async (moduleId: string) => {
    const { data } = await supabase.from('cursus_lessen').select('*').eq('module_id', moduleId).order('volgorde')
    setLessen(data || [])
  }

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !trainer) return
    setUploadingThumb(true)
    const ext = file.name.split('.').pop()
    const path = `academy/thumbnails/${trainer.id}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('listings').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
      setCThumb(url.publicUrl)
    }
    setUploadingThumb(false)
  }

  const saveCursus = async () => {
    if (!cTitel.trim() || !trainer) return
    setCSaving(true)
    await supabase.from('cursussen').insert({
      trainer_id: trainer.id,
      titel: cTitel,
      beschrijving: cBeschrijving || null,
      prijs: cGratis ? 0 : parseFloat(cPrijs) || 0,
      is_gratis: cGratis,
      gepubliceerd: cGepubliceerd,
      thumbnail_url: cThumb || null,
      volgorde: cursussen.length,
    })
    setCTitel(''); setCBeschrijving(''); setCPrijs('0'); setCGratis(true); setCGepubliceerd(false); setCThumb('')
    setShowCursusForm(false)
    await loadCursussen(trainer.id)
    setCSaving(false)
  }

  const toggleGepubliceerd = async (cursus: any) => {
    await supabase.from('cursussen').update({ gepubliceerd: !cursus.gepubliceerd }).eq('id', cursus.id)
    await loadCursussen(trainer.id)
  }

  const deleteCursus = async (id: string) => {
    if (!confirm('Cursus verwijderen? Dit verwijdert ook alle modules en lessen!')) return
    await supabase.from('cursussen').delete().eq('id', id)
    await loadCursussen(trainer.id)
  }

  const saveModule = async () => {
    if (!mTitel.trim() || !activeCursus) return
    setMSaving(true)
    await supabase.from('cursus_modules').insert({
      cursus_id: activeCursus.id,
      titel: mTitel,
      volgorde: modules.length,
    })
    setMTitel('')
    setShowModuleForm(false)
    await loadModules(activeCursus.id)
    setMSaving(false)
  }

  const deleteModule = async (id: string) => {
    if (!confirm('Module verwijderen?')) return
    await supabase.from('cursus_modules').delete().eq('id', id)
    await loadModules(activeCursus.id)
  }

  const saveLes = async () => {
    if (!lTitel.trim() || !activeModule) return
    setLSaving(true)
    await supabase.from('cursus_lessen').insert({
      module_id: activeModule.id,
      titel: lTitel,
      type: lType,
      video_url: lVideoUrl || null,
      inhoud: lInhoud || null,
      duur_minuten: lDuur ? parseInt(lDuur) : null,
      is_gratis_preview: lGratisPreview,
      volgorde: lessen.length,
    })
    setLTitel(''); setLType('video'); setLVideoUrl(''); setLInhoud(''); setLDuur(''); setLGratisPreview(false)
    setShowLesForm(false)
    await loadLessen(activeModule.id)
    setLSaving(false)
  }

  const deleteLes = async (id: string) => {
    if (!confirm('Les verwijderen?')) return
    await supabase.from('cursus_lessen').delete().eq('id', id)
    await loadLessen(activeModule.id)
  }

  const openModules = async (cursus: any) => {
    setActiveCursus(cursus)
    await loadModules(cursus.id)
    setView('modules')
  }

  const openLessen = async (module: any) => {
    setActiveModule(module)
    await loadLessen(module.id)
    setView('lessen')
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:#F0F4F8;color:var(--text-dark)}h1,h2,h3{font-family:'Fredoka',sans-serif}
    .layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
    .sidebar{background:var(--green-dark);color:white;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;padding:20px 12px}
    .sb-logo{display:flex;align-items:center;gap:10px;padding:8px 6px 20px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:16px}
    .sb-logo .icon{width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:18px}
    .sb-logo .brand{font-family:'Fredoka',sans-serif;font-size:15px;font-weight:700;line-height:1.2}
    .sb-logo .sub{font-size:10px;opacity:.5}
    .sb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:rgba(255,255,255,.6);transition:all .2s;margin-bottom:2px;text-decoration:none}
    .sb-item:hover,.sb-item.active{background:rgba(255,255,255,.1);color:white}
    .sb-footer{margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)}
    .main{flex:1;overflow-y:auto}
    .topbar{background:white;padding:16px 24px;border-bottom:1px solid #E5EAF0;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}
    .breadcrumb{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-mid)}
    .breadcrumb span{cursor:pointer;font-weight:600}.breadcrumb span:hover{color:var(--green-main)}
    .breadcrumb .sep{opacity:.4}
    .breadcrumb .current{color:var(--text-dark);font-weight:700;cursor:default}
    .content{padding:24px}
    .card{background:white;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.05);margin-bottom:16px}
    .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
    .card-header h2{font-size:16px}
    .item-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #F0F4F8}
    .item-row:last-child{border-bottom:none}
    .item-thumb{width:60px;height:44px;border-radius:8px;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
    .item-thumb img{width:100%;height:100%;object-fit:cover}
    .item-info{flex:1}
    .item-titel{font-weight:700;font-size:14px;margin-bottom:2px}
    .item-meta{font-size:12px;color:var(--text-light)}
    .badge{display:inline-flex;padding:2px 8px;border-radius:50px;font-size:11px;font-weight:700}
    .badge-green{background:var(--green-pale);color:var(--green-dark)}
    .badge-orange{background:var(--orange-pale);color:var(--orange-main)}
    .badge-gray{background:#F0F4F8;color:var(--text-light)}
    .badge-teal{background:var(--teal-pale);color:var(--teal)}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;border:none;cursor:pointer;transition:all .2s}
    .btn-green{background:var(--green-main);color:white}.btn-green:hover{background:var(--green-dark)}
    .btn-ghost{background:#F0F4F8;color:var(--text-mid)}.btn-ghost:hover{background:#E5EAF0}
    .btn-danger{background:#FFF0F0;color:var(--red)}.btn-danger:hover{background:var(--red);color:white}
    .btn-teal{background:var(--teal-pale);color:var(--teal)}.btn-teal:hover{background:var(--teal);color:white}
    .form-section{background:var(--green-pale);border:2px solid var(--green-main);border-radius:12px;padding:18px;margin-bottom:16px}
    .form-section h3{font-size:15px;color:var(--green-dark);margin-bottom:14px}
    .fg{margin-bottom:12px}
    .fg label{display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:4px}
    .fg input,.fg textarea,.fg select{width:100%;padding:9px 12px;border:2px solid var(--cream-dark);border-radius:8px;font-family:'Nunito',sans-serif;font-size:13px;outline:none;transition:border-color .2s;background:white}
    .fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--green-main)}
    .fg textarea{min-height:70px;resize:vertical}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0}
    .toggle-row label{font-size:13px;font-weight:600}
    .toggle{width:40px;height:22px;border-radius:11px;cursor:pointer;position:relative;transition:background .2s;border:none}
    .toggle.on{background:var(--green-main)}.toggle.off{background:var(--cream-dark)}
    .knob{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
    .upload-btn{border:2px dashed var(--cream-dark);border-radius:8px;padding:12px;text-align:center;cursor:pointer;font-size:12px;font-weight:700;color:var(--text-mid);transition:all .2s}
    .upload-btn:hover{border-color:var(--green-main);color:var(--green-main);background:var(--green-pale)}
    .thumb-prev{width:80px;height:56px;border-radius:6px;object-fit:cover;margin-bottom:6px}
    .empty{text-align:center;padding:32px;color:var(--text-light);font-size:13px}
    .empty .ei{font-size:32px;margin-bottom:8px;opacity:.4}
    .video-help{background:#F0F4F8;border-radius:8px;padding:10px 12px;font-size:12px;color:var(--text-mid);margin-top:6px}
    .video-help strong{color:var(--text-dark)}
    @media(max-width:768px){.layout{grid-template-columns:1fr}.sidebar{display:none}.form-row{grid-template-columns:1fr}}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🎓 Laden...</div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="icon">🎓</div>
            <div><div className="brand">Academy</div><div className="sub">Trainer Dashboard</div></div>
          </div>
          <div className="sb-item active">📚 Mijn Cursussen</div>
          <div className="sb-footer">
            <a href="/verkoper/dashboard" className="sb-item">← Verkoper Dashboard</a>
            <a href="/" className="sb-item">🏠 Home</a>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="breadcrumb">
              <span onClick={() => setView('cursussen')}>Cursussen</span>
              {activeCursus && <>
                <span className="sep">›</span>
                <span onClick={() => { setView('modules'); loadModules(activeCursus.id) }}>{activeCursus.titel}</span>
              </>}
              {activeModule && <>
                <span className="sep">›</span>
                <span className="current">{activeModule.titel}</span>
              </>}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {view === 'cursussen' && <button className="btn btn-green" onClick={() => setShowCursusForm(true)}>+ Nieuwe Cursus</button>}
              {view === 'modules' && <button className="btn btn-green" onClick={() => setShowModuleForm(true)}>+ Module Toevoegen</button>}
              {view === 'lessen' && <button className="btn btn-green" onClick={() => setShowLesForm(true)}>+ Les Toevoegen</button>}
            </div>
          </div>

          <div className="content">

            {/* CURSUSSEN */}
            {view === 'cursussen' && (
              <div className="card">
                <div className="card-header">
                  <h2>Mijn Cursussen ({cursussen.length})</h2>
                </div>

                {showCursusForm && (
                  <div className="form-section">
                    <h3>✏️ Nieuwe Cursus</h3>
                    <div className="fg"><label>Titel *</label><input placeholder="Bijv. Puppy Training Basics" value={cTitel} onChange={e => setCTitel(e.target.value)} /></div>
                    <div className="fg"><label>Beschrijving</label><textarea placeholder="Wat leren studenten in deze cursus?" value={cBeschrijving} onChange={e => setCBeschrijving(e.target.value)} /></div>
                    <div className="fg">
                      <label>Thumbnail</label>
                      {cThumb && <img src={cThumb} className="thumb-prev" alt="" />}
                      <label className="upload-btn" style={{ display: 'block' }}>
                        {uploadingThumb ? '⏳ Uploaden...' : cThumb ? '🔄 Wijzigen' : '🖼️ Thumbnail uploaden'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbUpload} />
                      </label>
                    </div>
                    <div className="toggle-row">
                      <label>Gratis cursus</label>
                      <button className={`toggle ${cGratis ? 'on' : 'off'}`} onClick={() => setCGratis(!cGratis)}>
                        <div className="knob" style={{ left: cGratis ? 20 : 2 }} />
                      </button>
                    </div>
                    {!cGratis && (
                      <div className="fg"><label>Prijs (€)</label><input type="number" step="0.01" placeholder="9.99" value={cPrijs} onChange={e => setCPrijs(e.target.value)} /></div>
                    )}
                    <div className="toggle-row">
                      <label>Direct publiceren</label>
                      <button className={`toggle ${cGepubliceerd ? 'on' : 'off'}`} onClick={() => setCGepubliceerd(!cGepubliceerd)}>
                        <div className="knob" style={{ left: cGepubliceerd ? 20 : 2 }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-green" onClick={saveCursus} disabled={cSaving}>{cSaving ? '...' : '✓ Opslaan'}</button>
                      <button className="btn btn-ghost" onClick={() => setShowCursusForm(false)}>Annuleren</button>
                    </div>
                  </div>
                )}

                {cursussen.length === 0 ? (
                  <div className="empty"><div className="ei">📚</div><p>Nog geen cursussen. Maak je eerste cursus aan!</p></div>
                ) : cursussen.map(c => (
                  <div key={c.id} className="item-row">
                    <div className="item-thumb">
                      {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.titel} /> : '🎓'}
                    </div>
                    <div className="item-info">
                      <div className="item-titel">{c.titel}</div>
                      <div className="item-meta" style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span className={`badge ${c.gepubliceerd ? 'badge-green' : 'badge-gray'}`}>{c.gepubliceerd ? '✓ Gepubliceerd' : 'Concept'}</span>
                        <span className={`badge ${c.is_gratis ? 'badge-teal' : 'badge-orange'}`}>{c.is_gratis ? 'Gratis' : `€${c.prijs}`}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-teal" onClick={() => openModules(c)}>📝 Modules</button>
                      <button className="btn btn-ghost" onClick={() => toggleGepubliceerd(c)}>{c.gepubliceerd ? '⏸ Verbergen' : '▶ Publiceren'}</button>
                      <button className="btn btn-danger" onClick={() => deleteCursus(c.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MODULES */}
            {view === 'modules' && activeCursus && (
              <div className="card">
                <div className="card-header">
                  <h2>Modules — {activeCursus.titel}</h2>
                </div>

                {showModuleForm && (
                  <div className="form-section">
                    <h3>➕ Nieuwe Module</h3>
                    <div className="fg"><label>Module Titel *</label><input placeholder="Bijv. Welkom & Voorbereiding" value={mTitel} onChange={e => setMTitel(e.target.value)} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-green" onClick={saveModule} disabled={mSaving}>{mSaving ? '...' : '✓ Opslaan'}</button>
                      <button className="btn btn-ghost" onClick={() => setShowModuleForm(false)}>Annuleren</button>
                    </div>
                  </div>
                )}

                {modules.length === 0 ? (
                  <div className="empty"><div className="ei">📋</div><p>Nog geen modules. Voeg een module toe!</p></div>
                ) : modules.map((m, idx) => (
                  <div key={m.id} className="item-row">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--green-dark)', flexShrink: 0 }}>{idx + 1}</div>
                    <div className="item-info">
                      <div className="item-titel">{m.titel}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-teal" onClick={() => openLessen(m)}>▶ Lessen</button>
                      <button className="btn btn-danger" onClick={() => deleteModule(m.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LESSEN */}
            {view === 'lessen' && activeModule && (
              <div className="card">
                <div className="card-header">
                  <h2>Lessen — {activeModule.titel}</h2>
                </div>

                {showLesForm && (
                  <div className="form-section">
                    <h3>➕ Nieuwe Les</h3>
                    <div className="form-row">
                      <div className="fg"><label>Titel *</label><input placeholder="Bijv. Introductie" value={lTitel} onChange={e => setLTitel(e.target.value)} /></div>
                      <div className="fg">
                        <label>Type</label>
                        <select value={lType} onChange={e => setLType(e.target.value)}>
                          <option value="video">▶ Video</option>
                          <option value="artikel">📄 Artikel</option>
                          <option value="quiz">❓ Quiz</option>
                        </select>
                      </div>
                    </div>
                    {lType === 'video' && (
                      <div className="fg">
                        <label>Video URL</label>
                        <input placeholder="https://youtube.com/watch?v=... of https://vimeo.com/..." value={lVideoUrl} onChange={e => setLVideoUrl(e.target.value)} />
                        <div className="video-help">
                          <strong>YouTube:</strong> https://youtube.com/watch?v=VIDEO_ID<br/>
                          <strong>Vimeo:</strong> https://vimeo.com/VIDEO_ID<br/>
                          <strong>Direct MP4:</strong> https://jouwserver.com/video.mp4
                        </div>
                      </div>
                    )}
                    {(lType === 'artikel' || lType === 'quiz') && (
                      <div className="fg"><label>Inhoud</label><textarea placeholder="Schrijf hier de inhoud van de les..." value={lInhoud} onChange={e => setLInhoud(e.target.value)} style={{ minHeight: 100 }} /></div>
                    )}
                    <div className="form-row">
                      <div className="fg"><label>Duur (minuten)</label><input type="number" placeholder="10" value={lDuur} onChange={e => setLDuur(e.target.value)} /></div>
                      <div style={{ paddingTop: 20 }}>
                        <div className="toggle-row">
                          <label>Gratis preview</label>
                          <button className={`toggle ${lGratisPreview ? 'on' : 'off'}`} onClick={() => setLGratisPreview(!lGratisPreview)}>
                            <div className="knob" style={{ left: lGratisPreview ? 20 : 2 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-green" onClick={saveLes} disabled={lSaving}>{lSaving ? '...' : '✓ Opslaan'}</button>
                      <button className="btn btn-ghost" onClick={() => setShowLesForm(false)}>Annuleren</button>
                    </div>
                  </div>
                )}

                {lessen.length === 0 ? (
                  <div className="empty"><div className="ei">▶</div><p>Nog geen lessen in deze module.</p></div>
                ) : lessen.map((l, idx) => (
                  <div key={l.id} className="item-row">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: l.type === 'video' ? 'var(--orange-pale)' : l.type === 'quiz' ? '#EDE8F5' : 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {l.type === 'video' ? '▶' : l.type === 'quiz' ? '❓' : '📄'}
                    </div>
                    <div className="item-info">
                      <div className="item-titel">{l.titel}</div>
                      <div className="item-meta" style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                        {l.duur_minuten && <span>{l.duur_minuten} min</span>}
                        {l.is_gratis_preview && <span className="badge badge-teal">Gratis preview</span>}
                        {l.video_url && <span style={{ fontSize: 11, color: 'var(--green-main)', fontWeight: 700 }}>✓ Video</span>}
                      </div>
                    </div>
                    <button className="btn btn-danger" onClick={() => deleteLes(l.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}
