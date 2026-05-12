'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase'


const REGIONS = [['all','Alle'],['limburg','Limburg'],['antwerpen','Antwerpen'],['brabant','Brabant'],['oost-vl','Oost-Vlaanderen'],['nl','Nederland']]
const MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAYS = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag']
const SERVICES = [
  { name:'Volledig Trimmen', desc:'Wassen, knippen, drogen & stylen', price:45, dur:'60 min', icon:'✂️' },
  { name:'Wassen & Drogen', desc:'Professioneel bad & föhnen', price:25, dur:'30 min', icon:'🛁' },
  { name:'Nagels Knippen', desc:'Veilig nagelverzorging', price:12, dur:'15 min', icon:'💅' },
  { name:'Puppy Eerste Beurt', desc:'Zachte kennismaking met trimmen', price:35, dur:'45 min', icon:'🐶' },
]

// NA:
export default function KapsalonsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [region, setRegion] = useState('all')
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState<Set<string>>(() => new Set())
  const [salons, setSalons] = useState<any[]>([])
  const [loadingSalons, setLoadingSalons] = useState(false)
  const [modal, setModal] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [selSvc, setSelSvc] = useState<typeof SERVICES[0]|null>(null)
  // ✅ FIX: null ipv new Date() om hydration error te vermijden
  const [calDate, setCalDate] = useState<Date|null>(null)
  const [today, setToday] = useState<Date|null>(null)
  const [selDate, setSelDate] = useState<Date|null>(null)
  const [selTime, setSelTime] = useState('')
  const [petName, setPetName] = useState('')
  const [petBreed, setPetBreed] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [regNaam, setRegNaam] = useState('')
  const [regLoc, setRegLoc] = useState('')
  const [regStad, setRegStad] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regTel, setRegTel] = useState('')
  const [regType, setRegType] = useState('Trimsalon (alle rassen)')
  const [regLoading, setRegLoading] = useState(false)
  const [regDone, setRegDone] = useState(false)
  const [regError, setRegError] = useState('')
  const obsRef = useRef<IntersectionObserver|null>(null)

  useEffect(() => {
    const t = new Date()
    t.setHours(0,0,0,0)
    setToday(t)
    setCalDate(new Date(t))

    supabase.from('kapsalons')
      .select('*')
      .eq('actief', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSalons(data || [])
      })

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (user) {
        setRegEmail(user.email || '')
        if (user.user_metadata?.salonnaam) setRegNaam(user.user_metadata.salonnaam)
        if (user.user_metadata?.stad) setRegStad(user.user_metadata.stad)
      }
    })

    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e,i) => { if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'),i*60); obsRef.current?.unobserve(e.target) } })
    }, {threshold:0.08})
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))
  }, [])

    const handleRegister = async () => {
    if (!regNaam || !regLoc || !regEmail) { setRegError('Vul alle verplichte velden in'); return }
    setRegLoading(true); setRegError('')
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    const { error } = await supabase.from('kapsalons').insert({
      naam: regNaam, locatie: regLoc, stad: regStad, email: regEmail,
      telefoon: regTel, type_salon: regType, owner_id: user?.id || null,
      actief: false, geverifieerd: false,
    })
    if (error) {
      setRegError('Er ging iets mis. Stuur een e-mail naar info@kwispelclub.be')
    } else {
      setRegDone(true)
      if (user) await supabase.auth.updateUser({ data: { role: 'kapsalon', salonnaam: regNaam, stad: regStad } })
    }
    setRegLoading(false)
  }

  const filtered = salons.filter(s => {
    const matchRegion = region === 'all' ||
      (s.regio || '').toLowerCase().includes(region.toLowerCase()) ||
      (s.stad || '').toLowerCase().includes(region.toLowerCase()) ||
      (s.locatie || '').toLowerCase().includes(region.toLowerCase())
    const matchSearch = !search || (s.naam || '').toLowerCase().includes(search.toLowerCase()) || (s.stad || '').toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchSearch
  })

  const openModal = async (salon: any) => {
    setModal(salon); setStep(1); setSelSvc(null); setSelDate(null); setSelTime('')
    setPetName(''); setPetBreed(''); setOwnerName(''); setOwnerPhone(''); setOwnerEmail(''); setNotes('')
    document.body.style.overflow = 'hidden'
    // Laad bestaande boekingen voor deze salon
    const { data } = await supabase
      .from('boekingen')
      .select('datum, tijdslot')
      .eq('salon_id', salon.id)
      .in('status', ['bevestigd'])
    if (data) {
      const slots: Record<string, string[]> = {}
      data.forEach(b => {
        if (!slots[b.datum]) slots[b.datum] = []
        slots[b.datum].push(b.tijdslot)
      })
      setBezetteSlotsPerDag(slots)
    }
  }
  const closeModal = () => { setModal(null); document.body.style.overflow = '' }

  const canNext = step===1?!!selSvc:step===2?!!(selDate&&selTime):step===3?!!(petName&&petBreed&&ownerName&&ownerPhone&&ownerEmail):true

  // ✅ Kalender berekeningen — alleen als calDate en today beschikbaar zijn
  const firstDay = calDate ? new Date(calDate.getFullYear(), calDate.getMonth(), 1) : null
  let startDay = firstDay ? firstDay.getDay()-1 : 0; if(startDay<0) startDay=6
  const daysInMonth = calDate ? new Date(calDate.getFullYear(), calDate.getMonth()+1, 0).getDate() : 0
  const isTaken = (d:Date, slot:string) => {
    const datumStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return (bezetteSlotsPerDag[datumStr] || []).includes(slot)
  }
  const morningSlots = ['09:00','09:30','10:00','10:30','11:00','11:30']
  const afternoonSlots = selDate?.getDay()===6?['12:00','12:30','13:00','13:30']:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']
  const formatDate = (d:Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:Fredoka,sans-serif}
    .beta-bar{background:linear-gradient(90deg,var(--orange-main),#D4812E,var(--orange-main));background-size:200%;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600;animation:shimmer 3s ease infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .breadcrumb{max-width:1320px;margin:0 auto;padding:20px clamp(16px,4vw,48px) 0;font-size:14px;color:var(--text-light)}.breadcrumb a{color:var(--green-main);text-decoration:none;font-weight:600}
    .page-hero{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}.hero-card{background:linear-gradient(135deg,var(--brown),#8B6F5E,var(--orange-main));border-radius:36px;overflow:hidden;position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:400px}
    .hero-content{padding:56px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:20px;width:fit-content}.hero-content h1{font-size:clamp(32px,4vw,48px);color:white;line-height:1.1;margin-bottom:16px}.accent{color:#F5A855}.hero-content p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:28px;max-width:420px}.hero-img{position:relative;overflow:hidden}.hero-img img{width:100%;height:100%;object-fit:cover;mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%);-webkit-mask-image:linear-gradient(to left,rgba(0,0,0,1) 50%,transparent 100%)}
    .blob{position:absolute;border-radius:50%;pointer-events:none}.b1{width:300px;height:300px;background:rgba(255,255,255,.08);top:-80px;right:-40px}.b2{width:200px;height:200px;background:rgba(232,145,58,.1);bottom:-60px;left:20%}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:Fredoka,sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}.btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}.btn-white{background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3)}.btn-white:hover{background:rgba(255,255,255,.25)}
    .section{max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}.section-header{text-align:center;margin-bottom:48px}.section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}.section-header p{color:var(--text-mid);font-size:16px;max-width:560px;margin:0 auto;line-height:1.6}
    .services-box{background:var(--white);border-radius:28px;padding:48px}.services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:36px}.svc-card{text-align:center;padding:28px 16px;border-radius:20px;background:var(--cream);transition:all .3s}.svc-card:hover{transform:translateY(-4px)}.svc-icon{font-size:40px;margin-bottom:14px}.svc-card h4{font-size:15px;margin-bottom:6px}.svc-card p{font-size:13px;color:var(--text-mid);line-height:1.5}.svc-price{font-family:Fredoka,sans-serif;font-size:16px;font-weight:700;color:var(--green-dark);margin-top:10px}
    .filters-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px;align-items:center}.filter-group{display:flex;gap:8px;flex-wrap:wrap}.filter-btn{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}.filter-btn.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}.filter-btn:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
    .search-wrap{flex:1;min-width:240px;position:relative}.search-wrap input{width:100%;padding:10px 16px 10px 40px;border:2px solid var(--cream-dark);border-radius:50px;font-family:Nunito,sans-serif;font-size:14px;background:var(--white);outline:none;transition:all .25s}.search-wrap input:focus{border-color:var(--green-light)}.search-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.35}
    .salons-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .salon-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}.salon-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
    .salon-cover{height:200px;position:relative;overflow:hidden;background:var(--cream-dark)}.salon-cover img{width:100%;height:100%;object-fit:cover;transition:transform .4s}.salon-card:hover .salon-cover img{transform:scale(1.05)}
    .salon-cover-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:56px;background:linear-gradient(135deg,var(--cream),var(--cream-dark))}
    .salon-bdg{position:absolute;top:14px;left:14px;display:flex;gap:6px}.salon-badge{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white}.bgeverifieerd{background:#2A9D8F}
    .fav-btn{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:all .2s;z-index:2}.fav-btn.liked{color:var(--red)}
    .salon-info{padding:20px}.salon-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}.salon-name{font-family:Fredoka,sans-serif;font-size:18px;font-weight:700}.salon-rating{display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:var(--orange-main)}.salon-rating span{font-size:12px;color:var(--text-light);font-weight:400}
    .salon-loc{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid);margin-bottom:12px}.salon-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}.tag{padding:4px 10px;border-radius:50px;font-size:11px;font-weight:600;background:var(--cream);color:var(--text-mid)}.tag.sp{background:var(--green-pale);color:var(--green-dark)}
    .salon-details{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--cream-dark)}.salon-price{font-size:14px;color:var(--text-mid)}.salon-price strong{color:var(--green-dark);font-size:16px;font-family:Fredoka,sans-serif}.salon-cta{padding:8px 18px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:Fredoka,sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}.salon-cta:hover{background:var(--green-dark);transform:translateY(-1px)}
    .empty-state{text-align:center;padding:48px;color:var(--text-light)}.empty-state .ei{font-size:40px;margin-bottom:12px;opacity:.4}
    .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:var(--brown);margin-bottom:24px}.demo-notice a{color:var(--orange-main);font-weight:700}
    .map-section{background:var(--green-pale);border-radius:28px;padding:48px;text-align:center}.map-ph{background:var(--white);border-radius:20px;height:320px;display:flex;align-items:center;justify-content:center;margin-top:24px;box-shadow:0 2px 8px rgba(0,0,0,.06);font-size:48px;position:relative}.map-ph::after{content:'Interactieve kaart — binnenkort beschikbaar';position:absolute;bottom:20px;font-size:14px;color:var(--text-light);font-weight:600}
    .register-section{background:linear-gradient(135deg,var(--brown),#8B6F5E);border-radius:28px;padding:48px;color:white;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}.register-section h2{color:white;font-size:28px;margin-bottom:14px}.register-section>div>p{opacity:.82;font-size:15px;line-height:1.65;margin-bottom:24px}
    .benefits{display:flex;flex-direction:column;gap:12px}.benefit{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}.bicon{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
    .reg-form{background:rgba(255,255,255,.08);border-radius:20px;padding:32px;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1)}.reg-form h3{font-size:20px;margin-bottom:6px;color:white}.reg-sub{font-size:13px;opacity:.6;margin-bottom:20px}
    .fg{margin-bottom:14px}.fg label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;opacity:.8}.fg input,.fg select{width:100%;padding:12px 16px;border:2px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(255,255,255,.08);color:white;font-family:Nunito,sans-serif;font-size:14px;outline:none;transition:all .2s}.fg input::placeholder{color:rgba(255,255,255,.4)}.fg input:focus,.fg select:focus{border-color:#F5A855;background:rgba(255,255,255,.12)}.fg select{-webkit-appearance:none;cursor:pointer}.fg select option{background:var(--brown);color:white}
    .reg-error{background:rgba(232,78,78,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:#FFB3B3;margin-bottom:14px;font-weight:600}
    .reg-success{text-align:center;padding:20px 0}.reg-success .si{font-size:48px;margin-bottom:12px}.reg-success h3{color:white;font-size:20px;margin-bottom:8px}.reg-success p{opacity:.8;font-size:14px;line-height:1.6}
    footer{background:var(--green-dark);color:white}.footer-inner{max-width:1320px;margin:0 auto;padding:48px clamp(16px,4vw,48px) 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}.footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none}.footer-logo .lp{background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.footer-logo .b{font-family:Fredoka,sans-serif;font-size:20px;font-weight:700;color:white}.footer-links{display:flex;gap:24px}.footer-links a{color:white;opacity:.6;text-decoration:none;font-size:14px;transition:opacity .2s}.footer-links a:hover{opacity:1}.footer-copy{font-size:13px;opacity:.4;width:100%;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}.modal{background:var(--white);border-radius:28px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 16px 56px rgba(0,0,0,.14);position:relative}
    .modal-header{padding:28px 28px 0;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.modal-header h2{font-size:22px;color:var(--green-dark)}.modal-header p{font-size:13px;color:var(--text-mid);margin-top:4px}.modal-close{width:40px;height:40px;border-radius:50%;border:none;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:all .2s}.modal-close:hover{background:var(--cream-dark)}
    .modal-body{padding:24px 28px 28px}
    .steps{display:flex;align-items:center;gap:0;margin-bottom:24px}.bstep{display:flex;align-items:center;gap:6px;flex:1}.bstep::after{content:'';flex:1;height:3px;background:var(--cream-dark);border-radius:4px;margin:0 6px}.bstep:last-child::after{display:none}.bstep:last-child{flex:0 0 auto}.step-n{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:13px;font-weight:700;flex-shrink:0;transition:all .3s;background:var(--cream-dark);color:var(--text-light)}.bstep.active .step-n{background:var(--green-main);color:white}.bstep.done .step-n{background:var(--green-dark);color:white}.bstep.done::after{background:var(--green-main)}.step-lbl{font-size:11px;font-weight:700;color:var(--text-light);white-space:nowrap}.bstep.active .step-lbl{color:var(--green-dark)}.bstep.done .step-lbl{color:var(--green-main)}
    .svc-opts{display:flex;flex-direction:column;gap:10px}.svc-opt{display:flex;align-items:center;gap:14px;padding:16px;border:2px solid var(--cream-dark);border-radius:12px;cursor:pointer;transition:all .2s}.svc-opt:hover{border-color:var(--green-light);background:var(--cream)}.svc-opt.selected{border-color:var(--green-main);background:var(--green-pale)}.svc-ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;background:var(--orange-pale)}.svc-inf{flex:1}.svc-n{font-weight:700;font-size:15px;margin-bottom:2px}.svc-d{font-size:12px;color:var(--text-light)}.svc-p{font-family:Fredoka,sans-serif;font-size:18px;font-weight:700;color:var(--green-dark);text-align:right}.svc-dur{font-size:11px;color:var(--text-light);display:block}.svc-chk{width:24px;height:24px;border-radius:50%;border:2px solid var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:all .2s}.svc-opt.selected .svc-chk{background:var(--green-main);border-color:var(--green-main);color:white}
    .cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.cal-hdr h3{font-size:17px}.cal-nav{display:flex;gap:6px}.cal-nav button{width:36px;height:36px;border-radius:50%;border:2px solid var(--cream-dark);background:transparent;cursor:pointer;font-size:14px;transition:all .2s;display:flex;align-items:center;justify-content:center}.cal-nav button:hover{border-color:var(--green-main);background:var(--green-pale)}
    .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-bottom:20px}.day-name{font-size:11px;font-weight:700;color:var(--text-light);padding:8px 0;text-transform:uppercase}
    .cal-day{padding:10px 4px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;border:2px solid transparent}.cal-day:hover:not(.disabled):not(.empty){background:var(--green-pale);border-color:var(--green-light)}.cal-day.selected{background:var(--green-main);color:white;border-color:var(--green-main)}.cal-day.today{border-color:var(--orange-main)}.cal-day.disabled{opacity:.25;cursor:default}.cal-day.empty{cursor:default}
    .slots-lbl{font-size:12px;font-weight:700;color:var(--text-light);text-transform:uppercase;margin:16px 0 8px;letter-spacing:.5px}.time-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.time-slot{padding:10px;border-radius:10px;border:2px solid var(--cream-dark);text-align:center;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}.time-slot:hover:not(.taken){border-color:var(--green-light);background:var(--green-pale)}.time-slot.selected{background:var(--green-main);color:white;border-color:var(--green-main)}.time-slot.taken{opacity:.25;cursor:not-allowed;text-decoration:line-through}.no-slots{text-align:center;padding:24px;color:var(--text-light);font-size:14px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bf{margin-bottom:16px}.bf label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:var(--text-dark)}.bf input,.bf select,.bf textarea{width:100%;padding:12px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:Nunito,sans-serif;font-size:14px;outline:none;transition:all .2s;background:var(--white)}.bf input:focus,.bf select:focus,.bf textarea:focus{border-color:var(--green-light)}.bf textarea{resize:vertical;min-height:70px}
    .confirm-sum{background:var(--cream);border-radius:20px;padding:24px;margin-bottom:20px}.crow{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--cream-dark);font-size:14px}.crow:last-child{border-bottom:none;font-weight:700;font-size:16px;color:var(--green-dark)}.crow .lbl{color:var(--text-mid)}
    .modal-footer{display:flex;justify-content:space-between;gap:12px;padding-top:16px;border-top:2px solid var(--cream-dark)}.btn-back{padding:12px 24px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:Fredoka,sans-serif;font-size:14px;font-weight:600;cursor:pointer;color:var(--text-mid);transition:all .2s}.btn-back:hover{border-color:var(--text-light)}.btn-next{padding:12px 28px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:Fredoka,sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}.btn-next:hover:not(:disabled){background:var(--green-dark)}.btn-next:disabled{opacity:.4;cursor:not-allowed}.btn-next.orange{background:var(--orange-main)}.btn-next.orange:hover:not(:disabled){background:#D4812E}
    .success-state{text-align:center;padding:20px 0}.sicon{font-size:64px;margin-bottom:16px}.success-state h2{color:var(--green-dark);margin-bottom:10px}.success-state p{color:var(--text-mid);font-size:15px;line-height:1.6;margin-bottom:20px}.success-details{background:var(--green-pale);border-radius:12px;padding:20px;text-align:left;margin-bottom:20px;font-size:14px;line-height:1.9}.success-details strong{color:var(--green-dark)}
    .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}.fade-up.visible{opacity:1;transform:translateY(0)}
    @media(max-width:1024px){.salons-grid{grid-template-columns:repeat(2,1fr)}.services-grid{grid-template-columns:repeat(2,1fr)}.register-section{grid-template-columns:1fr}.hero-card{grid-template-columns:1fr}.hero-img{display:none}}
    @media(max-width:768px){.salons-grid{grid-template-columns:1fr}.hero-content{padding:36px 24px}}
    @media(max-width:480px){.time-slots{grid-template-columns:repeat(3,1fr)}.form-row{grid-template-columns:1fr}}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />
      <div className="breadcrumb"><a href="/">Home</a> › Hondenkapsalons</div>

      <section className="page-hero">
        <div className="hero-card">
          <div className="blob b1"/><div className="blob b2"/>
          <div className="hero-content">
            <div className="hero-tag">✂️ KWISPELCLUB KAPSALONS</div>
            <h1>Honden<span className="accent">kapsalons</span> bij jou in de buurt</h1>
            <p>Vind de beste trimsalons en groomers in België en Nederland. Geverifieerd, beoordeeld door echte klanten.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="#salons" className="btn btn-primary">Zoek kapsalon →</a>
              <a href="#register" className="btn btn-white">Registreer je salon</a>
            </div>
          </div>
          <div className="hero-img">
            <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=700&q=80" alt="Hond bij de groomer" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="services-box">
          <div className="section-header"><h2>Populaire Diensten ✂️</h2><p>Wat je kunt verwachten bij onze kapsalons</p></div>
          <div className="services-grid">
            {[['✂️','Volledig Trimmen','Wassen, knippen, drogen en stylen op maat van het ras','Vanaf €35'],
              ['🛁','Wassen & Drogen','Professioneel bad met speciale shampoo en föhnen','Vanaf €20'],
              ['💅','Nagels Knippen','Veilig en stress-vrij nagelverzorging door experts','Vanaf €10'],
              ['👂','Oren & Tanden','Oorcontrole, reiniging en tandenpoetsen','Vanaf €15']].map(([icon,title,desc,price]) => (
              <div key={String(title)} className="svc-card"><div className="svc-icon">{icon}</div><h4>{title}</h4><p>{desc}</p><div className="svc-price">{price}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="salons">
        <div className="section-header fade-up"><h2>Kapsalons bij jou in de buurt 📍</h2><p>Geverifieerde salons met echte klantbeoordelingen</p></div>
        {salons.length === 0 && !loadingSalons && (
          <div className="demo-notice fade-up">✂️ Nog geen salons geregistreerd — Ben jij groomer? <a href="#register">Registreer je salon gratis →</a></div>
        )}
        <div className="filters-bar fade-up">
          <div className="filter-group">
            {REGIONS.map(([id,label]) => <button key={id} className={`filter-btn ${region===id?'active':''}`} onClick={() => setRegion(id)}>{label}</button>)}
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Zoek op naam of stad..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loadingSalons ? (
          <div className="empty-state"><div className="ei">⏳</div><p>Salons laden...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="ei">✂️</div><p>Geen salons gevonden. Pas je filter aan of <a href="#register" style={{color:'var(--green-main)',fontWeight:700}}>registreer jouw salon</a>.</p></div>
        ) : (
          <div className="salons-grid fade-up">
            {filtered.map(s => (
              <div key={s.id} className="salon-card">
                <div className="salon-cover">
                  {s.foto_url ? <img src={s.foto_url} alt={s.naam} /> : <div className="salon-cover-placeholder">✂️</div>}
                  <div className="salon-bdg">{s.geverifieerd && <span className="salon-badge bgeverifieerd">✓ Geverifieerd</span>}</div>
                  <button className={`fav-btn ${liked.has(s.id)?'liked':''}`} onClick={() => { const n=new Set(liked); n.has(s.id)?n.delete(s.id):n.add(s.id); setLiked(n) }}>{liked.has(s.id)?'♥':'♡'}</button>
                </div>
                <div className="salon-info">
                  <div className="salon-head">
                    <div className="salon-name">{s.naam}</div>
                    {s.rating && <div className="salon-rating">⭐ {s.rating} <span>({s.reviews_count || 0})</span></div>}
                  </div>
                  <div className="salon-loc">📍 {s.locatie || s.stad}</div>
                  {s.type_salon && <div className="salon-tags"><span className="tag sp">{s.type_salon}</span></div>}
                  <div className="salon-details">
                    <div className="salon-price">{s.prijs_vanaf ? <>Vanaf <strong>€{s.prijs_vanaf}</strong></> : <span style={{fontSize:12,color:'var(--text-light)'}}>Prijs op aanvraag</span>}</div>
                    <button className="salon-cta" onClick={() => openModal(s)}>Bekijk & Boek</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="map-section fade-up">
          <h2>Vind een Salon op de Kaart 🗺️</h2>
          <p style={{color:'var(--text-mid)',marginTop:8}}>Zoek salons in jouw buurt via onze interactieve kaart</p>
          <div className="map-ph">🗺️</div>
        </div>
      </section>

      <section className="section" id="register">
        <div className="register-section fade-up">
          <div>
            <h2>Heb je een hondenkapsalon? ✂️</h2>
            <p>Word zichtbaar voor duizenden huisdiereigenaren in België en Nederland. Registreer je salon gratis op Kwispelclub.</p>
            <div className="benefits">
              {[['👥','Bereik 12.500+ actieve diereneigenaren'],['📅','Online boekingssysteem inbegrepen'],['⭐','Verzamel reviews en bouw reputatie'],['📊','Inzicht in je statistieken'],['🏷️','Eerste 3 maanden gratis']].map(([icon,text]) => (
                <div key={String(text)} className="benefit"><div className="bicon">{icon}</div>{text}</div>
              ))}
            </div>
          </div>
          <div className="reg-form">
            {regDone ? (
              <div className="reg-success">
                <div className="si">✅</div>
                <h3>Aanvraag ontvangen!</h3>
                <p>We hebben je salonaanvraag ontvangen. Je hoort van ons binnen 2 werkdagen via <strong>{regEmail}</strong>.</p>
              </div>
            ) : (
              <>
                <h3>Registreer je Salon</h3>
                <div className="reg-sub">We nemen binnen 2 werkdagen contact met je op.</div>
                {regError && <div className="reg-error">⚠️ {regError}</div>}
                <div className="fg"><label>Salonnaam *</label><input placeholder="Bijv. Happy Paws Grooming" value={regNaam} onChange={e => setRegNaam(e.target.value)} /></div>
                <div className="fg"><label>Locatie (stad + provincie) *</label><input placeholder="Bijv. Bree, Limburg" value={regLoc} onChange={e => setRegLoc(e.target.value)} /></div>
                <div className="fg"><label>Stad</label><input placeholder="Bijv. Bree" value={regStad} onChange={e => setRegStad(e.target.value)} /></div>
                <div className="fg"><label>E-mailadres *</label><input type="email" placeholder="info@jouwsalon.be" value={regEmail} onChange={e => setRegEmail(e.target.value)} /></div>
                <div className="fg"><label>Telefoon</label><input type="tel" placeholder="+32 ..." value={regTel} onChange={e => setRegTel(e.target.value)} /></div>
                <div className="fg"><label>Type Salon</label>
                  <select value={regType} onChange={e => setRegType(e.target.value)}>
                    <option>Trimsalon (alle rassen)</option>
                    <option>Gespecialiseerd (kleine rassen)</option>
                    <option>Gespecialiseerd (grote rassen)</option>
                    <option>Mobiele trimmer</option>
                    <option>Premium / Spa salon</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}} onClick={handleRegister} disabled={regLoading}>
                  {regLoading ? 'Bezig...' : 'Gratis registreren →'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="b">Kwispelclub</span></a>
          <div className="footer-links"><a href="/">Home</a><a href="/#shop">Shop</a><a href="/puppy-training">Academy</a><a href="/kapsalons">Kapsalons</a></div>
          <div className="footer-copy">© 2026 Kwispelclub. Alle rechten voorbehouden. 🇧🇪 België & 🇳🇱 Nederland</div>
        </div>
      </footer>

      {modal && calDate && today && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div><h2>{modal.naam}</h2><p>📍 {modal.locatie || modal.stad}</p></div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {step<=4&&(
                <div className="steps">
                  {[['1','Dienst'],['2','Datum & Tijd'],['3','Gegevens'],['4','Bevestig']].map(([n,lbl],i)=>(
                    <div key={n} className={`bstep ${step===i+1?'active':step>i+1?'done':''}`}>
                      <div className="step-n">{step>i+1?'✓':n}</div>
                      <span className="step-lbl">{lbl}</span>
                    </div>
                  ))}
                </div>
              )}
              {step===1&&(
                <div className="svc-opts">
                  {SERVICES.map(s=>(
                    <div key={s.name} className={`svc-opt ${selSvc?.name===s.name?'selected':''}`} onClick={()=>setSelSvc(s)}>
                      <div className="svc-ic">{s.icon}</div>
                      <div className="svc-inf"><div className="svc-n">{s.name}</div><div className="svc-d">{s.desc}</div></div>
                      <div className="svc-p">€{s.price}<span className="svc-dur">{s.dur}</span></div>
                      <div className="svc-chk">{selSvc?.name===s.name?'✓':''}</div>
                    </div>
                  ))}
                </div>
              )}
              {step===2&&(
                <>
                  <div className="cal-hdr">
                    <h3>{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</h3>
                    <div className="cal-nav">
                      <button onClick={()=>{const d=new Date(calDate);d.setMonth(d.getMonth()-1);if(d>=new Date(today.getFullYear(),today.getMonth()))setCalDate(d)}}>◀</button>
                      <button onClick={()=>{const d=new Date(calDate);d.setMonth(d.getMonth()+1);setCalDate(d)}}>▶</button>
                    </div>
                  </div>
                  <div className="cal-grid">
                    {['Ma','Di','Wo','Do','Vr','Za','Zo'].map(d=><div key={d} className="day-name">{d}</div>)}
                    {Array(startDay).fill(null).map((_,i)=><div key={`e${i}`} className="cal-day empty"/>)}
                    {Array(daysInMonth).fill(null).map((_,i)=>{
                      const d=new Date(calDate.getFullYear(),calDate.getMonth(),i+1)
                      const isPast=d<today,isSun=d.getDay()===0
                      const isSel=selDate?.getTime()===d.getTime()
                      let cls='cal-day'
                      if(isPast||isSun)cls+=' disabled'
                      if(d.getTime()===today.getTime())cls+=' today'
                      if(isSel)cls+=' selected'
                      return <div key={i} className={cls} onClick={()=>{if(!isPast&&!isSun){setSelDate(d);setSelTime('')}}}>{i+1}</div>
                    })}
                  </div>
                  {selDate?(
                    <>
                      <div className="slots-lbl">🌅 Ochtend</div>
                      <div className="time-slots">{morningSlots.map(s=>{const taken=isTaken(selDate,s);return <div key={s} className={`time-slot ${taken?'taken':selTime===s?'selected':''}`} onClick={()=>!taken&&setSelTime(s)}>{s}</div>})}</div>
                      <div className="slots-lbl">☀️ Middag</div>
                      <div className="time-slots">{afternoonSlots.map(s=>{const taken=isTaken(selDate,s);return <div key={s} className={`time-slot ${taken?'taken':selTime===s?'selected':''}`} onClick={()=>!taken&&setSelTime(s)}>{s}</div>})}</div>
                    </>
                  ):<div className="no-slots">👆 Kies eerst een datum hierboven</div>}
                </>
              )}
              {step===3&&(
                <>
                  <div className="form-row">
                    <div className="bf"><label>Naam huisdier *</label><input placeholder="Bijv. Max" value={petName} onChange={e=>setPetName(e.target.value)}/></div>
                    <div className="bf"><label>Ras *</label><input placeholder="Bijv. Labrador" value={petBreed} onChange={e=>setPetBreed(e.target.value)}/></div>
                  </div>
                  <div className="form-row">
                    <div className="bf"><label>Grootte</label><select><option>Klein (&lt;10kg)</option><option>Middel (10-25kg)</option><option>Groot (25-40kg)</option><option>Extra groot (&gt;40kg)</option></select></div>
                    <div className="bf"><label>Leeftijd</label><select><option>Puppy (&lt;1 jaar)</option><option>Volwassen (1-7 jaar)</option><option>Senior (7+ jaar)</option></select></div>
                  </div>
                  <div className="bf"><label>Jouw naam *</label><input placeholder="Jouw volledige naam" value={ownerName} onChange={e=>setOwnerName(e.target.value)}/></div>
                  <div className="form-row">
                    <div className="bf"><label>Telefoon *</label><input type="tel" placeholder="+32 ..." value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)}/></div>
                    <div className="bf"><label>E-mail *</label><input type="email" placeholder="jouw@email.be" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)}/></div>
                  </div>
                  <div className="bf"><label>Opmerkingen</label><textarea placeholder="Allergieën, bijzonderheden..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
                </>
              )}
              {step===4&&selSvc&&selDate&&(
                <div className="confirm-sum">
                  {[['Salon',modal.naam],['Dienst',`${selSvc.name} (${selSvc.dur})`],['Datum',formatDate(selDate)],['Tijdslot',selTime],['Huisdier',`${petName} (${petBreed})`],['Eigenaar',ownerName],['Contact',ownerPhone],['Totaal',`€${selSvc.price}`]].map(([lbl,val])=>(
                    <div key={lbl} className="crow"><span className="lbl">{lbl}</span><span>{val}</span></div>
                  ))}
                </div>
              )}
              {step===5&&selSvc&&selDate&&(
                <div className="success-state">
                  <div className="sicon">✅</div>
                  <h2>Afspraak Bevestigd!</h2>
                  <p>Je ontvangt een bevestiging per e-mail met alle details.</p>
                  <div className="success-details">
                    <strong>📍 {modal.naam}</strong><br/>{modal.locatie || modal.stad}<br/><br/>
                    <strong>✂️ {selSvc.name}</strong> · {selSvc.dur}<br/>
                    <strong>📅 {formatDate(selDate)}</strong> om <strong>{selTime}</strong><br/><br/>
                    <strong>🐕 {petName}</strong> ({petBreed})<br/>
                    <strong>👤 {ownerName}</strong>
                  </div>
                  <button className="btn btn-primary" style={{margin:'0 auto'}} onClick={closeModal}>Sluiten</button>
                </div>
              )}
              {step<=4&&(
                <div className="modal-footer">
                  {step>1?<button className="btn-back" onClick={()=>setStep(s=>s-1)}>← Vorige</button>:<span/>}
                  <button className={`btn-next ${step===4?'orange':''}`} disabled={!canNext} onClick={()=>{if(step===4)setStep(5);else setStep(s=>s+1)}}>
                    {step===4?'✓ Bevestig Afspraak':'Volgende →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
