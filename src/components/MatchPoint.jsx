import { useEffect, useState } from 'react';
import { Section } from './ui.jsx';
import { fx, beep } from '../lib.js';

export default function MatchPoint({ content }) {
  const { matchPoint } = content;
  const [yes, setYes] = useState(false);
  const [no, setNo] = useState(false);
  const [yesModal, setYesModal] = useState(false);

  useEffect(() => {
    if (!no && !yesModal) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setNo(false);
      setYesModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [no, yesModal]);

  const refuse = () => {
    beep('whistle');
    fx('rain', '💛');
    setNo(true);
  };
  const accept = () => {
    setYes(true);
    setYesModal(true);
    beep('win');
    fx('confetti');
    setTimeout(() => fx('confetti'), 1200);
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
          <button className="btn" onClick={() => accept()}>
            Sim
          </button>
          <button className="btn hot" onClick={() => accept()}>
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
      {yesModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="yes-title" onClick={() => setYesModal(false)}>
          <article className="no-card" onClick={(e) => e.stopPropagation()}>
            <span className="no-ico" aria-hidden="true">
              🎉
            </span>
            <h3 id="yes-title">Uhuuuuu</h3>
            <button className="btn" autoFocus onClick={() => setYesModal(false)}>
              💛
            </button>
          </article>
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
