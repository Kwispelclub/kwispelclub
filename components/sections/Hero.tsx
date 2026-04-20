'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 pt-6">
      <div
        className="rounded-[36px] overflow-hidden relative min-h-[460px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #2D5A27 0%, #4A7C3F 40%, #6B9E5E 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[400px] h-[400px] rounded-full -top-[120px] -right-[80px] animate-blob" style={{ background: 'rgba(232,145,58,0.12)' }} />
          <div className="absolute w-[250px] h-[250px] rounded-full -bottom-[80px] left-[25%] animate-blob-reverse" style={{ background: 'rgba(255,249,240,0.08)' }} />
          <div className="absolute w-[180px] h-[180px] rounded-full top-[35%] right-[20%] animate-blob-slow" style={{ background: 'rgba(245,168,85,0.1)' }} />
        </div>

        {/* Content */}
        <div className="relative z-[2] py-[60px] px-8 md:px-12 lg:px-[80px] max-w-[560px]">
          <div className="inline-flex items-center gap-2 bg-white/15 px-[18px] py-[7px] rounded-full text-white/90 text-[13px] font-bold mb-6 backdrop-blur-sm border border-white/10">
            🌟 #1 Huisdierplatform in België & Nederland
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[58px] text-white leading-[1.08] mb-[18px] tracking-tight">
            Alles voor je <span className="text-[#F5A855]">beste vriend</span>
          </h1>
          <p className="text-white/80 text-[17px] leading-relaxed mb-8 max-w-[400px]">
            Vind premium voeding, deskundig advies, betrouwbare verkopers en een warme community — alles op één plek.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="#shop"
              className="inline-flex items-center gap-2 px-[30px] py-[15px] rounded-full font-heading text-[15px] font-semibold no-underline bg-[#E8913A] text-white shadow-[0_4px_20px_rgba(232,145,58,0.4)] hover:bg-[#D4812E] hover:-translate-y-[3px] transition-all"
            >
              Ontdek nu →
            </Link>
            <Link
              href="/kapsalons"
              className="inline-flex items-center gap-2 px-[30px] py-[15px] rounded-full font-heading text-[15px] font-semibold no-underline bg-white/12 text-white border border-white/25 backdrop-blur-sm hover:bg-white/22 hover:-translate-y-[3px] transition-all"
            >
              Bekijk marktplaats
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80"
              alt="Twee honden spelen samen buiten"
              fill
              className="object-cover"
              style={{
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
              }}
              priority
            />
          </div>
          {/* Floating badges */}
          <div className="absolute bottom-20 right-10 bg-white/95 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 z-[3] animate-float">
            <div className="w-9 h-9 rounded-[10px] bg-[#E8F0E4] flex items-center justify-center text-lg">⭐</div>
            <div className="text-[12px] font-bold text-[#2C2C2C] leading-tight">
              4.9 / 5.0<br /><span className="font-normal text-[11px] text-[#8A8A8A]">12.500+ reviews</span>
            </div>
          </div>
          <div className="absolute top-[60px] right-[60px] bg-white/95 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 z-[3] animate-float-delayed">
            <div className="w-9 h-9 rounded-[10px] bg-[#FFF3E0] flex items-center justify-center text-lg">🐾</div>
            <div className="text-[12px] font-bold text-[#2C2C2C] leading-tight">
              85+ Verkopers<br /><span className="font-normal text-[11px] text-[#8A8A8A]">Geverifieerd</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-25px) scale(1.06)}66%{transform:translate(-15px,15px) scale(0.94)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .animate-blob{animation:blob 8s ease-in-out infinite}
        .animate-blob-reverse{animation:blob 11s ease-in-out infinite reverse}
        .animate-blob-slow{animation:blob 14s ease-in-out infinite}
        .animate-float{animation:float 4s ease-in-out infinite}
        .animate-float-delayed{animation:float 4s ease-in-out infinite 1.5s}
      `}</style>
    </section>
  )
}
