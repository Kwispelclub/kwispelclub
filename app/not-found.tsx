import Link from 'next/link'

export default function NotFound() {
  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);min-height:100vh;display:flex;flex-direction:column}
    h1,h2,h3{font-family:'Fredoka',sans-serif}
    .wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px}
    .card{background:white;border-radius:32px;padding:56px 48px;max-width:560px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.08);border:2px solid var(--cream-dark)}
    .paw{font-size:80px;margin-bottom:8px;display:block;animation:bounce 2s infinite}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .code{font-family:'Fredoka',sans-serif;font-size:100px;font-weight:700;color:var(--green-pale);line-height:1;margin-bottom:0}
    h1{font-size:clamp(24px,4vw,32px);color:var(--green-dark);margin-bottom:12px}
    p{font-size:16px;color:var(--text-mid);line-height:1.7;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
    .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:700;text-decoration:none;transition:all .2s}
    .btn-green{background:var(--green-main);color:white;box-shadow:0 4px 16px rgba(74,124,63,.3)}
    .btn-green:hover{background:var(--green-dark);transform:translateY(-2px)}
    .btn-orange{background:var(--orange-main);color:white;box-shadow:0 4px 16px rgba(232,145,58,.3)}
    .btn-orange:hover{background:#D4812E;transform:translateY(-2px)}
    .btn-ghost{background:var(--cream);color:var(--text-mid);border:2px solid var(--cream-dark)}
    .btn-ghost:hover{border-color:var(--green-main);color:var(--green-main)}
    .suggestions{margin-top:40px;padding-top:32px;border-top:2px solid var(--cream-dark)}
    .suggestions h3{font-size:16px;color:var(--text-mid);margin-bottom:16px;font-family:'Nunito',sans-serif;font-weight:700}
    .links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
    .link-chip{padding:8px 16px;border-radius:50px;background:var(--cream);color:var(--green-dark);font-size:13px;font-weight:700;text-decoration:none;border:2px solid var(--green-pale);transition:all .2s}
    .link-chip:hover{background:var(--green-pale);border-color:var(--green-main)}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />
      <div className="wrap">
        <div className="card">
          <span className="paw">🐶</span>
          <div className="code">404</div>
          <h1>Oeps! Deze pagina is weggelopen</h1>
          <p>Net als een ontsnapte puppy in het park — deze pagina is nergens te vinden. Misschien is het adres fout getypt, of is de pagina verplaatst.</p>
          <div className="btns">
            <Link href="/" className="btn btn-green">🏠 Terug naar Home</Link>
            <Link href="/winkel" className="btn btn-orange">🛒 Naar de Shop</Link>
          </div>
          <div className="suggestions">
            <h3>Of ga direct naar:</h3>
            <div className="links">
              <Link href="/kapsalons" className="link-chip">✂️ Kapsalons</Link>
              <Link href="/2dehands" className="link-chip">♻️ 2de Hands</Link>
              <Link href="/puppy-training" className="link-chip">🎓 Academy</Link>
              <Link href="/account" className="link-chip">👤 Account</Link>
              <Link href="/contact" className="link-chip">💬 Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
