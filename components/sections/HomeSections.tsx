'use client'

import Link from 'next/link'

// ═══ TRUST BAR ═══
export function TrustBar() {
  const items = [
    { icon: '✅', bg: 'bg-[#E8F0E4]', title: 'Geverifieerde Verkopers', sub: '100% betrouwbaar' },
    { icon: '🚚', bg: 'bg-[#FFF3E0]', title: 'Snelle Levering', sub: 'Binnen 2-3 werkdagen' },
    { icon: '🐾', bg: 'bg-[#E8F0E4]', title: 'Dierenwelzijn Eerst', sub: 'Ethisch & duurzaam' },
    { icon: '💬', bg: 'bg-[#FFF3E0]', title: 'Expert Advies', sub: 'Dierenartsen & trainers' },
  ]

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 -mt-7 relative z-[2]">
      <div className="bg-white rounded-xl p-5 px-9 flex justify-center gap-6 md:gap-14 flex-wrap shadow-[0_16px_56px_rgba(0,0,0,0.14)]">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-[14px] ${item.bg} flex items-center justify-center text-[22px] shrink-0`}>
              {item.icon}
            </div>
            <div>
              <strong className="block text-sm text-[#2C2C2C]">{item.title}</strong>
              <span className="text-xs text-[#8A8A8A]">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ FEATURES ═══
export function Features() {
  const features = [
    { icon: '🛍️', title: 'Webshop', desc: 'Premium voeding & unieke speeltjes voor hond en kat, zorgvuldig geselecteerd door experts.', link: 'Shop hond & kat →', color: '#4A7C3F', bg: '#E8F0E4' },
    { icon: '🎓', title: 'Academy', desc: 'Video\'s en tips over puppy training, kattengedrag, voeding en gezondheid van experts.', link: 'Video\'s & info →', color: '#E8913A', bg: '#FFF3E0' },
    { icon: '🤝', title: 'Marktplaats', desc: 'Betrouwbare kopers & verkopers met geverifieerde matches en beveiligde chat.', link: 'Bekijk aanbod →', color: '#5C3D2E', bg: '#F5EDE0' },
    { icon: '💛', title: 'Community', desc: 'Forums, chatbox & advies van gelijkgestemde dierenliefhebbers in jouw regio.', link: 'Doe mee →', color: '#6B9E5E', bg: '#E8F5E0' },
  ]

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 py-[72px]">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl text-[#2D5A27] mb-3">Alles op één plek 🐾</h2>
        <p className="text-[#5A5A5A] text-base max-w-[520px] mx-auto leading-relaxed">
          Of je nu een puppy hebt of een senior kat — bij Kwispelclub vind je alles wat je nodig hebt.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-9 pb-7 text-center shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all" style={{ background: f.color }} />
            <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-4xl mx-auto mb-5" style={{ background: f.bg }}>
              {f.icon}
            </div>
            <h3 className="font-heading text-lg mb-2.5">{f.title}</h3>
            <p className="text-sm text-[#5A5A5A] leading-relaxed mb-5">{f.desc}</p>
            <span className="text-sm font-bold inline-flex items-center gap-1 group-hover:gap-2.5 transition-all" style={{ color: f.color }}>
              {f.link}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══ EARLY ACCESS CTA ═══
export function EarlyAccess() {
  const handleSubmit = () => {
    const email = (document.getElementById('earlyEmail') as HTMLInputElement)?.value
    const btn = document.getElementById('earlyBtn') as HTMLButtonElement
    if (email?.includes('@') && btn) {
      btn.textContent = '✓ Je bent geregistreerd!'
      btn.style.background = '#4A7C3F'
      setTimeout(() => {
        btn.textContent = 'Registreer voor Early Access →'
        btn.style.background = ''
      }, 4000)
    }
  }

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 pb-20" id="early-access">
      <div
        className="rounded-[36px] py-[72px] px-12 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2D5A27 0%, #4A7C3F 50%, #6B9E5E 100%)' }}
      >
        <div className="text-[52px] mb-7 flex justify-center gap-5">🚀 🐕 🐱</div>
        <h2 className="font-heading text-3xl md:text-[42px] mb-4 text-white">Kwispelclub lanceert binnenkort!</h2>
        <p className="text-[17px] opacity-80 max-w-[480px] mx-auto mb-9 leading-relaxed">
          We bouwen hét huisdierplatform voor België en Nederland. Registreer je nu voor early access.
        </p>
        <div className="flex gap-2 max-w-[440px] mx-auto mb-5 flex-wrap justify-center">
          <input
            id="earlyEmail"
            type="email"
            placeholder="Jouw e-mailadres"
            className="flex-1 min-w-[200px] px-5 py-4 rounded-full border-2 border-white/20 bg-white/10 text-white font-body text-[15px] outline-none placeholder:text-white/40 focus:border-white/40"
          />
          <select className="px-5 py-4 rounded-full border-2 border-white/20 bg-white/10 text-white font-body text-sm outline-none cursor-pointer appearance-none">
            <option className="text-[#2C2C2C]">🛒 Ik ben koper</option>
            <option className="text-[#2C2C2C]">🏪 Ik ben verkoper</option>
            <option className="text-[#2C2C2C]">✂️ Ik heb een kapsalon</option>
            <option className="text-[#2C2C2C]">🎓 Ik ben trainer/expert</option>
          </select>
        </div>
        <button
          id="earlyBtn"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-[#E8913A] text-white font-heading text-[17px] font-semibold border-none cursor-pointer shadow-[0_4px_20px_rgba(232,145,58,0.4)] hover:bg-[#D4812E] hover:-translate-y-[3px] transition-all"
        >
          Registreer voor Early Access →
        </button>
        <p className="text-xs opacity-50 mt-3.5">Geen spam. Je ontvangt alleen updates over de lancering.</p>
      </div>
    </section>
  )
}
