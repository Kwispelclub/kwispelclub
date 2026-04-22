'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const MONTH_NAMES = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAY_NAMES = ['Ma','Di','Wo','Do','Vr','Za','Zo']
const DAY_FULL = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag']

type Booking = {
  salon: string; location: string; service: string; price: number; dur: string
  date: Date | null; dateStr: string; time: string
  petName: string; petBreed: string; petSize: string; petAge: string
  ownerName: string; ownerPhone: string; ownerEmail: string; notes: string
}

const DEMO_SALONS = [
  { id: 1, name: 'Happy Paws Grooming', location: 'Bree, Limburg', region: 'limburg', rating: 4.9, reviews: 87, price: 30, badge: 'TOP', tags: ['Alle rassen', 'Hand-stripping', 'Puppypakket'], img: 'https://images.unsplash.com/photo-1527526029430-319f10814151?w=500&q=80' },
  { id: 2, name: 'De Gouden Schaar', location: 'Hasselt, Limburg', region: 'limburg', rating: 4.7, reviews: 42, price: 25, badge: 'NIEUW', tags: ['Kleine rassen', 'Spa-behandeling'], img: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=500&q=80' },
  { id: 3, name: 'Woef Wellness', location: 'Antwerpen', region: 'antwerpen', rating: 4.8, reviews: 156, price: 40, badge: 'TOP', tags: ['Premium salon', 'Grote rassen', 'Ophaalservice'], img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80' },
  { id: 4, name: 'Trim & Style', location: 'Leuven, Brabant', region: 'brabant', rating: 4.6, reviews: 68, price: 35, badge: 'PROMO', tags: ['Show-trimmen', 'Wedstrijdvoorbereiding'], img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80' },
  { id: 5, name: 'Knip & Kwispel', location: 'Gent, Oost-Vlaanderen', region: 'oost-vl', rating: 4.9, reviews: 203, price: 32, badge: '', tags: ['Biologische producten', 'Angst-vrij trimmen'], img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80' },
  { id: 6, name: 'Dierenkappers de Luxe', location: 'Maastricht, Nederland', region: 'nl', rating: 4.8, reviews: 134, price: 28, badge: 'TOP', tags: ['Hond & Kat', 'Creatief trimmen', 'Senior dieren'], img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80' },
]

const SERVICES = [
  { icon: '✂️', name: 'Volledig Trimmen', desc: 'Wassen, knippen, drogen & stylen', price: 45, dur: '60 min' },
  { icon: '🛁', name: 'Wassen & Drogen', desc: 'Professioneel bad & föhnen', price: 25, dur: '30 min' },
  { icon: '💅', name: 'Nagels Knippen', desc: 'Veilig nagelverzorging', price: 12, dur: '15 min' },
  { icon: '🐶', name: 'Puppy Eerste Beurt', desc: 'Zachte kennismaking met trimmen', price: 35, dur: '45 min' },
]

function formatDate(d: Date) {
  return `${DAY_FULL[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export default function KapsalonsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [regionFilter, setRegionFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [calDate, setCalDate] = useState(new Date())
  const [booking, setBooking] = useState<Booking>({
    salon: '', location: '', service: '', price: 0, dur: '',
    date: null, dateStr: '', time: '',
    petName: '', petBreed: '', petSize: 'Groot (25-40 kg)', petAge: 'Volwassen (1-7 jaar)',
    ownerName: '', ownerPhone: '', ownerEmail: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const filteredSalons = DEMO_SALONS.filter(s => {
    const matchRegion = regionFilter === 'all' || s.region === regionFilter
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchSearch
  })

  const openBooking = (salon: typeof DEMO_SALONS[0]) => {
    setBooking(b => ({ ...b, salon: salon.name, location: salon.location }))
    setStep(1)
    setSuccess(false)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); document.body.style.overflow = '' }

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  }, [modalOpen])

  // Calendar
  const renderCalDays = () => {
    const year = calDate.getFullYear()
    const month = calDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    let startDay = firstDay.getDay() - 1; if (startDay < 0) startDay = 6
    const days = []
    for (let i = 0; i < startDay; i++) days.push(<div key={`e${i}`} />)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isPast = date < today
      const isSunday = date.getDay() === 0
      const isSelected = booking.date?.getTime() === date.getTime()
      const isToday = date.getTime() === today.getTime()
      const disabled = isPast || isSunday
      days.push(
        <div
          key={d}
          onClick={() => !disabled && setBooking(b => ({ ...b, date, dateStr: `${year}-${month+1}-${d}`, time: '' }))}
          style={{
            padding: '10px 4px', borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer', transition: 'all .2s',
            opacity: disabled ? 0.25 : 1,
            background: isSelected ? '#4A7C3F' : 'transparent',
            color: isSelected ? 'white' : '#2C2C2C',
            border: isToday && !isSelected ? '2px solid #E8913A' : '2px solid transparent',
          }}
          onMouseEnter={e => !disabled && !isSelected && ((e.target as HTMLElement).style.background = '#E8F0E4')}
          onMouseLeave={e => !disabled && !isSelected && ((e.target as HTMLElement).style.background = 'transparent')}
        >{d}</div>
      )
    }
    return days
  }

  const getTimeSlots = () => {
    if (!booking.date) return []
    const isSaturday = booking.date.getDay() === 6
    const morning = ['09:00','09:30','10:00','10:30','11:00','11:30']
    const afternoon = isSaturday
      ? ['12:00','12:30','13:00','13:30']
      : ['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']
    const seed = booking.date.getDate() * 7 + booking.date.getMonth() * 31
    const isTaken = (i: number) => (seed * (i + 3) * 17) % 5 === 0
    return [
      { label: '🌅 Ochtend', slots: morning.map((s, i) => ({ time: s, taken: isTaken(i) })) },
      { label: '☀️ Middag', slots: afternoon.map((s, i) => ({ time: s, taken: isTaken(i + 10) })) },
    ]
  }

  const canProceed = () => {
    if (step === 1) return !!booking.service
    if (step === 2) return !!(booking.date && booking.time)
    if (step === 3) return !!(booking.petName && booking.petBreed && booking.ownerName && booking.ownerPhone && booking.ownerEmail)
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const bookingData = {
      salon_id: null, // demo — geen echte salon ID
      customer_id: user?.id || null,
      booking_date: booking.dateStr,
      time_slot: booking.time,
      status: 'pending',
      customer_name: booking.ownerName,
      customer_phone: booking.ownerPhone,
      customer_email: booking.ownerEmail,
      pet_name: booking.petName,
      pet_breed: booking.petBreed,
      pet_size: booking.petSize,
      notes: booking.notes,
      price: booking.price,
    }

    // Sla op als ingelogd, anders gewoon success tonen
    if (user) {
      await supabase.from('bookings').insert(bookingData)
    }

    setSubmitting(false)
    setSuccess(true)
  }

  const badgeColor: Record<string, string> = {
    'TOP': '#E8913A', 'NIEUW': '#4A7C3F', 'PROMO': '#E84E4E'
  }

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .section{max-width:1320px;margin:0 auto;padding:64px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:48px}
        .section-header h2{font-size:clamp(28px,3.5vw,40px);color:var(--green-dark);margin-bottom:10px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:var(--brown);margin-bottom:24px}
        .demo-notice a{color:var(--orange-main)}
        .filters-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px;align-items:center}
        .filter-btn{padding:8px 20px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:var(--text-mid)}
        .filter-btn.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}
        .filter-btn:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
        .search-wrap{flex:1;min-width:220px;position:relative}
        .search-wrap input{width:100%;padding:10px 16px 10px 38px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;background:var(--white);outline:none;transition:all .25s}
        .search-wrap input:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.1)}
        .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.35}
        .salons-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .salon-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;border:2px solid transparent}
        .salon-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
        .salon-cover{height:200px;position:relative;overflow:hidden;background:var(--cream-dark)}
        .salon-cover img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .salon-card:hover .salon-cover img{transform:scale(1.05)}
        .salon-badge-wrap{position:absolute;top:14px;left:14px}
        .salon-badge{padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white}
        .fav-btn{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .2s}
        .fav-btn:hover{transform:scale(1.15)}
        .salon-info{padding:20px}
        .salon-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
        .salon-name{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700}
        .salon-rating{display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:var(--orange-main)}
        .salon-rating span{font-size:12px;color:var(--text-light);font-weight:400}
        .salon-loc{font-size:13px;color:var(--text-mid);margin-bottom:10px}
        .salon-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
        .tag{padding:4px 10px;border-radius:50px;font-size:11px;font-weight:600;background:var(--cream);color:var(--text-mid)}
        .tag.main{background:var(--green-pale);color:var(--green-dark)}
        .salon-foot{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--cream-dark)}
        .salon-price{font-size:14px;color:var(--text-mid)}
        .salon-price strong{color:var(--green-dark);font-size:16px;font-family:'Fredoka',sans-serif}
        .book-btn{padding:8px 18px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
        .book-btn:hover{background:var(--green-dark);transform:translateY(-1px)}
        .services-wrap{background:var(--white);border-radius:24px;padding:48px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:32px}
        .svc-card{text-align:center;padding:28px 16px;border-radius:20px;background:var(--cream);transition:all .3s}
        .svc-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .svc-icon{font-size:40px;margin-bottom:12px}
        .svc-price{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:700;color:var(--green-dark);margin-top:8px}
        .map-wrap{background:var(--green-pale);border-radius:24px;padding:48px;text-align:center}
        .map-ph{background:var(--white);border-radius:20px;height:300px;display:flex;align-items:center;justify-content:center;margin-top:20px;font-size:48px;position:relative}
        .map-ph::after{content:'Interactieve kaart — binnenkort beschikbaar';position:absolute;bottom:16px;font-size:13px;color:var(--text-light);font-weight:600}
        .register-wrap{background:linear-gradient(135deg,var(--brown),#8B6F5E);border-radius:24px;padding:48px;color:white;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
        .register-wrap h2{color:white;font-size:28px;margin-bottom:12px}
        .register-wrap p{opacity:.82;font-size:15px;line-height:1.65;margin-bottom:20px}
        .benefit{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;margin-bottom:10px}
        .benefit-icon{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .register-form-wrap{background:rgba(255,255,255,.08);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,.1)}
        .rform-field{margin-bottom:12px}
        .rform-field label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;opacity:.8}
        .rform-field input,.rform-field select{width:100%;padding:11px 14px;border:2px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none}
        .rform-field input::placeholder{color:rgba(255,255,255,.4)}
        .rform-field select option{background:var(--brown)}
        .btn-orange{padding:13px;width:100%;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:8px}
        .btn-orange:hover{background:#D4812E;transform:translateY(-1px)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
        .modal{background:var(--white);border-radius:28px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 16px 56px rgba(0,0,0,.14);animation:modalIn .3s cubic-bezier(.4,0,.2,1)}
        @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
        .modal-head{padding:28px 28px 0;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .modal-close{width:40px;height:40px;border-radius:50%;border:none;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;flex-shrink:0;transition:all .2s}
        .modal-close:hover{background:var(--cream-dark);transform:rotate(90deg)}
        .modal-body{padding:24px 28px 28px}
        .steps{display:flex;align-items:center;gap:0;margin-bottom:24px}
        .step-item{display:flex;align-items:center;gap:6px;flex:1}
        .step-item::after{content:'';flex:1;height:3px;background:var(--cream-dark);border-radius:4px;margin:0 4px}
        .step-item:last-child::after{display:none}
        .step-item:last-child{flex:0 0 auto}
        .step-num{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:13px;font-weight:700;flex-shrink:0;transition:all .3s}
        .step-num.active{background:var(--green-main);color:white;box-shadow:0 2px 8px rgba(74,124,63,.3)}
        .step-num.done{background:var(--green-dark);color:white}
        .step-num.inactive{background:var(--cream-dark);color:var(--text-light)}
        .step-label{font-size:11px;font-weight:700;white-space:nowrap}
        .step-label.active{color:var(--green-dark)}
        .step-label.done{color:var(--green-main)}
        .step-label.inactive{color:var(--text-light)}
        .svc-option{display:flex;align-items:center;gap:14px;padding:16px;border:2px solid var(--cream-dark);border-radius:12px;cursor:pointer;transition:all .2s;margin-bottom:10px}
        .svc-option:hover{border-color:var(--green-light);background:var(--cream)}
        .svc-option.sel{border-color:var(--green-main);background:var(--green-pale)}
        .svc-ico{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;background:var(--orange-pale)}
        .svc-info{flex:1}
        .svc-name{font-weight:700;font-size:15px;margin-bottom:2px}
        .svc-desc{font-size:12px;color:var(--text-light)}
        .svc-price{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--green-dark);text-align:right}
        .svc-dur{font-size:11px;color:var(--text-light);display:block}
        .svc-check{width:24px;height:24px;border-radius:50%;border:2px solid var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:all .2s}
        .svc-option.sel .svc-check{background:var(--green-main);border-color:var(--green-main);color:white}
        .cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .cal-head h3{font-size:17px;font-family:'Fredoka',sans-serif}
        .cal-nav-btn{width:36px;height:36px;border-radius:50%;border:2px solid var(--cream-dark);background:transparent;cursor:pointer;font-size:14px;transition:all .2s}
        .cal-nav-btn:hover{border-color:var(--green-main);background:var(--green-pale)}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-bottom:16px}
        .cal-day-name{font-size:11px;font-weight:700;color:var(--text-light);padding:8px 0;text-transform:uppercase}
        .slots-label{font-size:12px;font-weight:700;color:var(--text-light);text-transform:uppercase;margin:14px 0 8px;letter-spacing:.5px}
        .time-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
        .time-slot{padding:10px;border-radius:10px;border:2px solid var(--cream-dark);text-align:center;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
        .time-slot:hover:not(.taken){border-color:var(--green-light);background:var(--green-pale)}
        .time-slot.sel{background:var(--green-main);color:white;border-color:var(--green-main)}
        .time-slot.taken{opacity:.25;cursor:not-allowed;text-decoration:line-through}
        .book-field{margin-bottom:14px}
        .book-field label{display:block;font-size:13px;font-weight:700;margin-bottom:5px}
        .book-field input,.book-field select,.book-field textarea{width:100%;padding:11px 14px;border:2px solid var(--cream-dark);border-radius:10px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .book-field input:focus,.book-field select:focus,.book-field textarea:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.1)}
        .book-field textarea{resize:vertical;min-height:70px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .confirm-wrap{background:var(--cream);border-radius:16px;padding:20px;margin-bottom:16px}
        .confirm-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--cream-dark);font-size:14px}
        .confirm-row:last-child{border-bottom:none;font-weight:700;font-size:16px;color:var(--green-dark)}
        .confirm-row .lbl{color:var(--text-mid)}
        .modal-foot{display:flex;justify-content:space-between;gap:12px;padding-top:16px;border-top:2px solid var(--cream-dark)}
        .btn-back{padding:12px 24px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;color:var(--text-mid);transition:all .2s}
        .btn-back:hover{border-color:var(--text-light)}
        .btn-next{padding:12px 28px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 2px 12px rgba(74,124,63,.25)}
        .btn-next:hover:not(:disabled){background:var(--green-dark);transform:translateY(-1px)}
        .btn-next:disabled{opacity:.4;cursor:not-allowed}
        .btn-next.orange{background:var(--orange-main);box-shadow:0 2px 12px rgba(232,145,58,.3)}
        .btn-next.orange:hover:not(:disabled){background:#D4812E}
        .success-wrap{text-align:center;padding:20px 0}
        .success-icon{font-size:64px;margin-bottom:14px;animation:pop .5s cubic-bezier(.4,0,.2,1)}
        @keyframes pop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        .success-details{background:var(--green-pale);border-radius:14px;padding:18px;text-align:left;margin:16px 0;font-size:14px;line-height:1.9}
        footer{background:var(--green-dark);color:white;margin-top:0}
        .footer-inner{max-width:1320px;margin:0 auto;padding:36px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;opacity:.5}
        .footer-inner a{color:white;text-decoration:none;margin:0 12px}
        .hero-section{background:linear-gradient(135deg,var(--brown) 0%,#8B6F5E 50%,var(--orange-main) 100%);padding:56px clamp(16px,4vw,48px);position:relative;overflow:hidden}
        .hero-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
        .hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 16px;border-radius:50px;color:rgba(255,255,255,.9);font-size:12px;font-weight:700;margin-bottom:18px;backdrop-filter:blur(4px)}
        .hero-h1{font-size:clamp(32px,4vw,48px);color:white;line-height:1.1;margin-bottom:14px}
        .hero-p{color:rgba(255,255,255,.82);font-size:16px;line-height:1.65;margin-bottom:24px;max-width:420px}
        .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
        .btn-primary{padding:14px 28px;border-radius:50px;background:var(--orange-main);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(232,145,58,.4)}
        .btn-primary:hover{background:#D4812E;transform:translateY(-2px)}
        .btn-white{padding:14px 28px;border-radius:50px;background:rgba(255,255,255,.15);color:white;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:1.5px solid rgba(255,255,255,.3);cursor:pointer;transition:all .3s}
        .btn-white:hover{background:rgba(255,255,255,.25);transform:translateY(-2px)}
        .hero-img{border-radius:20px;overflow:hidden;height:320px}
        .hero-img img{width:100%;height:100%;object-fit:cover}
        @media(max-width:1024px){.salons-grid{grid-template-columns:repeat(2,1fr)}.services-grid{grid-template-columns:repeat(2,1fr)}.register-wrap{grid-template-columns:1fr}.hero-inner{grid-template-columns:1fr}.hero-img{display:none}}
        @media(max-width:768px){.salons-grid{grid-template-columns:1fr}.time-slots{grid-template-columns:repeat(3,1fr)}.form-row{grid-template-columns:1fr}.modal{border-radius:20px 20px 0 0;max-height:95vh;align-self:flex-end}.modal-overlay{align-items:flex-end;padding:0}}
      `}</style>

      <Navbar />

      {/* HERO */}
      <div className="hero-section">
        <div className="hero-inner">
          <div>
            <div className="hero-tag">✂️ KWISPELCLUB KAPSALONS</div>
            <h1 className="hero-h1">Hondenkapsalons bij jou in de buurt</h1>
            <p className="hero-p">Vind de beste trimsalons en groomers in België en Nederland. Geverifieerd, beoordeeld door echte klanten.</p>
            <div className="hero-btns">
              <a href="#salons" className="btn-primary">Zoek kapsalon →</a>
              <a href="#register" className="btn-white">Registreer je salon</a>
            </div>
          </div>
          <div className="hero-img">
            <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=700&q=80" alt="Hond bij de groomer" />
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div className="section">
        <div className="services-wrap">
          <div className="section-header">
            <h2>Populaire Diensten ✂️</h2>
            <p>Wat je kunt verwachten bij onze kapsalons</p>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.name} className="svc-card">
                <div className="svc-icon">{s.icon}</div>
                <h4>{s.name}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{s.desc}</p>
                <div className="svc-price">Vanaf €{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SALONS */}
      <div className="section" id="salons">
        <div className="section-header">
          <h2>Kapsalons bij jou in de buurt 📍</h2>
          <p>Geverifieerde salons met echte klantbeoordelingen</p>
        </div>
        <div className="demo-notice">
          ⚠️ <span style={{ color: 'var(--orange-main)' }}>Voorbeeldsalons</span> — Deze profielen zijn ter illustratie. Heb je een salon? <a href="#register" style={{ color: 'var(--orange-main)', fontWeight: 700 }}>Registreer je alvast →</a>
        </div>
        <div className="filters-bar">
          {['all', 'limburg', 'antwerpen', 'brabant', 'oost-vl', 'nl'].map(r => (
            <button key={r} className={`filter-btn ${regionFilter === r ? 'active' : ''}`} onClick={() => setRegionFilter(r)}>
              {r === 'all' ? 'Alle' : r === 'oost-vl' ? 'Oost-Vlaanderen' : r === 'nl' ? 'Nederland' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Zoek op naam of stad..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="salons-grid">
          {filteredSalons.map(salon => (
            <div key={salon.id} className="salon-card">
              <div className="salon-cover">
                <img src={salon.img} alt={salon.name} />
                {salon.badge && (
                  <div className="salon-badge-wrap">
                    <span className="salon-badge" style={{ background: badgeColor[salon.badge] || '#8A8A8A' }}>
                      {salon.badge === 'TOP' ? '⭐ TOP' : salon.badge}
                    </span>
                  </div>
                )}
                <button
                  className="fav-btn"
                  onClick={() => setFavorites(prev => prev.includes(salon.id) ? prev.filter(f => f !== salon.id) : [...prev, salon.id])}
                  style={{ color: favorites.includes(salon.id) ? '#E84E4E' : undefined }}
                >
                  {favorites.includes(salon.id) ? '♥' : '♡'}
                </button>
              </div>
              <div className="salon-info">
                <div className="salon-head">
                  <div className="salon-name">{salon.name}</div>
                  <div className="salon-rating">⭐ {salon.rating} <span>({salon.reviews})</span></div>
                </div>
                <div className="salon-loc">📍 {salon.location}</div>
                <div className="salon-tags">
                  {salon.tags.map((t, i) => <span key={t} className={`tag ${i === 0 ? 'main' : ''}`}>{t}</span>)}
                </div>
                <div className="salon-foot">
                  <div className="salon-price">Vanaf <strong>€{salon.price}</strong></div>
                  <button className="book-btn" onClick={() => openBooking(salon)}>Bekijk & Boek</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div className="section">
        <div className="map-wrap">
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', color: 'var(--green-dark)', fontSize: 28 }}>Vind een Salon op de Kaart 🗺️</h2>
          <p style={{ color: 'var(--text-mid)', marginTop: 8 }}>Zoek salons in jouw buurt via onze interactieve kaart</p>
          <div className="map-ph">🗺️</div>
        </div>
      </div>

      {/* REGISTER */}
      <div className="section" id="register">
        <div className="register-wrap">
          <div>
            <h2>Heb je een hondenkapsalon? ✂️</h2>
            <p>Word zichtbaar voor duizenden huisdiereigenaren in België en Nederland. Registreer je salon gratis op Kwispelclub.</p>
            {[['👥','Bereik 12.500+ actieve diereneigenaren'],['📅','Online boekingssysteem inbegrepen'],['⭐','Verzamel reviews en bouw reputatie'],['🏷️','Eerste 3 maanden gratis']].map(([icon, text]) => (
              <div key={text} className="benefit"><div className="benefit-icon">{icon}</div>{text}</div>
            ))}
          </div>
          <div className="register-form-wrap">
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, marginBottom: 18 }}>Registreer je Salon</h3>
            <div className="rform-field"><label>Salonnaam</label><input type="text" placeholder="Bijv. Happy Paws Grooming" /></div>
            <div className="rform-field"><label>Locatie</label><input type="text" placeholder="Stad, provincie" /></div>
            <div className="rform-field"><label>E-mailadres</label><input type="email" placeholder="info@jouwsalon.be" /></div>
            <div className="rform-field">
              <label>Type Salon</label>
              <select style={{ color: 'white' }}>
                <option>Trimsalon (alle rassen)</option>
                <option>Gespecialiseerd (kleine rassen)</option>
                <option>Gespecialiseerd (grote rassen)</option>
                <option>Mobiele trimmer</option>
                <option>Premium / Spa salon</option>
              </select>
            </div>
            <button className="btn-orange" onClick={() => alert('Bedankt! We nemen contact op.')}>Gratis registreren →</button>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span>© 2026 Kwispelclub</span>
          <div><a href="/privacy">Privacy</a><a href="/contact">Contact</a><a href="/">Home</a></div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div>
                <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: 'var(--green-dark)' }}>{booking.salon}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{booking.location}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Steps */}
              {!success && (
                <div className="steps">
                  {['Dienst','Datum & Tijd','Gegevens','Bevestig'].map((label, i) => {
                    const n = i + 1
                    const state = n === step ? 'active' : n < step ? 'done' : 'inactive'
                    return (
                      <div key={label} className="step-item">
                        <div className={`step-num ${state}`}>{state === 'done' ? '✓' : n}</div>
                        <span className={`step-label ${state}`}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* SUCCESS */}
              {success ? (
                <div className="success-wrap">
                  <div className="success-icon">✅</div>
                  <h2 style={{ fontFamily: 'Fredoka, sans-serif', color: 'var(--green-dark)', marginBottom: 8 }}>Afspraak Bevestigd!</h2>
                  <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>Je ontvangt een bevestiging per e-mail.</p>
                  <div className="success-details">
                    <strong>📍 {booking.salon}</strong><br />
                    <strong>✂️ {booking.service}</strong> · {booking.dur}<br />
                    <strong>📅 {booking.date && formatDate(booking.date)}</strong> om <strong>{booking.time}</strong><br /><br />
                    <strong>🐕 {booking.petName}</strong> ({booking.petBreed})<br />
                    <strong>👤 {booking.ownerName}</strong>
                  </div>
                  <button className="btn-next" onClick={closeModal} style={{ margin: '0 auto', display: 'block' }}>Sluiten</button>
                </div>
              ) : (
                <>
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div>
                      {SERVICES.map(s => (
                        <div key={s.name} className={`svc-option ${booking.service === s.name ? 'sel' : ''}`} onClick={() => setBooking(b => ({ ...b, service: s.name, price: s.price, dur: s.dur }))}>
                          <div className="svc-ico">{s.icon}</div>
                          <div className="svc-info">
                            <div className="svc-name">{s.name}</div>
                            <div className="svc-desc">{s.desc}</div>
                          </div>
                          <div className="svc-price">€{s.price}<span className="svc-dur">{s.dur}</span></div>
                          <div className="svc-check">{booking.service === s.name ? '✓' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div>
                      <div className="cal-head">
                        <h3>{MONTH_NAMES[calDate.getMonth()]} {calDate.getFullYear()}</h3>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="cal-nav-btn" onClick={() => { const d = new Date(calDate); d.setMonth(d.getMonth() - 1); const t = new Date(); if (d >= new Date(t.getFullYear(), t.getMonth(), 1)) setCalDate(d) }}>◀</button>
                          <button className="cal-nav-btn" onClick={() => { const d = new Date(calDate); d.setMonth(d.getMonth() + 1); setCalDate(d) }}>▶</button>
                        </div>
                      </div>
                      <div className="cal-grid">
                        {DAY_NAMES.map(d => <div key={d} className="cal-day-name">{d}</div>)}
                        {renderCalDays()}
                      </div>
                      {booking.date ? getTimeSlots().map(group => (
                        <div key={group.label}>
                          <div className="slots-label">{group.label}</div>
                          <div className="time-slots">
                            {group.slots.map(s => (
                              <div key={s.time} className={`time-slot ${s.taken ? 'taken' : booking.time === s.time ? 'sel' : ''}`} onClick={() => !s.taken && setBooking(b => ({ ...b, time: s.time }))}>
                                {s.time}
                              </div>
                            ))}
                          </div>
                        </div>
                      )) : <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>👆 Kies eerst een datum</div>}
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div>
                      <div className="form-row">
                        <div className="book-field"><label>Naam huisdier *</label><input value={booking.petName} onChange={e => setBooking(b => ({ ...b, petName: e.target.value }))} placeholder="Bijv. Max" /></div>
                        <div className="book-field"><label>Ras *</label><input value={booking.petBreed} onChange={e => setBooking(b => ({ ...b, petBreed: e.target.value }))} placeholder="Bijv. Labrador" /></div>
                      </div>
                      <div className="form-row">
                        <div className="book-field"><label>Grootte</label>
                          <select value={booking.petSize} onChange={e => setBooking(b => ({ ...b, petSize: e.target.value }))}>
                            {['Klein (< 10 kg)','Middel (10-25 kg)','Groot (25-40 kg)','Extra groot (> 40 kg)'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="book-field"><label>Leeftijd</label>
                          <select value={booking.petAge} onChange={e => setBooking(b => ({ ...b, petAge: e.target.value }))}>
                            {['Puppy (< 1 jaar)','Volwassen (1-7 jaar)','Senior (7+ jaar)'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="book-field"><label>Jouw naam *</label><input value={booking.ownerName} onChange={e => setBooking(b => ({ ...b, ownerName: e.target.value }))} placeholder="Volledige naam" /></div>
                      <div className="form-row">
                        <div className="book-field"><label>Telefoon *</label><input type="tel" value={booking.ownerPhone} onChange={e => setBooking(b => ({ ...b, ownerPhone: e.target.value }))} placeholder="+32 ..." /></div>
                        <div className="book-field"><label>E-mail *</label><input type="email" value={booking.ownerEmail} onChange={e => setBooking(b => ({ ...b, ownerEmail: e.target.value }))} placeholder="jouw@email.be" /></div>
                      </div>
                      <div className="book-field"><label>Opmerkingen</label><textarea value={booking.notes} onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))} placeholder="Allergieën, bijzonderheden..." /></div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div>
                      <div className="confirm-wrap">
                        {[
                          ['Salon', booking.salon],
                          ['Dienst', `${booking.service} (${booking.dur})`],
                          ['Datum', booking.date ? formatDate(booking.date) : ''],
                          ['Tijdslot', booking.time],
                          ['Huisdier', `${booking.petName} (${booking.petBreed})`],
                          ['Eigenaar', booking.ownerName],
                          ['Contact', booking.ownerPhone],
                          ...(booking.notes ? [['Opmerkingen', booking.notes]] : []),
                          ['Totaal', `€${booking.price}`],
                        ].map(([label, val]) => (
                          <div key={label} className="confirm-row">
                            <span className="lbl">{label}</span>
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-foot">
                    {step > 1 ? <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Vorige</button> : <div />}
                    {step === 4 ? (
                      <button className="btn-next orange" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Even geduld...' : '✓ Bevestig Afspraak'}
                      </button>
                    ) : (
                      <button className="btn-next" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                        Volgende →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
