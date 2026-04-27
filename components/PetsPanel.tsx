'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type Pet = {
  id: string
  name: string
  species: string
  breed?: string
  geboortedatum?: string
  gender?: string
  weight_kg?: number
  chipped?: boolean
  chip_number?: string
  sterilised?: boolean
  insurance?: string
  allergies?: string
  notes?: string
  avatar_url?: string
}

type Vaccination = {
  id: string
  pet_id: string
  naam: string
  datum: string
  volgende_datum?: string
  dierenarts?: string
  notities?: string
}

const SPECIES = [
  { value: 'hond', label: 'Hond' },
  { value: 'kat', label: 'Kat' },
  { value: 'konijn', label: 'Konijn' },
  { value: 'overig', label: 'Overig' },
]
const G = {
  greenDark: '#2D5A27', greenMain: '#4A7C3F', greenPale: '#E8F0E4',
  orangeMain: '#E8913A', orangePale: '#FFF3E0', cream: '#FFF9F0',
  creamDark: '#F5EDE0', textDark: '#2C2C2C', textMid: '#5A5A5A',
  textLight: '#8A8A8A', white: '#FFFFFF', red: '#E84E4E'
}

function age(geboortedatum?: string) {
  if (!geboortedatum) return null
  const diff = Date.now() - new Date(geboortedatum).getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  if (years > 0) return `${years} jaar${months > 0 ? ` ${months} mnd` : ''}`
  return `${months} maanden`
}

function daysUntil(date?: string) {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function PetsPanel({ userId }: { userId: string }) {
  const supabase = createClient()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [view, setView] = useState<'list' | 'add' | 'detail' | 'edit' | 'addvax'>('list')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState<Partial<Pet>>({})
  const [vaxForm, setVaxForm] = useState<Partial<Vaccination>>({})

  useEffect(() => { loadPets() }, [])

  const loadPets = async () => {
    setLoading(true)
    const { data } = await supabase.from('pets').select('*').eq('owner_id', userId).order('created_at')
    setPets(data || [])
    setLoading(false)
  }

  const loadVaccinations = async (petId: string) => {
    const { data } = await supabase.from('vaccinations').select('*').eq('pet_id', petId).order('datum', { ascending: false })
    setVaccinations(data || [])
  }

  const selectPet = async (pet: Pet) => {
    setSelectedPet(pet)
    await loadVaccinations(pet.id)
    setView('detail')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const blob = await resizeImage(file)
    const path = `${userId}/${Date.now()}.jpg`
    const { data, error } = await supabase.storage.from('pets').upload(path, blob, { contentType: 'image/jpeg' })
    if (!error && data) {
      const { data: url } = supabase.storage.from('pets').getPublicUrl(data.path)
      setForm(f => ({ ...f, avatar_url: url.publicUrl }))
    }
    setUploading(false)
  }

  const resizeImage = (file: File, maxPx = 400, quality = 0.85): Promise<Blob> =>
    new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        canvas.toBlob(b => resolve(b!), 'image/jpeg', quality)
      }
      img.src = url
    })

  const savePet = async () => {
    if (!form.name || !form.species) return
    setSaving(true)
    if (view === 'add') {
      await supabase.from('pets').insert({ ...form, owner_id: userId })
    } else {
      await supabase.from('pets').update(form).eq('id', selectedPet!.id)
    }
    await loadPets()
    setForm({})
    setView('list')
    setSaving(false)
  }

  const deletePet = async (id: string) => {
    if (!confirm('Huisdier verwijderen?')) return
    await supabase.from('pets').delete().eq('id', id)
    await loadPets()
    setView('list')
    setSelectedPet(null)
  }

  const saveVax = async () => {
    if (!vaxForm.naam || !vaxForm.datum) return
    setSaving(true)
    await supabase.from('vaccinations').insert({ ...vaxForm, pet_id: selectedPet!.id })
    await loadVaccinations(selectedPet!.id)
    setVaxForm({})
    setView('detail')
    setSaving(false)
  }

  const deleteVax = async (id: string) => {
    await supabase.from('vaccinations').delete().eq('id', id)
    await loadVaccinations(selectedPet!.id)
  }

  const speciesEmoji = (s: string) => ({ hond: '🐶', kat: '🐱', konijn: '🐰', overig: '🐾' }[s] || '🐾')

  const inp = (label: string, key: keyof Pet, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={(form[key] as string) || ''}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', background: G.white }} />
    </div>
  )

  const toggle = (label: string, key: keyof Pet) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${G.creamDark}` }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <button onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', background: form[key] ? G.greenMain : G.creamDark, transition: 'background .2s' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: form[key] ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
      </button>
    </div>
  )

  // STYLES
  const card = { background: G.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 12 }
  const btn = (bg: string, color = 'white') => ({ display: 'inline-flex' as const, alignItems: 'center' as const, gap: 6, padding: '10px 20px', borderRadius: 50, fontFamily: 'Fredoka, sans-serif', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' as const, background: bg, color })
  const backBtn = { background: 'none', border: 'none', cursor: 'pointer' as const, color: G.greenMain, fontWeight: 700, fontSize: 14, fontFamily: 'Nunito, sans-serif', padding: 0, marginBottom: 20, display: 'flex' as const, alignItems: 'center' as const, gap: 6 }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: G.textLight }}>⏳ Laden...</div>

  // ADD / EDIT FORM
  if (view === 'add' || view === 'edit') return (
    <div>
      <button style={backBtn} onClick={() => { setView(view === 'add' ? 'list' : 'detail'); setForm({}) }}>← Terug</button>
      <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: G.greenDark, marginBottom: 24 }}>
        {view === 'add' ? '🐾 Huisdier Toevoegen' : `✏️ ${selectedPet?.name} Bewerken`}
      </h2>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: '50%', background: G.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer', border: `3px dashed ${G.greenMain}`, overflow: 'hidden', flexShrink: 0 }}>
          {form.avatar_url ? <img src={form.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.species ? speciesEmoji(form.species) : '📷')}
        </div>
        <div>
          <button style={btn(G.greenPale, G.greenDark)} onClick={() => fileRef.current?.click()}>
            {uploading ? '⏳ Uploaden...' : '📷 Foto uploaden'}
          </button>
          <div style={{ fontSize: 12, color: G.textLight, marginTop: 4 }}>Optioneel — wordt automatisch verkleind</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {inp('Naam *', 'name', 'text', 'Bijv. Max')}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Soort *</label>
            <select value={form.species || ''} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', background: G.white }}>
              <option value="">Kies soort...</option>
              {SPECIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {inp('Ras', 'breed', 'text', 'Bijv. Golden Retriever')}
          {inp('Geboortedatum', 'geboortedatum', 'date')}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Geslacht</label>
            <select value={form.gender || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', background: G.white }}>
              <option value="">Onbekend</option>
              <option value="Mannelijk">Mannelijk</option>
              <option value="Vrouwelijk">Vrouwelijk</option>
            </select>
          </div>
        </div>
        <div>
          {inp('Gewicht (kg)', 'weight_kg', 'number', '5.2')}
          {inp('Chipnummer', 'chip_number', 'text', '528...')}
          {inp('Verzekering', 'insurance', 'text', 'Bijv. Dierenarts Plus')}
          {inp('Allergieën', 'allergies', 'text', 'Bijv. kip, graanvrij')}
          <div style={{ background: G.white, borderRadius: 12, padding: '4px 0' }}>
            {toggle('Gechipped', 'chipped')}
            {toggle('Gesteriliseerd', 'sterilised')}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Extra notities</label>
        <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Bijzonderheden, medicatie, dieet..."
          style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', background: G.white, minHeight: 80, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={btn(G.greenMain)} onClick={savePet} disabled={saving}>
          {saving ? '⏳ Opslaan...' : '✓ Opslaan'}
        </button>
        <button style={btn(G.creamDark, G.textMid)} onClick={() => { setView(view === 'add' ? 'list' : 'detail'); setForm({}) }}>
          Annuleren
        </button>
      </div>
    </div>
  )

  // ADD VACCINATION FORM
  if (view === 'addvax') return (
    <div>
      <button style={backBtn} onClick={() => { setView('detail'); setVaxForm({}) }}>← Terug naar {selectedPet?.name}</button>
      <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: G.greenDark, marginBottom: 24 }}>💉 Vaccinatie Toevoegen</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Naam vaccinatie *</label>
            <input placeholder="Bijv. Hondsdolheid, Parvo..." value={vaxForm.naam || ''}
              onChange={e => setVaxForm(f => ({ ...f, naam: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Datum *</label>
            <input type="date" value={vaxForm.datum || ''} onChange={e => setVaxForm(f => ({ ...f, datum: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Volgende datum</label>
            <input type="date" value={vaxForm.volgende_datum || ''} onChange={e => setVaxForm(f => ({ ...f, volgende_datum: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Dierenarts</label>
            <input placeholder="Naam dierenarts of kliniek" value={vaxForm.dierenarts || ''}
              onChange={e => setVaxForm(f => ({ ...f, dierenarts: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.textMid, marginBottom: 5 }}>Notities</label>
            <textarea placeholder="Extra info..." value={vaxForm.notities || ''} onChange={e => setVaxForm(f => ({ ...f, notities: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${G.creamDark}`, borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' }} />
          </div>
        </div>
      </div>
      <button style={btn(G.greenMain)} onClick={saveVax} disabled={saving}>
        {saving ? '⏳ Opslaan...' : '💉 Vaccinatie Opslaan'}
      </button>
    </div>
  )

  // PET DETAIL
  if (view === 'detail' && selectedPet) {
    const p = selectedPet
    const upcomingVax = vaccinations.filter(v => v.volgende_datum && daysUntil(v.volgende_datum)! <= 60 && daysUntil(v.volgende_datum)! >= 0)

    return (
      <div>
        <button style={backBtn} onClick={() => setView('list')}>← Terug naar overzicht</button>

        {/* Pet header */}
        <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMain})`, borderRadius: 20, padding: 28, color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, overflow: 'hidden', flexShrink: 0 }}>
            {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : speciesEmoji(p.species)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 26, fontWeight: 700 }}>{p.name}</div>
            <div style={{ opacity: .8, fontSize: 14 }}>{p.species}{p.breed ? ` · ${p.breed}` : ''}{p.gender ? ` · ${p.gender}` : ''}</div>
            {p.geboortedatum && <div style={{ opacity: .7, fontSize: 13, marginTop: 4 }}>🎂 {age(p.geboortedatum)} oud</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btn('rgba(255,255,255,.15)', 'white')} onClick={() => { setForm(p); setView('edit') }}>✏️ Bewerken</button>
            <button style={btn('rgba(232,78,78,.3)', 'white')} onClick={() => deletePet(p.id)}>🗑️</button>
          </div>
        </div>

        {/* Upcoming vaccinations warning */}
        {upcomingVax.length > 0 && (
          <div style={{ background: G.orangePale, border: `2px solid ${G.orangeMain}`, borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#5C3D2E' }}>Vaccinatie herinnering</div>
              {upcomingVax.map(v => (
                <div key={v.id} style={{ fontSize: 13, color: '#5C3D2E' }}>
                  {v.naam} — over {daysUntil(v.volgende_datum)} dagen ({new Date(v.volgende_datum!).toLocaleDateString('nl-BE')})
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Info card */}
          <div style={card}>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, color: G.greenDark, marginBottom: 14 }}>📋 Gegevens</h3>
            {[
              ['Gewicht', p.weight_kg ? `${p.weight_kg} kg` : null],
              ['Chipnummer', p.chip_number],
              ['Gechipped', p.chipped !== undefined ? (p.chipped ? '✅ Ja' : '❌ Nee') : null],
              ['Gesteriliseerd', p.sterilised !== undefined ? (p.sterilised ? '✅ Ja' : '❌ Nee') : null],
              ['Verzekering', p.insurance],
              ['Allergieën', p.allergies],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${G.creamDark}`, fontSize: 13 }}>
                <span style={{ color: G.textLight, fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 700, color: G.textDark }}>{value}</span>
              </div>
            ))}
            {p.notes && (
              <div style={{ marginTop: 12, padding: 12, background: G.cream, borderRadius: 8, fontSize: 13, color: G.textMid }}>
                📝 {p.notes}
              </div>
            )}
          </div>

          {/* Vaccinations */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, color: G.greenDark }}>💉 Vaccinaties</h3>
              <button style={btn(G.greenPale, G.greenDark)} onClick={() => setView('addvax')}>+ Toevoegen</button>
            </div>
            {vaccinations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: G.textLight, fontSize: 13 }}>
                Nog geen vaccinaties geregistreerd
              </div>
            ) : (
              vaccinations.map(v => {
                const days = daysUntil(v.volgende_datum)
                const urgent = days !== null && days <= 30 && days >= 0
                const overdue = days !== null && days < 0
                return (
                  <div key={v.id} style={{ padding: '10px 0', borderBottom: `1px solid ${G.creamDark}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{v.naam}</div>
                      <div style={{ fontSize: 12, color: G.textLight }}>
                        Gegeven: {new Date(v.datum).toLocaleDateString('nl-BE')}
                        {v.dierenarts && ` · ${v.dierenarts}`}
                      </div>
                      {v.volgende_datum && (
                        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 600, color: overdue ? G.red : urgent ? G.orangeMain : G.greenMain }}>
                          {overdue ? '⚠️ Verlopen! ' : urgent ? '⏰ Binnenkort: ' : '📅 Volgende: '}
                          {new Date(v.volgende_datum).toLocaleDateString('nl-BE')}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteVax(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.textLight, fontSize: 16 }}>🗑️</button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // PET LIST
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 24, color: G.greenDark }}>Mijn Huisdieren 🐾</h2>
        <button style={btn(G.greenMain)} onClick={() => { setForm({}); setView('add') }}>+ Huisdier Toevoegen</button>
      </div>

      {pets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: .3 }}>🐾</div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, fontWeight: 700, color: G.greenDark, marginBottom: 8 }}>Nog geen huisdieren</div>
          <div style={{ fontSize: 14, color: G.textLight, maxWidth: 320, margin: '0 auto', lineHeight: 1.6, marginBottom: 24 }}>
            Voeg je hond, kat of ander huisdier toe om vaccinaties bij te houden en persoonlijke tips te ontvangen.
          </div>
          <button style={btn(G.greenMain)} onClick={() => { setForm({}); setView('add') }}>🐾 Eerste Huisdier Toevoegen</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {pets.map(p => {
            const upcomingVax = false // simplified for list view
            return (
              <div key={p.id} onClick={() => selectPet(p)}
                style={{ background: G.white, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'all .2s', border: `2px solid transparent` }}
                onMouseOver={e => (e.currentTarget.style.borderColor = G.greenPale)}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}>
                <div style={{ height: 120, background: G.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, overflow: 'hidden' }}>
                  {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : speciesEmoji(p.species)}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: G.textLight }}>{p.species}{p.breed ? ` · ${p.breed}` : ''}</div>
                  {p.geboortedatum && <div style={{ fontSize: 12, color: G.textMid, marginTop: 4 }}>🎂 {age(p.geboortedatum)}</div>}
                </div>
              </div>
            )
          })}

          {/* Add new card */}
          <div onClick={() => { setForm({}); setView('add') }}
            style={{ background: G.white, borderRadius: 20, border: `2px dashed ${G.creamDark}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 180, cursor: 'pointer', transition: 'all .2s' }}
            onMouseOver={e => { (e.currentTarget.style.borderColor = G.greenMain); (e.currentTarget.style.background = G.greenPale) }}
            onMouseOut={e => { (e.currentTarget.style.borderColor = G.creamDark); (e.currentTarget.style.background = G.white) }}>
            <span style={{ fontSize: 32, opacity: .3 }}>+</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: G.textMid }}>Huisdier Toevoegen</span>
          </div>
        </div>
      )}
    </div>
  )
const savePet = async () => {
  if (!form.name || !form.species) return
  setSaving(true)
  const { data, error } = await supabase.from('pets').insert({ ...form, owner_id: userId })
  console.log('INSERT RESULT:', data, error)  // ← tijdelijk toevoegen
  await loadPets()
  setForm({})
  setView('list')
  setSaving(false)
}}
