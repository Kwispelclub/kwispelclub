'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomePage() {
  const obsRef = useRef<IntersectionObserver | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
  const [earlyEmail, setEarlyEmail] = useState('')
  const [earlyDone, setEarlyDone] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showCookie, setShowCookie] = useState(false)
  const [breedTab, setBreedTab] = useState('honden')
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set())
  const [settings, setSettings] = useState<Record<string, any>>({
    demo_webshop: true, demo_verkopers: true, demo_reviews: true,
  })

  useEffect(() => {
    fetch('/api/admin-settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }))
    }).catch(() => {})

    window.addEventListener('scroll', () => setScrolled(window.scrollY > 20))
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 60)
          obsRef.current?.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obsRef.current?.observe(el))
    if (!sessionStorage.getItem('kc_seen')) { setTimeout(() => setShowPopup(true), 1500) }
    if (!localStorage.getItem('kc_cookies')) { setTimeout(() => setShowCookie(true), 2000) }
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
            const t = parseFloat(el.dataset.target || '0')
            const isDecimal = el.dataset.decimal === 'true'
            const dur = 2000; const s = performance.now()
            const animate = (n: number) => {
              const p = Math.min((n - s) / dur, 1); const ease = 1 - Math.pow(1 - p, 3)
              el.textContent = isDecimal ? (t * ease).toFixed(1) : Math.floor(t * ease).toLocaleString('nl-BE') + '+'
              if (p < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          })
          counterObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.3 })
    document.querySelectorAll('.stats-inner').forEach(el => counterObs.observe(el))
  }, [])

  const breedData: Record<string, { emoji: string; name: string; count: string }[]> = {
    honden: [
      { emoji: '🐕‍🦺', name: 'Labrador', count: '48' },
      { emoji: '🐩', name: 'Poedel', count: '35' },
      { emoji: '🦮', name: 'Golden Retriever', count: '52' },
      { emoji: '🐕', name: 'Duitse Herder', count: '41' },
      { emoji: '🐶', name: 'Beagle', count: '29' },
      { emoji: '🐾', name: 'Alle rassen →', count: '200+' },
    ],
    katten: [
      { emoji: '🐱', name: 'Maine Coon', count: '38' },
      { emoji: '😺', name: 'Britse Korthaar', count: '42' },
      { emoji: '🐈', name: 'Siamees', count: '27' },
      { emoji: '😸', name: 'Ragdoll', count: '33' },
      { emoji: '🐈‍⬛', name: 'Bengaal', count: '24' },
      { emoji: '🐾', name: 'Alle rassen →', count: '150+' },
    ],
  }

  const products = [
    { img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80', badge: 'NIEUW', badgeType: 'new', brand: 'Kwispelclub Premium', name: 'Biologische Kip & Rijst Brokken', price: '€34,95', rating: '4.8', reviews: '124' },
    { img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80', badge: 'POPULAIR', badgeType: 'popular', brand: 'KattenKracht', name: 'Interactief Kattenspeeltje Set', price: '€19,50', rating: '4.6', reviews: '89' },
    { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', badge: '-20%', badgeType: 'sale', brand: 'WoofWalk', name: 'Ergonomische Anti-trek Tuigje', price: '€27,99', oldPrice: '€34,99', rating: '4.9', reviews: '203' },
    { img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80', badge: 'BIO', badgeType: 'bio', brand: 'NatuurPuur', name: 'Kattenkruid & Valeriaan Mix', price: '€12,95', rating: '4.7', reviews: '67' },
  ]

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-light:#F5A855;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--brown:#5C3D2E;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4,h5{font-family:'Fredoka',sans-serif}
        .paw-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .paw-bg .paw{position:absolute;font-size:40px;opacity:.035;animation:floatPaw 25s ease-in-out infinite}
        .paw-bg .paw:nth-child(1){top:8%;left:4%;animation-delay:0s}
        .paw-bg .paw:nth-child(2){top:25%;right:6%;animation-delay:4s;font-size:30px}
        .paw-bg .paw:nth-child(3){top:50%;left:10%;animation-delay:8s;font-size:55px}
        .paw-bg .paw:nth-child(4){top:70%;right:12%;animation-delay:12s}
        .paw-bg .paw:nth-child(5){top:88%;left:35%;animation-delay:16s;font-size:35px}
        @keyframes floatPaw{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-25px) rotate(12deg)}}
        .announce-bar{background:linear-gradient(90deg,var(--orange-main),#D4812E,var(--orange-main));background-size:200%;animation:shimmer 3s ease infinite;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600;position:relative;z-index:101}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .announce-bar a{color:white;text-decoration:underline;margin-left:6px}
        .hero{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px)}
        .hero-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;overflow:hidden;position:relative;min-height:480px;display:flex;align-items:center}
        .blob{position:absolute;border-radius:50%;pointer-events:none}
        .b1{width:400px;height:400px;background:rgba(232,145,58,.12);top:-120px;right:-80px;animation:blobFloat 8s ease-in-out infinite}
        .b2{width:250px;height:250px;background:rgba(255,249,240,.08);bottom:-80px;left:25%;animation:blobFloat 11s ease-in-out infinite reverse}
        .b3{width:180px;height:180px;background:rgba(245,168,85,.1);top:35%;right:20%;animation:blobFloat 14s ease-in-out infinite}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-25px) scale(1.06)}66%{transform:translate(-15px,15px) scale(.94)}}
        .hero-content{position:relative;z-index:2;padding:60px clamp(32px,5vw,80px);max-width:540px}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);padding:7px 18px;border-radius:50px;color:rgba(255,255,255,.9);font-size:13px;font-weight:700;margin-bottom:24px;backdrop-filter:blur(6px)}
        .hero-content h1{font-size:clamp(36px,5.5vw,56px);color:white;line-height:1.08;margin-bottom:18px}
        .accent{color:var(--orange-light)}
        .hero-content p{color:rgba(255,255,255,.82);font-size:17px;line-height:1.65;margin-bottom:32px;max-width:400px}
        .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
        .hero-img{position:absolute;right:0;top:0;width:50%;height:100%;overflow:hidden}
        .hero-img img{width:100%;height:100%;object-fit:cover;mask-image:linear-gradient(to left,rgba(0,0,0,1) 40%,rgba(0,0,0,.6) 70%,transparent 100%);-webkit-mask-image:linear-gradient(to left,rgba(0,0,0,1) 40%,rgba(0,0,0,.6) 70%,transparent 100%)}
        .floating-badge{position:absolute;background:rgba(255,255,255,.95);border-radius:16px;padding:10px 16px;box-shadow:0 8px 40px rgba(0,0,0,.12);display:flex;align-items:center;gap:8px;z-index:3}
        .fb1{bottom:80px;right:40px;animation:floatBadge 4s ease-in-out infinite}
        .fb2{top:60px;right:60px;animation:floatBadge 4s ease-in-out infinite 1.5s}
        @keyframes floatBadge{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fb-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
        .fb-icon.g{background:var(--green-pale)}.fb-icon.o{background:var(--orange-pale)}
        .fb-text{font-size:12px;font-weight:700;color:var(--text-dark);line-height:1.3}
        .fb-text span{display:block;font-weight:400;font-size:11px;color:var(--text-light)}
        .btn{display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .3s}
        .btn-primary{background:var(--orange-main);color:white;box-shadow:0 4px 20px rgba(232,145,58,.4)}.btn-primary:hover{background:#D4812E;transform:translateY(-3px)}
        .btn-secondary{background:rgba(255,255,255,.12);color:white;border:1.5px solid rgba(255,255,255,.25);backdrop-filter:blur(4px)}.btn-secondary:hover{background:rgba(255,255,255,.22);transform:translateY(-3px)}
        .btn-outline{background:transparent;color:var(--green-dark);border:2px solid var(--green-dark)}.btn-outline:hover{background:var(--green-dark);color:white;transform:translateY(-3px)}
        .trust-bar{position:relative;z-index:2;max-width:1320px;margin:-28px auto 0;padding:0 clamp(16px,4vw,48px)}
        .trust-inner{background:var(--white);border-radius:20px;padding:22px 36px;display:flex;justify-content:center;gap:clamp(20px,4vw,56px);flex-wrap:wrap;box-shadow:0 16px 56px rgba(0,0,0,.14)}
        .trust-item{display:flex;align-items:center;gap:12px}
        .trust-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .trust-icon.g{background:var(--green-pale)}.trust-icon.o{background:var(--orange-pale)}
        .trust-text strong{display:block;font-size:14px}.trust-text span{font-size:12px;color:var(--text-light)}
        .section{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:72px clamp(16px,4vw,48px)}
        .section-header{text-align:center;margin-bottom:48px}
        .section-header h2{font-size:clamp(28px,3.5vw,42px);color:var(--green-dark);margin-bottom:12px}
        .section-header p{color:var(--text-mid);font-size:16px;max-width:520px;margin:0 auto;line-height:1.6}
        .features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .feature-card{background:var(--white);border-radius:20px;padding:36px 24px 28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .35s;cursor:pointer;position:relative;overflow:hidden}
        .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;transition:height .3s}
        .feature-card:nth-child(1)::before{background:var(--green-main)}.feature-card:nth-child(2)::before{background:var(--orange-main)}
        .feature-card:nth-child(3)::before{background:var(--brown)}.feature-card:nth-child(4)::before{background:var(--green-light)}
        .feature-card:hover{transform:translateY(-8px);box-shadow:0 8px 40px rgba(0,0,0,.12)}.feature-card:hover::before{height:6px}
        .feature-icon{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 20px}
        .feature-card:nth-child(1) .feature-icon{background:var(--green-pale)}.feature-card:nth-child(2) .feature-icon{background:var(--orange-pale)}
        .feature-card:nth-child(3) .feature-icon{background:#F5EDE0}.feature-card:nth-child(4) .feature-icon{background:#E8F5E0}
        .feature-card h3{font-size:18px;margin-bottom:10px}.feature-card p{font-size:14px;color:var(--text-mid);line-height:1.55;margin-bottom:20px}
        .feature-link{display:inline-flex;align-items:center;gap:4px;font-size:14px;font-weight:700;text-decoration:none;transition:gap .2s}
        .feature-card:nth-child(1) .feature-link{color:var(--green-main)}.feature-card:nth-child(2) .feature-link{color:var(--orange-main)}
        .feature-card:nth-child(3) .feature-link{color:var(--brown)}.feature-card:nth-child(4) .feature-link{color:var(--green-light)}
        .feature-link:hover{gap:10px}
        .stats-bar{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:0 clamp(16px,4vw,48px)}
        .stats-inner{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:28px;padding:40px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;color:white;position:relative}
        .stat-item h3{font-size:clamp(32px,4vw,48px);color:var(--orange-light);margin-bottom:6px}
        .stat-item p{font-size:14px;opacity:.8;font-weight:600}
        .demo-notice{background:var(--orange-pale);border:2px dashed var(--orange-main);border-radius:12px;padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:var(--brown);margin-bottom:24px}
        .demo-notice span{color:var(--orange-main)}
        .products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .product-card{background:var(--white);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer;position:relative}
        .product-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .product-img{width:100%;aspect-ratio:1;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:64px;position:relative;overflow:hidden}
        .product-img img{width:100%;height:100%;object-fit:cover}
        .product-badge{position:absolute;top:12px;left:12px;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;color:white;z-index:2}
        .badge-new{background:var(--green-main)}.badge-popular{background:var(--orange-main)}.badge-sale{background:var(--red)}.badge-bio{background:#7BAE3B}
        .product-wishlist{position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;background:var(--white);border:none;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .2s;z-index:2}
        .product-wishlist:hover{transform:scale(1.15)}.product-wishlist.liked{color:var(--red)}
        .product-info{padding:18px}
        .product-brand{font-size:11px;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
        .product-name{font-size:15px;font-weight:600;margin-bottom:10px;line-height:1.3}
        .product-meta{display:flex;align-items:center;justify-content:space-between}
        .product-price{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:var(--green-dark)}
        .old-price{font-size:14px;color:var(--text-light);text-decoration:line-through;margin-right:6px;font-weight:400}
        .product-rating{font-size:12px;color:var(--orange-main);display:flex;align-items:center;gap:4px}
        .product-rating span{color:var(--text-light)}
        .see-all{display:flex;justify-content:center;margin-top:36px}
        .breed-section{background:var(--white);border-radius:28px;padding:48px}
        .breed-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:32px}
        .breed-tab{padding:10px 24px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text-mid)}
        .breed-tab.active{background:var(--green-dark);color:white;border-color:var(--green-dark)}
        .breed-tab:hover:not(.active){border-color:var(--green-main);color:var(--green-main)}
        .breed-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
        .breed-card{text-align:center;padding:20px 12px;border-radius:20px;cursor:pointer;transition:all .3s;background:var(--cream)}
        .breed-card:hover{transform:translateY(-4px);box-shadow:0 4px 20px rgba(0,0,0,.08);background:var(--green-pale)}
        .breed-emoji{font-size:48px;margin-bottom:10px;display:block}
        .breed-name{font-size:13px;font-weight:700}
        .breed-card p{font-size:11px;color:var(--text-light);margin-top:4px}
        .academy-section{background:var(--white);border-radius:28px;padding:48px}
        .academy-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .academy-card{border-radius:20px;overflow:hidden;cursor:pointer;transition:all .3s;background:var(--cream)}
        .academy-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .academy-thumb{aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:var(--cream-dark)}
        .academy-thumb img{width:100%;height:100%;object-fit:cover}
        .play-btn{position:absolute;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 20px rgba(0,0,0,.08);transition:all .25s;color:var(--green-dark);z-index:2}
        .academy-card:hover .play-btn{transform:scale(1.12)}
        .academy-info{padding:18px}
        .academy-tag{display:inline-block;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;margin-bottom:10px}
        .academy-tag.hond{background:var(--green-pale);color:var(--green-dark)}.academy-tag.kat{background:var(--orange-pale);color:var(--orange-main)}.academy-tag.algemeen{background:#EDE8F5;color:#6B4FA0}
        .academy-info h4{font-size:16px;margin-bottom:6px}.academy-info p{font-size:13px;color:var(--text-mid)}
        .academy-duration{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text-light);margin-top:8px}
        .mp-layout{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .mp-info{background:linear-gradient(135deg,var(--green-dark),var(--green-main));border-radius:28px;padding:52px;color:white;display:flex;flex-direction:column;justify-content:center}
        .mp-info h3{font-size:30px;margin-bottom:16px;line-height:1.2;color:white}.mp-info>p{font-size:15px;opacity:.82;line-height:1.65;margin-bottom:28px}
        .mp-feats{display:flex;flex-direction:column;gap:14px;margin-bottom:32px}
        .mp-feat{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600}
        .mp-feat-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .mp-chat{background:var(--white);border-radius:28px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.08);display:flex;flex-direction:column}
        .mp-chat-hdr{display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:18px;border-bottom:2px solid var(--cream-dark)}
        .mp-chat-hdr h4{font-size:16px}.mp-chat-hdr span{font-size:13px;color:var(--text-light)}
        .chat-msgs{display:flex;flex-direction:column;gap:14px;flex:1}
        .chat-msg{max-width:85%;padding:14px 18px;border-radius:18px;font-size:13px;line-height:1.55}
        .chat-msg.b{background:var(--green-pale);color:var(--green-dark);align-self:flex-start;border-bottom-left-radius:4px}
        .chat-msg.s{background:var(--orange-pale);color:var(--brown);align-self:flex-end;border-bottom-right-radius:4px}
        .chat-user{display:flex;align-items:center;gap:8px;margin-bottom:8px}
        .chat-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:white}
        .chat-av.b{background:var(--green-main)}.chat-av.s{background:var(--orange-main)}
        .chat-name{font-size:12px;font-weight:700}
        .verified-badge{display:inline-flex;align-items:center;gap:3px;background:var(--green-main);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:50px;margin-left:4px}
        .sellers-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .seller-card{background:var(--white);border-radius:20px;padding:28px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s;cursor:pointer;border:2px solid transparent}
        .seller-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12);border-color:var(--green-pale)}
        .seller-logo{width:72px;height:72px;border-radius:50%;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 16px;border:3px solid var(--green-pale)}
        .seller-card h4{font-size:16px;margin-bottom:4px}.seller-cat{font-size:12px;color:var(--text-light);margin-bottom:12px}
        .seller-rating{font-size:13px;color:var(--orange-main);margin-bottom:8px}
        .seller-verified{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--green-main);background:var(--green-pale);padding:4px 12px;border-radius:50px}
        .testimonials-section{background:var(--green-pale);border-radius:28px;padding:56px 48px}
        .testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .testimonial-card{background:var(--white);border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}
        .testimonial-card:hover{transform:translateY(-4px)}
        .t-stars{font-size:14px;margin-bottom:14px;letter-spacing:2px}
        .t-text{font-size:14px;color:var(--text-mid);line-height:1.6;margin-bottom:18px;font-style:italic}
        .t-author{display:flex;align-items:center;gap:12px}
        .t-avatar{width:44px;height:44px;border-radius:50%;overflow:hidden;background:var(--cream)}
        .t-avatar img{width:100%;height:100%;object-fit:cover}
        .t-name{font-weight:700;font-size:14px}.t-role{font-size:12px;color:var(--text-light)}
        .community-section{background:linear-gradient(135deg,var(--orange-pale),var(--cream));border-radius:28px;padding:56px 48px;text-align:center}
        .community-section h2{color:var(--brown)}
        .community-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:36px}
        .community-card{background:var(--white);border-radius:20px;padding:32px 24px;transition:all .3s;cursor:pointer}
        .community-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .community-card .c-icon{font-size:40px;margin-bottom:16px}
        .community-card h4{font-size:17px;margin-bottom:10px}.community-card p{font-size:14px;color:var(--text-mid);line-height:1.55}
        .nl-section{max-width:1320px;margin:0 auto;padding:0 clamp(16px,4vw,48px) 72px;position:relative;z-index:1}
        .nl-card{background:var(--white);border-radius:28px;padding:56px 48px;display:flex;align-items:center;gap:48px;box-shadow:0 4px 20px rgba(0,0,0,.08);overflow:hidden;position:relative}
        .nl-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--green-main),var(--orange-main))}
        .nl-content{flex:1}.nl-content h2{font-size:28px;color:var(--green-dark);margin-bottom:10px}.nl-content p{color:var(--text-mid);font-size:15px;line-height:1.6;max-width:420px}
        .nl-form{flex:1;display:flex;gap:10px}
        .nl-form input{flex:1;padding:15px 20px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:15px;outline:none;transition:all .25s}
        .nl-form input:focus{border-color:var(--green-light)}
        .nl-form button{padding:15px 32px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .25s;white-space:nowrap}
        .nl-form button:hover{background:#D4812E;transform:translateY(-2px)}
        .cta-section{text-align:center;padding:0 clamp(16px,4vw,48px) 80px;max-width:1320px;margin:0 auto;position:relative;z-index:1}
        .cta-card{background:linear-gradient(135deg,var(--green-dark),var(--green-main),var(--green-light));border-radius:36px;padding:72px 48px;color:white;position:relative;overflow:hidden}
        .cta-card h2{font-size:clamp(28px,3.5vw,42px);margin-bottom:16px;color:white}
        .cta-card p{font-size:17px;opacity:.82;max-width:480px;margin:0 auto 36px;line-height:1.6}
        .cta-emojis{font-size:52px;margin-bottom:28px;display:flex;justify-content:center;gap:20px}
        .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .cta-input-row{display:flex;gap:8px;max-width:440px;margin:0 auto 20px;flex-wrap:wrap;justify-content:center}
        .cta-input{flex:1;min-width:200px;padding:16px 20px;border-radius:50px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:white;font-family:'Nunito',sans-serif;font-size:15px;outline:none}
        .cta-select{padding:16px 20px;border-radius:50px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:white;font-family:'Nunito',sans-serif;font-size:14px;outline:none;cursor:pointer;-webkit-appearance:none}
        .cta-select option{color:#2C2C2C;background:white}
        footer{background:var(--green-dark);color:white;position:relative;z-index:1}
        .footer-inner{max-width:1320px;margin:0 auto;padding:64px clamp(16px,4vw,48px) 36px;display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:48px}
        .footer-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:18px}
        .footer-logo .lp{width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:22px}
        .footer-logo .brand{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:white}
        .footer-brand p{font-size:14px;opacity:.6;line-height:1.65;max-width:300px}
        .footer-social{display:flex;gap:8px;margin-top:20px}
        .footer-social a{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:18px;text-decoration:none;transition:all .2s}
        .footer-social a:hover{background:rgba(255,255,255,.2);transform:translateY(-2px)}
        .footer-col h5{font-size:13px;font-weight:700;margin-bottom:18px;opacity:.45;text-transform:uppercase;letter-spacing:1.5px}
        .footer-col a{display:block;color:white;opacity:.7;text-decoration:none;font-size:14px;padding:5px 0;transition:opacity .2s}
        .footer-col a:hover{opacity:1}
        .footer-bottom{max-width:1320px;margin:0 auto;padding:24px clamp(16px,4vw,48px);border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;font-size:13px;opacity:.4;flex-wrap:wrap;gap:8px}
        .footer-bottom-links{display:flex;gap:20px}
        .footer-bottom-links a{color:white;text-decoration:none}
        .footer-bottom-links a:hover{text-decoration:underline}
        .fade-up{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}
        .fade-up.visible{opacity:1;transform:translateY(0)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}
        .modal{background:var(--white);border-radius:36px;max-width:560px;width:100%;padding:48px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.2);position:relative;overflow:hidden}
        .modal::before{content:'';position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,var(--green-main),var(--orange-main),var(--green-light))}
        .modal .lm-emoji{font-size:56px;margin-bottom:16px}
        .modal h2{font-size:28px;color:var(--green-dark);margin-bottom:10px}
        .modal p{color:var(--text-mid);font-size:15px;line-height:1.65;margin-bottom:24px;max-width:420px;margin-left:auto;margin-right:auto}
        .lm-feats{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:28px}
        .lm-feat{padding:6px 16px;border-radius:50px;font-size:12px;font-weight:700;background:var(--green-pale);color:var(--green-dark)}
        .lm-form{display:flex;gap:8px;max-width:400px;margin:0 auto 16px}
        .lm-form input{flex:1;padding:14px 18px;border:2px solid var(--cream-dark);border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;outline:none}
        .lm-form input:focus{border-color:var(--green-light)}
        .lm-form button{padding:14px 24px;border-radius:50px;background:var(--orange-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
        .lm-skip{background:none;border:none;color:var(--text-light);font-size:13px;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:600;transition:color .2s}
        .lm-skip:hover{color:var(--text-dark)}
        .cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:250;background:var(--white);box-shadow:0 -4px 24px rgba(0,0,0,.1);padding:20px clamp(16px,4vw,48px)}
        .cookie-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap}
        .cookie-text{flex:1;min-width:280px}.cookie-text p{font-size:14px;color:var(--text-mid);line-height:1.6}
        .cookie-text a{color:var(--green-main);font-weight:700;text-decoration:none}
        .cookie-btns{display:flex;gap:10px;flex-shrink:0}
        .cookie-btn{padding:11px 24px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;border:none}
        .cookie-accept{background:var(--green-main);color:white}.cookie-accept:hover{background:var(--green-dark)}
        .cookie-settings{background:transparent;border:2px solid var(--cream-dark);color:var(--text-mid)}.cookie-settings:hover{border-color:var(--green-main);color:var(--green-dark)}
        .cookie-reject{background:transparent;border:none;color:var(--text-light);font-size:13px;padding:11px 16px;font-family:'Nunito',sans-serif;font-weight:600;cursor:pointer}.cookie-reject:hover{color:var(--text-dark)}
        @media(max-width:1024px){.features-grid,.products-grid,.testimonials-grid,.sellers-grid{grid-template-columns:repeat(2,1fr)}.academy-grid{grid-template-columns:repeat(2,1fr)}.breed-grid{grid-template-columns:repeat(3,1fr)}.footer-inner{grid-template-columns:1fr 1fr}.hero-img{display:none}.hero-content{max-width:100%}.stats-inner{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.features-grid,.community-grid,.testimonials-grid,.sellers-grid,.academy-grid{grid-template-columns:1fr}.products-grid{grid-template-columns:repeat(2,1fr)}.mp-layout{grid-template-columns:1fr}.breed-grid{grid-template-columns:repeat(3,1fr)}.nl-card{flex-direction:column;gap:24px;padding:36px 24px}.nl-form{flex-direction:column}.mp-info{padding:36px 24px}}
        @media(max-width:480px){.products-grid{grid-template-columns:1fr}.footer-inner{grid-template-columns:1fr;gap:24px}.stats-inner{grid-template-columns:1fr 1fr;gap:16px;padding:28px 20px}.breed-grid{grid-template-columns:repeat(2,1fr)}.cta-card{padding:48px 24px}}
      `}</style>

      <div className="paw-bg">{[...Array(5)].map((_, i) => <div key={i} className="paw">🐾</div>)}</div>

      

      <section className="hero">
        <div className="hero-card">
          <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
          <div className="hero-content fade-up">
            <div className="hero-tag">🌟 #1 Huisdierplatform in België & Nederland</div>
            <h1>Alles voor je <span className="accent">beste vriend</span></h1>
            <p>Vind premium voeding, deskundig advies, betrouwbare verkopers en een warme community — alles op één plek.</p>
            <div className="hero-btns">
              <a href="#shop" className="btn btn-primary">Ontdek nu →</a>
              <a href="#marketplace" className="btn btn-secondary">Bekijk marktplaats</a>
            </div>
          </div>
          <div className="hero-img">
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80" alt="Twee honden spelen samen buiten" />
            <div className="floating-badge fb1"><div className="fb-icon g">⭐</div><div className="fb-text">4.9 / 5.0<span>12.500+ reviews</span></div></div>
            <div className="floating-badge fb2"><div className="fb-icon o">🐾</div><div className="fb-text">85+ Verkopers<span>Geverifieerd</span></div></div>
          </div>
        </div>
      </section>

      <div className="trust-bar fade-up">
        <div className="trust-inner">
          {[['g','✅','Geverifieerde Verkopers','100% betrouwbaar'],['o','🚚','Snelle Levering','Binnen 2-3 werkdagen'],['g','🐾','Dierenwelzijn Eerst','Ethisch & duurzaam'],['o','💬','Expert Advies','Dierenartsen & trainers']].map(([type,icon,title,sub]) => (
            <div key={title} className="trust-item">
              <div className={`trust-icon ${type}`}>{icon}</div>
              <div className="trust-text"><strong>{title}</strong><span>{sub}</span></div>
            </div>
          ))}
        </div>
      </div>

      <section className="section" id="features">
        <div className="section-header fade-up"><h2>Alles op één plek 🐾</h2><p>Of je nu een puppy hebt of een senior kat — bij Kwispelclub vind je alles wat je nodig hebt.</p></div>
        <div className="features-grid">
          {[['🛍️','Webshop','Premium voeding & unieke speeltjes voor hond en kat, zorgvuldig geselecteerd door experts.','Shop hond & kat →','#shop'],
            ['🎓','Academy','Video\'s en tips over puppy training, kattengedrag, voeding en gezondheid van experts.','Video\'s & info →','/puppy-training'],
            ['🤝','Marktplaats','Betrouwbare kopers & verkopers met geverifieerde matches en beveiligde chat.','Bekijk aanbod →','/2dehands'],
            ['💛','Community','Forums, chatbox & advies van gelijkgestemde dierenliefhebbers in jouw regio.','Doe mee →','#community']].map(([icon,title,desc,link,href]) => (
            <div key={title} className="feature-card fade-up"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{desc}</p><a href={href} className="feature-link">{link}</a></div>
          ))}
        </div>
      </section>

      <div className="stats-bar fade-up">
        <div className="stats-inner">
          <div style={{position:'absolute',top:12,right:16,background:'rgba(255,255,255,.15)',padding:'4px 14px',borderRadius:50,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.7)'}}>🎯 Onze doelen</div>
          {[['1250','Producten (gepland)'],['85','Verkopers (gepland)'],['12500','Klanten (doel)']].map(([target,label]) => (
            <div key={label} className="stat-item"><h3 data-target={target}>{target}+</h3><p>{label}</p></div>
          ))}
          <div className="stat-item"><h3 data-target="4.9" data-decimal="true">4.9</h3><p>Streefcijfer</p></div>
        </div>
      </div>

      {/* PRODUCTS */}
      <section className="section" id="shop">
        <div className="section-header fade-up"><h2>Aanbevolen Producten</h2><p>Topkwaliteit, geselecteerd door onze experts</p></div>
        {settings.demo_webshop && <div className="demo-notice fade-up">⚠️ <span>Voorbeeldproducten</span> — Deze producten zijn ter illustratie. De webshop is nog in opbouw.</div>}
        {settings.demo_webshop && (
          <div className="products-grid">
            {products.map((p, i) => (
              <div key={i} className="product-card fade-up">
                <div className="product-img">
                  <img src={p.img} alt={p.name} />
                  <span className={`product-badge badge-${p.badgeType}`}>{p.badge}</span>
                  <button className={`product-wishlist ${wishlisted.has(i)?'liked':''}`} onClick={() => { const n=new Set(wishlisted); n.has(i)?n.delete(i):n.add(i); setWishlisted(n) }}>
                    {wishlisted.has(i)?'♥':'♡'}
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-brand">{p.brand}</div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">
                    <div className="product-price">{p.oldPrice && <span className="old-price">{p.oldPrice}</span>}{p.price}</div>
                    <div className="product-rating">⭐ {p.rating} <span>({p.reviews})</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {settings.demo_webshop && <div className="see-all fade-up"><a href="#" className="btn btn-outline">Bekijk alle producten →</a></div>}
      </section>

      <section className="section">
        <div className="breed-section fade-up">
          <div className="section-header"><h2>Ontdek per Ras 🐕</h2><p>Vind specifieke producten en advies voor jouw ras</p></div>
          <div className="breed-tabs">
            <button className={`breed-tab ${breedTab==='honden'?'active':''}`} onClick={() => setBreedTab('honden')}>🐕 Honden</button>
            <button className={`breed-tab ${breedTab==='katten'?'active':''}`} onClick={() => setBreedTab('katten')}>🐱 Katten</button>
          </div>
          <div className="breed-grid">
            {breedData[breedTab].map(b => (
              <div key={b.name} className="breed-card"><span className="breed-emoji">{b.emoji}</span><div className="breed-name">{b.name}</div><p>{b.count} producten</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="academy">
        <div className="academy-section fade-up">
          <div className="section-header"><h2>Kwispelclub Academy 🎓</h2><p>Leer alles over de verzorging en training van je huisdier</p></div>
          <div className="academy-grid">
            {[
              { href:'/puppy-training', img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80', tag:'hond', tagLabel:'Hond', title:'Puppy Training Basics', desc:'De basis van gehoorzaamheid voor je nieuwe puppy', dur:'12 min · Trainer Lisa' },
              { href:'#', img:'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80', tag:'kat', tagLabel:'Kat', title:'Kattenkruid Geheimen', desc:'Waarom katten zo gek zijn van kattenkruid', dur:'8 min · Dierenarts Jan' },
              { href:'#', img:'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80', tag:'algemeen', tagLabel:'Algemeen', title:'Voeding voor Senior Honden', desc:'De juiste voeding na het 7e levensjaar', dur:'15 min · Voedingsexpert' },
            ].map(a => (
              <div key={a.title} className="academy-card" onClick={() => window.location.href=a.href}>
                <div className="academy-thumb"><img src={a.img} alt={a.title} /><div className="play-btn">▶</div></div>
                <div className="academy-info">
                  <span className={`academy-tag ${a.tag}`}>{a.tagLabel}</span>
                  <h4>{a.title}</h4><p>{a.desc}</p>
                  <div className="academy-duration">⏱️ {a.dur}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="marketplace">
        <div className="section-header fade-up"><h2>Koper-Verkoper Area 🤝</h2><p>Veilig handelen met geverifieerde matches</p></div>
        <div className="mp-layout fade-up">
          <div className="mp-info">
            <h3>Betrouwbaar handelen in huisdieren & producten</h3>
            <p>Onze marktplaats verbindt kopers en verkopers met een focus op veiligheid, transparantie en dierenwelzijn.</p>
            <div className="mp-feats">
              {[['🛡️','Geverifieerde verkopers & fokkers'],['💬','Beveiligde chat met kopers'],['⭐','Beoordelingen & reviews'],['📋','Gezondheidscertificaten'],['🔒','Veilige betalingen via Mollie']].map(([icon,text]) => (
                <div key={text} className="mp-feat"><div className="mp-feat-icon">{icon}</div>{text}</div>
              ))}
            </div>
            <a href="#" className="btn btn-primary" style={{alignSelf:'flex-start'}}>Bekijk aanbod →</a>
          </div>
          <div className="mp-chat">
            <div className="mp-chat-hdr"><span style={{fontSize:26}}>💬</span><div><h4>Beveiligde Chat</h4><span>Rechtstreeks met verkopers</span></div></div>
            <div className="chat-msgs">
              <div className="chat-msg b"><div className="chat-user"><div className="chat-av b">👩</div><span className="chat-name">Sofie V.</span><span className="verified-badge">✓ VERIFIED</span></div>Hallo, ik ben geïnteresseerd in de premium brokken. Zijn ze geschikt voor een gevoelige maag? 🐕</div>
              <div className="chat-msg s"><div className="chat-user"><div className="chat-av s">🏪</div><span className="chat-name">Huisdiershop De Poot</span><span className="verified-badge">✓ VERIFIED</span></div>Ja zeker! Onze Kwispelclub Premium lijn is speciaal ontwikkeld voor gevoelige honden. Ik stuur u graag meer info! 😊</div>
              <div className="chat-msg b"><div className="chat-user"><div className="chat-av b">👩</div><span className="chat-name">Sofie V.</span></div>Super, heel fijn! Dan bestel ik er meteen 2 zakken van. 🎉</div>
            </div>
          </div>
        </div>
      </section>

      {/* SELLERS */}
      <section className="section" id="sellers">
        <div className="section-header fade-up"><h2>Uitgelichte Verkopers ⭐</h2><p>Ontdek onze meest populaire verkopers en fokkers</p></div>
        {settings.demo_verkopers && <div className="demo-notice fade-up">⚠️ <span>Voorbeeldverkopers</span> — Ben je verkoper? <a href="#early-access" style={{color:'var(--orange-main)',fontWeight:700}}>Registreer je hier →</a></div>}
        {settings.demo_verkopers && (
          <div className="sellers-grid fade-up">
            {[['🏪','Huisdiershop De Poot','Premium Voeding & Snacks','⭐⭐⭐⭐⭐ 4.9 (312 reviews)'],['🐕‍🦺','Golden Dreams Kennel','Golden Retriever Fokker','⭐⭐⭐⭐⭐ 5.0 (89 reviews)'],['🧶','KattenKracht','Speelgoed & Accessoires','⭐⭐⭐⭐ 4.7 (156 reviews)']].map(([logo,name,cat,rating]) => (
              <div key={name} className="seller-card">
                <div className="seller-logo">{logo}</div>
                <h4>{name}</h4><div className="seller-cat">{cat}</div>
                <div className="seller-rating">{rating}</div>
                <div className="seller-verified">✓ Geverifieerd</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="testimonials-section fade-up">
          <div className="section-header"><h2>Wat onze klanten zeggen 💬</h2><p>Echte ervaringen van baasjes zoals jij</p></div>
          {settings.demo_reviews && <div className="demo-notice">⚠️ <span>Voorbeeldreviews</span> — Dit zijn fictieve reviews ter illustratie van het platform.</div>}
          {settings.demo_reviews && (
            <div className="testimonials-grid">
              {[
                { stars:'⭐⭐⭐⭐⭐', text:'"Eindelijk een platform dat ik volledig vertrouw. De verkopers zijn betrouwbaar en mijn hond is dol op de premium brokken!"', img:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', name:'Sofie V.', role:'Baasje van Max (Labrador)' },
                { stars:'⭐⭐⭐⭐⭐', text:'"De Academy video\'s hebben me enorm geholpen met de training van mijn puppy. En de community is super behulpzaam!"', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', name:'Thomas D.', role:'Baasje van Bella (Beagle)' },
                { stars:'⭐⭐⭐⭐⭐', text:'"Via de marktplaats heb ik een geweldige fokker gevonden. Alles geverifieerd, super veilig. Aanrader!"', img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', name:'Lisa M.', role:'Baasje van Luna (Maine Coon)' },
              ].map(t => (
                <div key={t.name} className="testimonial-card">
                  <div className="t-stars">{t.stars}</div>
                  <div className="t-text">{t.text}</div>
                  <div className="t-author">
                    <div className="t-avatar"><img src={t.img} alt={t.name} /></div>
                    <div><div className="t-name">{t.name}</div><div className="t-role">{t.role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="community">
        <div className="community-section fade-up">
          <h2>Word deel van de Community 💛</h2>
          <p style={{color:'var(--text-mid)',maxWidth:480,margin:'12px auto 0',fontSize:15,lineHeight:1.6}}>Deel ervaringen, stel vragen en leer van andere dierenliefhebbers in België en Nederland.</p>
          <div className="community-grid">
            {[['💬','Forums & Discussies','Stel vragen en deel tips met duizenden andere baasjes over voeding, gedrag en gezondheid.'],['📸','Foto\'s & Verhalen','Deel de leukste momenten van je huisdier en bekijk de schattigste foto\'s van de community.'],['🏆','Events & Wedstrijden','Doe mee aan maandelijkse fotowedstrijden, quizzen en lokale meetups in jouw regio.']].map(([icon,title,desc]) => (
              <div key={title} className="community-card"><div className="c-icon">{icon}</div><h4>{title}</h4><p>{desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <div className="nl-section fade-up">
        <div className="nl-card">
          <div className="nl-content"><h2>Blijf op de hoogte 📬</h2><p>Ontvang wekelijks tips, exclusieve aanbiedingen en het laatste nieuws over jouw huisdier.</p></div>
          <div className="nl-form">
            {nlDone ? <div style={{color:'var(--green-main)',fontWeight:700,fontSize:16}}>✓ Aangemeld!</div> : (
              <><input type="email" placeholder="Jouw e-mailadres" value={nlEmail} onChange={e => setNlEmail(e.target.value)} /><button onClick={() => nlEmail.includes('@') && setNlDone(true)}>Aanmelden</button></>
            )}
          </div>
        </div>
      </div>

      <section className="cta-section" id="early-access">
        <div className="cta-card fade-up">
          <div className="blob b1"/><div className="blob b2"/>
          <div className="cta-emojis">🚀 🐕 🐱</div>
          <h2>Kwispelclub lanceert binnenkort!</h2>
          <p>We bouwen hét huisdierplatform voor België en Nederland. Registreer je nu voor early access en wees er als eerste bij.</p>
          <div className="cta-input-row">
            <input className="cta-input" type="email" placeholder="Jouw e-mailadres" value={earlyEmail} onChange={e => setEarlyEmail(e.target.value)} />
            <select className="cta-select">
              <option>🛒 Ik ben koper</option><option>🏪 Ik ben verkoper</option><option>✂️ Ik heb een kapsalon</option><option>🎓 Ik ben trainer/expert</option>
            </select>
          </div>
          {earlyDone ? (
            <button className="btn btn-primary" style={{fontSize:17,padding:'16px 36px',background:'var(--green-main)'}}>✓ Je bent geregistreerd!</button>
          ) : (
            <button className="btn btn-primary" style={{fontSize:17,padding:'16px 36px'}} onClick={() => earlyEmail.includes('@') && setEarlyDone(true)}>Registreer voor Early Access →</button>
          )}
          <p style={{fontSize:12,opacity:.5,marginTop:14}}>Geen spam. Je ontvangt alleen updates over de lancering.</p>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="footer-logo"><div className="lp">🐾</div><span className="brand">Kwispelclub</span></a>
            <p>Het #1 platform voor huisdierliefhebbers in België en Nederland. Premium producten, expert advies en een warme community.</p>
            <div className="footer-social"><a href="#">📘</a><a href="#">📷</a><a href="#">🎵</a><a href="#">▶️</a></div>
          </div>
          <div className="footer-col"><h5>Shop</h5><a href="#">Hondenvoeding</a><a href="#">Kattenvoeding</a><a href="#">Speelgoed</a><a href="#">Accessoires</a><a href="#">Verzorging</a></div>
          <div className="footer-col"><h5>Platform</h5><a href="/puppy-training">Academy</a><a href="/2dehands">2de Hands</a><a href="/kapsalons">Kapsalons</a><a href="/blog">Blog</a><a href="/verkoper">Word Verkoper</a></div>
          <div className="footer-col"><h5>Support</h5><a href="/contact">Contact</a><a href="/contact#faq">FAQ</a><a href="/privacy">Privacybeleid</a><a href="/privacy">Voorwaarden</a><a href="/over-ons">Over Ons</a></div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Kwispelclub. Alle rechten voorbehouden.</span>
          <div className="footer-bottom-links"><a href="/privacy">Privacy</a><a href="/privacy">Cookies</a><a href="/privacy">Voorwaarden</a></div>
          <span>🇧🇪 België & 🇳🇱 Nederland</span>
        </div>
      </footer>

      {showPopup && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && (setShowPopup(false), sessionStorage.setItem('kc_seen','1'))}>
          <div className="modal">
            <div className="lm-emoji">🐾</div>
            <h2>Welkom bij Kwispelclub!</h2>
            <p>We zijn druk bezig met het bouwen van hét huisdierplatform voor België en Nederland. Wat je nu ziet is een voorproefje.</p>
            <div className="lm-feats">{['🛍️ Webshop — binnenkort','✂️ Boekingen — binnenkort','💬 Community — binnenkort','🎓 Academy — binnenkort'].map(f => <span key={f} className="lm-feat">{f}</span>)}</div>
            <p style={{fontSize:14}}><b>Wil je als eerste weten wanneer we live gaan?</b></p>
            <div className="lm-form">
              <input type="email" placeholder="Jouw e-mailadres" id="popupEmail" />
              <button onClick={() => { const el = document.getElementById('popupEmail') as HTMLInputElement; if(el?.value?.includes('@')){ setShowPopup(false); sessionStorage.setItem('kc_seen','1') } }}>Hou me op de hoogte</button>
            </div>
            <button className="lm-skip" onClick={() => { setShowPopup(false); sessionStorage.setItem('kc_seen','1') }}>Nee bedankt, ik kijk gewoon even rond →</button>
          </div>
        </div>
      )}

      {showCookie && (
        <div className="cookie-banner">
          <div className="cookie-inner">
            <div className="cookie-text"><p>🍪 Kwispelclub gebruikt cookies om je ervaring te verbeteren. <a href="/privacy">Meer info</a></p></div>
            <div className="cookie-btns">
              <button className="cookie-btn cookie-reject" onClick={() => { setShowCookie(false); localStorage.setItem('kc_cookies','reject') }}>Alleen noodzakelijk</button>
              <button className="cookie-btn cookie-settings" onClick={() => window.location.href='/privacy'}>Instellingen</button>
              <button className="cookie-btn cookie-accept" onClick={() => { setShowCookie(false); localStorage.setItem('kc_cookies','accept') }}>Alles Accepteren</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
