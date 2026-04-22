'use client'

import { useState } from 'react'

const EMOJIS = ['🐕', '🐕‍🦺', '🐩', '🐶', '🦮', '🐾']

export default function NotFound() {
  const [emojiIdx, setEmojiIdx] = useState(0)
  const [scale, setScale] = useState(false)

  const callDog = () => {
    setScale(true)
    setTimeout(() => {
      setEmojiIdx(i => (i + 1) % EMOJIS.length)
      setScale(false)
    }, 300)
  }

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Nunito',sans-serif;background:#FFF9F0;color:#2C2C2C;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px;overflow:hidden;-webkit-font-smoothing:antialiased}
        h1,h2{font-family:'Fredoka',sans-serif}
        .paw{position:fixed;font-size:40px;opacity:.04;animation:f 20s ease-in-out infinite;pointer-events:none}
        .paw:nth-child(1){top:10%;left:8%;animation-delay:0s}
        .paw:nth-child(2){top:30%;right:10%;animation-delay:3s;font-size:55px}
        .paw:nth-child(3){bottom:20%;left:15%;animation-delay:6s;font-size:30px}
        .paw:nth-child(4){top:60%;right:20%;animation-delay:9s}
        @keyframes f{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-20px) rotate(10deg)}}
        .content{position:relative;z-index:1;max-width:480px}
        .big-emoji{font-size:120px;margin-bottom:14px;animation:bounce 2s ease-in-out infinite;display:block;transition:transform .3s}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        .error-code{font-size:clamp(80px,15vw,140px);font-weight:800;color:#E8F0E4;line-height:1;margin-bottom:-10px;letter-spacing:-4px;font-family:'Fredoka',sans-serif}
        h1{font-size:28px;color:#2D5A27;margin-bottom:12px}
        p{font-size:16px;color:#5A5A5A;line-height:1.6;margin-bottom:28px}
        .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .btn{padding:14px 28px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;text-decoration:none;transition:all .3s;display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer}
        .btn-primary{background:#4A7C3F;color:white;box-shadow:0 4px 16px rgba(74,124,63,.3)}
        .btn-primary:hover{background:#2D5A27;transform:translateY(-3px)}
        .btn-outline{background:transparent;color:#4A7C3F;border:2px solid #E8F0E4}
        .btn-outline:hover{background:#E8F0E4;transform:translateY(-3px)}
        .fun-text{margin-top:28px;font-size:14px;color:#8A8A8A}
        .fun-text span{cursor:pointer;transition:all .2s;display:inline-block}
        .fun-text span:hover{transform:scale(1.5)}
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="paw">🐾</div>
      <div className="paw">🐾</div>
      <div className="paw">🐾</div>
      <div className="paw">🐾</div>

      <div className="content">
        <span className="big-emoji" style={{ transform: scale ? 'scale(1.3) rotate(10deg)' : undefined }}>
          {EMOJIS[emojiIdx]}
        </span>
        <div className="error-code">404</div>
        <h1>Oeps! Deze pagina is weggelopen</h1>
        <p>Net als een ontsnapte puppy in het park — deze pagina is nergens te vinden. Misschien is hij achter een eekhoorn aan gerend?</p>
        <div className="btns">
          <a href="/" className="btn btn-primary">🏠 Terug naar Home</a>
          <a href="/contact" className="btn btn-outline">💬 Contact</a>
        </div>
        <div className="fun-text">
          Of probeer hem terug te lokken:{' '}
          <span onClick={callDog}>🦴</span>{' '}
          <span onClick={callDog}>🧶</span>{' '}
          <span onClick={callDog}>🥩</span>
        </div>
      </div>
    </>
  )
}
