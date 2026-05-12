'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DAYS = ['Zo','Ma','Di','Wo','Do','Vr','Za']
const MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const STATUS_LABELS: Record<string,string> = { bevestigd:'Bevestigd', geannuleerd:'Geannuleerd', voltooid:'Voltooid', no_show:'No-show' }
const STATUS_COLORS: Record<string,string> = { bevestigd:'#2A9D8F', geannuleerd:'#E84E4E', voltooid:'#4A7C3F', no_show:'#8A8A8A' }

export default function KapsalonDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [salon, setSalon] = useState<any>(null)
  const [boekingen, setBoekingen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overzicht'|'afspraken'|'profiel'|'beschikbaarheid'>( 'overzicht')
  const [filterStatus, setFilterStatus] = useState('alle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Profiel state
  const [proNaam, setProNaam] = useState('')
  const [proLocatie, setProLocatie] = useState('')
  const [proStad, setProStad] = useState('')
  const [proTel, setProTel] = useState('')
  const [proEmail, setProEmail] = useState('')
  const [proBeschrijving, setProBeschrijving] = useState('')
  const [proPrijsVanaf, setProPrijsVanaf] = useState('')
  const [proType, setProType] = useState('')
  const [proWebsite, setProWebsite] = useState('')

  // Beschikbaarheid state
  const [openDagen, setOpenDagen] = useState<boolean[]>([false,true,true,true,true,true,true])
  const [openVan, setOpenVan] = useState('09:00')
  const [openTot, setOpenTot] = useState('17:00')
  const [pauzeVan, setPauzeVan] = useState('12:00')
  const [pauzeTot, setPauzeTot] = useState('13:00')
  const [slotDuur, setSlotDuur] = useState('60')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      const { data: salonData } = await supabase
        .from('kapsalons')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (!salonData) { router.push('/kapsalons'); return }

      setSalon(salonData)
      setProNaam(salonData.naam || '')
      setProLocatie(salonData.locatie || '')
      setProStad(salonData.stad || '')
      setProTel(salonData.telefoon || '')
      setProEmail(salonData.email || '')
      setProBeschrijving(salonData.beschrijving || '')
      setProPrijsVanaf(salonData.prijs_vanaf?.toString() || '')
      setProType(salonData.type_salon || '')
      setProWebsite(salonData.website || '')

      if (salonData.beschikbaarheid) {
        const b = salonData.beschikbaarheid
        if (b.open_dagen) setOpenDagen(b.open_dagen)
        if (b.open_van) setOpenVan(b.open_van)
        if (b.open_tot) setOpenTot(b.open_tot)
        if (b.pauze_van) setPauzeVan(b.pauze_van)
        if (b.pauze_tot) setPauzeTot(b.pauze_tot)
        if (b.slot_duur) setSlotDuur(b.slot_duur)
      }

      const { data: boekData } = await supabase
        .from('boekingen')
        .select('*')
        .eq('salon_id', salonData.id)
        .order('datum', { ascending: false })
        .order('tijdslot', { ascending: false })

      setBoekingen(boekData || [])
      setLoading(false)
    }
    init()
  }, [])

  const saveProfiel = async () => {
    setSaving(true); setError('')
    const { error } = await supabase.from('kapsalons').update({
      naam: proNaam, locatie: proLocatie, stad: proStad,
      telefoon: proTel, email: proEmail, beschrijving: proBeschrijving,
      prijs_vanaf: proPrijsVanaf ? parseFloat(proPrijsVanaf) : null,
      type_salon: proType, website: proWebsite,
    }).eq('id', salon.id)
    if (error) setError('Opslaan mislukt: ' + error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const saveBeschikbaarheid = async () => {
    setSaving(true); setError('')
    const { error } = await supabase.from('kapsalons').update({
      beschikbaarheid: { open_dagen: openDagen, open_van: openVan, open_tot: openTot, pauze_van: pauzeVan, pauze_tot: pauzeTot, slot_duur: slotDuur }
    }).eq('id', salon.id)
    if (error) setError('Opslaan mislukt: ' + error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('boekingen').update({ status }).eq('id', id)
    setBoekingen(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const filteredBoekingen = boekingen.filter(b => filterStatus === 'alle' || b.status === filterStatus)
  const vandaag = new Date().toISOString().split('T')[0]
  const aankomend = boekingen.filter(b => b.datum >= vandaag && b.status === 'bevestigd')
  const vandaagBoekingen = boekingen.filter(b => b.datum === vandaag && b.status === 'bevestigd')

  const CSS = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Nunito,sans-serif;background:#F5F5F5;color:#2C2C2C}
    h1,h2,h3,h4{font-family:Fredoka,sans-serif}
    .dash{max-width:1100px;margin:0 auto;padding:32px clamp(16px,4vw,48px)}
    .dash-header{background:linear-gradient(135deg,#2D5A27,#4A7C3F);border-radius:20px;padding:28px 32px;color:white;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
    .dash-header h1{font-size:24px;margin-bottom:4px}.dash-header p{font-size:14px;opacity:.8}
    .status-badge{padding:4px 14px;border-radius:50px;font-size:12px;font-weight:700;color:white}
    .tabs{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap}
    .tab{padding:10px 20px;border-radius:50px;border:2px solid #E0E0E0;background:white;font-family:Nunito,sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;color:#5A5A5A}
    .tab.active{background:#2D5A27;color:white;border-color:#2D5A27}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
    .card{background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .card-val{font-family:Fredoka,sans-serif;font-size:32px;font-weight:700;color:#2D5A27;margin-bottom:4px}
    .card-lbl{font-size:13px;color:#8A8A8A;font-weight:600}
    .card-icon{font-size:28px;margin-bottom:8px}
    .panel{background:white;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .panel h3{font-size:20px;margin-bottom:20px;color:#2D5A27}
    .boeking-row{display:grid;grid-template-columns:90px 1fr 1fr 1fr auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #F0F0F0}
    .boeking-row:last-child{border-bottom:none}
    .datum-blok{text-align:center;background:#E8F0E4;border-radius:10px;padding:8px}.datum-dag{font-size:11px;font-weight:700;color:#4A7C3F;text-transform:uppercase}.datum-num{font-family:Fredoka,sans-serif;font-size:24px;font-weight:700;color:#2D5A27;line-height:1}.datum-mnd{font-size:11px;color:#4A7C3F;font-weight:600}
    .boeking-naam{font-weight:700;font-size:15px;margin-bottom:2px}.boeking-hond{font-size:13px;color:#5A5A5A}
    .boeking-dienst{font-size:14px;font-weight:600;color:#2D5A27;margin-bottom:2px}.boeking-tijd{font-size:13px;color:#8A8A8A}
    .boeking-prijs{font-family:Fredoka,sans-serif;font-size:18px;font-weight:700;color:#2D5A27}
    .status-sel{padding:6px 12px;border-radius:50px;border:2px solid #E0E0E0;font-family:Nunito,sans-serif;font-size:12px;font-weight:700;cursor:pointer;outline:none;background:white}
    .filter-bar{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
    .filter-btn{padding:6px 16px;border-radius:50px;border:2px solid #E0E0E0;background:transparent;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:#5A5A5A}
    .filter-btn.active{background:#2D5A27;color:white;border-color:#2D5A27}
    .empty{text-align:center;padding:48px;color:#8A8A8A;font-size:15px}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .fg{margin-bottom:0}.fg label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:#5A5A5A}
    .fg input,.fg select,.fg textarea{width:100%;padding:12px 16px;border:2px solid #E8E8E8;border-radius:12px;font-family:Nunito,sans-serif;font-size:14px;outline:none;transition:all .2s;background:#FAFAFA}
    .fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#4A7C3F;background:white}
    .fg textarea{resize:vertical;min-height:80px}
    .fg.full{grid-column:1/-1}
    .save-btn{background:#2D5A27;color:white;padding:13px 32px;border-radius:50px;border:none;font-family:Fredoka,sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:20px}
    .save-btn:hover{background:#4A7C3F}.save-btn:disabled{opacity:.5;cursor:not-allowed}
    .saved-msg{color:#2A9D8F;font-weight:700;font-size:14px;margin-top:12px}
    .error-msg{color:#E84E4E;font-weight:700;font-size:14px;margin-top:12px}
    .dag-rij{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
    .dag-btn{padding:8px 16px;border-radius:50px;border:2px solid #E0E0E0;background:white;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;color:#5A5A5A}
    .dag-btn.open{background:#2D5A27;color:white;border-color:#2D5A27}
    .tijd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .slot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .section-lbl{font-size:13px;font-weight:700;color:#5A5A5A;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
    .vandaag-banner{background:#FFF3E0;border:2px solid #E8913A;border-radius:12px;padding:14px 20px;margin-bottom:20px;font-size:14px;font-weight:600;color:#5C3D2E}
    @media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}.boeking-row{grid-template-columns:70px 1fr 1fr;gap:8px}.boeking-prijs,.status-sel{display:none}}
    @media(max-width:600px){.cards{grid-template-columns:1fr 1fr}.form-grid{grid-template-columns:1fr}.tijd-grid{grid-template-columns:1fr 1fr}}
  `

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />
      <div style={{textAlign:'center',padding:'80px 20px',color:'#8A8A8A'}}>
        <div style={{fontSize:48,marginBottom:16}}>✂️</div>
        <p>Dashboard laden...</p>
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />
      <div className="dash">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>✂️ {salon.naam}</h1>
            <p>📍 {salon.locatie || salon.stad} · Salon dashboard</p>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
            <span className="status-badge" style={{background: salon.geverifieerd ? '#2A9D8F' : '#E8913A'}}>
              {salon.geverifieerd ? '✓ Geverifieerd' : '⏳ In behandeling'}
            </span>
            <a href="/kapsalons" style={{color:'white',fontSize:13,opacity:.8,textDecoration:'none'}}>← Terug naar overzicht</a>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {(['overzicht','afspraken','profiel','beschikbaarheid'] as const).map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='overzicht'?'📊 Overzicht':t==='afspraken'?'📅 Afspraken':t==='profiel'?'✏️ Profiel':'🕐 Beschikbaarheid'}
            </button>
          ))}
        </div>

        {/* OVERZICHT */}
        {tab==='overzicht' && (
          <>
            <div className="cards">
              <div className="card"><div className="card-icon">📅</div><div className="card-val">{vandaagBoekingen.length}</div><div className="card-lbl">Afspraken vandaag</div></div>
              <div className="card"><div className="card-icon">🔜</div><div className="card-val">{aankomend.length}</div><div className="card-lbl">Aankomende afspraken</div></div>
              <div className="card"><div className="card-icon">✅</div><div className="card-val">{boekingen.filter(b=>b.status==='voltooid').length}</div><div className="card-lbl">Voltooide afspraken</div></div>
              <div className="card"><div className="card-icon">💶</div><div className="card-val">€{boekingen.filter(b=>b.status==='voltooid').reduce((s,b)=>s+Number(b.dienst_prijs||0),0).toFixed(0)}</div><div className="card-lbl">Totale omzet</div></div>
            </div>

            {vandaagBoekingen.length > 0 && (
              <div className="vandaag-banner">
                🗓️ <strong>Vandaag:</strong> {vandaagBoekingen.map(b=>`${b.tijdslot} — ${b.hond_naam} (${b.eigenaar_naam})`).join(' · ')}
              </div>
            )}

            <div className="panel">
              <h3>Eerstvolgende afspraken</h3>
              {aankomend.length === 0 ? (
                <div className="empty">📅 Geen aankomende afspraken</div>
              ) : aankomend.slice(0,5).map(b => {
                const d = new Date(b.datum + 'T12:00:00')
                return (
                  <div key={b.id} className="boeking-row">
                    <div className="datum-blok"><div className="datum-dag">{DAYS[d.getDay()]}</div><div className="datum-num">{d.getDate()}</div><div className="datum-mnd">{MONTHS[d.getMonth()].slice(0,3)}</div></div>
                    <div><div className="boeking-naam">{b.eigenaar_naam}</div><div className="boeking-hond">🐕 {b.hond_naam} ({b.hond_ras})</div></div>
                    <div><div className="boeking-dienst">{b.dienst}</div><div className="boeking-tijd">🕐 {b.tijdslot}</div></div>
                    <div className="boeking-prijs">€{Number(b.dienst_prijs).toFixed(2)}</div>
                    <select className="status-sel" value={b.status} onChange={e=>updateStatus(b.id,e.target.value)} style={{color:STATUS_COLORS[b.status]}}>
                      {Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* AFSPRAKEN */}
        {tab==='afspraken' && (
          <div className="panel">
            <h3>Alle Afspraken</h3>
            <div className="filter-bar">
              {['alle',...Object.keys(STATUS_LABELS)].map(s=>(
                <button key={s} className={`filter-btn ${filterStatus===s?'active':''}`} onClick={()=>setFilterStatus(s)}>
                  {s==='alle'?'Alle':STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {filteredBoekingen.length === 0 ? (
              <div className="empty">📅 Geen afspraken gevonden</div>
            ) : filteredBoekingen.map(b => {
              const d = new Date(b.datum + 'T12:00:00')
              return (
                <div key={b.id} className="boeking-row">
                  <div className="datum-blok"><div className="datum-dag">{DAYS[d.getDay()]}</div><div className="datum-num">{d.getDate()}</div><div className="datum-mnd">{MONTHS[d.getMonth()].slice(0,3)}</div></div>
                  <div><div className="boeking-naam">{b.eigenaar_naam}</div><div className="boeking-hond">🐕 {b.hond_naam} ({b.hond_ras}){b.eigenaar_telefoon&&<> · 📞 {b.eigenaar_telefoon}</>}</div>{b.opmerkingen&&<div style={{fontSize:12,color:'#8A8A8A',marginTop:2}}>💬 {b.opmerkingen}</div>}</div>
                  <div><div className="boeking-dienst">{b.dienst}</div><div className="boeking-tijd">🕐 {b.tijdslot} · {b.dienst_duur}</div></div>
                  <div className="boeking-prijs">€{Number(b.dienst_prijs).toFixed(2)}</div>
                  <select className="status-sel" value={b.status} onChange={e=>updateStatus(b.id,e.target.value)} style={{color:STATUS_COLORS[b.status]}}>
                    {Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              )
            })}
          </div>
        )}

        {/* PROFIEL */}
        {tab==='profiel' && (
          <div className="panel">
            <h3>Salonprofiel bewerken</h3>
            <div className="form-grid">
              <div className="fg"><label>Salonnaam *</label><input value={proNaam} onChange={e=>setProNaam(e.target.value)} placeholder="Happy Paws Grooming"/></div>
              <div className="fg"><label>Type salon</label>
                <select value={proType} onChange={e=>setProType(e.target.value)}>
                  <option>Trimsalon (alle rassen)</option>
                  <option>Gespecialiseerd (kleine rassen)</option>
                  <option>Gespecialiseerd (grote rassen)</option>
                  <option>Mobiele trimmer</option>
                  <option>Premium / Spa salon</option>
                </select>
              </div>
              <div className="fg"><label>Locatie (stad + provincie)</label><input value={proLocatie} onChange={e=>setProLocatie(e.target.value)} placeholder="Bree, Limburg"/></div>
              <div className="fg"><label>Stad</label><input value={proStad} onChange={e=>setProStad(e.target.value)} placeholder="Bree"/></div>
              <div className="fg"><label>E-mailadres</label><input type="email" value={proEmail} onChange={e=>setProEmail(e.target.value)}/></div>
              <div className="fg"><label>Telefoon</label><input type="tel" value={proTel} onChange={e=>setProTel(e.target.value)} placeholder="+32 ..."/></div>
              <div className="fg"><label>Website</label><input value={proWebsite} onChange={e=>setProWebsite(e.target.value)} placeholder="https://jouwsalon.be"/></div>
              <div className="fg"><label>Prijs vanaf (€)</label><input type="number" value={proPrijsVanaf} onChange={e=>setProPrijsVanaf(e.target.value)} placeholder="35"/></div>
              <div className="fg full"><label>Beschrijving</label><textarea value={proBeschrijving} onChange={e=>setProBeschrijving(e.target.value)} placeholder="Vertel klanten over je salon, jouw ervaring, gespecialiseerde rassen..."/></div>
            </div>
            <button className="save-btn" onClick={saveProfiel} disabled={saving}>{saving?'Opslaan...':`💾 Profiel opslaan`}</button>
            {saved && <div className="saved-msg">✅ Opgeslagen!</div>}
            {error && <div className="error-msg">⚠️ {error}</div>}
          </div>
        )}

        {/* BESCHIKBAARHEID */}
        {tab==='beschikbaarheid' && (
          <div className="panel">
            <h3>Beschikbaarheid instellen</h3>
            <div className="section-lbl">Open dagen</div>
            <div className="dag-rij">
              {['Zo','Ma','Di','Wo','Do','Vr','Za'].map((dag,i)=>(
                <button key={dag} className={`dag-btn ${openDagen[i]?'open':''}`} onClick={()=>{ const n=[...openDagen]; n[i]=!n[i]; setOpenDagen(n) }}>{dag}</button>
              ))}
            </div>
            <div className="section-lbl">Openingsuren</div>
            <div className="tijd-grid">
              <div className="fg"><label>Open vanaf</label><input type="time" value={openVan} onChange={e=>setOpenVan(e.target.value)}/></div>
              <div className="fg"><label>Sluit om</label><input type="time" value={openTot} onChange={e=>setOpenTot(e.target.value)}/></div>
              <div className="fg"><label>Pauze van</label><input type="time" value={pauzeVan} onChange={e=>setPauzeVan(e.target.value)}/></div>
              <div className="fg"><label>Pauze tot</label><input type="time" value={pauzeTot} onChange={e=>setPauzeTot(e.target.value)}/></div>
            </div>
            <div className="section-lbl">Afspraakinstellingen</div>
            <div className="slot-grid">
              <div className="fg"><label>Duur per afspraak</label>
                <select value={slotDuur} onChange={e=>setSlotDuur(e.target.value)}>
                  <option value="30">30 minuten</option>
                  <option value="45">45 minuten</option>
                  <option value="60">60 minuten</option>
                  <option value="90">90 minuten</option>
                  <option value="120">2 uur</option>
                </select>
              </div>
            </div>
            <button className="save-btn" onClick={saveBeschikbaarheid} disabled={saving}>{saving?'Opslaan...':`💾 Beschikbaarheid opslaan`}</button>
            {saved && <div className="saved-msg">✅ Opgeslagen!</div>}
            {error && <div className="error-msg">⚠️ {error}</div>}
          </div>
        )}

      </div>
    </>
  )
}
