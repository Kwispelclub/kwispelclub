'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dashboardUrl, setDashboardUrl] = useState('/account')
  const [dashboardLabel, setDashboardLabel] = useState('Mijn Account')
  const [hasVerkoper, setHasVerkoper] = useState(false)
  const [hasSalon, setHasSalon] = useState(false)
  const [hasAcademy, setHasAcademy] = useState(false)
  const [ddOpen, setDdOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 10))
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) return
      const role = u.user_metadata?.role
      if (role === 'admin') {
        setDashboardUrl('/admin'); setDashboardLabel('⚙️ Admin'); return
      }
      const [{ data: salon }, { data: verkoper }, { data: academy }] = await Promise.all([
        supabase.from('kapsalons').select('id').eq('owner_id', u.id).maybeSingle(),
        supabase.from('verkopers').select('id').eq('profile_id', u.id).maybeSingle(),
        supabase.from('trainers').select('id').eq('profile_id', u.id).maybeSingle(),
      ])
      if (salon) setHasSalon(true)
      if (verkoper) setHasVerkoper(true)
      if (academy) setHasAcademy(true)
      if (salon && verkoper) {
        setDashboardLabel('Dashboards ▾')
      } else if (salon) {
        setDashboardUrl('/kapsalons/dashboard'); setDashboardLabel('✂️ Salon Dashboard')
      } else if (verkoper) {
        setDashboardUrl('/verkoper/dashboard'); setDashboardLabel('🏪 Verkoper Dashboard')
      }
    })
  }, [])

  const links = [
    { href: '/winkel', label: 'Shop' },
    { href: '/kapsalons', label: 'Kapsalons' },
    { href: '/dierenarts', label: 'Dierenarts' },
    { href: '/2dehands', label: '2de Hands' },
    { href: '/puppy-training', label: 'Academy' },
    { href: '/blog', label: 'Blog' },
    { href: '/over-ons', label: 'Over Ons' },
  ]

  const extraLinks = [
    ...(!hasVerkoper ? [{ href: '/word-verkoper', label: '🏪 Word Verkoper' }] : [{ href: '/verkoper/dashboard', label: '🏪 Verkoper Dashboard' }]),
    ...(!hasAcademy ? [{ href: '/academy-verkoper', label: '🎓 Word Trainer' }] : [{ href: '/puppy-training/dashboard', label: '🎓 Trainer Dashboard' }]),
    ...(!hasSalon ? [{ href: '/word-kapper', label: '✂️ Word Kapper' }] : [{ href: '/kapsalons/dashboard', label: '✂️ Salon Dashboard' }]),
  ]

  const isActive = (href: string) => {
    if (href.includes('#')) return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isBothRoles = hasSalon && hasVerkoper
  const isLoggedIn = !!user
  const showWordVerkoper = !isLoggedIn || (!hasVerkoper && !hasSalon)

  return (
    <>
      <style>{`
        .kw-nav{position:sticky;top:0;z-index:100;background:rgba(255,249,240,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 16px;transition:all .3s;font-family:Nunito,sans-serif}
        .kw-nav.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08);background:rgba(255,249,240,.96)}
        .kw-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:64px;gap:6px}
        .kw-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}
        .kw-paw{width:38px;height:38px;border-radius:10px;background:#2D5A27;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .kw-brand{font-family:Fredoka,sans-serif;font-size:20px;font-weight:700;color:#2D5A27;letter-spacing:.5px;white-space:nowrap}
        .kw-links{display:flex;gap:2px;list-style:none;margin:0;padding:0}
        .kw-links a{text-decoration:none;color:#2C2C2C;font-weight:600;font-size:14px;padding:8px 14px;border-radius:10px;transition:all .2s;white-space:nowrap}
        .kw-links a:hover,.kw-links a.active{background:#E8F0E4;color:#2D5A27}
        .kw-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0}
        .kw-verkoper-btn{padding:8px 14px;border-radius:50px;background:#FFF3E0;color:#E8913A;font-family:Fredoka,sans-serif;font-size:13px;font-weight:700;text-decoration:none;transition:all .2s;border:1.5px solid #F5A855;white-space:nowrap}
        .kw-verkoper-btn:hover{background:#E8913A;color:white}
        .kw-dashboard-btn{padding:8px 14px;border-radius:50px;background:#E8F0E4;color:#2D5A27;font-family:Fredoka,sans-serif;font-size:13px;font-weight:700;text-decoration:none;transition:all .2s;border:1.5px solid #4A7C3F;white-space:nowrap;cursor:pointer}
        .kw-dashboard-btn:hover{background:#2D5A27;color:white}
        .kw-dd-wrap{position:relative}
        .kw-dd{position:absolute;right:0;top:calc(100% + 8px);background:white;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:8px;min-width:200px;z-index:200;border:1px solid #F0F0F0}
        .kw-dd a{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:8px;text-decoration:none;color:#2C2C2C;font-size:14px;font-weight:700;transition:background .15s;white-space:nowrap}
        .kw-dd a:hover{background:#E8F0E4;color:#2D5A27}
        .kw-dd a.orange:hover{background:#FFF3E0;color:#E8913A}
        .kw-user{display:flex;align-items:center;gap:6px;padding:5px 12px 5px 5px;border-radius:50px;background:white;border:2px solid #F5EDE0;cursor:pointer;text-decoration:none;flex-shrink:0}
        .kw-ua{width:30px;height:30px;border-radius:50%;background:#4A7C3F;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0}
        .kw-user-name{font-size:13px;font-weight:700;color:#2C2C2C;white-space:nowrap}
        .kw-login{padding:8px 16px;border-radius:50px;background:#4A7C3F;color:white;font-family:Fredoka,sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;box-shadow:0 2px 8px rgba(74,124,63,.25);white-space:nowrap}
        .kw-login:hover{background:#2D5A27}
        .kw-ham{display:none;background:none;border:none;font-size:24px;cursor:pointer;padding:6px;flex-shrink:0}
        .kw-mob{display:none;position:fixed;top:64px;left:0;right:0;bottom:0;z-index:99;background:rgba(0,0,0,.3)}
        .kw-mob.open{display:block}
        .kw-mob-inner{background:#FFF9F0;border-radius:0 0 24px 24px;box-shadow:0 8px 40px rgba(0,0,0,.15);overflow:hidden}
        .kw-mob-links{padding:8px 0}
        .kw-mob-links a{display:flex;align-items:center;padding:16px 24px;font-weight:600;font-size:16px;color:#2C2C2C;text-decoration:none;border-bottom:1px solid #F5EDE0;transition:background .15s}
        .kw-mob-links a:hover{background:#F5EDE0}
        .kw-mob-links a.active{color:#2D5A27;background:#E8F0E4}
        .kw-mob-divider{padding:8px 24px;font-size:11px;font-weight:800;color:#8A8A8A;letter-spacing:1px;text-transform:uppercase;background:#F5EDE0}
        .kw-mob-extra .kw-mob-links a{background:#FFFBF5;font-size:15px}
        .kw-mob-account{padding:16px 24px;background:#F5EDE0;display:flex;gap:8px;flex-wrap:wrap}
        .kw-mob-acc-btn{flex:1;min-width:120px;padding:13px;border-radius:50px;background:#2D5A27;color:white;font-family:Fredoka,sans-serif;font-size:14px;font-weight:600;text-decoration:none;text-align:center;border:none;cursor:pointer}
        .kw-mob-out-btn{padding:13px 20px;border-radius:50px;background:white;color:#2C2C2C;font-family:Fredoka,sans-serif;font-size:14px;font-weight:600;text-decoration:none;text-align:center;border:2px solid #F5EDE0;cursor:pointer}
        @media(max-width:1024px){.kw-links{display:none}.kw-ham{display:block}.kw-verkoper-btn{display:none}.kw-dashboard-btn{display:none}.kw-dd-wrap{display:none}}
        @media(max-width:480px){.kw-user-name{display:none}.kw-user{padding:4px}.kw-brand{font-size:18px}}
      `}</style>

      <nav className={`kw-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="kw-inner">
          <a href="/" className="kw-logo">
            <div className="kw-paw">🐾</div>
            <span className="kw-brand">Kwispelclub</span>
          </a>
          <ul className="kw-links">
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} className={isActive(l.href) ? 'active' : ''}>{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="kw-right">
            {showWordVerkoper && (
              <a href="/word-verkoper" className="kw-verkoper-btn">🏪 Word Verkoper</a>
            )}
            {user && !isBothRoles && dashboardLabel !== '👤 Mijn Account' && (
              <a href={dashboardUrl} className="kw-dashboard-btn">{dashboardLabel}</a>
            )}
            {user && isBothRoles && (
              <div className="kw-dd-wrap">
                <button className="kw-dashboard-btn" onClick={() => setDdOpen(!ddOpen)}>
                  Dashboards ▾
                </button>
                {ddOpen && (
                  <div className="kw-dd">
                    <a href="/kapsalons/dashboard" onClick={() => setDdOpen(false)}>✂️ Salon Dashboard</a>
                    <a href="/verkoper/dashboard" className="orange" onClick={() => setDdOpen(false)}>🏪 Verkoper Dashboard</a>
                  </div>
                )}
              </div>
            )}
            {user ? (
              <a href="/account" className="kw-user">
                <div className="kw-ua">
                  {(user.user_metadata?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <span className="kw-user-name">{user.user_metadata?.first_name || 'Account'}</span>
              </a>
            ) : (
              <a href="/auth" className="kw-login">Inloggen →</a>
            )}
          </div>
          <button className="kw-ham" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="kw-mob open" onClick={() => setMobileOpen(false)}>
          <div className="kw-mob-inner" onClick={e => e.stopPropagation()}>
            <div className="kw-mob-links">
              {links.map(l => (
                <a key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''} onClick={() => setMobileOpen(false)}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="kw-mob-divider">{hasVerkoper || hasSalon || hasAcademy ? 'Mijn dashboards' : 'Voor verkopers & trainers'}</div>
            <div className="kw-mob-extra">
              <div className="kw-mob-links">
                {extraLinks.map(l => (
                  <a key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''} onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="kw-mob-account">
              {user ? (
                <>
                  {hasSalon && <a href="/kapsalons/dashboard" className="kw-mob-acc-btn" onClick={() => setMobileOpen(false)}>✂️ Salon</a>}
                  {hasVerkoper && <a href="/verkoper/dashboard" className="kw-mob-acc-btn" style={{background:'#E8913A'}} onClick={() => setMobileOpen(false)}>🏪 Verkoper</a>}
                  {!hasSalon && !hasVerkoper && <a href="/account" className="kw-mob-acc-btn" onClick={() => setMobileOpen(false)}>👤 Account</a>}
                  <button className="kw-mob-out-btn" onClick={async () => { await supabase.auth.signOut(); setMobileOpen(false); window.location.href = '/' }}>Uit</button>
                </>
              ) : (
                <a href="/auth" className="kw-mob-acc-btn" onClick={() => setMobileOpen(false)}>→ Inloggen</a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
