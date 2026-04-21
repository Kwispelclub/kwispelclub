'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/images'

type AdminTab = 'overview' | 'users' | 'salons' | 'listings' | 'photos' | 'settings'

type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  status: string
  verified: boolean
  avatar_url: string
  company_name: string
  created_at: string
}

type Salon = {
  id: string
  name: string
  location: string
  status: string
  rating: number
  review_count: number
  image_url: string
  images: string[]
  owner_id: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<AdminTab>('overview')

  // Data
  const [users, setUsers] = useState<Profile[]>([])
  const [salons, setSalons] = useState<Salon[]>([])
  const [stats, setStats] = useState({ users: 0, salons: 0, listings: 0, pending: 0 })

  // UI state
  const [userFilter, setUserFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [salonFilter, setSalonFilter] = useState('all')
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingUpload, setPendingUpload] = useState<{ type: 'avatar' | 'salon'; id: string } | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/account')
      return
    }

    await loadData()
    setLoading(false)
  }

  const loadData = async () => {
    const [usersRes, salonsRes, listingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('salons').select('*').order('created_at', { ascending: false }),
      supabase.from('second_hand_listings').select('id, status', { count: 'exact' }),
    ])

    const u = usersRes.data || []
    const s = salonsRes.data || []
    setUsers(u)
    setSalons(s)
    setStats({
      users: u.length,
      salons: s.length,
      listings: listingsRes.count || 0,
      pending: u.filter((x: Profile) => x.status === 'pending').length + s.filter((x: Salon) => x.status === 'pending').length,
    })
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── USER ACTIONS ─────────────────────────────────────────────
  const updateUserRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    showToast('Rol bijgewerkt')
  }

  const updateUserStatus = async (id: string, status: string) => {
    await supabase.from('profiles').update({ status }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
    showToast('Status bijgewerkt')
  }

  const verifyUser = async (id: string, verified: boolean) => {
    await supabase.from('profiles').update({ verified }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, verified } : u))
    showToast(verified ? 'Gebruiker geverifieerd ✓' : 'Verificatie ingetrokken')
  }

  // ── SALON ACTIONS ────────────────────────────────────────────
  const updateSalonStatus = async (id: string, status: string) => {
    await supabase.from('salons').update({ status }).eq('id', id)
    setSalons(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    showToast('Salon status bijgewerkt')
  }

  // ── PHOTO UPLOAD ─────────────────────────────────────────────
  const handlePhotoClick = (type: 'avatar' | 'salon', id: string) => {
    setPendingUpload({ type, id })
    fileRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pendingUpload) return
    setUploadingFor(pendingUpload.id)

    try {
      const folder = pendingUpload.type === 'avatar' ? 'avatars' : 'salons'
      const url = await uploadImage(file, folder, pendingUpload.id, pendingUpload.type === 'avatar')

      if (pendingUpload.type === 'avatar') {
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', pendingUpload.id)
        setUsers(prev => prev.map(u => u.id === pendingUpload.id ? { ...u, avatar_url: url } : u))
      } else {
        await supabase.from('salons').update({ image_url: url }).eq('id', pendingUpload.id)
        setSalons(prev => prev.map(s => s.id === pendingUpload.id ? { ...s, image_url: url } : s))
      }
      showToast('Foto bijgewerkt ✓')
    } catch {
      showToast('Upload mislukt — probeer opnieuw')
    }

    setUploadingFor(null)
    setPendingUpload(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDeletePhoto = async (type: 'avatar' | 'salon', id: string, url: string) => {
    if (!url) return
    if (!confirm('Foto verwijderen?')) return
    await deleteImage(url)
    if (type === 'avatar') {
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, avatar_url: '' } : u))
    } else {
      await supabase.from('salons').update({ image_url: null }).eq('id', id)
      setSalons(prev => prev.map(s => s.id === id ? { ...s, image_url: '' } : s))
    }
    showToast('Foto verwijderd')
  }

  // ── FILTERED DATA ────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchRole = userFilter === 'all' || u.role === userFilter
    const matchSearch = !userSearch ||
      `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
    return matchRole && matchSearch
  })

  const filteredSalons = salons.filter(s =>
    salonFilter === 'all' || s.status === salonFilter
  )

  const roleColor: Record<string, string> = {
    admin: '#7C3AED', koper: '#4A7C3F', verkoper: '#E8913A', kapsalon: '#2A9D8F'
  }
  const statusColor: Record<string, string> = {
    active: '#4A7C3F', pending: '#E8913A', suspended: '#E84E4E', inactive: '#8A8A8A'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1117' }}>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: '#4A7C3F' }}>🐾 Admin laden...</div>
    </div>
  )

  const tabs: { id: AdminTab; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overzicht' },
    { id: 'users', icon: '👥', label: `Gebruikers (${stats.users})` },
    { id: 'salons', icon: '✂️', label: `Salons (${stats.salons})` },
    { id: 'listings', icon: '♻️', label: '2de Hands' },
    { id: 'photos', icon: '🖼️', label: "Foto's" },
    { id: 'settings', icon: '⚙️', label: 'Instellingen' },
  ]

  return (
    <>
      <style>{`
        :root{--bg:#0F1117;--surface:#1A1D27;--surface2:#22263A;--border:#2A2D3E;--green:#4A7C3F;--green-light:#6B9E5E;--orange:#E8913A;--red:#E84E4E;--purple:#7C3AED;--teal:#2A9D8F;--text:#E8EAF0;--text-mid:#9CA3AF;--text-dim:#5A6070;--white:#FFFFFF;--radius:12px}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .admin-layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
        .sidebar{background:var(--surface);border-right:1px solid var(--border);padding:24px 0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
        .sidebar-logo{display:flex;align-items:center;gap:10px;padding:0 20px 28px;border-bottom:1px solid var(--border);margin-bottom:12px}
        .logo-paw{width:36px;height:36px;border-radius:10px;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:18px}
        .sidebar-logo span{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--white)}
        .sidebar-logo .badge{font-size:10px;background:var(--purple);color:white;padding:2px 8px;border-radius:50px;font-weight:700;margin-left:4px}
        .nav-item{display:flex;align-items:center;gap:10px;padding:11px 20px;cursor:pointer;transition:all .15s;color:var(--text-mid);font-weight:600;font-size:14px;border-left:3px solid transparent}
        .nav-item:hover{background:var(--surface2);color:var(--text)}
        .nav-item.active{background:var(--surface2);color:var(--green-light);border-left-color:var(--green)}
        .nav-icon{font-size:16px;width:20px;text-align:center}
        .sidebar-bottom{margin-top:auto;padding:16px 20px;border-top:1px solid var(--border)}
        .main{padding:32px;overflow-x:hidden}
        .page-title{font-size:28px;font-weight:700;margin-bottom:6px;color:var(--white)}
        .page-sub{font-size:14px;color:var(--text-mid);margin-bottom:28px}
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
        .stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:border-color .2s}
        .stat:hover{border-color:var(--green)}
        .stat-label{font-size:12px;color:var(--text-mid);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
        .stat-val{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:var(--white);line-height:1}
        .stat-sub{font-size:12px;color:var(--text-dim);margin-top:4px}
        .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
        .card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-header h3{font-size:16px;font-weight:700;color:var(--white)}
        .toolbar{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap}
        .search-input{flex:1;min-width:200px;padding:8px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'Nunito',sans-serif;font-size:13px;outline:none}
        .search-input:focus{border-color:var(--green)}
        .search-input::placeholder{color:var(--text-dim)}
        .filter-btn{padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-mid);font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
        .filter-btn.active{background:var(--green);border-color:var(--green);color:white}
        .filter-btn:hover:not(.active){border-color:var(--green);color:var(--green-light)}
        table{width:100%;border-collapse:collapse}
        th{padding:12px 16px;text-align:left;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text-dim);border-bottom:1px solid var(--border)}
        td{padding:14px 16px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:var(--surface2)}
        .avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--text-mid);overflow:hidden;flex-shrink:0}
        .avatar img{width:100%;height:100%;object-fit:cover}
        .user-info{display:flex;align-items:center;gap:10px}
        .user-name{font-weight:700;font-size:13px;color:var(--white)}
        .user-email{font-size:11px;color:var(--text-dim)}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.3px}
        .select-sm{padding:5px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Nunito',sans-serif;font-size:12px;cursor:pointer;outline:none}
        .select-sm:focus{border-color:var(--green)}
        .btn-sm{padding:6px 14px;border-radius:6px;border:none;font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
        .btn-verify{background:rgba(74,124,63,.15);color:var(--green-light);border:1px solid rgba(74,124,63,.3)}
        .btn-verify:hover{background:rgba(74,124,63,.3)}
        .btn-suspend{background:rgba(232,78,78,.1);color:var(--red);border:1px solid rgba(232,78,78,.2)}
        .btn-suspend:hover{background:rgba(232,78,78,.2)}
        .btn-photo{background:rgba(42,157,143,.15);color:var(--teal);border:1px solid rgba(42,157,143,.3)}
        .btn-photo:hover{background:rgba(42,157,143,.3)}
        .btn-photo.uploading{opacity:.6;cursor:not-allowed}
        .btn-primary{background:var(--green);color:white;padding:10px 20px;border-radius:8px;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .btn-primary:hover{background:var(--green-light);transform:translateY(-1px)}
        .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;padding:20px}
        .photo-item{background:var(--surface2);border-radius:10px;overflow:hidden;border:1px solid var(--border)}
        .photo-img{width:100%;height:140px;object-fit:cover;background:var(--border)}
        .photo-img-placeholder{width:100%;height:140px;display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--surface2);color:var(--text-dim)}
        .photo-info{padding:10px 12px}
        .photo-name{font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .photo-actions{display:flex;gap:6px}
        .toast{position:fixed;bottom:24px;right:24px;background:var(--surface);border:1px solid var(--green);border-radius:10px;padding:12px 20px;font-size:13px;font-weight:700;color:var(--green-light);z-index:9999;animation:slideIn .3s ease;box-shadow:0 8px 32px rgba(0,0,0,.4)}
        @keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .empty{text-align:center;padding:48px;color:var(--text-dim)}
        .empty-icon{font-size:40px;margin-bottom:12px;opacity:.3}
        .pending-dot{width:8px;height:8px;border-radius:50%;background:var(--orange);display:inline-block;margin-right:6px;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .recent-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
        .recent-item:last-child{border-bottom:none}
        @media(max-width:900px){
          .admin-layout{grid-template-columns:1fr}
          .sidebar{display:none}
          .stats-row{grid-template-columns:1fr 1fr}
          .overview-grid{grid-template-columns:1fr}
        }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-paw">🐾</div>
            <span>Kwispelclub</span>
            <span className="badge">ADMIN</span>
          </div>
          {tabs.map(t => (
            <div key={t.id} className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              {t.label}
              {t.id === 'overview' && stats.pending > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--orange)', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 50 }}>{stats.pending}</span>
              )}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Ingelogd als admin</div>
            <button onClick={() => { supabase.auth.signOut(); router.push('/') }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, width: '100%' }}>
              Uitloggen
            </button>
            <div style={{ marginTop: 10 }}>
              <a href="/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← Terug naar site</a>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <>
              <div className="page-title">Dashboard</div>
              <div className="page-sub">Overzicht van Kwispelclub</div>
              <div className="stats-row">
                {[
                  { label: 'Gebruikers', val: stats.users, sub: 'Geregistreerd', icon: '👥', color: 'var(--green)' },
                  { label: 'Salons', val: stats.salons, sub: 'Kapsalons', icon: '✂️', color: 'var(--teal)' },
                  { label: '2de Hands', val: stats.listings, sub: 'Advertenties', icon: '♻️', color: 'var(--orange)' },
                  { label: 'In afwachting', val: stats.pending, sub: 'Te beoordelen', icon: '⏳', color: 'var(--purple)' },
                ].map(s => (
                  <div key={s.label} className="stat">
                    <div className="stat-label">{s.icon} {s.label}</div>
                    <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="overview-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>👥 Recente Gebruikers</h3>
                    <button className="filter-btn" onClick={() => setTab('users')}>Alle →</button>
                  </div>
                  <div style={{ padding: '0 20px' }}>
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="recent-item">
                        <div className="avatar">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" /> : `${u.first_name?.[0] || '?'}${u.last_name?.[0] || ''}`}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="user-name">{u.first_name} {u.last_name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                        <span className="badge" style={{ background: `${roleColor[u.role] || '#8A8A8A'}22`, color: roleColor[u.role] || '#8A8A8A' }}>{u.role}</span>
                      </div>
                    ))}
                    {users.length === 0 && <div className="empty"><div className="empty-icon">👥</div>Nog geen gebruikers</div>}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h3>✂️ Recente Salons</h3>
                    <button className="filter-btn" onClick={() => setTab('salons')}>Alle →</button>
                  </div>
                  <div style={{ padding: '0 20px' }}>
                    {salons.slice(0, 5).map(s => (
                      <div key={s.id} className="recent-item">
                        <div className="avatar" style={{ borderRadius: 8 }}>
                          {s.image_url ? <img src={s.image_url} alt="" /> : '✂️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="user-name">{s.name}</div>
                          <div className="user-email">{s.location}</div>
                        </div>
                        <span className="badge" style={{ background: `${statusColor[s.status] || '#8A8A8A'}22`, color: statusColor[s.status] || '#8A8A8A' }}>{s.status}</span>
                      </div>
                    ))}
                    {salons.length === 0 && <div className="empty"><div className="empty-icon">✂️</div>Nog geen salons</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <>
              <div className="page-title">Gebruikers</div>
              <div className="page-sub">{stats.users} geregistreerde gebruikers</div>
              <div className="card">
                <div className="toolbar">
                  <input className="search-input" placeholder="🔍 Zoek op naam of e-mail..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  {['all', 'koper', 'verkoper', 'kapsalon', 'admin'].map(r => (
                    <button key={r} className={`filter-btn ${userFilter === r ? 'active' : ''}`} onClick={() => setUserFilter(r)}>
                      {r === 'all' ? 'Alle' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="empty"><div className="empty-icon">👥</div>Geen gebruikers gevonden</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Gebruiker</th>
                        <th>Rol</th>
                        <th>Status</th>
                        <th>Geverifieerd</th>
                        <th>Lid sinds</th>
                        <th>Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="user-info">
                              <div className="avatar">
                                {u.avatar_url ? <img src={u.avatar_url} alt="" /> : `${u.first_name?.[0] || '?'}${u.last_name?.[0] || ''}`}
                              </div>
                              <div>
                                <div className="user-name">{u.first_name} {u.last_name}</div>
                                <div className="user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select className="select-sm" value={u.role} onChange={e => updateUserRole(u.id, e.target.value)}>
                              {['koper', 'verkoper', 'kapsalon', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="select-sm" value={u.status || 'active'} onChange={e => updateUserStatus(u.id, e.target.value)}>
                              {['active', 'pending', 'suspended', 'inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <button className={`btn-sm ${u.verified ? 'btn-verify' : 'btn-suspend'}`} onClick={() => verifyUser(u.id, !u.verified)}>
                              {u.verified ? '✓ Geverifieerd' : '✗ Niet geverifieerd'}
                            </button>
                          </td>
                          <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                            {new Date(u.created_at).toLocaleDateString('nl-BE')}
                          </td>
                          <td>
                            <button
                              className={`btn-sm btn-photo ${uploadingFor === u.id ? 'uploading' : ''}`}
                              onClick={() => uploadingFor !== u.id && handlePhotoClick('avatar', u.id)}
                            >
                              {uploadingFor === u.id ? '⏳' : '📷'} Foto
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── SALONS ── */}
          {tab === 'salons' && (
            <>
              <div className="page-title">Kapsalons</div>
              <div className="page-sub">{stats.salons} salons geregistreerd</div>
              <div className="card">
                <div className="toolbar">
                  {['all', 'active', 'pending', 'suspended'].map(s => (
                    <button key={s} className={`filter-btn ${salonFilter === s ? 'active' : ''}`} onClick={() => setSalonFilter(s)}>
                      {s === 'all' ? 'Alle' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                {filteredSalons.length === 0 ? (
                  <div className="empty"><div className="empty-icon">✂️</div>Geen salons gevonden</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Salon</th>
                        <th>Locatie</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalons.map(s => (
                        <tr key={s.id}>
                          <td>
                            <div className="user-info">
                              <div className="avatar" style={{ borderRadius: 8 }}>
                                {s.image_url ? <img src={s.image_url} alt="" /> : '✂️'}
                              </div>
                              <div className="user-name">{s.name}</div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-mid)' }}>{s.location || '—'}</td>
                          <td style={{ color: 'var(--orange)' }}>
                            {s.rating ? `⭐ ${Number(s.rating).toFixed(1)}` : '—'}
                            {s.review_count ? <span style={{ color: 'var(--text-dim)', fontSize: 11 }}> ({s.review_count})</span> : ''}
                          </td>
                          <td>
                            <select className="select-sm" value={s.status || 'pending'} onChange={e => updateSalonStatus(s.id, e.target.value)}>
                              {['active', 'pending', 'suspended', 'inactive'].map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className={`btn-sm btn-photo ${uploadingFor === s.id ? 'uploading' : ''}`}
                                onClick={() => uploadingFor !== s.id && handlePhotoClick('salon', s.id)}
                              >
                                {uploadingFor === s.id ? '⏳' : '📷'} Wijzigen
                              </button>
                              {s.image_url && (
                                <button className="btn-sm btn-suspend" onClick={() => handleDeletePhoto('salon', s.id, s.image_url)}>
                                  🗑️
                                </button>
                              )}
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

          {/* ── LISTINGS ── */}
          {tab === 'listings' && (
            <>
              <div className="page-title">2de Hands Advertenties</div>
              <div className="page-sub">Beheer alle tweedehands advertenties</div>
              <div className="card">
                <div className="empty" style={{ padding: 60 }}>
                  <div className="empty-icon">♻️</div>
                  <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>Nog geen advertenties</div>
                  <div style={{ fontSize: 13 }}>Zodra gebruikers advertenties plaatsen, beheer je ze hier.</div>
                </div>
              </div>
            </>
          )}

          {/* ── PHOTOS ── */}
          {tab === 'photos' && (
            <>
              <div className="page-title">Foto Beheer</div>
              <div className="page-sub">Alle profielfoto's en salonfoto's</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card">
                  <div className="card-header"><h3>👤 Profielfoto's</h3></div>
                  <div className="photo-grid">
                    {users.filter(u => u.avatar_url).map(u => (
                      <div key={u.id} className="photo-item">
                        <img className="photo-img" src={u.avatar_url} alt="" />
                        <div className="photo-info">
                          <div className="photo-name">{u.first_name} {u.last_name}</div>
                          <div className="photo-actions">
                            <button className="btn-sm btn-photo" onClick={() => handlePhotoClick('avatar', u.id)}>📷 Wijzigen</button>
                            <button className="btn-sm btn-suspend" onClick={() => handleDeletePhoto('avatar', u.id, u.avatar_url)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {users.filter(u => u.avatar_url).length === 0 && (
                      <div style={{ gridColumn: '1/-1' }} className="empty"><div className="empty-icon">👤</div>Geen profielfoto's</div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><h3>✂️ Salonfoto's</h3></div>
                  <div className="photo-grid">
                    {salons.filter(s => s.image_url).map(s => (
                      <div key={s.id} className="photo-item">
                        <img className="photo-img" src={s.image_url} alt="" />
                        <div className="photo-info">
                          <div className="photo-name">{s.name}</div>
                          <div className="photo-actions">
                            <button className="btn-sm btn-photo" onClick={() => handlePhotoClick('salon', s.id)}>📷 Wijzigen</button>
                            <button className="btn-sm btn-suspend" onClick={() => handleDeletePhoto('salon', s.id, s.image_url)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {salons.filter(s => s.image_url).length === 0 && (
                      <div style={{ gridColumn: '1/-1' }} className="empty"><div className="empty-icon">✂️</div>Geen salonfoto's</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <>
              <div className="page-title">Instellingen</div>
              <div className="page-sub">Platform configuratie</div>
              <div className="card" style={{ maxWidth: 560 }}>
                <div className="card-header"><h3>⚙️ Site Instellingen</h3></div>
                <div style={{ padding: 24 }}>
                  <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 10, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Jouw admin e-mail instellen</div>
                    Voer dit uit in de Supabase SQL Editor om jezelf admin te maken:
                    <pre style={{ marginTop: 10, background: 'var(--bg)', padding: 14, borderRadius: 8, fontSize: 12, color: '#6B9E5E', overflowX: 'auto' }}>
{`UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jouw@email.be';`}
                    </pre>
                  </div>
                  <div style={{ marginTop: 16, padding: 20, background: 'var(--surface2)', borderRadius: 10, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Storage bucket aanmaken</div>
                    Ga naar Supabase → Storage → New bucket<br />
                    Naam: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>kwispelclub</code><br />
                    Zet op <strong>Public</strong>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  )
}
