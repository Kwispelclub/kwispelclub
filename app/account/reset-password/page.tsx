'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function ResetPasswordInner() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Supabase zet automatisch de sessie via de URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth')
    })
  }, [])

  const handleReset = async () => {
    if (password.length < 8) { setError('Min. 8 tekens'); return }
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/account'), 2000)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Nunito,sans-serif;background:#FFF9F0;color:#2C2C2C}
        h1,h2{font-family:Fredoka,sans-serif}
        .page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
        .card{background:white;border-radius:28px;width:100%;max-width:420px;padding:48px;box-shadow:0 8px 40px rgba(0,0,0,.12);text-align:center;position:relative;overflow:hidden}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#4A7C3F,#E8913A)}
        .icon{font-size:56px;margin-bottom:16px}
        h2{font-size:24px;color:#2D5A27;margin-bottom:8px}
        p{font-size:14px;color:#5A5A5A;margin-bottom:24px;line-height:1.6}
        .field{margin-bottom:16px;text-align:left}
        .field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:#2C2C2C}
        .pw-wrap{position:relative}
        .pw-wrap input{width:100%;padding:13px 44px 13px 16px;border:2px solid #F5EDE0;border-radius:12px;font-family:Nunito,sans-serif;font-size:14px;outline:none;transition:all .2s}
        .pw-wrap input:focus{border-color:#6B9E5E;box-shadow:0 0 0 3px rgba(107,158,94,.12)}
        .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:18px;opacity:.4}
        .btn{width:100%;padding:15px;border-radius:50px;background:#4A7C3F;color:white;border:none;font-family:Fredoka,sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:8px}
        .btn:hover:not(:disabled){background:#2D5A27}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .error{background:#FFF0F0;border:1px solid #E84E4E;border-radius:10px;padding:10px 14px;font-size:13px;color:#E84E4E;margin-bottom:16px;font-weight:600}
        .success{text-align:center;padding:16px 0}
        .success .si{font-size:64px;margin-bottom:12px}
        .success h3{color:#2D5A27;font-size:22px;margin-bottom:8px}
        .success p{color:#5A5A5A;font-size:14px}
      `}</style>
      <div className="page">
        <div className="card">
          {success ? (
            <div className="success">
              <div className="si">✅</div>
              <h3>Wachtwoord gewijzigd!</h3>
              <p>Je wordt doorgestuurd naar je account...</p>
            </div>
          ) : (
            <>
              <div className="icon">🔑</div>
              <h2>Nieuw wachtwoord</h2>
              <p>Kies een nieuw wachtwoord voor je account.</p>
              {error && <div className="error">⚠️ {error}</div>}
              <div className="field">
                <label>Nieuw wachtwoord</label>
                <div className="pw-wrap">
                  <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 tekens" />
                  <button className="pw-toggle" onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div className="field">
                <label>Bevestig wachtwoord</label>
                <div className="pw-wrap">
                  <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Herhaal wachtwoord" onKeyDown={e => e.key === 'Enter' && handleReset()} />
                </div>
              </div>
              <button className="btn" onClick={handleReset} disabled={loading}>
                {loading ? 'Bezig...' : 'Wachtwoord instellen →'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FFF9F0'}}>
        <div style={{fontFamily:'Fredoka,sans-serif',fontSize:22,color:'#4A7C3F'}}>🐾 Laden...</div>
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
}
