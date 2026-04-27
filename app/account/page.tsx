'use client'

import { useState, useEffect } from 'react'
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

const STAAT_LABELS: Record<string, string> = { zo_goed_als_nieuw: 'Zo goed als nieuw', licht_gebruikt: 'Licht gebruikt', goed: 'Goed', redelijk: 'Redelijk' }

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel>('overview')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState('Opslaan')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Listings state
  const [eigenListings, setEigenListings] = useState<any[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)

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
      loadEigenListings(user.id)
    })
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadEigenListings = async (userId: string) => {
    setListingsLoading(true)
    try {
      const res = await fetch(`/api/listings?seller_id=${userId}`)
      const data = await res.json()
      setEigenListings(data.listings || [])
    } catch (e) {
      console.error('Fout bij laden listings:', e)
    }
    setListingsLoading(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!user) return
    setStatusUpdating(id)
    await fetch('/api/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, seller_id: user.id })
    })
    await loadEigenListings(user.id)
    setStatusUpdating(null)
  }

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

  const actieveListings = eigenListings.filter(l => l.status === 'actief')
  const inactieveListings = eigenListings.filter(l => l.status !== 'actief')

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
        .btn-sm{padding:6px 14px;font-size:12px;border-radius:50px;font-family:'Fredoka',sans-serif;font-weight:600;border:none;cursor:pointer;transition:all .2s}
        .btn-verkocht{background:#2a9d8f;color:white}
        .btn-verkocht:hover{background:#21867a}
        .btn-verwijder{background:transparent;border:1.5px solid var(--red);color:var(--red)}
        .btn-verwijder:hover{background:var(--red);color:white}
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
        /* Listings cards */
        .listing-card{background:var(--white);border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;gap:16px;align-items:flex-start;margin-bottom:12px;border:2px solid transparent;transition:all .2s}
        .listing-card:hover{border-color:var(--green-pale);box-shadow:0 4px 16px rgba(0,0,0,.1)}
        .listing-img{width:80px;height:80px;border-radius:12px;object-fit:cover;flex-shrink:0;background:var(--cream)}
        .listing-img-placeholder{width:80px;height:80px;border-radius:12px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
        .listing-info{flex:1;min-width:0}
        .listing-titel{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;color:var(--text-dark);margin-bottom:4px}
        .listing-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--text-light);margin-bottom:8px}
        .listing-prijs{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--green-dark)}
        .listing-status{display:inline-flex;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700}
        .status-actief{background:#e8f5e9;color:#2D5A27}
        .status-verkocht{background:#fce4ec;color:#c62828}
        .status-gereserveerd{background:#fff3e0;color:#e65100}
        .listing-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
        .slots-bar{display:flex;align-items:center;gap:10px;padding:14px 18px;background:var(--green-pale);border-radius:12px;margin-bottom:20px;font-size:13px;font-weight:700;color:var(--green-dark)}
        .slot-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
        .slot-used{background:var(--green-main);color:white}
        .slot-free{background:white;color:var(--text-light);border:2px solid var(--cream-dark)}
        .section-title{font-family:'Fredoka',sans-serif;font-size:16px;color:var(--text-mid);margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--cream-dark)}
        footer{background:var(--green-dark);color:white;margin-top:48px}
        .footer-inner{max-width:1320px;margin:0 auto;padding:28px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        .mob-nav-trigger{display:none}
        @media(max-width:900px){
          .account-layout{grid-template-columns:1fr}
          .account-sidebar{position:relative}
          .profile-card{display:none}
          .sidebar-nav{display:none}
          .mob-nav-trigger{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--white);border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.06);cursor:pointer;border:none;width:100%;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:var(--text-dark);margin-bottom:16px}
          .mob-nav-trigger .trigger-left{display:flex;align-items:center;gap:10px;font-size:15px}
          .mob-nav-trigger .chevron{font-size:12px;transition:transform .2s;color:var(--text-light)}
          .mob-nav-trigger .chevron.open{transform:rotate(180deg)}
          .mob-dropdown{position:absolute;top:58px;left:0;right:0;background:var(--white);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.12);z-index:50;overflow:hidden;border:1px solid var(--cream-dark)}
          .mob-dropdown a{display:flex;align-items:center;gap:12px;padding:14px 18px;font-size:14px;font-weight:600;color:var(--text-mid);text-decoration:none;border-bottom:1px solid var(--cream-dark);cursor:pointer}
          .mob-dropdown a:last-child{border-bottom:none}
          .mob-dropdown a.active{background:var(--green-pale);color:var(--green-dark)}
          .mob-dropdown a:hover{background:var(--cream)}
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

          {/* Mobile dropdown trigger */}
          <button className="mob-nav-trigger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <span className="trigger-left">
              <span>{navItems.find(i => i.id === activePanel)?.icon}</span>
              <span>{navItems.find(i => i.id === activePanel)?.label}</span>
            </span>
            <span className={`chevron ${mobileNavOpen ? 'open' : ''}`}>▼</span>
          </button>

          {/* Mobile dropdown menu */}
          {mobileNavOpen && (
            <div className="mob-dropdown">
              {navItems.map(item => (
                <a key={item.id} className={activePanel === item.id ? 'active' : ''} onClick={() => { setActivePanel(item.id); setMobileNavOpen(false) }}>
                  <span>{item.icon}</span>
                  {item.label}
                  {item.id === 'listings' && actieveListings.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--green-main)', color: 'white', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>
                      {actieveListings.length}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* Desktop sidebar nav */}
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <a key={item.id} className={activePanel === item.id ? 'active' : ''} onClick={() => setActivePanel(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.id === 'listings' && eigenListings.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--green-main)', color: 'white', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>
                    {actieveListings.length}
                  </span>
                )}
              </a>
            ))}
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
                ['♻️', String(actieveListings.length), '2de Hands', 'listings'],
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
              <a href="/2dehands#sell" className="btn btn-green">+ Nieuwe Advertentie</a>
            </div>

            {/* Slots indicator */}
            <div className="slots-bar">
              <span>Slots:</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <div className={`slot-dot ${actieveListings.length >= 1 ? 'slot-used' : 'slot-free'}`}>{actieveListings.length >= 1 ? '✓' : '1'}</div>
                <div className={`slot-dot ${actieveListings.length >= 2 ? 'slot-used' : 'slot-free'}`}>{actieveListings.length >= 2 ? '✓' : '2'}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontWeight: 400, color: 'var(--green-dark)' }}>
                {2 - actieveListings.length} van 2 beschikbaar
              </span>
            </div>

            {listingsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ Laden...</div>
            ) : eigenListings.length === 0 ? (
              <EmptyState
                icon="♻️"
                title="Nog geen advertenties"
                desc="Verkoop tweedehands huisdierartikelen aan andere leden. Hondenmanden, speelgoed, benches — alles mag."
                cta="Eerste Advertentie Plaatsen"
                ctaHref="/2dehands#sell"
              />
            ) : (
              <>
                {actieveListings.length > 0 && (
                  <>
                    <div className="section-title">🟢 Actief ({actieveListings.length})</div>
                    {actieveListings.map(l => (
                      <div key={l.id} className="listing-card">
                        {l.foto_urls?.[0]
                          ? <img src={l.foto_urls[0]} className="listing-img" alt={l.titel} />
                          : <div className="listing-img-placeholder">📦</div>
                        }
                        <div className="listing-info">
                          <div className="listing-titel">{l.titel}</div>
                          <div className="listing-meta">
                            <span>📂 {l.categorie}</span>
                            <span>⭐ {STAAT_LABELS[l.staat] || l.staat}</span>
                            <span>📍 {l.locatie}</span>
                            <span>👁️ {l.views || 0} views</span>
                            <span>🗓️ {new Date(l.created_at).toLocaleDateString('nl-BE')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="listing-prijs">€{parseFloat(l.vraagprijs).toFixed(2)}</div>
                            <span className="listing-status status-actief">Actief</span>
                          </div>
                          <div className="listing-actions">
                            <button
                              className="btn-sm btn-verkocht"
                              disabled={statusUpdating === l.id}
                              onClick={() => handleStatusUpdate(l.id, 'verkocht')}
                            >
                              {statusUpdating === l.id ? '...' : '✓ Markeer als Verkocht'}
                            </button>
                            <button
                              className="btn-sm btn-verwijder"
                              disabled={statusUpdating === l.id}
                              onClick={() => handleStatusUpdate(l.id, 'verlopen')}
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {inactieveListings.length > 0 && (
                  <>
                    <div className="section-title">📁 Eerder geplaatst ({inactieveListings.length})</div>
                    {inactieveListings.map(l => (
                      <div key={l.id} className="listing-card" style={{ opacity: 0.7 }}>
                        {l.foto_urls?.[0]
                          ? <img src={l.foto_urls[0]} className="listing-img" alt={l.titel} />
                          : <div className="listing-img-placeholder">📦</div>
                        }
                        <div className="listing-info">
                          <div className="listing-titel">{l.titel}</div>
                          <div className="listing-meta">
                            <span>📂 {l.categorie}</span>
                            <span>📍 {l.locatie}</span>
                            <span>🗓️ {new Date(l.created_at).toLocaleDateString('nl-BE')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="listing-prijs">€{parseFloat(l.vraagprijs).toFixed(2)}</div>
                            <span className={`listing-status ${l.status === 'verkocht' ? 'status-verkocht' : 'status-gereserveerd'}`}>
                              {l.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
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
