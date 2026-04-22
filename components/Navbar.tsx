'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const fn = user.user_metadata?.first_name || user.email?.split('@')[0] || '?'
        const ln = user.user_metadata?.last_name || ''
        setUser({
          name: fn,
          initials: `${fn[0]}${ln[0] || ''}`.toUpperCase()
        })
      }
    })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const links = [
    { href: '/#shop', label: 'Shop' },
    { href: '/#academy', label: 'Academy' },
    { href: '/kapsalons', label: 'Kapsalons' },
    { href: '/2dehands', label: '2de Hands' },
  ]

  return (
    <>
      <style>{`
        .navbar{position:sticky;top:0;z-index:100;background:rgba(255,249,240,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.04);padding:0 clamp(16px,4vw,48px);transition:box-shadow .3s}
        .navbar.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .nav-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;height:72px;gap:8px}
        .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-right:28px;flex-shrink:0}
        .logo-paw{width:42px;height:42px;border-radius:12px;background:#2D5A27;display:flex;align-items:center;justify-content:center;font-size:22px}
        .nav-brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:#2D5A27}
        .nav-links{display:flex;gap:2px;list-style:none}
        .nav-links a{text-decoration:none;color:#2C2C2C;font-weight:600;font-size:14px;padding:8px 16px;border-radius:10px;transition:all .2s}
        .nav-links a:hover,.nav-links a.active{background:#E8F0E4;color:#2D5A27}
        .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .user-pill{display:flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:50px;background:white;border:2px solid #F5EDE0;cursor:pointer;text-decoration:none}
        .user-pill .ua{width:32px;height:32px;border-radius:50%;background:#4A7C3F;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800}
        .user-pill span{font-size:13px;font-weight:700;color:#2C2C2C}
        .btn-auth{padding:9px 20px;border-radius:50px;background:#4A7C3F;color:white;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;border:none;cursor:pointer}
        .btn-auth:hover{background:#2D5A27;transform:translateY(-1px)}
        .btn-signout{padding:8px 16px;border-radius:50px;border:2px solid #F5EDE0;background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;color:#8A8A8A;transition:all .2s}
        .btn-signout:hover{border-color:#E84E4E;color:#E84E4E}
        .nav-hamburger{display:none;background:none;border:none;font-size:26px;cursor:pointer;padding:8px;color:#2C2C2C}
        .mobile-menu{display:none;position:fixed;top:72px;left:0;right:0;background:#FFF9F0;padding:16px 24px 24px;z-index:99;box-shadow:0 8px 40px rgba(0,0,0,.12);border-radius:0 0 20px 20px}
        .mobile-menu.open{display:block;animation:slideDown .3s ease}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .mobile-menu a{display:block;padding:14px 0;font-weight:600;font-size:16px;color:#2C2C2C;text-decoration:none;border-bottom:1px solid #F5EDE0}
        .mobile-menu a:last-child{border-bottom:none}
        .mobile-menu .m-auth{margin-top:16px;display:flex;gap:10px}
        @media(max-width:768px){.nav-links{display:none}.nav-hamburger{display:block}.btn-auth{display:none}.btn-signout{display:none}.user-pill span{display:none}}
      `}</style>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="logo-paw">🐾</div>
            <span className="nav-brand">Kwispelclub</span>
          </a>
          <ul className="nav-links">
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} className={pathname === l.href || pathname?.startsWith(l.href.split('#')[0] + '/') ? 'active' : ''}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            {user ? (
              <>
                <a href="/account" className="user-pill">
                  <div className="ua">{user.initials}</div>
                  <span>{user.name}</span>
                </a>
                <button className="btn-signout" onClick={handleSignOut}>Uitloggen</button>
              </>
            ) : (
              <a href="/auth" className="btn-auth">Inloggen / Registreren</a>
            )}
          </div>
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <div className="m-auth">
          {user ? (
            <>
              <a href="/account" className="btn-auth" style={{ flex: 1, textAlign: 'center' }}>Mijn Account</a>
              <button className="btn-signout" onClick={handleSignOut}>Uitloggen</button>
            </>
          ) : (
            <a href="/auth" className="btn-auth" style={{ flex: 1, textAlign: 'center' }}>Inloggen / Registreren</a>
          )}
        </div>
      </div>
    </>
  )
}
