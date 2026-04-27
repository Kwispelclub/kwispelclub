'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import PetsPanel from '@/components/PetsPanel'

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
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState('Opslaan')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
    const onScroll = () => {}
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

  const G = {
    greenDark: '#2D5A27', greenMain: '#4A7C3F', greenLight: '#6B9E5E',
    greenPale: '#E8F0E4', orangeMain: '#E8913A', orangePale: '#FFF3E0',
    cream: '#FFF9F0', creamDark: '#F5EDE0', textDark: '#2C2C2C',
    textMid: '#5A5A5A', textLight: '#8A8A8A', white: '#FFFFFF', red: '#E84E4E'
  }

  return (
    <div style={{ background: G.cream, minHeight: '100vh', fontFamily: 'Nunito, sans-serif', color: G.textDark }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* LAYOUT */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}
        className="acc-layout">

        <style>{`
          @media(max-width:900px){
            .acc-layout{ display:flex !important; flex-direction:column !important; padding:16px !important; }
            .acc-sidebar-desktop{ display:none !important; }
            .acc-profile-card{ display:none !important; }
            .acc-main{ width:100% !important; }
            .acc-stats{ grid-template-columns:repeat(2,1fr) !important; }
            .acc-settings{ grid-template-columns:1fr !important; }
          }
          @media(min-width:901px){
            .acc-mob-trigger{ display:none !important; }
          }
          .acc-panel{ display:none }
          .acc-panel.active{ display:block; animation:fadeIn .25s ease }
          @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          .acc-nav-item{ display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;text-decoration:none;color:${G.textMid};font-weight:600;font-size:14px;cursor:pointer;transition:background .15s }
          .acc-nav-item:hover{ background:${G.cream} }
          .acc-nav-item.active{ background:${G.greenPale};color:${G.greenDark} }
          .acc-mob-dropdown{ position:fixed;left:16px;right:16px;background:white;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:300;overflow:hidden;border:1px solid ${G.creamDark} }
          .acc-mob-dropdown-item{ display:flex;align-items:center;gap:12px;padding:14px 18px;font-size:14px;font-weight:600;color:${G.textMid};border-bottom:1px solid ${G.creamDark};cursor:pointer }
          .acc-mob-dropdown-item:last-child{ border-bottom:none }
          .acc-mob-dropdown-item.active{ background:${G.greenPale};color:${G.greenDark} }
          .acc-mob-dropdown-item:hover{ background:${G.cream} }
          .acc-btn{ display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .2s;text-decoration:none;background:${G.greenMain};color:white }
          .acc-btn:hover{ background:${G.greenDark} }
          .acc-btn-sm{ padding:6px 14px;font-size:12px;border-radius:50px;font-family:'Fredoka',sans-serif;font-weight:600;border:none;cursor:pointer;transition:all .2s }
          .acc-card{ background:white;border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06) }
          .acc-toggle{ width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;border:none }
          .acc-knob{ width:20px;height:20px;border-radius:50%;background:white;position:absolute;top:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15) }
          .acc-listing-card{ background:white;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;gap:16px;align-items:flex-start;margin-bottom:12px;border:2px solid transparent;transition:all .2s }
          .acc-listing-card:hover{ border-color:${G.greenPale} }
        `}</style>

        {/* SIDEBAR */}
        <div>
          {/* Profile card - desktop only */}
          <div className="acc-profile-card" style={{ background: G.white, borderRadius: 20, padding: 28, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: G.greenMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, margin: '0 auto 14px', border: `4px solid ${G.greenPale}`, fontFamily: 'Fredoka, sans-serif' }}>{initials}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: 'Fredoka, sans-serif' }}>{fullName || firstName}</div>
            <div style={{ fontSize: 12, padding: '3px 12px', borderRadius: 50, display: 'inline-block', fontWeight: 700, color: G.greenDark, background: G.greenPale }}>{roleLabel}</div>
            {memberSince && <div style={{ fontSize: 12, color: G.textLight, marginTop: 8 }}>Lid sinds {memberSince}</div>}
          </div>

          {/* Mobile dropdown trigger */}
          <button className="acc-mob-trigger" onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: G.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: 'none', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: G.textDark, marginBottom: 16, cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{navItems.find(i => i.id === activePanel)?.icon}</span>
              <span>{navItems.find(i => i.id === activePanel)?.label}</span>
            </span>
            <span style={{ fontSize: 12, color: G.textLight, transform: mobileNavOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
          </button>

          {/* Mobile dropdown */}
          {mobileNavOpen && (
            <div className="acc-mob-dropdown">
              {navItems.map(item => (
                <div key={item.id} className={`acc-mob-dropdown-item ${activePanel === item.id ? 'active' : ''}`}
                  onClick={() => { setActivePanel(item.id); setMobileNavOpen(false) }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'listings' && actieveListings.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: G.greenMain, color: 'white', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{actieveListings.length}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Desktop nav */}
          <nav className="acc-sidebar-desktop">
            {navItems.map(item => (
              <div key={item.id} className={`acc-nav-item ${activePanel === item.id ? 'active' : ''}`} onClick={() => setActivePanel(item.id)}>
                <span style={{ width: 24, textAlign: 'center', fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.id === 'listings' && actieveListings.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: G.greenMain, color: 'white', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{actieveListings.length}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* MAIN */}
        <div className="acc-main" style={{ minWidth: 0 }}>

          {/* OVERVIEW */}
          <div className={`acc-panel ${activePanel === 'overview' ? 'active' : ''}`}>
            <div style={{ background: `linear-gradient(135deg,${G.greenDark},${G.greenMain})`, borderRadius: 20, padding: 32, color: 'white', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 24, bottom: -10, fontSize: 90, opacity: .1, pointerEvents: 'none' }}>🐾</div>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 26, marginBottom: 8 }}>Welkom bij Kwispelclub, {firstName}! 🐾</h2>
              <p style={{ fontSize: 14, opacity: .85, maxWidth: 420, lineHeight: 1.7 }}>Je account is aangemaakt. Voeg je huisdier(en) toe, ontdek de shop en boek een afspraak bij een kapsalon in de buurt.</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <a href="/#shop" style={{ padding: '10px 22px', borderRadius: 50, fontFamily: 'Fredoka, sans-serif', fontSize: 14, fontWeight: 600, textDecoration: 'none', background: 'white', color: G.greenDark }}>Ontdek de Shop →</a>
                <button onClick={() => setActivePanel('pets')} style={{ padding: '10px 22px', borderRadius: 50, fontFamily: 'Fredoka, sans-serif', fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer' }}>Huisdier Toevoegen +</button>
              </div>
            </div>
            <div className="acc-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              {([['🐾','0','Huisdieren','pets'],['📦','0','Bestellingen','orders'],['❤️','0','Favorieten','favorites'],['♻️',String(actieveListings.length),'2de Hands','listings']] as [string,string,string,Panel][]).map(([icon,val,label,panel]) => (
                <div key={label} onClick={() => setActivePanel(panel)} style={{ background: G.white, borderRadius: 16, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.06)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Fredoka, sans-serif' }}>{val}</div>
                  <div style={{ fontSize: 12, color: G.textLight }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, background: G.orangePale, color: '#5C3D2E', marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✉️</span>
              Bevestig je e-mailadres via de link die we je hebben gestuurd naar <strong>{user?.email}</strong>
            </div>
          </div>

          {/* PETS */}
<div className={`acc-panel ${activePanel === 'pets' ? 'active' : ''}`}>
  <PetsPanel userId={user!.id} />
</div>

          {/* ORDERS */}
          <div className={`acc-panel ${activePanel === 'orders' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Bestellingen 📦</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, background: G.greenPale, color: G.greenDark, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🚧</span> De Kwispelclub webshop opent binnenkort.
            </div>
            <EmptyState icon="📦" title="Nog geen bestellingen" desc="Zodra de shop open is kun je producten bestellen voor jouw huisdier." cta="Bekijk de Shop" ctaHref="/#shop" />
          </div>

          {/* FAVORITES */}
          <div className={`acc-panel ${activePanel === 'favorites' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Favorieten ❤️</h2>
            </div>
            <EmptyState icon="❤️" title="Nog geen favorieten" desc="Bewaar producten, kapsalons of cursussen als favoriet." cta="Ontdek de Shop" ctaHref="/#shop" />
          </div>

          {/* 2DE HANDS */}
          <div className={`acc-panel ${activePanel === 'listings' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Mijn 2de Hands ♻️</h2>
              <a href="/2dehands#sell" className="acc-btn">+ Nieuwe Advertentie</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: G.greenPale, borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 700, color: G.greenDark }}>
              <span>Slots:</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0,1].map(i => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: actieveListings.length > i ? G.greenMain : 'white', color: actieveListings.length > i ? 'white' : G.textLight, border: actieveListings.length > i ? 'none' : `2px solid ${G.creamDark}` }}>
                    {actieveListings.length > i ? '✓' : i+1}
                  </div>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{2 - actieveListings.length} van 2 beschikbaar</span>
            </div>
            {listingsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: G.textLight }}>⏳ Laden...</div>
            ) : eigenListings.length === 0 ? (
              <EmptyState icon="♻️" title="Nog geen advertenties" desc="Verkoop tweedehands huisdierartikelen aan andere leden." cta="Eerste Advertentie Plaatsen" ctaHref="/2dehands#sell" />
            ) : (
              <>
                {actieveListings.length > 0 && (
                  <>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, color: G.textMid, margin: '20px 0 10px', paddingBottom: 6, borderBottom: `2px solid ${G.creamDark}` }}>🟢 Actief ({actieveListings.length})</div>
                    {actieveListings.map(l => (
                      <div key={l.id} className="acc-listing-card">
                        {l.foto_urls?.[0] ? <img src={l.foto_urls[0]} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} alt={l.titel} /> : <div style={{ width: 80, height: 80, borderRadius: 12, background: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📦</div>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{l.titel}</div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: G.textLight, marginBottom: 8 }}>
                            <span>📂 {l.categorie}</span><span>📍 {l.locatie}</span><span>👁️ {l.views || 0} views</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 700, color: G.greenDark }}>€{parseFloat(l.vraagprijs).toFixed(2)}</span>
                            <span style={{ background: '#e8f5e9', color: G.greenDark, padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>Actief</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            <button className="acc-btn-sm" style={{ background: '#2a9d8f', color: 'white' }} disabled={statusUpdating === l.id} onClick={() => handleStatusUpdate(l.id, 'verkocht')}>
                              {statusUpdating === l.id ? '...' : '✓ Markeer als Verkocht'}
                            </button>
                            <button className="acc-btn-sm" style={{ background: 'transparent', border: `1.5px solid ${G.red}`, color: G.red }} disabled={statusUpdating === l.id} onClick={() => handleStatusUpdate(l.id, 'verlopen')}>
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
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, color: G.textMid, margin: '20px 0 10px', paddingBottom: 6, borderBottom: `2px solid ${G.creamDark}` }}>📁 Eerder geplaatst ({inactieveListings.length})</div>
                    {inactieveListings.map(l => (
                      <div key={l.id} className="acc-listing-card" style={{ opacity: 0.7 }}>
                        {l.foto_urls?.[0] ? <img src={l.foto_urls[0]} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} alt={l.titel} /> : <div style={{ width: 80, height: 80, borderRadius: 12, background: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📦</div>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{l.titel}</div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: G.textLight, marginBottom: 8 }}>
                            <span>📂 {l.categorie}</span><span>📍 {l.locatie}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 700, color: G.greenDark }}>€{parseFloat(l.vraagprijs).toFixed(2)}</span>
                            <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: l.status === 'verkocht' ? '#fce4ec' : '#fff3e0', color: l.status === 'verkocht' ? '#c62828' : '#e65100' }}>{l.status}</span>
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
          <div className={`acc-panel ${activePanel === 'bookings' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Afspraken ✂️</h2>
              <a href="/kapsalons" className="acc-btn">+ Afspraak Boeken</a>
            </div>
            <EmptyState icon="✂️" title="Nog geen afspraken" desc="Boek een knip- of groomingafspraak bij een kapsalon in jouw buurt." cta="Kapsalons Bekijken" ctaHref="/kapsalons" />
          </div>

          {/* ACADEMY */}
          <div className={`acc-panel ${activePanel === 'academy' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Academy 🎓</h2>
            </div>
            <EmptyState icon="🎓" title="Cursussen komen eraan" desc="Kwispelclub Academy brengt trainingen voor puppyopvoeding, gedrag en meer." cta="Meer Info" ctaHref="/#academy" />
          </div>

          {/* SETTINGS */}
          <div className={`acc-panel ${activePanel === 'settings' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Instellingen ⚙️</h2>
              <button className="acc-btn" onClick={handleSaveSettings}>{saveMsg}</button>
            </div>
            <div className="acc-settings" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="acc-card">
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 17, color: G.greenDark, marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid ${G.creamDark}` }}>👤 Profiel</h3>
                {[['Voornaam', settingsFirstName, setSettingsFirstName, 'text', false],['Achternaam', settingsLastName, setSettingsLastName, 'text', false],['E-mailadres', settingsEmail, null, 'email', true],['Telefoon', settingsTel, setSettingsTel, 'tel', false],['Locatie', settingsLocatie, setSettingsLocatie, 'text', false]].map(([label, val, setter, type, disabled]) => (
                  <div key={label as string} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 6 }}>{label as string}</label>
                    <input type={type as string} value={val as string} disabled={disabled as boolean} onChange={setter ? (e: React.ChangeEvent<HTMLInputElement>) => (setter as Function)(e.target.value) : undefined}
                      style={{ width: '100%', padding: '11px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', background: disabled ? G.cream : G.white, opacity: disabled ? 0.5 : 1 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="acc-card">
                  <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 17, color: G.greenDark, marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid ${G.creamDark}` }}>🔔 Notificaties</h3>
                  {([['E-mail notificaties','Bestellingen, updates',notifEmail,setNotifEmail],['Nieuwsbrief','Wekelijkse tips',notifNieuws,setNotifNieuws],['Vaccinatie herinneringen','Komende vaccinaties',notifVax,setNotifVax],['2de Hands berichten','Reacties op advertenties',notif2dehands,setNotif2dehands]] as [string,string,boolean,(v:boolean)=>void][]).map(([label,desc,val,setter]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${G.creamDark}` }}>
                      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12, color: G.textLight }}>{desc}</div></div>
                      <button className="acc-toggle" style={{ background: val ? G.greenMain : G.creamDark }} onClick={() => setter(!val)}>
                        <div className="acc-knob" style={{ left: val ? 22 : 2 }} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="acc-card">
                  <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 17, color: G.greenDark, marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid ${G.creamDark}` }}>🔒 Privacy</h3>
                  {([['Profiel zichtbaar','Andere leden kunnen je zien',privProfiel,setPrivProfiel],['Locatie tonen','Stad op advertenties',privLocatie,setPrivLocatie]] as [string,string,boolean,(v:boolean)=>void][]).map(([label,desc,val,setter]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${G.creamDark}` }}>
                      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12, color: G.textLight }}>{desc}</div></div>
                      <button className="acc-toggle" style={{ background: val ? G.greenMain : G.creamDark }} onClick={() => setter(!val)}>
                        <div className="acc-knob" style={{ left: val ? 22 : 2 }} />
                      </button>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <a href="#" style={{ color: G.greenMain, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Wachtwoord wijzigen →</a>
                    <a href="#" style={{ color: G.red, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Account verwijderen</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ background: G.greenDark, color: 'white', marginTop: 48 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13, opacity: .5 }}>
          <span>© 2026 Kwispelclub</span>
          <div><a href="/privacy" style={{ color: 'white', textDecoration: 'none', margin: '0 12px' }}>Privacy</a><a href="/" style={{ color: 'white', textDecoration: 'none', margin: '0 12px' }}>Home</a></div>
        </div>
      </footer>
    </div>
  )
}
