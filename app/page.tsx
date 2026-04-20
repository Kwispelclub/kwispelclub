import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LaunchBanner from '@/components/layout/LaunchBanner'
import CookieBanner from '@/components/layout/CookieBanner'
import Hero from '@/components/sections/Hero'
import { TrustBar, Features, EarlyAccess } from '@/components/sections/HomeSections'

export default function Home() {
  return (
    <>
      <LaunchBanner />
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        {/* TODO: Migrate remaining sections from HTML to React:
            - Stats counter bar
            - Products grid (demo)
            - Breed selector
            - Academy preview
            - Marketplace (koper-verkoper chat)
            - Sellers spotlight
            - Testimonials
            - Community
            - Newsletter
            - Chatbot (Kwispel)
        */}
        <EarlyAccess />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}
