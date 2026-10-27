import { useEffect, useState } from 'react';
import { reducedMotion, beep } from '../lib.js';

let uid = 0;

// Camada global: confete/chuva de emojis, toast, saque e onda
export default function Effects() {
  const [drops, setDrops] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    const on = (e) => {
      const { type, payload } = e.detail;
      if (type === 'toast') {
        const id = ++uid;
        setToasts((t) => [...t, { id, msg: payload }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
      } else if (type === 'rain' || type === 'confetti') {
        const emojis = type === 'confetti' ? ['💛', '🐚', '✨', '🌊', '🏐'] : [payload ?? '🏐'];
        const n = reducedMotion() ? 6 : 36;
        const batch = Array.from({ length: n }, () => ({
          id: ++uid,
          e: emojis[Math.floor(Math.random() * emojis.length)],
          left: Math.random() * 100,
          delay: Math.random() * 0.8,
          dur: 2 + Math.random() * 1.8,
          size: 20 + Math.random() * 22
        }));
        setDrops((d) => [...d, ...batch]);
        setTimeout(() => setDrops((d) => d.filter((x) => !batch.includes(x))), 4800);
      } else if (type === 'serve' || type === 'wave') {
        if (type === 'serve') beep('whistle');
        setOverlay(type);
        setTimeout(() => setOverlay(null), type === 'wave' ? 3000 : 1500);
      }
    };
    window.addEventListener('el-fx', on);
    return () => window.removeEventListener('el-fx', on);
  }, []);

  return (
    <>
      <div className="fx-layer" aria-hidden="true">
        {drops.map((d) => (
          <span
            key={d.id}
            className="drop"
            style={{ left: d.left + '%', animationDelay: d.delay + 's', animationDuration: d.dur + 's', fontSize: d.size }}
          >
            {d.e}
          </span>
        ))}
        {overlay === 'serve' && <span className="serve-ball">🐚</span>}
        {overlay === 'wave' && <div className="big-wave" />}
      </div>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
