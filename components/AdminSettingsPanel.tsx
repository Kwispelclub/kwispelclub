'use client'

import { useState } from 'react'

export function SettingsPanel({ siteSettings, toggleSetting, settingsSaved }: {
  siteSettings: Record<string, any>
  toggleSetting: (key: string, value: any) => void
  settingsSaved: boolean
}) {
  const [mollieMode, setMollieMode] = useState<string>(siteSettings['mollie_mode'] || 'test')

  const saveMollieMode = async (mode: string) => {
    setMollieMode(mode)
    toggleSetting('mollie_mode', mode as any)
  }

  const demoSections = [
    { key: 'demo_webshop', label: '🛍️ Demo Producten (Webshop)', desc: 'Toont voorbeeldproducten als er nog geen echte verkopers zijn' },
    { key: 'demo_kapsalons', label: '✂️ Demo Kapsalons', desc: 'Toont voorbeeldsalons als er nog geen echte geregistreerde salons zijn' },
    { key: 'demo_2dehands', label: '♻️ Demo 2de Hands Listings', desc: 'Toont voorbeeldadvertenties als er nog geen echte listings zijn' },
    { key: 'demo_academy', label: '🎓 Demo Academy Content', desc: 'Toont voorbeeldcursussen en trainer' },
    { key: 'demo_blog', label: '📝 Demo Blogposts', desc: 'Toont voorbeeldartikelen in de blog' },
    { key: 'demo_verkopers', label: '🏪 Demo Verkopers', desc: 'Toont voorbeeldverkopers op de homepage' },
    { key: 'demo_reviews', label: '⭐ Demo Reviews', desc: 'Toont voorbeeldreviews en testimonials' },
  ]

  const Toggle = ({ settingKey, color = '#4A7C3F' }: { settingKey: string; color?: string }) => (
    <button
      onClick={() => toggleSetting(settingKey, !siteSettings[settingKey])}
      style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: siteSettings[settingKey] ? color : '#E5EAF0',
        position: 'relative', transition: 'background .2s', flexShrink: 0
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: siteSettings[settingKey] ? 25 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)'
      }} />
    </button>
  )

  const currentMode = siteSettings['mollie_mode'] || mollieMode || 'test'

  return (
    <div>
      {settingsSaved && (
        <div style={{ background: '#E8F0E4', border: '1.5px solid #4A7C3F', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 700, color: '#2D5A27' }}>
          ✅ Instelling opgeslagen
        </div>
      )}

      {/* MOLLIE MODE */}
      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, color: '#2C2C2C', marginBottom: 4 }}>💳 Mollie Betaalmodus</h2>
        <p style={{ fontSize: 13, color: '#8A8A8A', marginBottom: 20 }}>
          Schakel tussen test- en live betalingen. In testmodus worden geen echte betalingen verwerkt.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Test mode */}
          <button
            onClick={() => saveMollieMode('test')}
            style={{
              flex: 1, padding: '16px 20px', borderRadius: 12, border: `2px solid ${currentMode === 'test' ? '#E8913A' : '#E5EAF0'}`,
              background: currentMode === 'test' ? '#FFF3E0' : 'white',
              cursor: 'pointer', textAlign: 'left', transition: 'all .2s'
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>🧪</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: currentMode === 'test' ? '#E8913A' : '#2C2C2C', fontFamily: 'Fredoka, sans-serif' }}>Testmodus</div>
            <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 4 }}>Geen echte betalingen — veilig testen</div>
            {currentMode === 'test' && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#E8913A' }}>✓ ACTIEF</div>}
          </button>

          {/* Live mode */}
          <button
            onClick={() => saveMollieMode('live')}
            style={{
              flex: 1, padding: '16px 20px', borderRadius: 12, border: `2px solid ${currentMode === 'live' ? '#2A9D8F' : '#E5EAF0'}`,
              background: currentMode === 'live' ? '#E0F5F1' : 'white',
              cursor: 'pointer', textAlign: 'left', transition: 'all .2s'
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>💶</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: currentMode === 'live' ? '#2A9D8F' : '#2C2C2C', fontFamily: 'Fredoka, sans-serif' }}>Live modus</div>
            <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 4 }}>Echte betalingen worden verwerkt</div>
            {currentMode === 'live' && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#2A9D8F' }}>✓ ACTIEF</div>}
          </button>
        </div>

        {currentMode === 'live' && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: '#FFF0F0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#C0392B', border: '1.5px solid #FFCDD2' }}>
            ⚠️ <strong>Live modus actief</strong> — Klanten worden nu echt afgerekend via Mollie. Zorg dat alles correct geconfigureerd is.
          </div>
        )}
        {currentMode === 'test' && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: '#FFF3E0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#5C3D2E', border: '1.5px solid #F5A855' }}>
            🧪 <strong>Testmodus actief</strong> — Gebruik Mollie testnummers. Geen echte geldtransacties.
          </div>
        )}
      </div>

      {/* DEMO DATA */}
      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, color: '#2C2C2C', marginBottom: 4 }}>🎭 Demo Data Beheer</h2>
          <p style={{ fontSize: 13, color: '#8A8A8A' }}>
            Zet demo-data aan of uit per sectie. Zodra je echte verkopers, kapsalons of listings hebt, zet je de demo voor die sectie uit.
          </p>
        </div>

        {demoSections.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2C2C' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2 }}>{s.desc}</div>
            </div>
            <Toggle settingKey={s.key} />
          </div>
        ))}
      </div>

      {/* BETA STATUS */}
      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <h2 style={{ fontSize: 18, color: '#2C2C2C', marginBottom: 16 }}>🚀 Beta Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2C2C' }}>Beta banner tonen</div>
            <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2 }}>Oranje banner bovenaan elke pagina</div>
          </div>
          <Toggle settingKey="site_in_beta" color="#E8913A" />
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#F0F4F8', borderRadius: 10, fontSize: 13, color: '#5A5A5A' }}>
          💡 <strong>Tip:</strong> Als je eerste echte verkoper live gaat, zet "Demo Producten" uit. De pagina toont dan automatisch alleen echte producten uit de database.
        </div>
      </div>
    </div>
  )
}
