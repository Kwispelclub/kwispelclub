'use client'

import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Panel = 'overview' | 'pets' | 'orders' | 'favorites' | 'listings' | 'bookings' | 'academy' | 'berichten' | 'settings'

// Wrapper voor Suspense boundary (vereist door useSearchParams)
export default function AccountPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF9F0' }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: '#4A7C3F' }}>🐾 Even laden...</div>
      </div>
    }>
      <AccountPage />
    </Suspense>
  )
}

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

function getTrackingUrl(trackingNumber: string): { url: string; carrier: string } | null {
  const t = trackingNumber.replace(/\s/g, '').toUpperCase()
  // PostNL: begint met 3S, JVGL, of TNPOST
  if (/^(3S|JVGL|TNPOST)/i.test(t)) {
    return { url: `https://postnl.nl/tracktrace/?B=${t}&P=`, carrier: 'PostNL' }
  }
  // bpost: begint met 323, JD, of is 10-14 cijfers
  if (/^(323|JD)/i.test(t) || /^\d{10,14}$/.test(t)) {
    return { url: `https://track.bpost.cloud/btr/web/#/search?itemCode=${t}`, carrier: 'bpost' }
  }
  // DHL: begint met 1Z of JD
  if (/^(1Z)/i.test(t)) {
    return { url: `https://www.dhl.com/be-nl/home/tracking.html?tracking-id=${t}`, carrier: 'DHL' }
  }
  // DPD: begint met 0
  if (/^\d{14}$/.test(t)) {
    return { url: `https://tracking.dpd.de/status/nl_NL/parcel/${t}`, carrier: 'DPD' }
  }
  // Onbekend — generieke bpost link
  return { url: `https://track.bpost.cloud/btr/web/#/search?itemCode=${t}`, carrier: 'Track' }
}

function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel>('overview')
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState('Opslaan')
  const [unreadCount, setUnreadCount] = useState(0)

  const [orders, setOrders] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [favLoading, setFavLoading] = useState(false)
  const [pets, setPets] = useState<any[]>([])
  const [petsLoading, setPetsLoading] = useState(false)
  const [showPetForm, setShowPetForm] = useState(false)
  const [editPet, setEditPet] = useState<any>(null)
  const [petNaam, setPetNaam] = useState('')
  const [petSoort, setPetSoort] = useState('Hond')
  const [petRas, setPetRas] = useState('')
  const [petGeboortedatum, setPetGeboortedatum] = useState('')
  const [petGeslacht, setPetGeslacht] = useState('')
  const [petFotoUrl, setPetFotoUrl] = useState('')
  const [petSaving, setPetSaving] = useState(false)
  const [uploadingPetFoto, setUploadingPetFoto] = useState(false)
  // Berichten state
  const [inbox, setInbox] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [inboxLoading, setInboxLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      loadOrders(user.id)
      loadInbox(user.id)
      loadFavorites(user.id)
      loadPets(user.id)
    })

    // Check URL params voor directe berichten navigatie
    const panel = searchParams.get('panel')
    const conv = searchParams.get('conv')
    if (panel === 'berichten') {
      setActivePanel('berichten')
      if (conv) setActiveConv(conv)
    }
  }, [])

  useEffect(() => {
    if (activeConv && user) loadMessages(activeConv, user.id)
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  
  const loadOrders = async (userId: string) => {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
  setOrders(data || [])
}

  const loadFavorites = async (userId: string) => {
    setFavLoading(true)
    const { data } = await supabase
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setFavorites(data || [])
    setFavLoading(false)
  }

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from('favorites').delete().eq('id', favoriteId)
    setFavorites(prev => prev.filter(f => f.id !== favoriteId))
  }


  const loadPets = async (userId: string) => {
    setPetsLoading(true)
    const { data } = await supabase.from('pets').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setPets(data || [])
    setPetsLoading(false)
  }

  const openPetForm = (pet?: any) => {
    if (pet) {
      setEditPet(pet)
      setPetNaam(pet.naam || '')
      setPetSoort(pet.soort || 'Hond')
      setPetRas(pet.ras || '')
      setPetGeboortedatum(pet.geboortedatum || '')
      setPetGeslacht(pet.geslacht || '')
      setPetFotoUrl(pet.foto_url || '')
    } else {
      setEditPet(null)
      setPetNaam(''); setPetSoort('Hond'); setPetRas(''); setPetGeboortedatum(''); setPetGeslacht(''); setPetFotoUrl('')
    }
    setShowPetForm(true)
  }

  const savePet = async () => {
    if (!petNaam || !petSoort) return
    setPetSaving(true)
    const petData = { naam: petNaam, soort: petSoort, ras: petRas || null, geboortedatum: petGeboortedatum || null, geslacht: petGeslacht || null, foto_url: petFotoUrl || null, user_id: user.id }
    if (editPet) {
      await supabase.from('pets').update(petData).eq('id', editPet.id)
    } else {
      await supabase.from('pets').insert(petData)
    }
    await loadPets(user.id)
    setShowPetForm(false)
    setPetSaving(false)
  }

  const deletePet = async (id: string) => {
    if (!confirm('Huisdier verwijderen?')) return
    await supabase.from('pets').delete().eq('id', id)
    setPets(prev => prev.filter(p => p.id !== id))
  }

  const uploadPetFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPetFoto(true)
    const ext = file.name.split('.').pop()
    const path = `huisdieren/${user.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('listings').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: url } = supabase.storage.from('listings').getPublicUrl(data.path)
      setPetFotoUrl(url.publicUrl)
    }
    setUploadingPetFoto(false)
  }

  const loadInbox = async (userId: string) => {
    setInboxLoading(true)
    try {
      const res = await fetch(`/api/messages?user_id=${userId}`)
      const data = await res.json()
      setInbox(data.inbox || [])
      // Tel ongelezen berichten
      const unread = (data.inbox || []).filter((m: any) => !m.gelezen && m.receiver_id === userId).length
      setUnreadCount(unread)
    } catch (e) { console.error(e) }
    setInboxLoading(false)
  }

  const loadMessages = async (convId: string, userId: string) => {
    try {
      const res = await fetch(`/api/messages?conversation_id=${convId}&user_id=${userId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      // Refresh inbox om gelezen status te updaten
      loadInbox(userId)
    } catch (e) { console.error(e) }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeConv) return
    setSendingMsg(true)
    try {
      // Vind de andere persoon in de conversatie
      const conv = inbox.find(m => m.conversation_id === activeConv)
      const receiverId = conv?.sender_id === user.id ? conv?.receiver_id : conv?.sender_id

      if (!receiverId) return

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          conversation_id: activeConv,
          message: newMessage.trim(),
        })
      })
      setNewMessage('')
      loadMessages(activeConv, user.id)
    } catch (e) { console.error(e) }
    setSendingMsg(false)
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

  const navItems: { id: Panel; icon: string; label: string; badge?: number }[] = [
    { id: 'overview',  icon: '📊', label: 'Overzicht' },
    { id: 'pets',      icon: '🐾', label: 'Mijn Huisdieren' },
    { id: 'orders',    icon: '📦', label: 'Bestellingen' },
    { id: 'favorites', icon: '❤️', label: 'Favorieten' },
    { id: 'listings',  icon: '♻️', label: 'Mijn 2de Hands' },
    { id: 'bookings',  icon: '✂️', label: 'Afspraken' },
    { id: 'academy',   icon: '🎓', label: 'Academy' },
    { id: 'berichten', icon: '💬', label: 'Berichten', badge: unreadCount || undefined },
    { id: 'settings',  icon: '⚙️', label: 'Instellingen' },
  ]

  const activeConvData = inbox.find(m => m.conversation_id === activeConv)

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .account-layout{max-width:1320px;margin:0 auto;padding:32px clamp(16px,4vw,48px);display:grid;grid-template-columns:260px 1fr;gap:28px;min-height:calc(100vh - 120px)}
        .account-sidebar{display:flex;flex-direction:column;gap:8px}
        .profile-card{background:var(--white);border-radius:20px;padding:28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);margin-bottom:8px}
        .profile-avatar{width:80px;height:80px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;margin:0 auto 14px;border:4px solid var(--green-pale)}
        .profile-name{font-size:18px;font-weight:700;margin-bottom:6px}
        .profile-role{font-size:12px;padding:3px 12px;border-radius:50px;display:inline-block;font-weight:700;color:var(--green-dark);background:var(--green-pale)}
        .profile-since{font-size:12px;color:var(--text-light);margin-top:8px}
        .sidebar-nav a{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;text-decoration:none;color:var(--text-mid);font-weight:600;font-size:14px;transition:all .15s;cursor:pointer;position:relative}
        .sidebar-nav a:hover{background:var(--cream);color:var(--text-dark)}
        .sidebar-nav a.active{background:var(--green-pale);color:var(--green-dark)}
        .nav-icon{width:24px;text-align:center;font-size:16px}
        .nav-badge{margin-left:auto;background:var(--red);color:white;font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px}
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

        /* BERICHTEN STYLES */
        .chat-layout{display:grid;grid-template-columns:280px 1fr;gap:0;background:var(--white);border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;min-height:500px}
        .chat-inbox{border-right:2px solid var(--cream-dark);overflow-y:auto}
        .chat-inbox-header{padding:16px 20px;border-bottom:2px solid var(--cream-dark);font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;color:var(--green-dark)}
        .conv-item{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;border-bottom:1px solid var(--cream-dark);transition:background .15s}
        .conv-item:hover{background:var(--cream)}
        .conv-item.active{background:var(--green-pale)}
        .conv-avatar{width:40px;height:40px;border-radius:50%;background:var(--green-main);color:white;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0}
        .conv-info{flex:1;min-width:0}
        .conv-name{font-size:13px;font-weight:700;color:var(--text-dark);margin-bottom:2px}
        .conv-preview{font-size:12px;color:var(--text-light);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .conv-unread{width:8px;height:8px;border-radius:50%;background:var(--green-main);flex-shrink:0}
        .chat-window{display:flex;flex-direction:column}
        .chat-header{padding:16px 20px;border-bottom:2px solid var(--cream-dark);display:flex;align-items:center;gap:12px}
        .chat-header-name{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:700;color:var(--text-dark)}
        .chat-header-sub{font-size:12px;color:var(--text-light)}
        .chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;min-height:350px}
        .msg{display:flex;gap:8px;max-width:75%}
        .msg.mine{align-self:flex-end;flex-direction:row-reverse}
        .msg-avatar{width:32px;height:32px;border-radius:50%;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;color:var(--green-dark)}
        .msg-bubble{padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5}
        .msg.mine .msg-bubble{background:var(--green-main);color:white;border-bottom-right-radius:4px}
        .msg.theirs .msg-bubble{background:var(--cream-dark);color:var(--text-dark);border-bottom-left-radius:4px}
        .msg-time{font-size:11px;opacity:.6;margin-top:4px;text-align:right}
        .chat-input{padding:16px 20px;border-top:2px solid var(--cream-dark);display:flex;gap:10px}
        .chat-input input{flex:1;padding:11px 16px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .chat-input input:focus{border-color:var(--green-main)}
        .chat-send{padding:11px 20px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .chat-send:hover{background:var(--green-dark)}
        .chat-send:disabled{opacity:.5;cursor:not-allowed}
        .chat-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px;text-align:center;color:var(--text-light)}
        .chat-empty .ei{font-size:40px;margin-bottom:12px;opacity:.4}

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
          .chat-layout{grid-template-columns:1fr}
          .chat-inbox{border-right:none;border-bottom:2px solid var(--cream-dark)}
        }
      `}</style>

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
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
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
                ['🐾', String(pets.length), 'Huisdieren', 'pets'],
                ['📦', String(orders.length), 'Bestellingen', 'orders'],
                ['❤️', String(favorites.length), 'Favorieten', 'favorites'],
                ['💬', String(unreadCount || 0), 'Berichten', 'berichten'],
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
            <div className="panel-header">
              <h2>Mijn Huisdieren 🐾</h2>
              <button className="btn btn-green" onClick={() => openPetForm()}>+ Toevoegen</button>
            </div>

            {/* FORMULIER */}
            {showPetForm && (
              <div style={{ background: 'var(--cream)', borderRadius: 16, padding: 24, marginBottom: 24, border: '2px solid var(--cream-dark)' }}>
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', marginBottom: 16, color: 'var(--green-dark)' }}>{editPet ? 'Huisdier Bewerken' : 'Nieuw Huisdier'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Naam *</label>
                    <input value={petNaam} onChange={e => setPetNaam(e.target.value)} placeholder="Bijv. Max" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--cream-dark)', fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Soort *</label>
                    <select value={petSoort} onChange={e => setPetSoort(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--cream-dark)', fontFamily: 'Nunito, sans-serif', fontSize: 14, background: 'white', outline: 'none' }}>
                      <option>Hond</option><option>Kat</option><option>Konijn</option><option>Vogel</option><option>Vis</option><option>Knaagdier</option><option>Reptiel</option><option>Anders</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Ras</label>
                    <input value={petRas} onChange={e => setPetRas(e.target.value)} placeholder="Bijv. Labrador" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--cream-dark)', fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Geboortedatum</label>
                    <input type="date" value={petGeboortedatum} onChange={e => setPetGeboortedatum(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--cream-dark)', fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Geslacht</label>
                    <select value={petGeslacht} onChange={e => setPetGeslacht(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--cream-dark)', fontFamily: 'Nunito, sans-serif', fontSize: 14, background: 'white', outline: 'none' }}>
                      <option value="">Onbekend</option><option value="Mannelijk">Mannelijk</option><option value="Vrouwelijk">Vrouwelijk</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Foto</label>
                    <label style={{ display: 'block', padding: '10px 14px', borderRadius: 10, border: '2px dashed var(--cream-dark)', cursor: 'pointer', fontSize: 13, color: 'var(--text-mid)', textAlign: 'center' }}>
                      {uploadingPetFoto ? '⏳ Uploaden...' : petFotoUrl ? '✅ Foto geüpload' : '📸 Foto uploaden'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPetFoto} />
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-green" onClick={savePet} disabled={petSaving || !petNaam}>{petSaving ? 'Opslaan...' : '✓ Opslaan'}</button>
                  <button className="btn btn-ghost" onClick={() => setShowPetForm(false)}>Annuleren</button>
                </div>
              </div>
            )}

            {/* LIJST */}
            {petsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ Laden...</div>
            ) : pets.length === 0 && !showPetForm ? (
              <EmptyState icon="🐾" title="Nog geen huisdieren" desc="Voeg je hond, kat of ander huisdier toe." cta="+ Huisdier Toevoegen" onCtaClick={() => openPetForm()} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {pets.map(pet => {
                  const leeftijd = pet.geboortedatum ? Math.floor((Date.now() - new Date(pet.geboortedatum).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
                  const emoji = pet.soort === 'Hond' ? '🐶' : pet.soort === 'Kat' ? '🐱' : pet.soort === 'Konijn' ? '🐰' : pet.soort === 'Vogel' ? '🐦' : pet.soort === 'Vis' ? '🐟' : '🐾'
                  return (
                    <div key={pet.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '2px solid var(--cream-dark)' }}>
                      {pet.foto_url
                        ? <img src={pet.foto_url} alt={pet.naam} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: 140, background: 'linear-gradient(135deg, var(--cream), var(--cream-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{emoji}</div>}
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>{pet.naam}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 2 }}>{pet.soort}{pet.ras ? ` · ${pet.ras}` : ''}</div>
                        {leeftijd !== null && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{leeftijd} jaar{pet.geslacht ? ` · ${pet.geslacht}` : ''}</div>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openPetForm(pet)}>✏️ Bewerken</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deletePet(pet.id)}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        {/* ORDERS */}
<div className={`panel ${activePanel === 'orders' ? 'active' : ''}`}>
  <div className="panel-header"><h2>Bestellingen 📦</h2></div>
  {orders.length === 0 ? (
    <EmptyState icon="📦" title="Nog geen bestellingen" desc="Je bestellingen verschijnen hier na betaling." cta="Ga naar de Shop" ctaHref="/winkel" />
  ) : (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {orders.map(o => (
        <div key={o.id} className="card" style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,color:'var(--green-dark)'}}>
              Order #{o.order_number || o.id.slice(0,8)}
            </div>
            <span style={{padding:'3px 12px',borderRadius:50,fontSize:12,fontWeight:700,
              background: o.status==='paid'||o.status==='betaald' ? 'var(--green-pale)'
                : o.status==='shipped' ? 'var(--teal-pale,#E0F5F1)'
                : o.status==='delivered' ? 'var(--green-pale)'
                : 'var(--orange-pale)',
              color: o.status==='paid'||o.status==='betaald' ? 'var(--green-dark)'
                : o.status==='shipped' ? '#2A9D8F'
                : o.status==='delivered' ? 'var(--green-dark)'
                : '#5C3D2E'}}>
              {o.status==='paid'||o.status==='betaald' ? '✅ Betaald'
                : o.status==='shipped' ? '📦 Verzonden'
                : o.status==='delivered' ? '🏠 Geleverd'
                : o.status==='pending' ? '⏳ In behandeling'
                : o.status}
            </span>
          </div>
          {o.tracking_number && (() => {
            const info = getTrackingUrl(o.tracking_number)
            return (
              <div style={{background:'#E0F5F1',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <div style={{fontSize:13,fontWeight:600,color:'#2A9D8F'}}>
                  📦 Tracking: <strong>{o.tracking_number}</strong>
                </div>
                {info && (
                  <a href={info.url} target="_blank" rel="noopener noreferrer"
                    style={{display:'inline-flex',alignItems:'center',gap:4,padding:'6px 14px',borderRadius:50,background:'#2A9D8F',color:'white',fontSize:12,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>
                    🔍 Volg via {info.carrier} →
                  </a>
                )}
              </div>
            )
          })()}
          {(o.order_items||[]).map((item:any) => (
            <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--text-mid)'}}>
              <span>{item.naam||item.product_name} × {item.aantal||item.quantity}</span>
              <span>€{((item.prijs||item.unit_price)*(item.aantal||item.quantity)).toFixed(2)}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid var(--cream-dark)',fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,color:'var(--green-dark)'}}>
            <span>Totaal</span>
            <span>€{Number(o.total||o.totaal||0).toFixed(2)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:12,color:'var(--text-light)'}}>
              {new Date(o.created_at).toLocaleDateString('nl-BE',{day:'2-digit',month:'long',year:'numeric'})}
            </div>
            <button
              onClick={() => {
                const sellerId = o.order_items?.[0]?.verkoper_id
                if (sellerId) {
                  setActivePanel('berichten')
                } else {
                  alert('Geen verkoper gekoppeld aan deze bestelling.')
                }
              }}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:50,border:'2px solid var(--green-main)',background:'transparent',color:'var(--green-main)',fontFamily:'Fredoka,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'}}
              onMouseOver={e=>(e.currentTarget.style.background='var(--green-pale)')}
              onMouseOut={e=>(e.currentTarget.style.background='transparent')}
            >
              💬 Vraag stellen
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          {/* FAVORITES */}
          <div className={`panel ${activePanel === 'favorites' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Favorieten ❤️</h2></div>
            {favLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ Laden...</div>
            ) : favorites.length === 0 ? (
              <EmptyState icon="❤️" title="Nog geen favorieten" desc="Klik op het hartje bij een product om het op te slaan." cta="Ontdek de Shop" ctaHref="/winkel" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {favorites.map(f => {
                  const p = f.products
                  if (!p) return null
                  const fotoUrl = p.image_url || (Array.isArray(p.images) && p.images[0]) || null
                  return (
                    <div key={f.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '2px solid var(--cream-dark)', position: 'relative' }}>
                      <button
                        onClick={() => removeFavorite(f.id)}
                        title="Verwijder favoriet"
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
                      >❤️</button>
                      <a href={`/winkel/${p.seller_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {fotoUrl
                          ? <img src={fotoUrl} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', background: 'var(--cream)' }} />
                          : <div style={{ width: '100%', height: 140, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🐾</div>}
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text-dark)' }}>{p.name}</div>
                          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--green-main)' }}>€{parseFloat(p.price).toFixed(2)}</div>
                        </div>
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
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
            <EmptyState icon="♻️" title="Nog geen advertenties" desc="Verkoop tweedehands huisdierartikelen aan andere leden." cta="Eerste Advertentie Plaatsen" ctaHref="/2dehands" />
          </div>

          {/* BOOKINGS */}
          <div className={`panel ${activePanel === 'bookings' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Afspraken ✂️</h2>
              <a href="/kapsalons" className="btn btn-green">+ Afspraak Boeken</a>
            </div>
            <EmptyState icon="✂️" title="Nog geen afspraken" desc="Boek een knip- of groomingafspraak bij een kapsalon in jouw buurt." cta="Kapsalons Bekijken" ctaHref="/kapsalons" />
          </div>

          {/* ACADEMY */}
          <div className={`panel ${activePanel === 'academy' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Academy 🎓</h2></div>
            <EmptyState icon="🎓" title="Cursussen komen eraan" desc="Kwispelclub Academy brengt trainingen voor puppyopvoeding, gedrag en meer." cta="Meer Info" ctaHref="/#academy" />
          </div>

          {/* BERICHTEN */}
          <div className={`panel ${activePanel === 'berichten' ? 'active' : ''}`}>
            <div className="panel-header"><h2>Berichten 💬</h2></div>
            <div className="chat-layout">
              {/* Inbox */}
              <div className="chat-inbox">
                <div className="chat-inbox-header">Conversaties</div>
                {inboxLoading ? (
                  <div style={{ padding: 20, color: 'var(--text-light)', fontSize: 13 }}>⏳ Laden...</div>
                ) : inbox.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8, opacity: .3 }}>💬</div>
                    Nog geen berichten
                  </div>
                ) : (
                  inbox.map(conv => {
                    const isMe = conv.sender_id === user?.id
                    const otherName = isMe
                      ? `${conv.receiver?.first_name || ''} ${conv.receiver?.last_name?.[0] || ''}.`
                      : `${conv.sender?.first_name || ''} ${conv.sender?.last_name?.[0] || ''}.`
                    const initials2 = otherName.trim()[0]?.toUpperCase() || '?'
                    const unread = !conv.gelezen && conv.receiver_id === user?.id

                    return (
                      <div
                        key={conv.conversation_id}
                        className={`conv-item ${activeConv === conv.conversation_id ? 'active' : ''}`}
                        onClick={() => setActiveConv(conv.conversation_id)}
                      >
                        <div className="conv-avatar">{initials2}</div>
                        <div className="conv-info">
                          <div className="conv-name">{otherName}</div>
                          <div className="conv-preview">
                            {conv.product?.name && <span style={{ color: 'var(--green-main)', fontWeight: 700 }}>{conv.product.name} · </span>}
                            {conv.body}
                          </div>
                        </div>
                        {unread && <div className="conv-unread" />}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat venster */}
              <div className="chat-window">
                {!activeConv ? (
                  <div className="chat-empty">
                    <div className="ei">💬</div>
                    <p>Selecteer een conversatie om te chatten</p>
                  </div>
                ) : (
                  <>
                    <div className="chat-header">
                      <div className="conv-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                        {(() => {
                          const isMe = activeConvData?.sender_id === user?.id
                          const name = isMe
                            ? activeConvData?.receiver?.first_name
                            : activeConvData?.sender?.first_name
                          return name?.[0]?.toUpperCase() || '?'
                        })()}
                      </div>
                      <div>
                        <div className="chat-header-name">
                          {(() => {
                            const isMe = activeConvData?.sender_id === user?.id
                            return isMe
                              ? `${activeConvData?.receiver?.first_name || ''} ${activeConvData?.receiver?.last_name?.[0] || ''}.`
                              : `${activeConvData?.sender?.first_name || ''} ${activeConvData?.sender?.last_name?.[0] || ''}.`
                          })()}
                        </div>
                        {activeConvData?.product?.name && (
                          <div className="chat-header-sub">Over: {activeConvData.product.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="chat-messages">
                      {messages.map(msg => (
                        <div key={msg.id} className={`msg ${msg.sender_id === user?.id ? 'mine' : 'theirs'}`}>
                          <div className="msg-avatar">
                            {msg.sender?.first_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="msg-bubble">{msg.body}</div>
                            <div className="msg-time">
                              {new Date(msg.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input">
                      <input
                        placeholder="Typ een bericht..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      />
                      <button className="chat-send" onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()}>
                        {sendingMsg ? '...' : 'Verstuur →'}
                      </button>
                    </div>
                  </>
                )}
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
