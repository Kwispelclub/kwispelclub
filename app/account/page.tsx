'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Panel = 'overview' | 'pets' | 'orders' | 'favorites' | 'listings' | 'bookings' | 'academy' | 'settings'

function EmptyState({ icon, title, desc, cta, ctaHref, onCtaClick }: {
  icon: string; title: string; desc: string; cta?: string; ctaHref?: string; onCtaClick?: () => void
}) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6, marginBottom: cta ? 24 : 0 }}>{desc}</div>
      {cta && (
        <a href={ctaHref || '#'} onClick={onCtaClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '12px 28px', borderRadius: 50, background: 'var(--green-main)', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          {cta}
        </a>
      )}
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel>('overview')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState('Opslaan')

  const [settingsFirstName, setSettingsFirstName] = useState('')
  const [settingsLastName, setSettingsLastName] = useState('')
  const [settingsEmail, setSettingsEmail] = useState('')
  const [settingsTel, setSettingsTel] = useState('')
  const [settingsLocatie, setSettingsLocatie] = useState('')
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
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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
        full_name: `${settingsFirstName} ${settingsLastName}`.trim(),
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
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
    : ''

  const navItems: { id: Panel; icon: string; label: string }[] = [
    { id: 'overview',  icon: '📊', label: 'Overzicht' },
    { id: 'pets',      icon: '🐾', label: 'Mijn Huisdieren' },
    { id: 'orders',    icon: '📦', label: 'Bestellingen' },
    { id: 'favorites', icon: '❤️', label: 'Favorieten' },
    { id: 'listings',  icon: '♻️', label: 'Mijn 2de Hands' },
    { id: 'bookings',  icon: '✂️', label: 'Afspraken' },
    { id: 'academy',   icon: '🎓', label: 'Academy' },
    { id: 'settings',  icon: '⚙️', label: 'Instellingen' },
  ]

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .navbar{position:sticky;top:0;z-index:100;background:rgba(255,249,240,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:box-shadow .3s}
        .navbar.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}
        .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:28px}
        .logo-paw{width:42px;height:42px;border-radius:12px;background:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:22px}
        .brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--green-dark)}
        .nav-links{display:flex;gap:2px;list-style:none}
        .nav-links a{text-decoration:none;color:var(--text-dark);font-weight:600;font-size:14px;padding:8px 16px;border-radius:10px;transition:all .2s}
        .nav-links a:hover{background:var(--green-pale);color:var(--green-dark)}
        .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .user-pill{display:flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:50px;background:var(--white);border:2px solid var(--cream-dark)}
        .ua{width:32px;height:32px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800}
        .user-pill span{font-size:13px;font-weight:700}
        .btn-signout{padding:8px 18px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;cursor:pointer;color:var(--text-mid);transition:all .2s}
        .btn-signout:hover{border-color:var(--red);color:var(--red)}
        .account-layout{max-width:1320px;margin:0 auto;padding:32px clamp(16px,4vw,48px);display:grid;grid-template-columns:260px 1fr;gap:28px;min-height:calc(100vh - 120px)}
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
        .account-main{min-width:0}
        .panel{display:none}
        .panel.active{display:block;animation:fadeIn .25s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .panel-header h2{font-size:24px;color:var(--green-dark)}
        .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .2s;text-decoration:none}
        .btn-green{background:var(--green-main);color:white;box-shadow:0 2px 12px rgba(74,124,63,.2)}
        .btn-green:hover{background:var(--green-dark);transform:translateY(-2px)}
        .card{background:var(--white);border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .welcome-banner{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:20px;padding:32px;color:white;margin-bottom:24px;position:relative;overflow:hidden}
        .welcome-banner::after{content:'🐾';position:absolute;right:24px;bottom:-10px;font-size:90px;opacity:.1;pointer-events:none}
        .welcome-banner h2{font-size:26px;margin-bottom:8px}
        .welcome-banner p{font-size:14px;opacity:.85;max-width:420px;line-height:1.7}
        .welcome-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
        .wa-btn{padding:10px 22px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;cursor:pointer;border:none}
        .wa-primary{background:white;color:var(--green-dark)}
        .wa-primary:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.15)}
        .wa-secondary{background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3)}
        .wa-secondary:hover{background:rgba(255,255,255,.25)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
        .stat-card{background:var(--white);border-radius:16px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);cursor:pointer;transition:all .2s}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 4px 16px rgba(0,0,0,.1)}
        .stat-icon{font-size:26px;margin-bottom:6px}
        .stat-val{font-size:22px;font-weight:800;font-family:'Fredoka',sans-serif}
        .stat-label{font-size:12px;color:var(--text-light)}
        .notice{display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:14px;font-size:13px;font-weight:600;margin-bottom:16px}
        .notice-green{background:var(--green-pale);color:var(--green-dark)}
        .notice-orange{background:var(--orange-pale);color:#5C3D2E}
        .add-card{border:2px dashed var(--cream-dark);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:140px;cursor:pointer;background:var(--white);border-radius:20px;transition:all .2s;width:100%}
        .add-card:hover{border-color:var(--green-main);background:var(--green-pale)}
        .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .settings-section h3{font-size:17px;color:var(--green-dark);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--cream-dark)}
        .setting-field{margin-bottom:16px}
        .setting-field label{display:block;font-size:13px;font-weight:700;color:var(--text-mid);margin-bottom:6px}
        .setting-field input{width:100%;padding:11px 14px;border:2px solid var(--cream-dark);border-radius:10px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s;background:var(--white)}
        .setting-field input:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.1)}
        .setting-field input:disabled{opacity:.5;background:var(--cream);cursor:not-allowed}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--cream-dark)}
        .toggle-row:last-child{border-bottom:none}
        .toggle-label{font-size:14px;font-weight:600}
        .toggle-desc{font-size:12px;color:var(--text-light)}
        .toggle{width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;border:none}
        .t-off{background:var(--cream-dark)}
        .t-on{background:var(--green-main)}
        .knob{width:20px;height:20px;border-radius:50%;background:white;position:absolute;top:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        footer{background:var(--green-dark);color:white;margin-top:48px}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        @media(max-width:900px){
          .account-layout{grid-template-columns:1fr}
          .account-sidebar{flex-direction:row;overflow-x:auto;gap:4px;padding-bottom:8px}
          .profile-card{display:none}
          .sidebar-nav{display:flex;gap:4px}
          .sidebar-nav a{white-space:nowrap;padding:10px 14px;font-size:13px}
          .settings-grid{grid-template-columns:1fr}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

    

      <div className="account-layout">
        {/* SIDEBAR */}
        <div className="account-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{fullName || firstName}</div>
            <div className="profile-role">{roleLabel}</div>
            {memberSince && <div className="profile-since">Lid sinds {memberSince}</div>}
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <a key={item.id} className={activePanel === item.id ? 'active' : ''} onClick={() => setActivePanel(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--cream-dark)' }}>
              <a onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#E84E4E', fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
                <span className="nav-icon">🚪</span>
                Uitloggen
              </a>
            </div>
          </nav>
        </div>

        {/* MAIN */}
        <div className="account-main">

          {/* OVERVIEW */}
          <div className={`panel ${activePanel === 'overview' ? 'active' : ''}`}>
            <div className="welcome-banner">
              <h2>Welkom bij Kwispelclub, {firstName}! 🐾</h2>
              <p>Je account is aangemaakt. Voeg je huisdier(en) toe, ontdek de shop en boek een afspraak bij een kapsalon in de buurt.</p>
              <div className="welcome-actions">
                <a href="/#shop" className="wa-btn wa-primary">Ontdek de Shop →</a>
                <button className="wa-btn wa-secondary" onClick={() => setActivePanel('pets')}>Huisdier Toevoegen +</button>
              </div>
            </div>
            <div className="stats-grid">
              {([
                ['🐾', '0', 'Huisdieren', 'pets'],
                ['📦', '0', 'Bestellingen', 'orders'],
                ['❤️', '0', 'Favorieten', 'favorites'],
                ['✂️', '0', 'Afspraken', 'bookings'],
              ] as [string, string, string, Panel][]).map(([icon, val, label, panel]) => (
                <div key={label} className="stat-card" onClick={() => setActivePanel(panel)}>
                  <div className="stat-icon">{icon}</div>
                  <div className="stat-val">{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
            <div className="notice notice-orange">
              <span style={{ fontSize: 20 }}>✉️</span>
              Bevestig je e-mailadres via de link die we je hebben gestuurd naar <strong>{user?.email}</strong>
            </div>
          </div>

          {/* PETS */}
          <div className={`panel ${activePanel === 'pets' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Mijn Huisdieren 🐾</h2></div>
            <EmptyState
              icon="🐾"
              title="Nog geen huisdieren"
              desc="Voeg je hond, kat of ander huisdier toe om vaccinaties bij te houden, afspraken te boeken en persoonlijke producttips te ontvangen."
              cta="+ Huisdier Toevoegen"
            />
            <div className="add-card">
              <span style={{ fontSize: 30, opacity: 0.25 }}>+</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-mid)' }}>Huisdier Toevoegen</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Hond, kat of ander dier</span>
            </div>
          </div>

          {/* ORDERS */}
          <div className={`panel ${activePanel === 'orders' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Bestellingen 📦</h2></div>
            <div className="notice notice-green">
              <span style={{ fontSize: 18 }}>🚧</span>
              De Kwispelclub webshop opent binnenkort. Je bestellingen verschijnen hier automatisch.
            </div>
            <EmptyState
              icon="📦"
              title="Nog geen bestellingen"
              desc="Zodra de shop open is kun je producten bestellen voor jouw huisdier. Alles staat hier overzichtelijk bijeen."
              cta="Bekijk de Shop"
              ctaHref="/#shop"
            />
          </div>

          {/* FAVORITES */}
          <div className={`panel ${activePanel === 'favorites' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Favorieten ❤️</h2></div>
            <EmptyState
              icon="❤️"
              title="Nog geen favorieten"
              desc="Bewaar producten, kapsalons of cursussen als favoriet. Je vindt ze dan snel terug via dit overzicht."
              cta="Ontdek de Shop"
              ctaHref="/#shop"
            />
          </div>

          {/* 2DE HANDS */}
          <div className={`panel ${activePanel === 'listings' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Mijn 2de Hands ♻️</h2>
              <a href="/2dehands" className="btn btn-green">+ Advertentie Plaatsen</a>
            </div>
            <div className="notice notice-green" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>ℹ️</span>
              Je mag <strong>2 gratis advertenties</strong> plaatsen als je recent iets hebt gekocht bij Kwispelclub.
            </div>
            <EmptyState
              icon="♻️"
              title="Nog geen advertenties"
              desc="Verkoop tweedehands huisdierartikelen aan andere leden. Hondenmanden, speelgoed, benches — alles mag."
              cta="Eerste Advertentie Plaatsen"
              ctaHref="/2dehands"
            />
          </div>

          {/* BOOKINGS */}
          <div className={`panel ${activePanel === 'bookings' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Afspraken ✂️</h2>
              <a href="/kapsalons" className="btn btn-green">+ Afspraak Boeken</a>
            </div>
            <EmptyState
              icon="✂️"
              title="Nog geen afspraken"
              desc="Boek een knip- of groomingafspraak bij een kapsalon in jouw buurt in Limburg."
              cta="Kapsalons Bekijken"
              ctaHref="/kapsalons"
            />
          </div>

          {/* ACADEMY */}
          <div className={`panel ${activePanel === 'academy' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Academy 🎓</h2></div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🐶</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 16 }}>Puppy Training Basics</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>8 modules · 24 lessen · Trainer Lisa</div>
              </div>
              <span style={{ padding: '5px 14px', borderRadius: 50, background: 'var(--cream)', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>BINNENKORT</span>
            </div>
            <EmptyState
              icon="🎓"
              title="Cursussen komen eraan"
              desc="Kwispelclub Academy brengt trainingen voor puppyopvoeding, gedrag en meer. Je voortgang verschijnt hier zodra cursussen live gaan."
              cta="Meer Info"
              ctaHref="/#academy"
            />
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
                  <div className="setting-field"><label>Voornaam</label><input value={settingsFirstName} onChange={e => setSettingsFirstName(e.target.value)} placeholder="Voornaam" /></div>
                  <div className="setting-field"><label>Achternaam</label><input value={settingsLastName} onChange={e => setSettingsLastName(e.target.value)} placeholder="Achternaam" /></div>
                  <div className="setting-field"><label>E-mailadres <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(niet wijzigbaar)</span></label><input type="email" value={settingsEmail} disabled /></div>
                  <div className="setting-field"><label>Telefoon</label><input type="tel" value={settingsTel} onChange={e => setSettingsTel(e.target.value)} placeholder="+32 489 ..." /></div>
                  <div className="setting-field"><label>Locatie</label><input value={settingsLocatie} onChange={e => setSettingsLocatie(e.target.value)} placeholder="Bijv. Bree, Limburg" /></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="settings-section">
                    <h3>🔔 Notificaties</h3>
                    {([
                      ['E-mail notificaties', 'Bestellingen, updates, aanbiedingen', notifEmail, setNotifEmail],
                      ['Nieuwsbrief', 'Wekelijkse tips & aanbiedingen', notifNieuws, setNotifNieuws],
                      ['Vaccinatie herinneringen', 'Herinnering voor komende vaccinaties', notifVax, setNotifVax],
                      ['2de Hands berichten', 'Reacties op je advertenties', notif2dehands, setNotif2dehands],
                    ] as [string, string, boolean, (v: boolean) => void][]).map(([label, desc, val, setter]) => (
                      <div key={label} className="toggle-row">
                        <div><div className="toggle-label">{label}</div><div className="toggle-desc">{desc}</div></div>
                        <button className={`toggle ${val ? 't-on' : 't-off'}`} onClick={() => setter(!val)}>
                          <div className="knob" style={{ left: val ? 22 : 2 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="settings-section">
                    <h3>🔒 Privacy & Beveiliging</h3>
                    {([
                      ['Profiel zichtbaar', 'Andere gebruikers kunnen je profiel zien', privProfiel, setPrivProfiel],
                      ['Locatie tonen', 'Stad tonen op 2de hands advertenties', privLocatie, setPrivLocatie],
                    ] as [string, string, boolean, (v: boolean) => void][]).map(([label, desc, val, setter]) => (
                      <div key={label} className="toggle-row">
                        <div><div className="toggle-label">{label}</div><div className="toggle-desc">{desc}</div></div>
                        <button className={`toggle ${val ? 't-on' : 't-off'}`} onClick={() => setter(!val)}>
                          <div className="knob" style={{ left: val ? 22 : 2 }} />
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <a href="#" style={{ color: 'var(--green-main)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Wachtwoord wijzigen →</a>
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
          <div>
            <a href="/privacy">Privacy</a>
            <a href="/privacy">Voorwaarden</a>
            <a href="/">Home</a>
          </div>
        </div>
      </footer>
    </>
  )
}
