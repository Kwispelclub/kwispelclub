'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Role = 'koper' | 'verkoper' | 'kapsalon'
type Tab = 'register' | 'login'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('register')
  const [role, setRole] = useState<Role>('koper')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<'register' | 'login' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [pwStrength, setPwStrength] = useState({ width: '0%', color: '#E84E4E' })

  // Register fields
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regTerms, setRegTerms] = useState(false)
  const [bedrijfsnaam, setBedrijfsnaam] = useState('')
  const [btwnummer, setBtwnummer] = useState('')
  const [salonnaam, setSalonnaam] = useState('')
  const [stad, setStad] = useState('')
  const [provincie, setProvincie] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if user already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/account')
    })
  }, [])

  const calcStrength = (v: string) => {
    let score = 0
    if (v.length >= 8) score++
    if (/[A-Z]/.test(v)) score++
    if (/[0-9]/.test(v)) score++
    if (/[^A-Za-z0-9]/.test(v)) score++
    const pcts = ['0%', '25%', '50%', '75%', '100%']
    const colors = ['#E84E4E', '#E84E4E', '#E8913A', '#6B9E5E', '#2D5A27']
    setPwStrength({ width: pcts[score], color: colors[score] })
  }

  const validateRegister = () => {
    const e: Record<string, string> = {}
    if (!regFirstName.trim()) e.firstName = 'Vul je voornaam in'
    if (!regLastName.trim()) e.lastName = 'Vul je achternaam in'
    if (!regEmail.trim() || !regEmail.includes('@')) e.email = 'Vul een geldig e-mailadres in'
    if (regPassword.length < 8) e.password = 'Min. 8 tekens met een hoofdletter en cijfer'
    if (!regTerms) e.terms = 'Akkoord met de voorwaarden vereist'
    if (role === 'verkoper' && !bedrijfsnaam.trim()) e.bedrijfsnaam = 'Vul je bedrijfsnaam in'
    if (role === 'kapsalon' && !salonnaam.trim()) e.salonnaam = 'Vul je salonnaam in'
    if (role === 'kapsalon' && !stad.trim()) e.stad = 'Vul je stad in'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validateRegister()) return
    setLoading(true)
    setError('')

    const metadata: Record<string, string> = {
      first_name: regFirstName,
      last_name: regLastName,
      full_name: `${regFirstName} ${regLastName}`,
      role,
    }
    if (role === 'verkoper') {
      metadata.bedrijfsnaam = bedrijfsnaam
      if (btwnummer) metadata.btwnummer = btwnummer
    }
    if (role === 'kapsalon') {
      metadata.salonnaam = salonnaam
      metadata.stad = stad
      metadata.provincie = provincie
    }

    const { error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: metadata },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess('register')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setErrors({ loginEmail: !loginEmail ? 'Vul je e-mail in' : '', loginPassword: !loginPassword ? 'Vul je wachtwoord in' : '' })
      return
    }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (authError) {
      setError('Onjuist e-mailadres of wachtwoord')
    } else {
      setSuccess('login')
      setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/account'
        router.push(redirect)
      }, 1500)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    })
  }

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setErrors({ loginEmail: 'Vul eerst je e-mailadres in' })
      return
    }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    })
    setError('') 
    alert('Wachtwoord reset link verzonden naar ' + loginEmail)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-light:#6B9E5E;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);min-height:100vh;-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;overflow:hidden}
        .blob{position:absolute;border-radius:50%;opacity:0.4;pointer-events:none}
        .b1{width:500px;height:500px;background:var(--green-pale);top:-150px;right:-100px}
        .b2{width:400px;height:400px;background:var(--orange-pale);bottom:-120px;left:-80px}
        .b3{width:200px;height:200px;background:var(--green-pale);bottom:20%;right:20%}
        .paw{position:absolute;font-size:30px;opacity:0.06;animation:floatP 20s ease-in-out infinite;pointer-events:none}
        .paw:nth-child(4){top:10%;left:8%;animation-delay:0s}
        .paw:nth-child(5){top:60%;right:10%;animation-delay:4s;font-size:40px}
        .paw:nth-child(6){bottom:15%;left:20%;animation-delay:8s;font-size:25px}
        @keyframes floatP{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(10deg)}}
        .auth-card{background:var(--white);border-radius:28px;width:100%;max-width:480px;box-shadow:0 8px 40px rgba(0,0,0,.12);position:relative;z-index:1;overflow:hidden}
        .auth-card::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--green-main),var(--orange-main),var(--green-light))}
        .auth-header{padding:36px 36px 0;text-align:center}
        .auth-logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;text-decoration:none}
        .lp{width:44px;height:44px;border-radius:14px;background:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:24px}
        .brand{font-family:'Fredoka',sans-serif;font-size:24px;font-weight:700;color:var(--green-dark)}
        .auth-tabs{display:flex;background:var(--cream);border-radius:50px;padding:4px;margin-bottom:28px}
        .auth-tab{flex:1;padding:11px;border-radius:50px;border:none;background:transparent;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;color:var(--text-light);transition:all .25s}
        .auth-tab.active{background:var(--white);color:var(--green-dark);box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .auth-body{padding:0 36px 36px}
        .role-selector{display:flex;gap:10px;margin-bottom:24px}
        .role-opt{flex:1;padding:18px 12px;border:2px solid var(--cream-dark);border-radius:12px;text-align:center;cursor:pointer;transition:all .2s;background:var(--white)}
        .role-opt:hover{border-color:var(--green-light);background:var(--cream)}
        .role-opt.selected{border-color:var(--green-main);background:var(--green-pale)}
        .role-opt.selected .role-name{color:var(--green-dark)}
        .role-icon{font-size:32px;margin-bottom:8px;display:block}
        .role-name{font-weight:700;font-size:14px;display:block}
        .role-desc{font-size:11px;color:var(--text-light);display:block;margin-top:4px}
        .field{margin-bottom:16px}
        .field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:var(--text-dark)}
        .field input{width:100%;padding:13px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s;background:var(--white)}
        .field input:focus{border-color:var(--green-light);box-shadow:0 0 0 3px rgba(107,158,94,.12)}
        .field input.err{border-color:var(--red)}
        .field .ferr{font-size:12px;color:var(--red);margin-top:4px}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .pw-wrap{position:relative}
        .pw-wrap input{padding-right:44px}
        .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:18px;opacity:.4;transition:opacity .2s}
        .pw-toggle:hover{opacity:.8}
        .pw-strength{height:4px;border-radius:4px;background:var(--cream-dark);margin-top:8px;overflow:hidden}
        .pw-fill{height:100%;border-radius:4px;transition:width .3s,background .3s}
        .checkbox-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:20px}
        .checkbox-row input{width:18px;height:18px;margin-top:2px;accent-color:var(--green-main);cursor:pointer;flex-shrink:0}
        .checkbox-row label{font-size:13px;color:var(--text-mid);line-height:1.5;cursor:pointer}
        .checkbox-row label a{color:var(--green-main);font-weight:600}
        .btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;border:none;cursor:pointer;transition:all .3s}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .btn-primary{background:var(--green-main);color:white;box-shadow:0 4px 16px rgba(74,124,63,.3)}
        .btn-primary:hover:not(:disabled){background:var(--green-dark);transform:translateY(-2px);box-shadow:0 6px 24px rgba(74,124,63,.4)}
        .divider{display:flex;align-items:center;gap:16px;margin:24px 0;color:var(--text-light);font-size:13px;font-weight:600}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--cream-dark)}
        .social-btns{display:flex;gap:10px}
        .social-btn{flex:1;padding:12px;border-radius:12px;border:2px solid var(--cream-dark);background:var(--white);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;transition:all .2s}
        .social-btn:hover{border-color:var(--green-light);background:var(--cream)}
        .auth-footer{text-align:center;padding:20px 36px 28px;font-size:13px;color:var(--text-light);border-top:1px solid var(--cream-dark)}
        .auth-footer a{color:var(--green-main);font-weight:700;text-decoration:none;cursor:pointer}
        .forgot-link{display:block;text-align:right;font-size:13px;color:var(--green-main);font-weight:600;text-decoration:none;margin-top:-8px;margin-bottom:20px;cursor:pointer;border:none;background:none;width:100%}
        .forgot-link:hover{text-decoration:underline}
        .error-msg{background:#FFF0F0;border:1px solid var(--red);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:16px;font-weight:600}
        .success-msg{text-align:center;padding:32px 0}
        .success-icon{font-size:64px;margin-bottom:16px;animation:popIn .5s cubic-bezier(.4,0,.2,1)}
        @keyframes popIn{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        .success-msg h3{font-size:22px;color:var(--green-dark);margin-bottom:8px}
        .success-msg p{color:var(--text-mid);font-size:14px;line-height:1.6}
        .extra-fields{background:var(--cream);border-radius:12px;padding:20px;margin-bottom:16px;border:1px dashed var(--cream-dark)}
        .extra-fields h4{font-size:14px;color:var(--green-dark);margin-bottom:12px}
        @media(max-width:520px){
          .auth-card{border-radius:20px 20px 0 0}
          .auth-page{align-items:flex-end;padding:0}
          .auth-header,.auth-body{padding-left:24px;padding-right:24px}
          .role-selector{flex-direction:column}
          .field-row{grid-template-columns:1fr}
        }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="auth-page">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="paw">🐾</div>
        <div className="paw">🐾</div>
        <div className="paw">🐾</div>

        <div className="auth-card">
          <div className="auth-header">
            <a href="/" className="auth-logo">
              <div className="lp">🐾</div>
              <span className="brand">Kwispelclub</span>
            </a>
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); setErrors({}) }}>
                Registreren
              </button>
              <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setErrors({}) }}>
                Inloggen
              </button>
            </div>
          </div>

          <div className="auth-body">
            {error && <div className="error-msg">⚠️ {error}</div>}

            {/* ── REGISTER ── */}
            {tab === 'register' && (
              success === 'register' ? (
                <div className="success-msg">
                  <div className="success-icon">🎉</div>
                  <h3>Welkom bij Kwispelclub!</h3>
                  <p>Je account is aangemaakt. Check je e-mail om je adres te bevestigen.</p>
                </div>
              ) : (
                <>
                  {/* Role selector */}
                  <div className="role-selector">
                    {(['koper', 'verkoper', 'kapsalon'] as Role[]).map(r => (
                      <div key={r} className={`role-opt ${role === r ? 'selected' : ''}`} onClick={() => setRole(r)}>
                        <span className="role-icon">{r === 'koper' ? '🛒' : r === 'verkoper' ? '🏪' : '✂️'}</span>
                        <span className="role-name">{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                        <span className="role-desc">{r === 'koper' ? 'Producten kopen & community' : r === 'verkoper' ? 'Producten verkopen' : 'Salon registreren'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>Voornaam *</label>
                      <input className={errors.firstName ? 'err' : ''} value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Jan" />
                      {errors.firstName && <div className="ferr">{errors.firstName}</div>}
                    </div>
                    <div className="field">
                      <label>Achternaam *</label>
                      <input className={errors.lastName ? 'err' : ''} value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Peeters" />
                      {errors.lastName && <div className="ferr">{errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="field">
                    <label>E-mailadres *</label>
                    <input type="email" className={errors.email ? 'err' : ''} value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="jan@voorbeeld.be" />
                    {errors.email && <div className="ferr">{errors.email}</div>}
                  </div>

                  <div className="field">
                    <label>Wachtwoord *</label>
                    <div className="pw-wrap">
                      <input type={showPassword ? 'text' : 'password'} className={errors.password ? 'err' : ''} value={regPassword} onChange={e => { setRegPassword(e.target.value); calcStrength(e.target.value) }} placeholder="Min. 8 tekens" />
                      <button className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
                    </div>
                    <div className="pw-strength"><div className="pw-fill" style={{ width: pwStrength.width, background: pwStrength.color }} /></div>
                    {errors.password && <div className="ferr">{errors.password}</div>}
                  </div>

                  {/* Verkoper extra */}
                  {role === 'verkoper' && (
                    <div className="extra-fields">
                      <h4>🏪 Verkoper Gegevens</h4>
                      <div className="field">
                        <label>Bedrijfsnaam *</label>
                        <input className={errors.bedrijfsnaam ? 'err' : ''} value={bedrijfsnaam} onChange={e => setBedrijfsnaam(e.target.value)} placeholder="Jouw bedrijf / webshop" />
                        {errors.bedrijfsnaam && <div className="ferr">{errors.bedrijfsnaam}</div>}
                      </div>
                      <div className="field">
                        <label>BTW-nummer</label>
                        <input value={btwnummer} onChange={e => setBtwnummer(e.target.value)} placeholder="BE0123.456.789 (optioneel)" />
                      </div>
                    </div>
                  )}

                  {/* Kapsalon extra */}
                  {role === 'kapsalon' && (
                    <div className="extra-fields">
                      <h4>✂️ Kapsalon Gegevens</h4>
                      <div className="field">
                        <label>Salonnaam *</label>
                        <input className={errors.salonnaam ? 'err' : ''} value={salonnaam} onChange={e => setSalonnaam(e.target.value)} placeholder="Naam van je kapsalon" />
                        {errors.salonnaam && <div className="ferr">{errors.salonnaam}</div>}
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Stad *</label>
                          <input className={errors.stad ? 'err' : ''} value={stad} onChange={e => setStad(e.target.value)} placeholder="Bijv. Bree" />
                          {errors.stad && <div className="ferr">{errors.stad}</div>}
                        </div>
                        <div className="field">
                          <label>Provincie</label>
                          <input value={provincie} onChange={e => setProvincie(e.target.value)} placeholder="Bijv. Limburg" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="checkbox-row">
                    <input type="checkbox" id="terms" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} />
                    <label htmlFor="terms" style={errors.terms ? { color: 'var(--red)' } : {}}>
                      Ik ga akkoord met de <a href="/privacy">Algemene Voorwaarden</a> en het <a href="/privacy#privacy">Privacybeleid</a>
                    </label>
                  </div>

                  <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                    {loading ? 'Even geduld...' : 'Account Aanmaken →'}
                  </button>

                  <div className="divider">of registreer met</div>
                  <div className="social-btns">
                    <button className="social-btn" onClick={handleGoogleLogin}><span>🔵</span> Google</button>
                  </div>
                </>
              )
            )}

            {/* ── LOGIN ── */}
            {tab === 'login' && (
              success === 'login' ? (
                <div className="success-msg">
                  <div className="success-icon">👋</div>
                  <h3>Welkom terug!</h3>
                  <p>Je wordt doorgestuurd naar je account...</p>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>E-mailadres</label>
                    <input type="email" className={errors.loginEmail ? 'err' : ''} value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="jan@voorbeeld.be" />
                    {errors.loginEmail && <div className="ferr">{errors.loginEmail}</div>}
                  </div>
                  <div className="field">
                    <label>Wachtwoord</label>
                    <div className="pw-wrap">
                      <input type={showLoginPassword ? 'text' : 'password'} className={errors.loginPassword ? 'err' : ''} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Jouw wachtwoord" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                      <button className="pw-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}>{showLoginPassword ? '🙈' : '👁️'}</button>
                    </div>
                    {errors.loginPassword && <div className="ferr">{errors.loginPassword}</div>}
                  </div>

                  <button className="forgot-link" onClick={handleForgotPassword}>Wachtwoord vergeten?</button>

                  <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
                    {loading ? 'Even geduld...' : 'Inloggen →'}
                  </button>

                  <div className="divider">of log in met</div>
                  <div className="social-btns">
                    <button className="social-btn" onClick={handleGoogleLogin}><span>🔵</span> Google</button>
                  </div>
                </>
              )
            )}
          </div>

          {!success && (
            <div className="auth-footer">
              {tab === 'register'
                ? <>Heb je al een account? <a onClick={() => { setTab('login'); setError(''); setErrors({}) }}>Inloggen</a></>
                : <>Nog geen account? <a onClick={() => { setTab('register'); setError(''); setErrors({}) }}>Registreren</a></>
              }
            </div>
          )}
        </div>
      </div>
    </>
  )
}
