// Voeg dit toe aan je bestaande app/admin/page.tsx
// Nieuwe tab 'instellingen' in de sidebar nav en een nieuw panel

// ─── 1. Voeg toe aan type Tab ──────────────────────────────────
// type Tab = 'dashboard' | 'kapsalons' | 'gebruikers' | 'listings' | 'bestellingen' | 'instellingen'

// ─── 2. Voeg toe aan navItems array ───────────────────────────
// ['instellingen', '⚙️', 'Instellingen', null],

// ─── 3. Voeg toe aan tabTitles ────────────────────────────────
// instellingen: { title: 'Site Instellingen', desc: 'Beheer demo-data en site-instellingen' },

// ─── 4. Voeg state toe bovenaan de component ──────────────────
// const [siteSettings, setSiteSettings] = useState<Record<string, any>>({})
// const [settingsSaved, setSettingsSaved] = useState(false)

// ─── 5. Laad settings in loadData() ──────────────────────────
// const settingsRes = await fetch('/api/admin-settings')
// const settingsData = await settingsRes.json()
// setSiteSettings(settingsData.settings || {})

// ─── 6. Toggle handler ────────────────────────────────────────
// const toggleSetting = async (key: string, value: boolean) => {
//   setSiteSettings(prev => ({ ...prev, [key]: value }))
//   await fetch('/api/admin-settings', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ key, value }),
//   })
//   setSettingsSaved(true)
//   setTimeout(() => setSettingsSaved(false), 2000)
// }

// ─── 7. Voeg het panel toe in de main content sectie ──────────
// {tab === 'instellingen' && (
//   <SettingsPanel siteSettings={siteSettings} toggleSetting={toggleSetting} settingsSaved={settingsSaved} />
// )}

// ─── SETTINGS PANEL COMPONENT ─────────────────────────────────
// Zet dit BUITEN de AdminPage component, onderaan het bestand:

export function SettingsPanel({ siteSettings, toggleSetting, settingsSaved }: {
  siteSettings: Record<string, any>
  toggleSetting: (key: string, value: boolean) => void
  settingsSaved: boolean
}) {
  const demoSections = [
    { key: 'demo_webshop', label: '🛍️ Demo Producten (Webshop)', desc: 'Toont voorbeeldproducten als er nog geen echte verkopers zijn' },
    { key: 'demo_kapsalons', label: '✂️ Demo Kapsalons', desc: 'Toont voorbeeldsalons als er nog geen echte geregistreerde salons zijn' },
    { key: 'demo_2dehands', label: '♻️ Demo 2de Hands Listings', desc: 'Toont voorbeeldadvertenties als er nog geen echte listings zijn' },
    { key: 'demo_academy', label: '🎓 Demo Academy Content', desc: 'Toont voorbeeldcursussen en trainer' },
    { key: 'demo_blog', label: '📝 Demo Blogposts', desc: 'Toont voorbeeldartikelen in de blog' },
    { key: 'demo_verkopers', label: '🏪 Demo Verkopers', desc: 'Toont voorbeeldverkopers op de homepage' },
    { key: 'demo_reviews', label: '⭐ Demo Reviews', desc: 'Toont voorbeeldreviews en testimonials' },
  ]

  return (
    <div>
      {settingsSaved && (
        <div style={{ background: '#E8F0E4', border: '1.5px solid #4A7C3F', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 700, color: '#2D5A27' }}>
          ✅ Instelling opgeslagen
        </div>
      )}

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
            <button
              onClick={() => toggleSetting(s.key, !siteSettings[s.key])}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: siteSettings[s.key] ? '#4A7C3F' : '#E5EAF0',
                position: 'relative', transition: 'background .2s', flexShrink: 0
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: siteSettings[s.key] ? 25 : 3,
                transition: 'left .2s',
                boxShadow: '0 1px 3px rgba(0,0,0,.15)'
              }} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <h2 style={{ fontSize: 18, color: '#2C2C2C', marginBottom: 16 }}>🚀 Beta Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2C2C' }}>Beta banner tonen</div>
            <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2 }}>Oranje banner bovenaan elke pagina</div>
          </div>
          <button
            onClick={() => toggleSetting('site_in_beta', !siteSettings['site_in_beta'])}
            style={{
              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: siteSettings['site_in_beta'] ? '#E8913A' : '#E5EAF0',
              position: 'relative', transition: 'background .2s', flexShrink: 0
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3,
              left: siteSettings['site_in_beta'] ? 25 : 3,
              transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,.15)'
            }} />
          </button>
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#F0F4F8', borderRadius: 10, fontSize: 13, color: '#5A5A5A' }}>
          💡 <strong>Tip:</strong> Als je eerste echte verkoper live gaat, zet "Demo Producten" uit. De pagina toont dan automatisch alleen echte producten uit de database.
        </div>
      </div>
    </div>
  )
}
