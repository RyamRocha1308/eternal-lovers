import { useEffect, useState } from 'react';
import { Section } from './ui.jsx';
import { fx, beep, waLink } from '../lib.js';

export default function MatchPoint({ content }) {
  const { matchPoint, site } = content;
  const [yes, setYes] = useState(false);
  const [no, setNo] = useState(false);

  useEffect(() => {
    if (!no) return;
    const onKey = (e) => e.key === 'Escape' && setNo(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [no]);

  const refuse = () => {
    beep('whistle');
    fx('rain', '💛');
    setNo(true);
  };
  const accept = (txt) => {
    setYes(true);
    beep('win');
    fx('confetti');
    setTimeout(() => fx('confetti'), 1200);
    window.open(waLink(site.whatsapp, `${txt}! 💛🌊 Que comece o próximo capítulo.`), '_blank', 'noopener');
  };

  return (
    <Section id="match" kicker="Para você" title="A última página" className="final">
      <div className="scoreboard-final" aria-hidden="true">
        <span>NÓS</span>
        <span className="blink">∞ × 0</span>
        <span>O MUNDO</span>
      </div>
      <article className="final-letter">
        {matchPoint.carta.split('\n\n').map((p, i) => (
          <p key={i} className="handwritten">
            {p}
          </p>
        ))}
      </article>

      <h3 className="question">{matchPoint.pergunta}</h3>
      {yes ? (
        <p className="feedback">É isso. O mar sabia. 💛🌊</p>
      ) : (
        <div className="answers">
          <button className="btn" onClick={() => accept('Sim')}>
            Sim
          </button>
          <button className="btn hot" onClick={() => accept('Com certeza')}>
            Com certeza
          </button>
          <button
            className="btn ghost"
            onClick={refuse}
          >
            Não
          </button>
        </div>
      )}
      {no && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="no-title" onClick={() => setNo(false)}>
          <article className="no-card" onClick={(e) => e.stopPropagation()}>
            <span className="no-ico" aria-hidden="true">
              💛
            </span>
            <h3 id="no-title">Foda-se, vai continuar sim</h3>
            <button className="btn" autoFocus onClick={() => setNo(false)}>
              Tá bom, eu continuo 😌
            </button>
          </article>
        </div>
      )}
    </Section>
  );
}
