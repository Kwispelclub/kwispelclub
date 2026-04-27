'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 10))
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, [])

  const links = [
    { href: '/#shop', label: 'Shop' },
    { href: '/kapsalons', label: 'Kapsalons' },
    { href: '/2dehands', label: '2de Hands' },
    { href: '/puppy-training', label: 'Academy' },
    { href: '/blog', label: 'Blog' },
    { href: '/over-ons', label: 'Over Ons' },
  ]

  const isActive = (href: string) => {
    if (href.includes('#')) return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <style>{`
        .kw-nav{position:sticky;top:0;z-index:100;background:rgba(255,249,240,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:all .3s;font-family:'Nunito',sans-serif}
        .kw-nav.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08);background:rgba(255,249,240,.96)}
        .kw-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}
        .kw-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:20px;flex-shrink:0}
        .kw-paw{width:42px;height:42px;border-radius:12px;background:#2D5A27;display:flex;align-items:center;justify-content:center;font-size:22px}
        .kw-brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:#2D5A27;letter-spacing:.5px}
        .kw-links{display:flex;gap:2px;list-style:none;margin:0;padding:0}
        .kw-links a{text-decoration:none;color:#2C2C2C;font-weight:600;font-size:14px;padding:8px 14px;border-radius:10px;transition:all .2s;white-space:nowrap}
        .kw-links a:hover,.kw-links a.active{background:#E8F0E4;color:#2D5A27}
        .kw-right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .kw-user{display:flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:50px;background:white;border:2px solid #F5EDE0;cursor:pointer;text-decoration:none}
        .kw-ua{width:32px;height:32px;border-radius:50%;background:#4A7C3F;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0}
        .kw-user span{font-size:13px;font-weight:700;color:#2C2C2C}
        .kw-login{padding:9px 20px;border-radius:50px;background:#4A7C3F;color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;box-shadow:0 2px 8px rgba(74,124,63,.25)}
        .kw-login:hover{background:#2D5A27;transform:translateY(-1px)}
        .kw-ham{display:none;background:none;border:none;font-size:26px;cursor:pointer;padding:8px;margin-left:8px;flex-shrink:0}

        /* Mobile menu overlay */
        .kw-mob{display:none;position:fixed;top:72px;left:0;right:0;bottom:0;z-index:99;background:rgba(0,0,0,.3)}
        .kw-mob.open{display:block}
        .kw-mob-inner{background:#FFF9F0;border-radius:0 0 24px 24px;box-shadow:0 8px 40px rgba(0,0,0,.15);overflow:hidden}
        .kw-mob-links{padding:8px 0}
        .kw-mob-links a{display:flex;align-items:center;padding:16px 24px;font-weight:600;font-size:16px;color:#2C2C2C;text-decoration:none;border-bottom:1px solid #F5EDE0;transition:background .15s}
        .kw-mob-links a:hover{background:#F5EDE0}
        .kw-mob-links a.active{color:#2D5A27;background:#E8F0E4}
        .kw-mob-links a:last-child{border-bottom:none}
        .kw-mob-account{padding:16px 24px;background:#F5EDE0;display:flex;gap:12px}
        .kw-mob-acc-btn{flex:1;padding:13px;border-radius:50px;background:#2D5A27;color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;text-align:center;border:none;cursor:pointer}
        .kw-mob-out-btn{padding:13px 20px;border-radius:50px;background:white;color:#2C2C2C;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;text-align:center;border:2px solid #F5EDE0;cursor:pointer}

        @media(max-width:1024px){.kw-links{display:none}.kw-ham{display:block}}
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

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
            {user ? (
              <a href="/account" className="kw-user">
                <div className="kw-ua">
                  {(user.user_metadata?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <span>{user.user_metadata?.first_name || 'Account'}</span>
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

      {/* Mobile menu */}
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
            <div className="kw-mob-account">
              {user ? (
                <>
                  <a href="/account" className="kw-mob-acc-btn" onClick={() => setMobileOpen(false)}>
                    👤 Mijn Account
                  </a>
                  <a href="/auth/signout" className="kw-mob-out-btn" onClick={() => setMobileOpen(false)}>
                    Uitloggen
                  </a>
                </>
              ) : (
                <a href="/auth" className="kw-mob-acc-btn" onClick={() => setMobileOpen(false)}>
                  → Inloggen / Registreren
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
