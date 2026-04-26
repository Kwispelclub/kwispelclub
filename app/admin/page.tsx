'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SettingsPanel } from '@/components/AdminSettingsPanel'

type Tab = 'dashboard' | 'kapsalons' | 'gebruikers' | 'listings' | 'bestellingen' | 'instellingen'

const ADMIN_PASSWORD = 'Vrijdag@201024+'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')

  // Data
  const [kapsalons, setKapsalons] = useState<any[]>([])
  const [gebruikers, setGebruikers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [bestellingen, setBestellingen] = useState<any[]>([])
  const [stats, setStats] = useState({ kapsalons: 0, gebruikers: 0, listings: 0, bestellingen: 0, pending: 0 })
  const [dataLoading, setDataLoading] = useState(false)

  // Settings
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({})
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    const adminSession = sessionStorage.getItem('kw_admin')
    if (adminSession === 'true') setAuthed(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth?redirect=/admin'); return }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  const handlePasswordCheck = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('kw_admin', 'true')
      setPwError(false)
    } else {
      setPwError(true)
      setPwInput('')
    }
  }

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [k, u, l, b, s] = await Promise.all([
        supabase.from('kapsalons').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('bestellingen').select('*').order('created_at', { ascending: false }),
        fetch('/api/admin-settings').then(r => r.json()),
      ])
      setKapsalons(k.data || [])
      setGebruikers(u.data || [])
      setListings(l.data || [])
      setBestellingen(b.data || [])
      setSiteSettings(s.settings || {})
      setStats({
        kapsalons: k.data?.length || 0,
        gebruikers: u.data?.length || 0,
        listings: l.data?.length || 0,
        bestellingen: b.data?.length || 0,
        pending: k.data?.filter((x: any) => !x.geverifieerd).length || 0,
      })
    } catch (e) {
      console.error(e)
    }
    setDataLoading(false)
  }

  const toggleSetting = async (key: string, value: boolean) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }))
    await fetch('/api/admin-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  const approveKapsalon = async (id: string) => {
    await supabase.from('kapsalons').update({ geverifieerd: true, actief: true }).eq('id', id)
    const kapsalon = kapsalons.find(k => k.id === id)
    if (kapsalon?.email) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'kapsalon_goedgekeurd',
          to: kapsalon.email,
          data: { salonNaam: kapsalon.naam }
        })
      })
    }
    loadData()
  }

  const rejectKapsalon = async (id: string) => {
    await supabase.from('kapsalons').update({ actief: false }).eq('id', id)
    loadData()
  }

  const approveListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'actief' }).eq('id', id)
    loadData()
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Nunito',sans-serif;background:#F0F4F8;color:var(--text-dark);-webkit-font-smoothing:antialiased}
    h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .admin-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
    .sidebar{background:var(--green-dark);color:white;padding:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
    .sidebar-logo{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}
    .sidebar-logo .lp{width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px}
    .sidebar-logo .brand{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700}
    .sidebar-logo .admin-badge{font-size:10px;font-weight:700;background:var(--orange-main);padding:2px 8px;border-radius:50px;margin-left:4px}
    .sidebar-nav{flex:1;padding:16px 12px}
    .nav-item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;color:rgba(255,255,255,.65);transition:all .2s;margin-bottom:2px}
    .nav-item:hover{background:rgba(255,255,255,.08);color:white}
    .nav-item.active{background:rgba(255,255,255,.12);color:white}
    .nav-item .ni{font-size:16px;width:20px;text-align:center}
    .nav-badge{margin-left:auto;background:var(--orange-main);color:white;font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px}
    .sidebar-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,.08)}
    .sidebar-footer a{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;text-decoration:none;transition:all .2s}
    .sidebar-footer a:hover{color:white;background:rgba(255,255,255,.08)}
    .main{flex:1;overflow-y:auto}
    .main-header{background:white;padding:20px 32px;border-bottom:1px solid #E5EAF0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
    .main-header h1{font-size:22px;color:var(--text-dark)}
    .main-header p{font-size:13px;color:var(--text-light);margin-top:2px}
    .header-actions{display:flex;align-items:center;gap:12px}
    .btn-refresh{padding:8px 16px;border-radius:8px;border:1.5px solid #E5EAF0;background:white;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;color:var(--text-mid);transition:all .2s}
    .btn-refresh:hover{border-color:var(--green-main);color:var(--green-main)}
    .main-content{padding:28px 32px}
    .stats-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:28px}
    .stat-card{background:white;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.05);border:1.5px solid transparent;transition:all .2s}
    .stat-card:hover{border-color:var(--green-pale);box-shadow:0 4px 12px rgba(0,0,0,.08)}
    .stat-icon{font-size:24px;margin-bottom:10px}
    .stat-val{font-family:'Fredoka',sans-serif;font-size:28px;font-weight:700;color:var(--text-dark);margin-bottom:2px}
    .stat-label{font-size:12px;color:var(--text-light);font-weight:600}
    .stat-card.highlight{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-color:transparent}
    .stat-card.highlight .stat-val,.stat-card.highlight .stat-label{color:white}
    .stat-card.warning{background:linear-gradient(135deg,#E8913A,#D4812E);border-color:transparent}
    .stat-card.warning .stat-val,.stat-card.warning .stat-label{color:white}
    .section-card{background:white;border-radius:14px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.05);margin-bottom:20px}
    .section-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    .section-card-header h2{font-size:18px;color:var(--text-dark)}
    .section-card-header p{font-size:13px;color:var(--text-light)}
    .table{width:100%;border-collapse:collapse}
    .table th{text-align:left;font-size:11px;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:.8px;padding:10px 14px;border-bottom:2px solid #F0F4F8}
    .table td{padding:12px 14px;border-bottom:1px solid #F0F4F8;font-size:14px;color:var(--text-dark)}
    .table tr:last-child td{border-bottom:none}
    .table tr:hover td{background:#FAFBFC}
    .badge{display:inline-flex;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700}
    .badge-green{background:var(--green-pale);color:var(--green-dark)}
    .badge-orange{background:var(--orange-pale);color:var(--orange-main)}
    .badge-red{background:#FFF0F0;color:var(--red)}
    .badge-gray{background:#F0F4F8;color:var(--text-light)}
    .badge-teal{background:var(--teal-pale);color:var(--teal)}
    .action-btns{display:flex;gap:6px}
    .btn-sm{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;border:none;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif}
    .btn-approve{background:var(--green-pale);color:var(--green-dark)}.btn-approve:hover{background:var(--green-main);color:white}
    .btn-reject{background:#FFF0F0;color:var(--red)}.btn-reject:hover{background:var(--red);color:white}
    .btn-view{background:#F0F4F8;color:var(--text-mid)}.btn-view:hover{background:#E5EAF0;color:var(--text-dark)}
    .empty-state{text-align:center;padding:40px;color:var(--text-light)}
    .empty-state .ei{font-size:40px;margin-bottom:10px;opacity:.4}
    .empty-state p{font-size:14px}
    .loading-state{text-align:center;padding:40px;color:var(--text-light);font-size:14px}
    .pending-alert{background:var(--orange-pale);border:1.5px solid var(--orange-main);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:20px;font-size:14px;font-weight:600;color:var(--brown)}
    .pending-alert a{color:var(--orange-main);font-weight:700;cursor:pointer;text-decoration:underline}
    .role-pill{display:inline-flex;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700}
    .role-koper{background:var(--green-pale);color:var(--green-dark)}
    .role-verkoper{background:var(--teal-pale);color:var(--teal)}
    .role-kapsalon{background:var(--orange-pale);color:var(--orange-main)}
    .role-admin{background:linear-gradient(135deg,var(--green-dark),var(--green-main));color:white}
    .pw-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F0F4F8}
    .pw-card{background:white;border-radius:20px;padding:48px;max-width:400px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}
    .pw-card .icon{font-size:48px;margin-bottom:16px}
    .pw-card h2{font-size:24px;color:var(--green-dark);margin-bottom:8px}
    .pw-card p{font-size:14px;color:var(--text-mid);margin-bottom:24px;line-height:1.5}
    .pw-input{width:100%;padding:14px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:15px;outline:none;text-align:center;letter-spacing:2px;transition:all .2s;margin-bottom:12px}
    .pw-input:focus{border-color:var(--green-main);box-shadow:0 0 0 3px rgba(74,124,63,.1)}
    .pw-input.error{border-color:var(--red)}
    .pw-btn{width:100%;padding:14px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s}
    .pw-btn:hover{background:var(--green-dark)}
    .pw-error{color:var(--red);font-size:13px;font-weight:600;margin-bottom:12px}
    @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:768px){.admin-layout{grid-template-columns:1fr}.sidebar{display:none}.stats-grid{grid-template-columns:repeat(2,1fr)}}
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8', fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: 'var(--green-main)' }}>
      🐾 Laden...
    </div>
  )

  if (!authed) return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="pw-screen">
        <div className="pw-card">
          <div className="icon">🔐</div>
          <h2>Admin Toegang</h2>
          <p>Voer het admin wachtwoord in om toegang te krijgen tot het beheerpaneel.</p>
          {pwError && <div className="pw-error">⚠️ Onjuist wachtwoord</div>}
          <input
            className={`pw-input ${pwError ? 'error' : ''}`}
            type="password"
            placeholder="••••••••••••"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false) }}
            onKeyDown={e => e.key === 'Enter' && handlePasswordCheck()}
            autoFocus
          />
          <button className="pw-btn" onClick={handlePasswordCheck}>Inloggen →</button>
        </div>
      </div>
    </>
  )

  const tabTitles: Record<Tab, { title: string; desc: string }> = {
    dashboard: { title: 'Dashboard', desc: 'Overzicht van alle activiteit op Kwispelclub' },
    kapsalons: { title: 'Kapsalons', desc: `${stats.kapsalons} geregistreerde salons` },
    gebruikers: { title: 'Gebruikers', desc: `${stats.gebruikers} geregistreerde accounts` },
    listings: { title: '2de Hands Listings', desc: `${stats.listings} advertenties` },
    bestellingen: { title: 'Bestellingen', desc: `${stats.bestellingen} bestellingen` },
    instellingen: { title: 'Site Instellingen', desc: 'Beheer demo-data en site-instellingen' },
  }

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="lp">🐾</div>
            <span className="brand">Kwispelclub</span>
            <span className="admin-badge">ADMIN</span>
          </div>
          <nav className="sidebar-nav">
            {([
              ['dashboard', '📊', 'Dashboard', null],
              ['kapsalons', '✂️', 'Kapsalons', stats.pending > 0 ? stats.pending : null],
              ['gebruikers', '👥', 'Gebruikers', null],
              ['listings', '♻️', '2de Hands', null],
              ['bestellingen', '📦', 'Bestellingen', null],
              ['instellingen', '⚙️', 'Instellingen', null],
            ] as [Tab, string, string, number | null][]).map(([id, icon, label, badge]) => (
              <div key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <span className="ni">{icon}</span>
                {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href="/" target="_blank">🌐 Bekijk site</a>
            <a href="#" onClick={() => { sessionStorage.removeItem('kw_admin'); setAuthed(false) }}>🚪 Uitloggen</a>
          </div>
        </aside>

        <main className="main">
          <div className="main-header">
            <div>
              <h1>{tabTitles[tab].title}</h1>
              <p>{tabTitles[tab].desc}</p>
            </div>
            <div className="header-actions">
              <button className="btn-refresh" onClick={loadData}>{dataLoading ? '⏳ Laden...' : '🔄 Vernieuwen'}</button>
            </div>
          </div>

          <div className="main-content">

            {/* DASHBOARD */}
            {tab === 'dashboard' && (
              <>
                {stats.pending > 0 && (
                  <div className="pending-alert">
                    ⚠️ Er {stats.pending === 1 ? 'is' : 'zijn'} <strong>{stats.pending} kapsalon{stats.pending !== 1 ? 's' : ''}</strong> die wacht{stats.pending === 1 ? '' : 'en'} op goedkeuring.
                    <a onClick={() => setTab('kapsalons')} style={{ marginLeft: 8 }}>Bekijk nu →</a>
                  </div>
                )}
                <div className="stats-grid">
                  {[
                    { icon: '👥', val: stats.gebruikers, label: 'Gebruikers', cls: 'highlight' },
                    { icon: '✂️', val: stats.kapsalons, label: 'Kapsalons', cls: '' },
                    { icon: '♻️', val: stats.listings, label: '2de Hands', cls: '' },
                    { icon: '📦', val: stats.bestellingen, label: 'Bestellingen', cls: '' },
                    { icon: '⏳', val: stats.pending, label: 'In afwachting', cls: stats.pending > 0 ? 'warning' : '' },
                  ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-val">{s.val}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div><h2>Recente Kapsalon Aanmeldingen</h2><p>Nieuwste registraties die wachten op goedkeuring</p></div>
                  </div>
                  {kapsalons.filter(k => !k.geverifieerd).length === 0 ? (
                    <div className="empty-state"><div className="ei">✂️</div><p>Geen openstaande aanmeldingen</p></div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Naam</th><th>Locatie</th><th>Type</th><th>Datum</th><th>Status</th><th>Actie</th></tr></thead>
                      <tbody>
                        {kapsalons.filter(k => !k.geverifieerd).slice(0, 5).map(k => (
                          <tr key={k.id}>
                            <td><strong>{k.naam}</strong></td>
                            <td>{k.locatie || k.stad || '—'}</td>
                            <td>{k.type_salon || '—'}</td>
                            <td>{k.created_at ? formatDate(k.created_at) : '—'}</td>
                            <td><span className="badge badge-orange">In afwachting</span></td>
                            <td>
                              <div className="action-btns">
                                <button className="btn-sm btn-approve" onClick={() => approveKapsalon(k.id)}>✓ Goedkeuren</button>
                                <button className="btn-sm btn-reject" onClick={() => rejectKapsalon(k.id)}>✗ Weigeren</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div><h2>Recente Gebruikers</h2><p>Nieuwste accounts</p></div>
                  </div>
                  {gebruikers.length === 0 ? (
                    <div className="empty-state"><div className="ei">👥</div><p>Geen gebruikers gevonden</p></div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Naam</th><th>Rol</th><th>Locatie</th><th>Datum</th></tr></thead>
                      <tbody>
                        {gebruikers.slice(0, 5).map(u => (
                          <tr key={u.id}>
                            <td><strong>{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</strong></td>
                            <td><span className={`role-pill role-${u.role || 'koper'}`}>{u.role || 'koper'}</span></td>
                            <td>{u.locatie || u.stad || '—'}</td>
                            <td>{u.created_at ? formatDate(u.created_at) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* KAPSALONS */}
            {tab === 'kapsalons' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>Alle Kapsalons</h2><p>{kapsalons.length} geregistreerde salons</p></div>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : kapsalons.length === 0 ? (
                  <div className="empty-state"><div className="ei">✂️</div><p>Nog geen kapsalons geregistreerd</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Naam</th><th>Locatie</th><th>E-mail</th><th>Type</th><th>Status</th><th>Actie</th></tr></thead>
                    <tbody>
                      {kapsalons.map(k => (
                        <tr key={k.id}>
                          <td><strong>{k.naam}</strong></td>
                          <td>{k.locatie || k.stad || '—'}</td>
                          <td>{k.email || '—'}</td>
                          <td style={{ fontSize: 12 }}>{k.type_salon || '—'}</td>
                          <td>
                            {k.geverifieerd
                              ? <span className="badge badge-green">✓ Geverifieerd</span>
                              : k.actief === false
                                ? <span className="badge badge-red">✗ Geweigerd</span>
                                : <span className="badge badge-orange">⏳ In afwachting</span>}
                          </td>
                          <td>
                            <div className="action-btns">
                              {!k.geverifieerd && <button className="btn-sm btn-approve" onClick={() => approveKapsalon(k.id)}>✓ Goedkeuren</button>}
                              {k.geverifieerd && <button className="btn-sm btn-reject" onClick={() => rejectKapsalon(k.id)}>Deactiveren</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* GEBRUIKERS */}
            {tab === 'gebruikers' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>Alle Gebruikers</h2><p>{gebruikers.length} geregistreerde accounts</p></div>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : gebruikers.length === 0 ? (
                  <div className="empty-state"><div className="ei">👥</div><p>Geen gebruikers gevonden</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Naam</th><th>Rol</th><th>E-mail</th><th>Locatie</th><th>Bedrijf</th><th>Datum</th></tr></thead>
                    <tbody>
                      {gebruikers.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</strong></td>
                          <td><span className={`role-pill role-${u.role || 'koper'}`}>{u.role || 'koper'}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{u.id?.slice(0, 8)}...</td>
                          <td>{u.locatie || u.stad || '—'}</td>
                          <td>{u.bedrijfsnaam || u.salonnaam || '—'}</td>
                          <td>{u.created_at ? formatDate(u.created_at) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* LISTINGS */}
            {tab === 'listings' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>2de Hands Listings</h2><p>{listings.length} advertenties</p></div>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : listings.length === 0 ? (
                  <div className="empty-state"><div className="ei">♻️</div><p>Nog geen listings geplaatst</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Titel</th><th>Categorie</th><th>Prijs</th><th>Locatie</th><th>Status</th><th>Datum</th><th>Actie</th></tr></thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id}>
                          <td><strong>{l.titel}</strong></td>
                          <td>{l.categorie || '—'}</td>
                          <td style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--teal)' }}>€{l.vraagprijs?.toFixed(2) || '—'}</td>
                          <td>{l.locatie || '—'}</td>
                          <td>
                            {l.status === 'actief' ? <span className="badge badge-green">Actief</span>
                              : l.status === 'gereserveerd' ? <span className="badge badge-orange">Gereserveerd</span>
                              : l.status === 'verkocht' ? <span className="badge badge-teal">Verkocht</span>
                              : <span className="badge badge-gray">{l.status}</span>}
                          </td>
                          <td>{l.created_at ? formatDate(l.created_at) : '—'}</td>
                          <td>
                            <div className="action-btns">
                              {l.status !== 'actief' && <button className="btn-sm btn-approve" onClick={() => approveListing(l.id)}>Activeren</button>}
                              <button className="btn-sm btn-view">Bekijk</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* BESTELLINGEN */}
            {tab === 'bestellingen' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>Bestellingen</h2><p>{bestellingen.length} bestellingen</p></div>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : bestellingen.length === 0 ? (
                  <div className="empty-state"><div className="ei">📦</div><p>Nog geen bestellingen geplaatst</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Order #</th><th>Totaal</th><th>Status</th><th>Datum</th></tr></thead>
                    <tbody>
                      {bestellingen.map(b => (
                        <tr key={b.id}>
                          <td><strong>{b.order_nummer || b.id?.slice(0, 8)}</strong></td>
                          <td style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--green-dark)' }}>€{b.totaal?.toFixed(2) || '—'}</td>
                          <td>
                            {b.status === 'geleverd' ? <span className="badge badge-green">Geleverd</span>
                              : b.status === 'verzonden' ? <span className="badge badge-teal">Verzonden</span>
                              : b.status === 'in_behandeling' ? <span className="badge badge-orange">In behandeling</span>
                              : <span className="badge badge-gray">{b.status}</span>}
                          </td>
                          <td>{b.created_at ? formatDate(b.created_at) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INSTELLINGEN */}
            {tab === 'instellingen' && (
              <SettingsPanel
                siteSettings={siteSettings}
                toggleSetting={toggleSetting}
                settingsSaved={settingsSaved}
              />
            )}

          </div>
        </main>
      </div>
    </>
  )
}
