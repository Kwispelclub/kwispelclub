import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-10 overflow-hidden relative" style={{ background: '#FFF9F0' }}>
      <div className="relative z-[1] max-w-[480px]">
        <div className="text-[120px] mb-4 animate-bounce">🐕</div>
        <div className="font-heading text-[clamp(80px,15vw,140px)] font-extrabold text-[#E8F0E4] leading-none -mb-2.5 tracking-tight">
          404
        </div>
        <h1 className="font-heading text-[28px] text-[#2D5A27] mb-3">
          Oeps! Deze pagina is weggelopen
        </h1>
        <p className="text-base text-[#5A5A5A] leading-relaxed mb-7">
          Net als een ontsnapte puppy in het park — deze pagina is nergens te vinden.
          Misschien is hij achter een eekhoorn aan gerend?
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-7 py-3.5 rounded-full font-heading text-[15px] font-semibold no-underline bg-[#4A7C3F] text-white shadow-[0_4px_16px_rgba(74,124,63,0.3)] hover:bg-[#2D5A27] hover:-translate-y-[3px] transition-all"
          >
            🏠 Terug naar Home
          </Link>
          <Link
            href="/contact"
            className="px-7 py-3.5 rounded-full font-heading text-[15px] font-semibold no-underline bg-transparent text-[#4A7C3F] border-2 border-[#E8F0E4] hover:bg-[#E8F0E4] hover:-translate-y-[3px] transition-all"
          >
            💬 Contact
          </Link>
        </div>
      </div>
    </main>
  )
}
