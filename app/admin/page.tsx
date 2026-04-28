'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SettingsPanel } from '@/components/AdminSettingsPanel'

type Tab = 'dashboard' | 'kapsalons' | 'verkopers' | 'academy' | 'gebruikers' | 'listings' | 'bestellingen' | 'team' | 'instellingen'

const ADMIN_PASSWORD = 'Vrijdag@201024+'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')

  const [kapsalons, setKapsalons] = useState<any[]>([])
  const [gebruikers, setGebruikers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [bestellingen, setBestellingen] = useState<any[]>([])
  const [verkopers, setVerkopers] = useState<any[]>([])
  const [academyTrainers, setAcademyTrainers] = useState<any[]>([])
  const [teamleden, setTeamleden] = useState<any[]>([])
  const [editTeamlid, setEditTeamlid] = useState<any>(null)
  const [teamSaving, setTeamSaving] = useState(false)
  const [uploadingTeamFoto, setUploadingTeamFoto] = useState(false)
  const [stats, setStats] = useState({ kapsalons: 0, gebruikers: 0, listings: 0, bestellingen: 0, pending: 0, verkopers: 0, verkopersPending: 0 })
  const [dataLoading, setDataLoading] = useState(false)
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({})
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Verkoper commissie edit
  const [editCommissie, setEditCommissie] = useState<{ id: string; val: string } | null>(null)

  useEffect(() => {
    const adminSession = sessionStorage.getItem('kw_admin')
    if (adminSession === 'true') setAuthed(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth?redirect=/admin'); return }
      setLoading(false)
    })
  }, [])

  useEffect(() => { if (authed) loadData() }, [authed])

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
      const [k, u, l, b, v, a, t, s] = await Promise.all([
        supabase.from('kapsalons').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('bestellingen').select('*').order('created_at', { ascending: false }),
        supabase.from('verkopers').select('*, profiles(first_name, last_name, email)').order('created_at', { ascending: false }),
        supabase.from('academy_verkopers').select('*, profiles(first_name, last_name, email)').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('volgorde'),
        fetch('/api/admin-settings').then(r => r.json()),
      ])
      setKapsalons(k.data || [])
      setGebruikers(u.data || [])
      setListings(l.data || [])
      setBestellingen(b.data || [])
      setVerkopers(v.data || [])
      setAcademyTrainers(a.data || [])
      setTeamleden(t.data || [])
      setSiteSettings(s.settings || {})
      setStats({
        kapsalons: k.data?.length || 0,
        gebruikers: u.data?.length || 0,
        listings: l.data?.length || 0,
        bestellingen: b.data?.length || 0,
        pending: k.data?.filter((x: any) => !x.geverifieerd).length || 0,
        verkopers: v.data?.length || 0,
        verkopersPending: v.data?.filter((x: any) => x.status === 'in_afwachting').length || 0,
      })
    } catch (e) { console.error(e) }
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
    const k = kapsalons.find(x => x.id === id)
    if (k?.email) {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'kapsalon_goedgekeurd', to: k.email, data: { salonNaam: k.naam } }) })
    }
    loadData()
  }

  const rejectKapsalon = async (id: string) => {
    await supabase.from('kapsalons').update({ actief: false }).eq('id', id)
    loadData()
  }

  const approveVerkoper = async (id: string) => {
    const v = verkopers.find(x => x.id === id)
    await supabase.from('verkopers').update({ status: 'actief', goedgekeurd_op: new Date().toISOString() }).eq('id', id)
    // Update profile role
    if (v?.profile_id) {
      await supabase.from('profiles').update({ role: 'verkoper' }).eq('id', v.profile_id)
    }
    // Email
    if (v?.profiles?.email) {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verkoper_goedgekeurd', to: v.profiles.email, data: { shopNaam: v.shop_naam, slug: v.slug } }) }).catch(() => {})
    }
    loadData()
  }

  const rejectVerkoper = async (id: string) => {
    const v = verkopers.find(x => x.id === id)
    await supabase.from('verkopers').update({ status: 'geweigerd' }).eq('id', id)
    if (v?.profile_id) {
      await supabase.from('profiles').update({ role: 'koper' }).eq('id', v.profile_id)
    }
    loadData()
  }

  const approveTrainer = async (id: string) => {
    const t = academyTrainers.find(x => x.id === id)
    const actief = academyTrainers.filter(x => x.status === 'actief').length
    if (actief >= 2) { alert('Maximum van 2 actieve trainers bereikt. Pauzeer eerst een trainer.'); return }
    await supabase.from('academy_verkopers').update({ status: 'actief' }).eq('id', id)
    if (t?.profiles?.email) {
      await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'academy_goedgekeurd', to: t.profiles.email, data: { naam: t.naam } }) }).catch(() => {})
    }
    loadData()
  }

  const rejectTrainer = async (id: string) => {
    await supabase.from('academy_verkopers').update({ status: 'geweigerd' }).eq('id', id)
    loadData()
  }

  const pauseTrainer = async (id: string) => {
    await supabase.from('academy_verkopers').update({ status: 'gepauzeerd' }).eq('id', id)
    loadData()
  }

  const updateTrainerVolgorde = async (id: string, volgorde: number) => {
    await supabase.from('academy_verkopers').update({ volgorde }).eq('id', id)
    loadData()
  }

  const saveTeamlid = async () => {
    if (!editTeamlid) return
    setTeamSaving(true)
    if (editTeamlid.id) {
      await supabase.from('team_members').update({
        naam: editTeamlid.naam, rol: editTeamlid.rol, bio: editTeamlid.bio,
        foto_url: editTeamlid.foto_url || null, volgorde: editTeamlid.volgorde || 0,
        actief: editTeamlid.actief, is_placeholder: editTeamlid.is_placeholder,
      }).eq('id', editTeamlid.id)
    } else {
      await supabase.from('team_members').insert({
        naam: editTeamlid.naam, rol: editTeamlid.rol, bio: editTeamlid.bio,
        foto_url: editTeamlid.foto_url || null, volgorde: editTeamlid.volgorde || 0,
        actief: true, is_placeholder: editTeamlid.is_placeholder || false,
      })
    }
    setEditTeamlid(null)
    setTeamSaving(false)
    loadData()
  }

  const deleteTeamlid = async (id: string) => {
    if (!confirm('Teamlid verwijderen?')) return
    await supabase.from('team_members').delete().eq('id', id)
    loadData()
  }

  const handleTeamFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editTeamlid) return
    setUploadingTeamFoto(true)
    const ext = file.name.split('.').pop()
    const path = `team/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('listings').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
      setEditTeamlid((prev: any) => ({ ...prev, foto_url: url.publicUrl }))
    }
    setUploadingTeamFoto(false)
  }

  const updateCommissie = async (id: string, pct: string) => {
    const val = parseFloat(pct)
    if (isNaN(val) || val < 0 || val > 50) return
    await supabase.from('verkopers').update({ commissie_pct: val }).eq('id', id)
    setEditCommissie(null)
    loadData()
  }

  const approveListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'actief' }).eq('id', id)
    loadData()
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1;--brown:#5C3D2E}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Nunito',sans-serif;background:#F0F4F8;color:var(--text-dark);-webkit-font-smoothing:antialiased}
    h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .admin-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
    .sidebar{background:var(--green-dark);color:white;padding:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
    .sidebar-logo{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}
    .sidebar-logo .lp{width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px}
    .sidebar-logo .brand{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700}
    .sidebar-logo .admin-badge{font-size:10px;font-weight:700;background:var(--orange-main);padding:2px 8px;border-radius:50px;margin-left:4px}
    .sidebar-nav{flex:1;padding:16px 12px;overflow-y:auto}
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
    .action-btns{display:flex;gap:6px;flex-wrap:wrap}
    .btn-sm{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;border:none;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif}
    .btn-approve{background:var(--green-pale);color:var(--green-dark)}.btn-approve:hover{background:var(--green-main);color:white}
    .btn-reject{background:#FFF0F0;color:var(--red)}.btn-reject:hover{background:var(--red);color:white}
    .btn-view{background:#F0F4F8;color:var(--text-mid)}.btn-view:hover{background:#E5EAF0}
    .btn-edit{background:var(--teal-pale);color:var(--teal)}.btn-edit:hover{background:var(--teal);color:white}
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
    .commissie-cell{display:flex;align-items:center;gap:6px}
    .commissie-input{width:60px;padding:4px 8px;border:1.5px solid var(--green-main);border-radius:6px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:700;color:var(--green-dark)}
    .pw-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F0F4F8}
    .pw-card{background:white;border-radius:20px;padding:48px;max-width:400px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}
    .pw-card .icon{font-size:48px;margin-bottom:16px}
    .pw-card h2{font-size:24px;color:var(--green-dark);margin-bottom:8px}
    .pw-card p{font-size:14px;color:var(--text-mid);margin-bottom:24px;line-height:1.5}
    .pw-input{width:100%;padding:14px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:15px;outline:none;text-align:center;letter-spacing:2px;transition:all .2s;margin-bottom:12px}
    .pw-input:focus{border-color:var(--green-main)}
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
          <input className={`pw-input ${pwError ? 'error' : ''}`} type="password" placeholder="••••••••••••" value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false) }}
            onKeyDown={e => e.key === 'Enter' && handlePasswordCheck()} autoFocus />
          <button className="pw-btn" onClick={handlePasswordCheck}>Inloggen →</button>
        </div>
      </div>
    </>
  )

  const tabTitles: Record<Tab, { title: string; desc: string }> = {
    dashboard: { title: 'Dashboard', desc: 'Overzicht van alle activiteit op Kwispelclub' },
    kapsalons: { title: 'Kapsalons', desc: `${stats.kapsalons} geregistreerde salons` },
    verkopers: { title: 'Verkopers', desc: `${stats.verkopers} verkopers` },
    academy: { title: 'Academy Trainers', desc: `${academyTrainers.length} trainer aanvragen` },
    gebruikers: { title: 'Gebruikers', desc: `${stats.gebruikers} geregistreerde accounts` },
    listings: { title: '2de Hands Listings', desc: `${stats.listings} advertenties` },
    bestellingen: { title: 'Bestellingen', desc: `${stats.bestellingen} bestellingen` },
    team: { title: 'Team', desc: `${teamleden.length} teamleden` },
    instellingen: { title: 'Site Instellingen', desc: 'Beheer demo-data en site-instellingen' },
  }

  const totalPending = stats.pending + stats.verkopersPending

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
              ['dashboard', '📊', 'Dashboard', totalPending > 0 ? totalPending : null],
              ['kapsalons', '✂️', 'Kapsalons', stats.pending > 0 ? stats.pending : null],
              ['verkopers', '🏪', 'Verkopers', stats.verkopersPending > 0 ? stats.verkopersPending : null],
              ['academy', '🎓', 'Academy', academyTrainers.filter((x:any) => x.status === 'in_afwachting').length || null],
              ['team', '👥', 'Team', null],
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
                {totalPending > 0 && (
                  <div className="pending-alert">
                    ⚠️ Er {totalPending === 1 ? 'is' : 'zijn'} <strong>{totalPending} aanvraag{totalPending !== 1 ? 'en' : ''}</strong> in afwachting.
                    {stats.pending > 0 && <a onClick={() => setTab('kapsalons')} style={{ marginLeft: 8 }}>Kapsalons ({stats.pending}) →</a>}
                    {stats.verkopersPending > 0 && <a onClick={() => setTab('verkopers')} style={{ marginLeft: 8 }}>Verkopers ({stats.verkopersPending}) →</a>}
                  </div>
                )}
                <div className="stats-grid">
                  {[
                    { icon: '👥', val: stats.gebruikers, label: 'Gebruikers', cls: 'highlight' },
                    { icon: '🏪', val: stats.verkopers, label: 'Verkopers', cls: '' },
                    { icon: '✂️', val: stats.kapsalons, label: 'Kapsalons', cls: '' },
                    { icon: '♻️', val: stats.listings, label: '2de Hands', cls: '' },
                    { icon: '⏳', val: totalPending, label: 'In afwachting', cls: totalPending > 0 ? 'warning' : '' },
                  ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-val">{s.val}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recente verkoper aanvragen */}
                {stats.verkopersPending > 0 && (
                  <div className="section-card">
                    <div className="section-card-header">
                      <div><h2>🏪 Verkoper Aanvragen</h2><p>Wachten op goedkeuring</p></div>
                    </div>
                    <table className="table">
                      <thead><tr><th>Shop</th><th>Naam</th><th>Categorieën</th><th>Datum</th><th>Actie</th></tr></thead>
                      <tbody>
                        {verkopers.filter(v => v.status === 'in_afwachting').slice(0, 5).map(v => (
                          <tr key={v.id}>
                            <td><strong>{v.shop_naam}</strong><div style={{ fontSize: 11, color: 'var(--text-light)' }}>/{v.slug}</div></td>
                            <td>{v.profiles?.first_name} {v.profiles?.last_name}</td>
                            <td style={{ fontSize: 12 }}>{v.categorieen?.slice(0, 2).join(', ') || '—'}</td>
                            <td>{formatDate(v.created_at)}</td>
                            <td>
                              <div className="action-btns">
                                <button className="btn-sm btn-approve" onClick={() => approveVerkoper(v.id)}>✓ Goedkeuren</button>
                                <button className="btn-sm btn-reject" onClick={() => rejectVerkoper(v.id)}>✗ Weigeren</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="section-card">
                  <div className="section-card-header">
                    <div><h2>Recente Kapsalon Aanmeldingen</h2></div>
                  </div>
                  {kapsalons.filter(k => !k.geverifieerd).length === 0 ? (
                    <div className="empty-state"><div className="ei">✂️</div><p>Geen openstaande aanmeldingen</p></div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Naam</th><th>Locatie</th><th>Datum</th><th>Status</th><th>Actie</th></tr></thead>
                      <tbody>
                        {kapsalons.filter(k => !k.geverifieerd).slice(0, 5).map(k => (
                          <tr key={k.id}>
                            <td><strong>{k.naam}</strong></td>
                            <td>{k.locatie || k.stad || '—'}</td>
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
              </>
            )}

            {/* VERKOPERS */}
            {tab === 'verkopers' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>Alle Verkopers</h2><p>{verkopers.length} aanvragen / shops</p></div>
                  <a href="/word-verkoper" target="_blank" style={{ fontSize: 13, color: 'var(--green-main)', fontWeight: 700, textDecoration: 'none' }}>+ Aanmeldpagina bekijken</a>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : verkopers.length === 0 ? (
                  <div className="empty-state"><div className="ei">🏪</div><p>Nog geen verkoper aanvragen</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Shop</th><th>Eigenaar</th><th>Commissie %</th><th>Status</th><th>Datum</th><th>Actie</th></tr></thead>
                    <tbody>
                      {verkopers.map(v => (
                        <tr key={v.id}>
                          <td>
                            <strong>{v.shop_naam}</strong>
                            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>kwispelclub.be/winkel/{v.slug}</div>
                          </td>
                          <td>
                            <div>{v.profiles?.first_name} {v.profiles?.last_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{v.profiles?.email}</div>
                          </td>
                          <td>
                            {editCommissie?.id === v.id ? (
                              <div className="commissie-cell">
                                <input className="commissie-input" type="number" min="0" max="50" step="0.5"
                                  value={editCommissie?.val ?? ''}
                                  onChange={e => setEditCommissie({ id: v.id, val: e.target.value })} />
                                <span>%</span>
                                <button className="btn-sm btn-approve" onClick={() => editCommissie && updateCommissie(v.id, editCommissie.val)}>✓</button>
                                <button className="btn-sm" onClick={() => setEditCommissie(null)} style={{ background: '#F0F4F8' }}>✗</button>
                              </div>
                            ) : (
                              <div className="commissie-cell">
                                <strong style={{ fontFamily: 'Fredoka, sans-serif', color: 'var(--teal)' }}>{v.commissie_pct}%</strong>
                                <button className="btn-sm btn-edit" onClick={() => setEditCommissie({ id: v.id, val: String(v.commissie_pct) })}>✏️</button>
                              </div>
                            )}
                          </td>
                          <td>
                            {v.status === 'actief' ? <span className="badge badge-green">✓ Actief</span>
                              : v.status === 'in_afwachting' ? <span className="badge badge-orange">⏳ In afwachting</span>
                              : v.status === 'geweigerd' ? <span className="badge badge-red">✗ Geweigerd</span>
                              : <span className="badge badge-gray">{v.status}</span>}
                          </td>
                          <td>{formatDate(v.created_at)}</td>
                          <td>
                            <div className="action-btns">
                              {v.status === 'in_afwachting' && <>
                                <button className="btn-sm btn-approve" onClick={() => approveVerkoper(v.id)}>✓ Goedkeuren</button>
                                <button className="btn-sm btn-reject" onClick={() => rejectVerkoper(v.id)}>✗ Weigeren</button>
                              </>}
                              {v.status === 'actief' && <>
                                <a href={`/winkel/${v.slug}`} target="_blank" className="btn-sm btn-view" style={{ textDecoration: 'none' }}>🔗 Shop</a>
                                <button className="btn-sm btn-reject" onClick={() => rejectVerkoper(v.id)}>Pauzeren</button>
                              </>}
                              {v.status === 'geweigerd' && <button className="btn-sm btn-approve" onClick={() => approveVerkoper(v.id)}>Heractiveren</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ACADEMY */}
            {tab === 'academy' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div>
                    <h2>Academy Trainers</h2>
                    <p>Max. 2 actieve trainers — {academyTrainers.filter(t => t.status === 'actief').length}/2 actief</p>
                  </div>
                  <a href="/academy-verkoper" target="_blank" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 700, textDecoration: 'none' }}>+ Aanmeldpagina</a>
                </div>

                {/* Slots indicator */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: 'var(--teal-pale)', borderRadius: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Slots:</span>
                  {[0, 1].map(i => {
                    const actief = academyTrainers.filter(t => t.status === 'actief')
                    const trainer = actief[i]
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50, background: trainer ? 'var(--teal)' : 'white', border: '2px solid var(--teal)', fontSize: 12, fontWeight: 700, color: trainer ? 'white' : 'var(--teal)' }}>
                        {trainer ? `✓ ${trainer.naam}` : `Slot ${i + 1} — Vrij`}
                      </div>
                    )
                  })}
                </div>

                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : academyTrainers.length === 0 ? (
                  <div className="empty-state"><div className="ei">🎓</div><p>Nog geen trainer aanvragen</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Trainer</th><th>Specialisatie</th><th>Ervaring</th><th>Status</th><th>Volgorde</th><th>Datum</th><th>Actie</th></tr></thead>
                    <tbody>
                      {academyTrainers.map(t => (
                        <tr key={t.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {t.foto_url
                                ? <img src={t.foto_url} alt={t.naam} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👩‍🏫</div>}
                              <div>
                                <strong>{t.naam}</strong>
                                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{t.profiles?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{t.specialisatie || '—'}</td>
                          <td>{t.ervaring_jaren ? `${t.ervaring_jaren} jaar` : '—'}</td>
                          <td>
                            {t.status === 'actief' ? <span className="badge badge-teal">✓ Actief</span>
                              : t.status === 'in_afwachting' ? <span className="badge badge-orange">⏳ In afwachting</span>
                              : t.status === 'gepauzeerd' ? <span className="badge badge-gray">⏸ Gepauzeerd</span>
                              : <span className="badge badge-red">✗ Geweigerd</span>}
                          </td>
                          <td>
                            <select
                              value={t.volgorde || 0}
                              onChange={e => updateTrainerVolgorde(t.id, parseInt(e.target.value))}
                              style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid #E5EAF0', fontFamily: 'Nunito, sans-serif', fontSize: 13 }}
                            >
                              {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td>{formatDate(t.created_at)}</td>
                          <td>
                            <div className="action-btns">
                              {t.status === 'in_afwachting' && <>
                                <button className="btn-sm btn-approve" onClick={() => approveTrainer(t.id)}>✓ Goedkeuren</button>
                                <button className="btn-sm btn-reject" onClick={() => rejectTrainer(t.id)}>✗ Weigeren</button>
                              </>}
                              {t.status === 'actief' && <button className="btn-sm btn-reject" onClick={() => pauseTrainer(t.id)}>⏸ Pauzeren</button>}
                              {(t.status === 'gepauzeerd' || t.status === 'geweigerd') && <button className="btn-sm btn-approve" onClick={() => approveTrainer(t.id)}>▶ Activeren</button>}
                              {t.website && <a href={t.website} target="_blank" className="btn-sm btn-view" style={{ textDecoration: 'none' }}>🌐</a>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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
                    <thead><tr><th>Naam</th><th>Locatie</th><th>E-mail</th><th>Status</th><th>Actie</th></tr></thead>
                    <tbody>
                      {kapsalons.map(k => (
                        <tr key={k.id}>
                          <td><strong>{k.naam}</strong></td>
                          <td>{k.locatie || k.stad || '—'}</td>
                          <td>{k.email || '—'}</td>
                          <td>
                            {k.geverifieerd ? <span className="badge badge-green">✓ Geverifieerd</span>
                              : k.actief === false ? <span className="badge badge-red">✗ Geweigerd</span>
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
                  <div><h2>Alle Gebruikers</h2><p>{gebruikers.length} accounts</p></div>
                </div>
                {dataLoading ? <div className="loading-state">⏳ Laden...</div> : gebruikers.length === 0 ? (
                  <div className="empty-state"><div className="ei">👥</div><p>Geen gebruikers gevonden</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Naam</th><th>Rol</th><th>Locatie</th><th>Bedrijf</th><th>Datum</th></tr></thead>
                    <tbody>
                      {gebruikers.map(u => (
                        <tr key={u.id}>
                          <td><strong>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</strong></td>
                          <td><span className={`role-pill role-${u.role || 'koper'}`}>{u.role || 'koper'}</span></td>
                          <td>{u.location || '—'}</td>
                          <td>{u.company_name || '—'}</td>
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
                  <div className="empty-state"><div className="ei">♻️</div><p>Nog geen listings</p></div>
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
                              : l.status === 'verkocht' ? <span className="badge badge-teal">Verkocht</span>
                              : <span className="badge badge-gray">{l.status}</span>}
                          </td>
                          <td>{l.created_at ? formatDate(l.created_at) : '—'}</td>
                          <td>
                            <div className="action-btns">
                              {l.status !== 'actief' && <button className="btn-sm btn-approve" onClick={() => approveListing(l.id)}>Activeren</button>}
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
                  <div className="empty-state"><div className="ei">📦</div><p>Nog geen bestellingen</p></div>
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
                              : <span className="badge badge-orange">In behandeling</span>}
                          </td>
                          <td>{b.created_at ? formatDate(b.created_at) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TEAM */}
            {tab === 'team' && (
              <div className="section-card">
                <div className="section-card-header">
                  <div><h2>Team Beheer</h2><p>Beheer de teamleden op de Over Ons pagina</p></div>
                  <button className="btn-refresh" style={{ background: 'var(--green-main)', color: 'white', border: 'none' }}
                    onClick={() => setEditTeamlid({ naam: '', rol: '', bio: '', foto_url: '', volgorde: teamleden.length + 1, actief: true, is_placeholder: false })}>
                    + Teamlid Toevoegen
                  </button>
                </div>

                {editTeamlid && (
                  <div style={{ background: 'var(--green-pale)', borderRadius: 12, padding: 20, marginBottom: 20, border: '2px solid var(--green-main)' }}>
                    <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, marginBottom: 16, color: 'var(--green-dark)' }}>
                      {editTeamlid.id ? 'Teamlid Bewerken' : 'Nieuw Teamlid'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Naam *</label>
                        <input value={editTeamlid.naam} onChange={e => setEditTeamlid((p: any) => ({ ...p, naam: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', border: '2px solid var(--cream-dark)', borderRadius: 8, fontFamily: 'Nunito, sans-serif', fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Rol *</label>
                        <input value={editTeamlid.rol} onChange={e => setEditTeamlid((p: any) => ({ ...p, rol: e.target.value }))}
                          placeholder="Bijv. Oprichter & Developer"
                          style={{ width: '100%', padding: '9px 12px', border: '2px solid var(--cream-dark)', borderRadius: 8, fontFamily: 'Nunito, sans-serif', fontSize: 13 }} />
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Bio</label>
                      <textarea value={editTeamlid.bio} onChange={e => setEditTeamlid((p: any) => ({ ...p, bio: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', border: '2px solid var(--cream-dark)', borderRadius: 8, fontFamily: 'Nunito, sans-serif', fontSize: 13, minHeight: 70, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Foto</label>
                        {editTeamlid.foto_url && (
                          <img src={editTeamlid.foto_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, display: 'block' }} />
                        )}
                        <label style={{ display: 'block', padding: '8px 12px', border: '2px dashed var(--cream-dark)', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--text-mid)' }}>
                          {uploadingTeamFoto ? '⏳ Uploaden...' : editTeamlid.foto_url ? '🔄 Foto wijzigen' : '📸 Foto uploaden'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleTeamFotoUpload} />
                        </label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Volgorde</label>
                          <input type="number" value={editTeamlid.volgorde} onChange={e => setEditTeamlid((p: any) => ({ ...p, volgorde: parseInt(e.target.value) }))}
                            style={{ width: '100%', padding: '9px 12px', border: '2px solid var(--cream-dark)', borderRadius: 8, fontFamily: 'Nunito, sans-serif', fontSize: 13 }} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          <input type="checkbox" checked={editTeamlid.is_placeholder} onChange={e => setEditTeamlid((p: any) => ({ ...p, is_placeholder: e.target.checked })) } />
                          Open positie (grijs tonen)
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button className="btn-sm btn-approve" onClick={saveTeamlid} disabled={teamSaving}>
                        {teamSaving ? '...' : '✓ Opslaan'}
                      </button>
                      <button className="btn-sm btn-view" onClick={() => setEditTeamlid(null)}>Annuleren</button>
                    </div>
                  </div>
                )}

                {teamleden.length === 0 ? (
                  <div className="empty-state"><div className="ei">👥</div><p>Nog geen teamleden</p></div>
                ) : (
                  <table className="table">
                    <thead><tr><th>Foto</th><th>Naam</th><th>Rol</th><th>Volgorde</th><th>Status</th><th>Actie</th></tr></thead>
                    <tbody>
                      {teamleden.map(lid => (
                        <tr key={lid.id}>
                          <td>
                            {lid.foto_url
                              ? <img src={lid.foto_url} alt={lid.naam} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>}
                          </td>
                          <td><strong>{lid.naam}</strong></td>
                          <td style={{ fontSize: 13, color: 'var(--orange-main)', fontWeight: 700 }}>{lid.rol}</td>
                          <td>{lid.volgorde}</td>
                          <td>
                            {lid.is_placeholder
                              ? <span className="badge badge-gray">Open positie</span>
                              : lid.actief
                                ? <span className="badge badge-green">Actief</span>
                                : <span className="badge badge-red">Inactief</span>}
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="btn-sm btn-edit" onClick={() => setEditTeamlid({ ...lid })}>✏️ Bewerken</button>
                              <button className="btn-sm btn-reject" onClick={() => deleteTeamlid(lid.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INSTELLINGEN */}
            {tab === 'instellingen' && (
              <SettingsPanel siteSettings={siteSettings} toggleSetting={toggleSetting} settingsSaved={settingsSaved} />
            )}

          </div>
        </main>
      </div>
    </>
  )
}
