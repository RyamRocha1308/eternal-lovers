import { useEffect, useRef, useState } from 'react';
import { Section } from './ui.jsx';
import { useInView, useLocalStorage, reducedMotion } from '../lib.js';

function Count({ to, go }) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  const first = useRef(true);
  const texto = typeof to !== 'number'; // ex.: "∞"

  useEffect(() => {
    if (!go || texto) return;
    const start = from.current;
    const dur = first.current ? 1600 : 350;
    first.current = false;
    if (reducedMotion()) {
      from.current = to;
      return setV(to);
    }
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const val = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
      from.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to, texto]);

  return <>{texto ? to : v}</>;
}

export default function Placar({ content }) {
  const [ref, seen] = useInView();
  const [saved, setSaved] = useLocalStorage('placar', {}); // { rotulo: valor ajustado }

  const change = (p, delta) => setSaved((s) => ({ ...s, [p.rotulo]: Math.max(0, (s[p.rotulo] ?? p.valor) + delta) }));

  return (
    <Section id="placar" kicker="Em números" title="Nossos Números" className="dark">
      <div className="scoreboard" ref={ref}>
        {content.placar.map((p) => {
          const valor = saved[p.rotulo] ?? p.valor;
          const contavel = typeof p.valor === 'number';
          return (
            <div className="score" key={p.rotulo}>
              <span className="score-ico">{p.icone}</span>
              <div className="score-row">
                {contavel && (
                  <button className="step" onClick={() => change(p, -1)} disabled={valor <= 0} aria-label={`Diminuir: ${p.rotulo}`}>
                    −
                  </button>
                )}
                <span className="score-num" aria-live="polite">
                  <Count to={valor} go={seen} />
                </span>
                {contavel && (
                  <button className="step" onClick={() => change(p, 1)} aria-label={`Aumentar: ${p.rotulo}`}>
                    +
                  </button>
                )}
              </div>
              <span className="score-lbl">{p.rotulo}</span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
