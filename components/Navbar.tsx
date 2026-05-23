'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const [notifs, setNotifs] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const unreadCount = notifs.filter(n => !n.read).length
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 10))
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setMounted(true)
      if (!u) { setMounted(true); return }

      // Laad notificaties
      const loadNotifs = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setNotifs(data || [])
      }
      loadNotifs()

      // Realtime updates
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${u.id}`
        }, () => loadNotifs())
        .subscribe()
      const role = u.user_metadata?.role
      if (role === 'admin') {
        setDashboardUrl('/admin'); setDashboardLabel('⚙️ Admin'); return
      }
      const [{ data: salon }, { data: verkoper }] = await Promise.all([
        supabase.from('kapsalons').select('id').eq('owner_id', u.id).maybeSingle(),
        supabase.from('verkopers').select('id').eq('profile_id', u.id).maybeSingle(),
      ])
      if (salon) setHasSalon(true)
      if (verkoper) setHasVerkoper(true)
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

  if (!mounted) return (
    <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,249,240,.96)',borderBottom:'1px solid rgba(0,0,0,.04)',padding:'0 16px',height:64,display:'flex',alignItems:'center'}}>
      <a href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
        <div style={{width:38,height:38,borderRadius:10,background:'#2D5A27',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🐾</div>
        <span style={{fontFamily:'Fredoka,sans-serif',fontSize:20,fontWeight:700,color:'#2D5A27'}}>Kwispelclub</span>
      </a>
    </nav>
  )

  return (
    <>
      <style suppressHydrationWarning>{`
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
        .kw-notif-btn{position:relative;width:38px;height:38px;border-radius:50%;background:white;border:2px solid #F5EDE0;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all .2s;flex-shrink:0}
        .kw-notif-btn:hover{border-color:#4A7C3F;background:#E8F0E4}
        .kw-notif-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#E84E4E;color:white;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid white}
        .kw-notif-dd{position:absolute;right:0;top:calc(100% + 8px);background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.15);width:320px;z-index:200;border:1px solid #F0F0F0;overflow:hidden}
        .kw-notif-header{padding:14px 16px;border-bottom:1px solid #F5EDE0;display:flex;justify-content:space-between;align-items:center}
        .kw-notif-header h4{font-family:Fredoka,sans-serif;font-size:16px;color:#2D5A27}
        .kw-notif-item{padding:12px 16px;border-bottom:1px solid #F5EDE0;cursor:pointer;transition:background .15s;text-decoration:none;display:block;color:inherit}
        .kw-notif-item:hover{background:#F5F5F5}
        .kw-notif-item.unread{background:#FFF9F0}
        .kw-notif-title{font-size:13px;font-weight:700;color:#2C2C2C;margin-bottom:2px}
        .kw-notif-msg{font-size:12px;color:#8A8A8A;line-height:1.4}
        .kw-notif-time{font-size:11px;color:#AAAAAA;margin-top:4px}
        .kw-notif-empty{padding:32px 16px;text-align:center;color:#8A8A8A;font-size:13px}
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
            {mounted && showWordVerkoper && (
              <a href="/word-verkoper" className="kw-verkoper-btn">🏪 Word Verkoper</a>
            )}
            {mounted && user && !isBothRoles && dashboardLabel !== '👤 Mijn Account' && (
              <a href={dashboardUrl} className="kw-dashboard-btn">{dashboardLabel}</a>
            )}
            {mounted && user && isBothRoles && (
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
            {user && mounted && (
              <div className="kw-dd-wrap" style={{position:'relative'}}>
                <button className="kw-notif-btn" onClick={() => {
                  setNotifOpen(!notifOpen)
                  setDdOpen(false)
                }}>
                  🔔
                  {unreadCount > 0 && <span className="kw-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="kw-notif-dd">
                    <div className="kw-notif-header">
                      <h4>Notificaties</h4>
                      {unreadCount > 0 && (
                        <button onClick={async () => {
                          await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
                          setNotifs(prev => prev.map(n => ({ ...n, read: true })))
                        }} style={{fontSize:11,color:'#4A7C3F',fontWeight:700,background:'none',border:'none',cursor:'pointer'}}>
                          Alles gelezen
                        </button>
                      )}
                    </div>
                    {notifs.length === 0 ? (
                      <div className="kw-notif-empty">🔔 Geen notificaties</div>
                    ) : (
                      notifs.slice(0, 8).map(n => (
                        <a key={n.id} href={n.link || '/account'} className={`kw-notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={async () => {
                            if (!n.read) {
                              await supabase.from('notifications').update({ read: true }).eq('id', n.id)
                              setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
                            }
                            setNotifOpen(false)
                          }}>
                          <div className="kw-notif-title">{!n.read && '● '}{n.title}</div>
                          {n.message && <div className="kw-notif-msg">{n.message}</div>}
                          <div className="kw-notif-time">{new Date(n.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        </a>
                      ))
                    )}
                    <a href="/account?panel=berichten" style={{display:'block',padding:'10px',textAlign:'center',fontSize:12,color:'#4A7C3F',fontWeight:700,borderTop:'1px solid #F5EDE0'}} onClick={() => setNotifOpen(false)}>
                      Alle notificaties →
                    </a>
                  </div>
                )}
              </div>
            )}
            {mounted && user ? (
              <a href="/account" className="kw-user">
                <div className="kw-ua">
                  {(user.user_metadata?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <span className="kw-user-name">{user.user_metadata?.first_name || 'Account'}</span>
              </a>
            ) : mounted ? (
              <a href="/auth" className="kw-login">Inloggen →</a>
            ) : null}
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
