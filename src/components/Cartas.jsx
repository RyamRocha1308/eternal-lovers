import { useState } from 'react';
import { Section } from './ui.jsx';
import { useLocalStorage, toast, beep, fmtData } from '../lib.js';

export default function Cartas({ content }) {
  const [open, setOpen] = useState(null);
  const [read, setRead] = useLocalStorage('cartas', []);
  const now = new Date();

  const pick = (c) => {
    if (c.liberaEm && new Date(c.liberaEm) > now) {
      beep('fail');
      toast(`🔒 Essa carta só abre em ${fmtData(c.liberaEm)}`);
      return;
    }
    beep('hit');
    setOpen(c);
    setRead((r) => (r.includes(c.id) ? r : [...r, c.id]));
  };

  return (
    <Section id="cartas" kicker="Mensagem à sereia" title="Cartas">
      <div className="bottles">
        {content.cartas.map((c, i) => {
          const locked = c.liberaEm && new Date(c.liberaEm) > now;
          return (
            <button key={c.id} data-tip={locked ? `Abre em ${fmtData(c.liberaEm)}` : undefined} className={'bottle' + (read.includes(c.id) ? ' read' : '')} style={{ animationDelay: i * 0.4 + 's' }} onClick={() => pick(c)}>
              <span className="bottle-ico">{locked ? '🔒' : '💌'}</span>
              <span>{c.titulo}</span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={open.titulo} onClick={() => setOpen(null)}>
          <article className="scroll-letter" onClick={(e) => e.stopPropagation()}>
            <h3>{open.titulo}</h3>
            <p className="handwritten">{open.texto}</p>
            {open.audio && <audio controls src={open.audio} />}
            <button className="btn" onClick={() => setOpen(null)}>
              Guardar a carta
            </button>
          </article>
        </div>
      )}
    </Section>
  );
}
