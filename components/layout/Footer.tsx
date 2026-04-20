import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#2D5A27] text-white relative z-[1]">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 pt-16 pb-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 no-underline mb-4">
              <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center text-lg">🐾</div>
              <span className="font-heading text-xl font-bold text-white tracking-[0.5px]">Kwispelclub</span>
            </Link>
            <p className="text-sm opacity-60 leading-relaxed max-w-[300px]">
              Het #1 platform voor huisdierliefhebbers in België en Nederland. Premium producten, expert advies en een warme community.
            </p>
            <div className="flex gap-2 mt-5">
              {['📘', '📷', '🎵', '▶️'].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg no-underline hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h5 className="text-[13px] font-bold mb-4 opacity-45 uppercase tracking-[1.5px]">Shop</h5>
            {['Hondenvoeding', 'Kattenvoeding', 'Speelgoed', 'Accessoires', 'Verzorging', 'Cadeaukaarten'].map(l => (
              <a key={l} href="#" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100 transition-opacity">{l}</a>
            ))}
          </div>

          {/* Platform */}
          <div>
            <h5 className="text-[13px] font-bold mb-4 opacity-45 uppercase tracking-[1.5px]">Platform</h5>
            <Link href="/puppy-training.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Academy</Link>
            <Link href="/kapsalons.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Hondenkapsalons</Link>
            <Link href="/2dehands.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">2de Hands</Link>
            <Link href="/blog.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Blog</Link>
            <Link href="/verkoper.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Word Verkoper</Link>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-[13px] font-bold mb-4 opacity-45 uppercase tracking-[1.5px]">Support</h5>
            <Link href="/contact.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Help Center</Link>
            <Link href="/contact.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Contact</Link>
            <Link href="/contact.html#faq" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">FAQ</Link>
            <Link href="/privacy.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Privacybeleid</Link>
            <Link href="/privacy.html" className="block text-white opacity-70 no-underline text-sm py-1 hover:opacity-100">Voorwaarden</Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] pt-6 flex justify-between items-center flex-wrap gap-2 text-[13px] opacity-40">
          <span>© 2026 Kwispelclub. Alle rechten voorbehouden.</span>
          <div className="flex gap-5">
            <Link href="/privacy.html" className="text-white no-underline hover:underline">Privacy</Link>
            <Link href="/privacy.html" className="text-white no-underline hover:underline">Cookies</Link>
            <Link href="/privacy.html" className="text-white no-underline hover:underline">Voorwaarden</Link>
          </div>
          <span>🇧🇪 België & 🇳🇱 Nederland</span>
        </div>
      </div>
    </footer>
  )
}
