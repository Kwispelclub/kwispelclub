import { useState, useEffect } from "react";

const COLORS = {
  bg: "#F8F6F1", sidebar: "#1E3A1A", sidebarHover: "#2D5A27", accent: "#4A7C3F",
  accentLight: "#E8F0E4", orange: "#E8913A", orangeLight: "#FFF3E0", teal: "#2A9D8F",
  tealLight: "#E0F5F1", white: "#FFFFFF", card: "#FFFFFF", border: "#E8E4DC",
  text: "#2C2C2C", textMid: "#5A5A5A", textLight: "#8A8A8A", red: "#E84E4E",
  redLight: "#FEE8E8",
};

// ═══ MOCK DATA ═══
const initialData = {
  siteSettings: {
    siteName: "Kwispelclub", tagline: "Alles voor je beste vriend", logo: "🐾",
    primaryColor: "#4A7C3F", secondaryColor: "#E8913A", contactEmail: "info@kwispelclub.be",
    phone: "+32 89 123 456", address: "Bree, Limburg, België", launchMode: true,
    launchText: "Kwispelclub is in opbouw! Webshop & boekingen zijn nog niet actief.",
    socialFacebook: "https://facebook.com/kwispelclub", socialInstagram: "https://instagram.com/kwispelclub",
    socialTiktok: "", freeShippingMin: 50, currency: "EUR", language: "nl",
  },
  heroContent: {
    title: "Alles voor je beste vriend", subtitle: "Vind premium voeding, deskundig advies, betrouwbare verkopers en een warme community.", 
    ctaPrimary: "Ontdek nu →", ctaSecondary: "Bekijk marktplaats", heroImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    tagText: "#1 Huisdierplatform in België & Nederland",
  },
  users: [
    { id: 1, name: "Sofie V.", email: "sofie@email.be", role: "koper", status: "actief", joined: "2026-01-15", purchases: 4, avatar: "👩", verified: true },
    { id: 2, name: "Thomas D.", email: "thomas@email.be", role: "koper", status: "actief", joined: "2026-02-08", purchases: 2, avatar: "👨", verified: true },
    { id: 3, name: "Lisa M.", email: "lisa@email.be", role: "koper", status: "actief", joined: "2026-03-01", purchases: 1, avatar: "👩", verified: true },
    { id: 4, name: "Huisdiershop De Poot", email: "info@depoot.be", role: "verkoper", status: "actief", joined: "2026-01-10", purchases: 0, avatar: "🏪", verified: true },
    { id: 5, name: "Golden Dreams Kennel", email: "info@goldendreams.be", role: "verkoper", status: "in review", joined: "2026-03-20", purchases: 0, avatar: "🐕‍🦺", verified: false },
    { id: 6, name: "KattenKracht", email: "info@kattenkracht.be", role: "verkoper", status: "actief", joined: "2026-02-01", purchases: 0, avatar: "🧶", verified: true },
    { id: 7, name: "Jan K.", email: "jan@email.be", role: "koper", status: "geblokkeerd", joined: "2026-01-25", purchases: 0, avatar: "👨", verified: false },
  ],
  products: [
    { id: 1, name: "Biologische Kip & Rijst Brokken", brand: "Kwispelclub Premium", price: 34.95, category: "Voeding", status: "demo", image: "🦴", stock: 0 },
    { id: 2, name: "Interactief Kattenspeeltje Set", brand: "KattenKracht", price: 19.50, category: "Speelgoed", status: "demo", image: "🧶", stock: 0 },
    { id: 3, name: "Ergonomische Anti-trek Tuigje", brand: "WoofWalk", price: 27.99, category: "Accessoires", status: "demo", image: "🐕", stock: 0 },
    { id: 4, name: "Kattenkruid & Valeriaan Mix", brand: "NatuurPuur", price: 12.95, category: "Verzorging", status: "demo", image: "🐱", stock: 0 },
  ],
  salons: [
    { id: 1, name: "Happy Paws Grooming", location: "Bree, Limburg", rating: 4.9, reviews: 87, status: "actief", services: 4 },
    { id: 2, name: "De Gouden Schaar", location: "Hasselt, Limburg", rating: 4.7, reviews: 42, status: "actief", services: 3 },
    { id: 3, name: "Woef Wellness", location: "Antwerpen", rating: 4.8, reviews: 156, status: "actief", services: 5 },
    { id: 4, name: "Trim & Style", location: "Leuven", rating: 4.6, reviews: 68, status: "in review", services: 3 },
    { id: 5, name: "Knip & Kwispel", location: "Gent", rating: 4.9, reviews: 203, status: "actief", services: 4 },
    { id: 6, name: "Dierenkappers de Luxe", location: "Maastricht", rating: 4.8, reviews: 134, status: "actief", services: 6 },
  ],
  courses: [
    { id: 1, name: "Puppy Training Basics", modules: 8, lessons: 24, duration: "2,5 uur", trainer: "Lisa van den Berg", status: "demo", category: "Hond" },
    { id: 2, name: "Kattenkruid Geheimen", modules: 3, lessons: 9, duration: "45 min", trainer: "Dierenarts Jan", status: "concept", category: "Kat" },
    { id: 3, name: "Voeding voor Senior Honden", modules: 5, lessons: 15, duration: "1,5 uur", trainer: "Voedingsexpert", status: "concept", category: "Hond" },
  ],
  secondHand: [
    { id: 1, title: "Kong Hondenbench XL", seller: "Sofie V.", price: 45, originalPrice: 89.95, status: "actief", condition: "Zo goed als nieuw" },
    { id: 2, title: "Ruffwear Anti-trek Tuigje M", seller: "Thomas D.", price: 22, originalPrice: 42, status: "actief", condition: "Licht gebruikt" },
    { id: 3, title: "FURminator Onthaarder Large", seller: "Emma B.", price: 15, originalPrice: 29.95, status: "gereserveerd", condition: "Licht gebruikt" },
  ],
  chatbot: {
    name: "Kwispel", avatar: "🐕", greeting: "Woef! 🐾 Ik ben Kwispel, jouw persoonlijke huisdier-assistent!",
    enabled: true, hashtagCount: 18, 
    hashtags: ["#voeding","#hondenvoeding","#kattenvoeding","#puppyvoeding","#seniorvoeding","#allergieen","#training","#puppytraining","#gedrag","#socialisatie","#kapsalon","#kapsalonbree","#trimtips","#vacht","#gezondheid","#vaccinaties","#ontwormen","#bestellen"],
  },
  pages: [
    { id: "index", name: "Homepage", file: "kwispelclub-index.html", status: "live" },
    { id: "kapsalons", name: "Hondenkapsalons", file: "kwispelclub-hondenkapsalons.html", status: "live" },
    { id: "training", name: "Puppy Training", file: "kwispelclub-puppy-training.html", status: "live" },
    { id: "2dehands", name: "2de Hands", file: "kwispelclub-2dehands.html", status: "live" },
  ],
};

// ═══ COMPONENTS ═══

function StatusBadge({ status }) {
  const colors = {
    actief: { bg: COLORS.accentLight, color: COLORS.accent },
    live: { bg: COLORS.accentLight, color: COLORS.accent },
    demo: { bg: COLORS.orangeLight, color: COLORS.orange },
    concept: { bg: "#EDE8F5", color: "#6B4FA0" },
    "in review": { bg: COLORS.orangeLight, color: COLORS.orange },
    geblokkeerd: { bg: COLORS.redLight, color: COLORS.red },
    gereserveerd: { bg: COLORS.tealLight, color: COLORS.teal },
  };
  const c = colors[status] || { bg: "#eee", color: "#666" };
  return <span style={{ background: c.bg, color: c.color, padding: "3px 12px", borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{status}</span>;
}

function StatCard({ icon, label, value, sub, color = COLORS.accent }) {
  return (
    <div style={{ background: COLORS.white, borderRadius: 16, padding: "24px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", flex: 1, minWidth: 180, border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
        <span style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function DataTable({ columns, data, actions }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.white }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#F8F6F1" }}>
            {columns.map((col, i) => <th key={i} style={{ padding: "14px 16px", textAlign: "left", fontWeight: 700, fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${COLORS.border}` }}>{col.label}</th>)}
            {actions && <th style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700, fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", borderBottom: `2px solid ${COLORS.border}` }}>Acties</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FDFCFA"} onMouseLeave={e => e.currentTarget.style.background = ""}>
              {columns.map((col, ci) => <td key={ci} style={{ padding: "14px 16px", color: COLORS.text }}>{col.render ? col.render(row) : row[col.key]}</td>)}
              {actions && <td style={{ padding: "14px 16px", textAlign: "right" }}>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditModal({ title, fields, data, onSave, onClose }) {
  const [form, setForm] = useState({ ...data });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: COLORS.white, borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "28px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 20, color: COLORS.accent }}>{title}</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#F0EDE6", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {fields.map((f, i) => (
            <div key={i}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: COLORS.textMid }}>{f.label}</label>
              {f.type === "select" ? (
                <select value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "11px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: COLORS.white }}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3} style={{ width: "100%", padding: "11px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
              ) : f.type === "toggle" ? (
                <div onClick={() => setForm({ ...form, [f.key]: !form[f.key] })} style={{ width: 48, height: 26, borderRadius: 13, background: form[f.key] ? COLORS.accent : COLORS.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: form[f.key] ? 24 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                </div>
              ) : (
                <input type={f.type || "text"} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })} style={{ width: "100%", padding: "11px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 50, border: `2px solid ${COLORS.border}`, background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuleren</button>
            <button onClick={() => { onSave(form); onClose(); }} style={{ padding: "10px 22px", borderRadius: 50, border: "none", background: COLORS.accent, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Opslaan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, color = COLORS.accent, onClick }) {
  return <button onClick={onClick} title={label} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: color + "14", color, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.background = color + "28"; }} onMouseLeave={e => { e.currentTarget.style.background = color + "14"; }}>{icon}</button>;
}

// ═══ MAIN APP ═══
export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [data, setData] = useState(initialData);
  const [editModal, setEditModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const nav = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "site", icon: "🎨", label: "Site Instellingen" },
    { id: "hero", icon: "🖼️", label: "Hero & Content" },
    { id: "pages", icon: "📄", label: "Pagina's" },
    { id: "users", icon: "👥", label: "Gebruikers" },
    { id: "products", icon: "🛍️", label: "Producten" },
    { id: "salons", icon: "✂️", label: "Kapsalons" },
    { id: "courses", icon: "🎓", label: "Academy" },
    { id: "secondhand", icon: "♻️", label: "2de Hands" },
    { id: "chatbot", icon: "🤖", label: "Chatbot" },
  ];

  const updateData = (section, id, updates) => {
    setData(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? prev[section].map(item => item.id === id ? { ...item, ...updates } : item)
        : { ...prev[section], ...updates }
    }));
    showToast("✓ Wijzigingen opgeslagen!");
  };

  // ═══ DASHBOARD ═══
  const renderDashboard = () => (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard icon="👥" label="Gebruikers" value={data.users.length} sub={`${data.users.filter(u => u.role === "verkoper").length} verkopers`} />
        <StatCard icon="🛍️" label="Producten" value={data.products.length} sub="Alle demo" color={COLORS.orange} />
        <StatCard icon="✂️" label="Kapsalons" value={data.salons.length} sub={`${data.salons.filter(s => s.status === "actief").length} actief`} color={COLORS.teal} />
        <StatCard icon="♻️" label="2de Hands" value={data.secondHand.length} sub={`${data.secondHand.filter(s => s.status === "actief").length} actief`} color="#6B4FA0" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: COLORS.accent }}>🚀 Launch Status</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: data.siteSettings.launchMode ? COLORS.orangeLight : COLORS.accentLight, borderRadius: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{data.siteSettings.launchMode ? "🔧" : "🟢"}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{data.siteSettings.launchMode ? "In Opbouw" : "Live"}</div>
              <div style={{ fontSize: 13, color: COLORS.textMid }}>Demo-modus is {data.siteSettings.launchMode ? "actief" : "uitgeschakeld"}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6 }}>Schakel de launch-modus uit wanneer de webshop, betalingen en boekingssysteem klaar zijn.</div>
        </div>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: COLORS.accent }}>📄 Pagina's</h3>
          {data.pages.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.file}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginTop: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: COLORS.accent }}>📋 Recente Activiteit</h3>
        {[
          { time: "2 min geleden", text: "Golden Dreams Kennel heeft zich geregistreerd als verkoper", icon: "🏪" },
          { time: "1 uur geleden", text: "Sofie V. heeft een 2de hands advertentie geplaatst", icon: "♻️" },
          { time: "3 uur geleden", text: "Nieuw kapsalon 'Trim & Style' in review", icon: "✂️" },
          { time: "Gisteren", text: "Thomas D. heeft Puppy Training module 2 voltooid", icon: "🎓" },
          { time: "Gisteren", text: "Lisa M. heeft een account aangemaakt", icon: "👤" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none" }}>
            <span style={{ fontSize: 22 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{a.text}</div>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ SITE SETTINGS ═══
  const renderSiteSettings = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🎨 Algemeen</h3>
        {[
          { label: "Sitenaam", key: "siteName" }, { label: "Tagline", key: "tagline" },
          { label: "Logo Emoji", key: "logo" }, { label: "Contact E-mail", key: "contactEmail" },
          { label: "Telefoon", key: "phone" }, { label: "Adres", key: "address" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>{f.label}</label>
            <input value={data.siteSettings[f.key]} onChange={e => updateData("siteSettings", null, { [f.key]: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🚀 Launch Modus</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: data.siteSettings.launchMode ? COLORS.orangeLight : COLORS.accentLight, borderRadius: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Demo-modus</div>
              <div style={{ fontSize: 13, color: COLORS.textMid }}>Toon "in opbouw" banners</div>
            </div>
            <div onClick={() => updateData("siteSettings", null, { launchMode: !data.siteSettings.launchMode })}
              style={{ width: 48, height: 26, borderRadius: 13, background: data.siteSettings.launchMode ? COLORS.orange : COLORS.accent, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: data.siteSettings.launchMode ? 24 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>Banner Tekst</label>
            <textarea value={data.siteSettings.launchText} onChange={e => updateData("siteSettings", null, { launchText: e.target.value })} rows={2}
              style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
          </div>
        </div>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🌐 Social Media</h3>
          {[{ label: "Facebook", key: "socialFacebook" }, { label: "Instagram", key: "socialInstagram" }, { label: "TikTok", key: "socialTiktok" }].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>{f.label}</label>
              <input value={data.siteSettings[f.key]} onChange={e => updateData("siteSettings", null, { [f.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          ))}
        </div>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🛒 Shop Instellingen</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>Gratis verzending vanaf (€)</label>
            <input type="number" value={data.siteSettings.freeShippingMin} onChange={e => updateData("siteSettings", null, { freeShippingMin: parseFloat(e.target.value) })}
              style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>
      </div>
    </div>
  );

  // ═══ HERO ═══
  const renderHero = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🖼️ Hero Sectie Bewerken</h3>
        {[
          { label: "Titel", key: "title" }, { label: "Ondertitel", key: "subtitle", type: "textarea" },
          { label: "Tag tekst", key: "tagText" }, { label: "CTA Primair", key: "ctaPrimary" },
          { label: "CTA Secundair", key: "ctaSecondary" }, { label: "Hero Afbeelding URL", key: "heroImage" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea value={data.heroContent[f.key]} onChange={e => updateData("heroContent", null, { [f.key]: e.target.value })} rows={2}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
            ) : (
              <input value={data.heroContent[f.key]} onChange={e => updateData("heroContent", null, { [f.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            )}
          </div>
        ))}
      </div>
      <div>
        <div style={{ background: "linear-gradient(135deg, #2D5A27, #4A7C3F, #6B9E5E)", borderRadius: 20, padding: 36, color: "white", position: "relative", overflow: "hidden", minHeight: 300 }}>
          <div style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", display: "inline-block", padding: "5px 14px", borderRadius: 50, marginBottom: 16, fontWeight: 700 }}>🌟 {data.heroContent.tagText}</div>
          <h2 style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 12 }}>{data.heroContent.title}</h2>
          <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, marginBottom: 20, maxWidth: 320 }}>{data.heroContent.subtitle}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ padding: "10px 20px", borderRadius: 50, background: COLORS.orange, fontSize: 13, fontWeight: 700 }}>{data.heroContent.ctaPrimary}</span>
            <span style={{ padding: "10px 20px", borderRadius: 50, background: "rgba(255,255,255,0.15)", fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>{data.heroContent.ctaSecondary}</span>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: COLORS.textLight, textAlign: "center" }}>↑ Live preview van de hero sectie</div>
      </div>
    </div>
  );

  // ═══ TABLE SECTIONS ═══
  const renderUsers = () => (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["Alle", "Kopers", "Verkopers", "In Review", "Geblokkeerd"].map(f => (
          <button key={f} style={{ padding: "7px 18px", borderRadius: 50, border: `2px solid ${COLORS.border}`, background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
        ))}
      </div>
      <DataTable
        columns={[
          { label: "", key: "avatar", render: r => <span style={{ fontSize: 24 }}>{r.avatar}</span> },
          { label: "Naam", key: "name", render: r => <div><div style={{ fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 12, color: COLORS.textLight }}>{r.email}</div></div> },
          { label: "Rol", key: "role", render: r => <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{r.role}</span> },
          { label: "Status", key: "status", render: r => <StatusBadge status={r.status} /> },
          { label: "Geverifieerd", key: "verified", render: r => r.verified ? <span style={{ color: COLORS.accent }}>✓ Ja</span> : <span style={{ color: COLORS.textLight }}>✗ Nee</span> },
          { label: "Aankopen", key: "purchases" },
          { label: "Lid sinds", key: "joined" },
        ]}
        data={data.users}
        actions={row => (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <ActionBtn icon="✏️" label="Bewerk" onClick={() => setEditModal({ type: "user", data: row })} />
            <ActionBtn icon={row.verified ? "✗" : "✓"} label={row.verified ? "Unverify" : "Verify"} color={COLORS.teal} onClick={() => updateData("users", row.id, { verified: !row.verified })} />
            <ActionBtn icon="🚫" label="Blokkeer" color={COLORS.red} onClick={() => updateData("users", row.id, { status: row.status === "geblokkeerd" ? "actief" : "geblokkeerd" })} />
          </div>
        )}
      />
    </div>
  );

  const renderProducts = () => (
    <div>
      <DataTable
        columns={[
          { label: "", render: r => <span style={{ fontSize: 28 }}>{r.image}</span> },
          { label: "Product", render: r => <div><div style={{ fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 12, color: COLORS.textLight }}>{r.brand}</div></div> },
          { label: "Prijs", render: r => <span style={{ fontWeight: 700, color: COLORS.accent }}>€{r.price.toFixed(2)}</span> },
          { label: "Categorie", key: "category" },
          { label: "Status", render: r => <StatusBadge status={r.status} /> },
          { label: "Voorraad", render: r => <span style={{ color: r.stock > 0 ? COLORS.accent : COLORS.textLight }}>{r.stock > 0 ? r.stock : "—"}</span> },
        ]}
        data={data.products}
        actions={row => (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <ActionBtn icon="✏️" label="Bewerk" onClick={() => setEditModal({ type: "product", data: row })} />
            <ActionBtn icon="🗑️" label="Verwijder" color={COLORS.red} />
          </div>
        )}
      />
    </div>
  );

  const renderSalons = () => (
    <DataTable
      columns={[
        { label: "Salon", render: r => <div style={{ fontWeight: 700 }}>{r.name}</div> },
        { label: "Locatie", key: "location" },
        { label: "Rating", render: r => <span>⭐ {r.rating} <span style={{ color: COLORS.textLight }}>({r.reviews})</span></span> },
        { label: "Diensten", key: "services" },
        { label: "Status", render: r => <StatusBadge status={r.status} /> },
      ]}
      data={data.salons}
      actions={row => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <ActionBtn icon="✏️" label="Bewerk" onClick={() => setEditModal({ type: "salon", data: row })} />
          {row.status === "in review" && <ActionBtn icon="✓" label="Goedkeuren" color={COLORS.teal} onClick={() => updateData("salons", row.id, { status: "actief" })} />}
        </div>
      )}
    />
  );

  const renderCourses = () => (
    <DataTable
      columns={[
        { label: "Cursus", render: r => <div style={{ fontWeight: 700 }}>{r.name}</div> },
        { label: "Categorie", key: "category" },
        { label: "Modules", key: "modules" },
        { label: "Lessen", key: "lessons" },
        { label: "Duur", key: "duration" },
        { label: "Trainer", key: "trainer" },
        { label: "Status", render: r => <StatusBadge status={r.status} /> },
      ]}
      data={data.courses}
      actions={row => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <ActionBtn icon="✏️" label="Bewerk" onClick={() => setEditModal({ type: "course", data: row })} />
        </div>
      )}
    />
  );

  const renderSecondHand = () => (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="♻️" label="Actieve listings" value={data.secondHand.filter(s => s.status === "actief").length} color={COLORS.teal} />
        <StatCard icon="🔒" label="Gereserveerd" value={data.secondHand.filter(s => s.status === "gereserveerd").length} color={COLORS.orange} />
        <StatCard icon="✌️" label="Max per gebruiker" value="2" sub="Actieve advertenties" color="#6B4FA0" />
        <StatCard icon="🧾" label="Aankoop-eis" value="3 mnd" sub="Laatste aankoop vereist" color={COLORS.accent} />
      </div>
      <DataTable
        columns={[
          { label: "Product", render: r => <div style={{ fontWeight: 700 }}>{r.title}</div> },
          { label: "Verkoper", key: "seller" },
          { label: "Prijs", render: r => <span style={{ fontWeight: 700, color: COLORS.teal }}>€{r.price}</span> },
          { label: "Nieuwprijs", render: r => <span style={{ textDecoration: "line-through", color: COLORS.textLight }}>€{r.originalPrice}</span> },
          { label: "Staat", key: "condition" },
          { label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        data={data.secondHand}
        actions={row => (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <ActionBtn icon="✏️" label="Bewerk" />
            <ActionBtn icon="🗑️" label="Verwijder" color={COLORS.red} />
          </div>
        )}
      />
    </div>
  );

  const renderChatbot = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}>🤖 Chatbot Instellingen</h3>
        {[
          { label: "Bot Naam", key: "name" }, { label: "Avatar Emoji", key: "avatar" },
          { label: "Begroeting", key: "greeting", type: "textarea" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 4 }}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea value={data.chatbot[f.key]} onChange={e => updateData("chatbot", null, { [f.key]: e.target.value })} rows={3}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
            ) : (
              <input value={data.chatbot[f.key]} onChange={e => updateData("chatbot", null, { [f.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            )}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: data.chatbot.enabled ? COLORS.accentLight : COLORS.redLight, borderRadius: 12, marginTop: 8 }}>
          <div><div style={{ fontWeight: 700 }}>Chatbot Actief</div><div style={{ fontSize: 13, color: COLORS.textMid }}>{data.chatbot.enabled ? "Bezoekers kunnen chatten" : "Chatbot is verborgen"}</div></div>
          <div onClick={() => updateData("chatbot", null, { enabled: !data.chatbot.enabled })}
            style={{ width: 48, height: 26, borderRadius: 13, background: data.chatbot.enabled ? COLORS.accent : COLORS.red, cursor: "pointer", position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: data.chatbot.enabled ? 24 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
      </div>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 17, marginBottom: 20, color: COLORS.accent }}># Hashtags ({data.chatbot.hashtags.length})</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.chatbot.hashtags.map((h, i) => (
            <span key={i} style={{ padding: "6px 14px", borderRadius: 50, background: COLORS.accentLight, fontSize: 13, fontWeight: 700, color: COLORS.accent, cursor: "pointer" }}>{h}</span>
          ))}
        </div>
        <div style={{ padding: 16, background: COLORS.bg, borderRadius: 12, fontSize: 13, color: COLORS.textMid, lineHeight: 1.6 }}>
          💡 Elke hashtag is gekoppeld aan een antwoord met follow-up hashtags. In een latere fase kan Kwispel gekoppeld worden aan de Anthropic API voor echte AI-antwoorden.
        </div>
      </div>
    </div>
  );

  const renderPages = () => (
    <div>
      <DataTable
        columns={[
          { label: "Pagina", render: r => <div style={{ fontWeight: 700 }}>{r.name}</div> },
          { label: "Bestand", render: r => <span style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.textMid, background: COLORS.bg, padding: "3px 10px", borderRadius: 6 }}>{r.file}</span> },
          { label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        data={data.pages}
        actions={row => (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <ActionBtn icon="👁️" label="Bekijk" color={COLORS.teal} />
            <ActionBtn icon="✏️" label="Bewerk" />
          </div>
        )}
      />
    </div>
  );

  const sections = {
    dashboard: renderDashboard, site: renderSiteSettings, hero: renderHero, pages: renderPages,
    users: renderUsers, products: renderProducts, salons: renderSalons,
    courses: renderCourses, secondhand: renderSecondHand, chatbot: renderChatbot,
  };

  const sectionTitles = {
    dashboard: "Dashboard", site: "Site Instellingen", hero: "Hero & Content", pages: "Pagina's",
    users: "Gebruikers Beheer", products: "Producten Beheer", salons: "Kapsalons Beheer",
    courses: "Academy Cursussen", secondhand: "2de Hands Beheer", chatbot: "Chatbot Beheer",
  };

  // Edit modal configs
  const editModalConfigs = {
    user: { title: "Gebruiker Bewerken", fields: [
      { label: "Naam", key: "name" }, { label: "E-mail", key: "email", type: "email" },
      { label: "Rol", key: "role", type: "select", options: ["koper", "verkoper", "admin"] },
      { label: "Status", key: "status", type: "select", options: ["actief", "in review", "geblokkeerd"] },
      { label: "Geverifieerd", key: "verified", type: "toggle" },
    ], section: "users" },
    product: { title: "Product Bewerken", fields: [
      { label: "Naam", key: "name" }, { label: "Merk", key: "brand" },
      { label: "Prijs (€)", key: "price", type: "number" },
      { label: "Categorie", key: "category", type: "select", options: ["Voeding", "Speelgoed", "Accessoires", "Verzorging", "Transport"] },
      { label: "Emoji/Icoon", key: "image" },
      { label: "Status", key: "status", type: "select", options: ["demo", "actief", "uitverkocht", "verborgen"] },
      { label: "Voorraad", key: "stock", type: "number" },
    ], section: "products" },
    salon: { title: "Kapsalon Bewerken", fields: [
      { label: "Naam", key: "name" }, { label: "Locatie", key: "location" },
      { label: "Status", key: "status", type: "select", options: ["actief", "in review", "inactief"] },
    ], section: "salons" },
    course: { title: "Cursus Bewerken", fields: [
      { label: "Naam", key: "name" }, { label: "Trainer", key: "trainer" },
      { label: "Categorie", key: "category", type: "select", options: ["Hond", "Kat", "Algemeen"] },
      { label: "Status", key: "status", type: "select", options: ["demo", "concept", "actief", "verborgen"] },
    ], section: "courses" },
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Nunito', -apple-system, sans-serif", background: COLORS.bg, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: 260, background: COLORS.sidebar, color: "white", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🐾</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>Kwispelclub</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Admin Panel</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none",
                background: activeSection === item.id ? "rgba(255,255,255,0.12)" : "transparent",
                color: activeSection === item.id ? "white" : "rgba(255,255,255,0.6)",
                fontSize: 14, fontWeight: activeSection === item.id ? 700 : 500, cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", transition: "all 0.15s", marginBottom: 2 }}
              onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, opacity: 0.4, textAlign: "center" }}>
          v1.0 · kwispelclub.be
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "16px 32px", background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{sectionTitles[activeSection]}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: "6px 16px", borderRadius: 50, background: data.siteSettings.launchMode ? COLORS.orangeLight : COLORS.accentLight, fontSize: 12, fontWeight: 700, color: data.siteSettings.launchMode ? COLORS.orange : COLORS.accent }}>
              {data.siteSettings.launchMode ? "🔧 In Opbouw" : "🟢 Live"}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>M</div>
          </div>
        </header>
        <main style={{ flex: 1, overflow: "auto", padding: 32 }}>
          {sections[activeSection]?.()}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editModal && editModalConfigs[editModal.type] && (
        <EditModal
          title={editModalConfigs[editModal.type].title}
          fields={editModalConfigs[editModal.type].fields}
          data={editModal.data}
          onSave={(updated) => updateData(editModalConfigs[editModal.type].section, updated.id, updated)}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: COLORS.accent, color: "white", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontWeight: 700, boxShadow: "0 8px 24px rgba(74,124,63,0.3)", animation: "fadeIn 0.3s ease", zIndex: 2000 }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
