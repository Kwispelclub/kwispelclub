'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Panel = 'overview' | 'pets' | 'orders' | 'favorites' | 'listings' | 'bookings' | 'academy' | 'settings'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel>('overview')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState('Opslaan')

  // Settings form state
  const [settingsFirstName, setSettingsFirstName] = useState('')
  const [settingsLastName, setSettingsLastName] = useState('')
  const [settingsEmail, setSettingsEmail] = useState('')
  const [settingsTel, setSettingsTel] = useState('')
  const [settingsLocatie, setSettingsLocatie] = useState('')

  // Notification toggles
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifNieuws, setNotifNieuws] = useState(true)
  const [notifVax, setNotifVax] = useState(true)
  const [notif2dehands, setNotif2dehands] = useState(true)
  const [privProfiel, setPrivProfiel] = useState(true)
  const [privLocatie, setPrivLocatie] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const m = user.user_metadata
      setSettingsFirstName(m?.first_name || '')
      setSettingsLastName(m?.last_name || '')
      setSettingsEmail(user.email || '')
      setSettingsTel(m?.telefoon || '')
      setSettingsLocatie(m?.locatie || '')
      setLoading(false)
    })
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 10))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveSettings = async () => {
    setSaveMsg('Bezig...')
    await supabase.auth.updateUser({
      data: {
        first_name: settingsFirstName,
        last_name: settingsLastName,
        full_name: `${settingsFirstName} ${settingsLastName}`,
        telefoon: settingsTel,
        locatie: settingsLocatie,
      }
    })
    setSaveMsg('✓ Opgeslagen!')
    setTimeout(() => setSaveMsg('Opslaan'), 2500)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF9F0' }}>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: '#4A7C3F' }}>🐾 Even laden...</div>
    </div>
  )

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Gebruiker'
  const lastName = user?.user_metadata?.last_name || ''
  const fullName = user?.user_metadata?.full_name || `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0] || '?'}${lastName[0] || ''}`.toUpperCase()
  const role = user?.user_metadata?.role || 'koper'
  const roleLabel = role === 'koper' ? 'Koper' : role === 'verkoper' ? 'Verkoper' : 'Kapsalon'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' }) : ''

  const navItems: { id: Panel; icon: string; label: string; badge?: number }[] = [
    { id: 'overview', icon: '📊', label: 'Overzicht' },
    { id: 'pets', icon: '🐾', label: 'Mijn Huisdieren' },
    { id: 'orders', icon: '📦', label: 'Bestellingen', badge: 3 },
    { id: 'favorites', icon: '❤️', label: 'Favorieten', badge: 4 },
    { id: 'listings', icon: '♻️', label: 'Mijn 2de Hands' },
    { id: 'bookings', icon: '✂️', label: 'Afspraken' },
    { id: 'academy', icon: '🎓', label: 'Academy Voortgang' },
    { id: 'settings', icon: '⚙️', label: 'Instellingen' },
  ]

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E;--teal:#2A9D8F;--teal-pale:#E0F5F1}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .navbar{position:sticky;top:0;z-index:100;background:rgba(255,249,240,0.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:all .3s}
        .navbar.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}
        .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:28px}
        .logo-paw{width:42px;height:42px;border-radius:12px;background:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:22px}
        .brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--green-dark)}
        .nav-links{display:flex;gap:2px;list-style:none}
        .nav-links a{text-decoration:none;color:var(--text-dark);font-weight:600;font-size:14px;padding:8px 16px;border-radius:10px;transition:all .2s}
        .nav-links a:hover{background:var(--green-pale);color:var(--green-dark)}
        .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .user-pill{display:flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:50px;background:var(--white);border:2px solid var(--cream-dark);cursor:pointer}
        .user-pill .ua{width:32px;height:32px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800}
        .user-pill span{font-size:13px;font-weight:700}
        .btn-signout{padding:8px 18px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;cursor:pointer;color:var(--text-mid);transition:all .2s}
        .btn-signout:hover{border-color:var(--red);color:var(--red)}
        .account-layout{max-width:1320px;margin:0 auto;padding:32px clamp(16px,4vw,48px);display:grid;grid-template-columns:260px 1fr;gap:28px;min-height:calc(100vh - 72px)}
        .account-sidebar{display:flex;flex-direction:column;gap:8px}
        .profile-card{background:var(--white);border-radius:20px;padding:28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);margin-bottom:8px}
        .profile-avatar{width:80px;height:80px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;margin:0 auto 14px;border:4px solid var(--green-pale)}
        .profile-name{font-size:18px;font-weight:700;margin-bottom:6px}
        .profile-role{font-size:12px;padding:3px 12px;border-radius:50px;display:inline-block;font-weight:700;color:var(--green-dark);background:var(--green-pale)}
        .profile-since{font-size:12px;color:var(--text-light);margin-top:8px}
        .sidebar-nav a{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;text-decoration:none;color:var(--text-mid);font-weight:600;font-size:14px;transition:all .15s;cursor:pointer}
        .sidebar-nav a:hover{background:var(--cream);color:var(--text-dark)}
        .sidebar-nav a.active{background:var(--green-pale);color:var(--green-dark)}
        .nav-icon{width:24px;text-align:center;font-size:16px}
        .nav-badge{margin-left:auto;background:var(--orange-main);color:white;font-size:10px;font-weight:800;padding:2px 8px;border-radius:50px}
        .account-main{display:flex;flex-direction:column;gap:24px}
        .panel{display:none}
        .panel.active{display:block;animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .panel-header h2{font-size:24px;color:var(--green-dark)}
        .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .2s;text-decoration:none}
        .btn-green{background:var(--green-main);color:white;box-shadow:0 2px 12px rgba(74,124,63,.2)}
        .btn-green:hover{background:var(--green-dark);transform:translateY(-2px)}
        .btn-outline{background:transparent;border:2px solid var(--cream-dark);color:var(--text-mid)}
        .btn-outline:hover{border-color:var(--green-main);color:var(--green-dark)}
        .card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid transparent;transition:all .2s}
        .card:hover{border-color:var(--green-pale);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .pets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
        .pet-card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center;transition:all .3s;cursor:pointer;border:2px solid transparent}
        .pet-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08);border-color:var(--green-pale)}
        .pet-avatar{width:72px;height:72px;border-radius:50%;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 14px;border:3px solid var(--green-pale)}
        .pet-name{font-size:18px;font-weight:700;margin-bottom:4px}
        .pet-breed{font-size:13px;color:var(--text-light);margin-bottom:12px}
        .pet-details{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left}
        .pet-detail{padding:8px 12px;background:var(--cream);border-radius:8px;font-size:12px}
        .pet-detail .dl{color:var(--text-light);font-weight:700;display:block;margin-bottom:2px;font-size:11px;text-transform:uppercase;letter-spacing:.3px}
        .pet-detail .dv{font-weight:700;color:var(--text-dark)}
        .add-pet-card{border:2px dashed var(--cream-dark);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:200px;color:var(--text-light);cursor:pointer;background:var(--white);border-radius:20px;transition:all .2s}
        .add-pet-card:hover{border-color:var(--green-main);color:var(--green-dark);background:var(--green-pale)}
        .order-card{display:flex;align-items:center;gap:16px;padding:20px;margin-bottom:12px}
        .order-icon{width:52px;height:52px;border-radius:14px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
        .order-info{flex:1}
        .order-title{font-weight:700;font-size:15px;margin-bottom:2px}
        .order-meta{font-size:13px;color:var(--text-light)}
        .order-status{padding:5px 14px;border-radius:50px;font-size:11px;font-weight:700;text-transform:uppercase;flex-shrink:0}
        .status-delivered{background:var(--green-pale);color:var(--green-dark)}
        .status-processing{background:var(--orange-pale);color:var(--orange-main)}
        .order-price{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--green-dark);flex-shrink:0;margin-left:8px}
        .fav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
        .fav-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer}
        .fav-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .fav-img{height:140px;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:48px;position:relative}
        .fav-remove{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--red)}
        .fav-info{padding:14px}
        .fav-name{font-weight:700;font-size:14px;margin-bottom:4px}
        .fav-price{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;color:var(--green-dark)}
        .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .settings-section h3{font-size:17px;color:var(--green-dark);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--cream-dark)}
        .setting-field{margin-bottom:16px}
        .setting-field label{display:block;font-size:13px;font-weight:700;color:var(--text-mid);margin-bottom:6px}
        .setting-field input{width:100%;padding:11px 14px;border:2px solid var(--cream-dark);border-radius:10px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .setting-field input:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.1)}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--cream-dark)}
        .toggle-row:last-child{border-bottom:none}
        .toggle-label{font-size:14px;font-weight:600}
        .toggle-desc{font-size:12px;color:var(--text-light)}
        .toggle{width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;border:none}
        .toggle-off{background:var(--cream-dark)}
        .toggle-on{background:var(--green-main)}
        .knob{width:20px;height:20px;border-radius:50%;background:white;position:absolute;top:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .listing-mini{display:flex;align-items:center;gap:14px;padding:16px}
        .listing-mini-img{width:56px;height:56px;border-radius:10px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
        .listing-mini-info{flex:1}
        .listing-mini-title{font-weight:700;font-size:14px}
        .listing-mini-price{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;color:var(--teal)}
        .listing-mini-status{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700}
        .ls-actief{background:var(--green-pale);color:var(--green-dark)}
        .vax-timeline{display:flex;flex-direction:column;gap:0}
        .vax-item{display:flex;align-items:flex-start;gap:14px;padding:14px 0;position:relative}
        .vax-item:not(:last-child)::after{content:'';position:absolute;left:17px;top:42px;bottom:0;width:2px;background:var(--cream-dark)}
        .vax-dot{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;z-index:1}
        .vax-dot.done{background:var(--green-pale);color:var(--green-dark)}
        .vax-dot.upcoming{background:var(--orange-pale);color:var(--orange-main)}
        .vax-info{flex:1}
        .vax-name{font-weight:700;font-size:14px}
        .vax-date{font-size:12px;color:var(--text-light)}
        footer{background:var(--green-dark);color:white;margin-top:48px}
        .footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:900px){
          .account-layout{grid-template-columns:1fr}
          .account-sidebar{flex-direction:row;overflow-x:auto;gap:4px;padding-bottom:8px}
          .profile-card{display:none}
          .sidebar-nav{display:flex;gap:4px}
          .sidebar-nav a{white-space:nowrap;padding:10px 14px;font-size:13px}
          .settings-grid{grid-template-columns:1fr}
        }
        @media(max-width:480px){.pets-grid{grid-template-columns:1fr}.fav-grid{grid-template-columns:1fr}}
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo"><div className="logo-paw">🐾</div><span className="brand">Kwispelclub</span></a>
          <ul className="nav-links">
            <li><a href="/#shop">Shop</a></li>
            <li><a href="/#academy">Academy</a></li>
            <li><a href="/kapsalons">Kapsalons</a></li>
            <li><a href="/2dehands">2de Hands</a></li>
          </ul>
          <div className="nav-right">
            <div className="user-pill"><div className="ua">{initials}</div><span>{firstName}</span></div>
            <button className="btn-signout" onClick={handleSignOut}>Uitloggen</button>
          </div>
        </div>
      </nav>

      <div className="account-layout">
        {/* SIDEBAR */}
        <div className="account-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{fullName}</div>
            <div className="profile-role">{roleLabel}</div>
            {memberSince && <div className="profile-since">Lid sinds {memberSince}</div>}
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <a key={item.id} className={activePanel === item.id ? 'active' : ''} onClick={() => setActivePanel(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </a>
            ))}
          </nav>
        </div>

        {/* MAIN */}
        <div className="account-main">

          {/* OVERVIEW */}
          <div className={`panel ${activePanel === 'overview' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Welkom terug, {firstName}! 👋</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              {[['🐕', '2', 'Huisdieren'], ['📦', '4', 'Bestellingen'], ['❤️', '4', 'Favorieten'], ['🎓', '35%', 'Academy']].map(([icon, val, label]) => (
                <div key={label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--green-dark)' }}>🐾 Mijn Huisdieren</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['🐕', 'Max', 'Labrador · 3 jaar'], ['🐱', 'Luna', 'Maine Coon · 1 jaar']].map(([emoji, name, desc]) => (
                    <div key={name} style={{ flex: 1, padding: 14, background: 'var(--cream)', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--green-dark)' }}>📅 Komende Afspraken</h3>
                <div style={{ padding: 14, background: 'var(--green-pale)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>✂️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Happy Paws Grooming</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Dinsdag 22 april · 10:00</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Volledig trimmen — Max</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PETS */}
          <div className={`panel ${activePanel === 'pets' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Mijn Huisdieren 🐾</h2><button className="btn btn-green">+ Huisdier Toevoegen</button></div>
            <div className="pets-grid">
              <div className="pet-card">
                <div className="pet-avatar">🐕</div>
                <div className="pet-name">Max</div>
                <div className="pet-breed">Labrador Retriever</div>
                <div className="pet-details">
                  {[['Leeftijd', '3 jaar'], ['Gewicht', '32 kg'], ['Geslacht', 'Reu'], ['Gechipt', '✅ Ja']].map(([l, v]) => (
                    <div key={l} className="pet-detail"><span className="dl">{l}</span><span className="dv">{v}</span></div>
                  ))}
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--cream-dark)' }}>
                  <h4 style={{ fontSize: 13, color: 'var(--green-dark)', marginBottom: 10 }}>💉 Vaccinaties</h4>
                  <div className="vax-timeline">
                    <div className="vax-item"><div className="vax-dot done">✓</div><div className="vax-info"><div className="vax-name">DHP + Leptospirose</div><div className="vax-date">15 jan 2026 — Dr. Janssen</div></div></div>
                    <div className="vax-item"><div className="vax-dot done">✓</div><div className="vax-info"><div className="vax-name">Rabiës</div><div className="vax-date">22 jan 2026 — Dr. Janssen</div></div></div>
                    <div className="vax-item"><div className="vax-dot upcoming">📅</div><div className="vax-info"><div className="vax-name">Jaarlijkse booster DHP</div><div className="vax-date">15 jan 2027 — Gepland</div></div></div>
                  </div>
                </div>
              </div>
              <div className="pet-card">
                <div className="pet-avatar">🐱</div>
                <div className="pet-name">Luna</div>
                <div className="pet-breed">Maine Coon</div>
                <div className="pet-details">
                  {[['Leeftijd', '1 jaar'], ['Gewicht', '5,2 kg'], ['Geslacht', 'Poes'], ['Gechipt', '✅ Ja']].map(([l, v]) => (
                    <div key={l} className="pet-detail"><span className="dl">{l}</span><span className="dv">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="add-pet-card">
                <div style={{ fontSize: 36, opacity: 0.4 }}>+</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Huisdier Toevoegen</div>
              </div>
            </div>
          </div>

          {/* ORDERS */}
          <div className={`panel ${activePanel === 'orders' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Bestellingen 📦</h2></div>
            <div style={{ background: 'var(--orange-pale)', border: '2px dashed var(--orange-main)', borderRadius: 12, padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#5C3D2E', marginBottom: 16 }}>
              ⚠️ <span style={{ color: 'var(--orange-main)' }}>Demo</span> — De webshop is nog in opbouw. Deze bestellingen zijn ter illustratie.
            </div>
            {[
              ['🦴', 'Biologische Kip & Rijst Brokken', '#KC-2026-001 · 18 jan 2026', 'Geleverd', 'delivered', '€34,95'],
              ['🧶', 'Interactief Kattenspeeltje Set', '#KC-2026-008 · 12 feb 2026', 'Geleverd', 'delivered', '€19,50'],
              ['🐕', 'Anti-trek Tuigje + Kattenkruid Mix', '#KC-2026-015 · 3 mrt 2026', 'Geleverd', 'delivered', '€40,94'],
              ['📦', 'Senior Wellness Pakket', '#KC-2026-042 · 8 apr 2026', 'In behandeling', 'processing', '€54,95'],
            ].map(([icon, title, meta, status, statusKey, price]) => (
              <div key={meta} className="card order-card">
                <div className="order-icon">{icon}</div>
                <div className="order-info"><div className="order-title">{title}</div><div className="order-meta">Bestelling {meta}</div></div>
                <span className={`order-status status-${statusKey}`}>{status}</span>
                <div className="order-price">{price}</div>
              </div>
            ))}
          </div>

          {/* FAVORITES */}
          <div className={`panel ${activePanel === 'favorites' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Favorieten ❤️</h2></div>
            <div className="fav-grid">
              {[['🦴', 'Premium Kip & Rijst', '€34,95'], ['🛁', 'Hypoallergeen Shampoo', '€16,50'], ['🐕', 'Anti-trek Tuigje L', '€27,99'], ['🐱', 'Krabpaal Deluxe XL', '€89,95']].map(([emoji, name, price]) => (
                <div key={name} className="fav-card">
                  <div className="fav-img">{emoji}<button className="fav-remove">✕</button></div>
                  <div className="fav-info"><div className="fav-name">{name}</div><div className="fav-price">{price}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* LISTINGS */}
          <div className={`panel ${activePanel === 'listings' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Mijn 2de Hands ♻️</h2><a href="/2dehands" className="btn btn-green">+ Nieuw Plaatsen</a></div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}><span style={{ fontSize: 24 }}>✌️</span><div><div style={{ fontWeight: 700, fontSize: 15 }}>1 / 2 slots</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>Nog 1 advertentie beschikbaar</div></div></div>
              <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}><span style={{ fontSize: 24 }}>🧾</span><div><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green-main)' }}>✓ In orde</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>Aankoop in laatste 3 maanden</div></div></div>
            </div>
            <div className="card listing-mini">
              <div className="listing-mini-img">🦴</div>
              <div className="listing-mini-info"><div className="listing-mini-title">Kong Hondenbench XL</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>Geplaatst op 12 apr 2026</div></div>
              <div className="listing-mini-price">€45,00</div>
              <span className="listing-mini-status ls-actief">Actief</span>
            </div>
          </div>

          {/* BOOKINGS */}
          <div className={`panel ${activePanel === 'bookings' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Afspraken ✂️</h2><a href="/kapsalons" className="btn btn-green">+ Nieuwe Afspraak</a></div>
            {[
              { title: 'Happy Paws Grooming — Volledig Trimmen', date: '📅 Dinsdag 22 april 2026 · 10:00 — 11:00', extra: '🐕 Max (Labrador) · 📍 Bree', status: 'Gepland', statusKey: 'processing', bg: 'var(--green-pale)' },
              { title: 'Happy Paws Grooming — Nagels Knippen', date: '📅 Maandag 10 maart 2026 · 14:30', extra: '🐕 Max · 📍 Bree', status: 'Voltooid', statusKey: 'delivered', bg: 'var(--cream)' },
            ].map(b => (
              <div key={b.title} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>✂️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{b.date}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{b.extra}</div>
                  </div>
                  <span className={`order-status status-${b.statusKey}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ACADEMY */}
          <div className={`panel ${activePanel === 'academy' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Academy Voortgang 🎓</h2></div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🐶</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 16 }}>Puppy Training Basics</div><div style={{ fontSize: 13, color: 'var(--text-light)' }}>8 modules · 24 lessen · Trainer Lisa</div></div>
                <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--green-dark)' }}>35%</span>
              </div>
              <div style={{ height: 8, background: 'var(--cream-dark)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '35%', background: 'linear-gradient(90deg,var(--green-main),var(--green-light))', borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-light)' }}>
                <span>8 / 24 lessen voltooid</span>
                <a href="/puppy-training" style={{ color: 'var(--green-main)', fontWeight: 700, textDecoration: 'none' }}>Verder leren →</a>
              </div>
            </div>
          </div>

          {/* SETTINGS */}
          <div className={`panel ${activePanel === 'settings' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Instellingen ⚙️</h2>
              <button className="btn btn-green" onClick={handleSaveSettings}>{saveMsg}</button>
            </div>
            <div className="settings-grid">
              <div className="card">
                <div className="settings-section">
                  <h3>👤 Profiel</h3>
                  <div className="setting-field"><label>Voornaam</label><input value={settingsFirstName} onChange={e => setSettingsFirstName(e.target.value)} /></div>
                  <div className="setting-field"><label>Achternaam</label><input value={settingsLastName} onChange={e => setSettingsLastName(e.target.value)} /></div>
                  <div className="setting-field"><label>E-mailadres</label><input type="email" value={settingsEmail} disabled style={{ opacity: 0.6 }} /></div>
                  <div className="setting-field"><label>Telefoon</label><input type="tel" value={settingsTel} onChange={e => setSettingsTel(e.target.value)} placeholder="+32 489 ..." /></div>
                  <div className="setting-field"><label>Locatie</label><input value={settingsLocatie} onChange={e => setSettingsLocatie(e.target.value)} placeholder="Bijv. Bree, Limburg" /></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="settings-section">
                    <h3>🔔 Notificaties</h3>
                    {[
                      ['E-mail notificaties', 'Bestellingen, updates, aanbiedingen', notifEmail, setNotifEmail],
                      ['Nieuwsbrief', 'Wekelijkse tips & aanbiedingen', notifNieuws, setNotifNieuws],
                      ['Vaccinatie herinneringen', 'Herinnering voor komende vaccinaties', notifVax, setNotifVax],
                      ['2de Hands berichten', 'Wanneer iemand reageert op je listing', notif2dehands, setNotif2dehands],
                    ].map(([label, desc, val, setter]) => (
                      <div key={label as string} className="toggle-row">
                        <div><div className="toggle-label">{label as string}</div><div className="toggle-desc">{desc as string}</div></div>
                        <button className={`toggle ${val ? 'toggle-on' : 'toggle-off'}`} onClick={() => (setter as Function)(!val)}>
                          <div className="knob" style={{ left: val ? 22 : 2 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="settings-section">
                    <h3>🔒 Privacy & Beveiliging</h3>
                    {[
                      ['Profiel zichtbaar', 'Andere gebruikers kunnen je profiel zien', privProfiel, setPrivProfiel],
                      ['Locatie tonen', 'Stad tonen op 2de hands listings', privLocatie, setPrivLocatie],
                    ].map(([label, desc, val, setter]) => (
                      <div key={label as string} className="toggle-row">
                        <div><div className="toggle-label">{label as string}</div><div className="toggle-desc">{desc as string}</div></div>
                        <button className={`toggle ${val ? 'toggle-on' : 'toggle-off'}`} onClick={() => (setter as Function)(!val)}>
                          <div className="knob" style={{ left: val ? 22 : 2 }} />
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 16 }}>
                      <a href="#" style={{ color: 'var(--green-main)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Wachtwoord wijzigen →</a>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <a href="#" style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Account verwijderen</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span>© 2026 Kwispelclub</span>
          <div><a href="/privacy">Privacy</a><a href="/privacy">Voorwaarden</a><a href="/">Home</a></div>
        </div>
      </footer>
    </>
  )
}
